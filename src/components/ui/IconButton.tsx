import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'accent' | 'ghost';
  size?: 'sm' | 'md';
  active?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'default',
  size = 'md',
  active = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';

  let variantStyles = 'bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-secondary)]';
  if (variant === 'accent') {
    variantStyles = 'bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-95';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent text-[var(--label-2)] hover:text-[var(--label)] hover:bg-[var(--fill)]';
  } else if (active) {
    variantStyles = 'bg-[var(--accent-tint)] text-[var(--accent)]';
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center rounded-[var(--radius-control)] transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${sizeClasses} ${variantStyles} ${className}`}
      {...props}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {icon}
      </span>
    </button>
  );
};
