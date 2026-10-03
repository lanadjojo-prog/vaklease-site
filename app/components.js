'use client';

import { useState } from 'react';

const LOGO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-logo.png?v=1790680810';
const API = 'https://vaklease-partner-inbox.onrender.com/api/public-applications';

export function AssetIcon({ type }) {
  if (type === 'machine') return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 43h32l8 8H16z" />
      <circle cx="19" cy="51" r="5" /><circle cx="39" cy="51" r="5" />
      <path d="M17 42V25h17l7 9v8M34 25V15h8l7 18M48 33l8-9 3 3-8 12" />
    </svg>
  );
  if (type === 'trailer') return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M7 25h39v21H7zM46 37h7l6 8M15 25l6-9h17l6 9" />
      <circle cx="18" cy="50" r="5" /><circle cx="39" cy="50" r="5" />
    </svg>
  );
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 23h33l12 12v13H6zM39 23v12h12" />
      <circle cx="18" cy="49" r="6" /><circle cx="44" cy="49" r="6" />
      <path d="M11 29h20" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="vl-header">
        <div className="vl-shell vl-header-inner">
          <a className="vl-logo" href="/"><img src={LOGO} alt="VakLease" /></a>
          <nav className="vl-nav">
            <a href="/bedrijfswagens/">Bedrijfswagens</a>
            <a href="/machines/">Machines</a>
            <a href="/aanhangers/">Aanhangers</a>
            <a href="/#werkwijze">Zo werkt het</a>
            <a href="/contact/">Contact</a>
          </nav>
          <a className="vl-btn vl-btn-primary vl-header-cta" href="/contact/">Lease aanvragen <span>→</span></a>
          <button className="vl-menu" onClick={() => setOpen(!open)} aria-label="Menu openen" aria-expanded={open}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
      {open && (
        <div className="vl-mobile-nav">
          <div className="vl-shell">
            <a href="/bedrijfswagens/">Bedrijfswagens</a>
            <a href="/machines/">Machines</a>
            <a href="/aanhangers/">Aanhangers</a>
            <a href="/#werkwijze">Zo werkt het</a>
            <a href="/contact/">Contact</a>
            <a className="vl-btn vl-btn-primary" href="/contact/">Lease aanvragen →</a>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="vl-footer">
      <div className="vl-shell">
        <div className="vl-footer-top">
          <div className="vl-footer-brand">
            <img src={LOGO} alt="VakLease" />
            <p>Zakelijke lease voor vakmensen. Bedrijfswagens, machines en aanhangers via één duidelijke aanvraag.</p>
          </div>
          <div>
            <h4>Lease</h4>
            <a href="/bedrijfswagens/">Bedrijfswagens</a>
            <a href="/machines/">Machines</a>
            <a href="/aanhangers/">Aanhangers</a>
          </div>
          <div>
            <h4>VakLease</h4>
            <a href="/#werkwijze">Zo werkt het</a>
            <a href="/contact/">Contact</a>
            <a href="/contact/">Aanvraag starten</a>
          </div>
          <div>
            <h4>Financiering</h4>
            <p>VakLease helpt bij de intake en werkt voor de financiering samen met PG Lease.</p>
          </div>
        </div>
        <div className="vl-footer-bottom">
          <span>© 2026 VakLease</span>
          <span>Zakelijke financial lease voor ondernemers</span>
        </div>
      </div>
    </footer>
  );
}

async function submitApplication(payload) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Versturen is niet gelukt.');
  return data;
}

