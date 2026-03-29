import { ACCESS_COOKIE_NAME } from '@/lib/auth';

function getCookieValue(cookieHeader: string, name: string): string | undefined {
  const pairs = cookieHeader.split(';');

  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const cookieName = trimmed.slice(0, separatorIndex).trim();
    if (cookieName !== name) {
      continue;
    }

    const cookieValue = trimmed.slice(separatorIndex + 1);
    try {
      return decodeURIComponent(cookieValue);
    } catch {
      return cookieValue;
    }
  }

  return undefined;
}

// Parse token from Authorization: Bearer <token> header, then fallback to auth cookie.
export function getBearerToken(request: Request): string | undefined {
  const auth = request.headers.get('Authorization') ?? '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  return getCookieValue(cookieHeader, ACCESS_COOKIE_NAME);
}
