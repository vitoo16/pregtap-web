import { proxyPost } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id } = await params;
  return proxyPost(`/documents/${id}/ocr/process`, accessToken, {});
}
