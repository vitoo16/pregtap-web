import { proxyGet } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  const { searchParams } = new URL(request.url);

  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '20';
  const search = searchParams.get('search') ?? '';

  const query = new URLSearchParams();
  query.set('Page', page);
  query.set('PageSize', pageSize);
  if (search.trim()) {
    query.set('Search', search.trim());
  }

  return proxyGet(`/users?${query.toString()}`, accessToken);
}
