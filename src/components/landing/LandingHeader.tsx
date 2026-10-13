'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { AuthUser } from '@/lib/auth';

function getDisplayName(user: AuthUser | null) {
  if (!user) return 'mẹ bầu';
  return user.fullName?.trim() || user.email?.trim() || user.phone?.trim() || 'mẹ bầu';
}

function getUserInitial(user: AuthUser | null) {
  return getDisplayName(user).trim().charAt(0).toUpperCase();
}

const MenuIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

const CloseIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

function getLandingNavHref(label: string, isAboutPage: boolean) {
  if (label === 'Về chúng tôi') return isAboutPage ? '#about-title' : '/about';
  const section = label === 'Tính năng' ? 'features' : label === 'Gói Premium' ? 'premium' : 'experts';
  return isAboutPage ? `/#${section}` : `#${section}`;
}
export function LandingHeader({
  authUser = null,
  isLoggingOut = false,
  onLogout = () => {},
  onLoginClick,
  onRegisterClick,
  isAboutPage = false,
}: {
  authUser?: AuthUser | null;
  isLoggingOut?: boolean;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onRegisterClick?: () => void;
  isAboutPage?: boolean;
}) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const displayName = getDisplayName(authUser);
  const userInitial = getUserInitial(authUser);
  const handleLoginClick = onLoginClick ?? (() => router.push('/?login=true'));
  const handleRegisterClick = onRegisterClick ?? (() => router.push('/?register=true'));

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
            href={isAboutPage ? "/" : "#"}
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
          <div className="hidden lg:flex items-center gap-8">
            {authUser ? (
              <>
                <Link
                  href="/app/home"
                  className="text-[#757575] hover:text-[#FF9690] font-medium transition-colors text-sm"
                >
                  Trang chủ
                </Link>
                {['Tính năng', 'Gói Premium', 'Chuyên gia', 'Về chúng tôi'].map((item) => (
                  <motion.a
                    key={item}
                    href={getLandingNavHref(item, isAboutPage)}
                    className="text-[#757575] hover:text-[#FF9690] font-medium transition-colors text-sm"
                    whileHover={{ y: -2 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </>
            ) : (
              ['Tính năng', 'Gói Premium', 'Chuyên gia', 'Về chúng tôi'].map((item) => (
                <motion.a
                  key={item}
                  href={getLandingNavHref(item, isAboutPage)}
                  className="text-[#757575] hover:text-[#FF9690] font-medium transition-colors text-sm"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {authUser ? (
              <>
                <Link
                  href="/app/home"
                  className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Ứng dụng
                </Link>
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
                  onClick={handleLoginClick}
                  className="px-5 py-2 text-sm font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[25px] hover:bg-[#FF9690]/10 transition-colors"
                >
                  Đăng nhập
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(255,150,144,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegisterClick}
                  className="px-5 py-2 text-sm font-semibold text-white bg-linear-to-r from-[#FF9690] to-[#FF7A74] rounded-[25px]"
                >
                  Đăng ký ngay
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-[#3E2723]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
              className="lg:hidden mt-4 pb-4 overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Tính năng', href: getLandingNavHref('Tính năng', isAboutPage) },
                  { label: 'Gói Premium', href: getLandingNavHref('Gói Premium', isAboutPage) },
                  { label: 'Chuyên gia', href: getLandingNavHref('Chuyên gia', isAboutPage) },
                  { label: 'Về chúng tôi', href: getLandingNavHref('Về chúng tôi', isAboutPage) },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="text-[#757575] font-medium py-2" onClick={() => setMobileMenuOpen(false)}>{item.label}</a>
                ))}
                {authUser ? (
                  <>
                    <Link href="/app/home" className="text-[#757575] font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
                  </>
                ) : null}
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
                          handleLoginClick();
                        }}
                        className="w-full py-2.5 text-sm font-semibold text-[#FF9690] border-2 border-[#FF9690] rounded-[25px]"
                      >
                        Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleRegisterClick();
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
