'use client';

import Link from 'next/link';
import { useCardReveal } from '@/hooks/useCardReveal';

interface QuickNavCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  href: string;
  bgColor: string;
  accentColor: string;
  index?: number;
}

export function QuickNavCard({
  icon,
  title,
  subtitle,
  href,
  bgColor,
  accentColor,
  index = 0,
}: QuickNavCardProps) {
  const card = useCardReveal<HTMLDivElement>(index, 0.3);

  return (
    <div ref={card}>
      <Link
        href={href}
        className="card flex flex-col gap-3 p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] motion-reduce:transition-none"
        style={{ background: bgColor, textDecoration: 'none' }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm" style={{ background: accentColor }}>
          <span className="text-white">{icon}</span>
        </div>
        <div>
          <p className="font-bold text-[#3E2723]">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-[#757575]">{subtitle}</p>}
        </div>
      </Link>
    </div>
  );
}
