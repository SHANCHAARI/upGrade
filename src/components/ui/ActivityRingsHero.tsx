import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Habit } from '../../types';

interface ActivityRingsHeroProps {
  consistencyPercentage: number;
  completedRituals: number;
  totalRituals: number;
  focusMinutesToday: number;
  focusGoalMinutes?: number;
  habits?: Habit[];
  selectedDate?: string;
}

export const ActivityRingsHero: React.FC<ActivityRingsHeroProps> = ({
  consistencyPercentage,
  completedRituals,
  totalRituals,
  focusMinutesToday,
  focusGoalMinutes = 240, // 4 hours
  habits = [],
  selectedDate,
}) => {
  // Compute category completion ratios for 5 rings
  const getCategoryRatio = (category: string) => {
    const catHabits = habits.filter((h) => h.category === category);
    if (catHabits.length === 0) return 0.5; // fallback
    const done = catHabits.filter((h) => selectedDate ? h.completedDates.includes(selectedDate) : false).length;
    return Math.min(1, Math.max(0, done / catHabits.length));
  };

  const devRatio = getCategoryRatio('dev');
  const healthRatio = getCategoryRatio('health');
  const focusRatio = getCategoryRatio('focus');
  const growthRatio = getCategoryRatio('growth');
  const mindsetRatio = getCategoryRatio('mindset');

  const focusHours = (focusMinutesToday / 60).toFixed(1);
  const focusGoalHours = (focusGoalMinutes / 60).toFixed(0);

  // SVG Ring Dimensions (5 Concentric Rings)
  const size = 200;
  const center = size / 2;
  const strokeWidth = 8.5;

  const rings = [
    { id: 'dev', color: 'var(--cat-dev)', ratio: devRatio, r: 84 },
    { id: 'health', color: 'var(--cat-health)', ratio: healthRatio, r: 71 },
    { id: 'focus', color: 'var(--cat-focus)', ratio: focusRatio, r: 58 },
    { id: 'growth', color: 'var(--cat-growth)', ratio: growthRatio, r: 45 },
    { id: 'mindset', color: 'var(--cat-mindset)', ratio: mindsetRatio, r: 32 },
  ];

  return (
    <Card variant="hero" className="p-6 sm:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        
        {/* Left: 5 Concentric Apple Fitness Category Rings */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
            role="img"
            aria-label={`Activity rings: Consistency ${consistencyPercentage}%, Rituals ${completedRituals} of ${totalRituals}, Focus ${focusHours} of ${focusGoalHours} hours`}
          >
            {rings.map((ring, idx) => {
              const circumference = 2 * Math.PI * ring.r;
              const offset = circumference - Math.max(0.04, ring.ratio) * circumference;

              return (
                <g key={ring.id}>
                  {/* Background Track: Exactly 14% Opacity */}
                  <circle
                    cx={center}
                    cy={center}
                    r={ring.r}
                    stroke={ring.color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeOpacity="0.14"
                  />
                  {/* Progress Arc */}
                  <motion.circle
                    cx={center}
                    cy={center}
                    r={ring.r}
                    stroke={ring.color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{
                      duration: 1.1 + idx * 0.1,
                      ease: [0.32, 0.72, 0, 1],
                      delay: idx * 0.05,
                    }}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Three Stacked Stats in Apple Fitness Style */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--separator)]">
          
          {/* Consistency Stat */}
          <div className="pt-4 sm:pt-0 sm:px-4 first:pt-0 first:px-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--cat-health)] shrink-0" />
              <span className="text-[15px] font-medium text-[var(--cat-health)]">
                Consistency
              </span>
            </div>
            <div className="text-[34px] font-semibold tracking-tight text-[var(--label)] tnum leading-tight">
              {consistencyPercentage}%
            </div>
            <p className="text-[13px] text-[var(--label-2)] mt-1">
              Daily compounding pace
            </p>
          </div>

          {/* Rituals Stat */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--cat-focus)] shrink-0" />
              <span className="text-[15px] font-medium text-[var(--cat-focus)]">
                Rituals
              </span>
            </div>
            <div className="text-[34px] font-semibold tracking-tight text-[var(--label)] tnum leading-tight">
              {completedRituals} of {totalRituals}
            </div>
            <p className="text-[13px] text-[var(--label-2)] mt-1">
              Habits fulfilled today
            </p>
          </div>

          {/* Focus Stat */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shrink-0" />
              <span className="text-[15px] font-medium text-[var(--accent)]">
                Focus
              </span>
            </div>
            <div className="text-[34px] font-semibold tracking-tight text-[var(--label)] tnum leading-tight">
              {focusHours} of {focusGoalHours} hr
            </div>
            <p className="text-[13px] text-[var(--label-2)] mt-1">
              Deep work output
            </p>
          </div>

        </div>

      </div>
    </Card>
  );
};
