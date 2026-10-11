import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LandingMotion } from '@/components/landing/LandingMotion';
import { LandingAuthPortal } from '@/components/landing/LandingAuthPortal';
import { PUBLIC_PRICING, PRICING_CHECKOUT_AVAILABLE } from '@/lib/public-pricing';

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

const features = [
  { icon: '🗓️', title: 'Theo dõi thai kỳ', description: 'Xem tuần thai, các mốc đáng chú ý và theo dõi sự thay đổi cân nặng qua từng giai đoạn.' },
  { icon: '🥗', title: 'Dinh dưỡng & thực đơn', description: 'Tổ chức thực đơn và ghi chú dinh dưỡng để có kế hoạch ăn uống thuận tiện hơn.' },
  { icon: '📋', title: 'Hồ sơ khám thai', description: 'Quản lý hồ sơ và kết quả khám thai tại một nơi để dễ theo dõi và đối chiếu.' },
  { icon: '💗', title: 'Nhật ký cảm xúc', description: 'Ghi lại tâm trạng và những điều muốn lưu giữ trong hành trình làm mẹ.' },
] as const;

const planBenefits = [
  'Theo dõi tuần thai và cân nặng',
  'Công cụ lên kế hoạch dinh dưỡng',
  'Quản lý hồ sơ sức khỏe',
  'Ghi chép hành trình thai kỳ',
] as const;

const faqs = [
  { question: 'PregTap là gì?', answer: 'PregTap là ứng dụng hỗ trợ mẹ bầu theo dõi hành trình thai kỳ, dinh dưỡng, cảm xúc và hồ sơ sức khỏe.' },
  { question: 'Bảng giá Premium có còn hiển thị khi hệ thống bảo trì không?', answer: 'Có. Giá tham khảo được lưu trực tiếp trên trang giới thiệu, không cần kết nối máy chủ. Thanh toán hiện tạm ngưng.' },
  { question: 'PregTap có thay thế bác sĩ không?', answer: 'Không. Thông tin trên ứng dụng chỉ hỗ trợ ghi chép và tham khảo. Vấn đề y khoa cần trao đổi với bác sĩ hoặc nhân viên y tế có chuyên môn.' },
] as const;

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

