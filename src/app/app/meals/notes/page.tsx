'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import { apiClient } from '@/lib/api-client';
import { usePregnancy } from '@/contexts/PregnancyContext';
import type { NutritionNote, ApiResponse } from '@/types';
import { Badge } from '@/components/app/shared/Badge';
import { EmptyState } from '@/components/app/shared/EmptyState';
import { LoadingSpinner } from '@/components/app/shared/LoadingSpinner';
import { Modal } from '@/components/app/shared/Modal';

// ─── API helpers ───────────────────────────────────────────────────────────────

async function fetchNutritionNotes(pregnancyId: string): Promise<ApiResponse<NutritionNote[]>> {
  return apiClient.get<NutritionNote[]>(`/api/nutrition-notes`, { pregnancyId });
}

async function createNutritionNote(
  pregnancyId: string,
  noteType: string,
  content: string,
): Promise<ApiResponse<NutritionNote>> {
  return apiClient.post<NutritionNote>(`/api/nutrition-notes`, {
    noteType,
    content,
  });
}

async function updateNutritionNote(
  pregnancyId: string,
  noteId: string,
  noteType: string,
  content: string,
): Promise<ApiResponse<NutritionNote>> {
  return apiClient.put<NutritionNote>(`/api/nutrition-notes/${noteId}`, {
    noteType,
    content,
  });
}

