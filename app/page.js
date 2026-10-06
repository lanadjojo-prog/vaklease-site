import { Header, Footer, InstantLeaseHero } from './components';

const MACHINE = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-machine-studio-4k.webp?v=1791284854';
const TRAILER = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-trailer-studio-4k.webp?v=1791284862';

export default function Home() {
  return (
    <main className="vl-new-home">
      <Header />
      <InstantLeaseHero />

      <section className="vl-new-process" id="werkwijze">
        <div className="vl-shell">
          <div className="vl-new-process-head">
            <div>
              <span className="vl-new-kicker">Zo werkt het</span>
              <h2>Van aanvraag<br/>naar <strong>aanbod.</strong></h2>
            </div>
            <p>Jij stuurt het object door. Wij maken de aanvraag compleet en leggen hem voor aan passende leasepartners.</p>
          </div>
          <div className="vl-new-process-grid">
            <article><b>01</b><span>↗</span><h3>Aanvraag indienen</h3><p>Plak een objectlink of upload de offerte en vul je KVK-nummer in.</p></article>
            <article><b>02</b><span>◎</span><h3>Wij vergelijken</h3><p>Wij leggen je aanvraag voor aan passende financierende partijen.</p></article>
            <article><b>03</b><span>✓</span><h3>Ontvang je aanbod</h3><p>Bij een complete aanvraag streven we naar duidelijkheid binnen 4 uur.</p></article>
          </div>
        </div>
      </section>

      <section className="vl-new-audience" id="voor-wie">
        <div className="vl-new-audience-media">
          <img src={MACHINE} alt="VakLease machine" />
          <div className="vl-new-audience-overlay">
            <span>Voor ondernemers</span>
            <h2>Voor de mensen die bouwen aan morgen.</h2>
          </div>
        </div>
        <div className="vl-new-audience-copy">
          <span className="vl-new-kicker">Voor wie</span>
          <h2>Gemaakt voor ondernemers in de praktijk.</h2>
          <p>Van bouw en infra tot installatie, groen en logistiek. Jij kiest het object bij je eigen dealer of leverancier. VakLease helpt met de financieringsaanvraag.</p>
          <div className="vl-new-sector-row">
            <span>⌂<small>Bouw</small></span>
            <span>⌁<small>Infra</small></span>
            <span>◇<small>Installatie</small></span>
            <span>⌘<small>Groen</small></span>
            <span>•••<small>Overig</small></span>
          </div>
        </div>
      </section>

      <section className="vl-new-benefits" id="voordelen">
        <div className="vl-shell vl-new-benefits-grid">
          <div className="vl-new-benefit-visual">
            <img src={TRAILER} alt="VakLease aanhanger" />
            <div className="vl-new-floating-card top"><span>Één aanvraag</span><strong>Meerdere leasepartners</strong></div>
            <div className="vl-new-floating-card bottom"><span>Nieuw én gebruikt</span><strong>Jij kiest het object</strong></div>
          </div>
          <div className="vl-new-benefit-copy">
            <span className="vl-new-kicker">Waarom VakLease</span>
            <h2>Meer mogelijkheden.<br/><strong>Minder gedoe.</strong></h2>
            <div className="vl-new-benefit-list">
              <article><i>↗</i><div><b>Eén aanvraag</b><p>Wij regelen de rest met meerdere leasepartners.</p></div></article>
              <article><i>◷</i><div><b>Snel duidelijkheid</b><p>Bij complete aanvragen streven we naar reactie binnen 4 uur.</p></div></article>
              <article><i>□</i><div><b>Vrijblijvend</b><p>Je zit nergens aan vast voordat je akkoord geeft.</p></div></article>
              <article><i>♡</i><div><b>Persoonlijke service</b><p>Direct contact als er iets ontbreekt of verduidelijkt moet worden.</p></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="vl-new-final">
        <div className="vl-shell vl-new-final-inner">
          <div>
            <span className="vl-new-kicker">Klaar om te starten?</span>
            <h2>Vraag vandaag nog<br/>je lease aan.</h2>
          </div>
          <div>
            <p>Plak de link van je object of upload de offerte. Meer is er niet nodig om te starten.</p>
            <a href="#quickcheck">Aanvraag starten <b>→</b></a>
            <small>✓ Vrijblijvend en zonder verplichtingen</small>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
