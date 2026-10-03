import './globals.css';

export const metadata = {
  title: {
    default: 'VakLease | Bedrijfswagens, machines en aanhangers leasen',
    template: '%s | VakLease'
  },
  description: 'Zakelijke financial lease voor vakmensen en ondernemers. Vraag lease aan voor bedrijfswagens, machines en aanhangers.',
  metadataBase: new URL('https://vaklease.nl')
};

export default function RootLayout({ children }) {
  return <html lang="nl"><body>{children}</body></html>;
}