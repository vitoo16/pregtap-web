import { proxySubscriptionVerify } from '@/lib/subscription-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  const { searchParams } = new URL(request.url);
  return proxySubscriptionVerify(accessToken, searchParams.get('orderCode'));
}
