export type SubscriptionPlanCode = 'Monthly' | 'SixMonths' | 'Yearly';

export type SubscriptionPlan = {
  plan: SubscriptionPlanCode;
  name: string;
  price: number;
  durationMonths: number;
  pricePerMonth: number;
  savePercent?: number | null;
};

export type PurchaseSubscriptionRequest = {
  plan: SubscriptionPlanCode;
};

export type PurchaseSubscriptionResponse = {
  subscriptionId: string;
  orderCode: number;
  checkoutUrl: string;
};

export type SubscriptionVerifyResponse = {
  isPremium: boolean;
  plan: SubscriptionPlanCode;
  startDate: string;
  endDate: string;
  daysRemaining: number;
};

export type SubscriptionStatus = {
  isPremium: boolean;
  plan: SubscriptionPlanCode | null;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number | null;
  status: string | null;
};

export type SubscriptionHistoryItem = {
  id: string;
  orderCode: string | null;
  plan: SubscriptionPlanCode | null;
  amount: number | null;
  status: string | null;
  createdAt: string | null;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number | null;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  return value as UnknownRecord;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }

    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return null;
}

export function parseApiDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const hasTimezone = /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value);
  const normalized = hasTimezone ? value : `${value}Z`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function normalizePlanCode(value: unknown): SubscriptionPlanCode | null {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (!normalized) {
    return null;
  }

  if (normalized === 'monthly' || normalized === '1month' || normalized === 'month') {
    return 'Monthly';
  }

  if (normalized === 'sixmonths' || normalized === '6months' || normalized === 'six_months') {
    return 'SixMonths';
  }

  if (normalized === 'yearly' || normalized === '1year' || normalized === 'annual' || normalized === 'year') {
    return 'Yearly';
  }

  return null;
}

export function getPlanLabel(plan: SubscriptionPlanCode | null) {
  if (plan === 'Monthly') {
    return 'Gói 1 Tháng';
  }

  if (plan === 'SixMonths') {
    return 'Gói 6 Tháng';
  }

  if (plan === 'Yearly') {
    return 'Gói 1 Năm';
  }

  return 'Chưa có gói active';
}

export function formatDateVi(value: string | null | undefined) {
  const date = parseApiDate(value);

  if (!date) {
    return 'Chưa có dữ liệu';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatCurrencyVnd(value: number | null | undefined) {
  if (value == null) {
    return 'Chưa có dữ liệu';
  }

  return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
}

export function extractSubscriptionStatus(value: unknown): SubscriptionStatus | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const plan = normalizePlanCode(
    record.plan ?? record.planCode ?? record.currentPlan ?? record.subscriptionPlan ?? record.packageType
  );
  const startDate = readString(record.startDate ?? record.activatedAt ?? record.currentPeriodStart ?? record.createdAt);
  const endDate = readString(record.endDate ?? record.expiresAt ?? record.expiryDate ?? record.currentPeriodEnd);
  const daysRemaining = readNumber(record.daysRemaining ?? record.remainingDays ?? record.daysLeft);
  const status = readString(record.status ?? record.subscriptionStatus ?? record.paymentStatus);
  const explicitIsPremium = readBoolean(record.isPremium ?? record.active ?? record.isActive);
  const inferredIsPremium = explicitIsPremium ?? Boolean(plan || (daysRemaining != null && daysRemaining > 0) || status?.toLowerCase() === 'active');

  return {
    isPremium: inferredIsPremium,
    plan,
    startDate,
    endDate,
    daysRemaining,
    status,
  };
}

export function extractSubscriptionHistory(value: unknown): SubscriptionHistoryItem[] {
  const record = asRecord(value);
  const source = Array.isArray(value)
    ? value
    : Array.isArray(record?.items)
      ? record.items
      : Array.isArray(record?.results)
        ? record.results
        : Array.isArray(record?.subscriptions)
          ? record.subscriptions
          : Array.isArray(record?.history)
            ? record.history
            : [];

  return source.flatMap((entry, index) => {
    const item = asRecord(entry);

    if (!item) {
      return [];
    }

    return [
      {
        id:
          readString(item.id ?? item.subscriptionId ?? item.paymentLinkId ?? item.orderId) ??
          `subscription-history-${index}`,
        orderCode: readString(item.orderCode) ?? (readNumber(item.orderCode)?.toString() ?? null),
        plan: normalizePlanCode(item.plan ?? item.planCode ?? item.subscriptionPlan ?? item.packageType),
        amount: readNumber(item.amount ?? item.price ?? item.totalAmount),
        status: readString(item.status ?? item.paymentStatus ?? item.subscriptionStatus),
        createdAt: readString(item.createdAt ?? item.purchasedAt ?? item.orderDate ?? item.transactionDateTime),
        startDate: readString(item.startDate ?? item.activatedAt),
        endDate: readString(item.endDate ?? item.expiresAt ?? item.expiryDate),
        daysRemaining: readNumber(item.daysRemaining ?? item.remainingDays ?? item.daysLeft),
      },
    ];
  });
}