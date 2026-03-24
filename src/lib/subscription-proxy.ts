import 'server-only';

import { NextResponse } from 'next/server';

import { AUTH_API_BASE_URL, type ApiResponse } from '@/lib/auth';
import {
  type PurchaseSubscriptionRequest,
  type PurchaseSubscriptionResponse,
  type SubscriptionHistoryItem,
  type SubscriptionPlan,
  type SubscriptionStatus,
  type SubscriptionVerifyResponse,
} from '@/lib/subscription';

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

export async function proxySubscriptionPlans() {
  try {
    const upstream = await fetch(buildApiUrl('/subscriptions/plans'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<SubscriptionPlan[]> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể tải danh sách gói cước.');
  }
}

export async function proxySubscriptionPurchase(accessToken: string | undefined, body: PurchaseSubscriptionRequest) {
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Bạn cần đăng nhập để mua gói Premium.',
        statusCode: 401,
        errors: ['Bạn cần đăng nhập để mua gói Premium.'],
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(buildApiUrl('/subscriptions/purchase'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<PurchaseSubscriptionResponse> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể khởi tạo giao dịch PayOS.');
  }
}

export async function proxySubscriptionVerify(accessToken: string | undefined, orderCode: string | null) {
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Bạn cần đăng nhập để kiểm tra giao dịch.',
        statusCode: 401,
        errors: ['Bạn cần đăng nhập để kiểm tra giao dịch.'],
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  if (!orderCode) {
    return NextResponse.json(
      {
        success: false,
        message: 'Thiếu orderCode để xác thực giao dịch.',
        statusCode: 400,
        errors: ['Thiếu orderCode để xác thực giao dịch.'],
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(buildApiUrl(`/subscriptions/verify?orderCode=${encodeURIComponent(orderCode)}`), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<SubscriptionVerifyResponse> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể xác thực giao dịch PayOS.');
  }
}

export async function proxySubscriptionStatus(accessToken: string | undefined) {
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Bạn cần đăng nhập để xem gói hiện tại.',
        statusCode: 401,
        errors: ['Bạn cần đăng nhập để xem gói hiện tại.'],
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(buildApiUrl('/subscriptions/status'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<SubscriptionStatus> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể tải trạng thái gói Premium hiện tại.');
  }
}

export async function proxySubscriptionHistory(accessToken: string | undefined) {
  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'Bạn cần đăng nhập để xem lịch sử thanh toán.',
        statusCode: 401,
        errors: ['Bạn cần đăng nhập để xem lịch sử thanh toán.'],
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(buildApiUrl('/subscriptions/history'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = (await parseUpstreamBody(upstream)) as ApiResponse<SubscriptionHistoryItem[]> | JsonObject | null;
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return createProxyErrorResponse('Không thể tải lịch sử thanh toán.');
  }
}