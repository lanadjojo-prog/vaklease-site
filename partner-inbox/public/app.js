const state = { partners: [], templates: [], prospects: [], applications: [], quotes: [], machine: null, config: null };

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || 'Er ging iets mis.');
  return data;
}

function go(view) {
  $$('.nav').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $$('.view').forEach(v => v.classList.remove('active'));
  $('#view-' + view).classList.add('active');
  $('#pageTitle').textContent = {
    inbox:'Inbox', sent:'Verzonden', compose:'Nieuwe mail', partners:'Partners',
    templates:'Templates', outreach:'Lead Machine', applications:'Aanvragen', quotes:'Offertes'
  }[view] || 'VakLease';
  if (view === 'inbox') loadInbox();
  if (view === 'sent') loadSent();
  if (view === 'outreach') { loadLeadMachine(); loadProspects(); }
  if (view === 'applications') loadApplications();
  if (view === 'quotes') loadQuotes();
}

$$('.nav').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));
$('#quickCompose').addEventListener('click', () => go('compose'));
$('#refreshSent')?.addEventListener('click', loadSent);

async function loadConfig() {
  try {
    const health = await api('/api/health');
    state.config = health;
    $('#dbDot').classList.toggle('ok', health.databaseConnected);
    $('#dbDot').classList.toggle('bad', !health.databaseConnected);
    $('#dbStatus').textContent = health.databaseConnected ? 'Database verbonden' : 'Database niet verbonden';
    $('#mailDot').classList.toggle('ok', health.mailConfigured);
    $('#mailDot').classList.toggle('bad', !health.mailConfigured);
    $('#mailStatus').textContent = health.mailConfigured ? (health.mailUser || 'Mailbox verbonden') : 'Mailbox nog instellen';
  } catch (err) {
    $('#dbStatus').textContent = 'Status niet beschikbaar';
    $('#mailStatus').textContent = err.message;
  }
}

async function loadInbox() {
  const list = $('#messageList');
  const info = $('#inboxState');
  list.innerHTML = '';
  info.style.display = 'block';
  info.textContent = 'Inbox laden…';
  try {
    const data = await api('/api/inbox');
    const messages = data.messages || [];
    $('#mailBadge').textContent = messages.filter(m => !m.seen).length || '';
    if (!messages.length) {
      info.textContent = 'Geen berichten in de inbox.';
      return;
    }
    info.style.display = 'none';
    list.innerHTML = messages.map(m => `
      <button class="message-row ${m.seen ? '' : 'unread'}" data-uid="${m.uid}">
        <div class="msg-top"><span class="msg-from">${escapeHtml(m.from)}</span><span class="msg-date">${m.date ? new Date(m.date).toLocaleDateString('nl-NL') : ''}</span></div>
        <div class="msg-subject">${escapeHtml(m.subject)}</div>
      </button>
    `).join('');
    list.onclick = event => {
      const row = event.target.closest('[data-uid]');
      if (!row || !list.contains(row)) return;
      openMessage(row.dataset.uid);
    };
  } catch (err) {
    info.textContent = err.message;
  }
}

async function loadSent() {
  const list = $('#sentList');
  const info = $('#sentState');
  list.innerHTML = '';
  info.style.display = 'block';
  info.textContent = 'Verzonden berichten laden…';
  try {
    const data = await api('/api/sent');
    const messages = data.messages || [];
    if (!messages.length) {
      info.textContent = 'Nog geen verzonden berichten.';
      $('#sentPreview').innerHTML = '<div class="empty">Nog geen verzonden berichten.</div>';
      return;
    }
    info.style.display = 'none';
    list.innerHTML = messages.map(m => `
      <button class="message-row" data-sent-id="${m.id}">
        <div class="msg-top"><span class="msg-from">Aan: ${escapeHtml(m.to_email || '')}</span><span class="msg-date">${m.occurred_at ? new Date(m.occurred_at).toLocaleDateString('nl-NL') : ''}</span></div>
        <div class="msg-subject">${escapeHtml(m.subject || '(geen onderwerp)')}</div>
        <div class="msg-preview">${escapeHtml(m.body_preview || '')}</div>
      </button>
    `).join('');
    list.onclick = event => {
      const row = event.target.closest('[data-sent-id]');
      if (!row || !list.contains(row)) return;
      list.querySelectorAll('[data-sent-id]').forEach(item => item.classList.toggle('selected', item === row));
      openSent(row.dataset.sentId);
    };
  } catch (err) {
    info.textContent = err.message;
  }
}

