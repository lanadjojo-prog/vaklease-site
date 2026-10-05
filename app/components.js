'use client';

import { useState } from 'react';

const LOGO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-logo.png?v=1790680810';
const API = 'https://vaklease-partner-inbox.onrender.com/api/public-applications';
const BRANDING = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-bestickering-studio-2026.png?v=1791188699';

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
            <a href="/#bestickering">Busbestickering</a>
            <a href="/#werkwijze">Zo werkt het</a>
            <a href="/#faq">Veelgestelde vragen</a>
          </nav>
          <a className="vl-btn vl-btn-primary vl-header-cta" href="/#quickcheck">Check mogelijkheden <span>→</span></a>
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
            <a href="/#bestickering">Busbestickering</a>
            <a href="/#werkwijze">Zo werkt het</a>
            <a href="/#faq">Veelgestelde vragen</a>
            <a className="vl-btn vl-btn-primary" href="/#quickcheck">Check mogelijkheden →</a>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="vl-footer vl-footer-premium">
      <div className="vl-shell">
        <div className="vl-footer-cta">
          <div>
            <span>Een object op het oog?</span>
            <h2>Stuur de link. Wij helpen je verder.</h2>
          </div>
          <a href="/#quickcheck">Check mijn mogelijkheden <b>→</b></a>
        </div>

        <div className="vl-footer-top">
          <div className="vl-footer-brand">
            <img src={LOGO} alt="VakLease" />
            <p>Zakelijke financial lease voor vakbedrijven. Jij kiest het object, VakLease begeleidt de intake en de financierende partij beoordeelt de aanvraag.</p>
            <div className="vl-footer-trust">
              <span>Zelf object kiezen</span>
              <span>Gerichte intake</span>
              <span>Eén aanspreekpunt</span>
            </div>
          </div>
          <div className="vl-footer-column">
            <h4>Lease</h4>
            <a href="/bedrijfswagens/">Bedrijfswagens</a>
            <a href="/machines/">Machines</a>
            <a href="/aanhangers/">Aanhangers</a>
          </div>
          <div className="vl-footer-column">
            <h4>VakLease</h4>
            <a href="/#werkwijze">Zo werkt het</a>
            <a href="/#bestickering">Busbestickering</a>
            <a href="/#faq">Veelgestelde vragen</a>
            <a href="/contact/">Contact</a>
          </div>
          <div className="vl-footer-column vl-footer-start">
            <h4>Start je aanvraag</h4>
            <p>Je hoeft nog niet alle documenten klaar te hebben. Begin met het object, de prijs en je contactgegevens.</p>
            <a className="vl-footer-start-link" href="/#quickcheck">Begin met 4 gegevens <b>→</b></a>
          </div>
        </div>

        <div className="vl-footer-bottom">
          <span>© 2026 VakLease</span>
          <span>Zakelijke financial lease voor ondernemers</span>
          <span>Aanvragen worden altijd beoordeeld door de financierende partij.</span>
        </div>
      </div>
    </footer>
  );
}

async function submitApplication(payload) {
  const enriched = {
    ...payload,
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    journey: payload.journey || payload.source || 'website'
  };
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enriched)
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
      setMessage('Bedankt. Je gegevens zijn ontvangen. VakLease neemt contact op om de aanvraag verder te bespreken.');
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
        <label><span>Aanschafprijs</span>
          <input name="purchase_price" value={form.purchase_price} onChange={change} placeholder="Bijv. € 24.500" />
        </label>
        <label className="vl-span-2"><span>Link naar het object</span>
          <input type="url" name="product_url" value={form.product_url} onChange={change} placeholder="Dealer, leverancier of advertentie" />
        </label>
        <label className="vl-span-2"><span>Wat zoek je of wat moeten we weten?</span>
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
        {status === 'loading' ? 'Versturen…' : 'Bekijk mijn mogelijkheden →'}
      </button>
      {message && <p className={status === 'success' ? 'vl-form-success' : 'vl-form-error'}>{message}</p>}
    </form>
  );
}

