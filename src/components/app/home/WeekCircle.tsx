'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP);

interface WeekCircleProps {
  currentWeek: number;
  currentDayInWeek: number;
  progressPercentage: number;
  daysRemaining: number;
}

const SIZE = 200;
const BORDER = 3;
const CENTER = SIZE / 2;
const RADIUS = (SIZE - BORDER) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WeekCircle({ currentWeek, currentDayInWeek, progressPercentage, daysRemaining }: WeekCircleProps) {
  const container = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const progress = Number.isFinite(progressPercentage) ? Math.min(100, Math.max(0, progressPercentage)) : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);

  useGSAP(() => {
    if (!container.current || !arc.current) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(container.current,
        { autoAlpha: 0, scale: 0.95 },
        { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'power2.out', clearProps: 'all' }
      );
      gsap.fromTo(arc.current,
        { strokeDashoffset: CIRCUMFERENCE },
        { strokeDashoffset, duration: 1.2, ease: 'power2.out', clearProps: 'strokeDashoffset' }
      );
    }, container);
    return () => media.revert();
  }, { scope: container, dependencies: [strokeDashoffset], revertOnUpdate: true });

  return (
    <div className="flex flex-col items-center">
      <div ref={container} className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox="0 0 200 200" className="absolute inset-0" aria-hidden="true">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={BORDER} />
          <circle
            ref={arc}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="white"
            strokeWidth={BORDER}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="relative flex w-full flex-col items-center justify-center text-center text-white">
          <div className="mb-1">
            <span className="text-[10px] font-medium tracking-wider opacity-80">HOÀN THÀNH</span>
            <span className="ml-1 text-sm font-bold">{progress.toFixed(1)}%</span>
          </div>
          <span className="text-[52px] font-extrabold leading-none">{currentWeek}</span>
          <span className="text-[10px] opacity-80">+{currentDayInWeek} ngày</span>
          <div className="mt-1">
            <span className="mr-1 text-sm font-bold">{daysRemaining}</span>
            <span className="text-[10px] font-medium tracking-wider opacity-80">NGÀY CÒN LẠI</span>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <Link
          href="/app/track"
          className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-6 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/30"
        >
          Xem thêm
          <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
