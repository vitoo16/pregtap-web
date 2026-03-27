'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface WeekCircleProps {
  currentWeek: number;
  currentDayInWeek: number;
  progressPercentage: number;
  daysRemaining: number;
}

export function WeekCircle({
  currentWeek,
  currentDayInWeek,
  progressPercentage,
  daysRemaining,
}: WeekCircleProps) {
  const size = 190;
  const borderWidth = 3;
  const center = size / 2;
  const radius = (size - borderWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Arc goes from top (270deg / -90deg) clockwise
  const strokeDashoffset = circumference * (1 - progressPercentage / 100);

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={borderWidth}
          />

          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth={borderWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            style={{
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
            }}
          />
        </svg>

        {/* Content overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-white"
          style={{ position: 'absolute', top: 0, left: 0, width: size, height: size }}
        >
          <span className="text-[11px] font-medium tracking-wider opacity-90">TUẦN</span>
          <motion.span
            className="font-extrabold leading-none"
            style={{ fontSize: 52 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {currentWeek}
          </motion.span>
          <span className="text-[11px] opacity-80">+{currentDayInWeek} ngày</span>
        </div>

        {/* Left label: % complete */}
        <div
          className="absolute left-0 flex flex-col text-white"
          style={{ top: center - 20, transform: 'translateY(-50%)' }}
        >
          <motion.span
            className="text-xl font-bold leading-none"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {progressPercentage.toFixed(1)}%
          </motion.span>
          <span className="text-[10px] tracking-wider opacity-80">HOÀN THÀNH</span>
        </div>

        {/* Right label: days remaining */}
        <div
          className="absolute right-0 flex flex-col items-end text-white"
          style={{ top: center - 20, transform: 'translateY(-50%)' }}
        >
          <motion.span
            className="text-xl font-bold leading-none"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {daysRemaining}
          </motion.span>
          <span className="text-[10px] tracking-wider opacity-80">NGÀY CÒN LẠI</span>
        </div>
      </motion.div>

      {/* Xem thêm button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="mt-5"
      >
        <Link
          href="/app/track"
          className="flex items-center gap-1.5 rounded-full px-6 py-2 text-sm font-medium text-white transition-all hover:gap-2.5"
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          Xem thêm
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}
