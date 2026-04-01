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

// Convert PascalCase key to camelCase (e.g., "VisitDate" → "visitDate")
function toCamelCase(key: string): string {
  if (!key) return key;
  return key.charAt(0).toLowerCase() + key.slice(1);
}

// Recursively convert all PascalCase keys to camelCase in BE responses
function convertKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(convertKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    // BE wraps list responses in { items: [...] } — unwrap it
    if ('items' in record && Array.isArray(record.items)) {
      return {
        ...record,
        items: convertKeys(record.items),
      };
    }
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) {
      result[toCamelCase(k)] = convertKeys(v);
    }
    return result;
  }
  return obj;
}

function normalizeResponse<T>(raw: unknown): ApiResponse<T> {
  const converted = convertKeys(raw) as Record<string, unknown>;

  // If it's already a proper ApiResponse (with camelCase "success"), return it
  if (
    converted !== null &&
    'success' in converted &&
    typeof converted.success === 'boolean'
  ) {
    // BE wraps list data in { items: [...] } — unwrap items to data
    if ('data' in converted && converted.data !== null && typeof converted.data === 'object') {
      const dataRecord = converted.data as Record<string, unknown>;
      if ('items' in dataRecord && Array.isArray(dataRecord.items)) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          data: dataRecord.items as T,
        };
      }
    }
    return converted as ApiResponse<T>;
  }
  // BE returns raw array/object — wrap it
  return {
    success: true,
    statusCode: 200,
    timestamp: new Date().toISOString(),
    data: converted as T,
  };
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

  const raw = await response.json();
  return normalizeResponse<T>(raw);
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
