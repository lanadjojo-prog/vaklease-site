const express = require('express');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

const app = express();
const PORT = process.env.PORT || 10000;
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 180 }));

const publicApplicationLimiter = rateLimit({ windowMs: 60 * 1000, max: 15 });

function setPublicCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = new Set([
    'https://vaklease.nl',
    'https://www.vaklease.nl',
    'https://vaklease-site.onrender.com',
    'http://localhost:3000'
  ]);
  if (allowed.has(origin)) res.set('Access-Control-Allow-Origin', origin);
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

app.options('/api/public-applications', (req, res) => {
  setPublicCors(req, res);
  res.sendStatus(204);
});

app.post('/api/public-applications', publicApplicationLimiter, async (req, res, next) => {
  setPublicCors(req, res);
  const a = req.body || {};
  const email = String(a.email || '').trim();
  const phone = String(a.phone || '').trim();
  const consent = Boolean(a.consent);

  if (!consent) return res.status(400).json({ error: 'Toestemming is vereist.' });
  if (!email && !phone) return res.status(400).json({ error: 'Vul een e-mailadres of telefoonnummer in.' });

  const request = {
    category: String(a.category || '').slice(0, 80),
    product_url: String(a.product_url || '').slice(0, 1000),
    purchase_price: String(a.purchase_price || '').slice(0, 80),
    object_description: String(a.object_description || '').slice(0, 1000),
    source: String(a.source || 'website').slice(0, 80)
  };

  try {
    const result = await dbQuery(
      `INSERT INTO lease_applications (applicant_name, company_name, email, phone, kvk, vehicle_request, status, consent_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,'new',NOW()) RETURNING id, created_at`,
      [
        String(a.applicant_name || '').trim().slice(0, 160) || null,
        String(a.company_name || '').trim().slice(0, 200) || null,
        email.slice(0, 240) || null,
        phone.slice(0, 80) || null,
        String(a.kvk || '').trim().slice(0, 40) || null,
        JSON.stringify(request)
      ]
    );
    res.status(201).json({ ok: true, application: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

function configured(name) {
  return Boolean(process.env[name] && String(process.env[name]).trim());
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function auth(req, res, next) {
  if (req.path === '/api/health' || req.path === '/api/public-applications' || req.path === '/api/internal/lead-machine-run') return next();

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    return res.status(503).json({ error: 'Admin login is nog niet geconfigureerd op Render.' });
  }

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="VakLease Partner Inbox"');
    return res.status(401).send('Login vereist');
  }

  let decoded = '';
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return res.status(401).send('Ongeldige login');
  }

  const separator = decoded.indexOf(':');
  const suppliedUser = separator >= 0 ? decoded.slice(0, separator) : decoded;
  const suppliedPass = separator >= 0 ? decoded.slice(separator + 1) : '';

  if (!safeEqual(suppliedUser, user) || !safeEqual(suppliedPass, pass)) {
    res.set('WWW-Authenticate', 'Basic realm="VakLease Partner Inbox"');
    return res.status(401).send('Ongeldige login');
  }
  next();
}

app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));

const hasDatabase = configured('DATABASE_URL');
const hasSupabase = configured('SUPABASE_URL') && configured('SUPABASE_PUBLISHABLE_KEY') && configured('CRM_API_KEY');

const pool = hasDatabase ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
}) : null;

