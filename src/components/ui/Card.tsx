import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'card' | 'hero';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'card',
  className = '',
  ...props
}) => {
  const radiusClass = variant === 'hero' ? 'rounded-[var(--radius-hero)]' : 'rounded-[var(--radius-card)]';

  return (
    <div
      className={`bg-[var(--surface)] text-[var(--label)] ${radiusClass} border border-[var(--separator)] shadow-[0_1px_3px_rgba(60,40,15,0.04),0_6px_24px_rgba(60,40,15,0.03)] dark:shadow-none transition-all duration-200 hover:border-[var(--hairline)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
