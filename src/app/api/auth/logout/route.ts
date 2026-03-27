import { NextResponse } from 'next/server';

export async function POST() {
  // Tokens are cleared client-side in localStorage
  return NextResponse.json(
    {
      success: true,
      message: 'Đăng xuất thành công.',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
