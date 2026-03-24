'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { type ApiResponse, type AuthResponse, type LoginRequest, type RegisterRequest } from '@/lib/auth';

type AuthMode = 'login' | 'register';

type AuthModalProps = {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (payload: AuthResponse, mode: AuthMode) => void;
};

const initialLoginForm: LoginRequest = {
  emailOrPhone: '',
  password: '',
};

const initialRegisterForm: RegisterRequest = {
  email: '',
  phone: '',
  password: '',
  fullName: '',
  preferredLanguage: 'vi',
};

function getApiMessage(payload: ApiResponse<AuthResponse> | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  if (payload.errors?.length) {
    return payload.errors.join(' ');
  }

  return payload.message ?? fallback;
}

export function AuthModal({ isOpen, mode, onClose, onModeChange, onSuccess }: AuthModalProps) {
  const [loginForm, setLoginForm] = useState<LoginRequest>(initialLoginForm);
  const [registerForm, setRegisterForm] = useState<RegisterRequest>(initialRegisterForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      setIsSubmitting(false);
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? loginForm : registerForm;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as ApiResponse<AuthResponse>;

      if (!response.ok || !payload.success || !payload.data) {
        setFeedback({
          type: 'error',
          message: getApiMessage(payload, mode === 'login' ? 'Đăng nhập thất bại.' : 'Đăng ký thất bại.'),
        });
        return;
      }

      onSuccess(payload.data, mode);

      if (mode === 'login') {
        setLoginForm(initialLoginForm);
      } else {
        setRegisterForm(initialRegisterForm);
      }

      window.setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Không thể kết nối tới máy chủ. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-[#3E2723]/35 px-4 py-8 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(62,39,35,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-linear-to-r from-[#FFEBEE] via-white to-[#FFF3E0] px-6 pt-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF9690]">PregTap Auth</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#3E2723]">
                    {mode === 'login' ? 'Chào mừng bạn quay lại' : 'Tạo tài khoản mới'}
                  </h2>
                  <p className="mt-2 text-sm text-[#757575]">
                    {mode === 'login'
                      ? 'Đăng nhập để tiếp tục hành trình chăm sóc thai kỳ.'
                      : 'Tạo tài khoản để bắt đầu sử dụng các tính năng của PregTap.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FF9690]/20 text-[#757575] transition-colors hover:bg-white"
                  aria-label="Đóng cửa sổ xác thực"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 rounded-full bg-white/80 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => onModeChange('login')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    mode === 'login' ? 'bg-[#FF9690] text-white shadow-sm' : 'text-[#757575]'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange('register')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    mode === 'register' ? 'bg-[#FF9690] text-white shadow-sm' : 'text-[#757575]'
                  }`}
                >
                  Đăng ký
                </button>
              </div>
            </div>

            <form className="space-y-4 px-6 py-6" onSubmit={handleSubmit}>
              {mode === 'login' ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#3E2723]">Email hoặc số điện thoại</span>
                    <input
                      value={loginForm.emailOrPhone}
                      onChange={(event) => setLoginForm((current) => ({ ...current, emailOrPhone: event.target.value }))}
                      className="w-full rounded-2xl border border-[#FF9690]/20 bg-[#FFF8F7] px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#FF9690] focus:bg-white"
                      placeholder="Nhập email hoặc số điện thoại"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#3E2723]">Mật khẩu</span>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                      className="w-full rounded-2xl border border-[#FF9690]/20 bg-[#FFF8F7] px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#FF9690] focus:bg-white"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#3E2723]">Họ và tên</span>
                    <input
                      value={registerForm.fullName}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                      className="w-full rounded-2xl border border-[#FF9690]/20 bg-[#FFF8F7] px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#FF9690] focus:bg-white"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#3E2723]">Email</span>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FF9690]/20 bg-[#FFF8F7] px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#FF9690] focus:bg-white"
                        placeholder="mebau@email.com"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#3E2723]">Số điện thoại</span>
                      <input
                        value={registerForm.phone}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FF9690]/20 bg-[#FFF8F7] px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#FF9690] focus:bg-white"
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#3E2723]">Mật khẩu</span>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FF9690]/20 bg-[#FFF8F7] px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#FF9690] focus:bg-white"
                        placeholder="Tạo mật khẩu"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#3E2723]">Ngôn ngữ ưu tiên</span>
                      <select
                        value={registerForm.preferredLanguage}
                        onChange={(event) => setRegisterForm((current) => ({ ...current, preferredLanguage: event.target.value }))}
                        className="w-full rounded-2xl border border-[#FF9690]/20 bg-[#FFF8F7] px-4 py-3 text-sm text-[#3E2723] outline-none transition focus:border-[#FF9690] focus:bg-white"
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

              {feedback?.type === 'error' && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    'bg-[#FFF1F1] text-[#C44545]'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              </button>

              <p className="text-center text-sm text-[#757575]">
                {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                <button
                  type="button"
                  onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                  className="font-semibold text-[#FF9690]"
                >
                  {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}