import type { SubscriptionPlan } from './subscription';

// Public display prices, sourced from the currently published Terms of Use.
// These values are NOT payment authority. Checkout remains unavailable while the backend is down.
export const PUBLIC_PRICING: readonly SubscriptionPlan[] = [
  { plan: 'Monthly', name: 'Gói 1 Tháng', price: 39000, durationMonths: 1, pricePerMonth: 39000 },
  { plan: 'SixMonths', name: 'Gói 6 Tháng', price: 199000, durationMonths: 6, pricePerMonth: Math.round(199000 / 6) },
  { plan: 'Yearly', name: 'Gói 1 Năm', price: 399000, durationMonths: 12, pricePerMonth: Math.round(399000 / 12) },
] as const;

export const PRICING_CHECKOUT_AVAILABLE = false;
