import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
} from 'lucide-react';
import { DayActivity, Habit } from '../types';
import { formatDateKey } from '../utils/storage';
import { Card } from './ui/Card';

interface ConsistencyHeatmapProps {
  history: Record<string, DayActivity>;
  habits: Habit[];
  onSelectDate: (dateKey: string) => void;
  selectedDate: string;
}

type PaletteMode = 'green' | 'terracotta' | 'orange';

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  history,
  habits,
  onSelectDate,
  selectedDate,
}) => {
  const [palette, setPalette] = useState<PaletteMode>('green');
  const [hoveredDay, setHoveredDay] = useState<{
    dateKey: string;
    activity?: DayActivity;
    x: number;
    y: number;
  } | null>(null);

  // Generate 52 weeks (364/365 days)
  const { weeks, monthLabels, stats } = useMemo(() => {
    const today = new Date();
    const totalDays = 52 * 7;
    const days: { dateKey: string; date: Date; activity?: DayActivity }[] = [];

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + (6 - today.getDay()));

    let totalActiveDays = 0;
    let perfectDays = 0;
    let totalConsistencySum = 0;
    let recordedDaysCount = 0;

    for (let i = 0; i < totalDays; i++) {
      const cur = new Date(startDate);
      cur.setDate(startDate.getDate() + i);
      const key = formatDateKey(cur);
      const act = history[key];

      if (act) {
        recordedDaysCount++;
        totalConsistencySum += act.consistencyPercentage;
        if (act.consistencyPercentage > 0) totalActiveDays++;
        if (act.consistencyPercentage === 100) perfectDays++;
      }

      days.push({
        dateKey: key,
        date: cur,
        activity: act,
      });
    }

    const weekChunks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekChunks.push(days.slice(i, i + 7));
    }

    const months: { name: string; colIndex: number }[] = [];
    let lastMonth = -1;
    weekChunks.forEach((week, wIdx) => {
      const firstDay = week[0].date;
      const m = firstDay.getMonth();
      if (m !== lastMonth && firstDay.getDate() <= 7) {
        months.push({
          name: firstDay.toLocaleString('en-US', { month: 'short' }),
          colIndex: wIdx,
        });
        lastMonth = m;
      }
    });

    const avgConsistency = recordedDaysCount > 0 ? Math.round(totalConsistencySum / recordedDaysCount) : 0;

    return {
      weeks: weekChunks,
      monthLabels: months,
      stats: {
        totalActiveDays,
        perfectDays,
        avgConsistency,
      },
    };
  }, [history]);

  // Color generator based on consistency rate (Zero blue!)
  const getCellColor = (percentage: number | undefined) => {
    if (percentage === undefined || percentage === 0) {
      return 'bg-[var(--fill)] border-[var(--separator)]';
    }

    if (palette === 'green') {
      if (percentage < 25) return 'bg-[#2FA84F]/25 border-[#2FA84F]/30';
      if (percentage < 50) return 'bg-[#2FA84F]/50 border-[#2FA84F]/60';
      if (percentage < 75) return 'bg-[#2FA84F]/75 border-[#2FA84F]/85';
      return 'bg-[#2FA84F] border-[#2FA84F] text-white';
    }

    if (palette === 'terracotta') {
      if (percentage < 25) return 'bg-[#C2502A]/25 border-[#C2502A]/30';
      if (percentage < 50) return 'bg-[#C2502A]/50 border-[#C2502A]/60';
      if (percentage < 75) return 'bg-[#C2502A]/75 border-[#C2502A]/85';
      return 'bg-[#C2502A] border-[#C2502A] text-white';
    }

    // orange
    if (percentage < 25) return 'bg-[#E88A00]/25 border-[#E88A00]/30';
    if (percentage < 50) return 'bg-[#E88A00]/50 border-[#E88A00]/60';
    if (percentage < 75) return 'bg-[#E88A00]/75 border-[#E88A00]/85';
    return 'bg-[#E88A00] border-[#E88A00] text-white';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="pt-2">
        <h1 className="text-page-title text-[var(--label)]">
          Year
        </h1>
        <p className="text-[15px] text-[var(--label-2)] mt-0.5">
          365-day consistency heatmap of daily habit execution
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--cat-focus-bg)] text-[var(--cat-focus)] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[13px] text-[var(--label-2)] font-medium">Active Days</div>
            <div className="text-[20px] font-semibold text-[var(--label)] tnum">{stats.totalActiveDays} / 365</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--cat-growth-bg)] text-[var(--cat-growth)] flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-[13px] text-[var(--label-2)] font-medium">100% Days</div>
            <div className="text-[20px] font-semibold text-[var(--label)] tnum">{stats.perfectDays} days</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[13px] text-[var(--label-2)] font-medium">Average Pace</div>
            <div className="text-[20px] font-semibold text-[var(--label)] tnum">{stats.avgConsistency}%</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--cat-dev-bg)] text-[var(--cat-dev)] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[13px] text-[var(--label-2)] font-medium">Active Rituals</div>
            <div className="text-[20px] font-semibold text-[var(--label)] tnum">{habits.length} Rituals</div>
          </div>
        </Card>
      </div>

      {/* Main Heatmap Matrix */}
      <Card className="p-6 sm:p-7">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--separator)] gap-3">
          <div>
            <h3 className="text-[17px] font-semibold text-[var(--label)]">
              52-Week Trajectory Matrix
            </h3>
            <p className="text-[13px] text-[var(--label-2)] mt-0.5">
              Click any date to inspect its rituals.
            </p>
          </div>

          {/* Palette Selector */}
          <div className="flex items-center gap-1 bg-[var(--fill)] p-1 rounded-[10px]">
            <button
              type="button"
              onClick={() => setPalette('green')}
              className={`px-3 py-1 rounded-[8px] text-[13px] font-medium transition ${
                palette === 'green' ? 'bg-[var(--surface)] dark:bg-[var(--surface-2)] text-[var(--label)] shadow-xs' : 'text-[var(--label-2)]'
              }`}
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => setPalette('terracotta')}
              className={`px-3 py-1 rounded-[8px] text-[13px] font-medium transition ${
                palette === 'terracotta' ? 'bg-[var(--surface)] dark:bg-[var(--surface-2)] text-[var(--label)] shadow-xs' : 'text-[var(--label-2)]'
              }`}
            >
              Terracotta
            </button>
            <button
              type="button"
              onClick={() => setPalette('orange')}
              className={`px-3 py-1 rounded-[8px] text-[13px] font-medium transition ${
                palette === 'orange' ? 'bg-[var(--surface)] dark:bg-[var(--surface-2)] text-[var(--label)] shadow-xs' : 'text-[var(--label-2)]'
              }`}
            >
              Growth
            </button>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="pt-6 overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[820px]">
            
            {/* Month Header Row */}
            <div className="flex text-[11px] text-[var(--label-3)] mb-2 pl-7 relative h-4 select-none">
              {monthLabels.map((m) => (
                <span
                  key={`${m.name}-${m.colIndex}`}
                  className="absolute"
                  style={{ left: `${m.colIndex * 15 + 28}px` }}
                >
                  {m.name}
                </span>
              ))}
            </div>

            {/* Grid Days */}
            <div className="flex items-start gap-1">
              
              {/* Day of Week Labels */}
              <div className="flex flex-col justify-between text-[10px] text-[var(--label-3)] pr-2 py-0.5 select-none h-[100px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* 52 Columns of 7 Rows */}
              <div className="flex items-center gap-[3px]">
                {weeks.map((week, wIdx) => (
                  <div key={`w-${wIdx}`} className="flex flex-col gap-[3px]">
                    {week.map((d) => {
                      const isSelected = d.dateKey === selectedDate;
                      const pct = d.activity?.consistencyPercentage;
                      const cellColor = getCellColor(pct);

                      return (
                        <button
                          key={d.dateKey}
                          type="button"
                          onClick={() => onSelectDate(d.dateKey)}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              dateKey: d.dateKey,
                              activity: d.activity,
                              x: rect.x + rect.width / 2,
                              y: rect.y - 8,
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          aria-label={`${d.dateKey}: ${pct ?? 0}% completed`}
                          className={`w-[11px] h-[11px] rounded-[2.5px] border transition-transform hover:scale-130 ${cellColor} ${
                            isSelected ? 'ring-2 ring-[var(--accent)] ring-offset-1 z-10' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--separator)] text-[12px] text-[var(--label-3)]">
              <div>
                <span>Selected: </span>
                <span className="font-semibold text-[var(--label)] tnum">{selectedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--fill)]" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#2FA84F]/30" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#2FA84F]/60" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#2FA84F]" />
                <span>More</span>
              </div>
            </div>

          </div>
        </div>

      </Card>

    </div>
  );
};
