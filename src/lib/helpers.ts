// Parse Authorization: Bearer <token> header
export function getBearerToken(request: Request): string | undefined {
  const auth = request.headers.get('Authorization') ?? '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return undefined;
}
