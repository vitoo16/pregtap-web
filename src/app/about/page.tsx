import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/LandingHeader';

const SITE = 'https://pregtap.owerhappiness.id.vn';

export const metadata: Metadata = {
  title: 'Về chúng tôi - PregTap',
  description: 'Tìm hiểu về PregTap, sản phẩm của Owerhappiness: công ty thành lập năm 2024 và PregTap ra đời năm 2026.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'website',
    url: SITE + '/about',
    locale: 'vi_VN',
    siteName: 'PregTap',
    title: 'Về chúng tôi - PregTap',
    description: 'PregTap là sản phẩm thuộc Owerhappiness, được thành lập năm 2024. PregTap ra đời năm 2026.',
    images: [{ url: '/pregtap_logo.png', alt: 'PregTap' }],
  },
};

const productAreas = [
  {
    icon: '♡',
    title: 'Theo dõi thai kỳ',
    description: 'Ghi lại tuần thai, các mốc phát triển và cân nặng để những thay đổi được sắp xếp dễ theo dõi.',
    color: 'bg-[#FFF0F1] text-[#D56F72]',
  },
  {
    icon: '✳',
    title: 'Dinh dưỡng',
    description: 'Lên kế hoạch thực đơn và lưu ghi chú dinh dưỡng trong hành trình chăm sóc thai kỳ.',
    color: 'bg-[#E9F7F1] text-[#438F74]',
  },
  {
    icon: '▤',
    title: 'Hồ sơ sức khỏe',
    description: 'Lưu hồ sơ và kết quả khám thai tại một nơi để tiện xem lại khi cần.',
    color: 'bg-[#FFF7E5] text-[#A77837]',
  },
  {
    icon: '☼',
    title: 'Nhật ký cảm xúc',
    description: 'Ghi lại tâm trạng và những điều đáng nhớ qua từng ngày.',
    color: 'bg-[#F4EEFA] text-[#8265A1]',
  },
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#3E2723]">
      <LandingHeader isAboutPage />

      <section aria-labelledby="about-title" className="relative isolate overflow-hidden bg-linear-to-br from-[#FFF0F1] via-[#FFFAF7] to-[#E9F8F2]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#FFC2C5]/35 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#D0EEDC]/55 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-18 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pb-25 lg:pt-36">
          <div>
            <p className="inline-flex items-center rounded-full border border-[#F4CFCE] bg-white/80 px-4 py-2 text-sm font-bold text-[#B35C61]">
              Về chúng tôi
            </p>
            <h1 id="about-title" className="mt-6 max-w-3xl text-5xl leading-[1.1] font-black tracking-tight text-[#402B2A] sm:text-6xl lg:text-7xl">
              PregTap bắt đầu từ một công ty mang tên Owerhappiness.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#685A55]">
              Owerhappiness được thành lập năm 2024. Hai năm sau, PregTap ra đời — một sản phẩm của công ty, tập trung vào việc đồng hành và sắp xếp thông tin trong hành trình thai kỳ.
            </p>
            <a href="#company" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#E9787A] px-7 py-3 font-bold text-white shadow-lg shadow-[#E9787A]/20 transition-colors hover:bg-[#CA6266] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CA6266]">
              Tìm hiểu câu chuyện
              <span aria-hidden="true" className="ml-2">↓</span>
            </a>
          </div>

          <div aria-label="PregTap là sản phẩm thuộc Owerhappiness" className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-x-10 top-8 h-72 rounded-full bg-white/60 blur-2xl" />
            <div className="relative rounded-[2.5rem] border border-white/90 bg-white/75 p-6 shadow-[0_30px_90px_rgba(116,64,69,0.12)] backdrop-blur sm:p-9">
              <div className="flex items-center gap-4 rounded-3xl bg-[#FFF8F6] p-5 sm:p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <span className="text-2xl font-black tracking-tight text-[#57413F]">O</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#9A7878]">Công ty</p>
                  <p className="mt-1 text-xl font-extrabold text-[#402B2A]">Owerhappiness</p>
                </div>
                <span className="ml-auto rounded-full bg-[#FFE8E6] px-3 py-1 text-sm font-bold text-[#B35C61]">2024</span>
              </div>
              <div aria-hidden="true" className="flex h-16 items-center justify-center">
                <div className="h-full border-l-2 border-dashed border-[#E7B8B5]" />
              </div>
              <div className="flex items-center gap-4 rounded-3xl bg-[#F0F8F4] p-5 sm:p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image src="/splash_logo_embedded.png" width={42} height={42} alt="" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#729584]">Sản phẩm</p>
                  <p className="mt-1 text-xl font-extrabold text-[#402B2A]">PregTap</p>
                </div>
                <span className="ml-auto rounded-full bg-[#DDF1E7] px-3 py-1 text-sm font-bold text-[#438F74]">2026</span>
              </div>
              <p className="mt-6 text-center text-sm leading-6 text-[#796A65]">
                Một công ty. Một sản phẩm được phát triển để hỗ trợ hành trình thai kỳ.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="company" aria-labelledby="company-title" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-sm font-extrabold tracking-widest text-[#CC7476] uppercase">Công ty đứng sau PregTap</p>
            <h2 id="company-title" className="mt-3 max-w-xl text-3xl font-black text-[#402B2A] sm:text-4xl">
              Owerhappiness, thành lập năm 2024.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-[#73635F] sm:text-lg">
            <p>
              Owerhappiness là công ty nơi PregTap được hình thành và phát triển. Mối liên hệ này là phần cốt lõi trong câu chuyện của PregTap: đây không phải một thương hiệu tách rời, mà là sản phẩm thuộc Owerhappiness.
            </p>
            <p>
              Từ năm thành lập công ty đến khi PregTap ra đời là hai dấu mốc riêng biệt. Năm 2024 đánh dấu sự hình thành của Owerhappiness; năm 2026 đánh dấu thời điểm PregTap xuất hiện với vai trò một sản phẩm trong hệ sinh thái của công ty.
            </p>
          </div>
        </div>
      </section>

      <section id="pregtap" aria-labelledby="pregtap-title" className="scroll-mt-24 bg-[#FFF8F6] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-end md:gap-16">
            <div>
              <p className="text-sm font-extrabold tracking-widest text-[#CC7476] uppercase">Sản phẩm ra đời năm 2026</p>
              <h2 id="pregtap-title" className="mt-3 max-w-2xl text-3xl font-black text-[#402B2A] sm:text-4xl">
                PregTap gom những điều mẹ muốn theo dõi vào cùng một nơi.
              </h2>
            </div>
            <p className="leading-7 text-[#73635F]">
              Ứng dụng được xây dựng xoay quanh các nhu cầu đã có trong hành trình thai kỳ: theo dõi thay đổi, sắp xếp ghi chép và lưu lại những thông tin hữu ích để xem lại khi cần.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {productAreas.map((area) => (
              <article key={area.title} className="rounded-3xl border border-[#F3E4E0] bg-white p-6">
                <div aria-hidden="true" className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold ${area.color}`}>
                  {area.icon}
                </div>
                <h3 className="text-lg font-extrabold text-[#402B2A]">{area.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#71615D]">{area.description}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-[#877570]">
            PregTap hỗ trợ ghi chép và tham khảo; ứng dụng không thay thế tư vấn hoặc chẩn đoán y khoa.
          </p>
        </div>
      </section>

      <section id="journey" aria-labelledby="journey-title" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold tracking-widest text-[#CC7476] uppercase">Từ công ty đến sản phẩm</p>
            <h2 id="journey-title" className="mt-3 text-3xl font-black text-[#402B2A] sm:text-4xl">
              Hai cột mốc, một câu chuyện phát triển.
            </h2>
            <p className="mt-4 leading-7 text-[#73635F]">
              Owerhappiness có trước; PregTap ra đời sau với tư cách sản phẩm thuộc công ty. Hai năm này giúp phân biệt rõ thời điểm thành lập doanh nghiệp và thời điểm sản phẩm bắt đầu.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12">
            <article className="relative overflow-hidden rounded-3xl bg-[#FFF0F1] p-7 sm:p-9">
              <div aria-hidden="true" className="absolute -right-6 -top-12 text-[10rem] leading-none font-black text-[#E9787A]/10">24</div>
              <p className="relative text-5xl font-black tracking-tight text-[#D56F72] sm:text-6xl">2024</p>
              <h3 className="relative mt-5 text-xl font-extrabold text-[#402B2A]">Owerhappiness được thành lập</h3>
              <p className="relative mt-3 max-w-lg leading-7 text-[#73635F]">
                Đây là mốc khởi đầu của công ty đứng sau PregTap — nền tảng để phát triển sản phẩm trong những năm tiếp theo.
              </p>
            </article>
            <article className="relative overflow-hidden rounded-3xl bg-[#E9F8F2] p-7 sm:p-9">
              <div aria-hidden="true" className="absolute -right-6 -top-12 text-[10rem] leading-none font-black text-[#56A88A]/10">26</div>
              <p className="relative text-5xl font-black tracking-tight text-[#438F74] sm:text-6xl">2026</p>
              <h3 className="relative mt-5 text-xl font-extrabold text-[#402B2A]">PregTap ra đời</h3>
              <p className="relative mt-3 max-w-lg leading-7 text-[#73635F]">
                PregTap xuất hiện với vai trò một sản phẩm thuộc Owerhappiness, tập trung vào việc theo dõi thai kỳ và quản lý thông tin liên quan.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-5 py-16 text-center text-white sm:px-8 lg:py-20">
        <h2 className="text-3xl font-black sm:text-4xl">Tìm hiểu PregTap từ trang chủ</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/90">
          Xem thêm về các tính năng và cách PregTap hỗ trợ việc sắp xếp thông tin trong thai kỳ.
        </p>
        <Link href="/#features" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-white px-7 py-3 font-bold text-[#A64E52] transition-colors hover:bg-[#FFF3F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          Khám phá tính năng
        </Link>
      </section>

      <footer className="bg-[#402B2A] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-black">PregTap</p>
            <p className="mt-2 text-sm text-white/70">Sản phẩm thuộc Owerhappiness · Ra đời năm 2026</p>
          </div>
          <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
            <Link href="/" className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Trang chủ</Link>
            <Link href="/privacy-policy" className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Chính sách bảo mật</Link>
            <Link href="/terms-of-use" className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Điều khoản sử dụng</Link>
          </nav>
        </div>
        <div className="mx-auto mt-7 max-w-7xl border-t border-white/20 pt-5 text-xs text-white/55">
          © 2026 PregTap. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
