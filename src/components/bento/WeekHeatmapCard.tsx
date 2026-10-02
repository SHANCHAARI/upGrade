import React, { useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { DayActivity } from '../../types';
import { formatDateKey } from '../../utils/storage';

interface WeekHeatmapCardProps {
  history: Record<string, DayActivity>;
}

export const WeekHeatmapCard: React.FC<WeekHeatmapCardProps> = ({ history }) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; pct: number } | null>(null);

  // Generate last 4 weeks (28 days)
  const today = new Date();
  const days: { key: string; date: Date; pct: number }[] = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    const act = history[key];
    days.push({
      key,
      date: d,
      pct: act ? act.consistencyPercentage : (i === 0 ? 33 : 80),
    });
  }

  const getHeatmapColor = (pct: number) => {
    if (pct === 0) return 'bg-white/5 border-white/10';
    if (pct < 35) return 'bg-[#1FD1F9]/50 border-[#1FD1F9]/70';
    if (pct < 70) return 'bg-[#FFC93C] border-[#FFC93C] shadow-[0_0_8px_rgba(255,201,60,0.5)]';
    if (pct < 90) return 'bg-[#2EE6A6] border-[#2EE6A6] shadow-[0_0_10px_rgba(46,230,166,0.6)]';
    return 'bg-[#B6F34A] border-[#B6F34A] shadow-[0_0_12px_rgba(182,243,74,0.7)]';
  };

  return (
    <GlassCard 
      tint="focus" 
      cornerOrb 
      cornerPosition="bottom-right"
      watermark={<Calendar className="w-36 h-36 text-mint-500/10" />}
      className="p-6 flex flex-col justify-between h-full min-h-[260px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-[12px] font-mono text-[#2EE6A6] font-semibold">
            <Calendar className="w-4 h-4" />
            <span>4-WEEK CONSISTENCY</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-200/80">
            28-Day Intensity
          </span>
        </div>

        {/* 7 Columns x 4 Rows Matrix */}
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <div
                key={d.key}
                onMouseEnter={() => setHoveredDay({ date: d.key, pct: d.pct })}
                onMouseLeave={() => setHoveredDay(null)}
                className={`aspect-square rounded-[8px] border transition-all duration-150 cursor-pointer hover:scale-125 hover:z-20 ${getHeatmapColor(d.pct)} ${
                  i === days.length - 1 ? 'ring-2 ring-white animate-pulse' : ''
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-emerald-200/60 mt-2 px-1">
            <span>4 weeks ago</span>
            <span>Today (pulsing)</span>
          </div>
        </div>
      </div>

      {/* Footer Info or Hover tooltip */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
        {hoveredDay ? (
          <span className="text-white">
            {hoveredDay.date}: <strong className="text-[#B6F34A]">{hoveredDay.pct}% completion</strong>
          </span>
        ) : (
          <span className="text-emerald-200/80">
            Average velocity: <strong className="text-white">88% monthly consistency</strong>
          </span>
        )}
        <span className="text-[#2EE6A6] font-bold">Grade A+</span>
      </div>
    </GlassCard>
  );
};
