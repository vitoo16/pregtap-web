import 'server-only';

import { NextResponse } from 'next/server';

import {
  ACCESS_COOKIE_NAME,
  AUTH_API_BASE_URL,
  REFRESH_COOKIE_NAME,
  type ApiResponse,
  type AuthResponse,
  type AuthUser,
} from '@/lib/auth';

type JsonObject = Record<string, unknown>;

function buildApiUrl(path: string) {
  return `${AUTH_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseUpstreamBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json') || contentType.includes('text/json')) {
    return response.json();
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as JsonObject;
  } catch {
    return {
      success: response.ok,
      message: text,
      statusCode: response.status,
      timestamp: new Date().toISOString(),
    };
  }
}

function createProxyErrorResponse(message: string, status = 502) {
  return NextResponse.json(
    {
      success: false,
      message,
      statusCode: status,
      errors: [message],
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

function isAuthResponsePayload(payload: unknown): payload is ApiResponse<AuthResponse> {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as ApiResponse<AuthResponse>;
  return Boolean(candidate.success && candidate.data?.user);
}

function applyAuthCookies(response: NextResponse, payload: ApiResponse<AuthResponse>) {
  if (!isAuthResponsePayload(payload)) {
    return response;
  }

  const authData = payload.data;

  if (!authData) {
    return response;
  }

  const maxAge = authData.expiresIn > 0 ? authData.expiresIn : 60 * 60;

  if (authData.accessToken) {
    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: authData.accessToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    });
  }

  if (authData.refreshToken) {
    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: authData.refreshToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function proxyAuthMutation(path: string, body: unknown) {
  try {
    const upstream = await fetch(buildApiUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = await parseUpstreamBody(upstream);
    const response = NextResponse.json(payload, { status: upstream.status });

    if (isAuthResponsePayload(payload)) {
      applyAuthCookies(response, payload);
    }

    return response;
  } catch {
    return createProxyErrorResponse('Không thể kết nối tới dịch vụ xác thực.');
  }
}

export async function proxyCurrentUser(accessToken?: string) {
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Bạn chưa đăng nhập.',
        statusCode: 401,
        errors: ['Bạn chưa đăng nhập.'],
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(buildApiUrl('/Auth/me'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<AuthUser> | JsonObject | null;
    const response = NextResponse.json(payload, { status: upstream.status });

    if (upstream.status === 401) {
      clearAuthCookies(response);
    }

    return response;
  } catch {
    return createProxyErrorResponse('Không thể tải thông tin người dùng.');
  }
}

export async function proxyProfileUpdate(accessToken: string | undefined, formData: FormData) {
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Bạn chưa đăng nhập.',
        statusCode: 401,
        errors: ['Bạn chưa đăng nhập.'],
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(buildApiUrl('/Auth/profile'), {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<AuthUser> | JsonObject | null;
    const response = NextResponse.json(payload, { status: upstream.status });

    if (upstream.status === 401) {
      clearAuthCookies(response);
    }

    return response;
  } catch {
    return createProxyErrorResponse('Không thể cập nhật hồ sơ người dùng.');
  }
}