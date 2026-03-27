'use client';

import { useState } from 'react';

import { Modal } from './Modal';

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={false}>
      <p className="text-sm text-[#757575]">{message}</p>
      <div className="mt-6 flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting || isLoading}
          className="rounded-full border-2 border-gray-200 px-5 py-2 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={isSubmitting || isLoading}
          className={`rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            variant === 'danger'
              ? 'bg-[#C44545] hover:bg-[#B03030]'
              : 'bg-linear-to-r from-[#FF9690] to-[#FF7A74] hover:shadow-md'
          }`}
        >
          {isSubmitting || isLoading ? 'Đang xử lý...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
