import { ACCESS_COOKIE_NAME } from '@/lib/auth';
import { format, parseISO, subYears, addDays } from 'date-fns';

// ─── Date Validation ──────────────────────────────────────────────────────────

/** Format date as yyyy-MM-dd for <input type="date"> value */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') {
    try { return format(parseISO(date), 'yyyy-MM-dd'); } catch { return ''; }
  }
  return format(date, 'yyyy-MM-dd');
}

/** Today's date as yyyy-MM-dd */
export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** Min date for date-of-birth: 10 years ago */
export function dateOfBirthMin(): string {
  return format(subYears(new Date(), 100), 'yyyy-MM-dd');
}

/** Max date for date-of-birth: today */
export function dateOfBirthMax(): string {
  return todayStr();
}

/** Min date for last period (LMP): 300 days ago (≈ 42 weeks) */
export function lastPeriodMin(): string {
  return format(subYears(new Date(), 1), 'yyyy-MM-dd');
}

/** Max date for last period: today */
export function lastPeriodMax(): string {
  return todayStr();
}

/** Min date for due date (EDD): today */
export function dueDateMin(): string {
  return todayStr();
}

/** Max date for due date: today + 300 days */
export function dueDateMax(): string {
  return format(addDays(new Date(), 300), 'yyyy-MM-dd');
}

/** Max date for past event dates (visit, document, weight log): today */
export function pastDateMax(): string {
  return todayStr();
}

/** Validate date-of-birth is reasonable (between 10-100 years ago) */
export function validateDateOfBirth(value: string): string | null {
  if (!value) return null;
  const date = parseISO(value);
  const now = new Date();
  const minDate = subYears(now, 100);
  const maxDate = now;
  if (date < minDate || date > maxDate) {
    return 'Ngày sinh không hợp lệ';
  }
  return null;
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

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