async function openSent(id) {
  const pane = $('#sentPreview');
  pane.innerHTML = '<div class="empty">Bericht laden…</div>';
  try {
    const data = await api('/api/sent/' + id);
    const m = data.message;
    pane.innerHTML = `
      <div class="mail-head">
        <h2>${escapeHtml(m.subject || '(geen onderwerp)')}</h2>
        <div class="mail-meta">Van: ${escapeHtml(m.from_email || '')}<br>Aan: ${escapeHtml(m.to_email || '')}<br>${m.occurred_at ? escapeHtml(new Date(m.occurred_at).toLocaleString('nl-NL')) : ''}</div>
      </div>
      <div class="mail-body"></div>
    `;
    pane.querySelector('.mail-body').textContent = m.body || m.body_preview || '(geen inhoud beschikbaar)';
    if (window.matchMedia('(max-width: 980px)').matches) {
      setTimeout(() => pane.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    }
  } catch (err) {
    pane.innerHTML = '<div class="empty">' + escapeHtml(err.message) + '</div>';
  }
}

async function openMessage(uid) {
  const pane = $('#messagePreview');
  pane.innerHTML = '<div class="empty">Bericht laden…</div>';
  try {
    const m = await api('/api/inbox/' + uid);
    pane.innerHTML = `
      <div class="mail-head">
        <h2>${escapeHtml(m.subject)}</h2>
        <div class="mail-meta">Van: ${escapeHtml(m.from)}<br>Aan: ${escapeHtml(m.to)}<br>${m.date ? escapeHtml(new Date(m.date).toLocaleString('nl-NL')) : ''}</div>
      </div>
      <div class="mail-body"></div>
    `;
    pane.querySelector('.mail-body').textContent = m.text || '(geen platte tekst beschikbaar)';
  } catch (err) {
    pane.innerHTML = '<div class="empty">' + escapeHtml(err.message) + '</div>';
  }
}

$('#refreshInbox').addEventListener('click', loadInbox);

function statusLabel(status) {
  return {prospect:'Prospect',contacted:'Benaderd',interested:'Interesse',partner:'Partner',rejected:'Geen match'}[status] || status;
}

async function loadPartners() {
  const marker = $('#partnersState');
  try {
    const data = await api('/api/partners');
    state.partners = data.partners || [];
    marker.style.display = state.partners.length ? 'none' : 'block';
    marker.textContent = 'Nog geen partners toegevoegd.';
    const body = $('#partnersTable tbody');
    body.innerHTML = state.partners.map(p => `
      <tr>
        <td><span class="company">${escapeHtml(p.company_name)}</span><span class="sub">${escapeHtml(p.website || '')}</span></td>
        <td>${escapeHtml(p.contact_name || '—')}<span class="sub">${escapeHtml(p.email || '')}</span></td>
        <td><select class="status-select" data-partner-status="${p.id}">
          ${['prospect','contacted','interested','partner','rejected'].map(s => `<option value="${s}" ${s===p.status?'selected':''}>${statusLabel(s)}</option>`).join('')}
        </select></td>
        <td>${p.last_contacted_at ? new Date(p.last_contacted_at).toLocaleDateString('nl-NL') : '—'}</td>
        <td>${p.email ? `<button class="mail-action" data-mail-partner="${p.id}">Mail</button>` : ''}</td>
      </tr>
    `).join('');

    $$('[data-partner-status]').forEach(select => select.addEventListener('change', async () => {
      try {
        await api('/api/partners/' + select.dataset.partnerStatus, {method:'PATCH',body:JSON.stringify({status:select.value})});
        loadPartners();
      } catch (err) { alert(err.message); }
    }));
    $$('[data-mail-partner]').forEach(btn => btn.addEventListener('click', () => composeForPartner(btn.dataset.mailPartner)));
    renderStats();
  } catch (err) {
    marker.style.display = 'block';
    marker.textContent = err.message;
  }
}

function renderStats() {
  const count = s => state.partners.filter(p => p.status === s).length;
  $('#statProspects').textContent = count('prospect');
  $('#statContacted').textContent = count('contacted');
  $('#statInterested').textContent = count('interested');
  $('#statPartners').textContent = count('partner');
}

function composeForPartner(id) {
  const p = state.partners.find(x => String(x.id) === String(id));
  if (!p) return;
  $('#composeTo').value = p.email || '';
  $('#composePartnerId').value = p.id;
  $('#composeProspectId').value = '';
  go('compose');
}

$('#addPartner').addEventListener('click', () => $('#partnerDialog').showModal());
$('#partnerForm').addEventListener('submit', async e => {
  if (e.submitter?.value === 'cancel') return;
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  try {
    await api('/api/partners', {method:'POST',body:JSON.stringify(Object.fromEntries(form.entries()))});
    $('#partnerDialog').close();
    e.currentTarget.reset();
    loadPartners();
  } catch (err) { alert(err.message); }
});

async function loadTemplates() {
  const list = $('#templateList');
  try {
    const data = await api('/api/templates');
    state.templates = data.templates || [];
    list.innerHTML = state.templates.length ? state.templates.map(t => `
      <article class="template-card">
        <h3>${escapeHtml(t.name)}</h3>
        <div class="subject">${escapeHtml(t.subject)}</div>
        <p>${escapeHtml(t.body)}</p>
        <div class="template-actions"><button class="ghost" data-use-template="${t.id}">Gebruik</button></div>
      </article>
    `).join('') : '<div class="empty">Nog geen templates.</div>';

    $('#composeTemplate').innerHTML = '<option value="">Geen template</option>' +
      state.templates.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
    $$('[data-use-template]').forEach(btn => btn.addEventListener('click', () => useTemplate(btn.dataset.useTemplate)));
  } catch (err) {
    list.innerHTML = '<div class="empty">' + escapeHtml(err.message) + '</div>';
  }
}

function useTemplate(id) {
  const t = state.templates.find(x => String(x.id) === String(id));
  if (!t) return;
  $('#composeTemplate').value = t.id;
  $('#composeSubject').value = t.subject;
  $('#composeBody').value = t.body;
  go('compose');
}

$('#composeTemplate').addEventListener('change', e => {
  const t = state.templates.find(x => String(x.id) === String(e.target.value));
  if (t) {
    $('#composeSubject').value = t.subject;
    $('#composeBody').value = t.body;
  }
});

$('#composeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const status = $('#sendStatus');
  status.textContent = 'Versturen…';
  try {
    await api('/api/send', {method:'POST',body:JSON.stringify({
      to: $('#composeTo').value,
      subject: $('#composeSubject').value,
      body: $('#composeBody').value,
      partnerId: $('#composePartnerId').value || null
    })});
    const prospectId = $('#composeProspectId').value;
    if (prospectId) {
      await api('/api/prospects/' + prospectId, {
        method:'PATCH',
        body:JSON.stringify({status:'contacted', last_contacted_at:new Date().toISOString()})
      }).catch(() => {});
    }
    status.textContent = 'Verzonden';
    e.currentTarget.reset();
    $('#composePartnerId').value = '';
    $('#composeProspectId').value = '';
    setTimeout(() => { status.textContent = ''; go('sent'); }, 700);
    loadPartners();
    if (prospectId) loadProspects();
  } catch (err) {
    status.textContent = err.message;
  }
});

