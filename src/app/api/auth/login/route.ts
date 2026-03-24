import { proxyAuthMutation } from '@/lib/auth-proxy';

export async function POST(request: Request) {
  const body = await request.json();

  return proxyAuthMutation('/Auth/login', body);
}