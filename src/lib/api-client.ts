'use client';

import { type ApiResponse } from './auth';
import { getAccessToken, clearTokens } from './token-store';

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers ?? {}),
  };

  const url = method === 'GET' && options?.params ? buildUrl(path, options.params) : path;

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
    credentials: 'include',
  });

  // Handle 401 by clearing local token + redirect
  if (response.status === 401) {
    clearTokens();
    window.location.href = '/?auth=expired';
    throw new Error('Unauthorized');
  }

  const data = (await response.json()) as ApiResponse<T>;
  return data;
}

export const apiClient = {
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<ApiResponse<T>> {
    return request<T>('GET', path, undefined, { params });
  },

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return request<T>('POST', path, body);
  },

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return request<T>('PUT', path, body);
  },

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>('DELETE', path);
  },

  async patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return request<T>('PATCH', path, body);
  },
};
