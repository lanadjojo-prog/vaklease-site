const state = { partners: [], templates: [], config: null };

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
    templates:'Templates', applications:'Aanvragen'
  }[view] || 'VakLease';
  if (view === 'inbox') loadInbox();
  if (view === 'sent') loadSent();
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
    status.textContent = 'Verzonden';
    e.currentTarget.reset();
    $('#composePartnerId').value = '';
    setTimeout(() => { status.textContent = ''; go('sent'); }, 700);
    loadPartners();
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

(async function init() {
  await loadConfig();
  await Promise.allSettled([loadPartners(), loadTemplates()]);
  loadInbox();
})();