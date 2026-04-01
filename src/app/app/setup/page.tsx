'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, parseISO, isValid } from 'date-fns';
import { lastPeriodMin, lastPeriodMax, dueDateMin, dueDateMax } from '@/lib/helpers';

import { usePregnancy } from '@/contexts/PregnancyContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type BabyGender = 'Unknown' | 'Male' | 'Female';
type PregnancyType = 'Singleton' | 'Twins' | 'Triplets' | 'Other';
type DueDateSource = 'LMP' | 'Ultrasound' | 'IVF' | 'Manual';

interface FormValues {
  dueDate: string;
  lastPeriodDate: string;
  dueDateSource: DueDateSource;
  babyNickname: string;
  babyGender: BabyGender;
  pregnancyType: PregnancyType;
  motherBloodType: string;
  prePregnancyWeightKg: string;
  heightCm: string;
  gravida: string;
  para: string;
  notes: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DUE_DATE_SOURCES: { value: DueDateSource; label: string }[] = [
  { value: 'LMP', label: 'Ngày đầu kinh nguyệt cuối (LMP)' },
  { value: 'Ultrasound', label: 'Siêu âm' },
  { value: 'IVF', label: 'Thụ tinh ống nghiệm (IVF)' },
  { value: 'Manual', label: 'Tự tính toán' },
];
const BABY_GENDERS: { value: BabyGender; label: string }[] = [
  { value: 'Unknown', label: 'Chưa biết' },
  { value: 'Male', label: 'Nam' },
  { value: 'Female', label: 'Nữ' },
];
const PREGNANCY_TYPES: { value: PregnancyType; label: string }[] = [
  { value: 'Singleton', label: 'Một thai' },
  { value: 'Twins', label: 'Đôi (Twin)' },
  { value: 'Triplets', label: 'Ba (Triplet)' },
  { value: 'Other', label: 'Khác' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcDueDateFromLMP(lmpDate: string): string {
  try {
    const d = parseISO(lmpDate);
    if (!isValid(d)) return '';
    return format(addDays(d, 280), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      className="card p-5 mb-4"
    >
      <h2 className="text-base font-bold text-[#3E2723] mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#FF9690] to-[#FFC0C0] text-xs font-extrabold text-white">
          {index}
        </span>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

// ─── Input component ──────────────────────────────────────────────────────────

function FormInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
  step,
  error,
  helpText,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: string;
  error?: string;
  helpText?: string;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
        {label} {required && <span className="text-[#FF7A74]">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-[#3E2723] transition-all
          placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/40
          ${error ? 'border-[#FF7A74] ring-2 ring-[#FF7A74]/20' : 'border-[#FFEBEE] hover:border-[#FFB5B0]'}`}
      />
      {helpText && !error && (
        <p className="mt-1 text-xs text-[#999]">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-[#FF7A74]">{error}</p>
      )}
    </div>
  );
}

function FormSelect({
  label,
  id,
  value,
  onChange,
  options,
  required,
  error,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
        {label} {required && <span className="text-[#FF7A74]">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-[#3E2723] transition-all
          focus:outline-none focus:ring-2 focus:ring-[#FF9690]/40
          ${error ? 'border-[#FF7A74] ring-2 ring-[#FF7A74]/20' : 'border-[#FFEBEE] hover:border-[#FFB5B0]'}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#FF7A74]">{error}</p>}
    </div>
  );
}

function FormTextarea({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-xl border border-[#FFEBEE] bg-white px-4 py-2.5 text-sm font-medium text-[#3E2723]
          placeholder:text-[#999] transition-all hover:border-[#FFB5B0] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/40"
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter();
  const { createPregnancy, isLoading: ctxLoading } = usePregnancy();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<FormValues>({
    dueDate: '',
    lastPeriodDate: '',
    dueDateSource: 'LMP',
    babyNickname: '',
    babyGender: 'Unknown',
    pregnancyType: 'Singleton',
    motherBloodType: '',
    prePregnancyWeightKg: '',
    heightCm: '',
    gravida: '',
    para: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const set = (field: keyof FormValues) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Auto-calculate due date when LMP changes
      if (field === 'lastPeriodDate' && value && form.dueDateSource === 'LMP') {
        const calc = calcDueDateFromLMP(value);
        if (calc) next.dueDate = calc;
      }

      return next;
    });

    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormValues, string>> = {};

    if (!form.lastPeriodDate && form.dueDateSource === 'LMP') {
      newErrors.lastPeriodDate = 'Vui lòng nhập ngày đầu kinh nguyệt cuối.';
    }
    if (!form.dueDate) {
      newErrors.dueDate = 'Vui lòng nhập ngày dự sinh.';
    }

    if (form.prePregnancyWeightKg) {
      const w = parseFloat(form.prePregnancyWeightKg);
      if (isNaN(w) || w < 30 || w > 300) {
        newErrors.prePregnancyWeightKg = 'Cân nặng không hợp lệ (30-300 kg).';
      }
    }
    if (form.heightCm) {
      const h = parseFloat(form.heightCm);
      if (isNaN(h) || h < 100 || h > 250) {
        newErrors.heightCm = 'Chiều cao không hợp lệ (100-250 cm).';
      }
    }
    if (form.gravida) {
      const g = parseInt(form.gravida, 10);
      if (isNaN(g) || g < 1 || g > 20) {
        newErrors.gravida = 'Số thai kỳ không hợp lệ.';
      }
    }
    if (form.para) {
      const p = parseInt(form.para, 10);
      if (isNaN(p) || p < 0 || p > 20) {
        newErrors.para = 'Số lần sinh không hợp lệ.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Map camelCase for backend (MO pattern)
      const payload: Record<string, unknown> = {
        lastMenstrualPeriodDate: form.lastPeriodDate || undefined,
        expectedDeliveryDate: form.dueDate || undefined,
        babyNickname: form.babyNickname || undefined,
        babyGender: form.babyGender || undefined,
        pregnancyType: form.pregnancyType || undefined,
        motherBloodType: form.motherBloodType || undefined,
        prePregnancyWeightKg: form.prePregnancyWeightKg ? parseFloat(form.prePregnancyWeightKg) : undefined,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
        gravida: form.gravida ? parseInt(form.gravida, 10) : undefined,
        para: form.para ? parseInt(form.para, 10) : undefined,
        dueDateSource: form.dueDateSource || undefined,
        notes: form.notes || undefined,
      };
      // Remove undefined fields
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      await createPregnancy(payload as Parameters<typeof createPregnancy>[0]);
      router.push('/app/home');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFEBEE]/50 pb-8">
      {/* Header */}
      <div
        className="relative overflow-hidden px-6 pt-8 pb-12 md:px-10"
        style={{
          background: 'linear-gradient(135deg, #FF9690 0%, #DA927B 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full opacity-10 bg-white md:right-[-40px] md:top-[-40px]" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full opacity-10 bg-white md:left-[-30px] md:bottom-[-30px]" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center text-white"
        >
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-sm">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
          </div>
          <h1 className="mb-1 text-2xl font-extrabold tracking-tight">
            Chao mui~n ba^n den vo^i PregTap!
          </h1>
          <p className="text-sm font-medium opacity-90">
            Hãy cùng nhập thông tin thai kỳ của bạn để bắt đầu hành trình tuyệt vời này nhé
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="app-page-content">
        <form onSubmit={handleSubmit} noValidate>
          {/* Section 1: Ngày tháng quan trọng */}
          <FormSection title="Ngày tháng quan trọng" index={1}>
            <FormSelect
              label="Nguồn tính ngày dự sinh"
              id="dueDateSource"
              value={form.dueDateSource}
              onChange={set('dueDateSource')}
              options={DUE_DATE_SOURCES}
              required
            />

            {form.dueDateSource === 'LMP' && (
              <FormInput
                label="Ngày đầu kinh nguyệt cuối (LMP)"
                id="lastPeriodDate"
                type="date"
                value={form.lastPeriodDate}
                onChange={set('lastPeriodDate')}
                placeholder="Chọn ngày"
                required
                min={lastPeriodMin()}
                max={lastPeriodMax()}
                error={errors.lastPeriodDate}
                helpText="Tính tự động: ngày dự sinh = LMP + 280 ngày"
              />
            )}

            <FormInput
              label="Ngày dự sinh (EDD)"
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={set('dueDate')}
              placeholder="Chọn ngày"
              required
              min={dueDateMin()}
              max={dueDateMax()}
              error={errors.dueDate}
              helpText={
                form.dueDateSource === 'LMP' && form.lastPeriodDate
                  ? `Đã tự động tính: ${format(parseISO(form.dueDate || new Date().toISOString()), 'dd/MM/yyyy')}`
                  : 'Ngày dự kiến sinh của bé'
              }
            />
          </FormSection>

          {/* Section 2: Thông tin em bé */}
          <FormSection title="Thông tin em bé" index={2}>
            <FormInput
              label="Biệt danh bé"
              id="babyNickname"
              value={form.babyNickname}
              onChange={set('babyNickname')}
              placeholder="Ví dụ: Tiểu Bảo, Thiên Thần..."
            />

            <div className="mb-3">
              <label className="mb-2 block text-sm font-semibold text-[#3E2723]">
                Giới tính
              </label>
              <div className="flex flex-wrap gap-2">
                {BABY_GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => set('babyGender')(g.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all
                      ${form.babyGender === g.value
                        ? 'bg-linear-to-r from-[#FF9690] to-[#FF7A74] text-white shadow-md'
                        : 'bg-[#FFEBEE] text-[#757575] hover:bg-[#FFE0DE]'
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <FormSelect
              label="Loại thai kỳ"
              id="pregnancyType"
              value={form.pregnancyType}
              onChange={set('pregnancyType')}
              options={PREGNANCY_TYPES}
            />
          </FormSection>

          {/* Section 3: Thông tin y tế mẹ */}
          <FormSection title="Thông tin y tế mẹ" index={3}>
            <FormSelect
              label="Nhóm máu mẹ"
              id="motherBloodType"
              value={form.motherBloodType}
              onChange={set('motherBloodType')}
              options={BLOOD_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Chọn nhóm máu"
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Cân nặng trước mang thai"
                id="prePregnancyWeightKg"
                type="number"
                value={form.prePregnancyWeightKg}
                onChange={set('prePregnancyWeightKg')}
                placeholder="kg"
                min={30}
                max={300}
                step="0.1"
                error={errors.prePregnancyWeightKg}
              />
              <FormInput
                label="Chiều cao"
                id="heightCm"
                type="number"
                value={form.heightCm}
                onChange={set('heightCm')}
                placeholder="cm"
                min={100}
                max={250}
                step="0.1"
                error={errors.heightCm}
              />
            </div>
          </FormSection>

          {/* Section 4: Thai sản */}
          <FormSection title="Thai sản" index={4}>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Gravida (G)"
                id="gravida"
                type="number"
                value={form.gravida}
                onChange={set('gravida')}
                placeholder="Số lần mang thai"
                min={1}
                max={20}
                error={errors.gravida}
                helpText="Bao gồm thai kỳ hiện tại"
              />
              <FormInput
                label="Para (P)"
                id="para"
                type="number"
                value={form.para}
                onChange={set('para')}
                placeholder="Số lần sinh"
                min={0}
                max={20}
                error={errors.para}
                helpText="Số lần sinh sống"
              />
            </div>
          </FormSection>

          {/* Section 5: Ghi chú */}
          <FormSection title="Ghi chú" index={5}>
            <FormTextarea
              label="Ghi chú cá nhân"
              id="notes"
              value={form.notes}
              onChange={set('notes')}
              placeholder="Những điều bạn muốn ghi lại cho hành trình thai kỳ..."
              rows={4}
            />
          </FormSection>

          {/* Submit Error */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 rounded-xl border border-[#FF7A74]/30 bg-[#FF7A74]/10 px-4 py-3 text-sm text-[#FF7A74]"
              >
                {submitError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <button
              type="submit"
              disabled={isSubmitting || ctxLoading}
              className="btn btn-primary w-full rounded-2xl py-3.5 text-base font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting || ctxLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner h-5 w-5" />
                  Đang lưu...
                </span>
              ) : (
                <>
                  <span className="mr-2 text-lg">+</span>
                  Bắt đầu hành trình
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
