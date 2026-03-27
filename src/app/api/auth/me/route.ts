import { proxyCurrentUser } from '@/lib/auth-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  return proxyCurrentUser(accessToken);
}
