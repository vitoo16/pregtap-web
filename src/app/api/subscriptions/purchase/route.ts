import { proxySubscriptionPurchase } from '@/lib/subscription-proxy';
import { getBearerToken } from '@/lib/helpers';
import { type PurchaseSubscriptionRequest } from '@/lib/subscription';

export async function POST(request: Request) {
  const accessToken = getBearerToken(request);
  const body = (await request.json()) as PurchaseSubscriptionRequest;
  return proxySubscriptionPurchase(accessToken, body);
}
