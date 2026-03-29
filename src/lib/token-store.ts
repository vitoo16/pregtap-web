// Token store matching MO's TokenManager (localStorage instead of SecureStorage for web)

import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/lib/auth';

const ACCESS_TOKEN_KEY = 'pregtap_access_token';
const REFRESH_TOKEN_KEY = 'pregtap_refresh_token';

const COOKIE_PATH = 'path=/';
const COOKIE_SAMESITE = 'SameSite=Lax';
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function setCookie(name: string, value: string, maxAgeSeconds?: number): void {
  if (typeof document === 'undefined') return;

  const encodedValue = encodeURIComponent(value);
  const maxAge = typeof maxAgeSeconds === 'number' ? `; Max-Age=${maxAgeSeconds}` : '';
  document.cookie = `${name}=${encodedValue}; ${COOKIE_PATH}; ${COOKIE_SAMESITE}${maxAge}`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; ${COOKIE_PATH}; ${COOKIE_SAMESITE}; Max-Age=0`;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  // Keep a non-HttpOnly copy in cookies so Next route handlers can forward auth.
  if (token) {
    setCookie(ACCESS_COOKIE_NAME, token, ACCESS_TOKEN_MAX_AGE);
  }
  return token;
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  setCookie(ACCESS_COOKIE_NAME, token, ACCESS_TOKEN_MAX_AGE);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
  setCookie(REFRESH_COOKIE_NAME, token, REFRESH_TOKEN_MAX_AGE);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearCookie(ACCESS_COOKIE_NAME);
  clearCookie(REFRESH_COOKIE_NAME);
}
