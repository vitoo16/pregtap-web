import type { Metadata } from 'next';

import PaymentHistoryPage from '@/components/payment-history-page';

export const metadata: Metadata = {
  title: 'Lịch sử thanh toán | PregTap',
  description: 'Xem lại danh sách các giao dịch Premium đã tạo trên PregTap.',
};

export default function PaymentHistoryRoute() {
  return <PaymentHistoryPage />;
}