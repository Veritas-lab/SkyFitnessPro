import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';  // @/* алиас

export const metadata: Metadata = {
  title: 'SkyFitnessPro',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}