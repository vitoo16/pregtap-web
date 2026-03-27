'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import type { MealDay } from '@/types';

type CalendarGridProps = {
  focusedDate: Date;
  selectedDate: Date;
  mealDays?: MealDay[];
  onDateSelect?: (date: Date) => void;
};

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function CalendarGrid({
  focusedDate,
  selectedDate,
  mealDays = [],
  onDateSelect,
}: CalendarGridProps) {
  const router = useRouter();
  const today = new Date();

  // Build calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(focusedDate);
    const monthEnd = endOfMonth(focusedDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [focusedDate]);

  // Map mealDays dates to check if meals exist
  const mealDates = useMemo(() => {
    const set = new Set<string>();
    mealDays.forEach((day) => {
      set.add(format(parseISO(day.date), 'yyyy-MM-dd'));
    });
    return set;
  }, [mealDays]);

  const handleDayClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      router.push(`/app/meals/${format(date, 'yyyy-MM-dd')}`);
    }
  };

  const handlePrevMonth = () => {
    const input = document.getElementById('calendar-month-input');
    if (input) {
      const newDate = subMonths(focusedDate, 1);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div className="card p-4">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const input = document.getElementById('calendar-month-input') as HTMLInputElement;
            if (input) {
              const newDate = subMonths(focusedDate, 1);
              input.value = format(newDate, 'yyyy-MM');
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
          aria-label="Tháng trước"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h3 className="text-base font-bold text-[#3E2723]">
          {format(focusedDate, 'MMMM yyyy', { locale: vi })}
        </h3>

        <button
          onClick={() => {
            const input = document.getElementById('calendar-month-input') as HTMLInputElement;
            if (input) {
              const newDate = addMonths(focusedDate, 1);
              input.value = format(newDate, 'yyyy-MM');
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#FDEEEE] text-[#757575] hover:text-[#FF9690] transition-colors"
          aria-label="Tháng sau"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Hidden input for month navigation (controlled externally) */}
      <input
        id="calendar-month-input"
        type="month"
        defaultValue={format(focusedDate, 'yyyy-MM')}
        className="hidden"
        onChange={(e) => {}}
      />

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-bold text-[#999]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, focusedDate);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const hasMeals = mealDates.has(format(day, 'yyyy-MM-dd'));
          const isSunday = day.getDay() === 0;

          return (
            <motion.button
              key={index}
              onClick={() => handleDayClick(day)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex aspect-square flex-col items-center justify-center rounded-full text-sm
                transition-all duration-200
                ${!isCurrentMonth ? 'text-[#CCC]' : ''}
                ${isSunday && isCurrentMonth ? 'text-[#C44545]' : isCurrentMonth ? 'text-[#3E2723]' : ''}
                ${isSelected ? 'bg-gradient-to-br from-[#FF9690] to-[#FF7A74] text-white shadow-md' : ''}
                ${!isSelected && isToday ? 'ring-2 ring-[#FF9690] ring-offset-1' : ''}
                hover:bg-[#FDEEEE]
              `}
            >
              <span className={`
                font-semibold
                ${isSelected ? 'text-white' : isToday && !isSelected ? 'text-[#FF9690]' : ''}
              `}>
                {format(day, 'd')}
              </span>

              {/* Meal indicator dots */}
              {hasMeals && (
                <div className="absolute bottom-1.5 flex gap-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#FF9690]'}`} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