export function QuickLead({ defaultCategory = 'Bedrijfswagen', source = 'homepage-quicklead', compact = false }) {
  const [route, setRoute] = useState('found');
  const [category, setCategory] = useState(defaultCategory);
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');

  const submit = async e => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitApplication({
        category,
        purchase_price: price,
        product_url: route === 'found' ? url : '',
        object_description: route === 'found'
          ? 'Object al gevonden.'
          : 'Zoekt nog een object. ' + description,
        email: contact.includes('@') ? contact : '',
        phone: contact.includes('@') ? '' : contact,
        consent,
        source
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <div className="vl-quick-success"><b>✓ Gegevens ontvangen.</b><span>We nemen contact op om de mogelijkheden en het vervolg te bespreken.</span></div>;
  }

  return (
    <form className={'vl-quick-form vl-conversion-form' + (compact ? ' is-compact' : '')} onSubmit={submit}>
      <div className="vl-route-switch" aria-label="Heb je al een object gevonden?">
        <button type="button" className={route === 'found' ? 'active' : ''} onClick={() => setRoute('found')}>Ik heb al iets gevonden</button>
        <button type="button" className={route === 'searching' ? 'active' : ''} onClick={() => setRoute('searching')}>Ik zoek nog een object</button>
      </div>
      <div className="vl-quick-fields vl-conversion-fields">
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Categorie">
          <option>Bedrijfswagen</option><option>Machine</option><option>Aanhanger</option>
        </select>
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Aanschafprijs, bijv. € 28.500" />
        {route === 'found' ? (
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Plak link naar object" required />
        ) : (
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Wat zoek je? Bijv. Transit Custom" required />
        )}
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="E-mail of telefoon" required />
        <button className="vl-btn vl-btn-orange">Check mogelijkheden →</button>
      </div>
      <div className="vl-conversion-foot">
        <label className="vl-quick-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required /> <span>VakLease mag contact opnemen over deze aanvraag.</span></label>
        <span className="vl-no-obligation">Vrijblijvende intake · geen verplichting</span>
      </div>
      {status === 'error' && <small className="vl-form-error">Versturen is niet gelukt. Probeer het opnieuw.</small>}
    </form>
  );
}

const faqs = [
  ['Kan ik zelf een dealer of leverancier kiezen?', 'Ja. Je kunt zelf een passend object zoeken en de link of offerte meesturen. VakLease heeft geen verplichte eigen voorraad waar je uit moet kiezen.'],
  ['Kan ik ook een gebruikte bedrijfswagen, machine of aanhanger indienen?', 'Ja, je kunt ook een gebruikt object indienen. Of en onder welke voorwaarden financiering mogelijk is, hangt af van het object en de beoordeling van de financierende partij.'],
  ['Kan ik als starter een aanvraag doen?', 'Ja, ook als starter kun je een aanvraag indienen. Welke informatie nodig is en welke mogelijkheden er zijn, verschilt per situatie en financierende partij.'],
  ['Heb ik altijd jaarcijfers nodig?', 'Niet iedere aanvraag is hetzelfde. Welke documenten nodig zijn, hangt af van jouw onderneming, het object en de criteria van de financierende partij.'],
  ['Kan een aanbetaling helpen?', 'Een aanbetaling kan invloed hebben op de financieringsopzet. Vermeld daarom bij je aanvraag wat je zelf wilt of kunt inbrengen, dan kan dit worden meegenomen in de intake.'],
  ['Hoe snel krijg ik duidelijkheid?', 'Dat hangt af van hoe compleet de aanvraag is en van de beoordeling door de financierende partij. VakLease zorgt dat de intake zo gericht mogelijk wordt aangeleverd.']
];

export function FAQ({ title = 'Veelgestelde vragen over zakelijke lease' }) {
  return (
    <section className="vl-faq-section" id="faq">
      <div className="vl-shell vl-faq-layout">
        <div className="vl-faq-intro">
          <span>Goed om te weten</span>
          <h2>{title}</h2>
          <p>Geen algemene beloften die niet bij iedere ondernemer passen. Dit zijn de vragen die we vooraf het vaakst willen verduidelijken.</p>
        </div>
        <div className="vl-faq-list">
          {faqs.map(([q,a]) => (
            <details key={q}>
              <summary>{q}<span>+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MobileSticky() {
  return (
    <div className="vl-mobile-sticky" aria-label="Snelle acties">
      <a href="/contact/">Contact</a>
      <a className="primary" href="/#quickcheck">Check mogelijkheden</a>
    </div>
  );
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Bedrijfswagen');
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
        source: 'website-chat',
        journey: 'floating-chat'
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
        <div className="vl-chat-head"><b>VakLease assistent</b><span>In een paar stappen je aanvraag starten.</span></div>
        {status === 'success' ? (
          <div className="vl-chat-success"><strong>✓ Gelukt</strong><p>Je gegevens zijn ontvangen. We nemen contact op.</p></div>
        ) : (
          <div className="vl-chat-body">
            <p><b>Wat wil je leasen?</b></p>
            <div className="vl-chat-options">
              {['Bedrijfswagen','Machine','Aanhanger'].map(x => <button type="button" key={x} className={category===x?'active':''} onClick={()=>setCategory(x)}>{x}</button>)}
            </div>
            <label>Link naar object <small>(optioneel)</small><input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="Plak een advertentie of dealerlink" /></label>
            <label>E-mail of telefoon<input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Hoe kunnen we je bereiken?" /></label>
            <label className="vl-chat-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} /><span>VakLease mag contact opnemen over mijn aanvraag.</span></label>
            <button className="vl-btn vl-btn-primary vl-chat-submit" onClick={submit} disabled={!category || !contact || !consent || status==='loading'}>
              {status==='loading'?'Versturen…':'Check mijn mogelijkheden →'}
            </button>
            {status === 'error' && <small className="vl-form-error">Dat ging niet goed. Probeer het opnieuw.</small>}
          </div>
        )}
      </div>}
    </>
  );
}

export function CategoryPage({ category, icon, title, intro, examples, benefits, image, imageAlt }) {
  const defaultCategory = category === 'Bedrijfswagens' ? 'Bedrijfswagen' : category === 'Machines' ? 'Machine' : 'Aanhanger';
  const isVan = category === 'Bedrijfswagens';

  return (
    <main>
      <Header />

      <section className="vl-category-hero vl-category-hero-pro">
        <div className="vl-shell vl-category-hero-grid">
          <div>
            <span className="vl-kicker">VakLease · {category}</span>
            <h1>{title}</h1>
            <p>{intro}</p>
            <div className="vl-category-proof">
              <span>✓ Zelf object kiezen</span>
              <span>✓ Link of offerte meesturen</span>
              <span>✓ Begeleiding van intake tot beoordeling</span>
            </div>
            <div className="vl-actions">
              <a className="vl-btn vl-btn-primary" href="#categorie-check">Check mijn mogelijkheden →</a>
              <a className="vl-text-link" href="#mogelijkheden">Bekijk voorbeelden</a>
            </div>
          </div>
          <div className="vl-category-visual vl-category-visual-photo">
            {image ? <img src={image} alt={imageAlt || category} /> : <AssetIcon type={icon} />}
            <div className="vl-category-visual-overlay">
              <small>Zakelijke lease</small>
              <strong>{category}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="vl-category-check" id="categorie-check">
        <div className="vl-shell">
          <div className="vl-category-check-title">
            <span>Al iets gevonden?</span>
            <h2>Stuur het object direct door.</h2>
            <p>Met categorie, prijs, objectlink en contactgegevens kunnen we veel gerichter beginnen.</p>
          </div>
          <QuickLead defaultCategory={defaultCategory} source={'category-' + defaultCategory.toLowerCase()} compact />
        </div>
      </section>

      <section className="vl-section" id="mogelijkheden">
        <div className="vl-shell">
          <div className="vl-section-head"><span className="vl-kicker">Voorbeelden</span><h2>Wat kun je indienen?</h2><p>Je hoeft niet uit een vaste voorraad te kiezen. Vind een passend object en stuur de gegevens mee.</p></div>
          <div className="vl-example-grid">
            {examples.map((x,i)=><article key={x[0]}><span>0{i+1}</span><h3>{x[0]}</h3><p>{x[1]}</p></article>)}
          </div>
        </div>
      </section>

      <section className="vl-dark-section">
        <div className="vl-shell vl-benefit-grid">
          <div><span className="vl-kicker vl-kicker-dark">Waarom VakLease</span><h2>Eén route voor jouw aanvraag.</h2><p>VakLease helpt de informatie te verzamelen en begeleidt het dossier richting beoordeling door de financierende partij.</p></div>
          <div className="vl-benefit-list">{benefits.map(x=><div key={x}><span>✓</span><p>{x}</p></div>)}</div>
        </div>
      </section>

      {isVan && (
        <section className="vl-category-branding">
          <div className="vl-shell vl-category-branding-grid">
            <div>
              <span>Extra voor bedrijfswagens</span>
              <h2>Ook een professioneel ontwerp voor je bus?</h2>
              <p>Vraag naast je lease-intake ook een vrijblijvend ontwerpvoorstel voor de bestickering aan.</p>
              <a className="vl-vw-btn vl-vw-btn-dark" href="/#bestickering">Bekijk busbestickering</a>
            </div>
            <div className="vl-category-branding-image"><img src={BRANDING} alt="VakLease ontwerpstudio voor bedrijfswagenbestickering" /></div>
          </div>
        </section>
      )}

      <FAQ title={'Veelgestelde vragen over ' + category.toLowerCase() + ' leasen'} />

      <section className="vl-section vl-center">
        <div className="vl-shell vl-mini-cta">
          <span className="vl-kicker">Klaar om te beginnen?</span>
          <h2>Check je mogelijkheden zonder lange aanvraag.</h2>
          <p>Stuur eerst alleen de belangrijkste gegevens. Daarna bespreken we wat er nog nodig is.</p>
          <a className="vl-btn vl-btn-orange" href="#categorie-check">Start met 4 gegevens →</a>
        </div>
      </section>

      <Footer />
      <ChatAssistant />
      <MobileSticky />
    </main>
  );
}
