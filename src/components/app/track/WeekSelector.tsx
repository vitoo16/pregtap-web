'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WeekSelectorProps {
  currentWeek: number;
  selectedWeek: number;
  onWeekSelect: (week: number) => void;
}

export function WeekSelector({ currentWeek, selectedWeek, onWeekSelect }: WeekSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected week into view
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedWeek]);

  return (
    <div className="card overflow-hidden">
      {/* Trimester labels */}
      <div className="flex border-b border-gray-100">
        <div className="flex-1 px-4 py-2 text-center">
          <span className="text-xs font-bold text-[#FF9690]">Tam cá nguyệt 1</span>
        </div>
        <div className="flex-1 border-x border-gray-100 px-4 py-2 text-center">
          <span className="text-xs font-bold text-[#FF7A74]">Tam cá nguyệt 2</span>
        </div>
        <div className="flex-1 px-4 py-2 text-center">
          <span className="text-xs font-bold text-[#DA927B]">Tam cá nguyệt 3</span>
        </div>
      </div>

      {/* Week numbers — horizontal scroll */}
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto px-3 py-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Array.from({ length: 40 }, (_, i) => i + 1).map((week) => {
          const isSelected = week === selectedWeek;
          const isPast = week < selectedWeek;
          const isCurrent = week === currentWeek;

          // Determine color based on trimester
          let bgClass = 'bg-[#FFEBEE] text-[#757575]';
          if (week <= 12) {
            bgClass = isSelected
              ? 'bg-linear-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-sm'
              : isPast
              ? 'bg-[#FFE0DE] text-[#FF9690]'
              : 'bg-[#FFEBEE] text-[#757575]';
          } else if (week <= 27) {
            bgClass = isSelected
              ? 'bg-linear-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-sm'
              : isPast
              ? 'bg-[#FFD5CF] text-[#DA927B]'
              : 'bg-[#FFF3E0] text-[#757575]';
          } else {
            bgClass = isSelected
              ? 'bg-linear-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-sm'
              : isPast
              ? 'bg-[#FFCFC5] text-[#DA927B]'
              : 'bg-[#FFECE8] text-[#757575]';
          }

          return (
            <button
              key={week}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => onWeekSelect(week)}
              style={{ scrollSnapAlign: 'center' }}
              className={`relative shrink-0 h-9 w-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center snap-x snap-center
                ${bgClass}
                ${isSelected ? 'ring-2 ring-[#FF9690]/40 scale-110' : 'hover:scale-105'}
              `}
            >
              {week}
              {isCurrent && !isSelected && (
                <span
                  className="absolute -bottom-0.5 left-1/2 h-1 w-1 rounded-full -translate-x-1/2"
                  style={{ background: '#FF9690' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="h-1 bg-[#FFEBEE]">
        <motion.div
          className="h-full rounded-r-full bg-linear-to-r from-[#FF9690] to-[#DA927B]"
          initial={{ width: 0 }}
          animate={{ width: `${(selectedWeek / 40) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