const supabase = {
  url: String(process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  key: String(process.env.SUPABASE_PUBLISHABLE_KEY || ''),
  crmKey: String(process.env.CRM_API_KEY || '')
};

function databaseConfigured() {
  return Boolean(pool || hasSupabase);
}

async function supabaseRest(resource, options = {}) {
  if (!hasSupabase) {
    const err = new Error('Database is nog niet gekoppeld.');
    err.status = 503;
    throw err;
  }
  const response = await fetch(`${supabase.url}/rest/v1/${resource}`, {
    method: options.method || 'GET',
    headers: {
      apikey: supabase.key,
      Authorization: `Bearer ${supabase.key}`,
      'x-app-api-key': supabase.crmKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
      ...(options.headers || {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const err = new Error(data?.message || data?.error || `Database API error (${response.status})`);
    err.status = response.status >= 400 && response.status < 500 ? response.status : 502;
    throw err;
  }
  return data;
}

async function restInsert(table, row, { upsert = false, conflict = '' } = {}) {
  const suffix = conflict ? `?on_conflict=${encodeURIComponent(conflict)}` : '';
  const data = await supabaseRest(table + suffix, {
    method: 'POST',
    prefer: upsert ? 'resolution=merge-duplicates,return=representation' : 'return=representation',
    body: row
  });
  return Array.isArray(data) ? data[0] : data;
}

async function restPatch(table, id, patch) {
  const data = await supabaseRest(`${table}?id=eq.${encodeURIComponent(id)}&select=*`, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: patch
  });
  return Array.isArray(data) ? data[0] : data;
}

async function initDatabase() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partners (
      id BIGSERIAL PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      partner_url TEXT,
      status TEXT NOT NULL DEFAULT 'prospect',
      notes TEXT,
      last_contacted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS templates (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_log (
      id BIGSERIAL PRIMARY KEY,
      direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
      partner_id BIGINT REFERENCES partners(id) ON DELETE SET NULL,
      message_id TEXT,
      from_email TEXT,
      to_email TEXT,
      subject TEXT,
      body_preview TEXT,
      body TEXT,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE email_log ADD COLUMN IF NOT EXISTS body TEXT;

    CREATE TABLE IF NOT EXISTS lease_applications (
      id BIGSERIAL PRIMARY KEY,
      applicant_name TEXT,
      company_name TEXT,
      email TEXT,
      phone TEXT,
      kvk TEXT,
      vehicle_request JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'new',
      consent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE lease_applications
      ADD COLUMN IF NOT EXISTS lead_source TEXT NOT NULL DEFAULT 'website',
      ADD COLUMN IF NOT EXISTS lead_source_detail TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS assigned_partner_id BIGINT REFERENCES partners(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS expected_commission NUMERIC(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS earned_commission NUMERIC(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS commission_status TEXT NOT NULL DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS next_followup_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS lost_reason TEXT;

    CREATE TABLE IF NOT EXISTS application_handoffs (
      id BIGSERIAL PRIMARY KEY,
      application_id BIGINT NOT NULL REFERENCES lease_applications(id) ON DELETE CASCADE,
      partner_id BIGINT NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
      status TEXT NOT NULL DEFAULT 'prepared',
      external_reference TEXT,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      sent_at TIMESTAMPTZ,
      response_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lead_prospects (
      id BIGSERIAL PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      website TEXT,
      category TEXT,
      city TEXT,
      source TEXT,
      source_url TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT,
      last_contacted_at TIMESTAMPTZ,
      next_followup_at TIMESTAMPTZ,
      linked_application_id BIGINT REFERENCES lease_applications(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    INSERT INTO templates (name, subject, body)
    VALUES (
      'Eerste contact leasepartner',
      'Samenwerken met VakLease',
      'Hi {{contact_name}},\n\nIk neem contact op namens VakLease. Wij bouwen een platform voor ondernemers en vakbedrijven die een bedrijfswagen willen leasen en willen graag onderzoeken of we passende leaseaanvragen aan jullie kunnen doorzetten.\n\nIk hoor graag hoe jullie partnerprogramma werkt, welke acceptatievoorwaarden gelden en hoe aanvragen het liefst worden aangeleverd.\n\nMet vriendelijke groet,\nVakLease'
    )
    ON CONFLICT (name) DO NOTHING;
  `);
}

async function dbQuery(text, params = []) {
  if (pool) return pool.query(text, params);
  if (!hasSupabase) {
    const err = new Error('Database is nog niet gekoppeld.');
    err.status = 503;
    throw err;
  }

  const q = String(text).replace(/\s+/g, ' ').trim();

  if (q.startsWith('SELECT id, message_id, from_email, to_email, subject, body_preview, occurred_at FROM email_log')) {
    const rows = await supabaseRest('email_log?select=id,message_id,from_email,to_email,subject,body_preview,occurred_at&direction=eq.outbound&order=occurred_at.desc&limit=100');
    return { rows: rows || [] };
  }
  if (q.startsWith('SELECT id, message_id, from_email, to_email, subject, body_preview, body, occurred_at FROM email_log')) {
    const rows = await supabaseRest(`email_log?select=id,message_id,from_email,to_email,subject,body_preview,body,occurred_at&id=eq.${encodeURIComponent(params[0])}&direction=eq.outbound&limit=1`);
    return { rows: rows || [] };
  }
  if (q.startsWith('INSERT INTO email_log')) {
    const row = await restInsert('email_log', {
      direction: 'outbound',
      partner_id: params[0] || null,
      message_id: params[1] || null,
      from_email: params[2] || null,
      to_email: params[3] || null,
      subject: params[4] || null,
      body_preview: params[5] || null,
      body: params[6] || null
    });
    return { rows: row ? [row] : [] };
  }
  if (q.startsWith('UPDATE partners SET last_contacted_at = NOW()')) {
    const row = await restPatch('partners', params[0], { last_contacted_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return { rows: row ? [row] : [] };
  }
  if (q === 'SELECT * FROM partners ORDER BY created_at DESC') {
    const rows = await supabaseRest('partners?select=*&order=created_at.desc');
    return { rows: rows || [] };
  }
  if (q.startsWith('INSERT INTO partners')) {
    const row = await restInsert('partners', {
      company_name: params[0],
      contact_name: params[1],
      email: params[2],
      phone: params[3],
      website: params[4],
      partner_url: params[5],
      status: params[6],
      notes: params[7]
    });
    return { rows: row ? [row] : [] };
  }
  if (q.startsWith('UPDATE partners SET ')) {
    const section = q.split('UPDATE partners SET ')[1].split(', updated_at = NOW() WHERE')[0];
    const fields = section.split(',').map(x => x.trim().split('=')[0].trim());
    const patch = Object.fromEntries(fields.map((field, i) => [field, params[i]]));
    patch.updated_at = new Date().toISOString();
    const row = await restPatch('partners', params[params.length - 1], patch);
    return { rows: row ? [row] : [] };
  }
  if (q === 'SELECT * FROM templates ORDER BY name') {
    const rows = await supabaseRest('templates?select=*&order=name.asc');
    return { rows: rows || [] };
  }
  if (q.startsWith('INSERT INTO templates')) {
    const row = await restInsert('templates', {
      name: params[0],
      subject: params[1],
      body: params[2],
      updated_at: new Date().toISOString()
    }, { upsert: true, conflict: 'name' });
    return { rows: row ? [row] : [] };
  }
  if (q === 'SELECT * FROM lease_applications ORDER BY created_at DESC LIMIT 100') {
    const rows = await supabaseRest('lease_applications?select=*&order=created_at.desc&limit=100');
    return { rows: rows || [] };
  }
  if (q.startsWith('INSERT INTO lease_applications')) {
    const request = typeof params[5] === 'string' ? JSON.parse(params[5] || '{}') : (params[5] || {});
    const isPublic = params.length === 6;
    const row = await restInsert('lease_applications', {
      applicant_name: params[0],
      company_name: params[1],
      email: params[2],
      phone: params[3],
      kvk: params[4],
      vehicle_request: request,
      status: isPublic ? 'new' : (params[6] || 'new'),
      consent_at: isPublic ? new Date().toISOString() : (params[7] || null),
      lead_source: request.source || (isPublic ? 'website' : 'manual')
    });
    return { rows: row ? [row] : [] };
  }

  const err = new Error('Deze databasebewerking wordt nog niet ondersteund.');
  err.status = 500;
  throw err;
}

const leadMachineConfig = {
  discoveryUrl: process.env.DISCOVERY_BRIDGE_URL || '',
  discoveryToken: process.env.DISCOVERY_BRIDGE_TOKEN || '',
  jobToken: process.env.LEAD_MACHINE_JOB_TOKEN || '',
  enabled: String(process.env.LEAD_MACHINE_ENABLED || 'true').toLowerCase() !== 'false'
};

const LEAD_MACHINE_TARGETS = [
  { category: 'Bouw & aannemers', queries: ['aannemer', 'bouwbedrijf', 'renovatiebedrijf', 'timmerbedrijf', 'dakdekker'] },
  { category: 'Installatie & techniek', queries: ['installatiebedrijf', 'elektricien', 'loodgieter', 'warmtepomp installateur', 'airco installateur'] },
  { category: 'Grondverzet & infra', queries: ['grondverzetbedrijf', 'loonbedrijf', 'stratenmaker', 'infrabedrijf', 'sloopbedrijf'] },
  { category: 'Groen & buitenwerk', queries: ['hovenier', 'boomverzorger', 'bestratingsbedrijf', 'groenvoorziening bedrijf'] },
  { category: 'Onderhoud & facilitair', queries: ['schildersbedrijf', 'schoonmaakbedrijf', 'glazenwasser bedrijf', 'ongediertebestrijding'] },
  { category: 'Transport & service', queries: ['koeriersbedrijf', 'transportbedrijf', 'servicebedrijf buitendienst', 'montagebedrijf'] }
];

const LEASE_SIGNAL_WEIGHTS = [
  ['graafmachine', 22], ['minigraver', 22], ['shovel', 22], ['hoogwerker', 18],
  ['grondverzet', 20], ['machinepark', 18], ['materieel', 15], ['loonwerk', 18],
  ['aanhanger', 15], ['kippers', 14], ['tractor', 16], ['bestelbus', 16],
  ['bedrijfswagen', 16], ['wagenpark', 18], ['servicebus', 15], ['montagebus', 15],
  ['projecten', 6], ['vacature', 6], ['vacatures', 6], ['medewerkers', 5], ['team', 4],
  ['uitbreiding', 8], ['groei', 6], ['nieuw materieel', 16], ['nieuw wagenpark', 18]
];

let leadMachineRunning = false;

function machineReady() {
  return Boolean(leadMachineConfig.enabled && leadMachineConfig.discoveryUrl && leadMachineConfig.discoveryToken && hasSupabase);
}

function normalizeDomain(url) {
  try {
    const u = new URL(String(url || '').startsWith('http') ? String(url) : 'https://' + String(url || ''));
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch { return ''; }
}

function stripWebText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractEmails(html) {
  const emails = [...new Set((String(html || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).map(x => x.toLowerCase()))];
  return emails.filter(e => !/(example\.|sentry\.|wixpress\.|noreply|no-reply|wordpress|cloudflare)/i.test(e));
}

function chooseEmail(emails, domain) {
  const own = emails.filter(e => !domain || e.endsWith('@' + domain));
  const candidates = own.length ? own : emails;
  const rank = e => {
    if (/^(info|contact|office|administratie|sales|verkoop)@/.test(e)) return 0;
    if (/^(planning|service|werkplaats)@/.test(e)) return 1;
    return 2;
  };
  return [...candidates].sort((a,b) => rank(a)-rank(b))[0] || null;
}

function relevantInternalLinks(html, baseUrl) {
  const links = [];
  const re = /href=["']([^"'#]+)["']/gi;
  let m;
  while ((m = re.exec(String(html || ''))) && links.length < 12) {
    try {
      const u = new URL(m[1], baseUrl);
      if (normalizeDomain(u.href) !== normalizeDomain(baseUrl)) continue;
      if (!/(contact|over-ons|over|team|diensten|project|materieel|machine|wagenpark|vacature|werken-bij)/i.test(u.pathname)) continue;
      if (!links.includes(u.href)) links.push(u.href);
    } catch {}
  }
  return links.slice(0, 4);
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(9000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VakLeaseLeadResearch/1.0; +https://vaklease.nl/)' }
    });
    if (!res.ok || !String(res.headers.get('content-type') || '').includes('text/html')) return null;
    const html = await res.text();
    return { url: res.url || url, html: html.slice(0, 600000), text: stripWebText(html).slice(0, 50000) };
  } catch { return null; }
}

async function researchCompany(website) {
  const first = await fetchPage(website);
  if (!first) return { text: '', email: null, emailSourceUrl: null, pages: 0 };
  const pages = [first];
  for (const link of relevantInternalLinks(first.html, first.url)) {
    const page = await fetchPage(link);
    if (page) pages.push(page);
    if (pages.length >= 4) break;
  }
  const domain = normalizeDomain(first.url);
  const allEmails = [];
  let emailSourceUrl = null;
  for (const page of pages) {
    const found = extractEmails(page.html);
    if (found.length && !emailSourceUrl) emailSourceUrl = page.url;
    allEmails.push(...found);
  }
  return {
    text: pages.map(p => p.text).join(' ').slice(0, 120000),
    email: chooseEmail([...new Set(allEmails)], domain),
    emailSourceUrl,
    pages: pages.length
  };
}

function scoreLeaseProspect(category, text) {
  const hay = String(text || '').toLowerCase();
  let score = ({
    'Grondverzet & infra': 52,
    'Bouw & aannemers': 40,
    'Installatie & techniek': 38,
    'Groen & buitenwerk': 36,
    'Transport & service': 38,
    'Onderhoud & facilitair': 32
  })[category] || 28;
  const reasons = [`Branchefit: ${category}`];
  const strongAssetTerms = new Set([
    'graafmachine','minigraver','shovel','hoogwerker','grondverzet','machinepark','materieel',
    'loonwerk','aanhanger','kippers','tractor','bestelbus','bedrijfswagen','wagenpark','servicebus','montagebus'
  ]);
  let strongAssetSignal = category === 'Grondverzet & infra';
  for (const [term, points] of LEASE_SIGNAL_WEIGHTS) {
    if (hay.includes(term)) {
      score += points;
      if (strongAssetTerms.has(term)) strongAssetSignal = true;
      reasons.push(`+${points} signaal: ${term}`);
    }
  }
  if (!strongAssetSignal) {
    score = Math.min(score, 54);
    reasons.push('Score begrensd: nog geen expliciet voertuig/materieel-signaal');
  }
  score = Math.max(0, Math.min(100, score));
  return { score, reason: reasons.slice(0, 9).join(' · '), strongAssetSignal };
}

function buildLeaseOutreach(company, category) {
  const subject = `Zakelijke lease voor ${company}`;
  const body = `Hi,\n\nIk kwam ${company} tegen tijdens mijn zoektocht naar ondernemers in ${category.toLowerCase()} die werken met bedrijfswagens, aanhangers of machines.\n\nMet VakLease helpen we ondernemers die al een voertuig of bedrijfsmiddel op het oog hebben om de financieringsmogelijkheden te laten beoordelen. Je kunt simpelweg de advertentielink of gegevens van het object doorsturen; wij zetten de aanvraag vervolgens door naar een passende leasepartner.\n\nAls dit nu of binnenkort relevant is, stuur gerust de link van het object dat je wilt financieren.\n\nMet vriendelijke groet,\nGiovanni\nVakLease\nvaklease.nl`;
  return { subject, body };
}

async function autoSendPermissionedProspects(limit = 10) {
  if (!sendReady() || !hasSupabase) return 0;
  const rows = await supabaseRest(
    'lead_prospects?select=*&status=eq.ready_for_review&permission_status=in.(consented,existing_customer,inbound_request)&order=score.desc&limit=' + Math.max(1, Math.min(limit, 25))
  );
  let sent = 0;
  for (const prospect of rows || []) {
    if (!prospect.email || !prospect.outreach_subject || !prospect.outreach_body) continue;
    try {
      const info = await sendOutboundMail({
        to: prospect.email,
        subject: prospect.outreach_subject,
        body: prospect.outreach_body
      });
      await restInsert('email_log', {
        direction: 'outbound',
        partner_id: null,
        message_id: info.messageId || null,
        from_email: mailConfig.user || null,
        to_email: prospect.email,
        subject: prospect.outreach_subject,
        body_preview: String(prospect.outreach_body).slice(0, 500),
        body: prospect.outreach_body
      });
      await restPatch('lead_prospects', prospect.id, {
        status: 'contacted',
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      sent += 1;
    } catch (err) {
      await restPatch('lead_prospects', prospect.id, {
        status: 'send_failed',
        notes: 'Automatisch verzenden mislukt: ' + String(err.message || err).slice(0, 500),
        updated_at: new Date().toISOString()
      }).catch(() => {});
    }
  }
  return sent;
}

async function discoverBusinesses(query, region, limit) {
  const response = await fetch(leadMachineConfig.discoveryUrl, {
    method: 'POST',
    signal: AbortSignal.timeout(30000),
    headers: {
      'Content-Type': 'application/json',
      'X-Discovery-Bridge-Token': leadMachineConfig.discoveryToken
    },
    body: JSON.stringify({ query, region, limit })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.error || `Discovery service HTTP ${response.status}`);
  return Array.isArray(data.companies) ? data.companies : [];
}

function dailySearchPlan(settings) {
  const regions = Array.isArray(settings?.target_regions) && settings.target_regions.length
    ? settings.target_regions : ['Breda','Tilburg','Eindhoven','Den Bosch','Oosterhout','Roosendaal','Nederland'];
  const day = Math.floor(Date.now() / 86400000);
  const plan = [];
  const maxSteps = Math.max(60, LEAD_MACHINE_TARGETS.length * regions.length * 2);
  for (let step = 0; step < maxSteps; step++) {
    const target = LEAD_MACHINE_TARGETS[(day + step) % LEAD_MACHINE_TARGETS.length];
    const query = target.queries[(day * 3 + step) % target.queries.length];
    const region = regions[(day * 5 + step * 2) % regions.length];
    const key = `${target.category}|${query}|${region}`;
    if (!plan.some(x => x.key === key)) plan.push({ key, category: target.category, query, region });
  }
  return plan;
}

async function updateMachineRun(id, patch) {
  return restPatch('lead_machine_runs', id, patch);
}

async function runLeadMachine(mode = 'manual') {
  if (!machineReady()) throw new Error('Lead Machine is nog niet volledig geconfigureerd.');
  if (leadMachineRunning) return { ok: true, status: 'already_running' };
  leadMachineRunning = true;
  let run = null;
  const counters = {
    searches_completed: 0, companies_found: 0, websites_scanned: 0, contacts_found: 0,
    qualified: 0, queued_for_review: 0, auto_sent: 0, duplicates_skipped: 0, errors: 0
  };

  try {
    const settingsRows = await supabaseRest('lead_machine_settings?select=*&id=eq.1&limit=1');
    const settings = settingsRows?.[0] || {};
    const maxSearches = Math.max(1, Math.min(Number(settings.max_searches_per_run || 6), 20));
    const maxResults = Math.max(3, Math.min(Number(settings.max_results_per_search || 12), 25));
    const minScore = Math.max(30, Math.min(Number(settings.min_score || 55), 90));
    run = await restInsert('lead_machine_runs', {
      status: 'running', mode, searches_requested: maxSearches, last_message: 'Zoekronde gestart'
    });

    const existingRows = await supabaseRest('lead_prospects?select=id,company_name,website,email,status,permission_status&limit=5000');
    const seenDomains = new Set((existingRows || []).map(x => normalizeDomain(x.website)).filter(Boolean));
    const seenCompanies = new Set((existingRows || []).map(x => String(x.company_name || '').trim().toLowerCase()).filter(Boolean));
    const plan = dailySearchPlan(settings).slice(0, maxSearches);

    for (const item of plan) {
      let companies = [];
      try {
        companies = await discoverBusinesses(item.query, item.region, maxResults);
      } catch (err) {
        counters.errors += 1;
        await updateMachineRun(run.id, { ...counters, last_message: `Zoeken mislukt: ${item.query} / ${item.region}` });
        continue;
      }
      counters.searches_completed += 1;
      counters.companies_found += companies.length;

      for (const company of companies) {
        const domain = normalizeDomain(company.website);
        const companyKey = String(company.name || '').trim().toLowerCase();
        if (!domain || seenDomains.has(domain) || seenCompanies.has(companyKey)) {
          counters.duplicates_skipped += 1;
          continue;
        }
        seenDomains.add(domain);
        seenCompanies.add(companyKey);

        const research = await researchCompany(company.website);
        counters.websites_scanned += research.pages > 0 ? 1 : 0;
        if (research.email) counters.contacts_found += 1;

        const scored = scoreLeaseProspect(item.category, research.text);
        if (scored.score < Math.max(40, minScore - 12) && !research.email) continue;

        const draft = buildLeaseOutreach(company.name, item.category);
        const status = research.email && scored.score >= minScore ? 'ready_for_review' : (research.email ? 'research' : 'no_contact');
        if (status === 'ready_for_review') counters.queued_for_review += 1;
        if (scored.score >= minScore) counters.qualified += 1;

        await restInsert('lead_prospects', {
          company_name: String(company.name || domain).slice(0, 200),
          email: research.email,
          website: String(company.website || '').slice(0, 500),
          category: item.category,
          city: String(company.address || item.region || '').slice(0, 200),
          source: 'Google Places + website crawl',
          source_url: String(company.website || '').slice(0, 1000),
          status,
          score: scored.score,
          score_reason: scored.reason,
          email_source_url: research.emailSourceUrl,
          outreach_subject: draft.subject,
          outreach_body: draft.body,
          permission_status: 'unknown',
          discovered_at: new Date().toISOString(),
          last_scanned_at: new Date().toISOString(),
          machine_run_id: run.id,
          source_query: item.query,
          source_region: item.region,
          notes: research.email ? 'Contactadres automatisch gevonden op de bedrijfswebsite.' : 'Geen bruikbaar e-mailadres automatisch gevonden.'
        });
      }

      await updateMachineRun(run.id, { ...counters, last_message: `${item.category}: ${item.query} in ${item.region}` });
    }

    counters.auto_sent = await autoSendPermissionedProspects(Math.max(1, Math.min(10, counters.queued_for_review || 1)));
    const result = {
      status: 'completed',
      ...counters,
      last_message: `Klaar: ${counters.qualified} relevante prospects, ${counters.queued_for_review} met mailconcept klaar, ${counters.auto_sent} toegestaan automatisch verzonden.`,
      finished_at: new Date().toISOString()
    };
    await updateMachineRun(run.id, result);
    return { ok: true, run_id: run.id, ...result };
  } catch (err) {
    if (run?.id) {
      await updateMachineRun(run.id, {
        status: 'error',
        errors: counters.errors + 1,
        last_message: String(err.message || err).slice(0, 1000),
        finished_at: new Date().toISOString()
      }).catch(() => {});
    }
    throw err;
  } finally {
    leadMachineRunning = false;
  }
}

async function runLeadMachineIfDue() {
  if (!machineReady() || leadMachineRunning) return;
  try {
    const interrupted = await supabaseRest('lead_machine_runs?select=id&status=eq.running&order=started_at.desc&limit=10');
    for (const row of interrupted || []) {
      await restPatch('lead_machine_runs', row.id, {
        status: 'interrupted',
        last_message: 'Vorige run werd onderbroken door een herstart/deploy.',
        finished_at: new Date().toISOString()
      }).catch(() => {});
    }
    const settingsRows = await supabaseRest('lead_machine_settings?select=*&id=eq.1&limit=1');
    const settings = settingsRows?.[0];
    if (!settings?.enabled || !settings?.auto_run_on_start) return;
    const latest = await supabaseRest('lead_machine_runs?select=*&status=eq.completed&order=finished_at.desc&limit=1');
    const last = latest?.[0]?.finished_at ? new Date(latest[0].finished_at) : null;
    const due = !last || (Date.now() - last.getTime()) >= 6 * 60 * 60 * 1000;
    if (due) runLeadMachine('auto').catch(err => console.error('Lead Machine auto-run mislukt:', err));
  } catch (err) {
    console.error('Lead Machine due-check mislukt:', err);
  }
}

const mailConfig = {
  imapHost: process.env.MAIL_IMAP_HOST || 'imap.strato.de',
  imapPort: Number(process.env.MAIL_IMAP_PORT || 993),
  smtpHost: process.env.MAIL_SMTP_HOST || 'smtp.strato.de',
  smtpPort: Number(process.env.MAIL_SMTP_PORT || 465),
  user: process.env.MAIL_USER || '',
  password: process.env.MAIL_PASSWORD || '',
  fromName: process.env.MAIL_FROM_NAME || 'VakLease',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendReadApiKey: process.env.RESEND_READ_API_KEY || ''
};

function mailReady() {
  return Boolean(mailConfig.user && mailConfig.password);
}

function sendReady() {
  return Boolean(mailConfig.resendApiKey || (mailConfig.user && mailConfig.password));
}

function imapClient() {
  return new ImapFlow({
    host: mailConfig.imapHost,
    port: mailConfig.imapPort,
    secure: true,
    auth: { user: mailConfig.user, pass: mailConfig.password },
    logger: false
  });
}

function smtpTransport() {
  return nodemailer.createTransport({
    host: mailConfig.smtpHost,
    port: mailConfig.smtpPort,
    secure: mailConfig.smtpPort === 465,
    auth: { user: mailConfig.user, pass: mailConfig.password }
  });
}

async function sendOutboundMail({ to, subject, body }) {
  if (mailConfig.resendApiKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mailConfig.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${mailConfig.fromName} <${mailConfig.user}>`,
        to: [String(to).trim()],
        subject: String(subject).trim(),
        text: String(body)
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(data.message || `Resend API error (${response.status})`);
      err.status = 502;
      throw err;
    }

    return { messageId: data.id || null, provider: 'resend' };
  }

  const transporter = smtpTransport();
  const info = await transporter.sendMail({
    from: `"${mailConfig.fromName}" <${mailConfig.user}>`,
    to: String(to).trim(),
    subject: String(subject).trim(),
    text: String(body)
  });

  return { messageId: info.messageId || null, provider: 'smtp' };
}

async function resendRead(pathname) {
  const key = mailConfig.resendReadApiKey;
  if (!key) {
    const err = new Error('Verzonden mail kan nog niet worden gelezen. Resend-leestoegang ontbreekt.');
    err.status = 503;
    throw err;
  }

  const response = await fetch(`https://api.resend.com${pathname}`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message || `Resend API error (${response.status})`);
    err.status = response.status === 401 || response.status === 403 ? 503 : 502;
    throw err;
  }
  return data;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function addressText(list) {
  if (!Array.isArray(list)) return '';
  return list.map(x => x.name ? `${x.name} <${x.address}>` : x.address).filter(Boolean).join(', ');
}

app.get('/api/health', async (req, res) => {
  let db = false;
  if (pool) {
    try {
      await pool.query('SELECT 1');
      db = true;
    } catch {}
  } else if (hasSupabase) {
    try {
      await supabaseRest('partners?select=id&limit=1');
      db = true;
    } catch {}
  }
  res.json({
    ok: true,
    app: 'vaklease-partner-inbox',
    databaseConfigured: databaseConfigured(),
    databaseConnected: db,
    mailConfigured: mailReady(),
    sendConfigured: sendReady(),
    sendProvider: mailConfig.resendApiKey ? 'resend' : 'smtp',
    sentHistoryConfigured: Boolean(mailConfig.resendReadApiKey || pool),
    mailUser: mailConfig.user || null,
    leadMachineConfigured: machineReady(),
    leadMachineRunning
  });
});

app.get('/api/config', async (req, res) => {
  res.json({
    databaseConfigured: databaseConfigured(),
    mailConfigured: mailReady(),
    sendConfigured: sendReady(),
    sendProvider: mailConfig.resendApiKey ? 'resend' : 'smtp',
    sentHistoryConfigured: Boolean(mailConfig.resendReadApiKey || pool),
    mailbox: mailConfig.user || null,
    imapHost: mailConfig.imapHost,
    smtpHost: mailConfig.smtpHost
  });
});

app.get('/api/inbox', async (req, res, next) => {
  if (!mailReady()) return res.status(503).json({ error: 'VakLease-mailbox is nog niet ingesteld.' });
  const client = imapClient();
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const total = client.mailbox.exists || 0;
      if (!total) return res.json({ messages: [] });
      const start = Math.max(1, total - 39);
      const rows = await client.fetchAll(`${start}:*`, {
        uid: true,
        envelope: true,
        flags: true,
        internalDate: true,
        size: true
      });
      const messages = rows.reverse().map(row => ({
        uid: row.uid,
        subject: row.envelope?.subject || '(geen onderwerp)',
        from: addressText(row.envelope?.from),
        to: addressText(row.envelope?.to),
        date: row.internalDate || row.envelope?.date,
        seen: row.flags ? row.flags.has('\\Seen') : false,
        size: row.size || 0
      }));
      res.json({ messages });
    } finally {
      lock.release();
    }
  } catch (err) {
    next(err);
  } finally {
    try { await client.logout(); } catch {}
  }
});

app.get('/api/inbox/:uid', async (req, res, next) => {
  if (!mailReady()) return res.status(503).json({ error: 'VakLease-mailbox is nog niet ingesteld.' });
  const uid = Number(req.params.uid);
  if (!Number.isInteger(uid) || uid <= 0) return res.status(400).json({ error: 'Ongeldige UID.' });

  const client = imapClient();
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const row = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true });
      if (!row) return res.status(404).json({ error: 'Mail niet gevonden.' });
      const parsed = await simpleParser(row.source);
      res.json({
        uid,
        subject: parsed.subject || '(geen onderwerp)',
        from: parsed.from?.text || '',
        to: parsed.to?.text || '',
        date: parsed.date || null,
        text: parsed.text || '',
        htmlAvailable: Boolean(parsed.html)
      });
      await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
    } finally {
      lock.release();
    }
  } catch (err) {
    next(err);
  } finally {
    try { await client.logout(); } catch {}
  }
});

app.get('/api/sent', async (req, res, next) => {
  try {
    if (mailConfig.resendReadApiKey) {
      const data = await resendRead('/emails?limit=100');
      const accountEmails = Array.isArray(data.data) ? data.data : [];
      const mailbox = String(mailConfig.user || '').toLowerCase();
      const messages = accountEmails
        .filter(m => !mailbox || String(m.from || '').toLowerCase().includes(mailbox))
        .map(m => ({
          id: m.id,
          message_id: m.message_id || null,
          from_email: m.from || '',
          to_email: Array.isArray(m.to) ? m.to.join(', ') : (m.to || ''),
          subject: m.subject || '(geen onderwerp)',
          body_preview: m.last_event ? `Status: ${m.last_event}` : '',
          occurred_at: m.created_at || null,
          status: m.last_event || null,
          source: 'resend'
        }));
      return res.json({ messages, source: 'resend' });
    }

    const result = await dbQuery(
      `SELECT id, message_id, from_email, to_email, subject, body_preview, occurred_at
       FROM email_log
       WHERE direction = 'outbound'
       ORDER BY occurred_at DESC
       LIMIT 100`
    );
    res.json({ messages: result.rows, source: 'database' });
  } catch (err) { next(err); }
});

app.get('/api/sent/:id', async (req, res, next) => {
  try {
    if (mailConfig.resendReadApiKey) {
      const m = await resendRead('/emails/' + encodeURIComponent(req.params.id));
      const mailbox = String(mailConfig.user || '').toLowerCase();
      if (mailbox && !String(m.from || '').toLowerCase().includes(mailbox)) {
        return res.status(404).json({ error: 'Verzonden bericht niet gevonden.' });
      }
      return res.json({
        message: {
          id: m.id,
          message_id: m.message_id || null,
          from_email: m.from || '',
          to_email: Array.isArray(m.to) ? m.to.join(', ') : (m.to || ''),
          subject: m.subject || '(geen onderwerp)',
          body_preview: '',
          body: m.text || stripHtml(m.html || ''),
          occurred_at: m.created_at || null,
          status: m.last_event || null,
          source: 'resend'
        }
      });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Ongeldig bericht.' });
    const result = await dbQuery(
      `SELECT id, message_id, from_email, to_email, subject, body_preview, body, occurred_at
       FROM email_log
       WHERE id = $1 AND direction = 'outbound'`,
      [id]
    );
    const message = result.rows[0];
    if (!message) return res.status(404).json({ error: 'Verzonden bericht niet gevonden.' });
    res.json({ message });
  } catch (err) { next(err); }
});

app.post('/api/send', async (req, res, next) => {
  if (!sendReady()) return res.status(503).json({ error: 'Uitgaande mail is nog niet ingesteld.' });
  const { to, subject, body, partnerId } = req.body || {};
  if (!to || !subject || !body) return res.status(400).json({ error: 'Aan, onderwerp en bericht zijn verplicht.' });

  try {
    const info = await sendOutboundMail({ to, subject, body });

    if (databaseConfigured()) {
      await dbQuery(
        `INSERT INTO email_log (direction, partner_id, message_id, from_email, to_email, subject, body_preview, body)
         VALUES ('outbound', $1, $2, $3, $4, $5, $6, $7)`,
        [partnerId || null, info.messageId || null, mailConfig.user, String(to).trim(), String(subject).trim(), String(body).slice(0, 500), String(body)]
      );
      if (partnerId) {
        await dbQuery('UPDATE partners SET last_contacted_at = NOW(), updated_at = NOW() WHERE id = $1', [partnerId]);
      }
    }

    res.json({ ok: true, messageId: info.messageId || null, provider: info.provider || null });
  } catch (err) {
    next(err);
  }
});

app.get('/api/partners', async (req, res, next) => {
  try {
    const result = await dbQuery('SELECT * FROM partners ORDER BY created_at DESC');
    res.json({ partners: result.rows });
  } catch (err) { next(err); }
});

app.post('/api/partners', async (req, res, next) => {
  const p = req.body || {};
  if (!p.company_name) return res.status(400).json({ error: 'Bedrijfsnaam is verplicht.' });
  try {
    const result = await dbQuery(
      `INSERT INTO partners (company_name, contact_name, email, phone, website, partner_url, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [p.company_name, p.contact_name || null, p.email || null, p.phone || null, p.website || null, p.partner_url || null, p.status || 'prospect', p.notes || null]
    );
    res.status(201).json({ partner: result.rows[0] });
  } catch (err) { next(err); }
});

app.patch('/api/partners/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const allowed = ['company_name','contact_name','email','phone','website','partner_url','status','notes'];
  const entries = Object.entries(req.body || {}).filter(([key]) => allowed.includes(key));
  if (!entries.length) return res.status(400).json({ error: 'Geen geldige wijzigingen.' });

  const sets = entries.map(([key], i) => `${key} = $${i + 1}`);
  const values = entries.map(([, value]) => value === '' ? null : value);
  values.push(id);
  try {
    const result = await dbQuery(
      `UPDATE partners SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Partner niet gevonden.' });
    res.json({ partner: result.rows[0] });
  } catch (err) { next(err); }
});

app.get('/api/templates', async (req, res, next) => {
  try {
    const result = await dbQuery('SELECT * FROM templates ORDER BY name');
    res.json({ templates: result.rows });
  } catch (err) { next(err); }
});

app.post('/api/templates', async (req, res, next) => {
  const { name, subject, body } = req.body || {};
  if (!name || !subject || !body) return res.status(400).json({ error: 'Naam, onderwerp en bericht zijn verplicht.' });
  try {
    const result = await dbQuery(
      `INSERT INTO templates (name, subject, body) VALUES ($1,$2,$3)
       ON CONFLICT (name) DO UPDATE SET subject = EXCLUDED.subject, body = EXCLUDED.body, updated_at = NOW()
       RETURNING *`,
      [name, subject, body]
    );
    res.status(201).json({ template: result.rows[0] });
  } catch (err) { next(err); }
});

app.get('/api/applications', async (req, res, next) => {
  try {
    const result = await dbQuery('SELECT * FROM lease_applications ORDER BY created_at DESC LIMIT 100');
    res.json({ applications: result.rows });
  } catch (err) { next(err); }
});

app.post('/api/applications', async (req, res, next) => {
  const a = req.body || {};
  try {
    const result = await dbQuery(
      `INSERT INTO lease_applications (applicant_name, company_name, email, phone, kvk, vehicle_request, status, consent_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8) RETURNING *`,
      [
        a.applicant_name || null,
        a.company_name || null,
        a.email || null,
        a.phone || null,
        a.kvk || null,
        JSON.stringify(a.vehicle_request || {}),
        a.status || 'new',
        a.consent_at || null
      ]
    );
    res.status(201).json({ application: result.rows[0] });
  } catch (err) { next(err); }
});


app.get('/api/lead-machine/status', async (req, res, next) => {
  try {
    const [runs, settings, prospects] = await Promise.all([
      supabaseRest('lead_machine_runs?select=*&order=started_at.desc&limit=10'),
      supabaseRest('lead_machine_settings?select=*&id=eq.1&limit=1'),
      supabaseRest('lead_prospects?select=id,status,score,email,permission_status&order=created_at.desc&limit=2000')
    ]);
    const rows = prospects || [];
    res.json({
      configured: machineReady(),
      running: leadMachineRunning,
      settings: settings?.[0] || null,
      latest_run: runs?.[0] || null,
      recent_runs: runs || [],
      totals: {
        found: rows.length,
        qualified: rows.filter(x => Number(x.score || 0) >= Number(settings?.[0]?.min_score || 55)).length,
        ready_for_review: rows.filter(x => x.status === 'ready_for_review').length,
        contacted: rows.filter(x => x.status === 'contacted').length,
        replied: rows.filter(x => x.status === 'replied').length
      }
    });
  } catch (err) { next(err); }
});

app.post('/api/lead-machine/run', async (req, res, next) => {
  if (!machineReady()) return res.status(503).json({ error: 'Lead Machine is nog niet volledig geconfigureerd.' });
  if (leadMachineRunning) return res.status(202).json({ ok: true, status: 'already_running' });
  setImmediate(() => runLeadMachine('manual').catch(err => console.error('Lead Machine run mislukt:', err)));
  res.status(202).json({ ok: true, status: 'started' });
});

app.post('/api/internal/lead-machine-run', async (req, res, next) => {
  const token = String(req.headers['x-lead-machine-token'] || '');
  if (!leadMachineConfig.jobToken || !safeEqual(token, leadMachineConfig.jobToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!machineReady()) return res.status(503).json({ error: 'Lead Machine is nog niet volledig geconfigureerd.' });
  if (leadMachineRunning) return res.status(202).json({ ok: true, status: 'already_running' });
  setImmediate(() => runLeadMachine('scheduled').catch(err => console.error('Lead Machine scheduled run mislukt:', err)));
  res.status(202).json({ ok: true, status: 'started' });
});

app.get('/api/prospects', async (req, res, next) => {
  try {
    const rows = await supabaseRest('lead_prospects?select=*&order=created_at.desc&limit=500');
    res.json({ prospects: rows || [] });
  } catch (err) { next(err); }
});

app.post('/api/prospects', async (req, res, next) => {
  const p = req.body || {};
  if (!p.company_name) return res.status(400).json({ error: 'Bedrijfsnaam is verplicht.' });
  try {
    const prospect = await restInsert('lead_prospects', {
      company_name: String(p.company_name).trim().slice(0, 200),
      contact_name: String(p.contact_name || '').trim().slice(0, 160) || null,
      email: String(p.email || '').trim().slice(0, 240) || null,
      phone: String(p.phone || '').trim().slice(0, 80) || null,
      website: String(p.website || '').trim().slice(0, 500) || null,
      category: String(p.category || '').trim().slice(0, 100) || null,
      city: String(p.city || '').trim().slice(0, 120) || null,
      source: String(p.source || '').trim().slice(0, 120) || null,
      source_url: String(p.source_url || '').trim().slice(0, 1000) || null,
      status: p.status || 'new',
      notes: String(p.notes || '').slice(0, 3000) || null,
      next_followup_at: p.next_followup_at || null
    });
    res.status(201).json({ prospect });
  } catch (err) { next(err); }
});

app.patch('/api/prospects/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Ongeldige prospect.' });
  const allowed = ['company_name','contact_name','email','phone','website','category','city','source','source_url','status','notes','last_contacted_at','next_followup_at','linked_application_id'];
  const patch = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) patch[key] = req.body[key] === '' ? null : req.body[key];
  patch.updated_at = new Date().toISOString();
  try {
    const prospect = await restPatch('lead_prospects', id, patch);
    if (!prospect) return res.status(404).json({ error: 'Prospect niet gevonden.' });
    res.json({ prospect });
  } catch (err) { next(err); }
});

app.post('/api/prospects/:id/convert', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Ongeldige prospect.' });
  try {
    const prospects = await supabaseRest(`lead_prospects?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
    const p = prospects?.[0];
    if (!p) return res.status(404).json({ error: 'Prospect niet gevonden.' });
    if (p.linked_application_id) return res.json({ application_id: p.linked_application_id });

    const application = await restInsert('lease_applications', {
      applicant_name: p.contact_name || null,
      company_name: p.company_name,
      email: p.email || null,
      phone: p.phone || null,
      vehicle_request: { category: p.category || '', product_url: p.source_url || '', source: 'outreach' },
      status: 'qualified',
      lead_source: 'outreach',
      lead_source_detail: p.source || null,
      notes: p.notes || null
    });
    await restPatch('lead_prospects', id, {
      status: 'converted',
      linked_application_id: application.id,
      updated_at: new Date().toISOString()
    });
    res.status(201).json({ application });
  } catch (err) { next(err); }
});

app.patch('/api/applications/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Ongeldige lead.' });
  const allowed = ['applicant_name','company_name','email','phone','kvk','vehicle_request','status','lead_source','lead_source_detail','notes','assigned_partner_id','expected_commission','earned_commission','commission_status','next_followup_at','lost_reason'];
  const patch = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
      let value = req.body[key];
      if (value === '') value = null;
      if (['expected_commission','earned_commission'].includes(key)) value = value === null ? 0 : Number(value || 0);
      if (key === 'assigned_partner_id' && value !== null) value = Number(value);
      patch[key] = value;
    }
  }
  patch.updated_at = new Date().toISOString();
  try {
    const application = await restPatch('lease_applications', id, patch);
    if (!application) return res.status(404).json({ error: 'Lead niet gevonden.' });
    res.json({ application });
  } catch (err) { next(err); }
});

app.get('/api/quotes', async (req, res, next) => {
  try {
    const rows = await supabaseRest('quotes?select=*&order=created_at.desc&limit=200');
    res.json({ quotes: rows || [] });
  } catch (err) { next(err); }
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  let message = status === 500 ? 'Er ging iets mis.' : err.message;
  if (/auth|login|password|credentials/i.test(String(err.message || ''))) {
    message = 'Verbinding met de mailbox is mislukt. Controleer de mailinstellingen op Render.';
  }
  res.status(status).json({ error: message });
});

initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`VakLease Partner Inbox draait op poort ${PORT}`);
      setTimeout(() => runLeadMachineIfDue(), 12000);
      setInterval(() => runLeadMachineIfDue(), 60 * 60 * 1000);
    });
  })
  .catch(err => {
    console.error('Database initialisatie mislukt:', err);
    app.listen(PORT, '0.0.0.0', () => console.log(`VakLease Partner Inbox draait zonder database op poort ${PORT}`));
  });