async function deleteNutritionNote(pregnancyId: string, noteId: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/nutrition-notes/${noteId}`);
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type NoteType = 'Diet' | 'Note' | 'Other';

const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; color: string; bgColor: string; variant: 'success' | 'info' | 'default' }> = {
  Diet: { label: 'Chế độ ăn', color: '#22C55E', bgColor: '#DCFCE7', variant: 'success' },
  Note: { label: 'Ghi chú', color: '#3B82F6', bgColor: '#DBEAFE', variant: 'info' },
  Other: { label: 'Khác', color: '#757575', bgColor: '#F5F5F5', variant: 'default' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NutritionNotesPage() {
  const router = useRouter();
  const { pregnancy } = usePregnancy();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NutritionNote | null>(null);
  const [filterType, setFilterType] = useState<NoteType | 'All'>('All');
  const [noteType, setNoteType] = useState<NoteType>('Note');
  const [noteContent, setNoteContent] = useState('');
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch notes
  const {
    data: notesResponse,
    isLoading,
  } = useQuery({
    queryKey: ['nutrition-notes', pregnancy?.id],
    queryFn: () => fetchNutritionNotes(pregnancy!.id),
    enabled: !!pregnancy?.id,
  });

  const allNotes: NutritionNote[] = notesResponse?.data ?? [];

  // Filter notes
  const filteredNotes = filterType === 'All'
    ? allNotes
    : allNotes.filter((n) => n.noteType === filterType);

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar(null), 3000);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: () => createNutritionNote(pregnancy!.id, noteType, noteContent.trim()),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['nutrition-notes'] });
        closeForm();
        showSnackbar('Thêm ghi chú thành công', 'success');
      } else {
        showSnackbar(response.message ?? 'Có lỗi xảy ra', 'error');
      }
    },
    onError: () => {
      showSnackbar('Có lỗi xảy ra', 'error');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: () => updateNutritionNote(pregnancy!.id, editingNote!.id, noteType, noteContent.trim()),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['nutrition-notes'] });
        closeForm();
        showSnackbar('Cập nhật ghi chú thành công', 'success');
      } else {
        showSnackbar(response.message ?? 'Có lỗi xảy ra', 'error');
      }
    },
    onError: () => {
      showSnackbar('Có lỗi xảy ra', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNutritionNote(pregnancy!.id, noteId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['nutrition-notes'] });
        showSnackbar('Xóa ghi chú thành công', 'success');
      } else {
        showSnackbar(response.message ?? 'Có lỗi xảy ra', 'error');
      }
    },
    onError: () => {
      showSnackbar('Có lỗi xảy ra', 'error');
    },
  });

  const openAddForm = () => {
    setEditingNote(null);
    setNoteType('Note');
    setNoteContent('');
    setIsAddOpen(true);
  };

  const openEditForm = (note: NutritionNote) => {
    setEditingNote(note);
    setNoteType(note.noteType as NoteType);
    setNoteContent(note.content);
    setIsAddOpen(true);
  };

  const closeForm = () => {
    setIsAddOpen(false);
    setEditingNote(null);
    setNoteType('Note');
    setNoteContent('');
  };

  const handleSubmit = () => {
    if (!noteContent.trim()) return;
    if (editingNote) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const noteTypeCount = (type: NoteType) =>
    allNotes.filter((n) => n.noteType === type).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="app-page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
            aria-label="Quay lại"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="heading-3 text-[#3E2723]">Ghi chú dinh dưỡng</h1>
            <p className="text-sm text-[#757575]">Theo dõi chế độ ăn và ghi chú</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-page-content">
        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Diet', 'Note', 'Other'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all
                ${filterType === type
                  ? 'bg-gradient-to-r from-[#FF9690] to-[#FF7A74] text-white shadow-sm'
                  : 'bg-white text-[#757575] hover:bg-[#FDEEEE] border border-gray-200'
                }
              `}
            >
              {type === 'All' ? (
                <>
                  <span>Tất cả</span>
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                    {allNotes.length}
                  </span>
                </>
              ) : (
                <>
                  <span>{NOTE_TYPE_CONFIG[type as NoteType].label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filterType === type ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {noteTypeCount(type as NoteType)}
                  </span>
                </>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            }
            title="Chưa có ghi chú nào"
            description={filterType === 'All'
              ? 'Thêm ghi chú để theo dõi chế độ ăn và dinh dưỡng của bạn'
              : `Chưa có ghi chú loại "${NOTE_TYPE_CONFIG[filterType as NoteType].label}"`
            }
            action={
              <button
                onClick={openAddForm}
                className="btn btn-primary rounded-full px-6 py-3 text-sm"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Thêm ghi chú
              </button>
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredNotes.map((note, index) => {
              const config = NOTE_TYPE_CONFIG[note.noteType as NoteType] ?? NOTE_TYPE_CONFIG.Other;
              const createdDate = note.createdAt ? parseISO(note.createdAt) : null;

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-4 group hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
                        style={{ backgroundColor: config.bgColor, color: config.color }}
                      >
                        {config.label}
                      </span>
                      {createdDate && (
                        <span className="text-xs text-[#999]">
                          {format(createdDate, 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(note)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#E3F2FD] text-[#757575] hover:text-[#3B82F6] transition-colors"
                        aria-label="Sửa"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(note.id)}
                        disabled={deleteMutation.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#FFF1F1] text-[#757575] hover:text-[#C44545] transition-colors disabled:opacity-50"
                        aria-label="Xóa"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-3">
                    <p className="text-sm text-[#3E2723] leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* FAB - Add Button */}
      <button
        onClick={openAddForm}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-lg hover:shadow-xl transition-shadow z-40"
        aria-label="Thêm ghi chú"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={closeForm}
        title={editingNote ? 'Sửa ghi chú' : 'Thêm ghi chú'}
        size="md"
      >
        <div className="space-y-5">
          {/* Type Selection */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-[#3E2723]">Loại ghi chú</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Diet', 'Note', 'Other'] as NoteType[]).map((type) => {
                const config = NOTE_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setNoteType(type)}
                    className={`
                      flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all
                      ${noteType === type
                        ? 'border-current'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                    style={{ color: noteType === type ? config.color : '#757575' }}
                  >
                    <span className="text-sm font-bold">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3E2723]">
              Nội dung
            </label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Nhập nội dung ghi chú..."
              className="w-full rounded-xl border border-gray-200 bg-[#F5F5F5] px-4 py-3 text-sm text-[#3E2723] placeholder-[#999] outline-none focus:border-[#FF9690] focus:bg-white transition-colors resize-none"
              rows={5}
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={closeForm}
              className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!noteContent.trim() || createMutation.isPending || updateMutation.isPending}
              className="btn btn-primary flex-1 rounded-xl py-3 text-sm disabled:opacity-60"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang lưu...
                </span>
              ) : (
                editingNote ? 'Cập nhật' : 'Lưu'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Snackbar */}
      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`
              fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-5 py-3 shadow-lg
              ${snackbar.type === 'success' ? 'bg-[#1F7A4D] text-white' : 'bg-[#C44545] text-white'}
            `}
          >
            {snackbar.type === 'success' ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            )}
            <span className="text-sm font-semibold">{snackbar.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
