import { cookies } from 'next/headers';

import { ACCESS_COOKIE_NAME } from '@/lib/auth';
import { proxyProfileUpdate } from '@/lib/auth-proxy';

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const formData = await request.formData();

  return proxyProfileUpdate(accessToken, formData);
}