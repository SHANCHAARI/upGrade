import React from 'react';
import { Flame } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';

interface StreakBentoCardProps {
  currentStreak: number;
  bestStreak: number;
}

export const StreakBentoCard: React.FC<StreakBentoCardProps> = ({
  currentStreak,
  bestStreak,
}) => {
  // 7-day strip status
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = 4; // Friday

  return (
    <GlassCard 
      tint="streak" 
      cornerOrb 
      cornerPosition="top-right"
      watermark={<Flame className="w-40 h-40 text-amber-500/10" />}
      className="p-6 sm:p-7 flex flex-col justify-between h-full min-h-[310px]"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[12px] font-mono text-[#FFC93C] font-semibold">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
            <span>UNBROKEN STREAK</span>
          </div>
          <Chip variant="warn" pill size="sm">
            Best {bestStreak}d
          </Chip>
        </div>

        {/* 48px Display Numeral */}
        <div className="mt-4">
          <div className="text-[48px] sm:text-[52px] font-display font-extrabold text-white leading-none num-tabular tracking-tight flex items-baseline gap-2">
            <span>{currentStreak}</span>
            <span className="text-[16px] font-mono font-bold text-[#FFC93C] uppercase tracking-wider">
              DAYS
            </span>
          </div>
          <p className="text-[13px] text-amber-200/80 mt-2 font-medium">
            🔥 You are in the top 3% of unbroken daily streaks.
          </p>
        </div>
      </div>

      {/* 7-Day Week Strip */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="text-[11px] font-mono text-amber-200/60 uppercase tracking-wider mb-2">
          Last 7 Days Momentum
        </div>
        <div className="flex items-center justify-between gap-1.5">
          {days.map((day, idx) => {
            const isToday = idx === todayIdx;
            const isDone = idx < todayIdx;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-[var(--radius-control)] flex items-center justify-center transition-all ${
                    isToday
                      ? 'border-2 border-[#FFC93C] bg-amber-500/20 shadow-[0_0_12px_rgba(255,201,60,0.6)] animate-pulse'
                      : isDone
                      ? 'bg-gradient-to-tr from-[#FF8A3D] to-[#FFC93C] text-[#0F0A1F] shadow-[0_0_8px_rgba(255,138,61,0.5)]'
                      : 'bg-white/5 border border-white/10 text-slate-500'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${isDone ? 'fill-current' : isToday ? 'fill-[#FFC93C]' : 'opacity-40'}`} />
                </div>
                <span className={`text-[10px] font-mono font-semibold ${isToday ? 'text-[#FFC93C]' : 'text-slate-400'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};
