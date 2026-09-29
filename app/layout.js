import './globals.css';

export const metadata = {
  title: 'VakLease | Bedrijfswagens voor vakmensen',
  description: 'Financial lease voor zzp’ers en vakmensen. Snel, duidelijk en persoonlijk geregeld.'
};

export default function RootLayout({ children }) {
  return <html lang="nl"><body>{children}</body></html>;
}
