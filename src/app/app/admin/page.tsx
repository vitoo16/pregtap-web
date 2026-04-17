'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

import { type ApiResponse } from '@/lib/auth';
import { getAccessToken } from '@/lib/token-store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserStats {
  total: number;
  deleted: number;
  pending: number;
  free: number;
  activePro: number;
  expiredPro: number;
}

interface AdminUserItem {
  id: string;
  fullName: string | null;
  email: string | null;
  status: string | null;
  subscriptionPlan: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
}

interface PagedUsers {
  items: AdminUserItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = parseISO(value);
  if (!isValid(d)) return '—';
  return format(d, 'dd/MM/yyyy HH:mm', { locale: vi });
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = parseISO(value);
  if (!isValid(d)) return '—';
  return format(d, 'dd/MM/yyyy', { locale: vi });
}

function getInitial(name: string | null, email: string | null): string {
  const src = name?.trim() || email?.trim() || '?';
  return src.charAt(0).toUpperCase();
}

function getPlanBadge(plan: string | null) {
  if (!plan) {
    return {
      label: 'Free',
      className: 'bg-[#F0F2F5] text-[#555]',
    };
  }
  const normalized = plan.toLowerCase();
  if (normalized.includes('year')) {
    return {
      label: 'Yearly',
      className: 'bg-linear-to-r from-[#FFD700]/20 to-[#FFB87A]/20 text-[#B87A00]',
    };
  }
  if (normalized.includes('month')) {
    return {
      label: 'Monthly',
      className: 'bg-linear-to-r from-[#FF9690]/20 to-[#FFC0C0]/30 text-[#C44545]',
    };
  }
  return {
    label: plan,
    className: 'bg-[#E0F2F1] text-[#1F7A4D]',
  };
}

function getStatusBadge(status: string | null) {
  const normalized = status?.trim().toLowerCase() ?? '';
  if (normalized === 'active') {
    return { label: 'Active', className: 'bg-[#E7F7EF] text-[#1F7A4D]' };
  }
  if (normalized === 'deleted') {
    return { label: 'Deleted', className: 'bg-[#FFF1F1] text-[#C44545]' };
  }
  if (normalized === 'pending') {
    return { label: 'Pending', className: 'bg-[#FFF7E5] text-[#A86800]' };
  }
  if (normalized === 'locked' || normalized === 'suspended') {
    return { label: status ?? 'Locked', className: 'bg-[#FFE5E5] text-[#C44545]' };
  }
  return { label: status ?? 'Unknown', className: 'bg-[#F0F2F5] text-[#555]' };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconGift = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  accent: string;
  index?: number;
  isLoading?: boolean;
}

