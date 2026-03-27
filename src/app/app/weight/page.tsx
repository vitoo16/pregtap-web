'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { parseISO, differenceInDays } from 'date-fns';
import Link from 'next/link';

import { apiClient } from '@/lib/api-client';
import { usePregnancy } from '@/contexts/PregnancyContext';
import { type WeightLog, type WeightGoalRange, type ApiResponse } from '@/types';

import { WeightChart } from '@/components/app/weight/WeightChart';
import { WeightGoalCard } from '@/components/app/weight/WeightGoalCard';
import { WeightHistory } from '@/components/app/weight/WeightHistory';
import { WeightForm, type WeightFormData } from '@/components/app/weight/WeightForm';
import { EmptyState } from '@/components/app/shared/EmptyState';

// ─── API fetch helpers ──────────────────────────────────────────────────────

async function fetchWeightLogs(): Promise<ApiResponse<WeightLog[]>> {
  return apiClient.get<WeightLog[]>('/api/weight-logs');
}

async function fetchWeightGoal(): Promise<ApiResponse<WeightGoalRange>> {
  return apiClient.get<WeightGoalRange>('/api/weight-goals');
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function WeightPage() {
  const { pregnancy, progress } = usePregnancy();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editLog, setEditLog] = useState<WeightLog | null>(null);

  // Queries
  const {
    data: logsResponse,
    isLoading: logsLoading,
    error: logsError,
  } = useQuery({
    queryKey: ['weight-logs'],
    queryFn: fetchWeightLogs,
    enabled: !!pregnancy,
  });

  const {
    data: goalResponse,
    isLoading: goalLoading,
  } = useQuery({
    queryKey: ['weight-goals'],
    queryFn: fetchWeightGoal,
    enabled: !!pregnancy,
  });

  // Derived data
  const weightLogs = logsResponse?.data ?? [];
  const weightGoal = goalResponse?.data;

  // Sort logs for latest/current weight
  const sortedLogs = useMemo(
    () =>
      [...weightLogs].sort(
        (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
      ),
    [weightLogs],
  );

  const latestLog = sortedLogs[0] ?? null;
  const currentWeight = latestLog?.weightKg ?? null;

  // 2-month change
  const twoMonthChange = useMemo(() => {
    if (weightLogs.length < 2) return null;
    const today = new Date();
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const recent = sortedLogs.find((log) => {
      const d = parseISO(log.logDate);
      return d <= today && d >= twoMonthsAgo;
    });

    const older = [...sortedLogs].reverse().find((log) => {
      const d = parseISO(log.logDate);
      return d < twoMonthsAgo;
    });

    if (!recent || !older) return null;
    return {
      value: recent.weightKg - older.weightKg,
      from: older,
      to: recent,
    };
  }, [sortedLogs, weightLogs.length]);

  // Streak calculation
  const streakDays = useMemo(() => {
    if (sortedLogs.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = today;

    for (const log of sortedLogs) {
      const logDate = parseISO(log.logDate);
      logDate.setHours(0, 0, 0, 0);
      const diff = differenceInDays(currentDate, logDate);

      if (diff === 0) {
        streak++;
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diff === 1 && streak === 0) {
        // Allow starting from yesterday
        streak++;
        currentDate = new Date(logDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [sortedLogs]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: WeightFormData) =>
      apiClient.post<WeightLog>('/api/weight-logs', {
        logDate: data.logDate,
        weightKg: data.weightKg,
        notes: data.notes,
        source: data.source,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WeightFormData> }) =>
      apiClient.put<WeightLog>(`/api/weight-logs/${id}`, {
        weightKg: data.weightKg,
        notes: data.notes,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/api/weight-logs/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['weight-logs'] });
    },
  });

  // Handlers
  function handleOpenAdd() {
    setEditLog(null);
    setIsFormOpen(true);
  }

  function handleEdit(log: WeightLog) {
    setEditLog(log);
    setIsFormOpen(true);
  }

  function handleFormClose() {
    setIsFormOpen(false);
    setEditLog(null);
  }

  async function handleFormSubmit(data: WeightFormData) {
    if (editLog) {
      await updateMutation.mutateAsync({ id: editLog.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id);
  }

  if (!pregnancy) {
    return (
      <div className="app-page-content">
        <div className="app-page-header">
          <h1 className="heading-3 text-[#3E2723]">Theo dõi cân nặng</h1>
        </div>
        <EmptyState
          icon={
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          }
          title="Cần cập nhật thông tin thai kỳ"
          description="Vui lòng thiết lập thông tin thai kỳ trước để sử dụng tính năng theo dõi cân nặng."
          action={
            <Link
              href="/app/setup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              Thiết lập thai kỳ
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="app-page-content">
      {/* Page Header */}
      <div className="app-page-header mb-6 flex items-center justify-between">
        <div>
          <h1 className="heading-3 text-[#3E2723]">Theo dõi cân nặng</h1>
          <p className="mt-1 text-sm text-[#757575]">
            Tuần {progress?.currentWeek ?? '?'} của thai kỳ
          </p>
        </div>
      </div>

      {/* Error state */}
      {logsError && (
        <div className="mb-4 rounded-xl border border-[#FEE2E2] bg-[#FEE2E2] p-4">
          <p className="text-sm text-[#C44545]">
            Không thể tải dữ liệu cân nặng. Vui lòng thử lại.
          </p>
        </div>
      )}

      {/* Stats row */}
      {weightLogs.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {/* Current weight */}
          <div className="card p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">Hiện tại</p>
            <p className="mt-1 text-2xl font-extrabold text-[#FF9690]">
              {latestLog?.weightKg.toFixed(1) ?? '--'}
            </p>
            <p className="text-xs text-[#999]">kg</p>
          </div>

          {/* 2-month change */}
          <div className="card p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">2 tháng</p>
            <p
              className="mt-1 text-2xl font-extrabold"
              style={{
                color: twoMonthChange
                  ? twoMonthChange.value >= 0
                    ? '#16A34A'
                    : '#C44545'
                  : '#999',
              }}
            >
              {twoMonthChange
                ? `${twoMonthChange.value >= 0 ? '+' : ''}${twoMonthChange.value.toFixed(1)}`
                : '--'}
            </p>
            <p className="text-xs text-[#999]">kg</p>
          </div>

          {/* Streak */}
          <div className="card p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">Liên tục</p>
            <p className="mt-1 text-2xl font-extrabold text-[#3E2723]">{streakDays}</p>
            <p className="text-xs text-[#999]">ngày</p>
          </div>
        </div>
      )}

      {/* Weight goal card */}
      <div className="mb-4">
        <WeightGoalCard
          goal={weightGoal}
          currentWeight={currentWeight}
          isLoading={goalLoading}
        />
      </div>

      {/* Empty state for no logs */}
      {weightLogs.length === 0 && !logsLoading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card mb-6 overflow-hidden"
        >
          <EmptyState
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            }
            title="Sẵn sàng bắt đầu?"
            description="Bắt đầu theo dõi hành trình cân nặng của bạn bằng cách ghi lại cân nặng đầu tiên."
            action={
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Thêm cân nặng
              </button>
            }
          />
        </motion.div>
      )}

      {/* Weight chart (needs 2+ data points) */}
      {weightLogs.length >= 2 && (
        <div className="mb-4">
          <WeightChart logs={weightLogs} goal={weightGoal} isLoading={logsLoading} />
        </div>
      )}

      {/* Weight history */}
      <div className="mb-24">
        <WeightHistory
          logs={weightLogs}
          isLoading={logsLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* FAB — floating action button */}
      {weightLogs.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={handleOpenAdd}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-lg md:shadow-xl"
          aria-label="Thêm cân nặng"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      )}

      {/* Weight form modal */}
      <WeightForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialLog={editLog}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
