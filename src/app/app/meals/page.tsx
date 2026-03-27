'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  addMonths,
  subMonths,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { vi } from 'date-fns/locale';

import { apiClient } from '@/lib/api-client';
import { usePregnancy } from '@/contexts/PregnancyContext';
import type { MealPlan, MealDay, MealItem, ApiResponse } from '@/types';
import { Badge } from '@/components/app/shared/Badge';
import { EmptyState } from '@/components/app/shared/EmptyState';
import { LoadingSpinner } from '@/components/app/shared/LoadingSpinner';
import { ErrorState } from '@/components/app/shared/ErrorState';
import { Modal } from '@/components/app/shared/Modal';
import { AiChatSheet } from '@/components/app/meals/AiChatSheet';
import { MealCard } from '@/components/app/meals/MealCard';

// ─── API helpers ───────────────────────────────────────────────────────────────

async function fetchMealPlans(pregnancyId: string): Promise<ApiResponse<MealPlan[]>> {
  return apiClient.get<MealPlan[]>(`/api/meal-plans`, { pregnancyId });
}

async function fetchMealPlanDetail(planId: string): Promise<ApiResponse<MealDay[]>> {
  return apiClient.get<MealDay[]>(`/api/meal-plans/${planId}/days`);
}

async function fetchMealPlanStatus(planId: string): Promise<ApiResponse<MealPlan>> {
  return apiClient.get<MealPlan>(`/api/meal-plans/${planId}/status`);
}

