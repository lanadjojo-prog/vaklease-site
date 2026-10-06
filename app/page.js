import { Header, Footer, QuickLead, FAQ } from './components';

const HERO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-bus-exact-reference-4k.webp?v=1791295100';

export default function Home() {
  return (
    <main className="vl-new-home">
      <Header />

      <section className="vl-funnel-hero" id="quickcheck">
        <div className="vl-funnel-hero-media">
          <img src={HERO} alt="Bedrijfswagen zakelijk leasen via VakLease" />
          <div className="vl-funnel-hero-shade" />
        </div>
        <div className="vl-shell vl-funnel-hero-copy">
          <span className="vl-new-kicker">Financial lease voor ondernemers</span>
          <h1>Zakelijke lease <strong>aanvragen?</strong></h1>
          <p>Bedrijfswagen, machine of aanhanger gevonden? Stuur de belangrijkste gegevens door. Geen lange aanvraag en geen eigen voorraad waar je uit moet kiezen.</p>
          <div className="vl-funnel-proof">
            <span>✓ Vrijblijvend aanvragen</span>
            <span>✓ Zelf je object kiezen</span>
            <span>✓ Persoonlijke begeleiding</span>
          </div>
        </div>
      </section>

      <section className="vl-funnel-form-wrap" aria-label="Leaseaanvraag starten">
        <div className="vl-shell">
          <div className="vl-funnel-card">
            <div className="vl-funnel-card-head">
              <span>Start je aanvraag</span>
              <h2>Object gevonden? Stuur het direct door.</h2>
              <p>Kies wat je wilt leasen, plak de objectlink en laat je contactgegevens achter.</p>
            </div>
            <QuickLead defaultCategory="Bedrijfswagen" source="homepage-funnel" />
          </div>
        </div>
      </section>

      <section className="vl-new-process" id="werkwijze">
        <div className="vl-shell">
          <div className="vl-new-process-head">
            <div><span className="vl-new-kicker">Zo werkt het</span><h2>Van object naar <strong>leaseaanvraag.</strong></h2></div>
            <p>Je hoeft niet eerst door een catalogus. Kies zelf je bedrijfswagen, machine of aanhanger en stuur de gegevens naar VakLease.</p>
          </div>
          <div className="vl-new-process-grid">
            <article><b>01</b><span>↗</span><h3>Object kiezen</h3><p>Vind zelf een passend object bij een dealer, leverancier of advertentieplatform.</p></article>
            <article><b>02</b><span>□</span><h3>Gegevens sturen</h3><p>Deel de objectlink, prijs en je contactgegevens. We houden de eerste stap bewust kort.</p></article>
            <article><b>03</b><span>✓</span><h3>Aanvraag begeleiden</h3><p>Wij maken de intake compleet en zetten de aanvraag gericht door richting financiering.</p></article>
          </div>
        </div>
      </section>

      <section className="vl-funnel-types" id="mogelijkheden">
        <div className="vl-shell">
          <div className="vl-section-head">
            <span className="vl-new-kicker">Wat kun je aanvragen?</span>
            <h2>Eén aanvraagroute voor je bedrijf.</h2>
            <p>Dezelfde eenvoudige werkwijze, ongeacht het object dat je nodig hebt.</p>
          </div>
          <div className="vl-funnel-type-grid">
            <a href="/bedrijfswagens/"><b>Bedrijfswagens</b><span>Bestelbussen en zakelijke voertuigen →</span></a>
            <a href="/machines/"><b>Machines</b><span>Bouw-, infra- en werkmaterieel →</span></a>
            <a href="/aanhangers/"><b>Aanhangers</b><span>Open en gesloten aanhangers →</span></a>
          </div>
        </div>
      </section>

      <FAQ title="Veelgestelde vragen over zakelijke lease" />

      <section className="vl-new-final">
        <div className="vl-shell vl-new-final-inner">
          <div><span className="vl-new-kicker">Al iets gevonden?</span><h2>Plak de link.<br/>Wij helpen verder.</h2></div>
          <div><p>Begin met alleen de belangrijkste gegevens. Daarna bespreken we wat er voor jouw aanvraag nog nodig is.</p><a href="#quickcheck">Aanvraag starten <b>→</b></a><small>✓ Vrijblijvend en zonder verplichtingen</small></div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
