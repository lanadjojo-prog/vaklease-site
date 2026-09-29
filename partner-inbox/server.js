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
  if (req.path === '/api/health') return next();

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
const pool = hasDatabase ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
}) : null;

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
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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
  if (!pool) {
    const err = new Error('Database is nog niet gekoppeld.');
    err.status = 503;
    throw err;
  }
  return pool.query(text, params);
}

const mailConfig = {
  imapHost: process.env.MAIL_IMAP_HOST || 'imap.strato.de',
  imapPort: Number(process.env.MAIL_IMAP_PORT || 993),
  smtpHost: process.env.MAIL_SMTP_HOST || 'smtp.strato.de',
  smtpPort: Number(process.env.MAIL_SMTP_PORT || 465),
  user: process.env.MAIL_USER || '',
  password: process.env.MAIL_PASSWORD || '',
  fromName: process.env.MAIL_FROM_NAME || 'VakLease'
};

function mailReady() {
  return Boolean(mailConfig.user && mailConfig.password);
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
  }
  res.json({
    ok: true,
    app: 'vaklease-partner-inbox',
    databaseConfigured: hasDatabase,
    databaseConnected: db,
    mailConfigured: mailReady(),
    mailUser: mailConfig.user || null
  });
});

app.get('/api/config', async (req, res) => {
  res.json({
    databaseConfigured: hasDatabase,
    mailConfigured: mailReady(),
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

app.post('/api/send', async (req, res, next) => {
  if (!mailReady()) return res.status(503).json({ error: 'VakLease-mailbox is nog niet ingesteld.' });
  const { to, subject, body, partnerId } = req.body || {};
  if (!to || !subject || !body) return res.status(400).json({ error: 'Aan, onderwerp en bericht zijn verplicht.' });

  try {
    const transporter = smtpTransport();
    const info = await transporter.sendMail({
      from: `"${mailConfig.fromName}" <${mailConfig.user}>`,
      to: String(to).trim(),
      subject: String(subject).trim(),
      text: String(body)
    });

    if (pool) {
      await pool.query(
        `INSERT INTO email_log (direction, partner_id, message_id, from_email, to_email, subject, body_preview)
         VALUES ('outbound', $1, $2, $3, $4, $5, $6)`,
        [partnerId || null, info.messageId || null, mailConfig.user, String(to).trim(), String(subject).trim(), String(body).slice(0, 500)]
      );
      if (partnerId) {
        await pool.query('UPDATE partners SET last_contacted_at = NOW(), updated_at = NOW() WHERE id = $1', [partnerId]);
      }
    }

    res.json({ ok: true, messageId: info.messageId || null });
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
    app.listen(PORT, '0.0.0.0', () => console.log(`VakLease Partner Inbox draait op poort ${PORT}`));
  })
  .catch(err => {
    console.error('Database initialisatie mislukt:', err);
    app.listen(PORT, '0.0.0.0', () => console.log(`VakLease Partner Inbox draait zonder database op poort ${PORT}`));
  });
