
import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pregtap.owerhappiness.id.vn'),
  title: { default: 'PregTap – Đồng hành cùng mẹ trong thai kỳ', template: '%s | PregTap' },
  description: 'PregTap hỗ trợ theo dõi tuần thai, cân nặng, dinh dưỡng, cảm xúc và hồ sơ sức khỏe thai kỳ.',
  applicationName: 'PregTap',
  keywords: ['PregTap', 'Pregtap', 'ứng dụng theo dõi thai kỳ', 'chăm sóc thai kỳ', 'mẹ bầu'],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: '/splash_logo_embedded.png', apple: '/splash_logo_embedded.png' },
  openGraph: { siteName: 'PregTap', locale: 'vi_VN', type: 'website' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FFF0F1' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={nunito.variable + ' antialiased'}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
