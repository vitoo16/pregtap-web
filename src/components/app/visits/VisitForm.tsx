'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { type PrenatalVisit, type VisitType } from '@/types';

type VisitFormValues = {
  visitDate: string;
  visitType: VisitType;
  location: string;
  notes: string;
};

const VISIT_TYPES: { value: VisitType; label: string }[] = [
  { value: 'Routine', label: 'Khám định kỳ' },
  { value: 'Emergency', label: 'Khám bất thường' },
  { value: 'Ultrasound', label: 'Siêu âm' },
  { value: 'Lab', label: 'Xét nghiệm' },
  { value: 'Other', label: 'Khác' },
];

type VisitFormProps = {
  visit?: PrenatalVisit | null;
  onSave: (data: VisitFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export function VisitForm({ visit, onSave, onCancel, isLoading = false }: VisitFormProps) {
  const isEditMode = !!visit;

  const [formData, setFormData] = useState<VisitFormValues>({
    visitDate: visit ? (() => {
      try {
        const d = parseISO(visit.visitDate);
        return format(d, 'yyyy-MM-dd');
      } catch {
        return format(new Date(visit.visitDate), 'yyyy-MM-dd');
      }
    })() : format(new Date(), 'yyyy-MM-dd'),
    visitType: visit?.visitType ?? 'Routine',
    location: visit?.location ?? '',
    notes: visit?.notes ?? '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!formData.visitDate) {
        setError('Vui lòng chọn ngày khám.');
        return;
      }

      try {
        await onSave(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lưu thất bại. Vui lòng thử lại.');
      }
    },
    [formData, onSave],
  );

  const handleChange = useCallback(
    (field: keyof VisitFormValues, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError(null);
    },
    [error],
  );

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-5">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
          Ngày khám <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={formData.visitDate}
          onChange={(e) => handleChange('visitDate', e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#3E2723] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
          max={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      {/* Visit type */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
          Loại khám
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {VISIT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleChange('visitType', type.value)}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                formData.visitType === type.value
                  ? 'border-[#FF9690] bg-[#FDEEEE] text-[#FF7A74]'
                  : 'border-gray-200 text-[#757575] hover:border-[#FF9690]/30 hover:bg-[#FDEEEE]/30'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
          Nơi khám / Bác sĩ
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="VD: Bệnh viện Từ Dũ, BS. Nguyễn Văn A..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#999] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
          Ghi chú
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Mô tả chi tiết buổi khám, kết quả, lời dặn của bác sĩ..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#999] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white loading-spinner" />
              Đang lưu...
            </>
          ) : (
            isEditMode ? 'Lưu thay đổi' : 'Thêm lịch khám'
          )}
        </button>
      </div>
    </form>
  );
}
