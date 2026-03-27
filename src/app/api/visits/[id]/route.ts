import { proxyGet, proxyPut, proxyDelete } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id } = await params;
  return proxyGet(`/visits/${id}`, accessToken);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = getBearerToken(request);
  const { id } = await params;
  const body = await request.json();
  return proxyPut(`/visits/${id}`, accessToken, body);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id } = await params;
  return proxyDelete(`/visits/${id}`, accessToken);
}
