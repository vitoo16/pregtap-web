'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PregnancyProvider } from '@/contexts/PregnancyContext';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Sidebar } from '@/components/app/Sidebar';

function MobileBottomTabs() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const tabs = [
    { href: '/app/home', label: 'Trang chủ', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { href: '/app/track', label: 'Theo dõi', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )},
    { href: '/app/meals', label: 'Thực đơn', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      </svg>
    )},
    { href: '/app/records', label: 'Hồ sơ', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    )},
    { href: '/profile', label: 'Tài khoản', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )},
    { href: '/app/subscription', label: 'Premium', icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    )},
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== '/profile' && pathname.startsWith(tab.href));
        return (
          <a
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-semibold transition-colors ${
              isActive ? 'text-[#FF9690]' : 'text-[#999]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </a>
        );
      })}
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/?login=true');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[#FF9690]/30 border-t-[#FF9690]" />
          <p className="mt-4 text-sm text-[#999]">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFEBEE]">
        <div className="text-center px-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
            <svg className="w-8 h-8 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#3E2723] mb-2">Vui lòng đăng nhập</h2>
          <p className="text-sm text-[#757575] mb-6">
            Bạn cần đăng nhập để truy cập mục này.
          </p>
          <a
            href="/?login=true"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <PregnancyProvider>
          <AuthGate>
            <div className="app-shell">
              <Sidebar />
              <main className="app-content">
                {children}
              </main>
              <MobileBottomTabs />
            </div>
          </AuthGate>
        </PregnancyProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