function AdminStatCard({ label, value, icon, iconColor, bgColor, accent, index = 0, isLoading }: AdminStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,150,144,0.18)]"
    >
      <div className="absolute right-0 top-0 h-1 w-full" style={{ background: accent }} />
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: bgColor, color: iconColor }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-6 w-16 animate-pulse rounded bg-[#F0F2F5]" />
          ) : (
            <p className="mt-1 text-2xl font-extrabold text-[#3E2723]">{value}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedUsers, 'items'>>({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ─── Fetch stats ───
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const token = getAccessToken();
      const res = await fetch('/api/admin/users/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
        credentials: 'include',
      });
      const payload = (await res.json()) as ApiResponse<UserStats>;
      if (!payload.success || !payload.data) {
        setStatsError(payload.message ?? 'Không thể tải thống kê người dùng.');
        setStats(null);
        return;
      }
      setStats(payload.data);
    } catch {
      setStatsError('Không thể kết nối tới máy chủ.');
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ─── Fetch users list ───
  const fetchUsers = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const token = getAccessToken();
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
        credentials: 'include',
      });
      const payload = (await res.json()) as ApiResponse<PagedUsers>;

      if (!payload.success || !payload.data) {
        setListError(payload.message ?? 'Không thể tải danh sách người dùng.');
        setUsers([]);
        return;
      }

      const { items, ...rest } = payload.data;
      setUsers(items ?? []);
      setPagination(rest);
    } catch {
      setListError('Không thể kết nối tới máy chủ.');
      setUsers([]);
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Debounce search input -> searchQuery
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRefresh = useCallback(() => {
    void fetchStats();
    void fetchUsers();
  }, [fetchStats, fetchUsers]);

  const statCards = useMemo(
    () => [
      {
        label: 'Tổng người dùng',
        value: stats?.total ?? 0,
        icon: <IconUsers />,
        iconColor: '#FF7A74',
        bgColor: '#FFEBEE',
        accent: 'linear-gradient(90deg, #FF9690, #FFC0C0)',
      },
      {
        label: 'Đã xoá',
        value: stats?.deleted ?? 0,
        icon: <IconTrash />,
        iconColor: '#C44545',
        bgColor: '#FFF1F1',
        accent: 'linear-gradient(90deg, #E06060, #C44545)',
      },
      {
        label: 'Chờ kích hoạt',
        value: stats?.pending ?? 0,
        icon: <IconClock />,
        iconColor: '#A86800',
        bgColor: '#FFF7E5',
        accent: 'linear-gradient(90deg, #FFD700, #FFB87A)',
      },
      {
        label: 'Gói Free',
        value: stats?.free ?? 0,
        icon: <IconGift />,
        iconColor: '#1F7A4D',
        bgColor: '#E0F2F1',
        accent: 'linear-gradient(90deg, #B8E6D4, #8FD4BC)',
      },
      {
        label: 'Pro còn hạn',
        value: stats?.activePro ?? 0,
        icon: <IconStar />,
        iconColor: '#B87A00',
        bgColor: '#FFF3B0',
        accent: 'linear-gradient(90deg, #FFD700, #FF9690)',
      },
      {
        label: 'Pro hết hạn',
        value: stats?.expiredPro ?? 0,
        icon: <IconAlert />,
        iconColor: '#8A6D00',
        bgColor: '#FFF3E0',
        accent: 'linear-gradient(90deg, #FFB87A, #DA927B)',
      },
    ],
    [stats],
  );

  return (
    <div className="min-h-screen pb-12">
      {/* Gradient header */}
      <div
        className="relative overflow-hidden px-6 pt-8 pb-12 md:px-10"
        style={{ background: 'linear-gradient(135deg, #FF9690 0%, #DA927B 100%)' }}
      >
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white opacity-10 md:right-[-40px] md:top-[-40px]" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white opacity-10 md:bottom-[-20px] md:left-[-20px]" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
              PregTap Admin
            </p>
            <h1 className="mt-1 text-[22px] font-extrabold text-white md:text-3xl">
              Quản lý người dùng
            </h1>
            <p className="mt-1 text-sm text-white/85">
              Theo dõi thống kê và danh sách tài khoản trên hệ thống.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 self-start rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <IconRefresh />
            Làm mới
          </button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="app-page-content -mt-6">
        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((card, i) => (
            <AdminStatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
              bgColor={card.bgColor}
              accent={card.accent}
              index={i}
              isLoading={statsLoading}
            />
          ))}
        </div>

        {statsError && (
          <div className="mb-4 rounded-2xl border border-[#FF7A74]/30 bg-[#FFF1F1] px-5 py-3 text-sm text-[#C44545]">
            {statsError}
          </div>
        )}

        {/* Users table section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
        >
          {/* Table header */}
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#3E2723]">Danh sách người dùng</h2>
              <p className="mt-0.5 text-xs text-[#999]">
                {pagination.totalCount > 0
                  ? `${pagination.totalCount} người dùng`
                  : 'Chưa có người dùng'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 md:w-72">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, SĐT..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-10 w-full rounded-full border border-gray-200 bg-[#FAFAFA] pl-9 pr-4 text-sm text-[#3E2723] placeholder:text-[#999] focus:border-[#FF9690] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
                />
              </div>

              {/* Page size */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-10 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-[#3E2723] focus:border-[#FF9690] focus:outline-none focus:ring-2 focus:ring-[#FF9690]/20"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAFAFA] text-[11px] font-bold uppercase tracking-wider text-[#999]">
                <tr>
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Gói</th>
                  <th className="px-5 py-3">Hết hạn</th>
                  <th className="px-5 py-3">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                    <tr key={`skel-${i}`} className="border-t border-gray-100">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-[#F0F2F5]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDEEEE] text-[#FF9690]">
                        <IconUsers />
                      </div>
                      <p className="text-sm font-semibold text-[#3E2723]">Không có người dùng nào</p>
                      <p className="mt-1 text-xs text-[#999]">
                        {searchQuery ? 'Thử thay đổi từ khoá tìm kiếm.' : 'Danh sách hiện đang trống.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((u, index) => {
                    const plan = getPlanBadge(u.subscriptionPlan);
                    const status = getStatusBadge(u.status);
                    const displayName = u.fullName?.trim() || u.email?.trim() || '—';
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.02, 0.2) }}
                        className="border-t border-gray-100 transition-colors hover:bg-[#FFF8F7]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-sm"
                              style={{ background: 'linear-gradient(135deg, #FF9690, #FFC0C0)' }}
                            >
                              {getInitial(u.fullName, u.email)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#3E2723]">{displayName}</p>
                              <p className="truncate text-xs text-[#999]">ID: {u.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="truncate text-[#3E2723]">{u.email || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${plan.className}`}
                          >
                            {plan.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#3E2723]">
                          {formatDate(u.subscriptionEndDate)}
                        </td>
                        <td className="px-5 py-4 text-[#3E2723]">
                          {formatDateTime(u.createdAt)}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {listError && (
            <div className="border-t border-gray-100 bg-[#FFF1F1] px-5 py-3 text-sm text-[#C44545]">
              {listError}
            </div>
          )}

          {/* Pagination footer */}
          {pagination.totalCount > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-[#999]">
                Trang <strong className="text-[#3E2723]">{pagination.page}</strong> /{' '}
                <strong className="text-[#3E2723]">{Math.max(1, pagination.totalPages)}</strong> —
                hiển thị{' '}
                <strong className="text-[#3E2723]">
                  {users.length}
                </strong>{' '}
                trong tổng <strong className="text-[#3E2723]">{pagination.totalCount}</strong>{' '}
                người dùng
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage || listLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[#3E2723] transition-colors hover:border-[#FF9690] hover:text-[#FF9690] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-[#3E2723]"
                  aria-label="Trang trước"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <span className="min-w-[72px] rounded-full bg-[#FDEEEE] px-3 py-1.5 text-center text-xs font-bold text-[#FF7A74]">
                  {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage || listLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[#3E2723] transition-colors hover:border-[#FF9690] hover:text-[#FF9690] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-[#3E2723]"
                  aria-label="Trang sau"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Back to app */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/app/home"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#757575] shadow-sm transition-colors hover:text-[#FF9690]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
