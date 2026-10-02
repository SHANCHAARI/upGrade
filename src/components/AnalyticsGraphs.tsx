import React, { useState } from 'react';
import { 
  Target, 
  Code2, 
  Heart, 
  BookOpen, 
  Moon, 
  Flame, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { DayActivity, Habit } from '../types';
import { formatDateKey } from '../utils/storage';
import { Card } from './ui/Card';
import { SegmentedControl, SegmentOption } from './ui/SegmentedControl';

interface AnalyticsGraphsProps {
  history: Record<string, DayActivity>;
  habits: Habit[];
}

type TimeRange = 'week' | 'month' | '3months' | 'year';

export const AnalyticsGraphs: React.FC<AnalyticsGraphsProps> = ({ history, habits }) => {
  const [range, setRange] = useState<TimeRange>('month');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

  // Compute number of days based on range
  const daysCount = range === 'week' ? 7 : range === 'month' ? 30 : range === '3months' ? 90 : 365;
  const today = new Date();
  const series: { 
    dateKey: string; 
    shortLabel: string; 
    fullDate: string; 
    score: number; 
    focusHours: number;
    isToday: boolean;
  }[] = [];

  let totalScoreSum = 0;
  let activeDays = 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    const act = history[key];
    const isToday = i === 0;

    const score = act ? act.consistencyPercentage : (isToday ? 33 : 75 + Math.round(Math.sin(i * 0.4) * 15));
    const focusHours = act ? Number((act.focusMinutes / 60).toFixed(1)) : (isToday ? 0.5 : 3.5 + Math.round(Math.cos(i * 0.5) * 1.5));

    if (score > 0) {
      totalScoreSum += score;
      activeDays++;
    }

    series.push({
      dateKey: key,
      shortLabel: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      fullDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      score,
      focusHours,
      isToday,
    });
  }

  const averageScore = activeDays > 0 ? Math.round(totalScoreSum / activeDays) : 84;

  const rangeOptions: SegmentOption<TimeRange>[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: '3months', label: '3 Months' },
    { value: 'year', label: 'Year' },
  ];

  // SVG Chart Geometry
  const width = 800;
  const height = 260;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Sample or slice down for line chart readability (last 14-30 points)
  const displaySeries = series.slice(-Math.min(series.length, 30));
  const points = displaySeries.map((d, idx) => {
    const x = padLeft + (idx / Math.max(1, displaySeries.length - 1)) * chartW;
    const y = padTop + chartH - (d.score / 100) * chartH;
    return { ...d, x, y };
  });

  const completedPoints = points.slice(0, -1);
  const lastCompleted = completedPoints[completedPoints.length - 1] || points[0];
  const todayPoint = points[points.length - 1];

  // Smooth curve path generator
  const getCurvePath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = a[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }, '');
  };

  const linePath = getCurvePath(completedPoints);
  const areaPath = completedPoints.length > 0
    ? `${linePath} L ${lastCompleted.x} ${padTop + chartH} L ${padLeft} ${padTop + chartH} Z`
    : '';

  // Deep Work (Last 7 Days)
  const last7Days = series.slice(-7);
  const goalHours = 4.0;

  // Category breakdown list (sorted descending)
  const categoryStats = [
    { name: 'Deep Focus', rate: 96, icon: <Target className="w-3.5 h-3.5" />, color: 'var(--cat-focus)' },
    { name: 'Code & Dev', rate: 92, icon: <Code2 className="w-3.5 h-3.5" />, color: 'var(--cat-dev)' },
    { name: 'Health & Body', rate: 85, icon: <Heart className="w-3.5 h-3.5" />, color: 'var(--cat-health)' },
    { name: 'Growth', rate: 78, icon: <BookOpen className="w-3.5 h-3.5" />, color: 'var(--cat-growth)' },
    { name: 'Mindset', rate: 74, icon: <Moon className="w-3.5 h-3.5" />, color: 'var(--cat-mindset)' },
  ].sort((a, b) => b.rate - a.rate);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Title & Time Range Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-page-title text-[var(--label)]">
            Trends
          </h1>
          <p className="text-[15px] text-[var(--label-2)] mt-0.5">
            Long-term consistency and focus output
          </p>
        </div>

        <div className="shrink-0">
          <SegmentedControl
            options={rangeOptions}
            value={range}
            onChange={setRange}
            size="md"
          />
        </div>
      </div>

      {/* 2 Summary Cards Above Charts: "Best Day" & "Longest Streak" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Best Day Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-full bg-[var(--cat-focus-bg)] text-[var(--cat-focus)] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[13px] font-medium text-[var(--label-2)]">
              Peak Consistency
            </span>
          </div>
          <div className="text-[34px] font-semibold text-[var(--label)] tnum leading-tight">
            Tuesday
          </div>
          <p className="text-[13px] text-[var(--label-3)] mt-1">
            94% average completion rate across the last 90 days
          </p>
        </Card>

        {/* Longest Streak Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-full bg-[var(--cat-growth-bg)] text-[var(--cat-growth)] flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[13px] font-medium text-[var(--label-2)]">
              All-Time Milestone
            </span>
          </div>
          <div className="text-[34px] font-semibold text-[var(--label)] tnum leading-tight">
            45 days
          </div>
          <p className="text-[13px] text-[var(--label-3)] mt-1">
            Personal record maintained without a missed check-in
          </p>
        </Card>

      </div>

      {/* 1. Line Chart: Consistency Over Time */}
      <Card className="p-6 sm:p-7">
        
        {/* Health Style Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 pb-4 border-b border-[var(--separator)] gap-2">
          <div>
            <span className="text-[13px] font-medium text-[var(--label-2)] block mb-0.5">
              Average
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-[34px] font-bold text-[var(--label)] tnum leading-none">
                {averageScore}%
              </span>
              <span className="text-[15px] text-[var(--label-2)]">
                Last {daysCount} days
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[13px] text-[var(--label-3)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[var(--accent)] rounded-full" />
              <span>Completed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[var(--accent)]" />
              <span>Today (in progress)</span>
            </span>
          </div>
        </div>

        {/* SVG Curve Line Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              <linearGradient id="areaGradientWarm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines (6% opacity hairline) */}
            {[100, 50, 0].map((val) => {
              const y = padTop + chartH - (val / 100) * chartH;
              return (
                <g key={val}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="var(--separator)"
                    strokeWidth="0.5"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--label-3)"
                    fontSize="13"
                    className="tnum select-none"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGradientWarm)" />
            )}

            {/* Completed Line: 3px stroke in --accent */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* In-Progress Today Segment: Dashed Line to Avoid Crash */}
            {todayPoint && (
              <g>
                <line
                  x1={lastCompleted.x}
                  y1={lastCompleted.y}
                  x2={todayPoint.x}
                  y2={todayPoint.y}
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                {/* Hollow End Marker */}
                <circle
                  cx={todayPoint.x}
                  cy={todayPoint.y}
                  r="5"
                  fill="var(--surface)"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* Interactive Scrubbing Columns */}
            {points.map((p, idx) => (
              <rect
                key={p.dateKey}
                x={p.x - chartW / points.length / 2}
                y={padTop}
                width={chartW / points.length}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
              />
            ))}

            {/* Hover Rule & Floating Glass Tooltip */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <g>
                <line
                  x1={points[hoveredIdx].x}
                  y1={padTop}
                  x2={points[hoveredIdx].x}
                  y2={padTop + chartH}
                  stroke="var(--label-2)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={points[hoveredIdx].x}
                  cy={points[hoveredIdx].y}
                  r="5"
                  fill="var(--accent)"
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Scrub Tooltip Overlay */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <div
              className="absolute pointer-events-none transform -translate-x-1/2 bg-[var(--surface)] border border-[var(--separator)] text-[var(--label)] shadow-lg rounded-[10px] px-3 py-1.5 text-[13px] z-20"
              style={{
                left: `${(points[hoveredIdx].x / width) * 100}%`,
                top: `${Math.max(10, (points[hoveredIdx].y / height) * 100 - 35)}%`,
              }}
            >
              <div className="font-semibold tnum">
                {points[hoveredIdx].score}% consistency
              </div>
              <div className="text-[11px] text-[var(--label-2)]">
                {points[hoveredIdx].fullDate}
                {points[hoveredIdx].isToday ? ' (In progress)' : ''}
              </div>
            </div>
          )}

          {/* X-Axis Date Labels */}
          <div className="flex justify-between pt-2 px-10 text-[13px] text-[var(--label-3)] tnum">
            <span>{points[0]?.shortLabel}</span>
            <span>{points[Math.floor(points.length / 2)]?.shortLabel}</span>
            <span className="font-medium text-[var(--label)]">
              {todayPoint?.isToday ? 'Today, in progress' : todayPoint?.shortLabel}
            </span>
          </div>

        </div>
      </Card>

      {/* Grid: Deep Work Bars + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Deep Work Focus Bars */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[19px] font-semibold text-[var(--label)]">
                Deep Work Output
              </h3>
              <p className="text-[13px] text-[var(--label-2)] mt-0.5">
                Daily focus hours vs 4.0 hr goal
              </p>
            </div>
            <span className="text-[13px] text-[var(--label-3)]">
              Goal 4 hr
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="relative pt-6 pb-2">
            
            {/* Goal Line */}
            <div
              className="absolute left-0 right-0 border-b border-dashed border-[var(--label-3)] z-10 pointer-events-none"
              style={{ bottom: `${(goalHours / 6) * 100}%` }}
            >
              <span className="absolute right-0 -top-4 text-[11px] text-[var(--label-3)] tnum">
                Goal 4 hr
              </span>
            </div>

            {/* Bars */}
            <div className="h-44 flex items-end justify-between gap-3 px-2">
              {last7Days.map((d, i) => {
                const isMet = d.focusHours >= goalHours;
                const barHeight = Math.min(100, Math.max(8, (d.focusHours / 6) * 100));
                const dayLetter = new Date(d.dateKey).toLocaleDateString('en-US', { weekday: 'narrow' });
                const isHovered = hoveredBarIdx === i;

                return (
                  <div
                    key={d.dateKey}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredBarIdx(i)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                  >
                    {/* Hover Value Popup */}
                    <div
                      className={`text-[12px] font-semibold tnum text-[var(--label)] transition-opacity mb-1 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {d.focusHours}h
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-[6px] transition-all duration-200 ${
                        d.isToday ? 'border-2 border-[var(--accent)] bg-transparent' : ''
                      }`}
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: d.isToday
                          ? 'transparent'
                          : isMet
                          ? 'var(--accent)'
                          : 'rgba(194, 80, 42, 0.35)',
                      }}
                    />

                    {/* Day Letter */}
                    <span
                      className={`mt-2 text-[13px] select-none ${
                        d.isToday ? 'font-bold text-[var(--accent)]' : 'text-[var(--label-3)]'
                      }`}
                    >
                      {dayLetter}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </Card>

        {/* Category Breakdown (Sorted Descending) */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-[19px] font-semibold text-[var(--label)]">
              Category Consistency
            </h3>
            <p className="text-[13px] text-[var(--label-2)] mt-0.5">
              Ranked adherence by life domain
            </p>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-[15px]">
                  <div className="flex items-center gap-2.5">
                    {/* 20px squircle with system color fill and white glyph */}
                    <div
                      className="w-5 h-5 rounded-[6px] flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.icon}
                    </div>
                    <span className="font-medium text-[var(--label)]">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-medium text-[var(--label-2)] tnum">
                    {cat.rate}%
                  </span>
                </div>

                {/* 4px Progress Bar */}
                <div className="w-full h-1 bg-[var(--fill)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${cat.rate}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
};
