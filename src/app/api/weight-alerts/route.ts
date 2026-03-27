import { proxyGet } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  return proxyGet('/weight-alerts', accessToken);
}
