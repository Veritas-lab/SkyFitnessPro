import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: 'SkyFitnessPro',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-[#FAFAFA]">
        <Providers>
          <div 
            className="mx-auto relative"
            style={{
              maxWidth: '1440px',
              width: '100%',
              minHeight: '100vh',
            }}
          >
            <div 
              className="relative"
              style={{
                width: '1440px',
                margin: '0 auto',
              }}
            >
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}