export default function HomePage() {
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

  return (
    <LandingMotion>
      <a href="#main-heading" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-white focus:p-3">
        Chuyển đến nội dung chính
      </a>
      <header className="sticky top-0 z-50 border-b border-[#FFE1DC] bg-white/95 backdrop-blur-lg">
        <nav aria-label="Điều hướng chính" className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 sm:px-8">
          <Link href="/" aria-label="PregTap - Trang chủ" className="flex items-center gap-2">
            <Image src="/splash_logo_embedded.png" width={48} height={48} alt="" priority className="h-12 w-12 object-contain" />
            <Image src="/pregtap_logo.png" width={144} height={46} alt="PregTap" priority className="h-9 w-auto object-contain" />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-[#63534F] md:flex">
            <a href="#features" className="hover:text-[#E87273]">Tính năng</a>
            <a href="#pricing" className="hover:text-[#E87273]">Bảng giá</a>
            <a href="#faq" className="hover:text-[#E87273]">Câu hỏi thường gặp</a>
          </div>
          <Link href="/?login=true" className="rounded-full bg-[#E9787A] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#CA6266] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CA6266]">
            Đăng nhập
          </Link>
        </nav>
      </header>

      <section aria-labelledby="main-heading" className="relative isolate overflow-hidden bg-linear-to-br from-[#FFF0F1] via-[#FFFAF7] to-[#E9F8F2]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-14 h-70 w-70 rounded-full bg-[#FFC2C5]/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 bottom-4 h-80 w-80 rounded-full bg-[#D0EEDC]/60 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-18 sm:px-8 lg:grid-cols-2 lg:py-25">
          <div className="max-w-2xl">
            <p data-hero-reveal className="inline-flex items-center rounded-full border border-[#F4CFCE] bg-white/80 px-4 py-2 text-sm font-bold text-[#B35C61]">
              🌷 Người bạn đồng hành trong thai kỳ
            </p>
            <h1 data-hero-reveal id="main-heading" className="mt-6 text-5xl leading-[1.12] font-black tracking-tight text-[#402B2A] sm:text-6xl">
              PregTap – Chăm sóc hành trình <span className="text-[#E9787A]">mẹ và bé</span> nhẹ nhàng hơn
            </h1>
            <p data-hero-reveal className="mt-6 max-w-xl text-lg leading-8 text-[#685A55]">
              Từ tuần thai, dinh dưỡng, cân nặng đến những kỷ niệm và hồ sơ khám thai: PregTap giúp mẹ sắp xếp các thông tin quan trọng ở một nơi.
            </p>
            <div data-hero-reveal className="mt-9 flex flex-wrap gap-3">
              <a href="#features" className="inline-flex min-h-12 items-center rounded-full bg-[#E9787A] px-7 py-3 font-bold text-white shadow-lg shadow-[#E9787A]/20 transition-colors hover:bg-[#CA6266]">
                Khám phá tính năng <span aria-hidden="true" className="ml-2">→</span>
              </a>
              <a href="#pricing" className="inline-flex min-h-12 items-center rounded-full border-2 border-[#E9787A] bg-white px-7 py-3 font-bold text-[#B9575C] transition-colors hover:bg-[#FFF0F1]">
                Xem bảng giá
              </a>
            </div>
            <p className="mt-5 text-sm text-[#877570]">Nền tảng hỗ trợ thông tin, không thay thế tư vấn và chẩn đoán y khoa.</p>
          </div>

          <div data-hero-reveal className="relative mx-auto w-full max-w-md">
            <div data-float className="relative rounded-[2.7rem] border-8 border-white bg-white p-6 shadow-[0_30px_90px_rgba(116,64,69,0.17)] ring-1 ring-[#F4D7D5] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#9A7878]">PregTap · Minh họa giao diện</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-[#402B2A]">Hành trình của mẹ</h2>
                </div>
                <Image src="/babyheart.png" width={56} height={56} alt="" className="h-14 w-14 object-contain" />
              </div>
              <div className="mt-6 rounded-3xl bg-linear-to-r from-[#FFF0F1] to-[#FFF7EA] p-6">
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-black text-[#E9787A]">Tuần 24</p>
                  <p className="text-sm font-semibold text-[#8C7470]">trong 40 tuần</p>
                </div>
                <div className="mt-4 h-3 rounded-full bg-white">
                  <div aria-hidden="true" className="h-3 w-3/5 rounded-full bg-[#E9787A]" />
                </div>
                <p className="mt-3 text-sm text-[#795F5C]">Mỗi tuần là một dấu mốc đáng nhớ</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-[#EDFAF4] p-5">
                  <span aria-hidden="true" className="text-2xl">🥑</span>
                  <p className="mt-2 font-bold text-[#365F4D]">Thực đơn</p>
                  <p className="mt-1 text-xs text-[#648171]">Lên kế hoạch theo ngày</p>
                </div>
                <div className="rounded-3xl bg-[#FFF4E5] p-5">
                  <span aria-hidden="true" className="text-2xl">📑</span>
                  <p className="mt-2 font-bold text-[#815B37]">Hồ sơ</p>
                  <p className="mt-1 text-xs text-[#9A7B5A]">Lưu giữ thông tin dễ dàng</p>
                </div>
              </div>
              <p className="mt-5 text-center text-xs text-[#998A86]">Hình minh họa, không phải dữ liệu sức khỏe thực tế.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" aria-labelledby="features-title" className="scroll-mt-25 bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-extrabold tracking-widest text-[#CC7476] uppercase">Khám phá PregTap</p>
            <h2 id="features-title" className="mt-3 text-3xl font-black text-[#402B2A] sm:text-4xl">Những điều mẹ cần, ngay trong một ứng dụng</h2>
            <p className="mt-4 leading-7 text-[#73635F]">Thiết kế dễ sử dụng, giúp hành trình theo dõi thai kỳ rõ ràng và thuận tiện hơn.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article data-reveal key={feature.title} className="rounded-3xl border border-[#F6E4E0] bg-[#FFFBFA] p-7 shadow-[0_12px_30px_rgba(68,39,35,0.04)]">
                <div aria-hidden="true" className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFECEC] text-3xl">{feature.icon}</div>
                <h3 className="text-xl font-bold text-[#402B2A]">{feature.title}</h3>
                <p className="mt-3 leading-7 text-[#71615D]">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-25 bg-linear-to-b from-[#FFF0F1] to-[#FFF8F5] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-extrabold tracking-widest text-[#C76E72] uppercase">PregTap Premium</p>
            <h2 id="pricing-title" className="mt-3 text-3xl font-black text-[#402B2A] sm:text-4xl">Bảng giá PregTap Premium</h2>
            <p className="mt-4 leading-7 text-[#73635F]">Mức giá công bố để mẹ tham khảo và lựa chọn theo nhu cầu.</p>
          </div>

          {!PRICING_CHECKOUT_AVAILABLE && (
            <p role="status" className="mx-auto mb-8 max-w-3xl rounded-xl border border-[#E8CCAA] bg-[#FFF8E7] px-5 py-4 text-center text-sm font-medium leading-6 text-[#775934]">
              Hệ thống đăng ký và thanh toán hiện đang tạm ngưng. Bảng giá bên dưới chỉ để tham khảo, chưa thể mua gói qua website.
            </p>
          )}
          <div className="grid gap-6 lg:grid-cols-3">
            {PUBLIC_PRICING.map((plan) => (
              <article data-reveal key={plan.plan} className="relative flex flex-col rounded-3xl border border-[#F0D7D4] bg-white p-7 shadow-[0_16px_42px_rgba(85,49,48,0.07)]">
                {plan.plan === 'SixMonths' && <span className="absolute -top-3 right-6 rounded-full bg-[#E9787A] px-4 py-1 text-xs font-extrabold text-white">Phổ biến</span>}
                <h3 className="text-xl font-extrabold text-[#402B2A]">{plan.name}</h3>
                <p className="mt-6 text-4xl font-black tracking-tight text-[#E9787A]">{formatPrice(plan.price)} ₫</p>
                <p className="mt-2 text-sm text-[#796A65]">/{plan.durationMonths === 12 ? 'năm' : plan.durationMonths === 6 ? '6 tháng' : 'tháng'}</p>
                <p className="mt-3 border-b border-[#F7E5E1] pb-6 text-sm text-[#796A65]">Tương đương khoảng {formatPrice(plan.pricePerMonth)} ₫/tháng</p>
                <h4 className="mt-6 text-sm font-extrabold text-[#402B2A]">Các công cụ trong hệ sinh thái:</h4>
                <ul className="mt-4 flex-1 space-y-3">
                  {planBenefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3 text-sm leading-6 text-[#665651]">
                      <span aria-hidden="true" className="font-black text-[#45A686]">✓</span>{benefit}
                    </li>
                  ))}
                </ul>
                <span aria-disabled="true" className="mt-8 block cursor-not-allowed rounded-full bg-[#F1E6E3] px-6 py-3 text-center text-sm font-bold text-[#816C67]">Tạm ngưng đăng ký</span>
              </article>
            ))}
          </div>
          <p className="mt-7 text-center text-sm leading-6 text-[#786663]">
            Thông tin gói và quyền lợi cần được xác nhận lại khi dịch vụ thanh toán hoạt động. Xem <Link href="/terms-of-use" className="font-bold underline underline-offset-4">điều khoản sử dụng</Link>.
          </p>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-25 bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div data-reveal className="mb-10 text-center">
            <h2 id="faq-title" className="text-3xl font-black text-[#402B2A] sm:text-4xl">Câu hỏi thường gặp về PregTap</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article key={faq.question} data-reveal className="rounded-2xl border border-[#F2DFDD] p-6">
                <h3 className="text-lg font-bold text-[#402B2A]">{faq.question}</h3>
                <p className="mt-2 leading-7 text-[#70615C]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal className="bg-[#E9787A] px-5 py-15 text-center text-white sm:px-8">
        <h2 className="text-3xl font-black sm:text-4xl">Một hành trình đáng nhớ, từng ngày một</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/90">Khám phá cách PregTap tổ chức thông tin chăm sóc thai kỳ trong một trải nghiệm dễ gần.</p>
        <a href="#features" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-white px-7 py-3 font-bold text-[#A64E52] hover:bg-[#FFF3F1]">
          Tìm hiểu thêm
        </a>
      </section>

      <footer className="bg-[#402B2A] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-3">
          <div>
            <p className="text-2xl font-black">PregTap</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/75">Ứng dụng hỗ trợ theo dõi thai kỳ và lưu giữ hành trình làm mẹ.</p>
          </div>
          <nav aria-label="Liên kết footer" className="flex flex-col items-start gap-3 text-sm text-white/80">
            <a href="#features" className="hover:text-white">Tính năng</a>
            <a href="#pricing" className="hover:text-white">Bảng giá</a>
            <Link href="/privacy-policy" className="hover:text-white">Chính sách bảo mật</Link>
            <Link href="/terms-of-use" className="hover:text-white">Điều khoản sử dụng</Link>
          </nav>
          <div className="text-sm leading-7 text-white/80">
            <p className="font-bold text-white">Liên hệ</p>
            <a href="mailto:support@pregtap.com" className="hover:text-white">support@pregtap.com</a>
            <p>Website chính thức: pregtap.owerhappiness.id.vn</p>
          </div>
        </div>
        <div className="mx-auto mt-9 max-w-7xl border-t border-white/20 pt-6 text-sm text-white/60">© 2026 PregTap. All rights reserved.</div>
      </footer>

      <Suspense fallback={null}><LandingAuthPortal /></Suspense>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandStructuredData).replace(/</g, '\\u003c') }} />
    </LandingMotion>
  );
}
