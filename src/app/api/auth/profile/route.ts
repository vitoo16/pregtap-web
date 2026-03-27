import { proxyProfileUpdate } from '@/lib/auth-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function PUT(request: Request) {
  const accessToken = getBearerToken(request);
  const formData = await request.formData();
  return proxyProfileUpdate(accessToken, formData);
}
