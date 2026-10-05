import { CategoryPage } from '../components';

export const metadata = {
  title: 'Aanhanger leasen',
  description: 'Zakelijk een aanhanger financieren via VakLease. Vraag lease aan voor onder andere kippers, machinetransporters en gesloten aanhangers.'
};

export default function Page() {
  return <CategoryPage
    category="Aanhangers"
    icon="trailer"
    title="Aanhanger leasen voor meer materieel op iedere klus."
    intro="Een aanhanger is vaak onmisbaar voor materiaal, machines of voertuigen. Via VakLease kun je de financieringsmogelijkheden voor een zakelijke aanhanger laten beoordelen."
    examples={[
      ['Machinetransporter','Voor minigravers, compact materieel en machines.'],
      ['Kipper','Voor bouwmaterialen, groenwerk en grondstoffen.'],
      ['Gesloten aanhanger','Voor gereedschap en materiaal dat droog en veilig mee moet.'],
      ['Autotransporter','Voor zakelijk voertuigtransport en specialistisch gebruik.']
    ]}
    image="https://cdn.shopify.com/s/files/1/0998/2568/0716/files/vaklease-aanhanger-bestickering.png?v=1791187312"
    imageAlt="VakLease aanhanger met bestickering op een industrieterrein"
    benefits={['Gericht op zakelijk gebruik','Object van dealer of leverancier zelf kiezen','Eenvoudig link of offerte meesturen','Eén aanspreekpunt voor de aanvraag']}
  />;
}