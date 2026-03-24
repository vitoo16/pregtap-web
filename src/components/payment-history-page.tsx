'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { type ApiResponse } from '@/lib/auth';
import {
  extractSubscriptionHistory,
  formatCurrencyVnd,
  formatDateVi,
  getPlanLabel,
  type SubscriptionHistoryItem,
} from '@/lib/subscription';

function getStatusLabel(status: string | null) {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'paid' || normalized === 'success' || normalized === 'completed' || normalized === 'active') {
    return 'Thành công';
  }

  if (normalized === 'pending' || normalized === 'processing') {
    return 'Đang xử lý';
  }

  if (normalized === 'cancelled' || normalized === 'canceled' || normalized === 'failed' || normalized === 'expired') {
    return 'Không thành công';
  }

  return status ?? 'Chưa rõ';
}

function getStatusClasses(status: string | null) {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'paid' || normalized === 'success' || normalized === 'completed' || normalized === 'active') {
    return 'bg-[#E7F7EF] text-[#1F7A4D]';
  }

  if (normalized === 'pending' || normalized === 'processing') {
    return 'bg-[#FFF7E5] text-[#A86800]';
  }

  return 'bg-[#FFF1F1] text-[#C44545]';
}

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch('/api/subscriptions/history', {
          cache: 'no-store',
        });

        const payload = (await response.json()) as ApiResponse<unknown>;

        if (!response.ok || !payload.success) {
          setMessage(payload.message ?? 'Không thể tải lịch sử thanh toán.');
          setHistory([]);
          return;
        }

        const items = extractSubscriptionHistory(payload.data);
        setHistory(items);
      } catch {
        setMessage('Không thể tải lịch sử thanh toán.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadHistory();
  }, []);

  const totalSpent = useMemo(() => {
    return history.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }, [history]);

  return (
    <main className="min-h-screen bg-linear-to-b from-[#FFEBEE] via-[#FFF8F4] to-[#FFF5F5] px-6 py-10 text-[#3E2723] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-[28px] bg-white/80 p-6 shadow-[0_10px_40px_rgba(255,150,144,0.12)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF9690]">PregTap Billing</p>
              <h1 className="mt-2 text-3xl font-extrabold">Lịch sử thanh toán</h1>
              <p className="mt-2 text-sm text-[#757575]">Xem lại các giao dịch Premium đã tạo và trạng thái từng đơn.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/profile" className="rounded-full border-2 border-[#FF9690] px-5 py-2 text-sm font-semibold text-[#FF9690] transition-colors hover:bg-[#FF9690]/10">
                Về hồ sơ
              </Link>
              <Link href="/#premium" className="rounded-full bg-linear-to-r from-[#FF9690] to-[#FF7A74] px-5 py-2 text-sm font-semibold text-white shadow-md">
                Mua thêm gói
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-white p-5 shadow-[0_14px_40px_rgba(62,39,35,0.06)]">
            <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Tổng đơn</div>
            <div className="mt-2 text-2xl font-extrabold">{history.length}</div>
          </div>
          <div className="rounded-[24px] bg-white p-5 shadow-[0_14px_40px_rgba(62,39,35,0.06)]">
            <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Tổng chi tiêu</div>
            <div className="mt-2 text-2xl font-extrabold">{formatCurrencyVnd(totalSpent)}</div>
          </div>
          <div className="rounded-[24px] bg-white p-5 shadow-[0_14px_40px_rgba(62,39,35,0.06)]">
            <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Đơn thành công</div>
            <div className="mt-2 text-2xl font-extrabold">{history.filter((item) => getStatusLabel(item.status) === 'Thành công').length}</div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-white px-5 py-4 text-sm text-[#C44545] shadow-sm">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((value) => (
              <div key={value} className="h-32 animate-pulse rounded-[28px] bg-white" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-[32px] bg-white p-8 text-center shadow-[0_18px_60px_rgba(62,39,35,0.08)]">
            <h2 className="text-2xl font-bold">Chưa có giao dịch nào</h2>
            <p className="mt-3 text-sm text-[#757575]">Khi bạn tạo đơn mua Premium, lịch sử thanh toán sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[28px] bg-white p-6 shadow-[0_18px_60px_rgba(62,39,35,0.08)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Đơn hàng</div>
                    <h2 className="mt-2 text-xl font-extrabold">{getPlanLabel(item.plan)}</h2>
                    <p className="mt-1 text-sm text-[#757575]">Mã giao dịch: {item.orderCode ?? 'Chưa có'}</p>
                  </div>
                  <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 rounded-[24px] bg-[#FFF8F7] p-5 md:grid-cols-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Số tiền</div>
                    <div className="mt-2 text-lg font-bold">{formatCurrencyVnd(item.amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Ngày tạo</div>
                    <div className="mt-2 text-lg font-bold">{formatDateVi(item.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Hiệu lực đến</div>
                    <div className="mt-2 text-lg font-bold">{formatDateVi(item.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-[#999]">Còn lại</div>
                    <div className="mt-2 text-lg font-bold">{item.daysRemaining != null ? `${item.daysRemaining} ngày` : 'Chưa có dữ liệu'}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}