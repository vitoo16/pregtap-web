'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { OcrReviewForm } from '@/components/app/records/OcrReviewForm';

interface PageProps {
  params: Promise<{ id: string; ocrId: string }>;
}

export default function OcrReviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id: documentId, ocrId: ocrResultId } = resolvedParams;
  const router = useRouter();

  function handleSuccess(createdVisitId?: string) {
    if (createdVisitId) {
      // Optionally navigate to visit
      router.push('/app/records');
    }
  }

  return (
    <div className="app-page-content">
      {/* Page Header */}
      <div className="app-page-header mb-6 flex items-center gap-4">
        <Link
          href={`/app/records/${documentId}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-100 bg-white shadow-sm transition-all hover:border-[#FF9690]/30"
          aria-label="Quay lại"
        >
          <svg className="w-4 h-4 text-[#757575]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="heading-3 text-[#3E2723]">Xem lại dữ liệu trích xuất</h1>
          <p className="mt-0.5 text-xs text-[#999]">OCR Review</p>
        </div>
      </div>

      {/* OCR Review Form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <OcrReviewForm
          ocrResultId={ocrResultId}
          documentId={documentId}
          onSuccess={handleSuccess}
        />
      </motion.div>
    </div>
  );
}
