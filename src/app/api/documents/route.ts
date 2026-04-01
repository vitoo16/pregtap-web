import { proxyGet, proxyPostMultipart } from '@/lib/feature-proxy';
import { getBearerToken } from '@/lib/helpers';

export async function GET(request: Request) {
  const accessToken = getBearerToken(request);
  const { searchParams } = new URL(request.url);
  const pregnancyId = searchParams.get('pregnancyId');
  if (!pregnancyId) {
    return new Response(JSON.stringify({ success: false, message: 'pregnancyId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return proxyGet(`/pregnancies/${pregnancyId}/documents`, accessToken);
}

export async function POST(request: Request) {
  const accessToken = getBearerToken(request);
  const { searchParams } = new URL(request.url);
  const pregnancyId = searchParams.get('pregnancyId');
  if (!pregnancyId) {
    return new Response(JSON.stringify({ success: false, message: 'pregnancyId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const formData = await request.formData();
  return proxyPostMultipart(`/pregnancies/${pregnancyId}/documents`, accessToken, formData);
}