async function generateMealPlan(
  pregnancyId: string,
  durationWeeks: number,
  additionalNotes?: string,
): Promise<ApiResponse<MealPlan>> {
  return apiClient.post<MealPlan>(`/api/meal-plans/generate`, {
    startDate: format(new Date(), 'yyyy-MM-dd'),
    durationWeeks,
    additionalNotes,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MEAL_TYPE_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const MEAL_TYPE_LABELS: Record<string, string> = {
  Breakfast: 'Bữa sáng',
  Lunch: 'Bữa trưa',
  Dinner: 'Bữa tối',
  Snack: 'Bữa phụ',
};

export default function MealsPage() {
  const router = useRouter();
  const { pregnancy } = usePregnancy();
  const queryClient = useQueryClient();

  const [focusedDate, setFocusedDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateWeeks, setGenerateWeeks] = useState(1);
  const [generateNotes, setGenerateNotes] = useState('');
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Meal plans query
  const {
    data: plansResponse,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['meal-plans', pregnancy?.id],
    queryFn: () => fetchMealPlans(pregnancy!.id),
    enabled: !!pregnancy?.id,
  });

  const mealPlans: MealPlan[] = plansResponse?.data ?? [];
  const latestPlan = mealPlans[0];

  // Meal plan days query
  const {
    data: daysResponse,
    isLoading: daysLoading,
  } = useQuery({
    queryKey: ['meal-plan-days', currentPlanId],
    queryFn: () => fetchMealPlanDetail(currentPlanId!),
    enabled: !!currentPlanId,
    refetchInterval: false,
  });

  const mealDays: MealDay[] = daysResponse?.data ?? [];

  // Auto-select latest plan
  useEffect(() => {
    if (latestPlan && latestPlan.status === 'Succeeded' && !currentPlanId) {
      setCurrentPlanId(latestPlan.id);
    }
  }, [latestPlan, currentPlanId]);

  // Build date -> meals map
  const mealDatesMap = new Map<string, MealItem[]>();
  mealDays.forEach((day) => {
    mealDatesMap.set(day.date, day.meals);
  });

  // Calendar days
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(focusedDate), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(focusedDate), { weekStartsOn: 0 }),
  });

  // Selected day meals
  const selectedDayKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayMeals: MealItem[] = mealDatesMap.get(selectedDayKey) ?? [];
  const selectedDayMealsByType = MEAL_TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = selectedDayMeals.filter((m) => m.mealType === type);
      return acc;
    },
    {} as Record<string, MealItem[]>,
  );

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      generateMealPlan(pregnancy!.id, generateWeeks, generateNotes || undefined),
    onSuccess: (response) => {
      if (response.data) {
        setCurrentPlanId(response.data.id);
        setIsGenerateOpen(false);
        setIsPolling(true);
        pollStatus(response.data.id);
      }
    },
  });

  // Poll status
  const pollStatus = useCallback(
    async (planId: string) => {
      let attempts = 0;
      const maxAttempts = 40; // 2 minutes max

      const poll = async () => {
        if (!isPolling || attempts >= maxAttempts) return;

        attempts++;
        const statusResp = await fetchMealPlanStatus(planId);

        if (statusResp.data?.status === 'Succeeded') {
          setIsPolling(false);
          await queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
          await queryClient.invalidateQueries({ queryKey: ['meal-plan-days'] });
          setCurrentPlanId(planId);
          return;
        }

        if (statusResp.data?.status === 'Failed') {
          setIsPolling(false);
          return;
        }

        // Continue polling every 3 seconds
        setTimeout(poll, 3000);
      };

      poll();
    },
    [isPolling, queryClient],
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const today = new Date();

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="app-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-3 text-[#3E2723]">Thực đơn dinh dưỡng</h1>
            <p className="mt-1 text-sm text-[#757575]">Kế hoạch bữa ăn cho mẹ và bé</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/app/meals/preferences')}
              className="flex items-center gap-1.5 rounded-full border border-[#FF9690]/30 px-3 py-2 text-xs font-semibold text-[#FF9690] transition-colors hover:bg-[#FDEEEE]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Sở thích
            </button>
            <button
              onClick={() => router.push('/app/meals/notes')}
              className="flex items-center gap-1.5 rounded-full border border-[#FF9690]/30 px-3 py-2 text-xs font-semibold text-[#FF9690] transition-colors hover:bg-[#FDEEEE]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Ghi chú
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="app-page-content">
        {/* Generation Status Banner */}
        <AnimatePresence>
          {isPolling && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF9690]/10 to-[#FFB5B0]/10 border border-[#FF9690]/20 px-6 py-4"
            >
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF9690] border-t-transparent" />
              <span className="text-sm font-semibold text-[#FF9690]">Đang tạo thực đơn AI...</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Calendar + Actions */}
          <div className="space-y-4">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card p-4"
            >
              {/* Month Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setFocusedDate((d) => subMonths(d, 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
                  aria-label="Tháng trước"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <h3 className="text-base font-bold text-[#3E2723]">
                  {format(focusedDate, 'MMMM yyyy', { locale: vi })}
                </h3>
                <button
                  onClick={() => setFocusedDate((d) => addMonths(d, 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
                  aria-label="Tháng sau"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="text-center text-xs font-bold text-[#999]">
                    {label}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, focusedDate);
                  const isToday = isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDate);
                  const hasMeals = mealDatesMap.has(format(day, 'yyyy-MM-dd'));
                  const isSunday = day.getDay() === 0;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative flex aspect-square flex-col items-center justify-center rounded-full text-sm
                        transition-all duration-200
                        ${!isCurrentMonth ? 'text-[#CCC]' : ''}
                        ${isSunday && isCurrentMonth ? 'text-[#C44545]' : isCurrentMonth ? 'text-[#3E2723]' : ''}
                        ${isSelected ? 'bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-md' : ''}
                        ${!isSelected && isToday ? 'ring-2 ring-[#FF9690] ring-offset-1' : ''}
                        hover:bg-[#FDEEEE]
                      `}
                    >
                      <span className={`
                        font-semibold
                        ${isSelected ? 'text-white' : isToday && !isSelected ? 'text-[#FF9690]' : ''}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {hasMeals && (
                        <div className="absolute bottom-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#FF9690]'}`} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsGenerateOpen(true)}
                className="btn btn-primary flex-1 rounded-2xl px-5 py-3 text-sm"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Tạo thực đơn AI
              </button>
              <button
                onClick={() => router.push(`/app/meals/${format(selectedDate, 'yyyy-MM-dd')}`)}
                className="flex h-12 items-center gap-2 rounded-2xl border-2 border-[#FF9690] px-4 text-sm font-semibold text-[#FF9690] transition-colors hover:bg-[#FDEEEE]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                </svg>
                Chi tiết
              </button>
            </div>

            {/* Existing Meal Plans */}
            {plansLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : mealPlans.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#3E2723]">Thực đơn đã tạo</h4>
                {mealPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card flex items-center justify-between p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setCurrentPlanId(plan.id)}
                  >
                    <div>
                      <h5 className="text-sm font-bold text-[#3E2723]">{plan.title}</h5>
                      <p className="text-xs text-[#757575] mt-0.5">
                        {plan.startDate && plan.endDate
                          ? `${format(parseISO(plan.startDate), 'dd/MM')} - ${format(parseISO(plan.endDate), 'dd/MM/yyyy')}`
                          : 'Không có thông tin ngày'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        plan.status === 'Succeeded'
                          ? 'success'
                          : plan.status === 'Generating'
                          ? 'warning'
                          : plan.status === 'Failed'
                          ? 'error'
                          : 'default'
                      }
                    >
                      {plan.status === 'Succeeded'
                        ? 'Hoàn thành'
                        : plan.status === 'Generating'
                        ? 'Đang tạo'
                        : plan.status === 'Failed'
                        ? 'Thất bại'
                        : 'Chờ'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right Column: Selected Day Meals */}
          <div>
            {daysLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : !currentPlanId || mealPlans.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                    <line x1="6" y1="1" x2="6" y2="4"/>
                    <line x1="10" y1="1" x2="10" y2="4"/>
                    <line x1="14" y1="1" x2="14" y2="4"/>
                  </svg>
                }
                title="Chưa có thực đơn dinh dưỡng"
                description="Hãy tạo thực đơn AI được cá nhân hóa cho hành trình thai kỳ của bạn"
                action={
                  <button
                    onClick={() => setIsGenerateOpen(true)}
                    className="btn btn-primary rounded-full px-6 py-3 text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Tạo thực đơn ngay
                  </button>
                }
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Date Header */}
                <div className="card p-4">
                  <h3 className="text-lg font-bold text-[#3E2723]">
                    {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </h3>
                  <p className="text-sm text-[#757575] mt-1">
                    {selectedDayMeals.length} món ăn
                  </p>
                </div>

                {/* Meals by type */}
                {MEAL_TYPE_ORDER.map((type) => {
                  const meals = selectedDayMealsByType[type];
                  if (meals.length === 0) return null;

                  return (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-6 rounded-full ${
                          type === 'Breakfast' ? 'bg-[#F97316]' :
                          type === 'Lunch' ? 'bg-[#22C55E]' :
                          type === 'Dinner' ? 'bg-[#EF4444]' :
                          'bg-[#3B82F6]'
                        }`} />
                        <h4 className="text-sm font-bold text-[#3E2723]">
                          {MEAL_TYPE_LABELS[type]}
                        </h4>
                      </div>
                      {meals.map((meal) => (
                        <MealCard key={meal.id} meal={meal} />
                      ))}
                    </div>
                  );
                })}

                {selectedDayMeals.length === 0 && (
                  <div className="card p-8 text-center">
                    <p className="text-sm text-[#757575]">Chưa có thực đơn cho ngày này</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* AI Chat FAB */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-lg hover:shadow-xl transition-shadow z-40"
        aria-label="Mở AI dinh dưỡng"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      </button>

      {/* AI Chat Sheet */}
      <AiChatSheet isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Generate Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Tạo thực đơn AI"
        size="md"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3E2723]">
              Chọn số tuần
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((week) => (
                <button
                  key={week}
                  onClick={() => setGenerateWeeks(week)}
                  className={`
                    rounded-xl py-3 text-sm font-semibold transition-all
                    ${generateWeeks === week
                      ? 'bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-md'
                      : 'bg-[#F5F5F5] text-[#757575] hover:bg-[#FDEEEE]'
                    }
                  `}
                >
                  {week} tuần
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3E2723]">
              Ghi chú thêm <span className="font-normal text-[#999]">(tùy chọn)</span>
            </label>
            <textarea
              value={generateNotes}
              onChange={(e) => setGenerateNotes(e.target.value)}
              placeholder="Ví dụ: Không ăn cay, dị ứng tôm, thích ăn chay..."
              className="w-full rounded-xl border border-gray-200 bg-[#F5F5F5] px-4 py-3 text-sm text-[#3E2723] placeholder-[#999] outline-none focus:border-[#FF9690] focus:bg-white transition-colors resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsGenerateOpen(false)}
              className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="btn btn-primary flex-1 rounded-xl py-3 text-sm disabled:opacity-60"
            >
              {generateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang tạo...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Tạo ngay
                </>
              )}
            </button>
          </div>

          {generateMutation.isError && (
            <p className="text-xs text-[#C44545] text-center">
              Có lỗi xảy ra. Vui lòng thử lại.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
