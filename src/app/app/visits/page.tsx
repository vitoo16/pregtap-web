'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { type PrenatalVisit, type VisitType, type ApiResponse } from '@/types';
import { Modal } from '@/components/app/shared/Modal';
import { VisitList } from '@/components/app/visits/VisitList';
import { VisitForm } from '@/components/app/visits/VisitForm';
import { usePregnancy } from '@/contexts/PregnancyContext';

type VisitFormValues = {
  visitDate: string;
  visitType: VisitType;
  location: string;
  notes: string;
};

async function createVisit(pregnancyId: string, data: VisitFormValues): Promise<ApiResponse<PrenatalVisit>> {
  return apiClient.post<PrenatalVisit>(`/api/visits?pregnancyId=${pregnancyId}`, data);
}

async function updateVisit(
  id: string,
  data: VisitFormValues,
): Promise<ApiResponse<PrenatalVisit>> {
  return apiClient.put<PrenatalVisit>(`/api/visits/${id}`, data);
}

const FILTER_OPTIONS: { value: VisitType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Routine', label: 'Khám định kỳ' },
  { value: 'Emergency', label: 'Khám bất thường' },
  { value: 'Ultrasound', label: 'Siêu âm' },
  { value: 'Lab', label: 'Xét nghiệm' },
  { value: 'Other', label: 'Khác' },
];

export default function VisitsPage() {
  const queryClient = useQueryClient();
  const { pregnancy } = usePregnancy();
  const [filterType, setFilterType] = useState<VisitType | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<PrenatalVisit | null>(null);
  const [showNoPregnancyWarning, setShowNoPregnancyWarning] = useState(false);

  const createMutation = useMutation({
    mutationFn: ({ pregnancyId, data }: { pregnancyId: string; data: VisitFormValues }) =>
      createVisit(pregnancyId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['visits'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VisitFormValues }) =>
      updateVisit(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['visits'] });
      setShowForm(false);
      setEditingVisit(null);
    },
  });

  const handleAddNew = useCallback(() => {
    if (!pregnancy) {
      setShowNoPregnancyWarning(true);
      return;
    }
    setEditingVisit(null);
    setShowForm(true);
  }, [pregnancy]);

  const handleEdit = useCallback((visit: PrenatalVisit) => {
    setEditingVisit(visit);
    setShowForm(true);
  }, []);

  const handleSave = useCallback(
    async (data: VisitFormValues) => {
      if (editingVisit) {
        await updateMutation.mutateAsync({ id: editingVisit.id, data });
      } else {
        await createMutation.mutateAsync({ pregnancyId: pregnancy!.id, data });
      }
    },
    [editingVisit, createMutation, updateMutation, pregnancy],
  );

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingVisit(null);
  }, []);

  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  const formError = createMutation.error || updateMutation.error;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div
        className="relative overflow-hidden px-6 pt-8 pb-8 md:px-10"
        style={{
          background: 'linear-gradient(135deg, #FF9690 0%, #DA927B 100%)',
        }}
      >
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full opacity-10 bg-white md:right-[-30px] md:top-[-30px]" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full opacity-10 bg-white md:left-[-20px] md:bottom-[-20px]" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl font-bold text-white">Lịch khám thai</h1>
          <p className="mt-1 text-sm text-white/80">
            Theo dõi các buổi khám thai quan trọng
          </p>
        </motion.div>
      </div>

      {/* No pregnancy warning */}
      <AnimatePresence>
        {showNoPregnancyWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-4 mb-4 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
              <svg className="h-4 w-4 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">Chưa có thai kỳ</p>
              <p className="text-xs text-yellow-700">
                Vui lòng thiết lập thai kỳ trước khi thêm lịch khám.
              </p>
            </div>
            <button
              onClick={() => setShowNoPregnancyWarning(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-yellow-500 hover:bg-yellow-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="app-page-content">
        {/* Filter tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filterType === opt.value
                  ? 'bg-[#FF9690] text-white shadow-sm'
                  : 'bg-white text-[#757575] shadow-sm hover:bg-[#FDEEEE]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Visit list */}
        <VisitList filterType={filterType} onEdit={handleEdit} />
      </div>

      {/* FAB */}
      <motion.button
        onClick={handleAddNew}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-lg md:bottom-6"
        style={{ boxShadow: '0 4px 20px rgba(255, 150, 144, 0.4)' }}
        aria-label="Thêm lịch khám"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </motion.button>

      {/* Form modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingVisit ? 'Chỉnh sửa lịch khám' : 'Thêm lịch khám mới'}
        size="md"
      >
        {formError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {String(formError)}
          </motion.div>
        )}
        <VisitForm
          visit={editingVisit}
          onSave={handleSave}
          onCancel={handleCloseForm}
          isLoading={isFormLoading}
        />
      </Modal>
    </div>
  );
}