export function LeadForm({ defaultCategory = '' }) {
  const [form, setForm] = useState({
    category: defaultCategory,
    product_url: '',
    purchase_price: '',
    object_description: '',
    applicant_name: '',
    company_name: '',
    email: '',
    phone: '',
    kvk: '',
    consent: false
  });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const change = e => {
    const { name, value, type, checked } = e.target;
    setForm(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async e => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await submitApplication({ ...form, source: 'contact-page' });
      setStatus('success');
      setMessage('Bedankt. Je aanvraag staat bij VakLease en we nemen contact met je op.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Versturen is niet gelukt. Probeer het opnieuw.');
    }
  };

  return (
    <form className="vl-lead-form" onSubmit={submit}>
      <div className="vl-form-grid">
        <label><span>Wat wil je leasen?</span>
          <select name="category" value={form.category} onChange={change} required>
            <option value="">Kies een categorie</option>
            <option value="Bedrijfswagen">Bedrijfswagen</option>
            <option value="Machine">Machine</option>
            <option value="Aanhanger">Aanhanger</option>
          </select>
        </label>
        <label><span>Aanschafprijs (optioneel)</span>
          <input name="purchase_price" value={form.purchase_price} onChange={change} placeholder="Bijv. € 24.500" />
        </label>
        <label className="vl-span-2"><span>Heb je het object al gevonden?</span>
          <input type="url" name="product_url" value={form.product_url} onChange={change} placeholder="Plak hier de link van dealer, leverancier of advertentie" />
        </label>
        <label className="vl-span-2"><span>Wat zoek je?</span>
          <textarea name="object_description" value={form.object_description} onChange={change} rows="4" placeholder="Bijv. Ford Transit Custom, minigraver 2,5 ton of gesloten aanhanger..." />
        </label>
        <label><span>Naam</span><input name="applicant_name" value={form.applicant_name} onChange={change} required /></label>
        <label><span>Bedrijfsnaam</span><input name="company_name" value={form.company_name} onChange={change} /></label>
        <label><span>E-mail</span><input type="email" name="email" value={form.email} onChange={change} /></label>
        <label><span>Telefoon</span><input name="phone" value={form.phone} onChange={change} /></label>
        <label className="vl-span-2"><span>KvK-nummer (optioneel)</span><input name="kvk" value={form.kvk} onChange={change} /></label>
      </div>
      <label className="vl-consent">
        <input type="checkbox" name="consent" checked={form.consent} onChange={change} required />
        <span>Ik geef toestemming om mijn gegevens te gebruiken om contact op te nemen over deze leaseaanvraag.</span>
      </label>
      <button className="vl-btn vl-btn-primary vl-submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Versturen…' : 'Aanvraag vrijblijvend versturen →'}
      </button>
      {message && <p className={status === 'success' ? 'vl-form-success' : 'vl-form-error'}>{message}</p>}
    </form>
  );
}

