import { Header, Footer, QuickLead, FAQ } from './components';

const HERO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-hero-bus-zoomed-4k.webp?v=1791277539';

export default function Home() {
  return (
    <main className="vl-new-home">
      <Header />

      <style>{`\n        @media (max-width: 760px) {\n          .vl-funnel-hero { min-height: 470px; align-items: flex-end; background: #071d3b; }\n          .vl-funnel-hero-media img { object-fit: cover; object-position: 58% center; }\n          .vl-funnel-hero-shade { background: linear-gradient(0deg, rgba(5,23,48,.96) 0%, rgba(5,23,48,.72) 42%, rgba(5,23,48,.16) 78%, rgba(5,23,48,.04) 100%); }\n          .vl-funnel-hero-copy { padding-top: 185px; padding-bottom: 82px; }\n          .vl-funnel-hero-copy .vl-new-kicker { font-size: 9px; letter-spacing: .14em; }\n          .vl-funnel-hero-copy h1 { max-width: 340px; margin: 9px 0 12px; font-size: clamp(34px, 10.5vw, 42px); line-height: 1.02; }\n          .vl-funnel-hero-copy > p { max-width: 355px; margin: 0; font-size: 14px; line-height: 1.48; }\n          .vl-funnel-proof { gap: 7px 13px; margin-top: 16px; font-size: 10.5px; }\n          .vl-funnel-form-wrap { margin-top: -42px; padding-bottom: 48px; }\n          .vl-funnel-card { padding: 19px 15px; border-radius: 18px; box-shadow: 0 18px 45px rgba(8,29,58,.16); }\n          .vl-funnel-card-head { margin-bottom: 16px; }\n          .vl-funnel-card-head h2 { font-size: 25px; line-height: 1.08; }\n          .vl-funnel-card-head p { font-size: 13px; line-height: 1.45; }\n        }\n        @media (max-width: 420px) {\n          .vl-funnel-hero { min-height: 450px; }\n          .vl-funnel-hero-media img { object-position: 60% center; }\n          .vl-funnel-hero-copy { padding-top: 172px; padding-bottom: 76px; }\n          .vl-funnel-proof span { white-space: nowrap; }\n        }\n      `}</style>

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
