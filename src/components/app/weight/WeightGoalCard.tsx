'use client';

import { motion } from 'framer-motion';
import { type WeightGoalRange } from '@/types';

type WeightGoalCardProps = {
  goal?: WeightGoalRange | null;
  currentWeight?: number | null;
  isLoading?: boolean;
};

const BMI_LABELS: Record<string, string> = {
  Underweight: 'Thiếu cân',
  Normal: 'Bình thường',
  Overweight: 'Thừa cân',
  Obese: 'Béo phì',
};

function getStatus(
  currentWeight: number | null | undefined,
  preWeight: number,
  minGain: number,
  maxGain: number,
) {
  if (currentWeight == null || preWeight <= 0) return null;
  const gained = currentWeight - preWeight;

  if (gained < minGain - 1) {
    return {
      label: 'Tăng cân chậm',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      ),
    };
  }
  if (gained > maxGain + 1) {
    return {
      label: 'Tăng cân nhanh',
      color: '#C44545',
      bgColor: '#FEE2E2',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      ),
    };
  }
  return {
    label: 'Đúng tiến độ',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  };
}

export function WeightGoalCard({ goal, currentWeight, isLoading }: WeightGoalCardProps) {
  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="h-20 rounded bg-gray-200" />
          <div className="h-3 w-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return null;
  }

  const preWeight = goal.prePregnancyWeightKg;
  const current = currentWeight ?? preWeight;
  const gained = current - preWeight;
  const minGain = goal.recommendedTotalGainMin;
  const maxGain = goal.recommendedTotalGainMax;
  const status = getStatus(currentWeight, preWeight, minGain, maxGain);

  // Progress calculation
  const targetMin = preWeight + minGain;
  const targetMax = preWeight + maxGain;
  const progressMin = preWeight > 0 ? Math.max(0, Math.min(100, ((current - preWeight) / minGain) * 100)) : 0;
  const progressMax = preWeight > 0 ? Math.max(0, Math.min(100, ((current - preWeight) / maxGain) * 100)) : 0;
  const progress = gained > 0 ? Math.min(progressMin, progressMax) : Math.max(0, gained / (minGain > 0 ? minGain : 1) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card p-5"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#757575] uppercase tracking-wide">Mục tiêu cân nặng</h3>
          <p className="mt-0.5 text-xs text-[#999]">
            BMI: {goal.bmi.toFixed(1)} — {BMI_LABELS[goal.bmiCategory] ?? goal.bmiCategory}
          </p>
        </div>
        {status && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ color: status.color, backgroundColor: status.bgColor }}
          >
            {status.icon}
            {status.label}
          </div>
        )}
      </div>

      {/* Weight ranges */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#FDEEEE] p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]">Trước thai kỳ</p>
          <p className="mt-1 text-lg font-bold text-[#3E2723]">{preWeight.toFixed(1)}</p>
          <p className="text-[10px] text-[#757575]">kg</p>
        </div>
        <div className="rounded-xl bg-[#FFF5F5] p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]">Hiện tại</p>
          <p className="mt-1 text-lg font-bold text-[#FF9690]">{current.toFixed(1)}</p>
          <p className="text-[10px] text-[#757575]">kg</p>
        </div>
        <div className="rounded-xl bg-[#E0F2F1] p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999]">Mục tiêu</p>
          <p className="mt-1 text-lg font-bold text-[#3E2723]">{minGain}–{maxGain}</p>
          <p className="text-[10px] text-[#757575]">kg tăng</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#757575]">
          <span>Tiến độ tăng cân</span>
          <span className="font-semibold">{gained >= 0 ? '+' : ''}{gained.toFixed(1)} / {minGain}–{maxGain} kg</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: gained < 0
                ? 'linear-gradient(90deg, #FF9690 0%, #FF7A74 100%)'
                : gained > maxGain + 1
                ? 'linear-gradient(90deg, #C44545 0%, #B03030 100%)'
                : 'linear-gradient(90deg, #B8E6D4 0%, #8FD4BC 100%)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
