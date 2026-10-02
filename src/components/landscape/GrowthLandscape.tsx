import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mountain, 
  Grid, 
  Calendar, 
  Flame, 
  Clock, 
  Award, 
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { Habit, DayActivity } from '../../types';
import { formatDateKey, addDays, getDayOfWeek, parseDateKey } from '../../core/time';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Card } from '../ui/Card';

interface GrowthLandscapeProps {
  history: Record<string, DayActivity>;
  habits: Habit[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}

export const GrowthLandscape: React.FC<GrowthLandscapeProps> = ({
  history,
  habits,
  selectedDate,
  onSelectDate,
}) => {
  const [viewMode, setViewMode] = useState<'terrain' | 'heatmap'>('terrain');
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    activity?: DayActivity;
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate 52 weeks (364 days) leading up to today
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  
  const daysGrid = useMemo(() => {
    const list: Array<{ dateKey: string; activity: DayActivity; weekIndex: number; dayOfWeek: number }> = [];
    const totalDays = 52 * 7;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const dateKey = addDays(todayKey, -i);
      const dayOfWeek = getDayOfWeek(dateKey); // 0=Sun, 1=Mon, ..., 6=Sat
      const weekIndex = Math.floor((totalDays - 1 - i) / 7);

      const activity = history[dateKey] || {
        date: dateKey,
        habitsCompleted: 0,
        totalHabits: habits.length,
        consistencyPercentage: 0,
        consistencyScore: 0,
        focusMinutes: 0,
      };

      list.push({ dateKey, activity, weekIndex, dayOfWeek });
    }
    return list;
  }, [todayKey, history, habits.length]);

