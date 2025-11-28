import './globals.css';

export const metadata = {
  title: 'PokeReacty - Pokédex',
  description: 'A Next.js Pokédex with search, stats, evolutions and locations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
