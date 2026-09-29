'use client';
import { useEffect } from 'react';

const LOGO = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-logo.png?v=1790680810';
const VAN = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-professionele-bestelwagen.png?v=1790680774';
const WORKER = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-vakman.png?v=1790680782';
const BEFORE_AFTER = 'https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-before-after-bestickering.png?v=1790680791';

const vans = [
  ['Volkswagen Caddy', '€ 389', 'Compact & praktisch'],
  ['Ford Transit Custom', '€ 459', 'Populair bij vakmensen'],
  ['Mercedes-Benz Vito', '€ 529', 'Comfort & ruimte'],
  ['Volkswagen Crafter', '€ 599', 'Voor het grotere werk']
];

export default function Home() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    }), { threshold: .12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main>
      <header className="nav shell">
        <a className="brand image-brand" href="#"><img src={LOGO} alt="VakLease" /></a>
        <nav>
          <a href="#aanbod">Bedrijfswagens</a>
          <a href="#werkwijze">Financial lease</a>
          <a href="#werkwijze">Hoe werkt het?</a>
          <a href="#bestickering">Busbestickering</a>
          <a href="#contact">Klantenservice</a>
        </nav>
        <a className="btn primary small" href="#contact">Offerte aanvragen <span>→</span></a>
      </header>

      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy" data-reveal>
            <span className="eyebrow orange">Voor zzp’ers & vakmensen</span>
            <h1>De bedrijfswagen voor jouw <span>volgende klus.</span></h1>
            <p>Financial lease, ook voor starters. Snel geregeld, zonder gedoe.</p>
            <div className="actions">
              <a className="btn primary" href="#aanbod">Bekijk aanbod <span>→</span></a>
              <a className="btn ghost" href="#werkwijze">Hoe werkt het?</a>
            </div>
            <div className="trust-row">
              <div><b>✓ Zonder jaarcijfers</b><small>Ook voor starters</small></div>
              <div><b>✓ Snel duidelijkheid</b><small>Vaak binnen 24 uur</small></div>
              <div><b>✓ Persoonlijk advies</b><small>Van vakmensen, voor vakmensen</small></div>
            </div>
          </div>

          <div className="visual hero-scene" data-reveal>
            <div className="hero-panel"></div>
            <div className="hero-speed s1"></div>
            <div className="hero-speed s2"></div>
            <div className="hero-speed s3"></div>
            <img className="hero-van" src={VAN} alt="Professionele witte bedrijfswagen" />
            <div className="hero-van-brand" aria-hidden="true"><i></i><strong>Vak</strong><span>Lease</span></div>
            <img className="hero-worker" src={WORKER} alt="Vakman in werkkleding" />
            <div className="hero-worker-brand" aria-hidden="true"><i></i><strong>Vak</strong><span>Lease</span></div>
            <div className="mini-card m1"><strong>24u</strong><span>vaak duidelijkheid</span></div>
            <div className="mini-card m2"><strong>0%</strong><span>grote investering vooraf</span></div>
          </div>
        </div>
      </section>

      <section className="inventory" id="aanbod">
        <div className="shell">
          <div className="section-head" data-reveal>
            <div><span className="eyebrow">Populaire bedrijfswagens</span><h2>Direct uit voorraad leverbaar.</h2></div>
            <a href="#contact">Bekijk alle bedrijfswagens →</a>
          </div>
          <div className="cards">
            {vans.map((v,i)=><article className="vehicle" key={v[0]} data-reveal style={{transitionDelay:`${i*70}ms`}}>
              <div className="vehicle-image"><span className="badge">◉ Snel leverbaar</span><div className="mini-van"><span className="wheel w1"></span><span className="wheel w2"></span></div></div>
              <h3>{v[0]}</h3><p className="muted">Diesel · Automaat</p><p className="muted">{v[2]}</p><small>vanaf</small><div className="price">{v[1]}<span>/mnd</span></div><a className="btn primary wide" href="#contact">Stel samen →</a>
            </article>)}
          </div>
        </div>
      </section>

      <section className="wrap-section" id="bestickering">
        <div className="shell wrap-grid">
          <div className="wrap-visual before-after-card" data-reveal>
            <img src={BEFORE_AFTER} alt="Voor en na busbestickering" />
            <div className="design-pill">✓ Gratis ontwerpvoorstel</div>
          </div>
          <div className="wrap-copy" data-reveal>
            <span className="eyebrow orange">Busbestickering & design</span>
            <h2>Van leasebus naar <span>rijdend visitekaartje.</span></h2>
            <p>Wil je de bus meteen professioneel laten bestickeren? Wij helpen ook met het ontwerp. Van subtiel logo en contactgegevens tot een volledige voertuigwrap.</p>
            <div className="wrap-points">
              <div><b>01</b><span><strong>Ontwerp op maat</strong><small>Passend bij jouw huisstijl en type bus.</small></span></div>
              <div><b>02</b><span><strong>Alles in één traject</strong><small>Lease én uitstraling zonder losse partijen.</small></span></div>
              <div><b>03</b><span><strong>Vrijblijvend voorstel</strong><small>Eerst zien hoe jouw bus eruit kan komen te zien.</small></span></div>
            </div>
            <a className="btn primary" href="#contact">Vraag design + leasevoorstel aan →</a>
          </div>
        </div>
      </section>

      <section className="why" id="werkwijze">
        <div className="shell why-grid">
          <div data-reveal>
            <span className="eyebrow">Waarom VakLease</span>
            <h2>Leasen zoals het hoort. <span>Simpel en persoonlijk.</span></h2>
            <p>Wij helpen vakmensen en ondernemers aan de juiste bedrijfswagen. Zonder gedoe, met heldere voorwaarden en persoonlijk advies.</p>
            <a className="btn primary" href="#contact">Meer over ons →</a>
          </div>
          <div className="benefits">
            {[
              ['€','Geen grote investering','Rijd direct in een nieuwe bedrijfswagen.'],
              ['▤','Ook zonder jaarcijfers','Vaak mogelijk, ook voor starters en zzp’ers.'],
              ['◷','Snel duidelijkheid','Meestal binnen 24 uur een voorstel.'],
              ['◎','Persoonlijk advies','Van vakmensen, voor vakmensen.']
            ].map((b,i)=><div className="benefit" key={b[1]} data-reveal style={{transitionDelay:`${i*70}ms`}}><span className="icon">{b[0]}</span><div><h3>{b[1]}</h3><p>{b[2]}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="cta" id="contact">
        <div className="shell cta-inner" data-reveal>
          <div>
            <span className="eyebrow orange">Klaar voor de volgende klus?</span>
            <h2>Vertel ons wat je zoekt.</h2>
            <p>We denken mee over wagen, looptijd, financiering én bestickering. Vrijblijvend.</p>
          </div>
          <a className="btn orange-btn" href="mailto:info@example.nl">Vraag een voorstel aan →</a>
        </div>
      </section>

      <footer className="shell footer">
        <img className="footer-logo" src={LOGO} alt="VakLease" />
        <span>Financial lease voor zzp’ers en vakmensen.</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}
