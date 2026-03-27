'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

import { apiClient } from '@/lib/api-client';
import { type MedicalDocumentDetail, type ApiResponse } from '@/types';
import { DocumentViewer } from '@/components/app/records/DocumentViewer';
import { LoadingSpinner } from '@/components/app/shared/LoadingSpinner';
import { ErrorState } from '@/components/app/shared/ErrorState';

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchDocumentDetail(documentId: string): Promise<ApiResponse<MedicalDocumentDetail>> {
  return apiClient.get<MedicalDocumentDetail>(`/api/documents/${documentId}`);
}

async function triggerOcr(documentId: string): Promise<ApiResponse<{ id: string }>> {
  return apiClient.post<{ id: string }>(`/api/documents/${documentId}/ocr/process`, {});
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch document detail
  const {
    data: docResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['document-detail', documentId],
    queryFn: () => fetchDocumentDetail(documentId),
  });

  const document = docResponse?.data;

  // OCR status polling
  const {
    data: ocrStatusResponse,
    isLoading: isOcrStatusLoading,
  } = useQuery({
    queryKey: ['document-ocr-status', documentId],
    queryFn: async () => {
      const res = await fetchDocumentDetail(documentId);
      return res.data?.ocrResult?.status;
    },
    refetchInterval: (query) => {
      const status = query.state.data;
      if (status === 'Pending' || status === 'OcrProcessing' || status === 'AiExtracting') {
        return 3000;
      }
      return false;
    },
    enabled: !!document?.ocrResult && document.ocrResult.status !== 'Confirmed',
  });

  const ocrStatus = ocrStatusResponse ?? document?.ocrResult?.status ?? '';
  const isOcrProcessing = ocrStatus === 'Pending' || ocrStatus === 'OcrProcessing' || ocrStatus === 'AiExtracting';

  // Trigger OCR mutation
  const triggerMutation = useMutation({
    mutationFn: () => triggerOcr(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['document-detail', documentId] });
    },
  });

  async function handleOcrTrigger() {
    await triggerMutation.mutateAsync();
  }

  async function handleRefresh() {
    await refetch();
  }

  // Loading
  if (isLoading) {
    return (
      <div className="app-page-content">
        <div className="app-page-header mb-6 flex items-center gap-4">
          <Link
            href="/app/records"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-100 bg-white shadow-sm transition-all hover:border-[#FF9690]/30"
          >
            <svg className="w-4 h-4 text-[#757575]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="h-6 w-32 animate-pulse rounded-full bg-gray-100" />
        </div>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size={48} />
        </div>
      </div>
    );
  }

  // Error
  if (error || !document) {
    return (
      <div className="app-page-content">
        <div className="app-page-header mb-6 flex items-center gap-4">
          <Link
            href="/app/records"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-100 bg-white shadow-sm transition-all hover:border-[#FF9690]/30"
          >
            <svg className="w-4 h-4 text-[#757575]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="heading-3 text-[#3E2723]">Chi tiết tài liệu</h1>
        </div>
        <ErrorState message="Không thể tải chi tiết tài liệu." onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="app-page-content">
      {/* Page Header */}
      <div className="app-page-header mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/app/records"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-100 bg-white shadow-sm transition-all hover:border-[#FF9690]/30"
            aria-label="Quay lại"
          >
            <svg className="w-4 h-4 text-[#757575]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="heading-3 text-[#3E2723]">Chi tiết tài liệu</h1>
            <p className="mt-0.5 text-xs text-[#999]">
              {format(new Date(document.documentDate), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={() => void refetch()}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-100 bg-white shadow-sm text-[#999] transition-all hover:border-[#FF9690]/30 hover:text-[#FF9690]"
          aria-label="Làm mới"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {/* OCR Processing Banner */}
      {isOcrProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4"
        >
          <LoadingSpinner size={20} />
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">Đang xử lý OCR</p>
            <p className="text-xs text-blue-500">
              {ocrStatus === 'OcrProcessing' && 'Đang nhận diện ký tự...'}
              {ocrStatus === 'AiExtracting' && 'Đang trích xuất dữ liệu bằng AI...'}
              {ocrStatus === 'Pending' && 'Đang chuẩn bị...'}
            </p>
          </div>
        </motion.div>
      )}

      {/* OCR Triggered Banner */}
      {document.ocrResult?.id && ocrStatus === 'Succeeded' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <span>✅</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-700">OCR hoàn tất!</p>
            <p className="text-xs text-green-600">
              Dữ liệu đã được trích xuất. Bạn có thể xem và xác nhận.
            </p>
          </div>
          {document.ocrResult?.id && (
            <Link
              href={`/app/records/${documentId}/ocr/${document.ocrResult.id}`}
              className="flex-shrink-0 rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-green-600"
            >
              Xem kết quả
            </Link>
          )}
        </motion.div>
      )}

      {/* Document Viewer */}
      <DocumentViewer
        document={document}
        onOcrTrigger={handleOcrTrigger}
        isOcrProcessing={isOcrProcessing || triggerMutation.isPending}
        ocrStatus={ocrStatus}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
