'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { PremiumSection } from '@/components/app/subscription/PremiumSection';
import { useAuth } from '@/contexts/AuthContext';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen pb-8">
      {/* Gradient header */}
      <div
        className="relative overflow-hidden px-6 pt-8 pb-8 md:px-10"
        style={{
          background: 'linear-gradient(135deg, #FF9690 0%, #DA927B 100%)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full opacity-10 bg-white md:right-[-40px] md:top-[-40px]" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full opacity-10 bg-white md:left-[-20px] md:bottom-[-20px]" />

        {/* Back button + Page title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex items-center gap-3"
        >
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[22px] font-semibold text-white">Gói Premium</h1>
        </motion.div>
      </div>

      {/* Premium section */}
      <div className="app-page-content">
        <PremiumSection
          fullPage={false}
          isLoggedIn={Boolean(user)}
          title="Chọn gói Premium"
          subtitle="Mở khóa toàn bộ tính năng của PregTap"
        />
      </div>
    </div>
  );
}
