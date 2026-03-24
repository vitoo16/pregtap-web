import { NextResponse } from 'next/server';

import { clearAuthCookies } from '@/lib/auth-proxy';

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: 'Đăng xuất thành công.',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );

  return clearAuthCookies(response);
}