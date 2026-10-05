import { CategoryPage } from '../components';

export const metadata = {
  title: 'Bedrijfswagen leasen',
  description: 'Zakelijk een bedrijfswagen leasen via VakLease. Kies zelf je bestelbus en stuur de link mee met je aanvraag.'
};

export default function Page() {
  return <CategoryPage
    category="Bedrijfswagens"
    icon="van"
    title="Bedrijfswagen leasen voor jouw volgende klus."
    intro="Heb je een bestelbus gevonden bij een dealer of leverancier? Stuur de link naar VakLease. Wij helpen je de zakelijke leaseaanvraag overzichtelijk in gang te zetten."
    examples={[
      ['Compacte bestelbus','Handig voor service, montage en stedelijk werk.'],
      ['Middelgrote bestelbus','De allround keuze voor gereedschap en materiaal.'],
      ['Grote bestelbus','Extra laadruimte voor grotere klussen en teams.'],
      ['Gebruikte bedrijfswagen','Ook een occasion kan interessant zijn voor zakelijke financiering.']
    ]}
    image="https://images.unsplash.com/photo-1780490103753-378c2f39ae7a?auto=format&fit=crop&fm=jpg&q=84&w=1600"
    imageAlt="Witte bedrijfswagen in Amsterdam"
    benefits={['Je kiest zelf merk, model en leverancier','Nieuw of gebruikt bespreekbaar','Eén intake in plaats van losse financieringsvragen','Direct de objectlink meesturen']}
  />;
}