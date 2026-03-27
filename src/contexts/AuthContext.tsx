'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { type ApiResponse, type AuthUser, type LoginRequest, type RegisterRequest, type ProfileFormValues } from '@/lib/auth';
import { getAccessToken, setAccessToken, setRefreshToken, clearTokens } from '@/lib/token-store';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (formData: ProfileFormValues) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        credentials: 'include',
      });
      const payload = (await response.json()) as ApiResponse<AuthUser>;
      setUser(payload.success && payload.data ? payload.data : null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const body: LoginRequest = { emailOrPhone: email, password };
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const payload = (await response.json()) as ApiResponse<unknown> & { _tokens?: { accessToken: string; refreshToken: string } };

    if (!response.ok || !payload.success) {
      const message = payload.errors?.length ? payload.errors.join(' ') : (payload.message ?? 'Đăng nhập thất bại.');
      throw new Error(message);
    }

    // Store tokens in localStorage (Bearer auth — matching MO's TokenManager)
    if (payload._tokens) {
      setAccessToken(payload._tokens.accessToken);
      setRefreshToken(payload._tokens.refreshToken ?? '');
    }

    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const payload = (await response.json()) as ApiResponse<unknown> & { _tokens?: { accessToken: string; refreshToken: string } };

    if (!response.ok || !payload.success) {
      const message = payload.errors?.length ? payload.errors.join(' ') : (payload.message ?? 'Đăng ký thất bại.');
      throw new Error(message);
    }

    if (payload._tokens) {
      setAccessToken(payload._tokens.accessToken);
      setRefreshToken(payload._tokens.refreshToken ?? '');
    }

    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    const token = getAccessToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
      } catch {
        // ignore
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (formData: ProfileFormValues) => {
    const token = getAccessToken();
    if (!token) throw new Error('Bạn chưa đăng nhập.');

    const body = new FormData();
    body.append('fullName', formData.fullName);
    body.append('phone', formData.phone);
    body.append('preferredLanguage', formData.preferredLanguage);
    body.append('dateOfBirth', formData.dateOfBirth);

    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body,
      credentials: 'include',
    });

    const payload = (await response.json()) as ApiResponse<AuthUser>;

    if (!response.ok || !payload.success) {
      const message = payload.errors?.length ? payload.errors.join(' ') : (payload.message ?? 'Cập nhật hồ sơ thất bại.');
      throw new Error(message);
    }

    if (payload.data) {
      setUser(payload.data);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
