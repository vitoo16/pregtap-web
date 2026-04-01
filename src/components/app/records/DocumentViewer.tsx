'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { type MedicalDocumentDetail, type OcrResult } from '@/types';
import { Badge } from '@/components/app/shared/Badge';
import { LoadingSpinner } from '@/components/app/shared/LoadingSpinner';

interface DocumentViewerProps {
  document: MedicalDocumentDetail;
  onOcrTrigger: () => Promise<void>;
  isOcrProcessing?: boolean;
  ocrStatus?: string;
  onRefresh: () => void;
}

function getOcrStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'Pending':
      return { label: 'Đang chuẩn bị...', color: '#999' };
    case 'OcrProcessing':
      return { label: 'Đang nhận diện...', color: '#1565C0' };
    case 'AiExtracting':
      return { label: 'Đang trích xuất AI...', color: '#1565C0' };
    case 'Succeeded':
      return { label: 'Hoàn tất', color: '#1F7A4D' };
    case 'Failed':
      return { label: 'Thất bại', color: '#C44545' };
    case 'Confirmed':
      return { label: 'Đã xác nhận', color: '#1565C0' };
    default:
      return { label: status || 'Chưa xử lý', color: '#999' };
  }
}

function getOcrStatusIcon(status: string): string {
  switch (status) {
    case 'Succeeded':
      return '✅';
    case 'Failed':
      return '❌';
    case 'Confirmed':
      return '🔵';
    case 'OcrProcessing':
    case 'AiExtracting':
      return '⏳';
    default:
      return '⭕';
  }
}

