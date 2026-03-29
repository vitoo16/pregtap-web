import { proxyChangePassword } from '@/lib/auth-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function POST(request: Request) {
  const accessToken = getBearerToken(request);
  const body = await request.json();
  return proxyChangePassword(accessToken, body);
}
