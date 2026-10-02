import React from 'react';

export interface SegmentOption<T extends string> {
  value?: T;
  id?: T;
  label: string;
  badge?: number;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  layoutId?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  const containerHeight = size === 'sm' ? 'h-[32px] p-0.5' : 'h-[36px] p-1';
  const textClass = size === 'sm' ? 'text-[13px]' : 'text-[14px]';

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-[var(--fill)] rounded-[10px] select-none ${containerHeight} ${className}`}
    >
      {options.map((opt) => {
        const itemVal = (opt.value !== undefined ? opt.value : opt.id) as T;
        const isSelected = itemVal === value;
        return (
          <button
            key={itemVal}
            role="tab"
            aria-selected={isSelected}
            type="button"
            onClick={() => onChange(itemVal)}
            className={`relative flex items-center justify-center px-3 py-1 font-medium transition-all duration-150 ease-[var(--spring)] rounded-[8px] ${textClass} ${
              isSelected
                ? 'bg-[var(--surface)] dark:bg-[var(--surface-2)] text-[var(--label)] shadow-[0_1px_3px_rgba(60,40,15,0.08),0_1px_2px_rgba(60,40,15,0.05)] dark:shadow-none font-semibold'
                : 'text-[var(--label-2)] hover:text-[var(--label)]'
            }`}
          >
            <span>{opt.label}</span>
            {typeof opt.badge === 'number' && (
              <span
                className={`ml-1.5 text-[11px] px-1.5 py-0.2 rounded-full tnum ${
                  isSelected ? 'bg-[var(--fill)] text-[var(--label)]' : 'bg-[var(--fill-secondary)] text-[var(--label-3)]'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
