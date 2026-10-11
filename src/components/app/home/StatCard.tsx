'use client';

import { useCardReveal } from '@/hooks/useCardReveal';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor?: string;
  bgColor?: string;
  index?: number;
}

export function StatCard({
  icon,
  label,
  value,
  iconColor = '#F0927C',
  bgColor = '#FFF3E0',
  index = 0,
}: StatCardProps) {
  const card = useCardReveal<HTMLDivElement>(index, 0.15);

  return (
    <div
      ref={card}
      className="card flex flex-1 cursor-default flex-col gap-3 p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: bgColor }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#999]">{label}</p>
        <p className="mt-0.5 text-lg font-extrabold text-[#3E2723]">{value}</p>
      </div>
    </div>
  );
}
