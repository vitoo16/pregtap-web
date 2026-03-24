import type { Metadata } from 'next';

import PaymentResultPage from '@/components/payment-result-page';

export const metadata: Metadata = {
  title: 'Kết quả thanh toán | PregTap',
  description: 'Xác thực và hiển thị kết quả giao dịch Premium qua PayOS.',
};

export default async function PaymentResultRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const status = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0]
    : resolvedSearchParams.status;
  const orderCode = Array.isArray(resolvedSearchParams.orderCode)
    ? resolvedSearchParams.orderCode[0]
    : resolvedSearchParams.orderCode;

  return <PaymentResultPage status={status} orderCode={orderCode} />;
}