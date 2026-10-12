import type { Metadata } from 'next';
import LegacyLanding from '@/components/landing/LegacyLanding';

const SITE = 'https://pregtap.owerhappiness.id.vn';

export const metadata: Metadata = {
  title: { absolute: 'PregTap (Pregtap) | Ứng dụng theo dõi thai kỳ dành cho mẹ bầu' },
  description: 'PregTap giúp mẹ bầu theo dõi tuần thai, cân nặng, dinh dưỡng, cảm xúc và quản lý hồ sơ khám thai trong một không gian dễ sử dụng.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE,
    locale: 'vi_VN',
    siteName: 'PregTap',
    title: 'PregTap – Đồng hành cùng mẹ trong hành trình thai kỳ',
    description: 'Theo dõi thai kỳ, dinh dưỡng và hồ sơ sức khỏe với PregTap.',
    images: [{ url: '/pregtap_logo.png', alt: 'PregTap' }],
  },
  twitter: { card: 'summary', title: 'PregTap – Ứng dụng theo dõi thai kỳ' },
};

const brandStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': SITE + '/#organization',
      name: 'PregTap',
      url: SITE,
      logo: SITE + '/pregtap_logo.png',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': SITE + '/#application',
      name: 'PregTap',
      alternateName: 'Pregtap',
      url: SITE,
      description: 'Ứng dụng hỗ trợ theo dõi thai kỳ, cân nặng, thực đơn, cảm xúc và hồ sơ khám thai.',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      inLanguage: 'vi-VN',
      publisher: { '@id': SITE + '/#organization' },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <LegacyLanding />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandStructuredData).replace(/</g, '\\u003c') }} />
    </>
  );
}
