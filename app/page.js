import { Header, Footer, QuickLead, FAQ } from './components';

const HERO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-hero-bus-zoomed-4k.webp?v=1791277539';

export default function Home() {
  return (
    <main className="vl-new-home vl-calm-home">
      <Header />

      <style>{`
        .vl-calm-home .vl-funnel-hero { min-height: 560px; }
        .vl-calm-home .vl-funnel-hero-shade { background: linear-gradient(90deg,rgba(5,23,48,.82) 0%,rgba(5,23,48,.52) 42%,rgba(5,23,48,.08) 72%); }
        .vl-calm-home .vl-funnel-hero-copy { max-width: 1240px; }
        .vl-calm-home .vl-funnel-hero-copy h1 { max-width: 620px; }
        .vl-calm-home .vl-funnel-hero-copy > p { max-width: 560px; }
        .vl-calm-home .vl-funnel-proof { opacity:.92; }
        .vl-calm-home .vl-funnel-card { border:1px solid #e8edf4; box-shadow:0 16px 42px rgba(8,29,58,.10); }
        .vl-calm-home .vl-new-process-grid article,
        .vl-calm-home .vl-funnel-type-grid a { box-shadow:none; border:1px solid #e8edf4; }

        @media (max-width: 760px) {
          .vl-calm-home .vl-funnel-hero {
            min-height: 420px;
            background:#071d3b;
            align-items:flex-end;
          }
          .vl-calm-home .vl-funnel-hero-media img {
            object-fit:cover;
            object-position:58% 48%;
          }
          .vl-calm-home .vl-funnel-hero-shade {
            background:linear-gradient(0deg,rgba(5,23,48,.96) 0%,rgba(5,23,48,.72) 38%,rgba(5,23,48,.14) 72%,rgba(5,23,48,.02) 100%);
          }
          .vl-calm-home .vl-funnel-hero-copy {
            padding-top:190px;
            padding-bottom:64px;
          }
          .vl-calm-home .vl-funnel-hero-copy .vl-new-kicker {
            font-size:9px;
            letter-spacing:.12em;
            opacity:.86;
          }
          .vl-calm-home .vl-funnel-hero-copy h1 {
            max-width:330px;
            margin:8px 0 10px;
            font-size:clamp(31px,9.4vw,38px);
            line-height:1.04;
            letter-spacing:-.035em;
          }
          .vl-calm-home .vl-funnel-hero-copy > p {
            max-width:340px;
            margin:0;
            font-size:13.5px;
            line-height:1.48;
          }
          .vl-calm-home .vl-funnel-proof {
            display:none;
          }
          .vl-calm-home .vl-funnel-form-wrap {
            margin-top:-28px;
            padding-bottom:50px;
          }
          .vl-calm-home .vl-funnel-card {
            padding:20px 16px;
            border-radius:16px;
            box-shadow:0 14px 34px rgba(8,29,58,.10);
          }
          .vl-calm-home .vl-funnel-card-head {
            margin-bottom:16px;
          }
          .vl-calm-home .vl-funnel-card-head > span {
            font-size:10px;
          }
          .vl-calm-home .vl-funnel-card-head h2 {
            font-size:23px;
            line-height:1.1;
            letter-spacing:-.025em;
          }
          .vl-calm-home .vl-funnel-card-head p {
            font-size:13px;
            line-height:1.45;
          }
          .vl-calm-home .vl-new-process,
          .vl-calm-home .vl-funnel-types {
            padding-top:58px;
            padding-bottom:58px;
          }
          .vl-calm-home .vl-new-process-head,
          .vl-calm-home .vl-section-head {
            margin-bottom:26px;
          }
          .vl-calm-home .vl-new-process-grid,
          .vl-calm-home .vl-funnel-type-grid {
            gap:12px;
          }
        }
        @media (max-width: 420px) {
          .vl-calm-home .vl-funnel-hero { min-height:400px; }
          .vl-calm-home .vl-funnel-hero-media img { object-position:60% 48%; }
          .vl-calm-home .vl-funnel-hero-copy { padding-top:178px; padding-bottom:58px; }
        }
      `}</style>

      <section className="vl-funnel-hero" id="quickcheck">
        <div className="vl-funnel-hero-media">
          <img src={HERO} alt="Bedrijfswagen zakelijk leasen via VakLease" />
          <div className="vl-funnel-hero-shade" />
        </div>
        <div className="vl-shell vl-funnel-hero-copy">
          <span className="vl-new-kicker">Financial lease voor ondernemers</span>
          <h1>Zakelijke lease <strong>aanvragen?</strong></h1>
          <p>Bedrijfswagen, machine of aanhanger gevonden? Stuur de gegevens door. Wij helpen je persoonlijk verder met de aanvraag.</p>
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
              <h2>Object gevonden? Stuur het door.</h2>
              <p>Kies wat je wilt leasen, voeg de objectlink toe en laat je contactgegevens achter.</p>
            </div>
            <QuickLead defaultCategory="Bedrijfswagen" source="homepage-funnel" />
          </div>
        </div>
      </section>

      <section className="vl-new-process" id="werkwijze">
        <div className="vl-shell">
          <div className="vl-new-process-head">
            <div><span className="vl-new-kicker">Zo werkt het</span><h2>Van object naar <strong>leaseaanvraag.</strong></h2></div>
            <p>Je kiest zelf het object. VakLease helpt je daarna met een heldere, persoonlijke aanvraag.</p>
          </div>
          <div className="vl-new-process-grid">
            <article><b>01</b><span>↗</span><h3>Object kiezen</h3><p>Vind een passend object bij een dealer, leverancier of advertentieplatform.</p></article>
            <article><b>02</b><span>□</span><h3>Gegevens sturen</h3><p>Deel de objectlink, prijs en je contactgegevens.</p></article>
            <article><b>03</b><span>✓</span><h3>Aanvraag begeleiden</h3><p>Wij maken de intake compleet en begeleiden de aanvraag richting financiering.</p></article>
          </div>
        </div>
      </section>

      <section className="vl-funnel-types" id="mogelijkheden">
        <div className="vl-shell">
          <div className="vl-section-head">
            <span className="vl-new-kicker">Wat kun je aanvragen?</span>
            <h2>Zakelijke lease voor wat je bedrijf nodig heeft.</h2>
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
          <div><span className="vl-new-kicker">Al iets gevonden?</span><h2>Stuur het door.<br/>Wij helpen verder.</h2></div>
          <div><p>Begin met de belangrijkste gegevens. Daarna bespreken we persoonlijk wat er nog nodig is.</p><a href="#quickcheck">Aanvraag starten <b>→</b></a><small>✓ Vrijblijvend en zonder verplichtingen</small></div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
