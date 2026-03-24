import { cookies } from 'next/headers';

import { ACCESS_COOKIE_NAME } from '@/lib/auth';
import { proxySubscriptionStatus } from '@/lib/subscription-proxy';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  return proxySubscriptionStatus(accessToken);
}