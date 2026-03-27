import { proxyGet, proxyPost } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  return proxyGet('/weight-logs', accessToken);
}

export async function POST(request: Request) {
  const accessToken = getBearerToken(request);
  const body = await request.json();
  return proxyPost('/weight-logs', accessToken, body);
}
