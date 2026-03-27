'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { type ChatMessage } from '@/types';

type ChatRoomProps = {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserSpecialty?: string;
  isDoctorView?: boolean;
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FFCCBC] text-[#E64A19]">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#FF9690]"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function shouldShowTimestamp(
  current: ChatMessage,
  prev: ChatMessage | null,
  next: ChatMessage | null,
): boolean {
  // Always show for first message
  if (!prev) return true;

  // Show if sender changes
  if (prev.senderUserId !== current.senderUserId) return true;

  // Show if more than 10 minutes gap
  const currentTime = new Date(current.sentAt).getTime();
  const prevTime = new Date(prev.sentAt).getTime();
  if (Math.abs(currentTime - prevTime) > 10 * 60 * 1000) return true;

  return false;
}

function shouldShowAvatar(
  current: ChatMessage,
  prev: ChatMessage | null,
): boolean {
  if (!prev) return true;
  if (prev.senderUserId !== current.senderUserId) return true;

  const currentTime = new Date(current.sentAt).getTime();
  const prevTime = new Date(prev.sentAt).getTime();
  if (Math.abs(currentTime - prevTime) > 10 * 60 * 1000) return true;

  return false;
}

function shouldShowTimestampNext(
  current: ChatMessage,
  next: ChatMessage | null,
): boolean {
  if (!next) return true;
  if (current.senderUserId !== next.senderUserId) return true;

  const currentTime = new Date(current.sentAt).getTime();
  const nextTime = new Date(next.sentAt).getTime();
  if (Math.abs(currentTime - nextTime) > 10 * 60 * 1000) return true;

  return false;
}

export function ChatRoom({
  otherUserId,
  otherUserName,
  otherUserAvatar,
  otherUserSpecialty,
  isDoctorView = false,
}: ChatRoomProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const { messages, isConnected, isLoading, error, sendMessage, editMessage, deleteMessage } =
    useChat({ otherUserId });

  // Sort messages: oldest first (for chronological display)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );

  // Auto-scroll to bottom on new message
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  useEffect(() => {
    if (sortedMessages.length !== prevMessagesLengthRef.current) {
      const isGrowing = sortedMessages.length > prevMessagesLengthRef.current;
      prevMessagesLengthRef.current = sortedMessages.length;
      scrollToBottom(isGrowing ? 'smooth' : 'instant');
    }
  }, [sortedMessages.length, scrollToBottom]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => scrollToBottom('instant'), 100);
    }
  }, [isLoading, scrollToBottom]);

  const handleSend = useCallback(
    async (text: string, file?: File) => {
      await sendMessage(text, file);
    },
    [sendMessage],
  );

  const handleEdit = useCallback(
    async (messageId: string, content: string) => {
      await editMessage(messageId, content);
    },
    [editMessage],
  );

  const handleDelete = useCallback(
    async (messageId: string) => {
      await deleteMessage(messageId);
    },
    [deleteMessage],
  );

  const initial = otherUserName.charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
        style={{ background: 'linear-gradient(135deg, #FF9690 0%, #DA927B 100%)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          aria-label="Quay lại"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/30 text-sm font-bold text-white">
          {otherUserAvatar ? (
            <img src={otherUserAvatar} alt={otherUserName} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-white">{otherUserName}</h2>
          {otherUserSpecialty && (
            <p className="truncate text-xs text-white/80">{otherUserSpecialty}</p>
          )}
          {!otherUserSpecialty && (
            <p className="text-xs text-white/80">
              {isConnected ? 'Đang hoạt động' : 'Đang kết nối...'}
            </p>
          )}
        </div>

        {/* Connection status */}
        {!isConnected && (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-yellow-300 animate-pulse" />
            <span className="text-xs font-semibold text-white/80">Đang kết nối...</span>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2">
          <p className="text-xs text-yellow-700 text-center">
            {error} — Đang tải tin nhắn qua polling.
          </p>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 rounded-full border-[3px] border-[#FF9690]/30 border-t-[#FF9690] loading-spinner" />
              <p className="mt-3 text-sm text-[#999]">Đang tải tin nhắn...</p>
            </div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEEEE] text-[#FF9690]">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#3E2723]">Bắt đầu cuộc trò chuyện</h3>
            <p className="mt-2 text-sm text-[#757575] max-w-xs">
              Gửi tin nhắn cho {otherUserName} để được tư vấn về sức khỏe thai kỳ.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {sortedMessages.map((message, index) => {
              const prevMsg = index > 0 ? sortedMessages[index - 1] : null;
              const nextMsg = index < sortedMessages.length - 1 ? sortedMessages[index + 1] : null;

              const showTimestamp = shouldShowTimestamp(message, prevMsg, nextMsg);
              const showAvatar = shouldShowAvatar(message, prevMsg);
              const isLastInGroup = shouldShowTimestampNext(message, nextMsg);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showTimestamp={showTimestamp}
                  showAvatar={showAvatar}
                  isFirstInGroup={prevMsg ? prevMsg.senderUserId !== message.senderUserId : true}
                  isLastInGroup={isLastInGroup}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
