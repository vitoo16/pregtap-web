'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

import { usePregnancy } from '@/contexts/PregnancyContext';
import { useAuth } from '@/contexts/AuthContext';
import { WeekCircle } from '@/components/app/home/WeekCircle';
import { StatCard } from '@/components/app/home/StatCard';
import { QuickNavCard } from '@/components/app/home/QuickNavCard';
import { type WeightLog, type ApiResponse } from '@/types';
import { extractSubscriptionStatus, type SubscriptionStatus } from '@/lib/subscription';
import { getAccessToken } from '@/lib/token-store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HomeWeightLog {
  id: string;
  weightKg: number;
  loggedOn: string;
}

// ─── Streak calculation ────────────────────────────────────────────────────────

function calcStreak(logs: HomeWeightLog[]): number {
  if (!logs.length) return 0;

  // Sort by date descending, cloning dates to avoid mutation
  const sorted = [...logs]
    .map((l) => {
      const d = parseISO(l.loggedOn);
      return { ...l, parsedDate: d };
    })
    .filter((l) => isValid(l.parsedDate))
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

  if (!sorted.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if the most recent log is today or yesterday
  const mostRecent = new Date(sorted[0].parsedDate);
  mostRecent.setHours(0, 0, 0, 0);
  const daysSinceLast = differenceInDays(today, mostRecent);

  if (daysSinceLast > 1) return 0; // Streak broken

  let streak = 0;
  let expectedDate = new Date(mostRecent);

  for (const log of sorted) {
    const d = new Date(log.parsedDate);
    d.setHours(0, 0, 0, 0);

    const diff = differenceInDays(expectedDate, d);
    if (diff === 0) {
      streak++;
      expectedDate = new Date(d);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (diff === 1) {
      // gap of one day is OK
      streak++;
      expectedDate = new Date(d);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ─── Greeting helpers ─────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

const MOTIVATIONAL_MESSAGES = [
  'Hành trình của bạn thật tuyệt vời!',
  'Mỗi ngày cùng bé yêu đều là một ngày đặc biệt.',
  'Bạn đang làm rất tốt, mẹ bầu ơi!',
  'Giữ nụ cười nhé, bé đang cảm nhận được!',
  'Ngày hôm nay thật đẹp để yêu thương.',
];

function getRandomMessage() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const WeightIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);

const StreakIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const WeightNavIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);

const MealsNavIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

const RecordsNavIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const DoctorNavIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
    <line x1="12" y1="14" x2="12" y2="18"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { pregnancy, progress, isLoading: pregnancyLoading, error: pregnancyError } = usePregnancy();

  const [weightLogs, setWeightLogs] = useState<HomeWeightLog[]>([]);
  const [weightLoading, setWeightLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Fetch weight logs
  const fetchWeightLogs = useCallback(async () => {
    if (!pregnancy?.id) return;
    setWeightLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`/api/weight-logs?pregnancyId=${pregnancy?.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const payload = (await res.json()) as ApiResponse<HomeWeightLog[]>;
      if (payload.success && payload.data) {
        setWeightLogs(payload.data);
        setStreak(calcStreak(payload.data));
      }
    } catch {
      // Silently fail - weight logs are optional
    } finally {
      setWeightLoading(false);
    }
  }, [pregnancy?.id]);

  useEffect(() => {
    if (pregnancy?.id) {
      void fetchWeightLogs();
    }
  }, [pregnancy?.id, fetchWeightLogs]);

  // Fetch subscription status
  useEffect(() => {
    async function loadStatus() {
      try {
        const token = getAccessToken();
        const response = await fetch('/api/subscriptions/status', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        const payload = (await response.json()) as { success: boolean; data: unknown };
        if (payload.success) {
          setSubscriptionStatus(extractSubscriptionStatus(payload.data));
        }
      } catch {
        // Silently fail
      }
    }

    void loadStatus();
  }, []);

  // Loading state
  if (pregnancyLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto h-10 w-10" style={{ borderWidth: 3 }} />
          <p className="mt-4 text-sm text-[#999]">Đang tải...</p>
        </div>
      </div>
    );
  }

  // No pregnancy setup - show CTA
  if (!pregnancy || !progress) {
    return (
      <div className="min-h-[70vh] px-6 py-12 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-md text-center"
        >
          {/* Illustration */}
          <div
            className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #FF9690 0%, #FFC0C0 100%)' }}
          >
            <svg className="h-14 w-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>

          <h1 className="mb-3 text-2xl font-extrabold text-[#3E2723]">
            Chào mừng bạn đến với PregTap!
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-[#757575]">
            Hãy thiết lập thông tin thai kỳ để bắt đầu theo dõi hành trình của bạn cùng bé yêu.
          </p>

          <Link
            href="/app/setup"
            className="btn btn-primary inline-flex rounded-2xl px-8 py-3.5 text-base font-bold shadow-lg"
          >
            <span className="mr-2 text-lg">+</span>
            Thiết lập thai kỳ
          </Link>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (pregnancyError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-sm rounded-2xl border border-[#FF7A74]/30 bg-[#FF7A74]/5 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF7A74]/10">
            <svg className="h-6 w-6 text-[#FF7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="mb-2 font-bold text-[#3E2723]">Đã xảy ra lỗi</h2>
          <p className="mb-4 text-sm text-[#757575]">{pregnancyError}</p>
          <button
            onClick={() => router.refresh()}
            className="btn btn-primary rounded-xl px-6 py-2 text-sm font-semibold"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const displayName = user?.fullName?.trim() || user?.email?.trim() || user?.phone?.trim() || 'mẹ bầu';
  const currentWeight = weightLogs[0]?.weightKg ?? pregnancy.prePregnancyWeightKg;
  const displayWeight = currentWeight ? `${currentWeight.toFixed(1)} kg` : '-- kg';

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
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full opacity-10 md:right-[-40px] md:top-[-40px]" style={{ background: 'white' }} />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full opacity-10 md:left-[-20px] md:bottom-[-20px]" style={{ background: 'white' }} />

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 mb-6 text-center text-white"
        >
          <h1 className="text-[22px] font-semibold">Trang chủ</h1>
        </motion.div>

        {/* WeekCircle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex justify-center"
        >
          <WeekCircle
            currentWeek={progress.currentWeek}
            currentDayInWeek={progress.currentDay}
            progressPercentage={progress.percentComplete}
            daysRemaining={progress.remainingDays}
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="app-page-content">
        {/* Stats row */}
        <div className="mb-5 flex gap-3">
          <StatCard
            icon={<WeightIcon />}
            label="Cân nặng hiện tại"
            value={weightLoading ? '...' : displayWeight}
            iconColor="#F0927C"
            bgColor="#FFF3E0"
            index={0}
          />
          <StatCard
            icon={<StreakIcon />}
            label="Chuỗi ngày"
            value={weightLoading ? '...' : `${streak} ngày 🔥`}
            iconColor="#64C5B1"
            bgColor="#E0F2F1"
            index={1}
          />
        </div>

        {/* Quick navigation grid */}
        <div className="mb-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
            Truy cập nhanh
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickNavCard
              icon={<WeightNavIcon />}
              title="Cân nặng"
              subtitle="Theo dõi cân nặng"
              href="/app/weight"
              bgColor="white"
              accentColor="#F0927C"
              index={0}
            />
            <QuickNavCard
              icon={<MealsNavIcon />}
              title="Thực đơn"
              subtitle="Kế hoạch ăn uống"
              href="/app/meals"
              bgColor="white"
              accentColor="#B8E6D4"
              index={1}
            />
            <QuickNavCard
              icon={<RecordsNavIcon />}
              title="Hồ sơ y tế"
              subtitle="Tài liệu & kết quả"
              href="/app/records"
              bgColor="white"
              accentColor="#FF9690"
              index={2}
            />
            <QuickNavCard
              icon={<DoctorNavIcon />}
              title="Bác sĩ"
              subtitle="Tư vấn trực tuyến"
              href="/app/doctor"
              bgColor="white"
              accentColor="#FFB5B0"
              index={3}
            />
          </div>
        </div>

        {/* Greeting card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="card overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div
            className="h-1.5"
            style={{ background: 'linear-gradient(90deg, #FF9690 0%, #FFC0C0 50%, #B8E6D4 100%)' }}
          />
          <div className="p-5">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #FF9690 0%, #FFC0C0 100%)' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-[#3E2723]">
                  {getGreeting()}, {displayName}!
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#757575]">
                  {getRandomMessage()}
                </p>
                <p className="mt-2 text-xs text-[#999]">
                  {format(new Date(), "EEEE, dd 'tháng' M 'năm' yyyy", { locale: vi })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium upgrade banner — only shown if user is NOT premium */}
        {!subscriptionStatus?.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="card mt-4 overflow-hidden"
          >
            <div className="h-1.5 bg-linear-to-r from-[#FF9690] to-[#FFB87A]" />
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#FF9690]/10 to-[#FFB87A]/10">
                  <svg className="h-5 w-5 text-[#FF9690]" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#3E2723]">Nâng cấp Premium</p>
                  <p className="text-xs text-[#757575]">Mở khóa toàn bộ tính năng PregTap</p>
                </div>
                <Link
                  href="/app/subscription"
                  className="flex-shrink-0 rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Xem gói
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Due date info card */}
        {pregnancy.expectedDeliveryDate && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="card mt-4 flex items-center gap-3 p-4"
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: '#FFF3E0' }}
            >
              <svg className="h-5 w-5 text-[#F0927C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#999]">Ngày dự sinh</p>
              <p className="text-base font-bold text-[#3E2723]">
                {format(parseISO(pregnancy.expectedDeliveryDate), "dd 'tháng' M 'năm' yyyy", { locale: vi })}
              </p>
            </div>
            {pregnancy.babyNickname && (
              <div className="rounded-full bg-[#FFEBEE] px-3 py-1 text-xs font-semibold text-[#FF7A74]">
                {pregnancy.babyNickname}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
