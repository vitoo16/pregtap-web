'use client';

import { motion } from 'framer-motion';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="card flex flex-1 cursor-default flex-col gap-3 p-4 transition-shadow hover:shadow-md"
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: bgColor }}
      >
        <span style={{ color: iconColor }}>
          {icon}
        </span>
      </div>

      {/* Content */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#999]">{label}</p>
        <p className="mt-0.5 text-lg font-extrabold text-[#3E2723]">{value}</p>
      </div>
    </motion.div>
  );
}
