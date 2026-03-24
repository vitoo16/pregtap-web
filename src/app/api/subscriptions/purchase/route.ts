import { cookies } from 'next/headers';

import { ACCESS_COOKIE_NAME } from '@/lib/auth';
import { proxySubscriptionPurchase } from '@/lib/subscription-proxy';
import { type PurchaseSubscriptionRequest } from '@/lib/subscription';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const body = (await request.json()) as PurchaseSubscriptionRequest;

  return proxySubscriptionPurchase(accessToken, body);
}