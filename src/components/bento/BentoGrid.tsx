import React from 'react';
import { HeroGreetingCard } from './HeroGreetingCard';
import { StreakBentoCard } from './StreakBentoCard';
import { LevelXpCard } from './LevelXpCard';
import { FocusBentoCard } from './FocusBentoCard';
import { WeekHeatmapCard } from './WeekHeatmapCard';
import { NextUpCard } from './NextUpCard';
import { DailyInsightCard } from './DailyInsightCard';
import { BadgesCard } from './BadgesCard';
import { Habit, DayActivity, UserStats } from '../../types';

interface BentoGridProps {
  habits: Habit[];
  history: Record<string, DayActivity>;
  userStats: UserStats;
  selectedDate: string;
  completedCount: number;
  totalCount: number;
  consistencyPercentage: number;
  focusMinutesToday: number;
  onToggleHabit: (habitId: string) => void;
  onLogNext: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  habits,
  history,
  userStats,
  selectedDate,
  completedCount,
  totalCount,
  consistencyPercentage,
  focusMinutesToday,
  onToggleHabit,
  onLogNext,
}) => {
  return (
    <div className="space-y-5 mb-8">
      {/* Row 1: Hero Greeting (span 5), Streak (span 3), Level/XP (span 4) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-5 h-full">
          <HeroGreetingCard
            completedCount={completedCount}
            totalCount={totalCount}
            consistencyPercentage={consistencyPercentage}
            onLogNext={onLogNext}
          />
        </div>

        <div className="md:col-span-3 h-full">
          <StreakBentoCard
            currentStreak={userStats.currentStreak}
            bestStreak={userStats.bestStreak}
          />
        </div>

        <div className="md:col-span-4 h-full">
          <LevelXpCard
            level={userStats.level}
            currentXp={userStats.currentXp}
            xpToNextLevel={userStats.xpToNextLevel}
          />
        </div>
      </div>

      {/* Row 2: Focus Time (span 4), Week Mini-Heatmap (span 4), Next Up (span 4) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-4 h-full">
          <FocusBentoCard focusMinutesToday={focusMinutesToday} />
        </div>

        <div className="md:col-span-4 h-full">
          <WeekHeatmapCard history={history} />
        </div>

        <div className="md:col-span-4 h-full">
          <NextUpCard
            habits={habits}
            selectedDate={selectedDate}
            onToggleHabit={onToggleHabit}
          />
        </div>
      </div>

      {/* Row 3: Daily Insight (span 6), Badges / Achievements (span 6) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-6 h-full">
          <DailyInsightCard />
        </div>

        <div className="md:col-span-6 h-full">
          <BadgesCard />
        </div>
      </div>
    </div>
  );
};
