import React from 'react';

interface ListGroupProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ListGroup: React.FC<ListGroupProps> = ({
  children,
  header,
  footer,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {header && (
        <div className="px-4 pb-2 text-[13px] font-medium text-[var(--label-2)]">
          {header}
        </div>
      )}
      <div className="bg-[var(--surface)] rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)] transition-colors duration-200">
        {children}
      </div>
      {footer && (
        <div className="px-4 pt-2 text-[13px] text-[var(--label-3)]">
          {footer}
        </div>
      )}
    </div>
  );
};
