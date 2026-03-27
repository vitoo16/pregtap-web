import { proxySubscriptionStatus } from '@/lib/subscription-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  return proxySubscriptionStatus(accessToken);
}
