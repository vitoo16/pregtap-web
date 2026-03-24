'use client';

import { AnimatePresence, motion } from 'framer-motion';

type ToastNoticeProps = {
  isOpen: boolean;
  message: string;
  tone?: 'success' | 'error';
  onClose: () => void;
};

export function ToastNotice({ isOpen, message, tone = 'success', onClose }: ToastNoticeProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="fixed top-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
        >
          <div
            className={`flex items-start gap-3 rounded-[24px] border px-4 py-3 shadow-[0_18px_40px_rgba(62,39,35,0.14)] backdrop-blur-sm ${
              tone === 'success'
                ? 'border-[#B8E6D4] bg-white text-[#245B47]'
                : 'border-[#FFD2D2] bg-white text-[#C44545]'
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                tone === 'success' ? 'bg-[#E7F7EF]' : 'bg-[#FFF1F1]'
              }`}
            >
              <span className="text-base font-bold">{tone === 'success' ? '✓' : '!'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{tone === 'success' ? 'Thành công' : 'Có lỗi xảy ra'}</div>
              <div className="mt-1 text-sm">{message}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-black/5"
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}