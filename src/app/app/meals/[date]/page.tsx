'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  format,
  parseISO,
  subDays,
  addDays,
} from 'date-fns';
import { vi } from 'date-fns/locale';

import { apiClient } from '@/lib/api-client';
import { usePregnancy } from '@/contexts/PregnancyContext';
import type { MealPlan, MealDay, MealItem, MealNutrient, ApiResponse } from '@/types';
import { MealCard } from '@/components/app/meals/MealCard';
import { NutrientBar } from '@/components/app/meals/NutrientBar';
import { EmptyState } from '@/components/app/shared/EmptyState';
import { LoadingSpinner } from '@/components/app/shared/LoadingSpinner';

// ─── API helpers ───────────────────────────────────────────────────────────────

async function fetchMealPlans(pregnancyId: string): Promise<ApiResponse<MealPlan[]>> {
  return apiClient.get<MealPlan[]>(`/api/meal-plans`, { pregnancyId });
}

async function fetchMealPlanDays(planId: string): Promise<ApiResponse<MealDay[]>> {
  return apiClient.get<MealDay[]>(`/api/meal-plans/${planId}/days`);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MEAL_TYPE_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const MEAL_TYPE_LABELS: Record<string, string> = {
  Breakfast: 'Bữa sáng',
  Lunch: 'Bữa trưa',
  Dinner: 'Bữa tối',
  Snack: 'Bữa phụ',
};
const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: '#F97316',
  Lunch: '#22C55E',
  Dinner: '#EF4444',
  Snack: '#3B82F6',
};

export default function MealDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const router = useRouter();
  const { pregnancy } = usePregnancy();

  const selectedDate = parseISO(date);

  // Fetch meal plans
  const {
    data: plansResponse,
    isLoading: plansLoading,
  } = useQuery({
    queryKey: ['meal-plans', pregnancy?.id],
    queryFn: () => fetchMealPlans(pregnancy!.id),
    enabled: !!pregnancy?.id,
  });

  const mealPlans: MealPlan[] = plansResponse?.data ?? [];
  const latestPlan = mealPlans.find((p) => p.status === 'Succeeded') ?? mealPlans[0];

  // Fetch meal plan days
  const {
    data: daysResponse,
    isLoading: daysLoading,
  } = useQuery({
    queryKey: ['meal-plan-days', latestPlan?.id],
    queryFn: () => fetchMealPlanDays(latestPlan!.id),
    enabled: !!latestPlan?.id,
  });

  const mealDays: MealDay[] = daysResponse?.data ?? [];

  // Find the day data for the selected date
  const dayKey = format(selectedDate, 'yyyy-MM-dd');
  const dayData = mealDays.find((d) => d.date === dayKey);
  const meals: MealItem[] = dayData?.meals ?? [];

  // Group meals by type
  const mealsByType = MEAL_TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = meals.filter((m) => m.mealType === type);
      return acc;
    },
    {} as Record<string, MealItem[]>,
  );

  // Compute nutrient totals
  const nutrientTotals = meals.reduce(
    (totals, meal) => {
      (meal.nutrients ?? []).forEach((n) => {
        totals[n.code] = (totals[n.code] ?? 0) + n.value;
      });
      totals['CAL'] = (totals['CAL'] ?? 0) + (meal.calories ?? 0);
      return totals;
    },
    {} as Record<string, number>,
  );

  const totalCalories = nutrientTotals['CAL'] ?? meals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const totalProtein = nutrientTotals['PROT'] ?? 0;
  const totalCarbs = nutrientTotals['CARB'] ?? 0;
  const totalFat = nutrientTotals['FAT'] ?? 0;

  // Loading state
  if (plansLoading || daysLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  // No meal plan
  if (!latestPlan) {
    return (
      <div>
        <div className="app-page-header">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#757575] hover:text-[#FF9690] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Quay lại
          </button>
          <h1 className="heading-3 text-[#3E2723]">
            {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
          </h1>
        </div>
        <div className="app-page-content">
          <EmptyState
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              </svg>
            }
            title="Chưa có thực đơn"
            description="Hãy tạo thực đơn AI trước để xem chi tiết bữa ăn"
            action={
              <button
                onClick={() => router.push('/app/meals')}
                className="btn btn-primary rounded-full px-6 py-3 text-sm"
              >
                Tạo thực đơn
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="app-page-header">
        <button
          onClick={() => router.push('/app/meals')}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#757575] hover:text-[#FF9690] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Quay lại
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-3 text-[#3E2723]">
              {format(selectedDate, 'EEEE', { locale: vi })}
            </h1>
            <p className="text-sm text-[#757575]">
              {format(selectedDate, 'dd/MM/yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/app/meals/${format(subDays(selectedDate, 1), 'yyyy-MM-dd')}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
              aria-label="Ngày trước"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => router.push(`/app/meals/${format(addDays(selectedDate, 1), 'yyyy-MM-dd')}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
              aria-label="Ngày sau"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-page-content space-y-6">
        {meals.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              </svg>
            }
            title="Chưa có thực đơn cho ngày này"
            description="Chọn ngày khác hoặc tạo thực đơn mới"
            action={
              <button
                onClick={() => router.push('/app/meals')}
                className="btn btn-primary rounded-full px-6 py-3 text-sm"
              >
                Chọn ngày khác
              </button>
            }
          />
        ) : (
          <>
            {/* Meal Sections */}
            {MEAL_TYPE_ORDER.map((type) => {
              const typeMeals = mealsByType[type];
              if (typeMeals.length === 0) return null;

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${MEAL_TYPE_COLORS[type]}20` }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: MEAL_TYPE_COLORS[type] }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {type === 'Breakfast' && (
                          <>
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </>
                        )}
                        {type === 'Lunch' && (
                          <>
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                            <line x1="6" y1="1" x2="6" y2="4"/>
                            <line x1="10" y1="1" x2="10" y2="4"/>
                          </>
                        )}
                        {type === 'Dinner' && (
                          <>
                            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                            <path d="M12 6v6l4 2"/>
                          </>
                        )}
                        {type === 'Snack' && (
                          <>
                            <path d="M20 12V22H4V12"/>
                            <path d="M22 7H2v5h20V7z"/>
                            <path d="M12 22V7"/>
                          </>
                        )}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#3E2723]">
                        {MEAL_TYPE_LABELS[type]}
                      </h3>
                      <p className="text-xs text-[#757575]">
                        {typeMeals.length} món
                        {typeMeals.reduce((s, m) => s + (m.calories ?? 0), 0) > 0 &&
                          ` \u2022 ${typeMeals.reduce((s, m) => s + (m.calories ?? 0), 0)} calo`}
                      </p>
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="space-y-3 pl-0">
                    {typeMeals.map((meal) => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {/* Nutrient Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-5"
            >
              <h3 className="text-sm font-bold text-[#3E2723] mb-4">
                Tổng dinh dưỡng trong ngày
              </h3>
              <NutrientBar
                current={{
                  protein: totalProtein,
                  carbs: totalCarbs,
                  fat: totalFat,
                  calories: totalCalories,
                }}
              />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
