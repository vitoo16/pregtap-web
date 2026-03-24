const authApiBaseUrl = process.env.AUTH_API_BASE_URL;

if (!authApiBaseUrl) {
  throw new Error('Missing AUTH_API_BASE_URL environment variable.');
}

export const AUTH_API_BASE_URL = authApiBaseUrl.replace(/\/$/, '');

export const ACCESS_COOKIE_NAME = 'pregtap_access_token';
export const REFRESH_COOKIE_NAME = 'pregtap_refresh_token';

export type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  statusCode: number;
  errors?: string[] | null;
  timestamp: string;
  data?: T;
};

export type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  fullName?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  preferredLanguage?: string | null;
};

export type AuthResponse = {
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  expiresIn: number;
  user: AuthUser;
};

export type LoginRequest = {
  emailOrPhone: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  preferredLanguage: string;
};

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  preferredLanguage: string;
  dateOfBirth: string;
};