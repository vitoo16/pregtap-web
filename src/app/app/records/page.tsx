'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { apiClient } from '@/lib/api-client';
import { usePregnancy } from '@/contexts/PregnancyContext';
import { type MedicalDocument, type ApiResponse } from '@/types';

import { DocumentList } from '@/components/app/records/DocumentList';
import { DocumentUpload, type UploadData } from '@/components/app/records/DocumentUpload';
import { Modal } from '@/components/app/shared/Modal';
import { EmptyState } from '@/components/app/shared/EmptyState';

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchDocuments(pregnancyId: string): Promise<ApiResponse<MedicalDocument[]>> {
  return apiClient.get<MedicalDocument[]>(`/api/pregnancies/${pregnancyId}/documents`);
}

async function deleteDocument(documentId: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/documents/${documentId}`);
}

async function toggleFavorite(documentId: string, isFavorite: boolean): Promise<ApiResponse<void>> {
  return apiClient.patch<void>(`/api/documents/${documentId}`, { isFavorite });
}

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadDocument(pregnancyId: string, data: UploadData): Promise<void> {
  const formData = new FormData();
  for (const file of data.files) {
    formData.append('files', file);
  }
  formData.append('title', data.title);
  formData.append('documentDate', data.documentDate);
  if (data.documentTypeId) {
    formData.append('documentTypeId', data.documentTypeId);
  }

  // Use fetch directly for FormData (not JSON)
  const tokenMatch = document.cookie.match(/(?:^| )pregtap_access_token=([^;]+)/);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${window.location.origin}/api/pregnancies/${pregnancyId}/documents`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  if (response.status === 401) {
    window.location.href = '/?auth=expired';
    throw new Error('Unauthorized');
  }

  const result = await response.json() as ApiResponse<MedicalDocument>;
  if (!result.success) {
    throw new Error(result.message ?? 'Upload failed');
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MedicalRecordsPage() {
  const { pregnancy } = usePregnancy();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Documents query
  const {
    data: docsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['medical-documents', pregnancy?.id],
    queryFn: () => fetchDocuments(pregnancy!.id),
    enabled: !!pregnancy,
  });

  const documents = docsResponse?.data ?? [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['medical-documents'] });
    },
  });

  // Favorite toggle mutation
  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleFavorite(id, isFavorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['medical-documents'] });
    },
  });

  const handleUpload = useCallback(
    async (data: UploadData) => {
      if (!pregnancy) return;
      await uploadDocument(pregnancy.id, data);
      void queryClient.invalidateQueries({ queryKey: ['medical-documents'] });
    },
    [pregnancy, queryClient],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const handleToggleFavorite = useCallback(
    async (id: string, isFavorite: boolean) => {
      await favoriteMutation.mutateAsync({ id, isFavorite });
    },
    [favoriteMutation],
  );

  // No pregnancy setup
  if (!pregnancy) {
    return (
      <div className="app-page-content">
        <div className="app-page-header mb-6">
          <h1 className="heading-3 text-[#3E2723]">Hồ sơ y tế</h1>
        </div>
        <div className="card p-8 text-center">
          <EmptyState
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            }
            title="Cần cập nhật thông tin thai kỳ"
            description="Vui lòng thiết lập thông tin thai kỳ trước để sử dụng tính năng hồ sơ y tế."
            action={
              <Link
                href="/app/setup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                Thiết lập thai kỳ
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-page-content">
      {/* Page Header */}
      <div className="app-page-header mb-6 flex items-center justify-between">
        <div>
          <h1 className="heading-3 text-[#3E2723]">Hồ sơ y tế</h1>
          <p className="mt-1 text-sm text-[#757575]">
            {documents.length > 0
              ? `${documents.length} tài liệu`
              : 'Lưu trữ và OCR tự động'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => void refetch()}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-100 bg-white text-[#999] shadow-sm transition-all hover:border-[#FF9690]/30 hover:text-[#FF9690]"
            aria-label="Làm mới"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          {/* Upload */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tải lên
          </button>
        </div>
      </div>

      {/* Upload CTA Banner (when empty) */}
      {documents.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#FFF0F0] to-[#FFF8F8] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                <svg className="w-7 h-7 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-[#3E2723]">Tải lên hồ sơ mới</h3>
                <p className="mt-1 text-sm text-[#757575]">
                  Tài liệu khám thai sẽ được OCR tự động trích xuất dữ liệu
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="ml-auto flex-shrink-0 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                Tải lên
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Health tip banner */}
      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-[#B8E6D4] bg-[#E0F7F1] p-4"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white">
            <span className="text-lg">💪</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1F7A4D]">Sức khỏe của bạn khá tốt!</p>
            <p className="text-xs text-[#1F7A4D]/70">Tiếp tục theo dõi và khám định kỳ.</p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-600">Không thể tải danh sách tài liệu.</p>
        </div>
      )}

      {/* Document List */}
      <DocumentList
        documents={documents}
        isLoading={isLoading}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Tải lên tài liệu"
        size="md"
      >
        <DocumentUpload
          onUpload={handleUpload}
          onClose={() => setIsUploadOpen(false)}
          isLoading={false}
        />
      </Modal>
    </div>
  );
}
