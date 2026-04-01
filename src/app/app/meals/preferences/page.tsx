'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

import { apiClient } from '@/lib/api-client';
import { usePregnancy } from '@/contexts/PregnancyContext';
import type { FoodPreference, ApiResponse } from '@/types';
import { EmptyState } from '@/components/app/shared/EmptyState';
import { LoadingSpinner } from '@/components/app/shared/LoadingSpinner';
import { Modal } from '@/components/app/shared/Modal';

// ─── API helpers ───────────────────────────────────────────────────────────────

async function fetchFoodPreferences(pregnancyId: string): Promise<ApiResponse<FoodPreference[]>> {
  return apiClient.get<FoodPreference[]>(`/api/food-preferences`, { pregnancyId });
}

async function createFoodPreference(
  pregnancyId: string,
  foodItemId: string,
  preferenceType: 'Allergy' | 'Dislike',
): Promise<ApiResponse<FoodPreference>> {
  return apiClient.post<FoodPreference>(`/api/food-preferences?pregnancyId=${pregnancyId}`, {
    foodItemId,
    preferenceType,
  });
}

async function deleteFoodPreference(pregnancyId: string, prefId: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/food-preferences/${prefId}?pregnancyId=${pregnancyId}`);
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type RefFoodItem = {
  id: string;
  code: string;
  displayName: string;
};

const MOCK_FOOD_ITEMS: RefFoodItem[] = [
  { id: '1', code: 'SHELLFISH', displayName: 'Tôm, cua, ghẹ' },
  { id: '2', code: 'PEANUTS', displayName: 'Đậu phộng' },
  { id: '3', code: 'DAIRY', displayName: 'Sữa và các sản phẩm từ sữa' },
  { id: '4', code: 'EGGS', displayName: 'Trứng' },
  { id: '5', code: 'SOY', displayName: 'Đậu nành' },
  { id: '6', code: 'WHEAT', displayName: 'Lúa mì / Gluten' },
  { id: '7', code: 'FISH', displayName: 'Cá' },
  { id: '8', code: 'BEEF', displayName: 'Thịt bò' },
  { id: '9', code: 'PORK', displayName: 'Thịt heo' },
  { id: '10', code: 'CHICKEN', displayName: 'Thịt gà' },
  { id: '11', code: 'SPICY', displayName: 'Đồ ăn cay' },
  { id: '12', code: 'SEAFOOD', displayName: 'Hải sản' },
  { id: '13', code: 'TOFU', displayName: 'Đậu phụ' },
  { id: '14', code: 'MUSHROOM', displayName: 'Nấm' },
  { id: '15', code: 'BEANS', displayName: 'Các loại đậu' },
  { id: '16', code: 'CITRUS', displayName: 'Trái cây họ cam quýt' },
  { id: '17', code: 'MANGO', displayName: 'Xoài' },
  { id: '18', code: 'DURIAN', displayName: 'Sầu riêng' },
  { id: '19', code: 'COFFEE', displayName: 'Cà phê' },
  { id: '20', code: 'ALCOHOL', displayName: 'Rượu bia' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FoodPreferencesPage() {
  const router = useRouter();
  const { pregnancy } = usePregnancy();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'Allergy' | 'Dislike'>('Allergy');
  const [selectedFoodItem, setSelectedFoodItem] = useState<RefFoodItem | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch preferences
  const {
    data: prefsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['food-preferences', pregnancy?.id],
    queryFn: () => fetchFoodPreferences(pregnancy!.id),
    enabled: !!pregnancy?.id,
  });

  const preferences: FoodPreference[] = prefsResponse?.data ?? [];

  // Filter by type
  const allergies = preferences.filter((p) => p.preferenceType === 'Allergy');
  const dislikes = preferences.filter((p) => p.preferenceType === 'Dislike');

  // Create mutation
  const createMutation = useMutation({
    mutationFn: () =>
      createFoodPreference(pregnancy!.id, selectedFoodItem!.id, selectedType),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['food-preferences'] });
        setIsAddOpen(false);
        setSelectedFoodItem(null);
        showSnackbar('Thêm thành công', 'success');
      } else {
        showSnackbar(response.message ?? 'Có lỗi xảy ra', 'error');
      }
    },
    onError: () => {
      showSnackbar('Có lỗi xảy ra', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (prefId: string) => deleteFoodPreference(pregnancy!.id, prefId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['food-preferences'] });
        showSnackbar('Xóa thành công', 'success');
      } else {
        showSnackbar(response.message ?? 'Có lỗi xảy ra', 'error');
      }
    },
    onError: () => {
      showSnackbar('Có lỗi xảy ra', 'error');
    },
  });

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar(null), 3000);
  };

  // Filter food items by search
  const filteredItems = MOCK_FOOD_ITEMS.filter((item) =>
    item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    iconColor: string,
    items: FoodPreference[],
    emptyText: string,
    type: 'Allergy' | 'Dislike',
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-[#3E2723]">{title}</h3>
          <p className="text-xs text-[#757575]">{items.length} mục</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center">
          <p className="text-sm text-[#999]">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((pref) => (
            <motion.div
              key={pref.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold
                shadow-sm
              `}
              style={{
                backgroundColor: `${iconColor}15`,
                color: iconColor,
              }}
            >
              <span>{pref.foodItemDisplayName ?? pref.foodItemId ?? 'Món ăn'}</span>
              <button
                onClick={() => deleteMutation.mutate(pref.id)}
                disabled={deleteMutation.isPending}
                className="ml-1 flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10 transition-colors disabled:opacity-50"
                aria-label="Xóa"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="app-page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
            aria-label="Quay lại"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="heading-3 text-[#3E2723]">Sở thích ăn uống</h1>
            <p className="text-sm text-[#757575]">Dị ứng và thực phẩm không thích</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-page-content">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Allergies Section */}
            {renderSection(
              'Dị ứng',
              (
                <svg className="w-5 h-5" style={{ color: '#EF4444' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              ),
              '#EF4444',
              allergies,
              'Chưa có dị ứng nào được thêm',
              'Allergy',
            )}

            {/* Dislikes Section */}
            {renderSection(
              'Không thích',
              (
                <svg className="w-5 h-5" style={{ color: '#F97316' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                  <div className="not-italic" style={{ position: 'absolute', fontSize: '7px', color: '#F97316', fontWeight: 'bold' }}>D</div>
                </svg>
              ),
              '#F97316',
              dislikes,
              'Chưa có món ăn nào được thêm',
              'Dislike',
            )}

            {/* Info Note */}
            <div className="rounded-2xl bg-[#FFF3E0] p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#E65100]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-[#E65100]">Lưu ý</h4>
                  <p className="mt-1 text-xs text-[#E65100]/80">
                    Thông tin sở thích ăn uống sẽ được AI sử dụng khi tạo thực đơn dinh dưỡng
                    để tránh các thực phẩm bạn không thích hoặc dị ứng.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* FAB - Add Button */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-lg hover:shadow-xl transition-shadow z-40"
        aria-label="Thêm sở thích"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setSelectedFoodItem(null);
          setSearchQuery('');
        }}
        title="Thêm sở thích ăn uống"
        size="md"
      >
        <div className="space-y-5">
          {/* Type Selection */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-[#3E2723]">Loại sở thích</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedType('Allergy')}
                className={`
                  flex items-center gap-2 rounded-xl border-2 p-3 transition-all
                  ${selectedType === 'Allergy'
                    ? 'border-[#EF4444] bg-[#FFF1F1]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1F1]">
                  <svg className="w-4 h-4 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#3E2723]">Dị ứng</div>
                  <div className="text-xs text-[#757575]">Nghiêm trọng</div>
                </div>
              </button>
              <button
                onClick={() => setSelectedType('Dislike')}
                className={`
                  flex items-center gap-2 rounded-xl border-2 p-3 transition-all
                  ${selectedType === 'Dislike'
                    ? 'border-[#F97316] bg-[#FFF3E0]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3E0]">
                  <svg className="w-4 h-4 text-[#F97316]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#3E2723]">Không thích</div>
                  <div className="text-xs text-[#757575]">Sở thích</div>
                </div>
              </button>
            </div>
          </div>

          {/* Food Item Selection */}
          {selectedFoodItem ? (
            <div className="flex items-center justify-between rounded-xl bg-[#F5F5F5] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <svg className="w-5 h-5 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#3E2723]">{selectedFoodItem.displayName}</div>
                  <div className="text-xs text-[#757575]">{selectedFoodItem.code}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedFoodItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4 text-[#757575]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#3E2723]">
                  Chọn thực phẩm
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm thực phẩm..."
                    className="w-full rounded-xl border border-gray-200 bg-[#F5F5F5] py-2.5 pl-10 pr-4 text-sm text-[#3E2723] placeholder-[#999] outline-none focus:border-[#FF9690] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Food List */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFoodItem(item)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-[#FDEEEE]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#3E2723]">{item.displayName}</div>
                      <div className="text-xs text-[#999]">{item.code}</div>
                    </div>
                    <svg className="w-4 h-4 text-[#CCC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
                {filteredItems.length === 0 && (
                  <div className="py-6 text-center text-sm text-[#999]">
                    Không tìm thấy thực phẩm phù hợp
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          {selectedFoodItem && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setSelectedFoodItem(null);
                  setSearchQuery('');
                }}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-[#757575] transition-colors hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="btn btn-primary flex-1 rounded-xl py-3 text-sm disabled:opacity-60"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang thêm...
                  </span>
                ) : (
                  'Thêm'
                )}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Snackbar */}
      <AnimatePresence>
        {snackbar && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`
              fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-5 py-3 shadow-lg
              ${snackbar.type === 'success' ? 'bg-[#1F7A4D] text-white' : 'bg-[#C44545] text-white'}
            `}
          >
            {snackbar.type === 'success' ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            )}
            <span className="text-sm font-semibold">{snackbar.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
