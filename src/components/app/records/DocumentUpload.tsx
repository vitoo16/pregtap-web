'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface DocumentUploadProps {
  onUpload: (data: UploadData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export interface UploadData {
  files: File[];
  documentTypeId: string;
  title: string;
  documentDate: string;
}

interface SelectedFile {
  file: File;
  preview?: string;
}

const DOCUMENT_TYPES = [
  { id: 'b0000001-0000-0000-0000-000000000001', label: 'Khám thai', desc: 'Tự động trích xuất dữ liệu', icon: '👶' },
  { id: 'b0000001-0000-0000-0000-000000000002', label: 'Siêu âm', desc: 'Lưu trữ hình ảnh', icon: '📷' },
  { id: 'b0000001-0000-0000-0000-000000000003', label: 'Xét nghiệm máu', desc: 'Lưu trữ kết quả', icon: '🩸' },
  { id: 'b0000001-0000-0000-0000-000000000004', label: 'Xét nghiệm nước tiểu', desc: 'Lưu trữ kết quả', icon: '💧' },
  { id: 'b0000001-0000-0000-0000-000000000005', label: 'Đơn thuốc', desc: 'Lưu trữ đơn thuốc', icon: '💊' },
  { id: '', label: 'Khác', desc: 'Lưu trữ không cần OCR', icon: '📁' },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  return '📎';
}

export function DocumentUpload({ onUpload, onClose, isLoading = false }: DocumentUploadProps) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [documentDate, setDocumentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  function addFiles(newFiles: File[]) {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const validFiles = newFiles.filter((f) => validTypes.includes(f.type) || f.type.startsWith('image/'));

    const selected: SelectedFile[] = validFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFiles((prev) => {
      const updated = [...prev, ...selected];
      // Auto-generate title if empty
      if (!title) {
        setTitle(`Hồ sơ ngày ${format(new Date(), 'dd/MM/yyyy')}`);
      }
      return updated;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index]?.preview) {
        URL.revokeObjectURL(updated[index].preview!);
      }
      updated.splice(index, 1);
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;

    setUploadProgress(0);
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUpload({
        files: files.map((f) => f.file),
        documentTypeId,
        title: title || `Hồ sơ ngày ${format(new Date(), 'dd/MM/yyyy')}`,
        documentDate,
      });
      setUploadProgress(100);
      setTimeout(() => {
        onClose();
      }, 500);
    } finally {
      clearInterval(interval);
    }
  }

  const canSubmit = files.length > 0;

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-[#FF9690] bg-[#FFF5F5]'
            : 'border-[#FF9690]/40 bg-[#FFF8F8] hover:border-[#FF9690]/70 hover:bg-[#FFF5F5]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        <motion.div
          animate={{ y: isDragOver ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF9690]/10">
            <svg className="w-8 h-8 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[#3E2723]">
            Kéo thả tệp vào đây hoặc click để chọn
          </p>
          <p className="mt-1 text-xs text-[#999]">Hỗ trợ: JPG, PNG, PDF</p>
        </motion.div>
      </div>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">
              Tệp đã chọn ({files.length})
            </p>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {files.map((selected, index) => (
                <motion.div
                  key={`${selected.file.name}-${index}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  {selected.preview ? (
                    <img
                      src={selected.preview}
                      alt={selected.file.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF9690]/10 text-lg">
                      {getFileIcon(selected.file.type)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#3E2723]">
                      {selected.file.name}
                    </p>
                    <p className="text-xs text-[#999]">{formatBytes(selected.file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#999] transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Type */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#3E2723]">
          Loại tài liệu
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setDocumentTypeId(type.id)}
              className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-all ${
                documentTypeId === type.id
                  ? 'border-[#FF9690] bg-[#FFF5F5]'
                  : 'border-gray-100 bg-white hover:border-[#FF9690]/30'
              }`}
            >
              <span className="text-base">{type.icon}</span>
              <div>
                <p className={`font-semibold ${documentTypeId === type.id ? 'text-[#FF9690]' : 'text-[#3E2723]'}`}>
                  {type.label}
                </p>
                <p className="text-xs text-[#999]">{type.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#3E2723]" htmlFor="doc-title">
          Tiêu đề
        </label>
        <input
          id="doc-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề tài liệu"
          className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm text-[#3E2723] placeholder-[#999] transition-colors focus:border-[#FF9690] focus:outline-none"
        />
      </div>

      {/* Document Date */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#3E2723]" htmlFor="doc-date">
          Ngày tài liệu
        </label>
        <input
          id="doc-date"
          type="date"
          value={documentDate}
          onChange={(e) => setDocumentDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm text-[#3E2723] transition-colors focus:border-[#FF9690] focus:outline-none"
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-[#999]">
            <span>Đang tải lên...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74]"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 rounded-full border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Đang tải lên...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Tải lên
            </>
          )}
        </button>
      </div>
    </form>
  );
}
