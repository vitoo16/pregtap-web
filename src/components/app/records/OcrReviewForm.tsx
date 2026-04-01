'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api-client';
import { dateOfBirthMin, dateOfBirthMax, pastDateMax, lastPeriodMin, lastPeriodMax, dueDateMin, dueDateMax } from '@/lib/helpers';
import { type ExtractionReview, type VitalsData, type ApiResponse } from '@/types';
import { LoadingSpinner } from '@/components/app/shared/LoadingSpinner';
import { ErrorState } from '@/components/app/shared/ErrorState';

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchOcrReview(ocrResultId: string): Promise<ApiResponse<ExtractionReview>> {
  return apiClient.get<ExtractionReview>(`/api/ocr/${ocrResultId}/review`);
}

async function fetchOcrStatus(ocrResultId: string): Promise<ApiResponse<{ status: string }>> {
  return apiClient.get<{ status: string }>(`/api/ocr/${ocrResultId}/status`);
}

async function triggerReextract(ocrResultId: string): Promise<ApiResponse<{ id: string }>> {
  return apiClient.post<{ id: string }>(`/api/ocr/${ocrResultId}/re-extract`, {});
}

async function confirmExtraction(ocrResultId: string, body: Record<string, unknown>): Promise<ApiResponse<unknown>> {
  return apiClient.post(`/api/ocr/${ocrResultId}/confirm`, body);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OcrReviewFormProps {
  ocrResultId: string;
  documentId: string;
  onSuccess?: (createdVisitId?: string) => void;
}

interface EditableFields {
  // General Info
  facility: string;
  fullName: string;
  dateOfBirth: string;
  age: string;
  phone: string;
  occupation: string;
  ethnicity: string;
  nationality: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  bloodType: string;
  rhFactor: string;
  // Interview
  reasonForVisit: string;
  pregnancyNumber: string;
  gestationalWeek: string;
  lastMenstrualPeriod: string;
  expectedDeliveryDate: string;
  clinicalProgress: string;
  generalCondition: string;
  // Vital Signs
  weight: string;
  height: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  pulse: string;
  temperature: string;
  respiratoryRate: string;
  // Obstetric
  fundusHeight: string;
  abdominalCirc: string;
  fetalPresentation: string;
  fetalHeartRate: string;
  amnioticFluid: string;
  // General exam
  mentalStatus: string;
  edema: string;
  urineProtein: string;
  // Diagnosis & Treatment
  diagnosis: string;
  medication: string;
  recommendations: string;
  nextSteps: string;
  // Next appointment
  nextAppointmentDate: string;
  nextAppointmentNotes: string;
  // Meta
  eventDate: string;
  location: string;
}

const defaultFields: EditableFields = {
  facility: '', fullName: '', dateOfBirth: '', age: '', phone: '',
  occupation: '', ethnicity: '', nationality: '', address: '',
  ward: '', district: '', province: '', bloodType: '', rhFactor: '',
  reasonForVisit: '', pregnancyNumber: '', gestationalWeek: '',
  lastMenstrualPeriod: '', expectedDeliveryDate: '', clinicalProgress: '',
  generalCondition: '',
  weight: '', height: '', bloodPressureSystolic: '', bloodPressureDiastolic: '',
  pulse: '', temperature: '', respiratoryRate: '',
  fundusHeight: '', abdominalCirc: '', fetalPresentation: '',
  fetalHeartRate: '', amnioticFluid: '',
  mentalStatus: '', edema: '', urineProtein: '',
  diagnosis: '', medication: '', recommendations: '', nextSteps: '',
  nextAppointmentDate: '', nextAppointmentNotes: '',
  eventDate: format(new Date(), 'yyyy-MM-dd'), location: '',
};

function populateFromVitals(vitals?: VitalsData): EditableFields {
  const f = { ...defaultFields };
  if (!vitals) return f;

  if (vitals.generalInfo) {
    const gi = vitals.generalInfo;
    f.fullName = gi.fullName ?? '';
    f.dateOfBirth = gi.dob ?? '';
    f.age = gi.age?.toString() ?? '';
    f.phone = gi.phone ?? '';
    f.address = gi.address ?? '';
    f.ward = gi.ward ?? '';
    f.district = gi.district ?? '';
    f.province = gi.province ?? '';
    f.occupation = gi.occupation ?? '';
    f.ethnicity = gi.ethnicity ?? '';
    f.nationality = gi.nationality ?? '';
    f.bloodType = gi.bloodType ?? '';
    f.rhFactor = gi.rhFactor ?? '';
    f.facility = gi.facility ?? '';
  }

  if (vitals.interview) {
    const iv = vitals.interview;
    f.reasonForVisit = iv.reasonForVisit ?? '';
    f.pregnancyNumber = iv.pregnancyNumber?.toString() ?? '';
    f.gestationalWeek = iv.gestationalWeek?.toString() ?? '';
    f.lastMenstrualPeriod = iv.lmp ?? '';
    f.expectedDeliveryDate = iv.expectedDeliveryDate ?? '';
    f.clinicalProgress = iv.clinicalProgress ?? '';
    f.generalCondition = iv.generalCondition ?? '';
  }

  if (vitals.examination) {
    if (vitals.examination.vitalSigns) {
      const vs = vitals.examination.vitalSigns;
      f.weight = vs.weight?.toString() ?? '';
      f.height = vs.height?.toString() ?? '';
      f.pulse = vs.pulse?.toString() ?? '';
      f.temperature = vs.temperature?.toString() ?? '';
      f.respiratoryRate = vs.respiratoryRate?.toString() ?? '';
    }
    if (vitals.examination.obstetric) {
      const obs = vitals.examination.obstetric;
      f.fundusHeight = obs.fundusHeight?.toString() ?? '';
      f.abdominalCirc = obs.abdominalCirc?.toString() ?? '';
      f.fetalPresentation = obs.fetalPresentation ?? '';
      f.fetalHeartRate = obs.fetalHeartRate?.toString() ?? '';
      f.amnioticFluid = obs.amnioticFluid ?? '';
    }
    if (vitals.examination.general) {
      const gen = vitals.examination.general;
      f.mentalStatus = gen.mentalStatus ?? '';
      f.edema = gen.edema ?? '';
      f.urineProtein = gen.urineProtein ?? '';
    }
  }

  return f;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

function EditField({ label, value, onChange, placeholder, type = 'text', hint, required, min, max }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#757575]">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
        min={min}
        max={max}
        className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-2.5 text-sm text-[#3E2723] placeholder-[#ccc] transition-colors focus:border-[#FF9690] focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-[#999]">{hint}</p>}
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, hint }: Omit<FieldProps, 'type'>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#757575]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
        rows={2}
        className="w-full resize-none rounded-xl border-2 border-gray-100 bg-white px-4 py-2.5 text-sm text-[#3E2723] placeholder-[#ccc] transition-colors focus:border-[#FF9690] focus:outline-none"
      />
      {hint && <p className="mt-1 text-xs text-[#999]">{hint}</p>}
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  confidence?: number;
  index: number;
}

function FormSection({ title, icon, children, confidence, index }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="overflow-hidden rounded-2xl bg-white shadow-card"
    >
      <div className="flex items-center justify-between border-b border-gray-50 bg-gradient-to-r from-[#FFF8F8] to-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-[#3E2723]">{title}</h3>
        </div>
        {confidence != null && (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74]"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[#FF9690]">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </motion.div>
  );
}

function RowFields({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OcrReviewForm({ ocrResultId, documentId, onSuccess }: OcrReviewFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [fields, setFields] = useState<EditableFields>(defaultFields);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<Record<string, unknown>>({});

  // Poll OCR status if still processing
  const { data: statusData } = useQuery({
    queryKey: ['ocr-status', ocrResultId],
    queryFn: () => fetchOcrStatus(ocrResultId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === 'Succeeded' || status === 'Failed' || status === 'Confirmed') {
        return false;
      }
      return 3000;
    },
    enabled: false, // Only start polling after initial fetch
  });

  // Main review data query
  const {
    data: reviewResponse,
    isLoading: reviewLoading,
    error: reviewError,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['ocr-review', ocrResultId],
    queryFn: () => fetchOcrReview(ocrResultId),
    refetchInterval: (query) => {
      const review = query.state.data?.data;
      if (!review) return 3000;
      const status = review.status;
      if (status === 'Pending' || status === 'OcrProcessing' || status === 'AiExtracting') {
        return 3000;
      }
      return false;
    },
  });

  const reviewData = reviewResponse?.data;
  const status = reviewData?.status ?? statusData?.data?.status ?? '';
  const isProcessing = status === 'Pending' || status === 'OcrProcessing' || status === 'AiExtracting';
  const isSucceeded = status === 'Succeeded' || status === 'Confirmed';
  const isFailed = status === 'Failed';

  // Initialize fields from review data
  useEffect(() => {
    if (reviewData?.vitals) {
      setFields((prev) => ({ ...prev, ...populateFromVitals(reviewData.vitals) }));
    }
  }, [reviewData?.vitals]);

  function updateField(key: keyof EditableFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  // Build vitals JSON for confirmation
  function buildVitalsJson(): VitalsData {
    return {
      generalInfo: {
        fullName: fields.fullName || undefined,
        dob: fields.dateOfBirth || undefined,
        age: fields.age ? parseInt(fields.age, 10) : undefined,
        phone: fields.phone || undefined,
        address: fields.address || undefined,
        ward: fields.ward || undefined,
        district: fields.district || undefined,
        province: fields.province || undefined,
        occupation: fields.occupation || undefined,
        ethnicity: fields.ethnicity || undefined,
        nationality: fields.nationality || undefined,
        bloodType: fields.bloodType || undefined,
        rhFactor: fields.rhFactor || undefined,
        facility: fields.facility || undefined,
      },
      interview: {
        reasonForVisit: fields.reasonForVisit || undefined,
        pregnancyNumber: fields.pregnancyNumber ? parseInt(fields.pregnancyNumber, 10) : undefined,
        gestationalWeek: fields.gestationalWeek ? parseInt(fields.gestationalWeek, 10) : undefined,
        lmp: fields.lastMenstrualPeriod || undefined,
        expectedDeliveryDate: fields.expectedDeliveryDate || undefined,
        clinicalProgress: fields.clinicalProgress || undefined,
        generalCondition: fields.generalCondition || undefined,
      },
      examination: {
        vitalSigns: {
          weight: fields.weight ? parseFloat(fields.weight) : undefined,
          height: fields.height ? parseFloat(fields.height) : undefined,
          pulse: fields.pulse ? parseInt(fields.pulse, 10) : undefined,
          temperature: fields.temperature ? parseFloat(fields.temperature) : undefined,
          respiratoryRate: fields.respiratoryRate ? parseInt(fields.respiratoryRate, 10) : undefined,
          bloodPressureSystolic: fields.bloodPressureSystolic ? parseInt(fields.bloodPressureSystolic, 10) : undefined,
          bloodPressureDiastolic: fields.bloodPressureDiastolic ? parseInt(fields.bloodPressureDiastolic, 10) : undefined,
        },
        obstetric: {
          fundusHeight: fields.fundusHeight ? parseFloat(fields.fundusHeight) : undefined,
          abdominalCirc: fields.abdominalCirc ? parseFloat(fields.abdominalCirc) : undefined,
          fetalPresentation: fields.fetalPresentation || undefined,
          fetalHeartRate: fields.fetalHeartRate ? parseInt(fields.fetalHeartRate, 10) : undefined,
          amnioticFluid: fields.amnioticFluid || undefined,
        },
        general: {
          mentalStatus: fields.mentalStatus || undefined,
          edema: fields.edema || undefined,
          urineProtein: fields.urineProtein || undefined,
        },
      },
    };
  }

  const confirmMutation = useMutation({
    mutationFn: () =>
      confirmExtraction(ocrResultId, {
        documentTypeId: reviewData?.documentTypeId,
        eventDate: fields.eventDate,
        vitals: buildVitalsJson(),
        location: fields.location || undefined,
      }),
    onSuccess: (response) => {
      const data = response.data as { createdVisitId?: string; summary?: string } | undefined;
      setConfirmedData(data ?? {});
      setShowSuccess(true);
      void queryClient.invalidateQueries({ queryKey: ['ocr-review', ocrResultId] });
      if (data?.createdVisitId) {
        onSuccess?.(data.createdVisitId);
      }
    },
  });

  const reextractMutation = useMutation({
    mutationFn: () => triggerReextract(ocrResultId),
    onSuccess: () => {
      void refetch();
    },
  });

  // ─── Processing States ────────────────────────────────────────────────────
  if (reviewLoading && !reviewData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-sm font-semibold text-[#757575]">Đang tải dữ liệu OCR...</p>
      </div>
    );
  }

  if (reviewError) {
    return <ErrorState message="Không thể tải dữ liệu trích xuất." onRetry={() => void refetch()} />;
  }

  // Still processing
  if (isProcessing) {
    const statusMessages: Record<string, string> = {
      Pending: 'Đang chuẩn bị...',
      OcrProcessing: 'Đang nhận diện ký tự trên hình ảnh...',
      AiExtracting: 'Đang trích xuất dữ liệu bằng AI...',
    };
    const message = statusMessages[status] ?? 'Đang xử lý...';
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-card"
      >
        <div className="relative mb-6">
          <LoadingSpinner size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-[#3E2723]">Đang trích xuất dữ liệu</h3>
        <p className="mt-2 text-sm text-[#757575]">{message}</p>
        <p className="mt-1 text-xs text-[#999]">Vui lòng chờ trong giây lát...</p>
      </motion.div>
    );
  }

  // Failed
  if (isFailed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-card"
      >
        <div className="mb-4 text-5xl">😔</div>
        <h3 className="text-lg font-bold text-red-500">Trích xuất thất bại</h3>
        <p className="mt-2 text-sm text-[#757575]">Không thể trích xuất dữ liệu từ hình ảnh.</p>
        <button
          onClick={() => void reextractMutation.mutate()}
          disabled={reextractMutation.isPending}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60"
        >
          {reextractMutation.isPending ? (
            <LoadingSpinner size={16} />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          )}
          Thử lại trích xuất
        </button>
      </motion.div>
    );
  }

  // Already confirmed
  if (status === 'Confirmed') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-card"
      >
        <div className="mb-4 text-5xl">✅</div>
        <h3 className="text-lg font-bold text-green-600">Đã xác nhận</h3>
        <p className="mt-2 text-sm text-[#757575]">Dữ liệu từ tài liệu này đã được xác nhận và lưu.</p>
      </motion.div>
    );
  }

  // Success state with confirmation
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="overflow-hidden rounded-2xl bg-white shadow-lg"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 text-center">
          <div className="mb-3 text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-white">Xác nhận thành công!</h2>
          <p className="mt-1 text-sm text-white/80">
            Dữ liệu đã được lưu vào hồ sơ thai kỳ
          </p>
        </div>

        {/* Summary */}
        <div className="p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#999]">
            Tóm tắt dữ liệu đã xác nhận
          </h3>
          <div className="space-y-3">
            {fields.fullName && (
              <div className="flex justify-between rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-xs text-[#999]">Họ tên</span>
                <span className="text-xs font-semibold text-[#3E2723]">{fields.fullName}</span>
              </div>
            )}
            {fields.pregnancyNumber && (
              <div className="flex justify-between rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-xs text-[#999]">Lần mang thai</span>
                <span className="text-xs font-semibold text-[#3E2723]">{fields.pregnancyNumber}</span>
              </div>
            )}
            {fields.gestationalWeek && (
              <div className="flex justify-between rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-xs text-[#999]">Tuần thai</span>
                <span className="text-xs font-semibold text-[#3E2723]">{fields.gestationalWeek}</span>
              </div>
            )}
            {fields.weight && (
              <div className="flex justify-between rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-xs text-[#999]">Cân nặng</span>
                <span className="text-xs font-semibold text-[#3E2723]">{fields.weight} kg</span>
              </div>
            )}
            {fields.eventDate && (
              <div className="flex justify-between rounded-xl bg-[#F5F5F5] p-3">
                <span className="text-xs text-[#999]">Ngày khám</span>
                <span className="text-xs font-semibold text-[#3E2723]">{fields.eventDate}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push('/app/records')}
              className="flex-1 rounded-full border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50"
            >
              Quay lại
            </button>
            {(confirmedData as { createdVisitId?: string })?.createdVisitId ? (
              <button
                onClick={() => router.push('/app/visits')}
                className="flex-1 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                Xem lịch khám
              </button>
            ) : (
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                Hoàn tất
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Review Form ──────────────────────────────────────────────────────────
  const confidenceScore = reviewData?.confidenceScore;
  let sectionIndex = 0;

  return (
    <div className="space-y-4 pb-32">
      {/* Status + Confidence Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-[#E7F7EF] bg-[#E7F7EF] p-4"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
          <span className="text-lg">✅</span>
        </div>
        <div>
          <p className="text-sm font-bold text-green-700">Dữ liệu đã sẵn sàng để xem xét</p>
          {confidenceScore != null && (
            <p className="text-xs text-green-600">
              Độ chính xác OCR: <span className="font-semibold">{(confidenceScore * 100).toFixed(1)}%</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Document Images Carousel */}
      {reviewData?.fileUrls && reviewData.fileUrls.length > 0 && (
        <FormSection title="Tài liệu gốc" icon="📄" index={sectionIndex++}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {reviewData.fileUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <img
                  src={url}
                  alt={`Trang ${i + 1}`}
                  className="h-32 w-auto rounded-xl object-contain bg-gray-50"
                />
              </a>
            ))}
          </div>
        </FormSection>
      )}

      {/* Section: Thong tin chung */}
      <FormSection title="Thông tin bệnh nhân" icon="👤" index={sectionIndex++}>
        <EditField label="Họ và tên" value={fields.fullName} onChange={(v) => updateField('fullName', v)} />
        <RowFields>
          <EditField label="Ngày sinh" value={fields.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} type="date" min={dateOfBirthMin()} max={dateOfBirthMax()} />
          <EditField label="Tuổi" value={fields.age} onChange={(v) => updateField('age', v)} type="number" placeholder="VD: 28" />
        </RowFields>
        <RowFields>
          <EditField label="Số điện thoại" value={fields.phone} onChange={(v) => updateField('phone', v)} type="tel" />
          <EditField label="Nghề nghiệp" value={fields.occupation} onChange={(v) => updateField('occupation', v)} />
        </RowFields>
        <EditField label="Địa chỉ" value={fields.address} onChange={(v) => updateField('address', v)} />
        <RowFields>
          <EditField label="Quận/Huyện" value={fields.district} onChange={(v) => updateField('district', v)} />
          <EditField label="Tỉnh/TP" value={fields.province} onChange={(v) => updateField('province', v)} />
        </RowFields>
        <RowFields>
          <EditField label="Dân tộc" value={fields.ethnicity} onChange={(v) => updateField('ethnicity', v)} />
          <EditField label="Quốc tịch" value={fields.nationality} onChange={(v) => updateField('nationality', v)} />
        </RowFields>
        <RowFields>
          <EditField label="Nhóm máu" value={fields.bloodType} onChange={(v) => updateField('bloodType', v)} placeholder="VD: A" />
          <EditField label="Rh" value={fields.rhFactor} onChange={(v) => updateField('rhFactor', v)} placeholder="VD: Dương" />
        </RowFields>
      </FormSection>

      {/* Section: Kham thai */}
      <FormSection title="Khám thai" icon="🤰" index={sectionIndex++}>
        <RowFields>
          <EditField label="Nơi khám" value={fields.facility} onChange={(v) => updateField('facility', v)} />
          <EditField label="Lần mang thai thứ" value={fields.pregnancyNumber} onChange={(v) => updateField('pregnancyNumber', v)} type="number" />
        </RowFields>
        <EditField label="Ngày khám" value={fields.eventDate} onChange={(v) => updateField('eventDate', v)} type="date" max={pastDateMax()} />
        <EditField label="Lý do khám" value={fields.reasonForVisit} onChange={(v) => updateField('reasonForVisit', v)} />
        <RowFields>
          <EditField label="Tuần thai" value={fields.gestationalWeek} onChange={(v) => updateField('gestationalWeek', v)} type="number" placeholder="VD: 28" />
          <EditField label="Ngày kinh cuối" value={fields.lastMenstrualPeriod} onChange={(v) => updateField('lastMenstrualPeriod', v)} type="date" min={lastPeriodMin()} max={lastPeriodMax()} />
        </RowFields>
        <EditField label="Ngày dự sinh" value={fields.expectedDeliveryDate} onChange={(v) => updateField('expectedDeliveryDate', v)} type="date" min={dueDateMin()} max={dueDateMax()} />
        <EditField label="Tiến triển thai nghén" value={fields.clinicalProgress} onChange={(v) => updateField('clinicalProgress', v)} />
        <EditField label="Tình trạng chung" value={fields.generalCondition} onChange={(v) => updateField('generalCondition', v)} />
      </FormSection>

      {/* Section: Kham benh (General exam) */}
      <FormSection title="Khám bệnh" icon="🩺" index={sectionIndex++}>
        <EditField label="Tri giác" value={fields.mentalStatus} onChange={(v) => updateField('mentalStatus', v)} placeholder="Tỉnh, Đáp úng..." />
        <EditField label="Phù" value={fields.edema} onChange={(v) => updateField('edema', v)} placeholder="Không, +1, +2..." />
        <EditField label="Protein niệu" value={fields.urineProtein} onChange={(v) => updateField('urineProtein', v)} placeholder="Âm tính, +, ++..." />
      </FormSection>

      {/* Section: Suc am (Ultrasound / Obstetric) */}
      <FormSection title="Siêu âm" icon="📡" index={sectionIndex++}>
        <RowFields>
          <EditField label="Chiều cao tử cung (cm)" value={fields.fundusHeight} onChange={(v) => updateField('fundusHeight', v)} type="number" />
          <EditField label="Vòng bụng (cm)" value={fields.abdominalCirc} onChange={(v) => updateField('abdominalCirc', v)} type="number" />
        </RowFields>
        <EditField label="Tư thế thai" value={fields.fetalPresentation} onChange={(v) => updateField('fetalPresentation', v)} placeholder="Đầu, Mông, Ngang" />
        <RowFields>
          <EditField label="Nhịp tim thai" value={fields.fetalHeartRate} onChange={(v) => updateField('fetalHeartRate', v)} type="number" />
          <EditField label="Nước ối" value={fields.amnioticFluid} onChange={(v) => updateField('amnioticFluid', v)} />
        </RowFields>
      </FormSection>

      {/* Section: Can nang / Chieu cao */}
      <FormSection title="Cân nặng & Chiều cao" icon="⚖️" index={sectionIndex++}>
        <RowFields>
          <EditField label="Cân nặng (kg)" value={fields.weight} onChange={(v) => updateField('weight', v)} type="number" />
          <EditField label="Chiều cao (cm)" value={fields.height} onChange={(v) => updateField('height', v)} type="number" />
        </RowFields>
        <RowFields>
          <EditField label="Huyết áp tâm thu" value={fields.bloodPressureSystolic} onChange={(v) => updateField('bloodPressureSystolic', v)} type="number" placeholder="VD: 120" />
          <EditField label="Huyết áp tâm trương" value={fields.bloodPressureDiastolic} onChange={(v) => updateField('bloodPressureDiastolic', v)} type="number" placeholder="VD: 80" />
        </RowFields>
        <RowFields>
          <EditField label="Mạch (lần/ph)" value={fields.pulse} onChange={(v) => updateField('pulse', v)} type="number" />
          <EditField label="Nhiệt độ (°C)" value={fields.temperature} onChange={(v) => updateField('temperature', v)} type="number" />
        </RowFields>
      </FormSection>

      {/* Section: Chan doan */}
      <FormSection title="Chẩn đoán" icon="📝" index={sectionIndex++}>
        <TextareaField label="Chẩn đoán" value={fields.diagnosis} onChange={(v) => updateField('diagnosis', v)} />
      </FormSection>

      {/* Section: Ke hoach dieu tri */}
      <FormSection title="Kế hoạch điều trị" icon="💊" index={sectionIndex++}>
        <TextareaField label="Đơn thuốc" value={fields.medication} onChange={(v) => updateField('medication', v)} />
        <TextareaField label="Hướng dẫn" value={fields.nextSteps} onChange={(v) => updateField('nextSteps', v)} />
        <TextareaField label="Khuyến cáo" value={fields.recommendations} onChange={(v) => updateField('recommendations', v)} hint="Các khuyến cáo, cách nhau bằng dấu phẩy" />
      </FormSection>

      {/* Section: Tai kham */}
      <FormSection title="Tái khám" icon="📅" index={sectionIndex++}>
        <RowFields>
          <EditField label="Ngày hẹn tái khám" value={fields.nextAppointmentDate} onChange={(v) => updateField('nextAppointmentDate', v)} type="date" min={dueDateMin()} max={dueDateMax()} />
          <EditField label="Ghi chú tái khám" value={fields.nextAppointmentNotes} onChange={(v) => updateField('nextAppointmentNotes', v)} />
        </RowFields>
      </FormSection>

      {/* Warning if not auto-fillable */}
      {reviewData && !reviewData.canAutoFill && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <span className="text-lg">⚠️</span>
          <p className="text-xs text-orange-700">
            {'Một số trường không thể tự động điền. Vui lòng kiểm tra và xác nhận.'}
          </p>
        </div>
      )}

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 px-4 pb-4 pt-3 backdrop-blur-sm md:left-60">
        <div className="mx-auto max-w-3xl space-y-3">
          {/* Re-extract button */}
          <div className="flex justify-center">
            <button
              onClick={() => void reextractMutation.mutate()}
              disabled={reextractMutation.isPending}
              className="flex items-center gap-2 text-xs font-semibold text-[#999] transition-colors hover:text-[#FF9690] disabled:opacity-50"
            >
              {reextractMutation.isPending ? <LoadingSpinner size={14} /> : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              )}
              Nhập lại (trích xuất lại)
            </button>
          </div>

          {/* Confirm button */}
          <button
            onClick={() => void confirmMutation.mutate()}
            disabled={confirmMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmMutation.isPending ? (
              <>
                <LoadingSpinner size={20} />
                Đang xác nhận...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Xác nhận & Tạo lịch khám
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
