import { cookies } from 'next/headers';

import { proxyCurrentUser } from '@/lib/auth-proxy';
import { ACCESS_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  return proxyCurrentUser(accessToken);
}