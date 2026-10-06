import { Header, Footer, QuickLead, ChatAssistant, FAQ, MobileSticky, HomeHeroCarousel, AssetIcon } from './components';

const BUS = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-hero-bus-side.webp?v=1791273862';
const MACHINE = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-hero-machine-side.webp?v=1791273868';
const TRAILER = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-hero-trailer-side.webp?v=1791273874';
const BRANDING = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-before-after-bestickering_41b0cc7d-311e-45fa-996e-2c4bc842fb42.png?v=1791198380';

const categories = [
  { href:'/bedrijfswagens/', label:'Bedrijfswagens', text:'Van compacte bestelbus tot bakwagen.', icon:'van' },
  { href:'/aanhangers/', label:'Aanhangers', text:'Voor elke klus de juiste aanhanger.', icon:'trailer' },
  { href:'/machines/', label:'Machines', text:'Bouwmachines en grondverzet.', icon:'machine' },
  { href:'#bestickering', label:'Bestickering', text:'Professionele voertuigbestickering.', icon:'branding' }
];

const popular = [
  { title:'Mercedes-Benz Sprinter', meta:'Bedrijfswagen · voorbeeld', image:BUS, href:'/bedrijfswagens/', note:'Eigen dealer of leverancier' },
  { title:'Volkswagen Transporter', meta:'Bedrijfswagen · voorbeeld', image:BUS, href:'/bedrijfswagens/', note:'Nieuw of gebruikt mogelijk' },
  { title:'Plateau-aanhanger', meta:'Aanhanger · voorbeeld', image:TRAILER, href:'/aanhangers/', note:'Ook bestickering mogelijk' },
  { title:'Minigraver', meta:'Machine · voorbeeld', image:MACHINE, href:'/machines/', note:'Vrije objectkeuze' }
];

export default function Home() {
  return (
    <main className="vl-market-home">
      <Header />
      <HomeHeroCarousel />

      <section className="vl-market-section" id="mogelijkheden">
        <div className="vl-shell">
          <div className="vl-market-title">
            <span>Ons aanbod</span>
            <h2>Lease per categorie</h2>
          </div>
          <div className="vl-market-category-grid">
            {categories.map((item) => (
              <a className="vl-market-category-card" href={item.href} key={item.label}>
                <div className="vl-market-category-icon">
                  {item.icon === 'branding' ? <span>▱</span> : <AssetIcon type={item.icon} />}
                </div>
                <div><h3>{item.label}</h3><p>{item.text}</p></div>
                <b>→</b>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="vl-market-duo">
        <div className="vl-shell vl-market-duo-grid">
          <article className="vl-market-duo-card vl-market-duo-lease">
            <div>
              <span>Direct aan de slag</span>
              <h2>Financial lease aanvragen</h2>
              <p>Start met het object, de aanschafprijs en je contactgegevens. Wij helpen de intake logisch compleet te maken.</p>
              <a href="#quickcheck">Lease aanvragen <b>→</b></a>
              <ul>
                <li>Vrijblijvende eerste intake</li>
                <li>Zelf object en leverancier kiezen</li>
                <li>Eén aanspreekpunt</li>
                <li>Beoordeling door financierende partij</li>
              </ul>
            </div>
            <div className="vl-market-duo-symbol">€</div>
          </article>

          <article className="vl-market-duo-card vl-market-duo-brand" id="bestickering">
            <div>
              <span>Laat je opvallen</span>
              <h2>Bestickering & ontwerpservice</h2>
              <p>Wil je je bedrijfswagen professioneel laten bestickeren? Ontwerpservice en montage kunnen als aanvullende dienst worden aangevraagd.</p>
              <a href="/contact/">Ontdek de mogelijkheden <b>→</b></a>
              <ul>
                <li>Ontwerpservice op aanvraag</li>
                <li>Professionele voertuigfolie</li>
                <li>Geschikt voor verschillende voertuigtypes</li>
                <li>Los van of naast je leaseaanvraag</li>
              </ul>
            </div>
            <img src={BRANDING} alt="VakLease bedrijfswagen met bestickering" loading="lazy" />
          </article>
        </div>
      </section>

      <section className="vl-market-section vl-market-popular">
        <div className="vl-shell">
          <div className="vl-market-title vl-market-title-row">
            <div><span>Uitgelichte voorbeelden</span><h2>Veelgekozen lease-objecten</h2></div>
            <a href="#quickcheck">Object doorgeven →</a>
          </div>
          <div className="vl-market-product-grid">
            {popular.map((item) => (
              <article className="vl-market-product" key={item.title}>
                <a className="vl-market-product-image" href={item.href}>
                  <img src={item.image} alt={item.title} loading="lazy" />
                </a>
                <div className="vl-market-product-body">
                  <span>{item.meta}</span>
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                  <div><strong>Prijs via jouw object</strong><a href={item.href}>→</a></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vl-market-why" id="werkwijze">
        <div className="vl-shell">
          <div className="vl-market-title">
            <span>Jouw partner in financial lease</span>
            <h2>Waarom VakLease?</h2>
          </div>
          <div className="vl-market-why-grid">
            <article><i>01</i><div><h3>Gerichte intake</h3><p>Start met alleen de informatie die nodig is om de aanvraag goed op weg te helpen.</p></div></article>
            <article><i>02</i><div><h3>Objectvrij kiezen</h3><p>Jij kiest zelf merk, dealer, leverancier en object. Nieuw of gebruikt.</p></div></article>
            <article><i>03</i><div><h3>Eén aanspreekpunt</h3><p>VakLease helpt je de aanvraag compleet en overzichtelijk aan te leveren.</p></div></article>
            <article><i>04</i><div><h3>Duidelijk proces</h3><p>De financierende partij beoordeelt het dossier en bepaalt de mogelijkheden.</p></div></article>
          </div>
        </div>
      </section>

      <section className="vl-market-intake" id="quickcheck">
        <div className="vl-shell vl-market-intake-grid">
          <div className="vl-market-intake-copy">
            <span>Vrijblijvende intake</span>
            <h2>Vertel ons wat je wilt leasen.</h2>
            <p>Heb je al iets gevonden? Plak de link. Nog aan het zoeken? Vertel kort wat je nodig hebt.</p>
            <div className="vl-market-intake-proof">
              <b>✓ Bedrijfswagens</b><b>✓ Machines</b><b>✓ Aanhangers</b>
            </div>
          </div>
          <div className="vl-market-intake-card">
            <QuickLead source="homepage-market" compact />
          </div>
        </div>
      </section>

      <FAQ />

      <section className="vl-market-end">
        <div className="vl-shell vl-market-end-inner">
          <div><span>Klaar om te leasen?</span><h2>Stuur je object door en start de intake.</h2></div>
          <a href="#quickcheck">Lease aanvragen →</a>
        </div>
      </section>

      <Footer />
      <ChatAssistant />
      <MobileSticky />
    </main>
  );
}
