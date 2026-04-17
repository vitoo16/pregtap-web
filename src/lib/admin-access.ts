import { getAccessToken } from '@/lib/token-store';

type JwtPayload = {
  role?: string | string[];
  roles?: string[];
  email?: string;
  [key: string]: unknown;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(normalized);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function collectRoleClaims(payload: JwtPayload): string[] {
  const roleClaims: string[] = [];
  const roleField = payload.role;
  const rolesField = payload.roles;
  const claimTypeRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

  if (typeof roleField === 'string') {
    roleClaims.push(roleField);
  } else if (Array.isArray(roleField)) {
    roleClaims.push(...roleField.filter((item): item is string => typeof item === 'string'));
  }

  if (Array.isArray(rolesField)) {
    roleClaims.push(...rolesField.filter((item): item is string => typeof item === 'string'));
  }

  if (typeof claimTypeRole === 'string') {
    roleClaims.push(claimTypeRole);
  } else if (Array.isArray(claimTypeRole)) {
    roleClaims.push(...claimTypeRole.filter((item): item is string => typeof item === 'string'));
  }

  return roleClaims;
}

export function hasAdminAccess(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const roleClaims = collectRoleClaims(payload);
  return roleClaims.some((role) => role.trim().toUpperCase() === 'ADMIN');
}
