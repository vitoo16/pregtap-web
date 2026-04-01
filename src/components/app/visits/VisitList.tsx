'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { apiClient } from '@/lib/api-client';
import { type PrenatalVisit, type VisitType, type ApiResponse } from '@/types';
import { Badge } from '@/components/app/shared/Badge';
import { EmptyState } from '@/components/app/shared/EmptyState';
import { usePregnancy } from '@/contexts/PregnancyContext';

async function fetchVisits(pregnancyId: string): Promise<ApiResponse<PrenatalVisit[]>> {
  return apiClient.get<PrenatalVisit[]>('/api/visits', { pregnancyId });
}

async function deleteVisit(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete(`/api/visits/${id}`);
}

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  Routine: 'Khám định kỳ',
  Emergency: 'Khám bất thường',
  Ultrasound: 'Siêu âm',
  Lab: 'Xét nghiệm',
  Other: 'Khác',
};

const VISIT_TYPE_COLORS: Record<VisitType, string> = {
  Routine: 'success',
  Emergency: 'error',
  Ultrasound: 'warning',
  Lab: 'info',
  Other: 'default',
};

const MONTH_ABBR: Record<number, string> = {
  0: 'T1', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6',
  6: 'T7', 7: 'T8', 8: 'T9', 9: 'T10', 10: 'T11', 11: 'T12',
};

function VisitCard({
  visit,
  index,
  onEdit,
  onDelete,
}: {
  visit: PrenatalVisit;
  index: number;
  onEdit: (visit: PrenatalVisit) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  let dateObj: Date;
  try {
    dateObj = parseISO(visit.visitDate);
    if (!isValid(dateObj)) dateObj = new Date(visit.visitDate);
  } catch {
    dateObj = new Date(visit.visitDate);
  }

  const dayNum = format(dateObj, 'd');
  const monthAbbr = MONTH_ABBR[dateObj.getMonth()] ?? '';
  const yearNum = format(dateObj, 'yyyy');
  const fullDate = format(dateObj, "EEEE, dd 'tháng' M năm yyyy", { locale: vi });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className="card flex items-stretch overflow-hidden p-0 transition-all hover:shadow-md">
        {/* Date badge */}
        <div
          className="flex w-16 flex-shrink-0 flex-col items-center justify-center py-4"
          style={{ background: 'linear-gradient(135deg, #FF9690 0%, #FF7A74 100%)' }}
        >
          <span className="text-2xl font-extrabold text-white leading-none">{dayNum}</span>
          <span className="mt-0.5 text-xs font-bold text-white/80">{monthAbbr}</span>
          <span className="text-[10px] text-white/60">{yearNum}</span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={VISIT_TYPE_COLORS[visit.visitType] as 'success' | 'error' | 'warning' | 'info' | 'default'}>
                {VISIT_TYPE_LABELS[visit.visitType]}
              </Badge>
              {visit.testCount && visit.testCount > 0 ? (
                <Badge variant="info">{visit.testCount} xét nghiệm</Badge>
              ) : null}
            </div>
          </div>

          <p className="text-sm font-bold text-[#3E2723]">{fullDate}</p>

          {visit.location && (
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#999]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate text-xs text-[#757575]">{visit.location}</span>
            </div>
          )}

          {visit.notes && (
            <p className="line-clamp-2 text-xs text-[#999]">{visit.notes}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onEdit(visit)}
              className="flex items-center gap-1.5 rounded-lg border border-[#FF9690]/30 px-3 py-1.5 text-xs font-semibold text-[#FF9690] transition-colors hover:bg-[#FDEEEE]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Sửa
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#C44545]/30 px-3 py-1.5 text-xs font-semibold text-[#C44545] transition-colors hover:bg-red-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-2 text-base font-bold text-[#3E2723]">Xóa lịch khám</h3>
              <p className="mb-5 text-sm text-[#757575]">
                Bạn có chắc muốn xóa lịch khám ngày {fullDate}? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    onDelete(visit.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type VisitListProps = {
  filterType?: VisitType | 'all';
  onEdit: (visit: PrenatalVisit) => void;
};

export function VisitList({ filterType = 'all', onEdit }: VisitListProps) {
  const { pregnancy } = usePregnancy();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['visits', pregnancy?.id],
    queryFn: () => fetchVisits(pregnancy!.id),
    enabled: !!pregnancy?.id,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVisit,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });

  const visits: PrenatalVisit[] = data?.success ? data.data ?? [] : [];
  const filtered =
    filterType === 'all' ? visits : visits.filter((v) => v.visitType === filterType);

  // Sort by date descending
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="h-8 w-8 rounded-full border-[3px] border-[#FF9690]/30 border-t-[#FF9690] loading-spinner" />
        <p className="text-sm text-[#999]">Đang tải lịch khám...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F1]">
          <svg className="h-6 w-6 text-[#C44545]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-sm text-[#757575]">Không thể tải lịch khám</p>
        <button
          onClick={() => void refetch()}
          className="mt-3 rounded-xl bg-[#FF9690] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#FF7A74]"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M7 8h4M7 12h4M7 16h4" />
            <circle cx="16" cy="14" r="3" />
          </svg>
        }
        title="Chưa có lịch khám nào"
        description={
          filterType === 'all'
            ? 'Thêm lịch khám thai để theo dõi các mốc quan trọng trong thai kỳ.'
            : 'Không có lịch khám nào thuộc loại này.'
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((visit, i) => (
        <VisitCard
          key={visit.id}
          visit={visit}
          index={i}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
