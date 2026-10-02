import { Habit, DayActivity } from './types';
import { addDays, getHabitScheduleStatus } from './time';

export const DECAY_FACTOR = 0.96; // Exponential decay rate per day
export const SCORE_WINDOW_DAYS = 28;

export interface ConsistencyScoreResult {
  score: number;            // 0-100, official weighted score of past 28 completed days
  projectedScore: number;   // 0-100, projected score including today's current/potential completion
  dailyRatios: Array<{
    date: string;
    ratio: number;
    weight: number;
    completed: number;
    scheduled: number;
  }>;
}

/**
 * Calculates completion ratio for a single date across active habits.
 * Returns ratio in [0, 1].
 */
export function calculateDayRatio(dateKey: string, habits: Habit[]): {
  ratio: number;
  completed: number;
  scheduled: number;
} {
  if (habits.length === 0) {
    return { ratio: 1, completed: 0, scheduled: 0 };
  }

  let completedCount = 0;
  let scheduledCount = 0;

  for (const habit of habits) {
    // Check if habit existed on that date
    if (habit.createdAt && habit.createdAt > dateKey) {
      continue;
    }

    const { isScheduled, isRestDay } = getHabitScheduleStatus(habit, dateKey);

    // If rest day, it doesn't penalize the user
    if (isRestDay) {
      continue;
    }

    if (isScheduled) {
      scheduledCount++;
      const isDone = habit.completedDates.includes(dateKey);
      const isShielded = (habit.shieldedDates || []).includes(dateKey);
      const isRecovered = (habit.recoveredDates || []).includes(dateKey);

      if (isDone || isShielded || isRecovered) {
        completedCount++;
      }
    }
  }

  // If no habits were scheduled on this day, treat as fully consistent (rest day / neutral)
  const ratio = scheduledCount === 0 ? 1 : completedCount / scheduledCount;

  return {
    ratio,
    completed: completedCount,
    scheduled: scheduledCount,
  };
}

/**
 * Calculates the rolling 28-day exponential decay consistency score.
 * 
 * Today is ALWAYS considered "in progress" and is excluded from the official score
 * so that the score NEVER drops when opening the app in the morning.
 * 
 * A projected score is provided to show where the score will land if today is completed.
 */
export function calculateConsistencyScore(
  habits: Habit[],
  todayKey: string,
  historyMap?: Record<string, DayActivity>
): ConsistencyScoreResult {
  const dailyRatios: ConsistencyScoreResult['dailyRatios'] = [];

  let weightedSum = 0;
  let totalWeight = 0;

  // Evaluate the strictly past 28 days (excluding today)
  for (let i = 1; i <= SCORE_WINDOW_DAYS; i++) {
    const dateKey = addDays(todayKey, -i);
    // Weight decreases exponentially with age (i=1 yesterday has weight 1.0)
    const weight = Math.pow(DECAY_FACTOR, i - 1);

    // Prefer habit data directly, fallback to history record if habit list is empty
    let dayData = calculateDayRatio(dateKey, habits);

    if (dayData.scheduled === 0 && historyMap && historyMap[dateKey]) {
      const hist = historyMap[dateKey];
      const ratio = hist.totalHabits > 0 ? hist.habitsCompleted / hist.totalHabits : 1;
      dayData = {
        ratio,
        completed: hist.habitsCompleted,
        scheduled: hist.totalHabits,
      };
    }

    dailyRatios.push({
      date: dateKey,
      ratio: dayData.ratio,
      weight,
      completed: dayData.completed,
      scheduled: dayData.scheduled,
    });

    weightedSum += dayData.ratio * weight;
    totalWeight += weight;
  }

  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 100;
  const officialScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  // Compute projected score assuming today is completed at 100% or current progress
  const todayData = calculateDayRatio(todayKey, habits);
  // Give today weight of 1.0 and roll off the oldest day (i=28)
  const projectedWeightSum = weightedSum * DECAY_FACTOR + (todayData.scheduled > 0 ? Math.max(todayData.ratio, 0.95) : 1) * 1.0;
  const projectedTotalWeight = totalWeight * DECAY_FACTOR + 1.0;
  const projectedScore = Math.round(Math.min(100, Math.max(0, (projectedWeightSum / projectedTotalWeight) * 100)));

  return {
    score: officialScore,
    projectedScore,
    dailyRatios,
  };
}
