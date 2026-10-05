import { Header, Footer, QuickLead, ChatAssistant } from './components';

const HERO_SCENE = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-hero-netherlands-realistic.png?v=1790691711';

const categories = [
  {
    href: '/bedrijfswagens/',
    label: 'Bedrijfswagens',
    title: 'De juiste bus voor jouw werk.',
    text: 'Van compacte bestelbus tot grote bedrijfswagen. Nieuw of gebruikt: jij kiest het object.',
    image: 'https://images.unsplash.com/photo-1780490103753-378c2f39ae7a?auto=format&fit=crop&fm=jpg&q=82&w=1400',
    alt: 'Witte bedrijfswagen in een Nederlandse straat'
  },
  {
    href: '/machines/',
    label: 'Machines',
    title: 'Capaciteit toevoegen zonder alles direct af te rekenen.',
    text: 'Voor onder meer minigravers, shovels, heftrucks, hoogwerkers en andere zakelijke machines.',
    image: 'https://images.pexels.com/photos/3964459/pexels-photo-3964459.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Zakelijke bouwmachine op een bedrijfsterrein'
  },
  {
    href: '/aanhangers/',
    label: 'Aanhangers',
    title: 'Meer materieel mee naar iedere klus.',
    text: 'Van machinetransporter en kipper tot gesloten aanhanger of autotransporter.',
    image: 'https://images.pexels.com/photos/38095094/pexels-photo-38095094/free-photo-of-yellow-construction-vehicle-on-flatbed-trailer.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Flatbed aanhanger met bouwmaterieel'
  }
];

export default function Home() {
  return (
    <main>
      <Header />

      <section className="vl-hero vl-hero-pro">
        <div className="vl-shell vl-hero-grid">
          <div className="vl-hero-copy">
            <span className="vl-kicker">Zakelijke lease voor vakbedrijven</span>
            <h1>Jouw volgende bedrijfswagen, machine of aanhanger. <span>Slim gefinancierd.</span></h1>
            <p>Kies zelf het object bij een dealer of leverancier. VakLease verzorgt de intake en begeleidt jouw aanvraag richting een passend financial lease voorstel.</p>
            <div className="vl-actions">
              <a className="vl-btn vl-btn-primary" href="/contact/">Lease aanvragen <span>→</span></a>
              <a className="vl-btn vl-btn-ghost" href="#categorieen">Bekijk mogelijkheden</a>
            </div>
            <div className="vl-trust-row">
              <div><b>01</b><span><strong>Jij kiest het object</strong><small>Dealer, leverancier of advertentie</small></span></div>
              <div><b>02</b><span><strong>Eén duidelijke intake</strong><small>Zakelijk en overzichtelijk</small></span></div>
              <div><b>03</b><span><strong>Beoordeling door leasepartner</strong><small>Voorstel op basis van jouw aanvraag</small></span></div>
            </div>
          </div>

          <div className="vl-hero-visual vl-hero-visual-pro" aria-hidden="true">
            <div className="vl-hero-shape"></div>
            <img src={HERO_SCENE} alt="" />
          </div>
        </div>
      </section>

      <section className="vl-proofbar">
        <div className="vl-shell vl-proofbar-grid">
          <div><strong>Bedrijfswagens</strong><span>Compact tot groot</span></div>
          <div><strong>Machines</strong><span>Voor bouw, infra en techniek</span></div>
          <div><strong>Aanhangers</strong><span>Transport voor iedere klus</span></div>
          <div><strong>Zelf kiezen</strong><span>Geen verplichte eigen voorraad</span></div>
        </div>
      </section>

      <section className="vl-category-section" id="categorieen">
        <div className="vl-shell">
          <div className="vl-section-head vl-section-head-row">
            <div><span className="vl-kicker">Wat wil je leasen?</span><h2>Zakelijke financiering voor materieel dat omzet maakt.</h2></div>
            <p>Geen catalogus waar je uit móét kiezen. Zoek het object dat bij jouw werk past en stuur de link mee.</p>
          </div>
          <div className="vl-category-grid">
            {categories.map((c,i) => (
              <a className="vl-category-card vl-category-card-photo" href={c.href} key={c.label}>
                <div className="vl-category-photo">
                  <img src={c.image} alt={c.alt} loading="lazy" />
                  <span className="vl-card-number">0{i+1}</span>
                </div>
                <div className="vl-category-card-body">
                  <h3>{c.label}</h3>
                  <strong>{c.title}</strong>
                  <p>{c.text}</p>
                  <span className="vl-card-link">Bekijk {c.label.toLowerCase()} <b>→</b></span>
                </div>
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
            <h2>Van gevonden object naar financieringsaanvraag.</h2>
            <p>Je hoeft niet eerst door een eigen voorraad te zoeken. Jij bepaalt wat bij je bedrijf past.</p>
          </div>
          <div className="vl-process-grid">
            <article><span>01</span><h3>Vind wat je nodig hebt</h3><p>Bij een dealer, leverancier of advertentieplatform. Nieuw of gebruikt.</p></article>
            <article><span>02</span><h3>Stuur de gegevens</h3><p>Plak de link of omschrijf het object en vul je bedrijfs- en contactgegevens in.</p></article>
            <article><span>03</span><h3>Wij maken de intake compleet</h3><p>VakLease controleert de aanvraag en zorgt dat de informatie compleet wordt aangeleverd.</p></article>
            <article><span>04</span><h3>Je krijgt duidelijkheid</h3><p>Na beoordeling ontvang je informatie over de financieringsmogelijkheden en het vervolg.</p></article>
          </div>
        </div>
      </section>

      <section className="vl-partner-section">
        <div className="vl-shell vl-partner-grid">
          <div>
            <span className="vl-kicker vl-kicker-dark">Zakelijk leasen zonder omwegen</span>
            <h2>Eén route voor bedrijfswagen, machine of aanhanger.</h2>
          </div>
          <div>
            <p>VakLease richt zich op ondernemers die gericht willen investeren in bedrijfsmiddelen. Wij houden de intake overzichtelijk, begeleiden het proces en zorgen dat jouw aanvraag compleet bij de financierende partij terechtkomt.</p>
            <a className="vl-text-link vl-text-link-light" href="/contact/">Bespreek je aanvraag →</a>
          </div>
        </div>
      </section>

      <section className="vl-final-cta">
        <div className="vl-shell vl-final-box">
          <div><span className="vl-kicker">Al iets gevonden?</span><h2>Plak de link. Dan kunnen we gericht beginnen.</h2><p>Bedrijfswagen, machine of aanhanger: stuur het object mee met je aanvraag.</p></div>
          <a className="vl-btn vl-btn-orange" href="/contact/">Aanvraag starten →</a>
        </div>
      </section>

      <Footer />
      <ChatAssistant />
    </main>
  );
}
