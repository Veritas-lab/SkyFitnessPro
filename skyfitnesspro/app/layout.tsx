import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';  // @/* алиас

export const metadata: Metadata = {
  title: 'SkyFitnessPro',
  description: 'Онлайн-тренировки для занятий дома',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-[#F5F5F5]">
        <div 
          className="mx-auto relative"
          style={{
            width: '1440px',
            minHeight: '1559px',
          }}
        >
          <Header />
          <div style={{ paddingLeft: '140px', paddingRight: '140px', paddingTop: '180px' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}