'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { type MedicalDocument } from '@/types';
import { Badge } from '@/components/app/shared/Badge';
import { EmptyState } from '@/components/app/shared/EmptyState';
import { ConfirmDialog } from '@/components/app/shared/ConfirmDialog';

type SortOption = 'date' | 'type' | 'name';
type FilterType = 'all' | 'Khám thai' | 'Siêu âm' | 'Xét nghiệm máu' | 'Xét nghiệm nước tiểu' | 'Đơn thuốc' | 'Khác';

interface DocumentListProps {
  documents: MedicalDocument[];
  isLoading?: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  onUploadClick: () => void;
}

function getTypeBadgeVariant(typeName: string): 'info' | 'success' | 'warning' | 'error' | 'default' {
  const name = typeName.toLowerCase();
  if (name.includes('khám thai') || name.includes('prenatal')) return 'info';
  if (name.includes('siêu âm') || name.includes('ultrasound')) return 'success';
  if (name.includes('máu') || name.includes('blood')) return 'error';
  if (name.includes('nước tiểu') || name.includes('urine')) return 'warning';
  if (name.includes('đơn thuốc') || name.includes('prescription')) return 'default';
  return 'default';
}

function getTypeIcon(typeName: string): string {
  const name = typeName.toLowerCase();
  if (name.includes('khám thai') || name.includes('prenatal')) return '👶';
  if (name.includes('siêu âm') || name.includes('ultrasound')) return '📷';
  if (name.includes('máu') || name.includes('blood')) return '🩸';
  if (name.includes('nước tiểu') || name.includes('urine')) return '💧';
  if (name.includes('đơn thuốc') || name.includes('prescription')) return '💊';
  return '📋';
}

function getTypeBgColor(typeName: string): string {
  const name = typeName.toLowerCase();
  if (name.includes('khám thai') || name.includes('prenatal')) return 'bg-[#E3F2FD]';
  if (name.includes('siêu âm') || name.includes('ultrasound')) return 'bg-[#E8F5E9]';
  if (name.includes('máu') || name.includes('blood')) return 'bg-[#FFEBEE]';
  if (name.includes('nước tiểu') || name.includes('urine')) return 'bg-[#FFF3E0]';
  if (name.includes('đơn thuốc') || name.includes('prescription')) return 'bg-[#F3E5F5]';
  return 'bg-gray-50';
}

export function DocumentList({
  documents,
  isLoading,
  onDelete,
  onToggleFavorite,
  onUploadClick,
}: DocumentListProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [deleteTarget, setDeleteTarget] = useState<MedicalDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = [...documents];

    // Filter
    if (filterType !== 'all') {
      result = result.filter((doc) => doc.documentTypeName === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime();
        case 'type':
          return a.documentTypeName.localeCompare(b.documentTypeName);
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [documents, sortBy, filterType]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, MedicalDocument[]> = {};
    for (const doc of filteredAndSorted) {
      const dateKey = format(parseISO(doc.documentDate), 'yyyy-MM-dd', { locale: vi });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(doc);
    }
    return groups;
  }, [filteredAndSorted]);

  const dateGroupLabels: Record<string, string> = {};
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  for (const key of Object.keys(groupedByDate)) {
    if (key === today) dateGroupLabels[key] = 'Hôm nay';
    else if (key === yesterday) dateGroupLabels[key] = 'Hôm qua';
    else dateGroupLabels[key] = format(parseISO(key), "dd MMMM yyyy", { locale: vi });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (isLoading && documents.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        }
        title="Chưa có hồ sơ y tế"
        description="Tải lên hồ sơ khám thai, siêu âm hoặc kết quả xét nghiệm để lưu trữ và OCR tự động trích xuất dữ liệu."
        action={
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tải lên hồ sơ
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls: Sort + Filter */}
      <div className="flex items-center justify-between gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#999]">Sắp xếp:</span>
          <div className="flex rounded-full bg-white p-1 shadow-sm">
            {(
              [
                { key: 'date', label: 'Ngày' },
                { key: 'type', label: 'Loại' },
                { key: 'name', label: 'Tên' },
              ] as { key: SortOption; label: string }[]
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  sortBy === opt.key
                    ? 'bg-gradient-to-r from-[#FF9690] to-[#FF7A74] text-white shadow-sm'
                    : 'text-[#999] hover:text-[#3E2723]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-[#757575] shadow-sm focus:border-[#FF9690] focus:outline-none"
        >
          <option value="all">Tất cả</option>
          <option value="Khám thai">Khám thai</option>
          <option value="Siêu âm">Siêu âm</option>
          <option value="Xét nghiệm máu">Xét nghiệm máu</option>
          <option value="Xét nghiệm nước tiểu">Xét nghiệm nước tiểu</option>
          <option value="Đơn thuốc">Đơn thuốc</option>
          <option value="Khác">Khác</option>
        </select>
      </div>

      {/* Document List grouped by date */}
      {Object.entries(groupedByDate).map(([dateKey, docs]) => (
        <div key={dateKey}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#999]">
            {dateGroupLabels[dateKey] ?? dateKey}
          </p>
          <div className="space-y-3">
            <AnimatePresence>
              {docs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-md"
                >
                  <Link href={`/app/records/${doc.id}`} className="block p-5">
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${getTypeBgColor(doc.documentTypeName)}`}>
                        <span className="text-2xl">{getTypeIcon(doc.documentTypeName)}</span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-bold text-[#3E2723]">
                            {doc.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              void onToggleFavorite(doc.id, !doc.isFavorite);
                            }}
                            className="flex-shrink-0 p-1 transition-transform hover:scale-110 active:scale-95"
                            aria-label={doc.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                          >
                            {doc.isFavorite ? (
                              <svg className="h-4 w-4 text-[#FFB800]" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="1">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 text-[#ccc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            )}
                          </button>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge variant={getTypeBadgeVariant(doc.documentTypeName)}>
                            {doc.documentTypeName}
                          </Badge>
                          <span className="text-xs text-[#999]">
                            {format(parseISO(doc.documentDate), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                          </span>
                          {doc.files.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-[#999]">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              {doc.files.length} tệp
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chevron */}
                      <svg className="h-4 w-4 flex-shrink-0 text-[#ccc] transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </Link>

                  {/* Delete Action */}
                  <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteTarget(doc);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                      aria-label="Xóa tài liệu"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa tài liệu"
        message={`Bạn có chắc muốn xóa tài liệu "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
