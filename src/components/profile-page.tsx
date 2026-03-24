'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { type ApiResponse, type AuthUser, type ProfileFormValues } from '@/lib/auth';

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

function buildProfileSubtitle(user: AuthUser | null) {
  if (!user) {
    return 'Cập nhật thông tin cá nhân, số điện thoại và ngôn ngữ sử dụng để trải nghiệm được cá nhân hóa hơn.';
  }

  return user.email ?? 'Tài khoản PregTap';
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<ProfileFormValues>(initialFormValues);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/auth/me', {
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

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        body: payload,
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
              <p className="mt-2 max-w-2xl text-sm text-[#757575]">{buildProfileSubtitle(user)}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border-2 border-[#FF9690] px-5 py-2 text-sm font-semibold text-[#FF9690] transition-colors hover:bg-[#FF9690]/10"
              >
                Về trang chủ
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-[32px] bg-white p-8 shadow-[0_18px_60px_rgba(62,39,35,0.08)]">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-40 rounded-full bg-[#FFE1DE]" />
                <div className="h-24 rounded-3xl bg-[#FFF2F0]" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-14 rounded-2xl bg-[#FFF2F0]" />
                  <div className="h-14 rounded-2xl bg-[#FFF2F0]" />
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
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <motion.aside
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[32px] bg-white p-6 shadow-[0_18px_60px_rgba(62,39,35,0.08)]"
              >
                <div className="bg-linear-to-br from-[#FFEBEE] via-white to-[#FFF3E0] rounded-[28px] p-5 text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#FFD9D5] shadow-md">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={profileName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-extrabold text-[#FF7A74]">{profileName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <h2 className="mt-4 text-2xl font-extrabold">{profileName}</h2>
                  <p className="mt-1 text-sm text-[#757575]">{user.email}</p>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#999]">Email</div>
                      <div className="mt-1 text-sm font-semibold text-[#3E2723]">{user.isEmailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[#999]">SĐT</div>
                      <div className="mt-1 text-sm font-semibold text-[#3E2723]">{user.isPhoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}</div>
                    </div>
                  </div>
                </div>
              </motion.aside>

              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-[32px] bg-white p-6 shadow-[0_18px_60px_rgba(62,39,35,0.08)]"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-extrabold">Thông tin cá nhân</h3>
                  <p className="mt-2 text-sm text-[#757575]">Giữ hồ sơ luôn chính xác để các tính năng theo dõi và tư vấn hoạt động ổn định hơn.</p>
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
                      <span className="mb-2 block text-sm font-semibold">Email</span>
                      <input
                        value={user.email ?? ''}
                        disabled
                        className="w-full cursor-not-allowed rounded-2xl border border-[#F2E2E0] bg-[#FAF5F4] px-4 py-3 text-sm text-[#999] outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold">Số điện thoại</span>
                      <input
                        value={form.phone}
                        onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FFDED8] bg-[#FFF8F7] px-4 py-3 text-sm outline-none transition focus:border-[#FF9690] focus:bg-white"
                        placeholder="Nhập số điện thoại"
                      />
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

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-semibold">Ảnh đại diện</span>
                      <div className="rounded-[24px] border border-dashed border-[#FFB5B0] bg-linear-to-r from-[#FFF5F4] to-[#FFF9F0] p-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
                          className="block w-full text-sm text-[#757575] file:mr-4 file:rounded-full file:border-0 file:bg-[#FF9690] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                        />
                        <p className="mt-3 text-xs text-[#999]">Chấp nhận file ảnh để cập nhật avatar cho tài khoản.</p>
                      </div>
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

                  <div className="flex flex-col gap-3 border-t border-[#F5E1DE] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#757575]">Thông tin được đồng bộ với tài khoản đang đăng nhập.</p>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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