export function QuickLead() {
  const [category, setCategory] = useState('Bedrijfswagen');
  const [url, setUrl] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');

  const submit = async e => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitApplication({
        category,
        product_url: url,
        email: contact.includes('@') ? contact : '',
        phone: contact.includes('@') ? '' : contact,
        consent,
        source: 'homepage-quicklead'
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') return <div className="vl-quick-success"><b>✓ Aanvraag ontvangen.</b><span>We nemen contact met je op om de mogelijkheden te bespreken.</span></div>;

  return (
    <form className="vl-quick-form" onSubmit={submit}>
      <div className="vl-quick-title"><span>Al iets gevonden?</span><strong>Plak de link. Wij pakken de leaseaanvraag op.</strong></div>
      <div className="vl-quick-fields">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Bedrijfswagen</option><option>Machine</option><option>Aanhanger</option>
        </select>
        <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://dealer.nl/object..." required />
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="E-mail of telefoon" required />
        <button className="vl-btn vl-btn-orange">Aanvragen →</button>
      </div>
      <label className="vl-quick-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required /> <span>Akkoord dat VakLease contact opneemt over deze aanvraag.</span></label>
      {status === 'error' && <small className="vl-form-error">Versturen is niet gelukt. Probeer het opnieuw.</small>}
    </form>
  );
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');

  const submit = async () => {
    if (!category || !contact || !consent) return;
    setStatus('loading');
    try {
      await submitApplication({
        category,
        product_url: url,
        email: contact.includes('@') ? contact : '',
        phone: contact.includes('@') ? '' : contact,
        consent,
        source: 'chat-assistant'
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <button className="vl-chat-launcher" onClick={() => setOpen(!open)} aria-label="VakLease chat openen">
        <span className="vl-chat-dot"></span>{open ? 'Sluiten' : 'Hulp nodig?'}
      </button>
      {open && <div className="vl-chat-panel">
        <div className="vl-chat-head"><b>VakLease assistent</b><span>Meestal ben je in 1 minuut klaar.</span></div>
        {status === 'success' ? (
          <div className="vl-chat-success"><strong>✓ Gelukt</strong><p>Je aanvraag is ontvangen. We nemen contact met je op.</p></div>
        ) : (
          <div className="vl-chat-body">
            <p><b>Wat wil je leasen?</b></p>
            <div className="vl-chat-options">
              {['Bedrijfswagen','Machine','Aanhanger'].map(x => <button key={x} className={category===x?'active':''} onClick={()=>setCategory(x)}>{x}</button>)}
            </div>
            <label>Link naar object <small>(optioneel)</small><input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="Plak een advertentie of dealerlink" /></label>
            <label>E-mail of telefoon<input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Hoe kunnen we je bereiken?" /></label>
            <label className="vl-chat-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} /><span>VakLease mag contact opnemen over mijn aanvraag.</span></label>
            <button className="vl-btn vl-btn-primary vl-chat-submit" onClick={submit} disabled={!category || !contact || !consent || status==='loading'}>
              {status==='loading'?'Versturen…':'Stuur mijn aanvraag →'}
            </button>
            {status === 'error' && <small className="vl-form-error">Dat ging niet goed. Probeer het opnieuw.</small>}
          </div>
        )}
      </div>}
    </>
  );
}

export function CategoryPage({ category, icon, title, intro, examples, benefits }) {
  return (
    <main>
      <Header />
      <section className="vl-category-hero">
        <div className="vl-shell vl-category-hero-grid">
          <div>
            <span className="vl-kicker">VakLease · {category}</span>
            <h1>{title}</h1>
            <p>{intro}</p>
            <div className="vl-actions">
              <a className="vl-btn vl-btn-primary" href="/contact/">Lease aanvragen →</a>
              <a className="vl-text-link" href="#mogelijkheden">Bekijk mogelijkheden</a>
            </div>
          </div>
          <div className="vl-category-visual"><AssetIcon type={icon} /><span>{category}</span></div>
        </div>
      </section>
      <section className="vl-section" id="mogelijkheden">
        <div className="vl-shell">
          <div className="vl-section-head"><span className="vl-kicker">Mogelijkheden</span><h2>Wat wil je financieren?</h2><p>Je hoeft niet uit ons eigen aanbod te kiezen. Heb je ergens een passend object gevonden, stuur de link mee.</p></div>
          <div className="vl-example-grid">
            {examples.map((x,i)=><article key={x[0]}><span>0{i+1}</span><h3>{x[0]}</h3><p>{x[1]}</p></article>)}
          </div>
        </div>
      </section>
      <section className="vl-dark-section">
        <div className="vl-shell vl-benefit-grid">
          <div><span className="vl-kicker vl-kicker-dark">Waarom VakLease</span><h2>Eén aanvraag. Eén aanspreekpunt.</h2><p>Wij verzamelen de informatie die nodig is en zetten de aanvraag door naar onze leasepartner voor beoordeling.</p></div>
          <div className="vl-benefit-list">{benefits.map(x=><div key={x}><span>✓</span><p>{x}</p></div>)}</div>
        </div>
      </section>
      <section className="vl-section vl-center">
        <div className="vl-shell vl-mini-cta">
          <span className="vl-kicker">Al iets gevonden?</span>
          <h2>Stuur de link mee met je aanvraag.</h2>
          <p>Dat kan een dealerpagina, leverancier, advertentie of offerte zijn.</p>
          <a className="vl-btn vl-btn-orange" href="/contact/">Start aanvraag →</a>
        </div>
      </section>
      <Footer />
      <ChatAssistant />
    </main>
  );
}