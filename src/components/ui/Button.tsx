import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tinted' | 'plain';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  let variantStyles = '';
  if (variant === 'filled') {
    variantStyles = 'bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-95 active:opacity-90';
  } else if (variant === 'tinted') {
    variantStyles = 'bg-[var(--accent-tint)] text-[var(--accent)] hover:bg-[var(--accent-tint-strong)]';
  } else if (variant === 'plain') {
    variantStyles = 'bg-transparent text-[var(--accent)] hover:opacity-80';
  }

  let sizeStyles = '';
  if (size === 'sm') {
    sizeStyles = 'h-[32px] px-3 text-[14px] rounded-[var(--radius-control)]';
  } else if (size === 'md') {
    sizeStyles = 'h-[44px] px-5 text-[17px] font-medium rounded-[var(--radius-control)]';
  } else if (size === 'lg') {
    sizeStyles = 'h-[50px] px-6 text-[17px] font-medium rounded-[var(--radius-control)]';
  }

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 ease-[var(--spring)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent-tint-strong)] ${variantStyles} ${sizeStyles} ${widthStyle} ${disabledStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
