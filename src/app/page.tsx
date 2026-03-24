'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';

import { AuthModal } from '@/components/auth-modal';
import { ToastNotice } from '@/components/toast-notice';
import { type ApiResponse, type AuthResponse, type AuthUser } from '@/lib/auth';
import {
  extractSubscriptionStatus,
  formatCurrencyVnd,
  getPlanLabel,
  type PurchaseSubscriptionResponse,
  type SubscriptionPlan,
  type SubscriptionPlanCode,
  type SubscriptionStatus,
} from '@/lib/subscription';

// Icons as SVG components

const MenuIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
);

const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const UploadIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const ChartIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);

const FoodIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const DocumentIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const SmileIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

// Animation variants
import { Variants } from 'framer-motion';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

type AuthMode = 'login' | 'register';

function getDisplayName(user: AuthUser | null) {
  if (!user) {
    return 'mẹ bầu';
  }

  return user.fullName?.trim() || user.email?.trim() || user.phone?.trim() || 'mẹ bầu';
}

function getUserInitial(user: AuthUser | null) {
  const displayName = getDisplayName(user).trim();

  return displayName.charAt(0).toUpperCase();
}

// Feature data
const features = [
  {
    id: 1,
    title: "Theo dõi thai kỳ & Cân nặng",
    description: "Theo dõi sự phát triển của bé cùng cân nặng mẹ với biểu đồ trực quan, so sánh với tiêu chuẩn WHO.",
    icon: ChartIcon,
    color: "bg-[#FF9690]",
    bgGradient: "from-[#FFEBEE] to-[#FFF3E0]",
    mockupContent: (
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#757575]">Tuần 24</span>
          <span className="text-xs text-[#999]">Tháng 6</span>
        </div>
        <div className="flex items-end gap-1 h-20">
          {[35, 40, 45, 52, 55, 58, 62, 65, 68, 72].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex-1 bg-linear-to-t from-[#FF9690] to-[#FFC0C0] rounded-t-sm"
            />
          ))}
        </div>
        <div className="mt-2 text-center text-xs text-[#757575]">+3.2 kg</div>
      </div>
    )
  },
  {
    id: 2,
    title: "Thực đơn AI",
    description: "Meal planner thông minh với thực đơn hàng ngày đầy đủ dinh dưỡng, phù hợp từng giai đoạn thai kỳ.",
    icon: FoodIcon,
    color: "bg-[#B8E6D4]",
    bgGradient: "from-[#E0F2F1] to-[#B8E6D4]/30",
    mockupContent: (
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="text-xs text-[#8FD4BC] font-semibold mb-2">HÔM NAY</div>
        <div className="space-y-1.5">
          {['Sáng: Bánh mì trứng + sữa', 'Trưa: Cá hồi + rau củ', 'Chiều: Trái cây + yogurt', 'Tối: Gà xào + cơm'].map((meal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-xs"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#B8E6D4]" />
              <span className="text-[#3E2723]">{meal}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-xs">
          <span className="text-[#999]">1200 kcal</span>
          <span className="text-[#8FD4BC] font-medium">Đạm: 45g</span>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Số hóa hồ sơ y tế",
    description: "Tải lên và lưu trữ hồ sơ khám thai, kết quả siêu âm an toàn với công nghệ OCR thông minh.",
    icon: DocumentIcon,
    color: "bg-[#FFD700]",
    bgGradient: "from-[#FFF8E1] to-[#FFF3B0]",
    mockupContent: (
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-[#FFD700]/50 rounded-xl p-3 text-center cursor-pointer"
        >
          <UploadIcon className="w-6 h-6 mx-auto text-[#FFD700] mb-1.5" />
          <span className="text-xs text-[#757575]">Kéo thả file vào đây</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-3 flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-[#FFF3B0] rounded-lg flex items-center justify-center">
            <DocumentIcon className="w-4 h-4 text-[#F57F17]" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-[#3E2723]">sieulam_24w.pdf</div>
            <div className="text-xs text-[#999]">Đã tải lên</div>
          </div>
          <CheckIcon className="w-4 h-4 text-green-500" />
        </motion.div>
      </div>
    )
  },
  {
    id: 4,
    title: "Chăm sóc cảm xúc",
    description: "Theo dõi tâm trạng hàng ngày với biểu tượng cảm xúc độc đáo. Nhận gợi ý chăm sóc tinh thần phù hợp.",
    icon: SmileIcon,
    color: "bg-[#FFC0C0]",
    bgGradient: "from-[#FFEBEE] to-[#FFEBEE]",
    mockupContent: (
      <div className="bg-white rounded-2xl p-4 shadow-md">
        <div className="text-xs text-[#757575] mb-3">Hôm nay bạn cảm thấy thế nào?</div>
        <div className="flex justify-center gap-2 mb-4">
          {[
            { src: '/moods/happy_blink.png', label: 'Vui' },
            { src: '/moods/surprised_blink.png', label: 'Bình thường' },
            { src: '/moods/sad_blink.png', label: 'Buồn' },
            { src: '/moods/tired_blink.png', label: 'Mệt' },
            { src: '/moods/angry_blink.png', label: 'Nghén' },
            { src: '/moods/anxious_blink.png', label: 'Lo lắng' }
          ].map((mood, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${i === 0 ? 'ring-2 ring-[#FF9690] ring-offset-2' : 'bg-gray-50'}`}
            >
              <img src={mood.src} alt={mood.label} className="w-8 h-8 object-contain" />
            </motion.button>
          ))}
        </div>
        <div className="text-center">
          <motion.span
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="text-xs bg-linear-to-r from-[#FF9690] to-[#FFC0C0] text-white px-3 py-1 rounded-full"
          >
            Đã ghi nhận hôm nay
          </motion.span>
        </div>
      </div>
    )
  }
];

const premiumPlanContent: Record<SubscriptionPlanCode, {
  blurb: string;
  cta: string;
  features: string[];
  popular: boolean;
}> = {
  Monthly: {
    blurb: 'Phù hợp để trải nghiệm nhanh toàn bộ hệ sinh thái PregTap.',
    cta: 'Mua gói 1 tháng',
    features: [
      'Toàn bộ tính năng theo dõi thai kỳ',
      'Thực đơn dinh dưỡng cá nhân hóa',
      'Lưu hồ sơ y tế không giới hạn',
      'Nhắc lịch khám và uống vitamin',
    ],
    popular: false,
  },
  SixMonths: {
    blurb: 'Lựa chọn cân bằng chi phí và thời gian đồng hành trong thai kỳ.',
    cta: 'Mua gói 6 tháng',
    features: [
      'Toàn bộ tính năng của gói 1 tháng',
      'Theo dõi xuyên suốt tam cá nguyệt',
      'Ưu tiên hỗ trợ khi cần tư vấn',
      'Tổng hợp tiến trình thai kỳ theo mốc',
      'Gợi ý chăm sóc cảm xúc cá nhân hóa',
    ],
    popular: true,
  },
  Yearly: {
    blurb: 'Tối ưu nhất nếu bạn muốn sử dụng dài hạn và lưu trữ đầy đủ dữ liệu.',
    cta: 'Mua gói 1 năm',
    features: [
      'Toàn bộ tính năng của gói 6 tháng',
      'Đồng hành dài hạn trước và sau sinh',
      'Thực đơn AI cá nhân hóa',
      'Không giới hạn hồ sơ y tế',
      'Xuất dữ liệu PDF',
      'Phù hợp cho nhu cầu sử dụng lâu dài',
    ],
    popular: false,
  },
};

const premiumPlanOrder: SubscriptionPlanCode[] = ['Monthly', 'SixMonths', 'Yearly'];

// Animated Section component
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated Card component
function AnimatedCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Navigation
function Header({
  authUser,
  isLoggingOut,
  onLoginClick,
  onLogout,
  onRegisterClick,
}: {
  authUser: AuthUser | null;
  isLoggingOut: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onRegisterClick: () => void;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = getDisplayName(authUser);
  const userInitial = getUserInitial(authUser);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="/splash_logo_embedded.png"
              alt="PregTap"
              className="h-auto w-16 object-contain"
            />
            <img
              src="/pregtap_logo.png"
              alt="PregTap"
              className="h-8 w-auto object-contain"
            />
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {['Tính năng', 'Gói Premium', 'Chuyên gia'].map((item) => (
              <motion.a
                key={item}
                href={`#${item === 'Tính năng' ? 'features' : item === 'Gói Premium' ? 'premium' : 'experts'}`}
                className="text-[#757575] hover:text-[#FF9690] font-medium transition-colors text-sm"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {authUser ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-full border border-[#FF9690]/20 bg-white/90 px-3 py-2 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#FF9690] to-[#FFC0C0] text-sm font-extrabold text-white shadow-sm">
                    {authUser?.avatarUrl ? (
                      <img src={authUser.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-sm font-bold text-[#3E2723]">{displayName}</div>
                  </div>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="px-5 py-2 text-sm font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[25px] hover:bg-[#FF9690]/10 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLoginClick}
                  className="px-5 py-2 text-sm font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[25px] hover:bg-[#FF9690]/10 transition-colors"
                >
                  Đăng nhập
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(255,150,144,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRegisterClick}
                  className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#FF9690] to-[#FF7A74] rounded-[25px]"
                >
                  Đăng ký ngay
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-[#3E2723]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-[#757575] font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Tính năng</a>
                <a href="#premium" className="text-[#757575] font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Gói Premium</a>
                <a href="#experts" className="text-[#757575] font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Chuyên gia</a>
                <div className="flex flex-col gap-3 pt-2">
                  {authUser ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm transition-colors hover:bg-white"
                      >
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#FF9690] to-[#FFC0C0] text-sm font-extrabold text-white shadow-sm">
                          {authUser?.avatarUrl ? (
                            <img src={authUser.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                          ) : (
                            userInitial
                          )}
                        </div>
                        <div className="text-left leading-tight">
                          <div className="text-sm font-bold text-[#3E2723]">{displayName}</div>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLogout();
                        }}
                        disabled={isLoggingOut}
                        className="w-full py-2.5 text-sm font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[25px] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onLoginClick();
                        }}
                        className="w-full py-2.5 text-sm font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[25px]"
                      >
                        Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onRegisterClick();
                        }}
                        className="w-full py-2.5 text-sm font-semibold text-white bg-linear-to-r from-[#FF9690] to-[#FF7A74] rounded-[25px]"
                      >
                        Đăng ký ngay
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// Hero Section
function Hero({
  authUser,
  onExploreFeatures,
  onPrimaryAction,
}: {
  authUser: AuthUser | null;
  onExploreFeatures: () => void;
  onPrimaryAction: () => void;
}) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const displayName = getDisplayName(authUser);
  const userInitial = getUserInitial(authUser);

  return (
    <section className="relative overflow-hidden pt-24">
      <div className="absolute inset-0 bg-linear-to-b from-[#FFF1F2] via-[#FFF9F6] to-[#FFF4F2]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(255,190,194,0.28),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(255,226,198,0.28),transparent_26%),radial-gradient(circle_at_75%_72%,rgba(223,241,238,0.38),transparent_24%)]" />
      <motion.div
        style={{ y: y1 }}
        className="absolute -left-8 top-24 h-72 w-72 rounded-full bg-[#FFC8C8]/45 blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute right-0 top-28 h-80 w-80 rounded-full bg-[#FFE8D2]/45 blur-3xl"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute bottom-12 left-1/2 hidden h-52 w-52 -translate-x-1/2 rounded-full bg-[#DFF1EE]/55 blur-3xl lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-18 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm text-[#7A6C68] shadow-[0_8px_24px_rgba(62,39,35,0.06)] backdrop-blur-sm"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF9690]" />
              Dành cho mẹ bầu yêu cảm giác dịu dàng nhưng rõ ràng
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7 }}
              className="mt-7 text-5xl font-black leading-[1.03] tracking-[-0.045em] text-[#3E2723] sm:text-6xl lg:text-[5.6rem]"
            >
              Dịu dàng với mắt nhìn,
              <span className="mt-2 block text-[#FF9690]">ấm áp với cảm xúc</span>
              <span className="mt-2 block">và gọn gàng cho mẹ bầu</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="mt-7 max-w-lg text-[1.04rem] leading-8 text-[#776B68]"
            >
              PregTap giúp bạn theo dõi thai kỳ, dinh dưỡng, cảm xúc và hồ sơ sức khỏe trong một không gian nhẹ nhàng, nữ tính, dễ chịu và đủ chỉn chu để luôn thấy an tâm mỗi lần mở lên.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {['Theo dõi tuần thai', 'Meal plan nhẹ nhàng', 'Hồ sơ cá nhân xinh gọn'].map((item) => (
                <div key={item} className="rounded-full bg-white/82 px-4 py-2 text-sm font-semibold text-[#6F6360] shadow-[0_8px_20px_rgba(62,39,35,0.05)] ring-1 ring-white/70 backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 14px 28px rgba(255,150,144,0.28)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onPrimaryAction}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(255,150,144,0.25)]"
              >
                <span>{authUser ? 'Tiếp tục trải nghiệm' : 'Bắt đầu miễn phí'}</span>
                <span>→</span>
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExploreFeatures}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#F1C6C2] bg-white/76 px-7 py-3.5 text-sm font-bold text-[#A05D58] shadow-[0_8px_20px_rgba(62,39,35,0.05)]"
              >
                <span>Khám phá tính năng</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="mt-10 grid grid-cols-3 gap-4"
            >
              {[
                { value: '50K+', label: 'mẹ bầu tin tưởng' },
                { value: '4.9', label: 'đánh giá yêu thích' },
                { value: '24/7', label: 'một chạm là xem được' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[26px] bg-white/72 px-4 py-4 shadow-[0_10px_24px_rgba(62,39,35,0.05)] ring-1 ring-white/75 backdrop-blur-sm">
                  <div className="text-2xl font-black text-[#3E2723]">{stat.value}</div>
                  <div className="mt-1 text-xs leading-5 text-[#7A6E6B]">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {authUser ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 inline-flex max-w-full items-center gap-3 rounded-full bg-white/82 px-4 py-2.5 text-sm text-[#4E403D] shadow-[0_10px_24px_rgba(62,39,35,0.05)] ring-1 ring-white/75"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#FF9690] to-[#FFC7C1] text-xs font-extrabold text-white">
                  {userInitial}
                </span>
                Chào {displayName}, mọi thứ hôm nay đã được sắp sẵn thật dịu dàng cho bạn.
              </motion.div>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.14 }}
            className="relative mx-auto w-full max-w-170"
          >
            <div className="absolute inset-x-8 top-8 h-[84%] rounded-[42px] bg-white/45 blur-3xl" />

            <motion.div
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-[42px] border border-white/80 bg-white/84 p-5 shadow-[0_26px_60px_rgba(62,39,35,0.12)] backdrop-blur-xl lg:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-30 bg-linear-to-r from-[#FFF1EF] via-[#FFF8F5] to-[#EEF8F4]" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C79B97]">PregTap diary</div>
                  <div className="mt-3 text-[2rem] font-black leading-none text-[#3E2723]">Một góc rất riêng của mẹ</div>
                  <div className="mt-2 text-sm text-[#776B68]">Mềm mại, dễ nhìn và luôn nhắc đúng điều bạn cần.</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-[#FF9690] to-[#FFC7C1] text-sm font-extrabold text-white shadow-md">
                  {userInitial}
                </div>
              </div>

              <div className="relative mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-4xl bg-linear-to-br from-[#FFF8F7] to-[#FFF1ED] p-5">
                  <div className="rounded-[28px] bg-white/82 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[#A69490]">Thai kỳ hiện tại</div>
                        <div className="mt-1 text-3xl font-black text-[#3E2723]">Tuần 24</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#A69490]">Còn lại</div>
                        <div className="mt-1 text-lg font-black text-[#FF7A74]">112 ngày nữa</div>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#F5DFDC]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 1, delay: 0.55 }}
                        className="h-full rounded-full bg-linear-to-r from-[#FF9690] to-[#FFC8B7]"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#9A8B88]">
                      <span>Tuần 1</span>
                      <span>Hành trình đang rất ổn</span>
                      <span>Tuần 40</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-[#DFF1EE] p-4">
                      <div className="text-xs text-[#5D7C74]">Cân nặng mẹ</div>
                      <div className="mt-2 text-[1.9rem] font-black text-[#234E46]">+3.2</div>
                      <div className="text-sm font-semibold text-[#234E46]">kg</div>
                    </div>
                    <div className="rounded-3xl bg-[#FFF1DC] p-4">
                      <div className="text-xs text-[#8D6B40]">Nhịp tim em bé</div>
                      <div className="mt-2 text-[1.9rem] font-black text-[#6D4526]">145</div>
                      <div className="text-sm font-semibold text-[#6D4526]">bpm</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-4xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-[#A69490]">Nhẹ nhàng hôm nay</div>
                        <div className="mt-1 text-lg font-black text-[#3E2723]">3 điều nên ưu tiên</div>
                      </div>
                      <div className="rounded-full bg-[#FFF1EE] px-3 py-1 text-xs font-bold text-[#FF7A74]">Today</div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {[
                        'Uống vitamin đúng giờ',
                        'Cập nhật cảm xúc cuối ngày',
                        'Xem thực đơn dinh dưỡng hôm nay',
                      ].map((item, index) => (
                        <div key={item} className="flex items-center gap-3 rounded-[18px] bg-[#FFF9F7] px-3 py-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#A15E58] shadow-sm">
                            {index + 1}
                          </div>
                          <div className="text-sm font-semibold text-[#4E403D]">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-4xl bg-[#FFF7E8] p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src="/moods/happy_blink.png" alt="Mood status" className="h-12 w-12 object-contain" />
                      <div>
                        <div className="text-sm font-black text-[#3E2723]">Tâm trạng hôm nay thật ổn</div>
                        <div className="mt-1 text-xs text-[#8A7B63]">Mọi gợi ý đều vừa đủ, không khiến bạn thấy áp lực.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -14, y: 8 }}
              animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
              transition={{ opacity: { delay: 0.44, duration: 0.45 }, repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
              className="absolute -left-4 top-20 hidden rounded-3xl bg-white/90 px-4 py-3 shadow-[0_14px_32px_rgba(62,39,35,0.08)] ring-1 ring-white/80 backdrop-blur-md lg:block"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B89A96]">Dinh dưỡng</div>
              <div className="mt-2 text-sm font-bold text-[#3E2723]">Bữa sáng 420 kcal</div>
              <div className="text-xs text-[#857875]">Nhìn một lần là nhớ mình đã ăn gì</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 14, y: 10 }}
              animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
              transition={{ opacity: { delay: 0.56, duration: 0.45 }, repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -right-3 bottom-14 hidden rounded-3xl bg-white/92 px-4 py-3 shadow-[0_14px_32px_rgba(62,39,35,0.08)] ring-1 ring-white/80 backdrop-blur-md lg:block"
            >
              <div className="text-sm font-bold text-[#3E2723]">Bé đang phát triển ổn định</div>
              <div className="mt-1 text-xs text-[#857875]">Mọi thông tin đều được đặt ở đúng chỗ, thật nhẹ nhàng</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-0 left-0 right-0"
      >
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 50L60 45C120 40 240 30 360 25C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="white"/>
        </svg>
      </motion.div>
    </section>
  );
}

// Features Section
function Features() {
  return (
    <section id="features" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-[#FFEBEE] rounded-full text-xs font-medium text-[#FF9690] mb-4">
            Tính năng nổi bật
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold text-[#3E2723] mb-3">
            Mọi thứ bạn cần cho
            <span className="text-[#FF9690]"> hành trình thai kỳ</span>
          </h2>
          <p className="text-base text-[#757575] max-w-xl mx-auto">
            Từ theo dõi sự phát triển của bé đến chế độ ăn uống dinh dưỡng, PregTap đồng hành cùng bạn mỗi ngày
          </p>
        </AnimatedSection>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <AnimatedCard
              key={feature.id}
              delay={index * 0.1}
              className={`group relative bg-linear-to-br ${feature.bgGradient} rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </motion.div>

              <h3 className="text-lg font-bold text-[#3E2723] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#757575] mb-4">{feature.description}</p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="transform"
              >
                {feature.mockupContent}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute top-5 right-5"
              >
                <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </motion.div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// Premium Section - PayOS integration
function Premium({
  authUser,
  onRequireLogin,
}: {
  authUser: AuthUser | null;
  onRequireLogin: () => void;
}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [purchasePlan, setPurchasePlan] = useState<SubscriptionPlanCode | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch('/api/subscriptions/plans', {
          cache: 'no-store',
        });

        const payload = (await response.json()) as ApiResponse<SubscriptionPlan[]>;

        if (!response.ok || !payload.success || !payload.data) {
          setPaymentFeedback(payload.message ?? 'Không thể tải bảng giá Premium.');
          setPlans([]);
          return;
        }

        const orderedPlans = [...payload.data].sort((left, right) => {
          return premiumPlanOrder.indexOf(left.plan) - premiumPlanOrder.indexOf(right.plan);
        });

        setPlans(orderedPlans);
      } catch {
        setPaymentFeedback('Không thể tải bảng giá Premium.');
      } finally {
        setIsLoadingPlans(false);
      }
    }

    void loadPlans();
  }, []);

  useEffect(() => {
    async function loadSubscriptionStatus() {
      if (!authUser) {
        setSubscriptionStatus(null);
        return;
      }

      try {
        const response = await fetch('/api/subscriptions/status', {
          cache: 'no-store',
        });

        const payload = (await response.json()) as ApiResponse<unknown>;

        if (!response.ok || !payload.success) {
          setSubscriptionStatus(null);
          return;
        }

        setSubscriptionStatus(extractSubscriptionStatus(payload.data));
      } catch {
        setSubscriptionStatus(null);
      }
    }

    void loadSubscriptionStatus();
  }, [authUser]);

  async function handlePurchase(planCode: SubscriptionPlanCode) {
    if (!authUser) {
      setPaymentFeedback('Bạn cần đăng nhập trước khi thanh toán gói Premium.');
      onRequireLogin();
      return;
    }

    setPurchasePlan(planCode);
    setPaymentFeedback(null);

    try {
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planCode }),
      });

      const payload = (await response.json()) as ApiResponse<PurchaseSubscriptionResponse>;

      if (!response.ok || !payload.success || !payload.data?.checkoutUrl) {
        setPaymentFeedback(payload.message ?? 'Không thể tạo giao dịch thanh toán PayOS.');
        return;
      }

      window.location.href = payload.data.checkoutUrl;
    } catch {
      setPaymentFeedback('Không thể kết nối tới PayOS lúc này. Vui lòng thử lại.');
    } finally {
      setPurchasePlan(null);
    }
  }

  return (
    <section id="premium" className="py-16 lg:py-24 bg-linear-to-b from-[#FFEBEE] via-[#FFF5F5] to-[#FFEBEE]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#3E2723] mb-3">
            Bảng giá Premium
          </h2>
          <p className="text-base text-[#757575]">
            Chọn gói phù hợp với thời gian đồng hành bạn cần
          </p>
        </AnimatedSection>

        {paymentFeedback && (
          <div className="mx-auto mb-6 max-w-3xl rounded-2xl bg-white px-5 py-4 text-center text-sm text-[#C44545] shadow-sm">
            {paymentFeedback}
          </div>
        )}

        {isLoadingPlans ? (
          <div className="grid gap-6 md:grid-cols-3">
            {premiumPlanOrder.map((planCode) => (
              <div key={planCode} className="h-105 animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const content = premiumPlanContent[plan.plan];
              const priceLabel = formatCurrencyVnd(plan.price).replace(' ₫', '');
              const isActivePlan = Boolean(subscriptionStatus?.isPremium && subscriptionStatus.plan === plan.plan);

              return (
            <AnimatedCard
              key={plan.name}
              delay={index * 0.1}
              className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-lg ${
                isActivePlan
                  ? 'border-[#B8E6D4] bg-linear-to-b from-[#F5FFF9] to-white ring-2 ring-[#B8E6D4]'
                  : content?.popular
                  ? 'border-[#FF9690] bg-linear-to-b from-white to-[#FFF7EF]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {isActivePlan && (
                <div className="absolute left-4 top-4 rounded-full bg-[#B8E6D4] px-3 py-1 text-xs font-bold text-[#245B47]">
                  Đang active
                </div>
              )}
              {content?.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-[#FF9690] px-3 py-1 text-xs font-bold text-white">
                  Phổ biến
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-xl font-bold text-[#3E2723] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-black">{priceLabel}</span>
                  <span className="text-sm text-gray-500">₫/{plan.durationMonths === 12 ? 'năm' : plan.durationMonths === 6 ? '6 tháng' : 'tháng'}</span>
                </div>
                <div className="mt-2 text-xs text-[#999]">
                  {formatCurrencyVnd(plan.pricePerMonth)}/tháng
                  {plan.savePercent ? ` • Tiết kiệm ${plan.savePercent}%` : ''}
                </div>
                {isActivePlan && (
                  <div className="mt-3 inline-flex rounded-full bg-[#E7F7EF] px-3 py-1 text-xs font-semibold text-[#1F7A4D]">
                    {getPlanLabel(subscriptionStatus?.plan ?? null)} • còn {subscriptionStatus?.daysRemaining ?? 0} ngày
                  </div>
                )}
              </div>

              <div className="mb-5 rounded-xl bg-linear-to-r from-[#FFEBEE] to-[#FFF3E0] p-4">
                <p className="text-sm font-medium text-[#3E2723]">
                  {content?.blurb ?? 'Gói Premium giúp bạn mở khóa đầy đủ tính năng của PregTap.'}
                </p>
              </div>

              <div className="flex-1 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-[#3E2723] mb-3">Quyền lợi:</h4>
                <div className="space-y-2">
                  {(content?.features ?? []).map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${content?.popular ? 'bg-[#FF9690]' : 'bg-[#B8E6D4]'}`}>
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handlePurchase(plan.plan)}
                disabled={purchasePlan === plan.plan || isActivePlan}
                className={`mt-6 w-full rounded-[25px] px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${isActivePlan ? 'bg-[#EAF7F0] text-[#1F7A4D]' : content?.popular ? 'bg-linear-to-r from-[#FF9690] to-[#FF7A74] text-white shadow-md' : 'border-2 border-[#FF9690] text-[#FF9690] hover:bg-[#FF9690]/10'}`}
              >
                {isActivePlan ? 'Gói hiện tại của bạn' : purchasePlan === plan.plan ? 'Đang chuyển tới PayOS...' : content?.cta ?? 'Mua ngay'}
              </button>
            </AnimatedCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// Experts Section
function Experts() {
  const experts = [
    { name: "BS. Nguyễn Thị Hương", specialty: "Sản phụ khoa", hospital: "Bệnh viện Từ Dũ", avatar: "👩‍⚕️" },
    { name: "TS. Lê Thị Mai", specialty: "Dinh dưỡng", hospital: "Viện Dinh dưỡng", avatar: "👩‍🔬" },
    { name: "ThS. Trần Văn Đức", specialty: "Tâm lý", hospital: "TT Tâm lý Hà Nội", avatar: "👨‍⚕️" }
  ];

  return (
    <section id="experts" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-[#E0F2F1] rounded-full text-xs font-medium text-[#00897B] mb-4">
            Đội ngũ chuyên gia
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold text-[#3E2723] mb-3">
            Hỗ trợ từ
            <span className="text-[#B8E6D4]"> chuyên gia hàng đầu</span>
          </h2>
          <p className="text-base text-[#757575] max-w-xl mx-auto">
            Kết nối trực tiếp với các bác sĩ sản phụ khoa, chuyên gia dinh dưỡng và tâm lý để được tư vấn an toàn
          </p>
        </AnimatedSection>

        {/* Expert Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {experts.map((expert, index) => (
            <AnimatedCard
              key={index}
              delay={index * 0.1}
              className="bg-linear-to-br from-[#FFEBEE] to-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 bg-linear-to-br from-[#FF9690]/20 to-[#FFC0C0]/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
              >
                {expert.avatar}
              </motion.div>
              <h3 className="text-base font-bold text-[#3E2723] mb-1">{expert.name}</h3>
              <p className="text-sm text-[#FF9690] font-medium mb-0.5">{expert.specialty}</p>
              <p className="text-xs text-[#999] mb-4">{expert.hospital}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-1.5 text-xs font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[20px] hover:bg-[#FF9690] hover:text-white transition-colors"
              >
                Tư vấn ngay
              </motion.button>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTA({ authUser, onPrimaryAction }: { authUser: AuthUser | null; onPrimaryAction: () => void }) {
  return (
    <section className="py-16 lg:py-24 bg-linear-to-r from-[#FF9690] to-[#FF7A74] relative overflow-hidden">
      {/* Decorative Elements */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"
      />

      <AnimatedSection className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
          Sẵn sàng bắt đầu hành trình?
        </h2>
        <p className="text-base text-white/90 mb-8">
          Hàng ngàn mẹ bầu đã tin tưởng PregTap. Hãy là người tiếp theo!
        </p>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrimaryAction}
          className="px-8 py-3 bg-white text-[#FF9690] font-semibold text-sm rounded-[25px]"
        >
          {authUser ? 'Khám phá tính năng' : 'Tạo tài khoản miễn phí'}
        </motion.button>
      </AnimatedSection>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-[#3E2723] text-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <img
              src="/pregtap_logo.png"
              alt="PregTap"
              className="h-9 w-auto object-contain mb-3"
            />
            <p className="text-white/70 text-sm mb-5 max-w-md">
              Người bạn đồng hành đáng tin cậy trong suốt hành trình thai kỳ. Chúng tôi hiểu và đồng hành cùng bạn mỗi ngày.
            </p>

            {/* App Store Badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z", label: "App Store" },
                { icon: "M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z", label: "Google Play" }
              ].map((app, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2.5 bg-white/10 px-3 py-2 rounded-xl transition-colors"
                >
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d={app.icon} />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-white/70">Tải trên</div>
                    <div className="text-sm font-semibold">{app.label}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Liên kết</h4>
            <ul className="space-y-1.5">
              {['Về chúng tôi', 'Tính năng', 'Bảng giá', 'Blog'].map((link, i) => (
                <li key={i}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 5 }}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Liên hệ</h4>
            <ul className="space-y-1.5 text-sm">
              <li className="text-white/70">📧 support@pregtap.vn</li>
              <li className="text-white/70">📞 1900 xxxx</li>
              <li className="text-white/70">📍 TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-white/50 text-xs">
            © 2024 PregTap. All rights reserved.
          </div>
          <div className="flex gap-5 text-sm">
            {['Chính sách bảo mật', 'Điều khoản sử dụng'].map((link, i) => (
              <a key={i} href="#" className="text-white/50 hover:text-white transition-colors text-xs">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
        });

        if (!response.ok) {
          setAuthUser(null);
          return;
        }

        const payload = (await response.json()) as ApiResponse<AuthUser>;
        setAuthUser(payload.success && payload.data ? payload.data : null);
      } catch {
        setAuthUser(null);
      }
    }

    void loadCurrentUser();
  }, []);

  function openAuthModal(mode: AuthMode) {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      setAuthUser(null);
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function handleAuthSuccess(payload: AuthResponse, mode: AuthMode) {
    setAuthUser(payload.user);
    setToast({
      tone: 'success',
      message: mode === 'login' ? 'Đăng nhập thành công.' : 'Tạo tài khoản thành công.',
    });
  }

  return (
    <main className="min-h-screen">
      <ToastNotice
        isOpen={Boolean(toast)}
        message={toast?.message ?? ''}
        tone={toast?.tone ?? 'success'}
        onClose={() => setToast(null)}
      />
      <Header
        authUser={authUser}
        isLoggingOut={isLoggingOut}
        onLoginClick={() => openAuthModal('login')}
        onLogout={handleLogout}
        onRegisterClick={() => openAuthModal('register')}
      />
      <Hero
        authUser={authUser}
        onExploreFeatures={() => scrollToSection('features')}
        onPrimaryAction={() => {
          if (authUser) {
            scrollToSection('features');
            return;
          }

          openAuthModal('register');
        }}
      />
      <Features />
      <Premium authUser={authUser} onRequireLogin={() => openAuthModal('login')} />
      <Experts />
      <CTA
        authUser={authUser}
        onPrimaryAction={() => {
          if (authUser) {
            scrollToSection('features');
            return;
          }

          openAuthModal('register');
        }}
      />
      <Footer />
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onModeChange={setAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </main>
  );
}
