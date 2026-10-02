import React from 'react';

export type ChipVariant = 'default' | 'accent' | 'warn' | 'danger' | 'info' | 'code' | 'health' | 'focus' | 'mindset' | 'growth';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: ChipVariant;
  pill?: boolean;
  mono?: boolean;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  pill = false,
  mono = false,
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const variantStyles: Record<ChipVariant, string> = {
    default: 'bg-[var(--glass-strong)] text-slate-300 border-[var(--border-subtle)]',
    accent: 'bg-[var(--accent-surface)] text-[var(--accent-start)] border-[var(--accent-border)]',
    warn: 'bg-[var(--color-warn-surface)] text-[var(--color-warn)] border-[var(--color-warn-border)]',
    danger: 'bg-[var(--color-danger-surface)] text-[var(--color-danger)] border-rose-500/30',
    info: 'bg-[var(--color-info-surface)] text-[var(--color-info)] border-sky-500/30',
    code: 'bg-sky-500/10 text-[var(--cat-code)] border-sky-500/25',
    health: 'bg-amber-500/10 text-[var(--cat-health)] border-amber-500/25',
    focus: 'bg-emerald-500/10 text-[var(--cat-focus)] border-emerald-500/25',
    mindset: 'bg-purple-500/10 text-[var(--cat-mindset)] border-purple-500/25',
    growth: 'bg-pink-500/10 text-[var(--cat-growth)] border-pink-500/25',
  };

  const sizeStyles = size === 'sm' 
    ? 'text-[11px] py-0.5 px-2 gap-1' 
    : 'text-[12px] py-1 px-2.5 gap-1.5';

  const radiusStyle = pill ? 'rounded-[var(--radius-pill)]' : 'rounded-[var(--radius-chip)]';
  const fontStyle = mono ? 'font-mono uppercase tracking-[0.06em]' : 'font-medium';

  return (
    <span
      className={`inline-flex items-center border whitespace-nowrap num-tabular ${sizeStyles} ${radiusStyle} ${fontStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
