'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md"
        style={{ background: bgColor, textDecoration: 'none' }}
      >
        {/* Icon */}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
          style={{ background: accentColor }}
        >
          <span className="text-white">
            {icon}
          </span>
        </div>

        {/* Text */}
        <div>
          <p className="font-bold text-[#3E2723]">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#757575]">{subtitle}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
