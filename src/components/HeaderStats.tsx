import React from 'react';
import { Flame, CheckCircle2, TrendingUp, Clock, Zap } from 'lucide-react';
import { UserStats } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Chip } from './ui/Chip';

interface HeaderStatsProps {
  stats: UserStats;
  completedCount: number;
  totalCount: number;
  focusMinutesToday: number;
  consistencyPercentage: number;
  isToday: boolean;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  stats,
  completedCount,
  totalCount,
  focusMinutesToday,
  consistencyPercentage,
  isToday,
}) => {
  // Format focus hours (e.g. "1.5h", "3.0h")
  const focusHours = (focusMinutesToday / 60).toFixed(1);

  // SVG circular progress ring
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (consistencyPercentage / 100) * circumference;

  // Level XP progress
  const xpPercent = Math.min(100, Math.round((stats.currentXp / stats.xpToNextLevel) * 100));

  return (
    <section className="mb-6" aria-label="Daily Overview Statistics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Daily Consistency */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-start)]" />
              {isToday ? 'Today Consistency' : 'Date Consistency'}
            </span>
            <Chip variant={consistencyPercentage === 100 ? 'accent' : 'default'} pill size="sm">
              {completedCount}/{totalCount}
            </Chip>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-[32px] font-semibold tracking-[-0.02em] text-white num-tabular leading-none">
                {consistencyPercentage}%
              </span>
            </div>

            {/* Circular Ring Progress */}
            <div className="relative w-16 h-16 flex items-center justify-center -my-2 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="text-white/5"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="var(--accent-start)"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-[12px] font-semibold font-mono text-[var(--accent-start)] num-tabular">
                {completedCount}
              </span>
            </div>
          </div>

          <div className="text-[12px] text-slate-400 font-medium">
            {consistencyPercentage === 100 
              ? '🌟 Perfect completion achieved' 
              : consistencyPercentage >= 70 
              ? '⚡ Strong baseline momentum' 
              : '🎯 Rituals pending completion'}
          </div>
        </GlassCard>

        {/* Card 2: Active Streak */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-mono flex items-center gap-1.5 text-[var(--color-warn)]">
              <Flame className="w-3.5 h-3.5 fill-[var(--color-warn)]" />
              Active Streak
            </span>
            <Chip variant="warn" pill size="sm">
              Best {stats.bestStreak}d
            </Chip>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-[32px] font-semibold tracking-[-0.02em] text-white num-tabular leading-none">
                {stats.currentStreak}
              </span>
              <span className="label-mono text-slate-400">days</span>
            </div>

            <div className="w-9 h-9 rounded-[var(--radius-control)] bg-[var(--color-warn-surface)] border border-[var(--color-warn-border)] flex items-center justify-center text-[var(--color-warn)]">
              <Flame className="w-5 h-5 fill-current" />
            </div>
          </div>

          {/* Mini 7-day sparkline blocks */}
          <div className="flex items-center space-x-1.5 pt-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < (stats.currentStreak % 7 || 7)
                    ? 'bg-[var(--color-warn)] shadow-[0_0_6px_var(--color-warn)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </GlassCard>

        {/* Card 3: Deep Work / Focus Hours */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-mono flex items-center gap-1.5 text-[var(--cat-code)]">
              <Clock className="w-3.5 h-3.5" />
              Focus & Dev Time
            </span>
            <span className="label-mono text-slate-400">Target 4.0h</span>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-[32px] font-semibold tracking-[-0.02em] text-white num-tabular leading-none">
                {focusHours}h
              </span>
              <span className="label-mono text-slate-400">logged</span>
            </div>

            <div className="w-9 h-9 rounded-[var(--radius-control)] bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Progress bar to 4.0h goal */}
          <div className="space-y-1">
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (focusMinutesToday / 240) * 100)}%` }}
              />
            </div>
          </div>
        </GlassCard>

        {/* Card 4: Level Mastery & XP */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-mono flex items-center gap-1.5 text-[var(--cat-mindset)]">
              <Zap className="w-3.5 h-3.5" />
              Level Progression
            </span>
            <span className="label-mono text-slate-400">{stats.currentXp}/{stats.xpToNextLevel} XP</span>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-[32px] font-semibold tracking-[-0.02em] text-white num-tabular leading-none">
                Lv. {stats.level}
              </span>
              <span className="text-[11px] font-mono text-[var(--cat-mindset)] uppercase tracking-wider">Master</span>
            </div>

            <div className="w-9 h-9 rounded-[var(--radius-control)] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[var(--cat-mindset)] to-[var(--accent-start)] h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </GlassCard>

      </div>
    </section>
  );
};
