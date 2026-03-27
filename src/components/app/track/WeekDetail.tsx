'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PregnancyWeek, type InfoSection } from '@/types';

interface WeekDetailProps {
  week: PregnancyWeek;
  selectedWeek: number;
}

function getTrimesterName(trimester: number): string {
  switch (trimester) {
    case 1: return 'Tam cá nguyệt 1';
    case 2: return 'Tam cá nguyệt 2';
    case 3: return 'Tam cá nguyệt 3';
    default: return `Tam cá nguyệt ${trimester}`;
  }
}

function getTrimesterColor(trimester: number): { bg: string; text: string } {
  switch (trimester) {
    case 1: return { bg: '#FFEBEE', text: '#FF7A74' };
    case 2: return { bg: '#FFF3E0', text: '#DA927B' };
    case 3: return { bg: '#FFE5D8', text: '#C46A4E' };
    default: return { bg: '#FFEBEE', text: '#FF7A74' };
  }
}

function InfoAccordion({ section, index }: { section: InfoSection; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  const getIcon = () => {
    switch (section.title) {
      case 'Bé':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        );
      case 'Mẹ':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      case 'Lời khuyên hữu ích':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
    }
  };

  const getColors = () => {
    switch (section.title) {
      case 'Bé': return { bg: '#FFEBEE', icon: '#FF9690' };
      case 'Mẹ': return { bg: '#FFF3E0', icon: '#F0927C' };
      case 'Lời khuyên hữu ích': return { bg: '#E0F2F1', icon: '#64C5B1' };
      default: return { bg: '#FFEBEE', icon: '#FF9690' };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
      className="mb-2 overflow-hidden rounded-xl border"
      style={{ borderColor: 'rgba(255,150,144,0.15)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-[#FFEBEE]/30"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: colors.bg, color: colors.icon }}
        >
          {getIcon()}
        </div>
        <span className="flex-1 text-sm font-bold text-[#3E2723]">{section.title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#999]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pl-15">
              <p className="text-sm leading-relaxed text-[#757575]">{section.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function WeekDetail({ week, selectedWeek }: WeekDetailProps) {
  const isPastWeek = selectedWeek > week.weekNumber;
  const trimesterColor = getTrimesterColor(week.trimester);
  const trimesterName = getTrimesterName(week.trimester);

  return (
    <div className="space-y-4">
      {/* Week header card */}
      <motion.div
        key={week.weekNumber}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card overflow-hidden p-5"
      >
        {/* Trimester badge */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: trimesterColor.bg, color: trimesterColor.text }}
          >
            {trimesterName}
          </span>
          {isPastWeek && (
            <span className="rounded-full bg-[#E0F2F1] px-3 py-1 text-xs font-semibold text-[#64C5B1]">
              Đã qua
            </span>
          )}
        </div>

        {/* Week info */}
        <h2 className="mb-4 text-2xl font-extrabold text-[#3E2723]">
          Tuần {week.weekNumber}
          <span className="ml-2 text-base font-medium text-[#999]">
            ({week.currentWeekAndDays})
          </span>
        </h2>

        {/* Baby stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#FFEBEE] p-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#FF9690]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span className="text-xs font-semibold text-[#999]">Cân nặng bé</span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[#3E2723]">
              {week.weight.value}
              <span className="ml-1 text-sm font-medium">{week.weight.unit}</span>
            </p>
          </div>
          <div className="rounded-xl bg-[#FFF3E0] p-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#F0927C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span className="text-xs font-semibold text-[#999]">Chiều dài bé</span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-[#3E2723]">
              {week.length.value}
              <span className="ml-1 text-sm font-medium">{week.length.unit}</span>
            </p>
          </div>
        </div>

        {/* Days remaining */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#E0F2F1] p-3">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#64C5B1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="text-xs font-semibold text-[#757575]">{week.weeksAndDaysLeft}</span>
          </div>
        </div>
      </motion.div>

      {/* Info sections accordion */}
      <motion.div
        key={`sections-${week.weekNumber}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {week.infoSections.map((section: InfoSection, index: number) => (
          <InfoAccordion key={section.title} section={section} index={index} />
        ))}
      </motion.div>
    </div>
  );
}
