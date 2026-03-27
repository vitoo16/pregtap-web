'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { type ChatMessage, type ApiResponse } from '@/types';
import { apiClient } from '@/lib/api-client';
import { ACCESS_COOKIE_NAME } from '@/lib/auth';

const SIGNALR_HUB_URL = 'http://cinezone.info:24466/hubs/chat';
const POLL_INTERVAL_MS = 10_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;

function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${ACCESS_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function parseJwt(token: string): Record<string, string> {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as Record<string, string>;
  } catch {
    return {};
  }
}

function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = parseJwt(token);
  return (
    payload['sub'] ??
    payload['id'] ??
    payload['userId'] ??
    payload['uid'] ??
    payload['nameid'] ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
    null
  );
}

export type UseChatOptions = {
  otherUserId: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onMessageEdited?: (message: ChatMessage) => void;
  onMessageDeleted?: (message: ChatMessage) => void;
};

export type UseChatResult = {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, attachmentFile?: File) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  refetch: () => Promise<void>;
};

export function useChat({ otherUserId, onMessageReceived, onMessageEdited, onMessageDeleted }: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserIdRef = useRef<string | null>(getUserIdFromToken());

  // ── Fetch message history via HTTP ─────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiClient.get<ChatMessage[]>(`/api/chat/messages/${otherUserId}`);
      if (res.success && res.data) {
        // Filter messages belonging to this conversation
        const currentUserId = currentUserIdRef.current ?? '';
        const filtered = res.data.filter((msg) => {
          const senderId = (msg.senderUserId ?? '').toLowerCase();
          const receiverId = (msg.receiverUserId ?? '').toLowerCase();
          const otherId = otherUserId.toLowerCase();
          return (
            (senderId === currentUserId.toLowerCase() && receiverId === otherId) ||
            (senderId === otherId && receiverId === currentUserId.toLowerCase())
          );
        });
        setMessages(filtered);
      }
    } catch (err) {
      console.error('useChat: Failed to fetch history', err);
    }
  }, [otherUserId]);

  // ── Normalize SignalR payload ─────────────────────────────────────────────
  function normalizePayload(raw: unknown): Record<string, unknown> | null {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  // ── Convert raw payload to ChatMessage ────────────────────────────────────
  function toChatMessage(data: Record<string, unknown>, currentUserId: string | null): ChatMessage {
    const senderId = (data['senderUserId'] as string) ?? '';
    const msgId = (data['id'] as string) ?? `temp_${Date.now()}`;
    const content = (data['content'] as string | undefined) ?? '';
    const sentAt = (data['sentAt'] as string) ?? new Date().toISOString();
    const messageType = (data['messageType'] as string) ?? 'Text';
    const deletedAt = data['deletedAt'] as string | undefined;
    const receiverUserId = (data['receiverUserId'] as string) ?? '';
    const attachmentFile = data['attachmentFile'] as
      | {
          id: string;
          originalFileName: string;
          mimeType: string;
          fileSizeBytes?: number;
          fileUrl: string;
        }
      | undefined;

    return {
      id: msgId,
      senderUserId: senderId,
      receiverUserId,
      content,
      attachmentFile,
      sentAt,
      deletedAt,
      isMe: senderId.toLowerCase() === (currentUserId ?? '').toLowerCase(),
      messageType: messageType as 'Text' | 'Image' | 'Document',
    };
  }

  // ── Upsert a message into state ───────────────────────────────────────────
  function upsertMessage(message: ChatMessage) {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === message.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = message;
        return updated;
      }
      // Also check temp messages
      const tempIdx = prev.findIndex(
        (m) =>
          m.id.startsWith('temp_') &&
          m.senderUserId.toLowerCase() === message.senderUserId.toLowerCase() &&
          (m.receiverUserId ?? '').toLowerCase() === (message.receiverUserId ?? '').toLowerCase(),
      );
      if (tempIdx !== -1 && message.isMe) {
        const updated = [...prev];
        updated[tempIdx] = message;
        return updated;
      }
      return [...prev, message];
    });
  }

  // ── Start SignalR connection ──────────────────────────────────────────────
  const startConnection = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Không có phiên đăng nhập');
      return;
    }

    currentUserIdRef.current = getUserIdFromToken();

    // Clean up existing connection
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch {
        // ignore
      }
      connectionRef.current = null;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => Promise.resolve(token),
        withCredentials: true,
      } as signalR.IHttpConnectionOptions)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Register event handlers
    connection.on('ReceiveMessage', (args: unknown[]) => {
      if (!args || args.length === 0) return;
      const data = normalizePayload(args[0]);
      if (!data) return;

      const currentUserId = currentUserIdRef.current;
      const message = toChatMessage(data, currentUserId);

      // Filter: ignore empty sender or empty content with no attachment
      if (!message.senderUserId) return;
      if (!message.content && !message.attachmentFile) return;

      // Only handle messages for this conversation
      const senderId = message.senderUserId.toLowerCase();
      const receiverId = (message.receiverUserId ?? '').toLowerCase();
      const otherId = otherUserId.toLowerCase();
      const isForThisConversation =
        (senderId === otherId && receiverId === (currentUserId ?? '').toLowerCase()) ||
        (senderId === (currentUserId ?? '').toLowerCase() && receiverId === otherId);

      if (!isForThisConversation) return;

      upsertMessage(message);
      onMessageReceived?.(message);
    });

    connection.on('MessageEdited', (args: unknown[]) => {
      if (!args || args.length === 0) return;
      const data = normalizePayload(args[0]);
      if (!data) return;
      const currentUserId = currentUserIdRef.current;
      const message = toChatMessage(data, currentUserId);
      upsertMessage(message);
      onMessageEdited?.(message);
    });

    connection.on('MessageDeleted', (args: unknown[]) => {
      if (!args || args.length === 0) return;
      const data = normalizePayload(args[0]);
      if (!data) return;
      const msgId = (data['id'] as string) ?? '';
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      onMessageDeleted?.({ id: msgId } as ChatMessage);
    });

    connection.onreconnecting(() => {
      setIsConnected(false);
    });

    connection.onreconnected(() => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
    });

    connection.onclose(() => {
      setIsConnected(false);
    });

    try {
      await connection.start();
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
      setError(null);
    } catch (err) {
      console.error('SignalR connection failed:', err);
      setIsConnected(false);
      setError('Không thể kết nối SignalR, đang dùng chế độ polling');
      startPolling();
    }
  }, [otherUserId, onMessageReceived, onMessageEdited, onMessageDeleted]);

  // ── Polling fallback ──────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      void fetchHistory();
    }, POLL_INTERVAL_MS);
  }, [fetchHistory]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // ── Reconnect with exponential backoff ───────────────────────────────────
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptRef.current),
      MAX_RECONNECT_DELAY_MS,
    );
    reconnectAttemptRef.current += 1;
    reconnectTimeoutRef.current = setTimeout(() => {
      void startConnection();
    }, delay);
  }, [startConnection]);

  // ── Initialize ────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    void fetchHistory().then(() => setIsLoading(false));
    void startConnection();

    return () => {
      void (async () => {
        if (connectionRef.current) {
          try {
            await connectionRef.current.stop();
          } catch {
            // ignore
          }
        }
        stopPolling();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      })();
    };
  }, [fetchHistory, startConnection, stopPolling]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, attachmentFile?: File) => {
      const currentUserId = currentUserIdRef.current ?? '';
      const tempId = `temp_${Date.now()}`;

      // Optimistic update
      const tempMessage: ChatMessage = {
        id: tempId,
        senderUserId: currentUserId,
        receiverUserId: otherUserId,
        content,
        sentAt: new Date().toISOString(),
        isMe: true,
        messageType: attachmentFile ? 'Image' : 'Text',
      };

      setMessages((prev) => [...prev, tempMessage]);

      try {
        const formData = new FormData();
        formData.append('receiverUserId', otherUserId);
        formData.append('content', content);

        if (attachmentFile) {
          formData.append('attachment', attachmentFile);
        }

        const token = getAccessToken();
        const res = await fetch('/api/chat/send', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
          credentials: 'include',
        });

        const payload = (await res.json()) as ApiResponse<ChatMessage>;

        if (payload.success && payload.data) {
          // Replace temp message with real one
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? payload.data! : m)),
          );
        } else {
          // Remove temp on failure
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          throw new Error(payload.message ?? 'Gửi tin nhắn thất bại');
        }
      } catch (err) {
        console.error('sendMessage error:', err);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw err;
      }
    },
    [otherUserId],
  );

  // ── Edit message ──────────────────────────────────────────────────────────
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      const res = await apiClient.put<ChatMessage>(`/api/chat/edit/${messageId}`, {
        content: newContent,
      });
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...res.data, isMe: m.isMe } : m)),
        );
      }
    } catch (err) {
      console.error('editMessage error:', err);
      throw err;
    }
  }, []);

  // ── Delete message ────────────────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const res = await apiClient.delete(`/api/chat/${messageId}`);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch (err) {
      console.error('deleteMessage error:', err);
      throw err;
    }
  }, []);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const setTyping = useCallback((_isTyping: boolean) => {
    // Backend doesn't support typing indicator yet, but we keep the API
  }, []);

  // ── Refetch ───────────────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    await fetchHistory();
  }, [fetchHistory]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    setTyping,
    refetch,
  };
}
