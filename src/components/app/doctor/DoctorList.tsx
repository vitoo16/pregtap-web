'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { apiClient } from '@/lib/api-client';
import { type Doctor, type Conversation, type ApiResponse } from '@/types';

type DoctorItem = Omit<Doctor, 'specialty'> & { specialty?: string };
type RawChatPartner = {
  id?: string;
  fullName?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  specialty?: string | null;
  lastMessage?: string | null;
  unreadCount?: number | null;
  otherUserId?: string;
  otherUserName?: string | null;
  otherUserAvatar?: string | null;
  lastMessageAt?: string | null;
};

async function fetchDoctors(): Promise<ApiResponse<DoctorItem[]>> {
  return apiClient.get<DoctorItem[]>('/api/chat/doctors');
}

async function fetchConversations(): Promise<ApiResponse<Conversation[]>> {
  return apiClient.get<Conversation[]>('/api/chat/conversations');
}

function normalizeDoctor(item: RawChatPartner): DoctorItem | null {
  const id = item.id ?? item.otherUserId;
  if (!id) return null;

  return {
    id,
    name: item.name ?? item.fullName ?? item.otherUserName ?? 'Bác sĩ',
    specialty: item.specialty ?? undefined,
    avatarUrl: item.avatarUrl ?? item.otherUserAvatar ?? undefined,
    lastMessage: item.lastMessage ?? undefined,
    unreadCount: item.unreadCount ?? undefined,
  };
}

function normalizeConversation(item: RawChatPartner): Conversation | null {
  const otherUserId = item.otherUserId ?? item.id;
  if (!otherUserId) return null;

  return {
    id: item.id ?? otherUserId,
    otherUserId,
    otherUserName: item.otherUserName ?? item.fullName ?? item.name ?? 'Người dùng',
    otherUserAvatar: item.otherUserAvatar ?? item.avatarUrl ?? undefined,
    lastMessage: item.lastMessage ?? undefined,
    lastMessageAt: item.lastMessageAt ?? undefined,
    unreadCount: item.unreadCount ?? 0,
  };
}

function getSafeDisplayName(name: string | null | undefined, fallback = 'Bác sĩ'): string {
  const normalized = name?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

function DoctorAvatar({ avatarUrl, name }: { avatarUrl?: string; name?: string | null }) {
  const displayName = getSafeDisplayName(name);
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#FF9690] to-[#FFC0C0] text-sm font-bold text-white shadow-sm">
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}

function DoctorCard({ doctor, index }: { doctor: DoctorItem; index: number }) {
  const doctorName = getSafeDisplayName(doctor.name);
  const lastMsgTime = doctor.lastMessage
    ? format(new Date(), 'HH:mm')
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link
        href={`/app/doctor/${doctor.id}`}
        className="card flex items-center gap-3 p-4 transition-all hover:shadow-md active:scale-[0.99]"
      >
        <DoctorAvatar avatarUrl={doctor.avatarUrl} name={doctorName} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-[#3E2723]">
              {doctorName}
            </h3>
            {doctor.unreadCount && doctor.unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF9690] px-1.5 text-[10px] font-bold text-white">
                {doctor.unreadCount > 99 ? '99+' : doctor.unreadCount}
              </span>
            )}
          </div>

          {doctor.specialty && (
            <p className="mt-0.5 truncate text-xs text-[#757575]">
              {doctor.specialty}
            </p>
          )}

          {doctor.lastMessage && (
            <p className="mt-1 truncate text-xs text-[#999]">
              {doctor.lastMessage}
            </p>
          )}
        </div>

        {lastMsgTime && (
          <span className="shrink-0 text-[10px] text-[#999]">
            {lastMsgTime}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

function ConversationCard({ conv, index }: { conv: Conversation; index: number }) {
  const participantName = getSafeDisplayName(conv.otherUserName, 'Người dùng');
  const lastMsgTime = conv.lastMessageAt
    ? (() => {
        try {
          const date = parseISO(conv.lastMessageAt);
          return format(date, 'HH:mm');
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link
        href={`/app/doctor/${conv.otherUserId}`}
        className="card flex items-center gap-3 p-4 transition-all hover:shadow-md active:scale-[0.99]"
      >
        <DoctorAvatar avatarUrl={conv.otherUserAvatar} name={participantName} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-[#3E2723]">
              {participantName}
            </h3>
            {conv.unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF9690] px-1.5 text-[10px] font-bold text-white">
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </span>
            )}
          </div>

          {conv.lastMessage && (
            <p className="mt-1 truncate text-xs text-[#999]">
              {conv.lastMessage}
            </p>
          )}
        </div>

        {lastMsgTime && (
          <span className="shrink-0 text-[10px] text-[#999]">
            {lastMsgTime}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

type DoctorListProps = {
  showConversationsOnly?: boolean;
};

export function DoctorList({ showConversationsOnly = false }: DoctorListProps) {
  const {
    data: doctorsData,
    isLoading: doctorsLoading,
    error: doctorsError,
  } = useQuery({
    queryKey: ['doctors'],
    queryFn: fetchDoctors,
    retry: 1,
  });

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    retry: 1,
  });

  const doctors = doctorsData?.success
    ? ((doctorsData.data as unknown as RawChatPartner[] | undefined) ?? [])
        .map(normalizeDoctor)
        .filter((item): item is DoctorItem => Boolean(item))
    : [];

  const conversations = conversationsData?.success
    ? ((conversationsData.data as unknown as RawChatPartner[] | undefined) ?? [])
        .map(normalizeConversation)
        .filter((item): item is Conversation => Boolean(item))
    : [];

  const isLoading = doctorsLoading || conversationsLoading;
  const error = doctorsError || conversationsError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="h-8 w-8 rounded-full border-[3px] border-[#FF9690]/30 border-t-[#FF9690] loading-spinner" />
        <p className="text-sm text-[#999]">Đang tải danh sách...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F1]">
          <svg className="h-6 w-6 text-[#C44545]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-sm text-[#757575]">Không thể tải danh sách</p>
        <p className="mt-1 text-xs text-[#999]">{String(error)}</p>
      </div>
    );
  }

  if (showConversationsOnly) {
    if (!conversations.length) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEEEE] text-[#FF9690]">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <line x1="12" y1="14" x2="12" y2="18" />
              <line x1="10" y1="16" x2="14" y2="16" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#3E2723]">Chưa có cuộc trò chuyện</h3>
          <p className="mt-2 text-sm text-[#757575] max-w-sm">
            Bắt đầu cuộc trò chuyện với bác sĩ để được tư vấn sức khỏe thai kỳ.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {conversations.map((conv, i) => (
          <ConversationCard key={conv.otherUserId} conv={conv} index={i} />
        ))}
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEEEE] text-[#FF9690]">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#3E2723]">Chưa có bác sĩ nào</h3>
        <p className="mt-2 text-sm text-[#757575] max-w-sm">
          Danh sách bác sĩ đang được cập nhật. Vui lòng quay lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {doctors.map((doctor, i) => (
        <DoctorCard key={doctor.id} doctor={doctor} index={i} />
      ))}
    </div>
  );
}
