'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';

import { AuthModal } from '@/components/auth-modal';
import { type ApiResponse, type AuthResponse, type AuthUser } from '@/lib/auth';

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

// Premium plans
const premiumPlans = [
  {
    name: "Gói 1 Tháng",
    price: "39.000",
    period: "tháng",
    features: [
      "Toàn bộ tính năng theo dõi thai kỳ",
      "Thực đơn dinh dưỡng cá nhân hóa",
      "Lưu hồ sơ y tế không giới hạn",
      "Nhắc lịch khám và uống vitamin"
    ],
    cta: "Chọn gói 1 tháng",
    popular: false,
    bgGradient: "from-gray-50 to-white"
  },
  {
    name: "Gói 6 Tháng",
    price: "199.000",
    period: "6 tháng",
    features: [
      "Toàn bộ tính năng của gói 1 tháng",
      "Theo dõi xuyên suốt tam cá nguyệt",
      "Ưu tiên hỗ trợ khi cần tư vấn",
      "Tổng hợp tiến trình thai kỳ theo mốc",
      "Gợi ý chăm sóc cảm xúc cá nhân hóa"
    ],
    cta: "Chọn gói 6 tháng",
    popular: true,
    bgGradient: "from-[#FFEBEE] to-[#FFF8E1]"
  },
  {
    name: "Gói 1 Năm",
    price: "399.000",
    period: "năm",
    features: [
      "Toàn bộ tính năng của gói 6 tháng",
      "Đồng hành dài hạn trước và sau sinh",
      "Thực đơn AI cá nhân hóa",
      "Không giới hạn hồ sơ y tế",
      "Xuất dữ liệu PDF",
      "Phù hợp cho nhu cầu sử dụng lâu dài"
    ],
    cta: "Chọn gói 1 năm",
    popular: false,
    bgGradient: "from-gray-50 to-white"
  }
];

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

  return (
    <section className="relative min-h-screen pt-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-linear-to-b from-[#FFEBEE] via-[#FFF8E1] to-[#FFEBEE]" />
      <motion.div
        style={{ y: y1 }}
        className="absolute top-32 left-8 w-56 h-56 bg-[#FFC0C0]/30 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-40 right-8 w-72 h-72 bg-[#FF9690]/20 rounded-full blur-3xl"
      />

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -15, 0] }}
        transition={{ opacity: { delay: 0.5, duration: 0.5 }, repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute top-36 left-[5%] hidden lg:block"
      >
        <span className="text-3xl filter drop-shadow-sm">🍅</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{ opacity: { delay: 0.6, duration: 0.5 }, repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-52 right-[8%] hidden lg:block"
      >
        <span className="text-2xl filter drop-shadow-sm">💕</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -12, 0] }}
        transition={{ opacity: { delay: 0.7, duration: 0.5 }, repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
        className="absolute top-72 left-[5%] hidden lg:block"
      >
        <span className="text-xl filter drop-shadow-sm">📅</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { delay: 0.8, duration: 0.5 }, repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-40 right-[10%] hidden lg:block"
      >
        <span className="text-3xl filter drop-shadow-sm">👶</span>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm mb-6"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 bg-[#FF9690] rounded-full"
              />
              <span className="text-sm text-[#757575]">Sẵn sàng cho hành trình làm mẹ</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-[#3E2723] leading-tight mb-5"
            >
              Người bạn đồng hành
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="block text-[#FF9690]"
              >
                thấu hiểu từng nhịp đập thai kỳ
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base text-[#757575] mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              Nền tảng chăm sóc thai kỳ toàn diện. Bắt đầu hành trình làm mẹ an tâm, khoa học và ngập tràn niềm vui.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(255,150,144,0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={onPrimaryAction}
                className="px-7 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-[#FF9690] to-[#FF7A74] rounded-[25px] shadow-md"
              >
                {authUser ? 'Tiếp tục trải nghiệm' : 'Bắt đầu miễn phí'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,150,144,0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={onExploreFeatures}
                className="px-7 py-2.5 text-sm font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[25px] flex items-center justify-center gap-2"
              >
                <span>Khám phá tính năng</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              {[
                { value: '50K+', label: 'Mẹ bầu tin tưởng' },
                { value: '4.9', label: 'Đánh giá sao' },
                { value: '280', label: 'Ngày thai kỳ' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-[#FF9690]">{stat.value}</div>
                  <div className="text-xs text-[#757575]">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {authUser && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm text-[#3E2723] shadow-sm"
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#8FD4BC]" />
                Xin chào {displayName}, phiên đăng nhập của bạn đã sẵn sàng.
              </motion.div>
            )}
          </motion.div>

          {/* Right Content - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              whileHover={{ rotate: 0, scale: 1.02 }}
              animate={{ rotate: 1 }}
              transition={{ repeat: Infinity, duration: 5, repeatType: "reverse" }}
              className="bg-white rounded-2xl shadow-lg p-5 lg:p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-xs text-[#999]">Xin chào,</div>
                  <div className="text-lg font-bold text-[#3E2723]">Mẹ Minh Anh <span className="text-[#FF9690]">💕</span></div>
                </div>
                <div className="w-9 h-9 bg-linear-to-br from-[#FF9690] to-[#FFC0C0] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
              </div>

              <div className="bg-linear-to-r from-[#FFEBEE] to-[#FFF3E0] rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#3E2723]">Tuần thai hiện tại</span>
                  <span className="text-xl font-bold text-[#FF9690]">24</span>
                </div>
                <div className="h-2.5 bg-white rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '60%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-linear-to-r from-[#FF9690] to-[#FFC0C0] rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-[#999]">
                  <span>Tuần 1</span>
                  <span>Còn 112 ngày</span>
                  <span>Tuần 40</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#E0F2F1] rounded-xl p-3.5"
                >
                  <div className="text-xl mb-1">📊</div>
                  <div className="text-xs text-[#757575]">Cân nặng</div>
                  <div className="text-base font-bold text-[#3E2723]">+3.2 kg</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#FFF3E0] rounded-xl p-3.5"
                >
                  <div className="text-xl mb-1">❤️</div>
                  <div className="text-xs text-[#757575]">Nhịp tim bé</div>
                  <div className="text-base font-bold text-[#3E2723]">145 bpm</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{ opacity: { delay: 0.4, duration: 0.5 }, repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -left-8 top-16 bg-white rounded-xl shadow-md p-3 hidden lg:block"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#E0F2F1] rounded-full flex items-center justify-center text-lg">🍎</div>
                <div>
                  <div className="text-xs text-[#757575]">Bữa sáng</div>
                  <div className="text-sm font-semibold text-[#3E2723]">420 kcal</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 0.5, duration: 0.5 }, repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -right-8 top-1/3 bg-white rounded-xl shadow-md p-3 hidden lg:block"
            >
              <div className="flex items-center gap-2">
                <img src="/moods/happy_blink.png" alt="Happy" className="w-8 h-8 object-contain" />
                <span className="text-sm font-semibold text-[#3E2723]">Tâm trạng tốt</span>
              </div>
              <div className="text-xs text-[#999]">Hôm nay</div>
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

// Premium Section - 2 columns: Free vs Paid
function Premium() {
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

        <div className="grid gap-6 md:grid-cols-3">
          {premiumPlans.map((plan, index) => (
            <AnimatedCard
              key={plan.name}
              delay={index * 0.1}
              className={`relative overflow-hidden rounded-2xl border p-6 shadow-lg ${
                plan.popular
                  ? 'border-[#FF9690] bg-linear-to-b from-white to-[#FFF7EF]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-[#FF9690] px-3 py-1 text-xs font-bold text-white">
                  Phổ biến
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-xl font-bold text-[#3E2723] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-black">{plan.price}</span>
                  <span className="text-sm text-gray-500">₫/{plan.period}</span>
                </div>
              </div>

              <div className="mb-5 rounded-xl bg-linear-to-r from-[#FFEBEE] to-[#FFF3E0] p-4">
                <p className="text-sm font-medium text-[#3E2723]">
                  {plan.name === 'Gói 1 Tháng' && 'Phù hợp để trải nghiệm nhanh toàn bộ hệ sinh thái PregTap.'}
                  {plan.name === 'Gói 6 Tháng' && 'Lựa chọn cân bằng chi phí và thời gian đồng hành trong thai kỳ.'}
                  {plan.name === 'Gói 1 Năm' && 'Tối ưu nhất nếu bạn muốn sử dụng dài hạn và lưu trữ đầy đủ dữ liệu.'}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-[#3E2723] mb-3">Quyền lợi:</h4>
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-[#FF9690]' : 'bg-[#B8E6D4]'}`}>
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <button className={`mt-6 w-full rounded-[25px] px-5 py-3 text-sm font-semibold transition-colors ${plan.popular ? 'bg-linear-to-r from-[#FF9690] to-[#FF7A74] text-white shadow-md' : 'border-2 border-[#FF9690] text-[#FF9690] hover:bg-[#FF9690]/10'}`}>
                {plan.cta}
              </button>
            </AnimatedCard>
          ))}
        </div>
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

  function handleAuthSuccess(payload: AuthResponse) {
    setAuthUser(payload.user);
  }

  return (
    <main className="min-h-screen">
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
      <Premium />
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
