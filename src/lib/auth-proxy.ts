import 'server-only';

import { NextResponse } from 'next/server';

import {
  AUTH_API_BASE_URL,
  type ApiResponse,
  type AuthResponse,
  type AuthUser,
} from '@/lib/auth';

type JsonObject = Record<string, unknown>;

function buildApiUrl(path: string) {
  if (!AUTH_API_BASE_URL) {
    throw new Error(`AUTH_API_BASE_URL is empty. env=${process.env?.AUTH_API_BASE_URL}`);
  }
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

    // Return tokens in body so client can store them in localStorage (Bearer auth)
    const authData = (payload as ApiResponse<AuthResponse>)?.data;
    if (authData?.accessToken) {
      // Attach tokens to response body for client localStorage storage
      const enriched = {
        ...payload,
        _tokens: {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresIn: authData.expiresIn,
        },
      };
      return NextResponse.json(enriched, { status: upstream.status });
    }

    return NextResponse.json(payload, { status: upstream.status });
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
    return NextResponse.json(payload, { status: upstream.status });
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
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể cập nhật hồ sơ người dùng.');
  }
}

export async function proxyChangePassword(accessToken: string | undefined, body: unknown) {
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
    const upstream = await fetch(buildApiUrl('/Auth/change-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = await parseUpstreamBody(upstream);
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể đổi mật khẩu.');
  }
}
