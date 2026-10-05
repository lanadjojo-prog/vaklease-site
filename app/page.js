import { Header, Footer, QuickLead, ChatAssistant } from './components';

const HERO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-home-hero-2026.png?v=1791188664';
const BRANDING = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-bestickering-studio-2026.png?v=1791188699';

const categories = [
  {
    href: '/bedrijfswagens/',
    label: 'Bedrijfswagens',
    title: 'De juiste bus voor jouw werk.',
    text: 'Van compacte bestelbus tot grote bedrijfswagen. Nieuw of gebruikt: jij kiest het object.',
    image: 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-category-bedrijfswagen-2026.png?v=1791188673',
    alt: 'VakLease werkbus op bouwplaats'
  },
  {
    href: '/machines/',
    label: 'Machines',
    title: 'Meer capaciteit voor iedere klus.',
    text: 'Voor onder meer minigravers, shovels, heftrucks, hoogwerkers en andere bedrijfsmachines.',
    image: 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-category-machines-2026.png?v=1791188682',
    alt: 'VakLease machines op industrieterrein'
  },
  {
    href: '/aanhangers/',
    label: 'Aanhangers',
    title: 'Meer materieel mee naar je werk.',
    text: 'Van machinetransporter en kipper tot gesloten aanhanger of autotransporter.',
    image: 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-category-aanhanger-2026.png?v=1791188690',
    alt: 'VakLease aanhanger op industrieterrein'
  }
];

export default function Home() {
  return (
    <main>
      <Header />

      <section className="vl-vw-hero">
        <div className="vl-vw-hero-media">
          <img src={HERO} alt="VakLease bedrijfswagen bij een moderne bouwlocatie" />
        </div>
        <div className="vl-vw-hero-shade"></div>
        <div className="vl-shell vl-vw-hero-content">
          <span className="vl-vw-eyebrow">Zakelijke lease voor vakbedrijven</span>
          <h1>Lease wat jouw bedrijf <span>vooruit brengt.</span></h1>
          <p>Bedrijfswagen, machine of aanhanger gevonden? Stuur de link mee. VakLease begeleidt jouw aanvraag van eerste intake tot financieringsvoorstel.</p>
          <div className="vl-vw-actions">
            <a className="vl-vw-btn vl-vw-btn-light" href="/contact/">Lease aanvragen</a>
            <a className="vl-vw-btn vl-vw-btn-outline-light" href="#mogelijkheden">Bekijk mogelijkheden</a>
          </div>
        </div>
      </section>

      <section className="vl-vw-welcome">
        <div className="vl-shell vl-vw-welcome-inner">
          <h2>Welkom bij <strong>VakLease</strong></h2>
          <p>Zakelijke financial lease voor ondernemers die zelf willen kiezen welk materieel bij hun werk past.</p>
          <div className="vl-vw-quicklinks">
            <a href="/bedrijfswagens/">Bedrijfswagens <span>→</span></a>
            <a href="/machines/">Machines <span>→</span></a>
            <a href="/aanhangers/">Aanhangers <span>→</span></a>
          </div>
        </div>
      </section>

      <section className="vl-vw-models" id="mogelijkheden">
        <div className="vl-shell">
          <div className="vl-vw-section-title">
            <span>Wat wil je leasen?</span>
            <h2>Materieel dat voor jouw bedrijf werkt.</h2>
            <a href="/contact/">Direct een aanvraag starten</a>
          </div>

          <div className="vl-vw-model-grid">
            {categories.map((item) => (
              <article className="vl-vw-model-card" key={item.label}>
                <a className="vl-vw-model-image" href={item.href}>
                  <img src={item.image} alt={item.alt} loading="lazy" />
                </a>
                <div className="vl-vw-model-body">
                  <h3>{item.label}</h3>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                  <div className="vl-vw-model-actions">
                    <a className="vl-vw-btn vl-vw-btn-dark" href={item.href}>Bekijk {item.label.toLowerCase()}</a>
                    <a className="vl-vw-btn vl-vw-btn-outline" href="/contact/">Lease aanvragen</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vl-vw-feature" id="bestickering">
        <div className="vl-shell">
          <div className="vl-vw-feature-panel">
            <div className="vl-vw-feature-copy">
              <span className="vl-vw-eyebrow">Busbestickering & design</span>
              <h2>Van leasebus naar <strong>rijdend visitekaartje.</strong></h2>
              <p>Wil je jouw bedrijfswagen direct professioneel laten bestickeren? VakLease helpt ook met het ontwerp. Van subtiel logo tot complete voertuigwrap.</p>
              <div className="vl-vw-feature-actions">
                <a className="vl-vw-btn vl-vw-btn-light" href="/contact/">Vraag gratis ontwerp aan</a>
                <a className="vl-vw-btn vl-vw-btn-outline-light" href="/bedrijfswagens/">Bekijk bedrijfswagens</a>
              </div>
            </div>
            <div className="vl-vw-feature-image">
              <img src={BRANDING} alt="VakLease ontwerpstudio voor bedrijfswagenbestickering" loading="lazy" />
              <span>Gratis ontwerpvoorstel</span>
            </div>
          </div>
        </div>
      </section>

      <section className="vl-vw-process" id="werkwijze">
        <div className="vl-shell">
          <div className="vl-vw-section-title vl-vw-section-title-left">
            <span>Zo werkt VakLease</span>
            <h2>Van gevonden object naar duidelijke aanvraag.</h2>
          </div>
          <div className="vl-vw-process-grid">
            <article>
              <b>01</b>
              <h3>Kies zelf het object</h3>
              <p>Vind een bedrijfswagen, machine of aanhanger bij de dealer of leverancier van jouw keuze.</p>
            </article>
            <article>
              <b>02</b>
              <h3>Stuur de link mee</h3>
              <p>Vul de belangrijkste gegevens in en voeg de advertentie, offerte of productlink toe.</p>
            </article>
            <article>
              <b>03</b>
              <h3>Wij begeleiden de aanvraag</h3>
              <p>VakLease maakt de intake compleet en begeleidt het dossier richting beoordeling en voorstel.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="vl-vw-lead">
        <div className="vl-shell">
          <div className="vl-vw-lead-title">
            <span>Al iets gevonden?</span>
            <h2>Plak de link. Dan kunnen we gericht beginnen.</h2>
          </div>
          <QuickLead />
        </div>
      </section>

      <section className="vl-vw-end">
        <div className="vl-shell vl-vw-end-inner">
          <div>
            <span>Bedrijfswagen, machine of aanhanger</span>
            <h2>Klaar voor je volgende investering?</h2>
          </div>
          <a className="vl-vw-btn vl-vw-btn-dark" href="/contact/">Start je aanvraag</a>
        </div>
      </section>

      <Footer />
      <ChatAssistant />
    </main>
  );
}
