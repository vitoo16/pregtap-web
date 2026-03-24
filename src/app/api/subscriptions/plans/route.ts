import { proxySubscriptionPlans } from '@/lib/subscription-proxy';

export async function GET() {
  return proxySubscriptionPlans();
}