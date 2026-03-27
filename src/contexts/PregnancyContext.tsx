'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';

import { apiClient } from '@/lib/api-client';
import { type ApiResponse } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Types — matching MO /backend DTOs (camelCase)
// ---------------------------------------------------------------------------

export type ActivePregnancy = {
  id: string;
  userId: string;
  pregnancyNumber: number;
  status: string;
  lastMenstrualPeriodDate: string;
  expectedDeliveryDate: string;
  estimatedConceptionDate?: string;
  currentGestationalWeek?: number;
  gestationalAgeDisplay?: string;
  notes?: string;
  babyNickname?: string;
  babyGender?: 'Unknown' | 'Male' | 'Female';
  pregnancyType?: 'Singleton' | 'Twins' | 'Triplets' | 'Other';
  motherBloodType?: string;
  prePregnancyWeightKg?: number;
  heightCm?: number;
  prePregnancyBmi?: number;
  bmiCategory?: string;
  dueDateSource?: 'LMP' | 'Ultrasound' | 'IVF' | 'Manual';
  gravida?: number;
  para?: number;
  obstetricFormula?: string;
  actualDeliveryDate?: string;
  deliveryMethod?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type PregnancyProgress = {
  currentWeek: number;
  currentDay: number;
  totalDays: number;
  remainingDays: number;
  percentComplete: number;
};

type PregnancyContextValue = {
  pregnancy: ActivePregnancy | null;
  progress: PregnancyProgress | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPregnancy: (data: CreatePregnancyData) => Promise<void>;
  updatePregnancy: (id: string, data: UpdatePregnancyData) => Promise<void>;
};

type CreatePregnancyData = {
  lastMenstrualPeriodDate: string;
  expectedDeliveryDate?: string;
  babyNickname?: string;
  babyGender?: string;
  pregnancyType?: string;
  motherBloodType?: string;
  prePregnancyWeightKg?: number;
  heightCm?: number;
  gravida?: number;
  para?: number;
  dueDateSource?: string;
  notes?: string;
};

type UpdatePregnancyData = {
  expectedDeliveryDate?: string;
  lastMenstrualPeriodDate?: string;
  babyNickname?: string;
  babyGender?: string;
  pregnancyType?: string;
  motherBloodType?: string;
  prePregnancyWeightKg?: number;
  heightCm?: number;
  gravida?: number;
  para?: number;
  dueDateSource?: string;
  notes?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeProgress(dueDateStr: string): PregnancyProgress {
  const dueDate = parseISO(dueDateStr);
  const today = new Date();

  const totalDays = 280;
  const remainingDays = Math.max(0, differenceInDays(dueDate, today));
  const elapsedDays = totalDays - remainingDays;
  const percentComplete = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  const currentWeek = differenceInWeeks(today, dueDate) + 40;
  const daysInCurrentWeek = 7 - (remainingDays % 7);

  return {
    currentWeek: Math.max(1, Math.min(40, currentWeek)),
    currentDay: Math.max(1, Math.min(7, daysInCurrentWeek)),
    totalDays,
    remainingDays,
    percentComplete,
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PregnancyContext = createContext<PregnancyContextValue | null>(null);

export function usePregnancy() {
  const ctx = useContext(PregnancyContext);
  if (!ctx) {
    throw new Error('usePregnancy must be used within a PregnancyProvider');
  }
  return ctx;
}

type PregnancyProviderProps = {
  children: ReactNode;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PregnancyProvider({ children }: PregnancyProviderProps) {
  const [pregnancy, setPregnancy] = useState<ActivePregnancy | null>(null);
  const [progress, setProgress] = useState<PregnancyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePregnancy = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const payload = await apiClient.get<ActivePregnancy>('/api/pregnancies/active');

      if (payload.success && payload.data && payload.data.id) {
        setPregnancy(payload.data);
        if (payload.data.expectedDeliveryDate) {
          setProgress(computeProgress(payload.data.expectedDeliveryDate));
        }
      } else if (payload.statusCode === 404) {
        setPregnancy(null);
        setProgress(null);
      } else {
        setError(payload.message ?? 'Không thể tải thông tin thai kỳ.');
      }
    } catch {
      setError('Không thể kết nối tới máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActivePregnancy();
  }, [fetchActivePregnancy]);

  // Recompute progress every minute
  useEffect(() => {
    if (!pregnancy?.expectedDeliveryDate) return;
    setProgress(computeProgress(pregnancy.expectedDeliveryDate));
    const interval = setInterval(() => {
      if (pregnancy.expectedDeliveryDate) {
        setProgress(computeProgress(pregnancy.expectedDeliveryDate));
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [pregnancy]);

  const createPregnancy = useCallback(async (data: CreatePregnancyData) => {
    const payload = await apiClient.post<ActivePregnancy>('/api/pregnancies', data);
    if (!payload.success || !payload.data) {
      throw new Error(payload.errors?.join(' ') ?? payload.message ?? 'Không thể tạo thai kỳ.');
    }
    setPregnancy(payload.data);
    if (payload.data.expectedDeliveryDate) {
      setProgress(computeProgress(payload.data.expectedDeliveryDate));
    }
  }, []);

  const updatePregnancy = useCallback(async (id: string, data: UpdatePregnancyData) => {
    const payload = await apiClient.put<ActivePregnancy>(`/api/pregnancies/${id}`, data);
    if (!payload.success || !payload.data) {
      throw new Error(payload.errors?.join(' ') ?? payload.message ?? 'Không thể cập nhật thai kỳ.');
    }
    setPregnancy(payload.data);
    if (payload.data.expectedDeliveryDate) {
      setProgress(computeProgress(payload.data.expectedDeliveryDate));
    }
  }, []);

  return (
    <PregnancyContext.Provider
      value={{
        pregnancy,
        progress,
        isLoading,
        error,
        refetch: fetchActivePregnancy,
        createPregnancy,
        updatePregnancy,
      }}
    >
      {children}
    </PregnancyContext.Provider>
  );
}
