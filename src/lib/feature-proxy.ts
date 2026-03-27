import 'server-only';

import { NextResponse } from 'next/server';

import { AUTH_API_BASE_URL, type ApiResponse } from '@/lib/auth';

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

function createUnauthorizedResponse(message = 'Bạn cần đăng nhập để thực hiện thao tác này.') {
  return NextResponse.json(
    {
      success: false,
      message,
      statusCode: 401,
      errors: [message],
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

export async function proxyGet<T>(path: string, accessToken: string | undefined) {
  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  try {
    const upstream = await fetch(buildApiUrl(path), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<T> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể kết nối tới dịch vụ.');
  }
}

export async function proxyPost<T>(path: string, accessToken: string | undefined, body: unknown) {
  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  try {
    const upstream = await fetch(buildApiUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<T> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể kết nối tới dịch vụ.');
  }
}

export async function proxyPut<T>(path: string, accessToken: string | undefined, body: unknown) {
  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  try {
    const upstream = await fetch(buildApiUrl(path), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<T> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể kết nối tới dịch vụ.');
  }
}

export async function proxyDelete<T>(path: string, accessToken: string | undefined) {
  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  try {
    const upstream = await fetch(buildApiUrl(path), {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<T> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể kết nối tới dịch vụ.');
  }
}

export async function proxyPostMultipart<T>(path: string, accessToken: string | undefined, formData: FormData) {
  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  try {
    const upstream = await fetch(buildApiUrl(path), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<T> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể kết nối tới dịch vụ.');
  }
}

export async function proxyGetMultipart<T>(path: string, accessToken: string | undefined) {
  if (!accessToken) {
    return createUnauthorizedResponse();
  }

  try {
    const upstream = await fetch(buildApiUrl(path), {
      method: 'GET',
      headers: {
        Accept: 'multipart/form-data',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<T> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể kết nối tới dịch vụ.');
  }
}
