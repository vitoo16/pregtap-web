'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

import {
  extractSubscriptionStatus,
  formatCurrencyVnd,
  getPlanLabel,
  type PurchaseSubscriptionResponse,
  type SubscriptionPlan,
  type SubscriptionPlanCode,
  type SubscriptionStatus,
} from '@/lib/subscription';
import type { ApiResponse } from '@/types';
import { getAccessToken } from '@/lib/token-store';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PremiumPlanContent = {
  blurb: string;
  cta: string;
  features: string[];
  popular: boolean;
};

// ─── Default plan content ──────────────────────────────────────────────────────

export const defaultPlanContent: Record<SubscriptionPlanCode, PremiumPlanContent> = {
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

const PLAN_ORDER: SubscriptionPlanCode[] = ['Monthly', 'SixMonths', 'Yearly'];

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Animated wrapper ────────────────────────────────────────────────────────

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── PremiumSection ────────────────────────────────────────────────────────────

export interface PremiumSectionProps {
  /** Set to false when embedded in the app shell (avoids full-page sections) */
  fullPage?: boolean;
  /** Override plan content (defaults to defaultPlanContent) */
  planContent?: Record<SubscriptionPlanCode, PremiumPlanContent>;
  /** Custom header title */
  title?: string;
  /** Custom header subtitle */
  subtitle?: string;
  /** Called when user clicks purchase and is not logged in */
  onRequireLogin?: () => void;
  /** Whether the user is logged in */
  isLoggedIn?: boolean;
}

export function PremiumSection({
  fullPage = true,
  planContent = defaultPlanContent,
  title = 'Bảng giá Premium',
  subtitle = 'Chọn gói phù hợp với thời gian đồng hành bạn cần',
  onRequireLogin,
  isLoggedIn = false,
}: PremiumSectionProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [purchasePlan, setPurchasePlan] = useState<SubscriptionPlanCode | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  // Load plans from API
  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch('/api/subscriptions/plans', { cache: 'no-store' });
        const payload = (await response.json()) as ApiResponse<SubscriptionPlan[]>;

        if (!response.ok || !payload.success || !payload.data) {
          setPaymentFeedback(payload.message ?? 'Không thể tải bảng giá Premium.');
          setPlans([]);
          return;
        }

        const orderedPlans = [...payload.data].sort(
          (left, right) => PLAN_ORDER.indexOf(left.plan) - PLAN_ORDER.indexOf(right.plan)
        );
        setPlans(orderedPlans);
      } catch {
        setPaymentFeedback('Không thể tải bảng giá Premium.');
      } finally {
        setIsLoadingPlans(false);
      }
    }

    void loadPlans();
  }, []);

  // Load subscription status if logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setSubscriptionStatus(null);
      return;
    }

    async function loadStatus() {
      try {
        const token = getAccessToken();
        const response = await fetch('/api/subscriptions/status', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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

    void loadStatus();
  }, [isLoggedIn]);

  async function handlePurchase(planCode: SubscriptionPlanCode) {
    if (!isLoggedIn) {
      setPaymentFeedback('Bạn cần đăng nhập trước khi thanh toán gói Premium.');
      onRequireLogin?.();
      return;
    }

    setPurchasePlan(planCode);
    setPaymentFeedback(null);

    try {
      const token = getAccessToken();
      const response = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  const containerClass = fullPage
    ? 'py-16 lg:py-24 bg-linear-to-b from-[#FFEBEE] via-[#FFF5F5] to-[#FFEBEE]'
    : 'py-8 bg-transparent';

  return (
    <div className={containerClass}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        {fullPage && (
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#3E2723] mb-3">{title}</h2>
            <p className="text-base text-[#757575]">{subtitle}</p>
          </AnimatedSection>
        )}

        {paymentFeedback && (
          <div className="mx-auto mb-6 max-w-3xl rounded-2xl bg-white px-5 py-4 text-center text-sm text-[#C44545] shadow-sm">
            {paymentFeedback}
          </div>
        )}

        {isLoadingPlans ? (
          <div className="grid gap-6 md:grid-cols-3">
            {PLAN_ORDER.map((planCode) => (
              <div key={planCode} className="h-[500px] animate-pulse rounded-2xl border border-gray-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const content = planContent[plan.plan];
              const priceLabel = formatCurrencyVnd(plan.price).replace(' ₫', '');
              const isActivePlan = Boolean(
                subscriptionStatus?.isPremium && subscriptionStatus.plan === plan.plan
              );

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
                  {content?.popular && !isActivePlan && (
                    <div className="absolute right-4 top-4 rounded-full bg-[#FF9690] px-3 py-1 text-xs font-bold text-white">
                      Phổ biến
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-[#3E2723] mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-black">{priceLabel}</span>
                      <span className="text-sm text-gray-500">
                        ₫/{plan.durationMonths === 12 ? 'năm' : plan.durationMonths === 6 ? '6 tháng' : 'tháng'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[#999]">
                      {formatCurrencyVnd(plan.pricePerMonth)}/tháng
                      {plan.savePercent ? ` • Tiết kiệm ${plan.savePercent}%` : ''}
                    </div>
                    {isActivePlan && (
                      <div className="mt-3 inline-flex rounded-full bg-[#E7F7EF] px-3 py-1 text-xs font-semibold text-[#1F7A4D]">
                        {getPlanLabel(subscriptionStatus?.plan ?? null)} • còn{' '}
                        {subscriptionStatus?.daysRemaining ?? 0} ngày
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
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              content?.popular ? 'bg-[#FF9690]' : 'bg-[#B8E6D4]'
                            }`}
                          >
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
                    className={`mt-6 w-full rounded-[25px] px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                      isActivePlan
                        ? 'bg-[#EAF7F0] text-[#1F7A4D]'
                        : content?.popular
                        ? 'bg-linear-to-r from-[#FF9690] to-[#FF7A74] text-white shadow-md'
                        : 'border-2 border-[#FF9690] text-[#FF9690] hover:bg-[#FF9690]/10'
                    }`}
                  >
                    {isActivePlan
                      ? 'Gói hiện tại của bạn'
                      : purchasePlan === plan.plan
                      ? 'Đang chuyển tới PayOS...'
                      : content?.cta ?? 'Mua ngay'}
                  </button>
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
