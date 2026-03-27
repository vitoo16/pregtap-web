'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

import { EmptyState } from '@/components/app/shared/EmptyState';
import { ConfirmDialog } from '@/components/app/shared/ConfirmDialog';
import { type WeightLog } from '@/types';

type WeightHistoryProps = {
  logs: WeightLog[];
  isLoading?: boolean;
  onEdit: (log: WeightLog) => void;
  onDelete: (logId: string) => Promise<void>;
};

function getWeightChange(current: WeightLog, previous: WeightLog | null): { value: number; label: string; color: string } | null {
  if (!previous) return null;
  const diff = current.weightKg - previous.weightKg;
  const abs = Math.abs(diff);
  if (abs < 0.05) {
    return { value: diff, label: '0 kg', color: '#999' };
  }
  if (diff > 0) {
    return { value: diff, label: `+${abs.toFixed(1)} kg`, color: '#16A34A' };
  }
  return { value: diff, label: `-${abs.toFixed(1)} kg`, color: '#C44545' };
}

export function WeightHistory({ logs, isLoading, onEdit, onDelete }: WeightHistoryProps) {
  const [deleteTarget, setDeleteTarget] = useState<WeightLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort logs by date descending (newest first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#3E2723]">Nhật ký cân nặng</h3>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse card p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedLogs.length === 0) {
    return (
      <div>
        <h3 className="text-base font-bold text-[#3E2723] mb-3">Nhật ký cân nặng</h3>
        <EmptyState
          icon={
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          }
          title="Chưa có nhật ký cân nặng"
          description="Hãy thêm bản ghi cân nặng đầu tiên của bạn."
        />
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-base font-bold text-[#3E2723] mb-3">Nhật ký cân nặng</h3>
        <div className="space-y-2">
          <AnimatePresence>
            {sortedLogs.map((log, index) => {
              const previousLog = index < sortedLogs.length - 1 ? sortedLogs[index + 1] : null;
              const change = getWeightChange(log, previousLog);
              const logDate = parseISO(log.logDate);
              const isLogToday = isToday(logDate);
              const daysDiff = previousLog ? Math.abs(differenceInDays(logDate, parseISO(previousLog.logDate))) : 0;

              return (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.03 }}
                  className="card flex cursor-pointer items-center gap-3 p-4 transition-shadow hover:shadow-md"
                  onClick={() => onEdit(log)}
                >
                  {/* Date indicator */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FDEEEE]">
                    <span className={`text-xs font-bold ${isLogToday ? 'text-[#FF9690]' : 'text-[#757575]'}`}>
                      {isLogToday
                        ? 'Hnay'
                        : format(logDate, 'dd')}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[#3E2723]">
                        {log.weightKg.toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-[#999]">kg</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#999]">
                      <span>
                        {isLogToday
                          ? 'Hôm nay'
                          : format(logDate, 'MMMM yyyy', { locale: vi })}
                      </span>
                      {log.source === 'OCR' && (
                        <span className="rounded-full bg-[#FFF3E0] px-1.5 py-0.5 text-[10px] font-semibold text-[#F59E0B]">
                          OCR
                        </span>
                      )}
                      {log.notes && (
                        <span className="truncate text-[#BDBDBD] max-w-[120px]">· {log.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Change indicator */}
                  {change && previousLog && daysDiff > 0 && (
                    <div className="flex-shrink-0 text-right">
                      <span
                        className="text-xs font-bold"
                        style={{ color: change.color }}
                      >
                        {change.label}
                      </span>
                      <span className="ml-1 text-[10px] text-[#999]">
                        /{daysDiff}d
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(log);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-gray-100 hover:text-[#FF9690]"
                      aria-label="Chỉnh sửa"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(log);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#FEE2E2] hover:text-[#C44545]"
                      aria-label="Xóa"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa bản ghi cân nặng"
        message={`Bạn có chắc chắn muốn xóa bản ghi ngày ${deleteTarget ? format(parseISO(deleteTarget.logDate), 'dd/MM/yyyy') : ''}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
