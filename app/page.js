import { Header, Footer, QuickLead, ChatAssistant, FAQ, MobileSticky } from './components';

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

      <section className="vl-vw-hero vl-conversion-hero">
        <div className="vl-vw-hero-media">
          <img src={HERO} alt="VakLease bedrijfswagen bij een moderne bouwlocatie" />
        </div>
        <div className="vl-vw-hero-shade"></div>
        <div className="vl-shell vl-vw-hero-content">
          <span className="vl-vw-eyebrow">Zakelijke lease voor vakbedrijven</span>
          <h1>Object gevonden? <span>Stuur de link.</span></h1>
          <p>Jij kiest de bedrijfswagen, machine of aanhanger. VakLease begeleidt de aanvraag van intake tot beoordeling.</p>
          <div className="vl-vw-actions">
            <a className="vl-vw-btn vl-vw-btn-light" href="#quickcheck">Check mijn mogelijkheden</a>
            <a className="vl-vw-btn vl-vw-btn-outline-light" href="#mogelijkheden">Ik zoek nog een object</a>
          </div>
        </div>
      </section>

      <section className="vl-abovefold-check" id="quickcheck">
        <div className="vl-shell">
          <div className="vl-abovefold-head">
            <div>
              <span>Begin met 4 gegevens</span>
              <h2>Geen lang formulier. Eerst kijken wat er mogelijk is.</h2>
            </div>
            <p>Heb je al iets gezien? Plak de advertentie of dealerlink. Nog niets gevonden? Vertel kort wat je zoekt.</p>
          </div>
          <QuickLead source="homepage-abovefold" />
        </div>
      </section>

      <section className="vl-conversion-trust">
        <div className="vl-shell vl-conversion-trust-grid">
          <article><b>01</b><strong>Jij kiest</strong><p>Geen verplichte eigen voorraad. Zoek het object dat bij jouw bedrijf past.</p></article>
          <article><b>02</b><strong>Wij structureren</strong><p>VakLease verzamelt de relevante gegevens voor een gerichte financieringsaanvraag.</p></article>
          <article><b>03</b><strong>Financierende partij beoordeelt</strong><p>De uiteindelijke mogelijkheden en voorwaarden volgen uit de beoordeling van jouw dossier.</p></article>
          <article><b>04</b><strong>Geen loze beloftes</strong><p>We beloven geen goedkeuring vooraf, maar maken de route naar een beoordeling zo duidelijk mogelijk.</p></article>
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
                  <div className="vl-vw-model-actions">
                    <a className="vl-vw-btn vl-vw-btn-dark" href={item.href}>Bekijk {item.label.toLowerCase()}</a>
                    <a className="vl-vw-btn vl-vw-btn-outline" href="#quickcheck">Check mogelijkheden</a>
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

      <section className="vl-proof-explainer">
        <div className="vl-shell vl-proof-explainer-grid">
          <div>
            <span>Voor je gegevens achterlaat</span>
            <h2>Wat VakLease wel en niet doet.</h2>
          </div>
          <div className="vl-proof-columns">
            <article>
              <strong>Wel</strong>
              <p>Je helpen de aanvraag logisch op te bouwen, objectgegevens verzamelen en het dossier begeleiden richting beoordeling.</p>
            </article>
            <article>
              <strong>Niet</strong>
              <p>Vooraf goedkeuring garanderen of doen alsof iedere ondernemer dezelfde voorwaarden krijgt. De financierende partij beslist.</p>
            </article>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="vl-vw-lead vl-second-conversion">
        <div className="vl-shell">
          <div className="vl-vw-lead-title">
            <span>Klaar om te beginnen?</span>
            <h2>Stuur eerst alleen de belangrijkste gegevens.</h2>
            <p>Daarna bespreken we gericht wat er nog nodig is voor jouw situatie.</p>
          </div>
          <QuickLead source="homepage-bottom" />
        </div>
      </section>

      <section className="vl-vw-end">
        <div className="vl-shell vl-vw-end-inner">
          <div>
            <span>Bedrijfswagen, machine of aanhanger</span>
            <h2>Je hoeft nog niet alles te weten om te beginnen.</h2>
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