$('#addTemplate').addEventListener('click', () => $('#templateDialog').showModal());
$('#templateForm').addEventListener('submit', async e => {
  if (e.submitter?.value === 'cancel') return;
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  try {
    await api('/api/templates', {method:'POST',body:JSON.stringify(Object.fromEntries(form.entries()))});
    $('#templateDialog').close();
    e.currentTarget.reset();
    loadTemplates();
  } catch (err) { alert(err.message); }
});


const euro = new Intl.NumberFormat('nl-NL', { style:'currency', currency:'EUR', maximumFractionDigits:2 });

function prospectStatusLabel(status) {
  return {
    ready_for_review:'Mail klaar', research:'Verder onderzoeken', no_contact:'Geen e-mail',
    contacted:'Benaderd', replied:'Reactie', converted:'Aanvraag', send_failed:'Verzendfout'
  }[status] || status || 'Nieuw';
}

function prospectMatches(p) {
  const q = ($('#prospectSearch')?.value || '').trim().toLowerCase();
  const status = $('#prospectFilter')?.value || '';
  if (status && p.status !== status) return false;
  if (!q) return true;
  return [p.company_name,p.email,p.city,p.category,p.source_query,p.source_region].some(v => String(v || '').toLowerCase().includes(q));
}

async function loadLeadMachine() {
  try {
    const data = await api('/api/lead-machine/status');
    state.machine = data;
    renderLeadMachineStatus();
    if (data.running) scheduleMachinePoll();
  } catch (err) {
    $('#machineState').textContent = err.message;
    $('#machineDot')?.classList.add('bad');
  }
}

let machinePollTimer = null;
function scheduleMachinePoll() {
  clearTimeout(machinePollTimer);
  machinePollTimer = setTimeout(async () => {
    await Promise.allSettled([loadLeadMachine(), loadProspects()]);
  }, 4500);
}