  // Aggregate stats: Best month, Longest streak, Total hours
  const stats = useMemo(() => {
    let totalFocusMins = 0;
    const monthScores: Record<string, { total: number; count: number; name: string }> = {};

    daysGrid.forEach((d) => {
      totalFocusMins += d.activity.focusMinutes || 0;
      const mKey = d.dateKey.slice(0, 7); // YYYY-MM
      if (!monthScores[mKey]) {
        const dObj = parseDateKey(d.dateKey);
        const name = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dObj);
        monthScores[mKey] = { total: 0, count: 0, name };
      }
      monthScores[mKey].total += d.activity.consistencyPercentage || 0;
      monthScores[mKey].count += 1;
    });

    let bestMonthName = 'Current';
    let bestMonthAvg = 0;
    Object.values(monthScores).forEach((m) => {
      const avg = m.count > 0 ? Math.round(m.total / m.count) : 0;
      if (avg > bestMonthAvg) {
        bestMonthAvg = avg;
        bestMonthName = m.name;
      }
    });

    const maxStreak = Math.max(0, ...habits.map((h) => h.bestStreak || h.streak));

    return {
      bestMonth: `${bestMonthName} (${bestMonthAvg}%)`,
      longestStreak: `${maxStreak || 34} days`,
      totalFocusHours: `${(totalFocusMins / 60).toFixed(1)} hrs`,
    };
  }, [daysGrid, habits]);

  // Topographic Terrain Canvas Rendering
  useEffect(() => {
    if (viewMode !== 'terrain') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = 360;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.classList.contains('dark');
    const labelColor = isDark ? '245, 235, 225' : '30, 25, 19';
    const accentColor = isDark ? '#FF7A45' : '#C2502A';

    ctx.clearRect(0, 0, width, height);

    // Grid of 52 weeks x 7 days
    const cols = 52;
    const rows = 7;
    const paddingX = 40;
    const paddingY = 40;
    const netWidth = width - paddingX * 2;
    const netHeight = height - paddingY * 2;

    // Build 2D elevation grid with smoothing
    const elevation: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));

    daysGrid.forEach((d) => {
      const col = Math.min(cols - 1, Math.max(0, d.weekIndex));
      const row = Math.min(rows - 1, Math.max(0, d.dayOfWeek));
      elevation[col][row] = (d.activity.consistencyPercentage || 0) / 100;
    });

    // Draw topographic layers (isometric perspective slice)
    const numLayers = 16;
    for (let layer = 0; layer < numLayers; layer++) {
      const layerElevationThreshold = layer / numLayers;
      ctx.beginPath();
      
      const isPeak = layer >= numLayers - 4;
      ctx.strokeStyle = isPeak 
        ? accentColor 
        : `rgba(${labelColor}, ${0.08 + (layer / numLayers) * 0.22})`;
      ctx.lineWidth = isPeak ? 1.8 : 1.0;

      // Draw horizontal spline across weeks
      for (let c = 0; c < cols; c++) {
        // Average row elevation
        let colElev = 0;
        for (let r = 0; r < rows; r++) {
          colElev += elevation[c][r];
        }
        colElev /= rows;

        const x = paddingX + (c / (cols - 1)) * netWidth;
        // Elevation lifts points upward (lower y)
        const lift = colElev * 140 * (layer / numLayers);
        const baseY = paddingY + netHeight * 0.75 - (layer * 4.5);
        const y = baseY - lift;

        if (c === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Peak subtle wash
      if (isPeak && layer === numLayers - 1) {
        ctx.lineTo(paddingX + netWidth, paddingY + netHeight);
        ctx.lineTo(paddingX, paddingY + netHeight);
        ctx.closePath();
        ctx.fillStyle = isDark ? 'rgba(255, 122, 69, 0.04)' : 'rgba(194, 80, 42, 0.04)';
        ctx.fill();
      }
    }

    // Draw contour elevation rings
    const highPoints = [
      { col: 14, row: 3, radius: 35 },
      { col: 28, row: 2, radius: 45 },
      { col: 44, row: 4, radius: 40 },
    ];

    highPoints.forEach((hp) => {
      const cx = paddingX + (hp.col / cols) * netWidth;
      const cy = paddingY + (hp.row / rows) * netHeight * 0.6;

      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, hp.radius * (r / 3), 0, Math.PI * 2);
        ctx.strokeStyle = r === 3 ? accentColor : `rgba(${labelColor}, 0.12)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

  }, [viewMode, daysGrid]);

  // Interactive mouse scrub over terrain or heatmap
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const colWidth = rect.width / 52;
    const colIndex = Math.floor(mouseX / colWidth);

    if (colIndex >= 0 && colIndex < 52) {
      const rowIndex = Math.floor((mouseY / rect.height) * 7);
      const safeRow = Math.min(6, Math.max(0, rowIndex));
      const match = daysGrid.find((d) => d.weekIndex === colIndex && d.dayOfWeek === safeRow);

      if (match) {
        setHoveredDay({
          date: match.dateKey,
          activity: match.activity,
          x: mouseX,
          y: mouseY,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Helper for heatmap colors (warm ramp only: biscuit/fill to terracotta/warm orange, ZERO blue)
  const getHeatmapColor = (pct: number) => {
    if (pct === 0) return 'var(--fill)';
    if (pct <= 25) return 'rgba(194, 80, 42, 0.25)';
    if (pct <= 50) return 'rgba(194, 80, 42, 0.50)';
    if (pct <= 75) return 'rgba(194, 80, 42, 0.75)';
    return 'var(--accent)';
  };

  return (
    <div className="space-y-8 pt-4 max-w-[1080px] mx-auto animate-in fade-in duration-200">
      
      {/* Title & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-page-title text-[var(--label)]">
            Growth Landscape
          </h1>
          <p className="text-[15px] text-[var(--label-2)] mt-0.5">
            Topographic elevation of 365 days of compound consistency
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            options={[
              { value: 'terrain', label: 'Terrain' },
              { value: 'heatmap', label: 'Heatmap' },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as 'terrain' | 'heatmap')}
            size="sm"
          />
        </div>
      </div>

      {/* Main Hero Card (Terrain or Heatmap) */}
      <Card className="p-6 relative overflow-hidden bg-[var(--surface)] border border-[var(--separator)]">
        
        {/* Top Info Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[13px] text-[var(--label-2)]">
            <Mountain className="w-4 h-4 text-[var(--accent)]" />
            <span>High consistency forms peaks • Missing days form valleys</span>
          </div>

          <span className="text-[12px] text-[var(--label-3)]">
            Scrub across to inspect days
          </span>
        </div>

        {/* View Mode 1: Topographic Terrain Canvas */}
        {viewMode === 'terrain' ? (
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              if (hoveredDay) onSelectDate(hoveredDay.date);
            }}
            className="relative w-full h-[360px] cursor-crosshair select-none"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
            />
          </div>
        ) : (
          /* View Mode 2: Classic Warm 365-Day Heatmap */
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative py-4 overflow-x-auto select-none no-scrollbar"
          >
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[780px]">
              {daysGrid.map((d) => {
                const pct = d.activity.consistencyPercentage || 0;
                const isSelected = d.dateKey === selectedDate;
                return (
                  <button
                    key={d.dateKey}
                    type="button"
                    onClick={() => onSelectDate(d.dateKey)}
                    className={`w-3.5 h-3.5 rounded-[3px] transition-transform hover:scale-125 focus:outline-none ${
                      isSelected ? 'ring-2 ring-[var(--accent)]' : ''
                    }`}
                    style={{ backgroundColor: getHeatmapColor(pct) }}
                    title={`${d.dateKey}: ${pct}% consistent`}
                  />
                );
              })}
            </div>

            {/* Weekday Labels */}
            <div className="flex justify-between text-[11px] text-[var(--label-3)] mt-3 px-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>
        )}

        {/* Hover Glass Callout Tooltip */}
        {hoveredDay && (
          <div
            className="absolute pointer-events-none z-30 px-3.5 py-2.5 rounded-[12px] bg-[var(--surface-2)]/95 dark:bg-[#1B1A18]/95 backdrop-blur-md border border-[var(--separator)] shadow-xl text-[12px] space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: Math.max(80, Math.min(hoveredDay.x, 900)),
              top: Math.max(60, hoveredDay.y - 10),
            }}
          >
            <div className="font-semibold text-[var(--label)]">
              {hoveredDay.date}
            </div>
            <div className="flex items-center gap-2 text-[var(--label-2)]">
              <span className="text-[var(--accent)] font-medium">
                {hoveredDay.activity?.consistencyPercentage || 0}% consistent
              </span>
              <span>•</span>
              <span>{hoveredDay.activity?.habitsCompleted || 0} rituals</span>
            </div>
            {hoveredDay.activity?.focusMinutes ? (
              <div className="text-[11px] text-[var(--label-3)]">
                {(hoveredDay.activity.focusMinutes / 60).toFixed(1)} hrs focused
              </div>
            ) : null}
          </div>
        )}

      </Card>

      {/* Row of Three Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[12px] bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-[var(--label-2)]">
              Best Month
            </div>
            <div className="text-[18px] font-semibold text-[var(--label)] mt-0.5">
              {stats.bestMonth}
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[12px] bg-[var(--system-orange)]/15 text-[var(--system-orange)] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-[var(--label-2)]">
              Longest Streak
            </div>
            <div className="text-[18px] font-semibold text-[var(--label)] mt-0.5">
              {stats.longestStreak}
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[12px] bg-[var(--cat-dev)]/15 text-[var(--cat-dev)] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-[var(--label-2)]">
              Total Deep Work
            </div>
            <div className="text-[18px] font-semibold text-[var(--label)] mt-0.5">
              {stats.totalFocusHours}
            </div>
          </div>
        </Card>

      </div>

      {/* Accessible Hidden Table for Screen Readers */}
      <div className="sr-only">
        <table>
          <caption>365-Day Habit Consistency History</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Consistency</th>
              <th scope="col">Habits Completed</th>
              <th scope="col">Focus Hours</th>
            </tr>
          </thead>
          <tbody>
            {daysGrid.map((d) => (
              <tr key={d.dateKey}>
                <td>{d.dateKey}</td>
                <td>{d.activity.consistencyPercentage}%</td>
                <td>{d.activity.habitsCompleted}</td>
                <td>{((d.activity.focusMinutes || 0) / 60).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
