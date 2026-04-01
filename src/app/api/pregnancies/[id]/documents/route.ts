import { proxyGet, proxyPostMultipart } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id } = await params;
  return proxyGet(`/pregnancies/${id}/documents`, accessToken);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(request);
  const { id } = await params;
  const formData = await request.formData();
  return proxyPostMultipart(`/pregnancies/${id}/documents`, accessToken, formData);
}
