'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import { type WeightLog, type WeightGoalRange } from '@/types';
import { EmptyState } from '@/components/app/shared/EmptyState';

type WeightChartProps = {
  logs: WeightLog[];
  goal?: WeightGoalRange | null;
  isLoading?: boolean;
};

const CHART_LINE_COLOR = '#FF9690';
const CHART_LINE_DARK = '#FF7A74';

export function WeightChart({ logs, goal, isLoading }: WeightChartProps) {
  const chartData = useMemo(() => {
    if (!logs || logs.length < 2) return [];

    return [...logs]
      .sort((a, b) => new Date(a.loggedOn).getTime() - new Date(b.loggedOn).getTime())
      .map((log) => ({
        date: log.loggedOn,
        weight: log.weightKg,
        displayDate: format(parseISO(log.loggedOn), 'dd/MM', { locale: vi }),
        displayDateFull: format(parseISO(log.loggedOn), 'dd MMMM yyyy', { locale: vi }),
      }));
  }, [logs]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const weights = chartData.map((d) => d.weight);
    const min = weights.reduce((m, v) => Math.min(m, v), Infinity);
    const max = weights.reduce((m, v) => Math.max(m, v), -Infinity);
    const padding = (max - min) * 0.15 + 2;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-56 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!logs || logs.length < 2) {
    return (
      <div className="card p-4">
        <h3 className="text-base font-bold text-[#3E2723] mb-3">Biểu đồ cân nặng</h3>
        <EmptyState
          icon={
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-3 3" />
            </svg>
          }
          title="Chưa đủ dữ liệu"
          description="Cần ít nhất 2 bản ghi cân nặng để hiển thị biểu đồ."
        />
      </div>
    );
  }

  const currentWeight = chartData[chartData.length - 1]?.weight ?? 0;
  const prePregnancyWeight = goal?.prePregnancyWeightKg ?? 0;
  const goalMinGain = goal?.recommendedTotalGainMin ?? 0;
  const goalMaxGain = goal?.recommendedTotalGainMax ?? 0;

  const goalMinWeight = prePregnancyWeight > 0 ? prePregnancyWeight + goalMinGain : 0;
  const goalMaxWeight = prePregnancyWeight > 0 ? prePregnancyWeight + goalMaxGain : 0;

  const hasGoalRange = goalMinWeight > 0 && goalMaxWeight > 0;

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { displayDateFull: string; weight: number } }> }) {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
        <p className="text-xs text-[#757575]">{data.displayDateFull}</p>
        <p className="mt-1 text-lg font-bold text-[#3E2723]">
          {data.weight.toFixed(1)} kg
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="card p-4"
    >
      <h3 className="text-base font-bold text-[#3E2723] mb-3">Biểu đồ cân nặng</h3>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: '#999', fontFamily: 'Nunito' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: '#999', fontFamily: 'Nunito' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Goal range reference lines */}
          {hasGoalRange && (
            <>
              <ReferenceLine
                y={goalMinWeight}
                stroke="#B8E6D4"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                label={{
                  value: `Mục tiêu tối thiểu`,
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: '#8FD4BC',
                  fontFamily: 'Nunito',
                }}
              />
              <ReferenceLine
                y={goalMaxWeight}
                stroke="#B8E6D4"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                label={{
                  value: `Mục tiêu tối đa`,
                  position: 'insideTopRight',
                  fontSize: 9,
                  fill: '#8FD4BC',
                  fontFamily: 'Nunito',
                }}
              />
            </>
          )}

          <Line
            type="monotone"
            dataKey="weight"
            stroke={CHART_LINE_COLOR}
            strokeWidth={2.5}
            dot={{ r: 3, fill: CHART_LINE_DARK, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CHART_LINE_DARK, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>

      {hasGoalRange && (
        <div className="mt-3 flex items-center gap-1 text-xs text-[#757575]">
          <span className="inline-block h-2 w-4 rounded-sm bg-[#B8E6D4]" />
          <span>Phạm vi tăng cân khuyến nghị ({goalMinWeight.toFixed(1)} - {goalMaxWeight.toFixed(1)} kg)</span>
        </div>
      )}
    </motion.div>
  );
}