function renderLeadMachineStatus() {
  const data = state.machine || {};
  const totals = data.totals || {};
  $('#machineStatFound').textContent = totals.found || 0;
  $('#machineStatQualified').textContent = totals.qualified || 0;
  $('#machineStatReady').textContent = totals.ready_for_review || 0;
  $('#machineStatContacted').textContent = totals.contacted || 0;
  $('#machineStatReplied').textContent = totals.replied || 0;
  const dot = $('#machineDot');
  if (dot) {
    dot.classList.toggle('ok', Boolean(data.configured && !data.running));
    dot.classList.toggle('working', Boolean(data.running));
    dot.classList.toggle('bad', !data.configured);
  }
  $('#machineState').textContent = !data.configured
    ? 'Niet volledig geconfigureerd'
    : data.running ? 'Zoekronde draait' : 'Automatisch zoeken actief';

  const autopilot = $('#autopilotToggle');
  if (autopilot) {
    autopilot.checked = Boolean(data.settings?.auto_send_enabled);
    autopilot.disabled = !data.configured;
  }
  const autoInfo = $('#autopilotInfo');
  if (autoInfo) {
    const max = Math.min(30, Number(data.settings?.daily_send_limit || 30));
    autoInfo.textContent = `${Number(data.auto_sent_last_24h || 0)}/${max} automatisch verzonden in 24u`;
  }
  const run = data.latest_run;
  const summary = $('#machineRunSummary');
  if (summary) {
    if (!run) summary.textContent = 'Nog geen zoekronde uitgevoerd.';
    else {
      const when = run.started_at ? new Date(run.started_at).toLocaleString('nl-NL') : '';
      summary.innerHTML = `<strong>Laatste run:</strong> ${escapeHtml(when)}
        · ${Number(run.searches_completed || 0)}/${Number(run.searches_requested || 0)} zoekopdrachten
        · ${Number(run.companies_found || 0)} bedrijven
        · ${Number(run.contacts_found || 0)} contactadressen
        · ${Number(run.qualified || 0)} relevant
        · <span class="${run.status === 'error' ? 'text-bad' : ''}">${escapeHtml(run.last_message || run.status || '')}</span>`;
    }
  }
  const btn = $('#runLeadMachine');
  if (btn) {
    btn.disabled = Boolean(data.running || !data.configured);
    btn.textContent = data.running ? 'Zoekronde draait…' : 'Nu zoekronde starten';
  }
}

async function startLeadMachine() {
  const btn = $('#runLeadMachine');
  if (btn) btn.disabled = true;
  try {
    await api('/api/lead-machine/run', {method:'POST',body:'{}'});
    await loadLeadMachine();
    scheduleMachinePoll();
  } catch (err) {
    alert(err.message);
    if (btn) btn.disabled = false;
  }
}

async function loadProspects() {
  const marker = $('#prospectsState');
  if (!marker) return;
  try {
    const data = await api('/api/prospects');
    state.prospects = data.prospects || [];
    renderProspects();
  } catch (err) {
    marker.style.display = 'block';
    marker.textContent = err.message;
  }
}

function renderProspects() {
  const marker = $('#prospectsState');
  const body = $('#prospectsTable tbody');
  if (!marker || !body) return;
  const rows = state.prospects.filter(prospectMatches);
  marker.style.display = rows.length ? 'none' : 'block';
  marker.textContent = state.prospects.length ? 'Geen prospects binnen dit filter.' : 'Nog geen bedrijven gevonden door de leadmachine.';
  body.innerHTML = rows.map(p => `
    <tr>
      <td><span class="score-badge score-${Number(p.score || 0) >= 70 ? 'high' : Number(p.score || 0) >= 55 ? 'mid' : 'low'}">${Number(p.score || 0)}</span></td>
      <td><span class="company">${escapeHtml(p.company_name)}</span><span class="sub">${escapeHtml(p.website || '')}</span></td>
      <td>${escapeHtml(p.category || '—')}<span class="sub">${escapeHtml(p.source_region || p.city || '')}</span></td>
      <td>${escapeHtml(p.email || 'Geen e-mail gevonden')}<span class="sub">${p.email ? 'automatisch gevonden' : 'website onderzocht'}</span></td>
      <td><span class="status-chip machine-${escapeHtml(p.status || 'new')}">${escapeHtml(prospectStatusLabel(p.status))}</span></td>
      <td><button class="ghost small" data-view-prospect="${p.id}">Bekijk</button></td>
    </tr>
  `).join('');
  $$('[data-view-prospect]').forEach(btn => btn.addEventListener('click', () => openProspectDetail(btn.dataset.viewProspect)));
}

