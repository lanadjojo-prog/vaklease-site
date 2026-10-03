import { Header, Footer, AssetIcon, QuickLead, ChatAssistant } from './components';

const HERO_SCENE = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-hero-netherlands-realistic.png?v=1790691711';

const categories = [
  {
    href: '/bedrijfswagens/',
    type: 'van',
    label: 'Bedrijfswagens',
    title: 'De juiste bus voor jouw werk.',
    text: 'Van compacte bestelbus tot grote bedrijfswagen. Nieuw of gebruikt, jij kiest het object.'
  },
  {
    href: '/machines/',
    type: 'machine',
    label: 'Machines',
    title: 'Investeer in capaciteit, niet in stilstaand geld.',
    text: 'Denk aan graafmachines, minigravers, shovels, heftrucks en andere zakelijke machines.'
  },
  {
    href: '/aanhangers/',
    type: 'trailer',
    label: 'Aanhangers',
    title: 'Meer meenemen naar iedere klus.',
    text: 'Van machinetransporter en kipper tot gesloten aanhanger of autotransporter.'
  }
];

export default function Home() {
  return (
    <main>
      <Header />

      <section className="vl-hero">
        <div className="vl-shell vl-hero-grid">
          <div className="vl-hero-copy">
            <span className="vl-kicker">Financial lease voor vakmensen</span>
            <h1>Wat jij nodig hebt voor je <span>volgende klus.</span></h1>
            <p>Bedrijfswagen, machine of aanhanger gevonden? VakLease helpt je de financieringsaanvraag snel en overzichtelijk te regelen.</p>
            <div className="vl-actions">
              <a className="vl-btn vl-btn-primary" href="/contact/">Start je aanvraag <span>→</span></a>
              <a className="vl-btn vl-btn-ghost" href="#categorieen">Bekijk mogelijkheden</a>
            </div>
            <div className="vl-trust-row">
              <div><b>01</b><span><strong>Jij kiest</strong><small>Object bij dealer of leverancier</small></span></div>
              <div><b>02</b><span><strong>Wij regelen de intake</strong><small>Duidelijk en persoonlijk</small></span></div>
              <div><b>03</b><span><strong>Leasepartner beoordeelt</strong><small>Voorstel op basis van jouw aanvraag</small></span></div>
            </div>
          </div>

          <div className="vl-hero-visual" aria-hidden="true">
            <div className="vl-hero-shape"></div>
            <img src={HERO_SCENE} alt="" />
            <div className="vl-floating-card vl-floating-one"><small>Lease voor</small><b>3 categorieën</b></div>
            <div className="vl-floating-card vl-floating-two"><small>Gevonden?</small><b>Plak de link</b></div>
          </div>
        </div>
      </section>

      <section className="vl-category-section" id="categorieen">
        <div className="vl-shell">
          <div className="vl-section-head vl-section-head-row">
            <div><span className="vl-kicker">Waar ben je naar op zoek?</span><h2>Lease voor het werk dat jij doet.</h2></div>
            <p>VakLease richt zich bewust op bedrijfsmiddelen voor ondernemers en vakbedrijven.</p>
          </div>
          <div className="vl-category-grid">
            {categories.map((c,i) => (
              <a className="vl-category-card" href={c.href} key={c.label}>
                <div className={'vl-category-icon vl-category-icon-'+(i+1)}><AssetIcon type={c.type} /></div>
                <span className="vl-card-number">0{i+1}</span>
                <h3>{c.label}</h3>
                <strong>{c.title}</strong>
                <p>{c.text}</p>
                <span className="vl-card-link">Bekijk {c.label.toLowerCase()} →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="vl-quick-section">
        <div className="vl-shell">
          <QuickLead />
        </div>
      </section>

      <section className="vl-how" id="werkwijze">
        <div className="vl-shell">
          <div className="vl-section-head">
            <span className="vl-kicker">Zo werkt VakLease</span>
            <h2>Geen eindeloos zoeken in een eigen voorraad.</h2>
            <p>Jij zoekt het bedrijfsmiddel dat bij je past. Wij helpen vervolgens met de leaseaanvraag.</p>
          </div>
          <div className="vl-process-grid">
            <article><span>01</span><h3>Vind wat je nodig hebt</h3><p>Bij een dealer, leverancier of advertentieplatform. Nieuw of gebruikt.</p></article>
            <article><span>02</span><h3>Stuur de gegevens</h3><p>Plak de link of omschrijf het object en vul je contact- en bedrijfsgegevens in.</p></article>
            <article><span>03</span><h3>Wij maken de aanvraag compleet</h3><p>VakLease controleert de intake en zet de aanvraag door voor beoordeling.</p></article>
            <article><span>04</span><h3>Je ontvangt duidelijkheid</h3><p>Bij een passende aanvraag volgt een financieringsvoorstel via onze leasepartner.</p></article>
          </div>
        </div>
      </section>

      <section className="vl-partner-section">
        <div className="vl-shell vl-partner-grid">
          <div>
            <span className="vl-kicker vl-kicker-dark">Eén route voor je zakelijke lease</span>
            <h2>VakLease vooraan. PG Lease voor de financiering.</h2>
          </div>
          <div>
            <p>VakLease richt zich op ondernemers die snel een bedrijfswagen, machine of aanhanger willen financieren. Wij verzorgen de intake en begeleiden de aanvraag; de financieringsbeoordeling loopt via onze gespecialiseerde leasepartner PG Lease.</p>
            <a className="vl-text-link vl-text-link-light" href="/contact/">Bespreek je aanvraag →</a>
          </div>
        </div>
      </section>

      <section className="vl-final-cta">
        <div className="vl-shell vl-final-box">
          <div><span className="vl-kicker">Klaar om te starten?</span><h2>Vertel ons wat je wilt leasen.</h2><p>Een link is genoeg om het gesprek te beginnen.</p></div>
          <a className="vl-btn vl-btn-orange" href="/contact/">Aanvraag starten →</a>
        </div>
      </section>

      <Footer />
      <ChatAssistant />
    </main>
  );
}