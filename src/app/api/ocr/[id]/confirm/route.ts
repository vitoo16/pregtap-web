import { proxyPost } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = getBearerToken(request);
  const { id } = await params;
  const body = await request.json();
  return proxyPost(`/ocr/${id}/confirm`, accessToken, body);
}
