import React from 'react';
import { Clock, TrendingUp, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';

interface FocusBentoCardProps {
  focusMinutesToday: number;
}

export const FocusBentoCard: React.FC<FocusBentoCardProps> = ({ focusMinutesToday }) => {
  const focusHours = (focusMinutesToday / 60).toFixed(1);
  const goalHours = 4.0;
  const progressPercent = Math.min(100, Math.round(((focusMinutesToday / 60) / goalHours) * 100));

  // 7-day sparkline sample
  const sparkBars = [3.8, 3.0, 2.6, 5.0, 4.3, 5.0, Number(focusHours)];
  const maxBar = Math.max(5.5, ...sparkBars);

  return (
    <GlassCard 
      tint="dev" 
      cornerOrb 
      cornerPosition="bottom-right"
      watermark={<Clock className="w-36 h-36 text-blue-500/10" />}
      className="p-6 flex flex-col justify-between h-full min-h-[260px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-[12px] font-mono text-[#4D8DFF] font-semibold">
            <Clock className="w-4 h-4" />
            <span>FLOW STATE OUTPUT</span>
          </div>
          <Chip variant="code" pill size="sm">
            Goal {goalHours.toFixed(1)}h
          </Chip>
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-[36px] font-display font-bold text-white num-tabular tracking-tight">
              {focusHours}h
            </span>
            <span className="text-[14px] font-mono text-slate-300">
              / {goalHours.toFixed(1)}h
            </span>
          </div>
          <span className="text-[12px] font-mono font-bold text-[#1FD1F9]">
            {progressPercent}%
          </span>
        </div>

        {/* Chunky 10px Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mt-3 p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4D8DFF] to-[#1FD1F9] transition-all duration-500 shadow-[0_0_12px_rgba(31,209,249,0.7)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mini 7-Bar Sparkline */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-end justify-between gap-1.5">
        <div className="text-[11px] font-mono text-sky-200/70 uppercase">
          7-Day Flow Trend
        </div>
        <div className="flex items-end space-x-1.5 h-10">
          {sparkBars.map((val, i) => (
            <div
              key={i}
              className={`w-3 rounded-t-sm transition-all ${
                i === sparkBars.length - 1
                  ? 'bg-gradient-to-t from-[#4D8DFF] to-[#1FD1F9] shadow-[0_0_8px_rgba(77,141,255,0.8)]'
                  : val >= 4.0
                  ? 'bg-[#4D8DFF]/80'
                  : 'bg-white/20'
              }`}
              style={{ height: `${Math.max(15, (val / maxBar) * 100)}%` }}
              title={`${val.toFixed(1)} hrs`}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
};
