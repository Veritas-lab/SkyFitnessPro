import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header/Header';  // @/* алиас
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: 'SkyFitnessPro',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-[#F5F5F5]">
        <Providers>
          <div 
            className="mx-auto relative"
            style={{
              maxWidth: '1440px',
              width: '100%',
              minHeight: '100vh',
            }}
          >
            <Header />
            <div 
              className="px-4 md:px-10 lg:px-[140px] pt-20 md:pt-32 lg:pt-[180px]"
            >
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}