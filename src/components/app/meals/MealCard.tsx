'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/app/shared/Badge';
import type { MealItem, MealType } from '@/types';

type MealCardProps = {
  meal: MealItem;
  compact?: boolean;
};

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  Breakfast: 'Bữa sáng',
  Lunch: 'Bữa trưa',
  Dinner: 'Bữa tối',
  Snack: 'Bữa phụ',
  Morning: 'Bữa sáng',
  Afternoon: 'Bữa trưa',
  Evening: 'Bữa tối',
};

const MEAL_TYPE_COLORS: Record<MealType, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  Breakfast: 'warning',
  Lunch: 'success',
  Dinner: 'error',
  Snack: 'info',
  Morning: 'warning',
  Afternoon: 'success',
  Evening: 'error',
};

function getNutrient(meal: MealItem, code: string): number {
  const found = meal.nutrients.find((n) => n.code.toUpperCase() === code.toUpperCase());
  return found?.value ?? 0;
}

export function MealCard({ meal, compact = false }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const calories = meal.calories ?? 0;
  const protein = getNutrient(meal, 'PROT');
  const carbs = getNutrient(meal, 'CARB');
  const fat = getNutrient(meal, 'FAT');

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(255,150,144,0.15)' }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden"
    >
      <div
        className="flex gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Image / Placeholder */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#FFF3E0]">
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="w-8 h-8 text-[#FF9690]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-[#3E2723] leading-tight line-clamp-2">
              {meal.title}
            </h4>
            <Badge variant={MEAL_TYPE_COLORS[meal.mealType]}>
              {MEAL_TYPE_LABELS[meal.mealType]}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3.5 h-3.5 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-xs font-semibold text-[#EF4444]">{calories} calo</span>
          </div>

          {/* Compact nutrients */}
          {!compact && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-0.5 text-xs text-[#3B82F6]">
                <span className="font-semibold">{Math.round(protein)}g</span>
                <span className="text-[10px] text-[#999]">đạm</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs text-[#F97316]">
                <span className="font-semibold">{Math.round(carbs)}g</span>
                <span className="text-[10px] text-[#999]">carb</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs text-[#22C55E]">
                <span className="font-semibold">{Math.round(fat)}g</span>
                <span className="text-[10px] text-[#999]">béo</span>
              </span>
            </div>
          )}

          {/* Expand indicator */}
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs text-[#999]">
              {expanded ? 'Thu gọn' : 'Xem chi tiết'}
            </span>
            <motion.svg
              animate={{ rotate: expanded ? 180 : 0 }}
              className="w-3.5 h-3.5 text-[#999]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-4 py-4 space-y-4">
              {/* Description */}
              {meal.description && (
                <div>
                  <h5 className="text-xs font-bold uppercase text-[#999] mb-1">Mô tả</h5>
                  <p className="text-sm text-[#757575] leading-relaxed">
                    {meal.description}
                  </p>
                </div>
              )}

              {/* Ingredients */}
              {meal.ingredients && (
                <div>
                  <h5 className="text-xs font-bold uppercase text-[#999] mb-1.5">Nguyên liệu</h5>
                  <div className="text-sm text-[#757575] leading-relaxed whitespace-pre-line">
                    {meal.ingredients}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {meal.instructions && (
                <div>
                  <h5 className="text-xs font-bold uppercase text-[#999] mb-1.5">Cách chế biến</h5>
                  <div className="text-sm text-[#757575] leading-relaxed whitespace-pre-line">
                    {meal.instructions}
                  </div>
                </div>
              )}

              {/* Full nutrients */}
              {meal.nutrients.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase text-[#999] mb-2">Giá trị dinh dưỡng</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {meal.nutrients.map((n) => (
                      <div
                        key={n.code}
                        className="flex items-center justify-between rounded-lg bg-[#F5F5F5] px-3 py-2"
                      >
                        <span className="text-xs text-[#757575]">{n.code}</span>
                        <span className="text-xs font-semibold text-[#3E2723]">
                          {n.value}{n.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
