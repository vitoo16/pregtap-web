'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/app/shared/Modal';
import { getAccessToken } from '@/lib/token-store';

const APP_VERSION = '1.0.0';

function SettingRow({
  icon,
  title,
  subtitle,
  onClick,
  href,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const content = (
    <>
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
          danger ? 'bg-red-50 text-red-500' : 'bg-[#FDEEEE] text-[#FF9690]'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-[#3E2723]'}`}>
          {title}
        </p>
        {subtitle && <p className="text-xs text-[#999]">{subtitle}</p>}
      </div>
      <svg className="h-4 w-4 flex-shrink-0 text-[#CCC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="card flex items-center gap-3 p-4 transition-all hover:shadow-md active:scale-[0.99]"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`card flex w-full items-center gap-3 p-4 text-left transition-all hover:shadow-md active:scale-[0.99] ${
        danger ? 'border border-red-100' : ''
      }`}
    >
      {content}
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.fullName?.trim() || user?.email?.trim() || user?.phone?.trim() || 'Người dùng';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await logout();
  }, [logout]);

  return (
    <div className="min-h-screen pb-8">
      {/* Page header with user profile */}
      <div className="app-page-header">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="page-title">Cài đặt</h1>
          <p className="page-subtitle">Quản lý tài khoản và ứng dụng</p>
        </motion.div>
      </div>

      {/* User profile card */}
      <div className="app-page-content">
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:max-w-xl">
          {/* Avatar */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-xl font-extrabold text-white shadow-sm">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-[#3E2723]">{displayName}</h2>
            {user?.email && (
              <p className="text-sm text-[#757575]">{user.email}</p>
            )}
            {user?.phone && !user?.email && (
              <p className="text-sm text-[#757575]">{user.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-page-content">
        {/* Two-column layout for desktop */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Account section */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#999]">
              Tài khoản
            </h2>
            <div className="flex flex-col gap-3">
              <SettingRow
                href="/profile"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
                title="Chỉnh sửa hồ sơ"
                subtitle="Cập nhật thông tin cá nhân"
              />

              <SettingRow
                href="/app/setup"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                }
                title="Chỉnh sửa thai kỳ"
                subtitle="Cập nhật thông tin thai kỳ"
              />

              <SettingRow
                onClick={() => setShowPasswordModal(true)}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                title="Đổi mật khẩu"
                subtitle="Thay đổi mật khẩu đăng nhập"
              />
            </div>
          </div>

          {/* App info section */}
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#999]">
              Ứng dụng
            </h2>
            <div className="flex flex-col gap-3">
              <SettingRow
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                }
                title="Phiên bản"
                subtitle={`PregTap v${APP_VERSION}`}
              />

              <SettingRow
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                }
                title="Giới thiệu"
                subtitle="Tìm hiểu thêm về PregTap"
              />

              <SettingRow
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
                title="Liên hệ hỗ trợ"
                subtitle="Gửi email cho đội ngũ hỗ trợ"
              />
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-8">
          <SettingRow
            danger
            onClick={() => setShowLogoutConfirm(true)}
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            }
            title="Đăng xuất"
            subtitle="Đăng xuất khỏi tài khoản"
          />
        </div>
      </div>

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-bold text-[#3E2723]">Đăng xuất</h3>
            <p className="mb-5 text-sm text-[#757575]">
              Bạn có chắc muốn đăng xuất khỏi tài khoản không?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-60"
              >
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Đổi mật khẩu"
        size="md"
      >
        <ChangePasswordForm onClose={() => setShowPasswordModal(false)} />
      </Modal>
    </div>
  );
}

// Inline change password form
function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!currentPassword) {
        setError('Vui lòng nhập mật khẩu hiện tại.');
        return;
      }
      if (newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
      }

      setIsLoading(true);
      try {
        const token = getAccessToken() ?? undefined;

        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ currentPassword, newPassword }),
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message ?? 'Đổi mật khẩu thất bại.');
        }

        setSuccess(true);
        setTimeout(onClose, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, onClose],
  );

  if (success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#3E2723]">Đổi mật khẩu thành công!</h3>
        <p className="mt-2 text-sm text-[#757575]">
          Mật khẩu của bạn đã được cập nhật.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
          Mật khẩu hiện tại
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Nhập mật khẩu hiện tại"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#999] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
          Mật khẩu mới
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Ít nhất 6 ký tự"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#999] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#3E2723]">
          Xác nhận mật khẩu mới
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#3E2723] placeholder:text-[#999] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white loading-spinner" />
              Đang xử lý...
            </>
          ) : (
            'Đổi mật khẩu'
          )}
        </button>
      </div>
    </form>
  );
}
