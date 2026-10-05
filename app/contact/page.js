import { Header, Footer, LeadForm, ChatAssistant, FAQ, MobileSticky } from '../components';

export const metadata = {
  title: 'Check je zakelijke lease mogelijkheden',
  description: 'Stuur je bedrijfswagen, machine of aanhanger door en laat VakLease je zakelijke leaseaanvraag gericht in gang zetten.'
};

export default function Page() {
  return (
    <main>
      <Header />
      <section className="vl-contact-hero vl-contact-hero-conversion">
        <div className="vl-shell">
          <span className="vl-kicker">Vrijblijvende intake</span>
          <h1>Begin met wat je al weet.</h1>
          <p>Je hoeft nog niet alle documenten klaar te hebben. Stuur eerst het object, de prijs en je contactgegevens. Daarna bespreken we wat er voor jouw situatie nog nodig is.</p>
          <div className="vl-contact-proof">
            <span>✓ Zelf object kiezen</span>
            <span>✓ Ook als je nog zoekt</span>
            <span>✓ Geen goedkeuring vooraf beloofd</span>
          </div>
        </div>
      </section>

      <section className="vl-contact-section">
        <div className="vl-shell vl-contact-grid">
          <div>
            <LeadForm />
          </div>
          <aside className="vl-contact-aside">
            <span className="vl-kicker">Wat gebeurt hierna?</span>
            <div><b>01</b><span><strong>We bekijken de intake</strong><p>We controleren of de object- en contactgegevens voldoende zijn om gericht verder te gaan.</p></span></div>
            <div><b>02</b><span><strong>We bespreken wat nog nodig is</strong><p>Dat kan per ondernemer en per financierende partij verschillen.</p></span></div>
            <div><b>03</b><span><strong>Het dossier gaat naar beoordeling</strong><p>De financierende partij bepaalt uiteindelijk welke mogelijkheden en voorwaarden gelden.</p></span></div>
            <div className="vl-contact-note"><strong>Nog geen object gevonden?</strong><p>Geen probleem. Omschrijf wat je zoekt en we nemen dat mee in de intake.</p></div>
          </aside>
        </div>
      </section>

      <FAQ title="Vragen vóór je een aanvraag indient" />

      <Footer />
      <ChatAssistant />
      <MobileSticky />
    </main>
  );
}
