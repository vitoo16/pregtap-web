import { proxyPostMultipart } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function POST(request: Request) {
  const accessToken = getBearerToken(request);
  const formData = await request.formData();
  return proxyPostMultipart('/chat/send', accessToken, formData);
}
