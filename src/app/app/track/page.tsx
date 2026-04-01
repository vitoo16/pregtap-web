'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { usePregnancy } from '@/contexts/PregnancyContext';
import { WeekSelector } from '@/components/app/track/WeekSelector';
import { WeekDetail } from '@/components/app/track/WeekDetail';
import { type PregnancyWeek, type InfoSection } from '@/types';

// ─── Types for raw JSON ────────────────────────────────────────────────────────

interface RawInfoSection {
  title: string;
  content: string;
}

interface RawPregnancyWeek {
  week_number: number;
  embryo_image?: string;
  weight: { value: string; unit: string };
  length: { value: string; unit: string };
  current_week_and_days: string;
  trimester: string;
  date_of_labor: string;
  weeks_and_days_left: string;
  info_sections: RawInfoSection[];
}

interface RawData {
  trimester_1: RawPregnancyWeek[];
  trimester_2: RawPregnancyWeek[];
  trimester_3: RawPregnancyWeek[];
}

// ─── Transform raw JSON to typed PregnancyWeek ────────────────────────────────

function transformWeek(raw: RawPregnancyWeek): PregnancyWeek {
  const trimesterStr = raw.trimester ?? '';
  const trimesterNum = trimesterStr.includes('Tam cá nguyệt 1') ? 1
    : trimesterStr.includes('Tam cá nguyệt 2') ? 2
    : trimesterStr.includes('Tam cá nguyệt 3') ? 3
    : 1;

  return {
    weekNumber: raw.week_number,
    embryoImage: raw.embryo_image,
    weight: { value: parseFloat(String(raw.weight.value)) || 0, unit: raw.weight.unit },
    length: { value: parseFloat(String(raw.length.value)) || 0, unit: raw.length.unit },
    currentWeekAndDays: raw.current_week_and_days,
    trimester: trimesterNum,
    dateOfLabor: raw.date_of_labor,
    weeksAndDaysLeft: raw.weeks_and_days_left,
    infoSections: raw.info_sections.map((s: RawInfoSection): InfoSection => ({
      title: s.title,
      content: s.content,
    })),
  };
}

// ─── All 40 weeks (interpolated from data) ─────────────────────────────────────