async function saveProspectDraft(id, closeAfter = false) {
  const subject = $('#prospectSubject')?.value?.trim() || '';
  const body = $('#prospectBody')?.value?.trim() || '';
  const permission_status = $('#prospectPermission')?.value || 'unknown';
  if (!subject || !body) throw new Error('Onderwerp en mailtekst zijn verplicht.');
  const data = await api('/api/prospects/' + id, {
    method:'PATCH',
    body:JSON.stringify({outreach_subject:subject, outreach_body:body, permission_status})
  });
  const index = state.prospects.findIndex(x => String(x.id) === String(id));
  if (index >= 0 && data.prospect) state.prospects[index] = data.prospect;
  renderProspects();
  if (closeAfter) $('#prospectDetailDialog').close();
  return data.prospect;
}

async function sendProspectNow(id) {
  const subject = $('#prospectSubject')?.value?.trim() || '';
  const body = $('#prospectBody')?.value?.trim() || '';
  if (!subject || !body) return alert('Onderwerp en mailtekst zijn verplicht.');
  if (!confirm('Deze mail nu versturen naar deze prospect?')) return;
  const btn = $('#sendProspectMail');
  if (btn) { btn.disabled = true; btn.textContent = 'Verzenden…'; }
  try {
    await saveProspectDraft(id);
    await api('/api/prospects/' + id + '/send', {
      method:'POST',
      body:JSON.stringify({subject, body})
    });
    await Promise.allSettled([loadProspects(), loadLeadMachine()]);
    $('#prospectDetailDialog').close();
  } catch (err) {
    alert(err.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Verzenden'; }
  }
}

function openProspectDetail(id) {
  const p = state.prospects.find(x => String(x.id) === String(id));
  if (!p) return;
  $('#prospectDetailTitle').textContent = p.company_name || 'Prospect';
  const body = $('#prospectDetailBody');
  body.innerHTML = `
    <div class="detail-grid">
      <div><span>Score</span><strong>${Number(p.score || 0)}/100</strong></div>
      <div><span>Status</span><strong>${escapeHtml(prospectStatusLabel(p.status))}</strong></div>
      <div><span>Segment</span><strong>${escapeHtml(p.category || '—')}</strong></div>
      <div><span>Regio</span><strong>${escapeHtml(p.source_region || p.city || '—')}</strong></div>
    </div>
    <div class="detail-section"><h3>Waarom deze prospect?</h3><p>${escapeHtml(p.score_reason || 'Geen score-uitleg beschikbaar.')}</p></div>
    <div class="detail-section"><h3>Contact</h3><p>${escapeHtml(p.email || 'Geen bruikbaar e-mailadres gevonden.')}</p>
      ${p.email_source_url ? `<p class="sub">Bron: ${escapeHtml(p.email_source_url)}</p>` : ''}
    </div>
    <div class="detail-section">
      <h3>Contactgrond voor autopilot</h3>
      <select id="prospectPermission" class="detail-select">
        <option value="unknown" ${(p.permission_status || 'unknown') === 'unknown' ? 'selected' : ''}>Onbekend / koude prospect</option>
        <option value="consented" ${p.permission_status === 'consented' ? 'selected' : ''}>Toestemming</option>
        <option value="existing_customer" ${p.permission_status === 'existing_customer' ? 'selected' : ''}>Bestaande klant</option>
        <option value="inbound_request" ${p.permission_status === 'inbound_request' ? 'selected' : ''}>Inkomende aanvraag</option>
      </select>
      <p class="sub">Alleen de drie toegestane statussen hierboven worden door Autopilot automatisch verstuurd.</p>
    </div>
    <div class="detail-section"><h3>Mailconcept</h3>
      <label class="edit-mail-label">Onderwerp
        <input id="prospectSubject" class="edit-mail-input" value="${escapeHtml(p.outreach_subject || '')}">
      </label>
      <label class="edit-mail-label">Bericht
        <textarea id="prospectBody" class="edit-mail-textarea" rows="13">${escapeHtml(p.outreach_body || '')}</textarea>
      </label>
      <div class="mail-actions">
        <button class="ghost" id="saveProspectDraft">Opslaan</button>
        <button class="primary" id="sendProspectMail" ${p.email ? '' : 'disabled'}>Verzenden</button>
      </div>
    </div>
  `;
  $('#prospectDetailDialog').showModal();
  $('#saveProspectDraft')?.addEventListener('click', async () => {
    try {
      const btn = $('#saveProspectDraft');
      btn.disabled = true; btn.textContent = 'Opslaan…';
      await saveProspectDraft(id);
      btn.textContent = 'Opgeslagen';
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Opslaan'; }, 900);
    } catch (err) { alert(err.message); }
  });
  $('#sendProspectMail')?.addEventListener('click', () => sendProspectNow(id));
}

$('#runLeadMachine')?.addEventListener('click', startLeadMachine);
$('#refreshMachine')?.addEventListener('click', () => Promise.allSettled([loadLeadMachine(), loadProspects()]));
$('#prospectSearch')?.addEventListener('input', renderProspects);
$('#prospectFilter')?.addEventListener('change', renderProspects);
$('#closeProspectDetail')?.addEventListener('click', () => $('#prospectDetailDialog').close());
$('#autopilotToggle')?.addEventListener('change', async e => {
  const enabled = e.currentTarget.checked;
  try {
    await api('/api/lead-machine/settings', {
      method:'PATCH',
      body:JSON.stringify({auto_send_enabled: enabled, daily_send_limit:30})
    });
    await loadLeadMachine();
  } catch (err) {
    e.currentTarget.checked = !enabled;
    alert(err.message);
  }
});

function leadMatches(a) {
  const q = ($('#leadSearch')?.value || '').trim().toLowerCase();
  const status = $('#leadFilter')?.value || '';
  if (status && a.status !== status) return false;
  if (!q) return true;
  const vr = a.vehicle_request || {};
  return [a.applicant_name,a.company_name,a.email,a.phone,vr.category,vr.object_description,vr.product_url].some(v => String(v || '').toLowerCase().includes(q));
}

async function loadApplications() {
  const marker = $('#applicationsState');
  if (!marker) return;
  try {
    const data = await api('/api/applications');
    state.applications = data.applications || [];
    renderApplications();
  } catch (err) {
    marker.style.display = 'block';
    marker.textContent = err.message;
  }
}

function leadSourceLabel(a) {
  const detail = String(a.lead_source_detail || a.vehicle_request?.source || '').trim();
  if (detail === 'website-chat') return 'Website chat';
  if (detail.includes('homepage')) return 'Homepage';
  if (detail.includes('category-')) return 'Categoriepagina';
  if (detail.includes('contact')) return 'Contactpagina';
  return {
    website:'Website',
    outreach:'Outreach',
    referral:'Referral',
    partner:'Partner',
    manual:'Handmatig'
  }[a.lead_source] || detail || a.lead_source || 'Onbekend';
}

function renderLeadStats() {
  const apps = state.applications;
  const active = apps.filter(a => !['won','lost'].includes(a.status)).length;
  const won = apps.filter(a => a.status === 'won').length;
  const expected = apps.reduce((n,a) => n + Number(a.expected_commission || 0), 0);
  const earned = apps.reduce((n,a) => n + Number(a.earned_commission || 0), 0);
  $('#leadStatTotal').textContent = apps.length;
  $('#leadStatActive').textContent = active;
  $('#leadStatWon').textContent = won;
  $('#leadStatExpected').textContent = euro.format(expected);
  $('#leadStatEarned').textContent = euro.format(earned);
}

function renderApplications() {
  const marker = $('#applicationsState');
  const body = $('#applicationsTable tbody');
  if (!marker || !body) return;
  const rows = state.applications.filter(leadMatches);
  marker.style.display = rows.length ? 'none' : 'block';
  marker.textContent = state.applications.length ? 'Geen leads binnen dit filter.' : 'Nog geen leads.';
  body.innerHTML = rows.map(a => {
    const vr = a.vehicle_request || {};
    const partner = state.partners.find(p => String(p.id) === String(a.assigned_partner_id));
    const objectText = vr.category || vr.object_description || '—';
    const commission = Number(a.earned_commission || 0) > 0 ? euro.format(a.earned_commission) : euro.format(a.expected_commission || 0);
    return `
      <tr>
        <td><span class="company">${escapeHtml(a.company_name || a.applicant_name || 'Onbekend')}</span><span class="sub">${escapeHtml(a.applicant_name || a.email || '')}</span></td>
        <td><span class="source-chip">${escapeHtml(leadSourceLabel(a))}</span><span class="sub">${escapeHtml(a.lead_source_detail || '')}</span></td>
        <td>${escapeHtml(objectText)}${vr.purchase_price ? `<span class="sub">${escapeHtml(String(vr.purchase_price))}</span>` : ''}</td>
        <td><span class="status-chip status-${escapeHtml(a.status)}">${escapeHtml(leadStatusLabel(a.status))}</span></td>
        <td>${escapeHtml(partner?.company_name || '—')}</td>
        <td><strong>${escapeHtml(commission)}</strong><span class="sub">${Number(a.earned_commission || 0) > 0 ? 'verdiend' : 'verwacht'}</span></td>
        <td><span class="status-chip pay-${escapeHtml(a.commission_status || 'none')}">${escapeHtml(commissionStatusLabel(a.commission_status))}</span></td>
        <td><button class="ghost small" data-edit-lead="${a.id}">Open</button></td>
      </tr>
    `;
  }).join('');
  renderLeadStats();
  $$('[data-edit-lead]').forEach(btn => btn.addEventListener('click', () => openLeadDialog(btn.dataset.editLead)));
}

function refreshLeadPartnerOptions(selected = '') {
  const select = $('#leadPartnerSelect');
  if (!select) return;
  select.innerHTML = '<option value="">Nog niet gekoppeld</option>' + state.partners.map(p =>
    `<option value="${p.id}" ${String(selected)===String(p.id)?'selected':''}>${escapeHtml(p.company_name)}</option>`
  ).join('');
}

function openLeadDialog(id = '') {
  const form = $('#leadForm');
  form.reset();
  form.elements.id.value = '';
  $('#leadDialogTitle').textContent = id ? 'Lead bewerken' : 'Lead toevoegen';
  const a = state.applications.find(x => String(x.id) === String(id));
  refreshLeadPartnerOptions(a?.assigned_partner_id || '');
  if (a) {
    const vr = a.vehicle_request || {};
    form.elements.id.value = a.id;
    form.elements.applicant_name.value = a.applicant_name || '';
    form.elements.company_name.value = a.company_name || '';
    form.elements.email.value = a.email || '';
    form.elements.phone.value = a.phone || '';
    form.elements.kvk.value = a.kvk || '';
    form.elements.lead_source.value = a.lead_source || 'manual';
    form.elements.lead_source_detail.value = a.lead_source_detail || vr.source || '';
    form.elements.category.value = vr.category || '';
    form.elements.purchase_price.value = vr.purchase_price || '';
    form.elements.product_url.value = vr.product_url || '';
    form.elements.term_months.value=vr.term_months || '';
    form.elements.object_description.value=vr.object_description || '';
    form.elements.intake_notes.value=vr.notes || '';
    form.elements.status.value = a.status || 'new';
    form.elements.assigned_partner_id.value = a.assigned_partner_id || '';
    form.elements.expected_commission.value = a.expected_commission || 0;
    form.elements.earned_commission.value = a.earned_commission || 0;
    form.elements.commission_status.value = a.commission_status || 'none';
    form.elements.next_followup_at.value = toLocalInput(a.next_followup_at);
    form.elements.lost_reason.value = a.lost_reason || '';
    form.elements.notes.value = a.notes || '';
  } else {
    form.elements.lead_source.value = 'manual';
    form.elements.lead_source_detail.value = '';
    form.elements.status.value = 'new';
    form.elements.commission_status.value = 'none';
  }
  const vr=a?.vehicle_request || {};
  const checks=[['KVK',Boolean(a?.kvk)],['Contactgegevens',Boolean(a?.email && a?.phone)],['Looptijd',Boolean(vr.term_months)],['Object',Boolean(vr.product_url || vr.object_description || vr.quote)],['Offerte',Boolean(vr.quote)]];
  $('#leaseDossier').innerHTML=a ? `<h3>Dossier ${checks.filter(x=>x[1]).length}/5 compleet</h3><p>${checks.map(([k,v])=>`${v?'✓':'○'} ${k}`).join(' · ')}</p>${vr.quote?`<a href="/api/applications/${a.id}/quote">Offerte downloaden: ${escapeHtml(vr.quote.name)}</a>`:'<p>Offerte van leverancier nog niet ontvangen.</p>'}<label>Offerte toevoegen of vervangen (max. 3 MB)<input type="file" id="adminQuoteUpload" accept=".pdf,.jpg,.jpeg,.png"></label><p><button type="button" id="preparePartnerSend">Dossier naar partner voorbereiden</button></p>` : '';
  $('#adminQuoteUpload')?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>3*1024*1024)return alert('Maximaal 3 MB.');try{const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=reject;r.readAsDataURL(file);});await api('/api/applications/'+a.id+'/quote',{method:'POST',body:JSON.stringify({quote:{name:file.name,type:file.type,base64}})});await loadApplications();openLeadDialog(a.id);}catch(err){alert(err.message);}});
  $('#preparePartnerSend')?.addEventListener('click',()=>preparePartnerSend(a));
  $('#leadDialog').showModal();
}

