import { Header, Footer, LeadForm, ChatAssistant } from '../components';

export const metadata = {
  title: 'Lease aanvragen',
  description: 'Vraag vrijblijvend zakelijke lease aan voor een bedrijfswagen, machine of aanhanger.'
};

export default function Page() {
  return (
    <main>
      <Header />
      <section className="vl-contact-hero">
        <div className="vl-shell">
          <span className="vl-kicker">Leaseaanvraag</span>
          <h1>Vertel ons wat je nodig hebt.</h1>
          <p>Heb je al een object gevonden? Plak de link erbij. Nog niet? Omschrijf wat je zoekt, dan nemen we de aanvraag met je door.</p>
        </div>
      </section>
      <section className="vl-contact-section">
        <div className="vl-shell vl-contact-grid">
          <div>
            <LeadForm />
          </div>
          <aside className="vl-contact-aside">
            <span className="vl-kicker">Wat gebeurt hierna?</span>
            <div><b>01</b><span><strong>We controleren je aanvraag</strong><p>We kijken of de belangrijkste gegevens aanwezig zijn.</p></span></div>
            <div><b>02</b><span><strong>We nemen contact op</strong><p>Zo nodig vragen we aanvullende informatie over het object of je onderneming.</p></span></div>
            <div><b>03</b><span><strong>Financieringsbeoordeling</strong><p>Een complete aanvraag wordt beoordeeld op de financieringsmogelijkheden voor het gekozen bedrijfsmiddel.</p></span></div>
            <div className="vl-contact-note"><strong>Nog geen object gevonden?</strong><p>Geen probleem. Kies een categorie en omschrijf wat je zoekt.</p></div>
          </aside>
        </div>
      </section>
      <Footer />
      <ChatAssistant />
    </main>
  );
}