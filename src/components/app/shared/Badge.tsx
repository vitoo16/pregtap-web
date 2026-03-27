type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#E7F7EF] text-[#1F7A4D]',
  error: 'bg-[#FFF1F1] text-[#C44545]',
  warning: 'bg-[#FFF3E0] text-[#E65100]',
  info: 'bg-[#E3F2FD] text-[#1565C0]',
  default: 'bg-[#F5F5F5] text-[#757575]',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
