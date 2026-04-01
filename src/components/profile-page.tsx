'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { type ApiResponse, type AuthUser, type ProfileFormValues } from '@/lib/auth';
import { extractSubscriptionStatus, formatDateVi, getPlanLabel, type SubscriptionStatus } from '@/lib/subscription';
import { getAccessToken } from '@/lib/token-store';

const initialFormValues: ProfileFormValues = {
  fullName: '',
  phone: '',
  preferredLanguage: 'vi',
  dateOfBirth: '',
};

function mapUserToForm(user: AuthUser): ProfileFormValues {
  return {
    fullName: user.fullName ?? '',
    phone: user.phone ?? '',
    preferredLanguage: user.preferredLanguage ?? 'vi',
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<ProfileFormValues>(initialFormValues);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = getAccessToken();
        const response = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          cache: 'no-store',
        });

        const payload = (await response.json()) as ApiResponse<AuthUser>;

        if (!response.ok || !payload.success || !payload.data) {
          setFeedback({
            type: 'error',
            message: payload.message ?? 'Bạn cần đăng nhập để xem hồ sơ.',
          });
          setUser(null);
          return;
        }

        setUser(payload.data);
        setForm(mapUserToForm(payload.data));
        setAvatarPreview(payload.data.avatarUrl ?? null);

        const subscriptionResponse = await fetch('/api/subscriptions/status', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          cache: 'no-store',
        });
        const subscriptionPayload = (await subscriptionResponse.json()) as ApiResponse<unknown>;

        if (subscriptionResponse.ok && subscriptionPayload.success) {
          setSubscriptionStatus(extractSubscriptionStatus(subscriptionPayload.data));
        }
      } catch {
        setFeedback({
          type: 'error',
          message: 'Không thể tải hồ sơ người dùng.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      if (user?.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile, user?.avatarUrl]);

  const profileName = useMemo(() => {
    return user?.fullName?.trim() || user?.email?.trim() || 'Mẹ bầu PregTap';
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = new FormData();
      payload.append('FullName', form.fullName.trim());
      payload.append('Phone', form.phone.trim());
      payload.append('PreferredLanguage', form.preferredLanguage);

      if (form.dateOfBirth) {
        payload.append('DateOfBirth', form.dateOfBirth);
      }

      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      const tokenMatch = document.cookie.match(/pregtap_access_token=([^;]+)/);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : undefined;

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: payload,
        credentials: 'include',
      });

      const result = (await response.json()) as ApiResponse<AuthUser>;

      if (!response.ok || !result.success || !result.data) {
        setFeedback({
          type: 'error',
          message: result.errors?.join(' ') || result.message || 'Cập nhật hồ sơ thất bại.',
        });
        return;
      }

      setUser(result.data);
      setForm(mapUserToForm(result.data));
      setAvatarFile(null);
      setFeedback({
        type: 'success',
        message: result.message || 'Hồ sơ đã được cập nhật thành công.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Không thể kết nối tới máy chủ để cập nhật hồ sơ.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#FFEBEE] via-[#FFF8F4] to-[#FFF5F5] text-[#3E2723]">
      <section className="relative overflow-hidden px-6 pt-10 pb-20 lg:px-8">
        <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-[#FFC0C0]/35 blur-3xl" />
        <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-[#B8E6D4]/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 rounded-[28px] bg-white/80 p-5 shadow-[0_10px_40px_rgba(255,150,144,0.12)] backdrop-blur-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF9690]">PregTap Profile</p>
              <h1 className="mt-2 text-3xl font-extrabold">Hồ sơ người dùng</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#757575]">
                Giữ hồ sơ luôn chính xác để các tính năng theo dõi và tư vấn hoạt động ổn định hơn.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/payment/history"
                className="rounded-full border-2 border-[#F9B5A7] px-5 py-2 text-sm font-semibold text-[#B5655C] transition-colors hover:bg-[#FFF0ED]"
              >
                Lịch sử thanh toán
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-[32px] bg-white p-8 shadow-[0_18px_60px_rgba(62,39,35,0.08)]">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-40 rounded-full bg-[#FFE1DE]" />
                <div className="h-24 rounded-4xl bg-[#FFF2F0]" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-14 rounded-2xl bg-[#FFF2F0]" />
                  <div className="h-14 rounded-2xl bg-[#FFF2F0]" />
                </div>
              </div>
            </div>
          ) : !user ? (
            <div className="rounded-[32px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(62,39,35,0.08)]">
              <h2 className="text-2xl font-bold">Bạn chưa đăng nhập</h2>
              <p className="mt-3 text-sm text-[#757575]">Hãy đăng nhập từ trang chủ để truy cập và cập nhật hồ sơ cá nhân.</p>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-sm font-semibold text-white shadow-md"
              >
                Quay về trang chủ
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
              {/* Left Aside: Avatar + Subscription */}
              <motion.aside
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Avatar Card */}
                <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_60px_rgba(62,39,35,0.08)]">
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="group relative">
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-[#FFE1DE] shadow-md">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt={profileName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#FF9690] to-[#FF7A74]">
                            <span className="text-2xl font-extrabold text-white">{profileName.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      {/* Camera overlay on hover */}
                      <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </label>
                    </div>

                    <h2 className="mt-4 text-xl font-extrabold">{profileName}</h2>
                    <p className="mt-0.5 text-sm text-[#757575]">{user.email}</p>

                    {avatarFile && (
                      <p className="mt-2 text-xs text-[#FF9690]">Đã chọn: {avatarFile.name}</p>
                    )}
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="rounded-[28px] bg-white p-5 shadow-[0_18px_60px_rgba(62,39,35,0.08)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0ED]">
                      <svg className="w-5 h-5 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#999]">Gói Premium</div>
                      <div className="text-sm font-bold text-[#3E2723]">
                        {subscriptionStatus?.isPremium ? getPlanLabel(subscriptionStatus.plan) : 'Chưa kích hoạt'}
                      </div>
                    </div>
                  </div>

                  {subscriptionStatus?.isPremium ? (
                    <div className="space-y-1.5 text-sm text-[#757575]">
                      <div className="flex justify-between">
                        <span>Hết hạn</span>
                        <span className="font-semibold text-[#3E2723]">{formatDateVi(subscriptionStatus.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Còn lại</span>
                        <span className="font-semibold text-[#3E2723]">{subscriptionStatus.daysRemaining} ngày</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-[#757575]">Kích hoạt Premium để mở khóa tất cả tính năng.</p>
                      <Link
                        href="/app/subscription"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                      >
                        Kích hoạt Premium
                      </Link>
                    </div>
                  )}
                </div>
              </motion.aside>

              {/* Right: Profile Form */}
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-[28px] bg-white p-6 shadow-[0_18px_60px_rgba(62,39,35,0.08)]"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-extrabold">Thông tin cá nhân</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold">Họ và tên</span>
                      <input
                        value={form.fullName}
                        onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FFDED8] bg-[#FFF8F7] px-4 py-3 text-sm outline-none transition focus:border-[#FF9690] focus:bg-white"
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold">
                        Email
                        {user.isEmailVerified && (
                          <span className="ml-2 text-xs font-normal text-[#22C55E]">✓ Đã xác thực</span>
                        )}
                      </span>
                      <input
                        value={user.email ?? ''}
                        disabled
                        className="w-full cursor-not-allowed rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#94A3B8] outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold">
                        Số điện thoại
                        {user.isPhoneVerified && (
                          <span className="ml-2 text-xs font-normal text-[#22C55E]">✓ Đã xác thực</span>
                        )}
                      </span>
                      {user.isPhoneVerified ? (
                        <input
                          value={user.phone ?? ''}
                          disabled
                          className="w-full cursor-not-allowed rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#94A3B8] outline-none"
                        />
                      ) : (
                        <input
                          value={form.phone}
                          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                          className="w-full rounded-2xl border border-[#FFDED8] bg-[#FFF8F7] px-4 py-3 text-sm outline-none transition focus:border-[#FF9690] focus:bg-white"
                          placeholder="Nhập số điện thoại"
                        />
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold">Ngày sinh</span>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FFDED8] bg-[#FFF8F7] px-4 py-3 text-sm outline-none transition focus:border-[#FF9690] focus:bg-white"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-semibold">Ngôn ngữ ưu tiên</span>
                      <select
                        value={form.preferredLanguage}
                        onChange={(event) => setForm((current) => ({ ...current, preferredLanguage: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FFDED8] bg-[#FFF8F7] px-4 py-3 text-sm outline-none transition focus:border-[#FF9690] focus:bg-white"
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </label>
                  </div>

                  {feedback && (
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        feedback.type === 'success'
                          ? 'bg-[#E7F7EF] text-[#1F7A4D]'
                          : 'bg-[#FFF1F1] text-[#C44545]'
                      }`}
                    >
                      {feedback.message}
                    </div>
                  )}

                  <div className="flex justify-end border-t border-[#F5E1DE] pt-5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                          </svg>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
