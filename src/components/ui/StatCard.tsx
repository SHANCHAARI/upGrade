import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  caption?: string;
  progressPercent?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  caption,
  progressPercent,
}) => {
  return (
    <Card className="p-5 flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <span className="text-[13px] font-medium text-[var(--label-2)]">
          {label}
        </span>
      </div>

      <div className="text-[34px] font-semibold tracking-tight text-[var(--label)] tnum leading-none mb-1.5">
        {value}
      </div>

      {typeof progressPercent === 'number' && (
        <div className="w-full h-1 bg-[var(--fill)] rounded-full overflow-hidden my-2">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}

      {caption && (
        <p className="text-[13px] text-[var(--label-3)]">
          {caption}
        </p>
      )}
    </Card>
  );
};
