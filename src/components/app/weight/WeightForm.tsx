'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';

import { Modal } from '@/components/app/shared/Modal';
import { type WeightLog } from '@/types';

type WeightFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WeightFormData) => Promise<void>;
  initialLog?: WeightLog | null;
  isLoading?: boolean;
};

export type WeightFormData = {
  logDate: string;
  weightKg: number;
  notes?: string;
  source: 'Manual' | 'OCR';
};

export function WeightForm({ isOpen, onClose, onSubmit, initialLog, isLoading }: WeightFormProps) {
  const isEditMode = !!initialLog;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [logDate, setLogDate] = useState(todayStr);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [source] = useState<'Manual' | 'OCR'>(initialLog?.source ?? 'Manual');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or initialLog changes
  useEffect(() => {
    if (isOpen) {
      if (initialLog) {
        setLogDate((initialLog.loggedOn || initialLog.logDate || '').split('T')[0]);
        setWeight(initialLog.weightKg.toFixed(1));
        setNotes(initialLog.notes ?? '');
      } else {
        setLogDate(todayStr);
        setWeight('');
        setNotes('');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialLog, todayStr]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!logDate) {
      newErrors.logDate = 'Vui lòng chọn ngày';
    } else {
      const selected = new Date(logDate);
      selected.setHours(23, 59, 59, 999);
      if (selected > new Date()) {
        newErrors.logDate = 'Ngày không thể là ngày trong tương lai';
      }
    }

    const weightNum = parseFloat(weight.replace(',', '.'));
    if (!weight.trim()) {
      newErrors.weight = 'Vui lòng nhập cân nặng';
    } else if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      newErrors.weight = 'Cân nặng phải từ 20 đến 300 kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        logDate: logDate,
        weightKg: parseFloat(weight.replace(',', '.')),
        notes: notes.trim() || undefined,
        source,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleWeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    // Allow digits, one decimal point
    if (/^\d*\.?\d*$/.test(val) || val === '') {
      setWeight(val);
      if (errors.weight) setErrors((prev) => ({ ...prev, weight: '' }));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa cân nặng' : 'Thêm cân nặng'}
      size="md"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {/* Date */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">Ngày</label>
          <div className="relative">
            <input
              type="date"
              value={logDate}
              onChange={(e) => {
                setLogDate(e.target.value);
                if (errors.logDate) setErrors((prev) => ({ ...prev, logDate: '' }));
              }}
              max={todayStr}
              disabled={isEditMode}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-sm font-medium text-[#3E2723] transition-colors focus:outline-none focus:ring-0 ${
                isEditMode
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-[#999]'
                  : errors.logDate
                  ? 'border-[#C44545] focus:border-[#C44545]'
                  : 'border-gray-100 focus:border-[#FF9690]'
              }`}
            />
          </div>
          {isEditMode && (
            <p className="mt-1 text-xs text-[#999]">Chỉ cho phép chỉnh sửa cân nặng và ghi chú</p>
          )}
          {errors.logDate && (
            <p className="mt-1 text-xs text-[#C44545]">{errors.logDate}</p>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
            Cân nặng <span className="text-[#999] font-normal">(kg)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={handleWeightChange}
              placeholder="Ví dụ: 55.5"
              disabled={isEditMode}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 pr-12 text-sm font-medium text-[#3E2723] transition-colors focus:outline-none focus:ring-0 ${
                isEditMode
                  ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-[#999]'
                  : errors.weight
                  ? 'border-[#C44545] focus:border-[#C44545]'
                  : 'border-gray-100 focus:border-[#FF9690]'
              }`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-[#999]">
              kg
            </span>
          </div>
          {errors.weight && (
            <p className="mt-1 text-xs text-[#C44545]">{errors.weight}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
            Ghi chú <span className="text-[#999] font-normal">(tùy chọn)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Đã kiểm tra sau bữa sáng"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-medium text-[#3E2723] transition-colors focus:border-[#FF9690] focus:outline-none focus:ring-0"
          />
          <p className="mt-1 text-right text-xs text-[#999]">{notes.length}/500</p>
        </div>

        {/* Source indicator (for info only) */}
        {!isEditMode && (
          <div className="flex items-center gap-2 rounded-xl bg-[#FDEEEE] px-4 py-2.5">
            <svg className="w-4 h-4 flex-shrink-0 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="text-xs font-medium text-[#757575]">Nhập liệu thủ công</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-full border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="btn btn-primary flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(isSubmitting || isLoading) ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang lưu...
              </>
            ) : (
              isEditMode ? 'Cập nhật' : 'Lưu'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