export function DocumentViewer({
  document,
  onOcrTrigger,
  isOcrProcessing = false,
  ocrStatus = '',
  onRefresh,
}: DocumentViewerProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(0);

  const imageFiles = document.files.filter((f) => f.mimeType.startsWith('image/'));

  const handleViewOcrReview = useCallback(() => {
    if (document.ocrResult?.id) {
      router.push(`/app/records/${document.id}/ocr/${document.ocrResult.id}`);
    }
  }, [document.id, document.ocrResult?.id, router]);

  const handleImageClick = useCallback((index: number) => {
    setImageModalIndex(index);
    setShowImageModal(true);
  }, []);

  const ocrResult = document.ocrResult;
  const ocrStatusLabel = ocrStatus || ocrResult?.status || '';
  const { label: statusLabel, color: statusColor } = getOcrStatusLabel(ocrStatusLabel);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="bg-linear-to-r from-[#FFF0F0] to-[#FFF8F8] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              <span className="text-3xl">📋</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#3E2723]">{document.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="default">{document.documentTypeDisplayName || document.documentTypeName}</Badge>
                <span className="text-xs text-[#999]">
                  {format(parseISO(document.documentDate), "EEEE, dd MMMM yyyy", { locale: vi })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* OCR Status Card */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${statusColor}15` }}
              >
                <span className="text-lg">{getOcrStatusIcon(ocrStatusLabel)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: statusColor }}>
                  {statusLabel}
                </p>
                {ocrResult?.confidenceScore != null && (
                  <p className="text-xs text-[#999]">
                    Độ chính xác: {(ocrResult.confidenceScore * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {/* OCR Button based on status */}
              {isOcrProcessing ? (
                <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
                  <LoadingSpinner size={16} />
                  <span className="text-xs font-semibold text-blue-600">{statusLabel}</span>
                </div>
              ) : ocrStatusLabel === 'Succeeded' ? (
                <button
                  onClick={handleViewOcrReview}
                  className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-600 transition-colors hover:bg-green-100"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Xem kết quả OCR
                </button>
              ) : ocrStatusLabel === 'Failed' ? (
                <button
                  onClick={() => void onOcrTrigger()}
                  className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Thử lại OCR
                </button>
              ) : ocrStatusLabel === 'Confirmed' ? (
                <span className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Đã xác nhận
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Patient Info Section */}
      {document.vitals?.generalInfo && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
            Thông tin bệnh nhân
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(document.vitals.generalInfo).map(([key, value]) => {
              if (value == null) return null;
              const labels: Record<string, string> = {
                fullName: 'Họ và tên',
                facility: 'Nơi khám',
                age: 'Tuổi',
                phone: 'Điện thoại',
                address: 'Địa chỉ',
                bloodType: 'Nhóm máu',
                rhFactor: 'Rh',
                occupation: 'Nghề nghiệp',
                insuranceNumber: 'BHYT',
              };
              const label = labels[key] || key;
              return (
                <div key={key} className="flex justify-between border-b border-gray-50 py-2">
                  <span className="text-xs text-[#999]">{label}</span>
                  <span className="text-xs font-semibold text-[#3E2723]">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Interview / Pregnancy Info */}
      {document.vitals?.interview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
            Thông tin khám thai
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(document.vitals.interview).map(([key, value]) => {
              if (value == null) return null;
              const labels: Record<string, string> = {
                reasonForVisit: 'Lý do khám',
                pregnancyNumber: 'Lần mang thai',
                gestationalWeek: 'Tuần thai',
                lmp: 'Kinh cuối',
                expectedDeliveryDate: 'Ngày dự sinh',
                generalCondition: 'Tình trạng chung',
              };
              const label = labels[key] || key;
              return (
                <div key={key} className="flex justify-between border-b border-gray-50 py-2">
                  <span className="text-xs text-[#999]">{label}</span>
                  <span className="text-xs font-semibold text-[#3E2723]">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Vital Signs */}
      {document.vitals?.examination?.vitalSigns && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
            Chỉ số sinh tồn
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(document.vitals.examination.vitalSigns).map(([key, value]) => {
              if (value == null) return null;
              const labels: Record<string, string> = {
                weight: 'Cân nặng',
                height: 'Chiều cao',
                bloodPressureSystolic: 'Huyết áp (mmHg)',
                pulse: 'Mạch (lần/ph)',
                temperature: 'Nhiệt độ (°C)',
                respiratoryRate: 'Nhịp thở',
              };
              const label = labels[key] || key;
              return (
                <div key={key} className="flex justify-between border-b border-gray-50 py-2">
                  <span className="text-xs text-[#999]">{label}</span>
                  <span className="text-xs font-semibold text-[#3E2723]">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Obstetric Examination */}
      {document.vitals?.examination?.obstetric && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
            Khám sản
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(document.vitals.examination.obstetric).map(([key, value]) => {
              if (value == null) return null;
              const labels: Record<string, string> = {
                fundusHeight: 'Chiều cao tử cung (cm)',
                abdominalCirc: 'Vòng bụng (cm)',
                fetalPresentation: 'Tư thế thai',
                fetalHeartRate: 'Tim thai (nhịp/ph)',
                amnioticFluid: 'Nước ối',
              };
              const label = labels[key] || key;
              return (
                <div key={key} className="flex justify-between border-b border-gray-50 py-2">
                  <span className="text-xs text-[#999]">{label}</span>
                  <span className="text-xs font-semibold text-[#3E2723]">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Diagnosis */}
      {document.structuredData?.diagnosis && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
            Chẩn đoán
          </h3>
          <p className="text-sm text-[#3E2723]">{document.structuredData.diagnosis}</p>
        </motion.div>
      )}

      {/* Treatment Plan */}
      {document.structuredData?.treatmentPlan?.recommendations &&
        document.structuredData.treatmentPlan.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card p-5"
          >
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
              Kế hoạch điều trị
            </h3>
            <ul className="space-y-1">
              {document.structuredData.treatmentPlan.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#3E2723]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF9690]" />
                  {rec}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

      {/* Image Gallery */}
      {imageFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-5"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#999]">
            Tài liệu gốc ({imageFiles.length})
          </h3>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 gap-2">
            {imageFiles.map((file, index) => (
              <button
                key={file.id}
                onClick={() => handleImageClick(index)}
                className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-transform hover:scale-105"
              >
                <img
                  src={file.fileUrl}
                  alt={file.originalFileName}
                  className="h-full w-full object-cover"
                />
                {imageFiles.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                    <span className="text-sm font-bold text-white">
                      {index + 1}/{imageFiles.length}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Carousel dots */}
          {imageFiles.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {imageFiles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === selectedImageIndex
                      ? 'w-6 bg-[#FF9690]'
                      : 'w-1.5 bg-gray-200'
                  }`}
                  aria-label={`Hình ${index + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Nav: prev */}
            {imageModalIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageModalIndex((i) => i - 1);
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                aria-label="Trước"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Nav: next */}
            {imageModalIndex < imageFiles.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageModalIndex((i) => i + 1);
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 md:right-18"
                aria-label="Sau"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            <motion.img
              key={imageModalIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={imageFiles[imageModalIndex]?.fileUrl}
              alt={imageFiles[imageModalIndex]?.originalFileName}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              {imageModalIndex + 1} / {imageFiles.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
