import { proxyGet, proxyPost } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id } = await params;
  return proxyGet(`/ocr/${id}`, accessToken);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(request);
  const { id } = await params;
  return proxyPost(`/ocr/${id}`, accessToken, {});
}
