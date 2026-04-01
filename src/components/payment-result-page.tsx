'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { type ApiResponse } from '@/lib/auth';
import { getPlanLabel, type SubscriptionVerifyResponse } from '@/lib/subscription';
import { getAccessToken } from '@/lib/token-store';

export default function PaymentResultPage({
  status,
  orderCode,
}: {
  status?: string;
  orderCode?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<SubscriptionVerifyResponse | null>(null);
  const [message, setMessage] = useState<string>('Đang xác thực giao dịch của bạn...');

  const title = useMemo(() => {
    if (isLoading) {
      return 'Đang xác thực thanh toán';
    }

    if (result?.isPremium) {
      return 'Thanh toán thành công';
    }

    if (status === 'cancel') {
      return 'Bạn đã hủy thanh toán';
    }

    return 'Chưa xác nhận được giao dịch';
  }, [isLoading, result, status]);

  useEffect(() => {
    async function verifyPayment() {
      if (!orderCode) {
        setMessage('Không tìm thấy orderCode từ PayOS để xác thực giao dịch.');
        setIsLoading(false);
        return;
      }

      try {
        const token = getAccessToken();
        const response = await fetch(`/api/subscriptions/verify?orderCode=${encodeURIComponent(orderCode)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          cache: 'no-store',
        });

        const payload = (await response.json()) as ApiResponse<SubscriptionVerifyResponse>;

        if (!response.ok || !payload.success || !payload.data) {
          setMessage(payload.message ?? 'Giao dịch chưa được xác nhận. Nếu bạn đã thanh toán, vui lòng chờ webhook cập nhật.');
          setResult(null);
          return;
        }

        setResult(payload.data);
        setMessage('Gói Premium của bạn đã được kích hoạt và sẵn sàng sử dụng.');
      } catch {
        setMessage('Không thể xác thực giao dịch lúc này. Nếu bạn đã thanh toán, hệ thống vẫn sẽ cập nhật qua webhook.');
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'cancel') {
      setMessage('Bạn đã hủy giao dịch trên PayOS. Bạn có thể quay lại chọn gói khác bất kỳ lúc nào.');
      setIsLoading(false);
      return;
    }

    void verifyPayment();
  }, [orderCode, status]);

  return (
    <main className="min-h-screen bg-linear-to-b from-[#FFEBEE] via-[#FFF8F4] to-[#FFF5F5] px-6 py-10 text-[#3E2723] lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] bg-white shadow-[0_20px_70px_rgba(62,39,35,0.08)]"
        >
          <div className="bg-linear-to-r from-[#FFEBEE] via-white to-[#FFF3E0] px-8 py-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
              <span className="text-4xl">{result?.isPremium ? '✓' : status === 'cancel' ? '!' : '…'}</span>
            </div>
            <h1 className="mt-5 text-3xl font-extrabold">{title}</h1>
            <p className="mt-3 text-sm text-[#757575]">{message}</p>
          </div>

          <div className="px-8 py-8">
            <div className="grid gap-4 rounded-[28px] bg-[#FFF8F7] p-5 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#999]">Trạng thái</div>
                <div className="mt-2 text-lg font-bold">{result?.isPremium ? 'Premium đã kích hoạt' : status === 'cancel' ? 'Đã hủy' : 'Đang chờ xác minh'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#999]">Mã giao dịch</div>
                <div className="mt-2 text-lg font-bold">{orderCode ?? 'Không có'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#999]">Gói</div>
                <div className="mt-2 text-lg font-bold">{getPlanLabel(result?.plan ?? null)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#999]">Còn lại</div>
                <div className="mt-2 text-lg font-bold">{result?.daysRemaining != null ? `${result.daysRemaining} ngày` : 'Chưa có dữ liệu'}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/#premium"
                className="rounded-full border-2 border-[#FF9690] px-6 py-3 text-center text-sm font-semibold text-[#FF9690] transition-colors hover:bg-[#FF9690]/10"
              >
                Quay lại bảng giá
              </Link>
              <Link
                href="/"
                className="rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-6 py-3 text-center text-sm font-semibold text-white shadow-md"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}