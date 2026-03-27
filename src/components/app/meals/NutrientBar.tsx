'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type NutrientData = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

type NutrientGoal = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

type NutrientBarProps = {
  current: NutrientData;
  goals?: NutrientGoal;
};

const NUTRIENTS: {
  key: keyof NutrientData;
  label: string;
  unit: string;
  color: string;
  bgColor: string;
  defaultGoal: number;
}[] = [
  { key: 'protein', label: 'Đạm', unit: 'g', color: '#3B82F6', bgColor: 'bg-blue-500', defaultGoal: 75 },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: '#F97316', bgColor: 'bg-orange-500', defaultGoal: 250 },
  { key: 'fat', label: 'Béo', unit: 'g', color: '#22C55E', bgColor: 'bg-green-500', defaultGoal: 65 },
  { key: 'calories', label: 'Calo', unit: '', color: '#EF4444', bgColor: 'bg-red-500', defaultGoal: 2200 },
];

export function NutrientBar({ current, goals }: NutrientBarProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3">
      {NUTRIENTS.map((nutrient) => {
        const value = current[nutrient.key];
        const goal = goals ? goals[nutrient.key] : nutrient.defaultGoal;
        const percentage = Math.min(100, Math.round((value / goal) * 100));

        return (
          <div key={nutrient.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#3E2723]">
                  {nutrient.label}
                </span>
              </div>
              <span className="text-xs text-[#757575]">
                <span className="font-semibold text-[#3E2723]">{Math.round(value)}</span>
                {nutrient.unit && <span className="text-[10px]">{nutrient.unit}</span>}
                {' / '}
                <span>{goal}{nutrient.unit}</span>
              </span>
            </div>

            {/* Bar background */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#F5F5F5]">
              {/* Filled bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: animated ? `${percentage}%` : '0%' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className={`h-full rounded-full ${nutrient.bgColor}`}
                style={{ minWidth: percentage > 0 ? '4px' : '0' }}
              />
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-[#FDEEEE] px-4 py-3">
        <span className="text-sm font-semibold text-[#3E2723]">Tổng năng lượng</span>
        <span className="text-sm font-bold text-[#FF9690]">
          {Math.round(current.calories)} / {goals ? goals.calories : 2200} calo
        </span>
      </div>
    </div>
  );
}
