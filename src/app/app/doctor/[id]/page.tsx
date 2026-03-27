'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChatRoom } from '@/components/app/doctor/ChatRoom';
import { type Doctor, type ApiResponse } from '@/types';
import { apiClient } from '@/lib/api-client';

type DoctorInfo = {
  id: string;
  name: string;
  specialty?: string;
  avatarUrl?: string;
};

export default function ChatPage() {
  const params = useParams();
  const otherUserId = params.id as string;
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctorInfo() {
      if (!otherUserId) return;
      setLoading(true);
      try {
        // Try to get doctor info from conversations first
        const convRes = await apiClient.get<Array<{ otherUserId: string; otherUserName: string; otherUserAvatar?: string }>>('/api/chat/conversations');
        if (convRes.success && convRes.data) {
          const conv = convRes.data.find((c) => c.otherUserId === otherUserId);
          if (conv) {
            setDoctor({
              id: conv.otherUserId,
              name: conv.otherUserName,
              avatarUrl: conv.otherUserAvatar,
            });
            setLoading(false);
            return;
          }
        }

        // Fallback: try to get from doctors list
        const doctorRes = await apiClient.get<Doctor[]>('/api/chat/doctors');
        if (doctorRes.success && doctorRes.data) {
          const doc = doctorRes.data.find((d) => d.id === otherUserId);
          if (doc) {
            setDoctor({
              id: doc.id,
              name: doc.name,
              specialty: doc.specialty,
              avatarUrl: doc.avatarUrl,
            });
            setLoading(false);
            return;
          }
        }

        // Last resort: use the ID as name
        setDoctor({ id: otherUserId, name: 'Người dùng' });
      } catch (err) {
        setError('Không thể tải thông tin cuộc trò chuyện');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void fetchDoctorInfo();
  }, [otherUserId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-[3px] border-[#FF9690]/30 border-t-[#FF9690] loading-spinner" />
          <p className="mt-4 text-sm text-[#999]">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1F1] text-[#C44545]">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-[#757575]">{error ?? 'Không tìm thấy cuộc trò chuyện'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatRoom
        otherUserId={otherUserId}
        otherUserName={doctor.name}
        otherUserAvatar={doctor.avatarUrl}
        otherUserSpecialty={doctor.specialty}
      />
    </div>
  );
}
