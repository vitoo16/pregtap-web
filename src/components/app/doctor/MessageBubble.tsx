'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { type ChatMessage } from '@/types';

type MessageBubbleProps = {
  message: ChatMessage;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onImageClick?: (url: string) => void;
};

function formatTime(isoString: string): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return '';
    return format(date, 'HH:mm');
  } catch {
    return '';
  }
}

export function MessageBubble({
  message,
  showAvatar = true,
  showTimestamp = true,
  isFirstInGroup = true,
  isLastInGroup = true,
  onEdit,
  onDelete,
  onImageClick,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editText, setEditText] = useState(message.content ?? '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isMe = message.isMe;
  const isTemp = message.id.startsWith('temp_');
  const messageType = message.messageType;
  const attachmentFile = message.attachmentFile;

  // ── Group border radius ─────────────────────────────────────────────────────
  const bubbleRadius = {
    borderRadius: [
      isMe ? '20px' : '20px',
      isMe ? '20px' : '4px',
      isMe ? (isLastInGroup ? '4px' : '20px') : (isLastInGroup ? '20px' : '4px'),
      isMe ? '20px' : '20px',
    ],
  };

  // ── Long press for mobile ───────────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    if (!isMe) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    longPressTimerRef.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    if (dx > 10 || dy > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }

  function handleTouchEnd() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  function handleEditSave() {
    const newContent = editText.trim();
    if (newContent && newContent !== message.content && onEdit) {
      onEdit(message.id, newContent);
    }
    setShowEditDialog(false);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function handleDelete() {
    if (onDelete) {
      onDelete(message.id);
    }
    setShowDeleteConfirm(false);
    setShowActions(false);
  }

  // ── Image full URL ───────────────────────────────────────────────────────────
  function getFullImageUrl(path: string): string {
    if (path.startsWith('http')) return path;
    const base = 'http://cinezone.info:24466';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }

  // ── Render content ───────────────────────────────────────────────────────────
  function renderContent() {
    const { messageType, content, attachmentFile } = message;

    // Temp image — show local preview
    if (isTemp && messageType === 'Image' && content) {
      return (
        <div className="relative">
          <img
            src={content}
            alt="Đang tải..."
            className="max-w-[200px] max-h-[200px] rounded-xl object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
            <div className="h-5 w-5 rounded-full border-2 border-white/60 border-t-white loading-spinner" />
          </div>
        </div>
      );
    }

    // Real image
    if (messageType === 'Image' && attachmentFile?.fileUrl) {
      return (
        <div
          onClick={() => {
            setShowImageModal(true);
            onImageClick?.(getFullImageUrl(attachmentFile.fileUrl));
          }}
          className="cursor-pointer overflow-hidden rounded-xl"
        >
          <img
            src={getFullImageUrl(attachmentFile.fileUrl)}
            alt="Hình ảnh"
            className="max-w-[200px] max-h-[200px] object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>
      );
    }

    // Temp document
    if (isTemp && messageType === 'Document' && content) {
      const fileName = content.replace('[Tài liệu: ', '').replace(']', '');
      return (
        <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
          <svg className="h-4 w-4 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="truncate text-sm font-medium text-white">{fileName}</span>
          <div className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white loading-spinner flex-shrink-0" />
        </div>
      );
    }

    // Real document
    if (messageType === 'Document' && attachmentFile?.fileUrl) {
      const downloadUrl = `http://cinezone.info:24466/api/chat/download/${attachmentFile.id}`;
      return (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 transition-colors hover:bg-white/30"
        >
          <svg className="h-4 w-4 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="truncate text-sm font-medium text-white">
            {attachmentFile.originalFileName}
          </span>
        </a>
      );
    }

    // Text message
    if (content) {
      return <p className="text-sm leading-relaxed">{content}</p>;
    }

    return null;
  }

  const hasContent = renderContent() !== null;

  if (!hasContent && messageType === 'Text') return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${
          showTimestamp ? 'mb-2' : 'mb-1'
        }`}
        onContextMenu={(e) => {
          if (isMe) {
            e.preventDefault();
            setShowActions(!showActions);
          }
        }}
        onMouseEnter={() => { if (isMe && !('ontouchstart' in window)) setShowActions(true); }}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex max-w-[75%] items-end gap-2">
          {/* Avatar for other user */}
          {!isMe && (
            <div className="flex w-8 flex-shrink-0 flex-col items-center">
              {showAvatar ? (
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#FFCCBC] text-[#E64A19]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              ) : (
                <div className="h-8 w-8" />
              )}
            </div>
          )}

          {/* Bubble */}
          <div className="relative">
            {/* Action menu */}
            {showActions && isMe && !isTemp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-8 right-0 z-10 flex items-center gap-1 rounded-full bg-white px-1.5 py-1 shadow-lg"
              >
                <button
                  onClick={() => {
                    setEditText(message.content ?? '');
                    setShowEditDialog(true);
                    setShowActions(false);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-50"
                  title="Sửa"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowActions(false);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                  title="Xóa"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </motion.div>
            )}

            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`overflow-hidden ${isMe ? 'bg-gradient-to-br from-[#FF9690] to-[#FF7A74]' : 'bg-[#F5F6F8]'} ${!isMe ? 'text-[#3E2723]' : ''}`}
              style={bubbleRadius as unknown as React.CSSProperties}
            >
              <div className="px-4 py-3">{renderContent()}</div>
            </div>

            {showTimestamp && (
              <p
                className={`mt-1 pr-1 text-[10px] ${isMe ? 'text-right text-[#999]' : 'text-left text-[#CCC]'}`}
              >
                {formatTime(message.sentAt)}
                {isTemp && ' · Đang gửi...'}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image viewer modal */}
      {showImageModal && attachmentFile?.fileUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={getFullImageUrl(attachmentFile.fileUrl)}
            alt="Hình ảnh đầy đủ"
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Edit dialog */}
      {showEditDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
          onClick={() => setShowEditDialog(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-base font-bold text-[#3E2723]">Chỉnh sửa tin nhắn</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#3E2723] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
              rows={3}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEditDialog(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSave}
                className="rounded-xl bg-gradient-to-r from-[#FF9690] to-[#FF7A74] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-bold text-[#3E2723]">Xóa tin nhắn</h3>
            <p className="mb-5 text-sm text-[#757575]">Bạn có chắc muốn xóa tin nhắn này không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
