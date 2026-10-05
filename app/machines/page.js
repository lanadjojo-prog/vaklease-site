import { CategoryPage } from '../components';

export const metadata = {
  title: 'Machine leasen',
  description: 'Zakelijke machinefinanciering aanvragen via VakLease. Voor onder andere graafmachines, shovels en andere bedrijfsmachines.'
};

export default function Page() {
  return <CategoryPage
    category="Machines"
    icon="machine"
    title="Machine leasen zonder je werkkapitaal vast te zetten."
    intro="Meer capaciteit nodig voor je bedrijf? VakLease helpt je een financieringsaanvraag te starten voor zakelijke machines die je nodig hebt om het werk uit te voeren."
    examples={[
      ['Graafmachine & minigraver','Voor grondwerk, infra, hoveniers en bouw.'],
      ['Shovel & loader','Voor verplaatsing, terreinwerk en materiaalhandling.'],
      ['Heftruck & hoogwerker','Voor logistiek, montage, magazijn en werken op hoogte.'],
      ['Overige bedrijfsmachines','Stuur het type, de prijs en bij voorkeur een link naar het object.']
    ]}
    image="https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-machines-bestickering.png?v=1791187301"
    imageAlt="VakLease machines met bestickering op een bouwterrein"
    benefits={['Aanvraag op basis van het concrete bedrijfsmiddel','Link of offerte van leverancier meesturen','Geschikt voor uiteenlopende vakbedrijven','VakLease begeleidt de intake richting leasepartner']}
  />;
}