function buildAllWeeks(rawData: RawData): PregnancyWeek[] {
  const all: PregnancyWeek[] = [];

  // Sort each trimester's weeks
  const t1 = [...rawData.trimester_1].sort((a, b) => a.week_number - b.week_number);
  const t2 = [...rawData.trimester_2].sort((a, b) => a.week_number - b.week_number);
  const t3 = [...rawData.trimester_3].sort((a, b) => a.week_number - b.week_number);

  // Weeks in raw data
  const weeksInData = new Set<number>([
    ...t1.map((w) => w.week_number),
    ...t2.map((w) => w.week_number),
    ...t3.map((w) => w.week_number),
  ]);

  // We have weeks: 1, 4, 6, 8, 12 (T1), 14, 18, 22, 26 (T2), 28, 32, 36, 40 (T3)
  // Fill in the gaps by interpolating
  const trimesterWeeks: [number, number][] = [
    [1, 13],   // T1: weeks 1-12 (missing: 2,3,5,7,9,10,11)
    [14, 27],  // T2: weeks 14-26 (missing: 15,16,17,19,20,21,23,24,25)
    [28, 40],  // T3: weeks 28-40 (missing: 29,30,31,33,34,35,37,38,39)
  ];

  const trimesterGroups: [RawPregnancyWeek[], RawPregnancyWeek[]][] = [
    [t1, t2],
    [t2, t3],
    [t3, []],
  ];

  for (let i = 0; i < 40; i++) {
    const weekNum = i + 1;
    const raw = weeksInData.has(weekNum)
      ? [...t1, ...t2, ...t3].find((w) => w.week_number === weekNum)
      : null;

    if (raw) {
      all.push(transformWeek(raw));
    } else {
      // Interpolate from nearest known weeks
      const [tStart, tEnd] = trimesterWeeks[i < 13 ? 0 : i < 27 ? 1 : 2];
      const prevData = all.length > 0 ? all[all.length - 1] : null;

      // Find next known week
      const nextRaw = [...t1, ...t2, ...t3]
        .filter((w) => w.week_number > weekNum)
        .sort((a, b) => a.week_number - b.week_number)[0];

      // Build interpolated week
      all.push({
        weekNumber: weekNum,
        weight: prevData?.weight ?? { value: 0, unit: 'g' },
        length: prevData?.length ?? { value: 0, unit: 'cm' },
        currentWeekAndDays: `${weekNum} tuần và 0 ngày`,
        trimester: weekNum <= 12 ? 1 : weekNum <= 27 ? 2 : 3,
        dateOfLabor: nextRaw?.date_of_labor ?? '',
        weeksAndDaysLeft: `Còn lại ${40 - weekNum} tuần và 0 ngày`,
        infoSections: prevData?.infoSections ?? [],
      });
    }
  }

  return all;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrackPage() {
  const { pregnancy, progress, isLoading: pregnancyLoading } = usePregnancy();

  const [weeks, setWeeks] = useState<PregnancyWeek[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load pregnancy data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/data/pregnancy_data.json');
        if (!res.ok) throw new Error('Failed to load');
        const raw = (await res.json()) as RawData;
        const all = buildAllWeeks(raw);
        setWeeks(all);
      } catch {
        setLoadError('Không thể tải dữ liệu thai kỳ.');
      } finally {
        setDataLoading(false);
      }
    }
    void load();
  }, []);

  // Sync selected week with current progress
  useEffect(() => {
    if (progress && weeks.length > 0) {
      setSelectedWeek(Math.min(Math.max(1, progress.currentWeek), 40));
    }
  }, [progress, weeks.length]);

  // Loading
  if (pregnancyLoading || dataLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto h-10 w-10" style={{ borderWidth: 3 }} />
          <p className="mt-4 text-sm text-[#999]">Đang tải...</p>
        </div>
      </div>
    );
  }

  // No pregnancy setup
  if (!pregnancy || !progress) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm text-center"
        >
          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #FF9690 0%, #FFC0C0 100%)' }}
          >
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#3E2723]">
            Chưa có thông tin thai kỳ
          </h2>
          <p className="mb-6 text-sm text-[#757575]">
            Vui lòng thiết lập thông tin thai kỳ trước để xem theo dõi tuần tuần.
          </p>
          <Link
            href="/app/setup"
            className="btn btn-primary inline-flex rounded-2xl px-8 py-3 text-sm font-bold shadow-lg"
          >
            Thiết lập thai kỳ
          </Link>
        </motion.div>
      </div>
    );
  }

  // Error
  if (loadError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-sm rounded-2xl border border-[#FF7A74]/30 bg-[#FF7A74]/5 p-6 text-center">
          <p className="text-sm text-[#FF7A74]">{loadError}</p>
        </div>
      </div>
    );
  }

  const currentWeekData = weeks.find((w) => w.weekNumber === selectedWeek);
  const isCurrentWeek = selectedWeek === progress.currentWeek;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div
        className="relative overflow-hidden px-6 pt-8 pb-8 md:px-10"
        style={{
          background: 'linear-gradient(135deg, #FF9690 0%, #DA927B 100%)',
        }}
      >
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full opacity-10 bg-white md:right-[-30px] md:top-[-30px]" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full opacity-10 bg-white md:left-[-20px] md:bottom-[-20px]" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 text-center text-white"
        >
          <h1 className="text-[22px] font-semibold">Theo dõi thai kỳ</h1>
          {isCurrentWeek && (
            <p className="mt-1 text-sm font-medium opacity-90">
              Bạn đang ở tuần {progress.currentWeek} - {progress.currentDay} ngày
            </p>
          )}
        </motion.div>
      </div>

      {/* Week Selector */}
      <div className="app-page-content">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <WeekSelector
            currentWeek={progress.currentWeek}
            selectedWeek={selectedWeek}
            onWeekSelect={setSelectedWeek}
          />
        </motion.div>

        {/* Week Detail */}
        {currentWeekData && (
          <motion.div
            key={selectedWeek}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-4"
          >
            <WeekDetail week={currentWeekData} selectedWeek={selectedWeek} />
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
            disabled={selectedWeek <= 1}
            className="btn btn-secondary flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="flex items-center justify-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Tuần trước
            </span>
          </button>
          <button
            onClick={() => setSelectedWeek((w) => Math.min(40, w + 1))}
            disabled={selectedWeek >= 40}
            className="btn btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="flex items-center justify-center gap-1">
              Tuần sau
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
