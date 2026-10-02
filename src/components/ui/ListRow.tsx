import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Check, ChevronRight, Minus, Plus, Shield } from 'lucide-react';
import { HabitCategory } from '../../types';

interface ListRowProps {
  id: string;
  title: string;
  subtitle?: string;
  category: HabitCategory;
  categoryColor: string;
  categoryBg: string;
  categoryIcon: React.ReactNode;
  isCompleted: boolean;
  streak: number;
  shields?: number;
  isRestDay?: boolean;
  isRecovered?: boolean;
  isShielded?: boolean;
  isLast?: boolean;
  onToggle: () => void;
  // Progress/Numeric support
  isNumeric?: boolean;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  onUpdateNumeric?: (val: number) => void;
  onEdit?: () => void;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  categoryColor,
  categoryBg,
  categoryIcon,
  isCompleted,
  streak,
  shields = 0,
  isRestDay = false,
  isRecovered = false,
  isShielded = false,
  isLast = false,
  onToggle,
  isNumeric = false,
  currentValue = 0,
  targetValue = 1,
  unit = '',
  onUpdateNumeric,
  onEdit,
}) => {
  const progressRatio = isNumeric ? Math.min(1, Math.max(0, currentValue / targetValue)) : (isCompleted ? 1 : 0);

  return (
    <div className="relative group transition-colors duration-150 hover:bg-[var(--fill-tertiary)] active:bg-[var(--fill-secondary)]">
      <div className="flex items-center px-4 py-3 sm:py-3.5 gap-3.5">
        
        {/* 28px Circular Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Mark ${title} as ${isCompleted ? 'incomplete' : 'complete'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ease-[var(--spring)] active:scale-90 ${
            isCompleted
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : isRestDay
              ? 'border-[1.5px] border-dashed border-[var(--separator)] bg-transparent opacity-60'
              : 'border-[2px] border-[var(--separator)] bg-transparent hover:border-[var(--label-3)]'
          }`}
        >
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </motion.div>
          )}
        </button>

        {/* Small Tinted Category Icon (Squircle) */}
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: categoryBg, color: categoryColor }}
          aria-hidden="true"
        >
          {categoryIcon}
        </div>

        {/* Title, Subtitle, and Optional Slim 4px Bar */}
        <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={onEdit || onToggle}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-[17px] font-medium leading-snug tracking-[-0.01em] transition-opacity duration-200 ${
                isCompleted
                  ? 'text-[var(--label)] line-through decoration-[var(--label-3)] decoration-1 opacity-70'
                  : 'text-[var(--label)]'
              }`}
            >
              {title}
            </span>

            {/* Badges for Rest Day, Recovered, Shielded */}
            {isRestDay && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--fill)] text-[var(--label-2)] border border-[var(--separator)]">
                Rest day
              </span>
            )}
            {isRecovered && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Recovered
              </span>
            )}
            {isShielded && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 fill-current" />
                Protected
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-[15px] text-[var(--label-2)] mt-0.5 line-clamp-1 leading-normal">
              {subtitle}
            </p>
          )}

          {/* Slim 4px Bar for Numeric / Quantity Rituals */}
          {isNumeric && (
            <div className="mt-2 flex items-center gap-2 max-w-[200px]">
              <div className="flex-1 h-1 bg-[var(--fill)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-[var(--spring)]"
                  style={{
                    width: `${Math.round(progressRatio * 100)}%`,
                    backgroundColor: categoryColor,
                  }}
                />
              </div>
              <span className="text-[12px] text-[var(--label-2)] tnum shrink-0">
                {currentValue} / {targetValue} {unit}
              </span>
            </div>
          )}
        </div>

        {/* Trailing Stepper (for numeric) or Streak Badge & Shield + Chevron */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isNumeric && onUpdateNumeric ? (
            <div className="flex items-center bg-[var(--fill)] rounded-[10px] p-0.5">
              <button
                type="button"
                aria-label="Decrease target"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateNumeric(Math.max(0, Number((currentValue - (targetValue >= 10 ? 1 : 0.5)).toFixed(1))));
                }}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[var(--label)] hover:bg-[var(--surface)] transition active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[14px] font-medium tnum text-[var(--label)] min-w-[32px] text-center">
                {currentValue}
              </span>
              <button
                type="button"
                aria-label="Increase target"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateNumeric(Number((currentValue + (targetValue >= 10 ? 1 : 0.5)).toFixed(1)));
                }}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-[var(--label)] hover:bg-[var(--surface)] transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1 text-[var(--label-3)] text-[14px] font-medium tnum">
                  <Flame className="w-3.5 h-3.5 text-[var(--cat-growth)] fill-[var(--cat-growth)]" />
                  <span>{streak}</span>
                </div>
              )}
              {shields > 0 && (
                <div
                  className="flex items-center gap-0.5 text-[var(--accent)] text-[12px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10"
                  title={`${shields} streak shield${shields > 1 ? 's' : ''} stored`}
                >
                  <Shield className="w-3 h-3 fill-current" />
                  <span className="tnum">{shields}</span>
                </div>
              )}
            </div>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Details for ${title}`}
              className="text-[var(--label-3)] hover:text-[var(--label)] p-1 transition"
            >
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          )}
        </div>
      </div>

      {/* Hairline Separator (Indented to align with text) */}
      {!isLast && (
        <div className="ml-[60px] h-[0.5px] bg-[var(--separator)]" />
      )}
    </div>
  );
};
