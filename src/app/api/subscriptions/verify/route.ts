import { cookies } from 'next/headers';

import { ACCESS_COOKIE_NAME } from '@/lib/auth';
import { proxySubscriptionVerify } from '@/lib/subscription-proxy';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const { searchParams } = new URL(request.url);

  return proxySubscriptionVerify(accessToken, searchParams.get('orderCode'));
}