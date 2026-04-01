import { proxyPut, proxyDelete } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = getBearerToken(request);
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const pregnancyId = searchParams.get('pregnancyId');
  if (!pregnancyId) {
    return new Response(JSON.stringify({ success: false, message: 'pregnancyId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const body = await request.json();
  return proxyPut(`/pregnancies/${pregnancyId}/food-preferences/${id}`, accessToken, body);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessToken = getBearerToken(_request);
  const { id } = await params;
  const { searchParams } = new URL(_request.url);
  const pregnancyId = searchParams.get('pregnancyId');
  if (!pregnancyId) {
    return new Response(JSON.stringify({ success: false, message: 'pregnancyId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return proxyDelete(`/pregnancies/${pregnancyId}/food-preferences/${id}`, accessToken);
}