$('#addLead')?.addEventListener('click', () => openLeadDialog());
$('#leadSearch')?.addEventListener('input', renderApplications);
$('#leadFilter')?.addEventListener('change', renderApplications);

$('#leadForm')?.addEventListener('submit', async e => {
  if (e.submitter?.value === 'cancel') return;
  e.preventDefault();
  const form = e.currentTarget;
  const v = Object.fromEntries(new FormData(form).entries());
  const existing = state.applications.find(x => String(x.id) === String(v.id));
  const vehicle_request = {
    ...(existing?.vehicle_request || {}),
    category: v.category || '',
    product_url: v.product_url || '',
    purchase_price: v.purchase_price || '',
    term_months: Number(v.term_months) || null,
    object_description: v.object_description || '',
    source: v.lead_source || 'manual'
  };
  const common = {
    applicant_name:v.applicant_name || null,
    company_name:v.company_name || null,
    email:v.email || null,
    phone:v.phone || null,
    kvk:v.kvk || null,
    vehicle_request,
    status:v.status || 'new'
  };
  const tracking = {
    lead_source:v.lead_source || 'manual',
    lead_source_detail:v.lead_source_detail || null,
    assigned_partner_id:v.assigned_partner_id || null,
    expected_commission:Number(String(v.expected_commission || '0').replace(',','.')) || 0,
    earned_commission:Number(String(v.earned_commission || '0').replace(',','.')) || 0,
    commission_status:v.commission_status || 'none',
    next_followup_at:v.next_followup_at ? new Date(v.next_followup_at).toISOString() : null,
    lost_reason:v.lost_reason || null,
    notes:v.notes || null,
    vehicle_request
  };
  try {
    let id = v.id;
    if (id) {
      await api('/api/applications/' + id, {method:'PATCH',body:JSON.stringify({...common,...tracking})});
    } else {
      const created = await api('/api/applications', {method:'POST',body:JSON.stringify(common)});
      id = created.application.id;
      await api('/api/applications/' + id, {method:'PATCH',body:JSON.stringify(tracking)});
    }
    $('#leadDialog').close();
    await loadApplications();
  } catch (err) { alert(err.message); }
});

