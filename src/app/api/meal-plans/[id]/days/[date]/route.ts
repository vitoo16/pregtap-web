import { proxyGet } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id, date } = await params;
  return proxyGet(`/meal-plans/${id}/days/${date}`, accessToken);
}
