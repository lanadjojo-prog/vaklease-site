import { Header, Footer, QuickLead, ChatAssistant, FAQ, MobileSticky } from './components';

const HERO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-home-hero-2026.png?v=1791188664';
const HERO_MACHINE = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-category-machines-2026.png?v=1791188682';
const HERO_TRAILER = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-category-aanhanger-2026.png?v=1791188690';
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

      <section className="vl-guided-hero">
        <div className="vl-shell">
          <div className="vl-guided-copy">
            <span>Zakelijke lease voor vakbedrijven</span>
            <h1>Lease wat je nodig hebt <strong>voor je werk.</strong></h1>
            <p>Bedrijfswagen, machine of aanhanger. Jij kiest het object en de leverancier; VakLease helpt je de aanvraag gericht op weg.</p>
          </div>

          <div className="vl-guided-stage">
            <div className="vl-guided-visual">
              <img src={HERO} alt="VakLease bedrijfswagen bij een moderne bouwlocatie" />
              <div className="vl-guided-callout vl-guided-callout-a"><b>✓</b><span>Zelf dealer of leverancier kiezen</span></div>
              <div className="vl-guided-callout vl-guided-callout-b"><b>✓</b><span>Nieuw of gebruikt indienen</span></div>
              <div className="vl-guided-callout vl-guided-callout-c"><b>✓</b><span>Bestickering als extra optie</span></div>
            </div>

            <aside className="vl-guided-card" id="quickcheck">
              <div className="vl-guided-card-badge">Vrijblijvende intake</div>
              <span className="vl-guided-card-kicker">Start hier</span>
              <h2>Vertel ons wat je wilt leasen.</h2>
              <p>Heb je al iets gevonden? Plak de link. Nog aan het zoeken? Vertel kort wat je nodig hebt.</p>
              <QuickLead source="homepage-hero" compact />
              <div className="vl-guided-card-trust">
                <span>✓ Eén aanspreekpunt</span>
                <span>✓ Geen verplichte voorraad</span>
                <span>✓ Beoordeling door financierende partij</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="vl-vw-models" id="mogelijkheden">
        <div className="vl-shell">
          <div className="vl-vw-section-title">
            <span>Wat wil je leasen?</span>
            <h2>Kies de categorie die bij je volgende investering past.</h2>
            <p className="vl-section-subcopy">Je hoeft niet uit ons aanbod te kiezen. De categoriepagina helpt je vooral om snel de juiste aanvraag te starten.</p>
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
                  <div className="vl-vw-model-actions vl-vw-model-actions-simple">
                    <a className="vl-vw-btn vl-vw-btn-dark" href={item.href}>Bekijk {item.label.toLowerCase()}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vl-vw-process" id="werkwijze">
        <div className="vl-shell">
          <div className="vl-vw-section-title vl-vw-section-title-left">
            <span>Zo werkt VakLease</span>
            <h2>Van objectlink naar beoordeling in drie duidelijke stappen.</h2>
          </div>
          <div className="vl-vw-process-grid">
            <article>
              <b>01</b>
              <h3>Stuur je object door</h3>
              <p>Deel de link, aanschafprijs en je contactgegevens. Heb je nog niets gevonden, vertel dan wat je zoekt.</p>
            </article>
            <article>
              <b>02</b>
              <h3>We maken de intake compleet</h3>
              <p>We bespreken welke gegevens nog nodig zijn en zorgen dat de aanvraag logisch en volledig wordt aangeleverd.</p>
            </article>
            <article>
              <b>03</b>
              <h3>Je krijgt duidelijkheid over het vervolg</h3>
              <p>De financierende partij beoordeelt het dossier. Daarna weet je welke mogelijkheden en vervolgstappen er zijn.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="vl-vw-feature" id="bestickering">
        <div className="vl-shell">
          <div className="vl-vw-feature-panel">
            <div className="vl-vw-feature-copy">
              <span className="vl-vw-eyebrow">Extra voor bedrijfswagens</span>
              <h2>Leasebus gevonden? Maak er meteen een <strong>rijdend visitekaartje</strong> van.</h2>
              <p>Naast de lease-intake kun je ook een vrijblijvend ontwerpvoorstel voor de bestickering aanvragen. Zo zie je vooraf hoe je bus eruit kan komen te zien.</p>
              <div className="vl-vw-feature-actions">
                <a className="vl-vw-btn vl-vw-btn-light" href="/contact/">Vraag gratis ontwerp aan</a>
                <a className="vl-vw-btn vl-vw-btn-outline-light" href="/bedrijfswagens/">Bekijk bedrijfswagens</a>
              </div>
            </div>
            <div className="vl-vw-feature-image">
              <img src={BRANDING} alt="VakLease ontwerpstudio voor bedrijfswagenbestickering" loading="lazy" />
              <span>Vrijblijvend ontwerpvoorstel</span>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="vl-vw-end vl-final-conversion">
        <div className="vl-shell vl-vw-end-inner">
          <div>
            <span>Klaar om te beginnen?</span>
            <h2>Stuur het object door. Wij pakken het vanaf daar op.</h2>
          </div>
          <a className="vl-vw-btn vl-vw-btn-dark" href="#quickcheck">Check mijn mogelijkheden</a>
        </div>
      </section>

      <Footer />
      <ChatAssistant />
      <MobileSticky />
    </main>
  );
}