async function loadQuotes() {
  try {
    const data = await api('/api/quotes');
    state.quotes = data.quotes || [];
  } catch {}
}

(async function init() {
  await loadConfig();
  await Promise.allSettled([loadPartners(), loadTemplates()]);
  await Promise.allSettled([loadLeadMachine(), loadProspects(), loadApplications(), loadQuotes()]);
  loadInbox();
})();
function preparePartnerSend(a) {
  const vr=a.vehicle_request || {};
  const partner=state.partners.find(p=>String(p.id)===String(a.assigned_partner_id));
  const f=$('#partnerSendForm');f.reset();f.querySelector('[type=submit]').disabled=false;f.elements.id.value=a.id;
  f.elements.to.value=partner?.email || 'info@tklease.nl';
  f.elements.subject.value='Leaseaanvraag – '+(a.company_name || a.applicant_name || a.id);
  f.elements.body.value=`Beste leasepartner,\n\nGraag ontvangen wij een beoordeling van onderstaande aanvraag.\n\nBedrijf: ${a.company_name || ''}\nContactpersoon: ${a.applicant_name || ''}\nKVK-nummer: ${a.kvk || ''}\nE-mailadres: ${a.email || ''}\nTelefoonnummer: ${a.phone || ''}\nCategorie: ${vr.category || ''}\nObject: ${vr.object_description || ''}\nObjectlink: ${vr.product_url || ''}\nAanschafprijs excl. btw: € ${vr.purchase_price || ''}\nGewenste looptijd: ${vr.term_months || ''} maanden\nToelichting: ${vr.notes || ''}\nOfferte: ${vr.quote?'bijgevoegd':'ontbreekt'}\n\nMet vriendelijke groet,\nVakLease`;
  $('#partnerSendStatus').textContent=vr.quote?'':'De offerte ontbreekt. Het dossier kan pas worden verstuurd als dit compleet is.';
  $('#partnerSendDialog').showModal();
}
$('#cancelPartnerSend')?.addEventListener('click',()=>$('#partnerSendDialog').close());
$('#partnerSendForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.currentTarget; const button=f.querySelector('[type=submit]');button.disabled=true;
  try {await api('/api/applications/'+f.elements.id.value+'/send-partner',{method:'POST',body:JSON.stringify({to:f.elements.to.value,subject:f.elements.subject.value,body:f.elements.body.value})});$('#partnerSendStatus').textContent='Dossier verstuurd.';await loadApplications();}
  catch(err){$('#partnerSendStatus').textContent=err.message;button.disabled=false;}
});
