import { proxyGet, proxyPostMultipart } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  return proxyGet('/documents', accessToken);
}

export async function POST(request: Request) {
  const accessToken = getBearerToken(request);
  const formData = await request.formData();
  return proxyPostMultipart('/documents', accessToken, formData);
}
