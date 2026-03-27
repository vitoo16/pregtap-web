'use client';

import { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';

type ChatInputProps = {
  onSend: (text: string, file?: File) => Promise<void>;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if ((!trimmed && !attachedFile) || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmed, attachedFile ?? undefined);
      setText('');
      setAttachedFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // Error is handled by the caller
    } finally {
      setIsSending(false);
    }
  }, [text, attachedFile, isSending, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    setShowAttachmentMenu(false);
    // Reset input
    if (e.target) e.target.value = '';
  }, []);

  const handleImageSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    setShowAttachmentMenu(false);
    if (e.target) e.target.value = '';
  }, []);

  const removeAttachment = useCallback(() => {
    setAttachedFile(null);
  }, []);

  const canSend = (text.trim().length > 0 || attachedFile !== null) && !isSending && !disabled;

  return (
    <div className="border-t border-gray-100 bg-white px-3 pb-safe pt-3">
      {/* Attachment preview */}
      {attachedFile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-2 flex items-center gap-2 rounded-xl bg-[#FDEEEE] px-3 py-2"
        >
          {attachedFile.type.startsWith('image/') ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
              <img
                src={URL.createObjectURL(attachedFile)}
                alt={attachedFile.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFC0C0]/30">
              <svg className="h-5 w-5 text-[#FF7A74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[#3E2723]">{attachedFile.name}</p>
            <p className="text-[10px] text-[#999]">
              {(attachedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={removeAttachment}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#FF9690]/20 hover:text-[#FF7A74]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            disabled={disabled}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#FDEEEE] hover:text-[#FF9690] disabled:opacity-50"
            aria-label="Đính kèm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          {showAttachmentMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAttachmentMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute bottom-full left-0 z-20 mb-2 flex flex-col gap-1 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-gray-100"
              >
                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageSelect}
                  accept="image/*"
                />

                <button
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    imageInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[#3E2723] transition-colors hover:bg-[#FDEEEE]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1565C0]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Hình ảnh</p>
                    <p className="text-xs text-[#999]">Gửi ảnh từ thiết bị</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[#3E2723] transition-colors hover:bg-[#FDEEEE]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF3E0] text-[#E65100]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Tài liệu</p>
                    <p className="text-xs text-[#999]">Gửi file PDF, Word, TXT</p>
                  </div>
                </button>
              </motion.div>
            </>
          )}
        </div>

        {/* Text input */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={disabled || isSending}
            rows={1}
            className="min-h-[40px] w-full resize-none overflow-hidden rounded-full border border-[#E0E0E0] bg-[#F5F6F8] px-4 py-2.5 text-sm text-[#3E2723] placeholder:text-[#999] focus:border-[#FF9690] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20 disabled:opacity-50"
            style={{ maxHeight: 120 }}
          />
        </div>

        {/* Send button */}
        <motion.button
          onClick={() => void handleSend()}
          disabled={!canSend}
          whileTap={{ scale: 0.92 }}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm transition-all ${
            canSend
              ? 'bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white'
              : 'bg-[#E0E0E0] text-[#999]'
          } ${isSending ? 'opacity-70' : ''}`}
          aria-label="Gửi tin nhắn"
        >
          {isSending ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white loading-spinner" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  );
}
