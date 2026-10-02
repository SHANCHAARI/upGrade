import { Habit } from './types';
import { addDays, getHabitScheduleStatus } from './time';

export const MAX_STORED_SHIELDS = 2;
export const STREAK_DAYS_PER_SHIELD = 14;

export interface StreakEvaluationResult {
  currentStreak: number;
  bestStreak: number;
  availableShields: number;
  shieldedDates: string[];
  recoveredDates: string[];
  shieldUsedNotice?: {
    habitId: string;
    habitTitle: string;
    date: string;
  };
}

/**
 * Evaluates the streak for a single habit with:
 * 1. Rest day exemptions (scheduled rest days never break streaks)
 * 2. Streak Shields (1 shield per 14 streak days, max 2 stored, auto-applies on a missed day)
 * 3. "Never miss twice" rule (a single missed day between completed days does not break the streak; tagged as recovered)
 */
export function evaluateHabitStreak(
  habit: Habit,
  todayKey: string
): StreakEvaluationResult {
  const completedSet = new Set(habit.completedDates || []);
  const shieldedSet = new Set(habit.shieldedDates || []);
  const recoveredSet = new Set(habit.recoveredDates || []);

  let availableShields = habit.shields ?? 0;
  let currentStreak = 0;
  let notice: StreakEvaluationResult['shieldUsedNotice'] = undefined;

  // Check today's status
  const todayStatus = getHabitScheduleStatus(habit, todayKey);
  const todayCompleted = completedSet.has(todayKey);

  // If today is completed, it adds to the streak
  if (todayCompleted) {
    currentStreak += 1;
  }

  // Walk backward starting from yesterday
  let checkDate = addDays(todayKey, -1);
  let consecutiveMisses = 0;
  let maxHistoryDaysToCheck = 365;

  while (maxHistoryDaysToCheck > 0) {
    maxHistoryDaysToCheck--;

    // Stop if we reach before habit creation
    if (habit.createdAt && checkDate < habit.createdAt) {
      break;
    }

    const { isScheduled, isRestDay } = getHabitScheduleStatus(habit, checkDate);

    // 1. Scheduled Rest Day: completely neutral, never penalizes streak
    if (isRestDay || !isScheduled) {
      checkDate = addDays(checkDate, -1);
      continue;
    }

    // 2. Day was completed
    if (completedSet.has(checkDate)) {
      currentStreak += 1;
      consecutiveMisses = 0;
      checkDate = addDays(checkDate, -1);
      continue;
    }

    // 3. Day was missed
    // Can a Streak Shield protect this missed day?
    if (shieldedSet.has(checkDate)) {
      // Already shielded previously
      currentStreak += 1;
      consecutiveMisses = 0;
      checkDate = addDays(checkDate, -1);
      continue;
    }

    if (availableShields > 0) {
      // Auto-apply streak shield!
      availableShields -= 1;
      shieldedSet.add(checkDate);
      if (!notice) {
        notice = {
          habitId: habit.id,
          habitTitle: habit.title,
          date: checkDate,
        };
      }
      currentStreak += 1;
      consecutiveMisses = 0;
      checkDate = addDays(checkDate, -1);
      continue;
    }

    // 4. "Never miss twice" forgiveness:
    // If this is the FIRST miss following completed days, and previous day was completed:
    // Check if the day before this (checkDate - 1) was completed or a rest day
    if (consecutiveMisses === 0) {
      // Look one step further back to see if it was completed
      const priorDate = addDays(checkDate, -1);
      const priorStatus = getHabitScheduleStatus(habit, priorDate);
      const priorCompleted = completedSet.has(priorDate);

      if (priorCompleted || priorStatus.isRestDay) {
        // "Never miss twice" applies: forgive the single miss
        recoveredSet.add(checkDate);
        currentStreak += 1;
        consecutiveMisses = 1; // Mark that 1 miss occurred
        checkDate = addDays(checkDate, -1);
        continue;
      }
    }

    // If 2 consecutive misses occurred, or single miss without prior recovery, streak ends
    break;
  }

  // Earn streak shields: 1 shield per 14 days of streak (max 2)
  const earnedShields = Math.floor(currentStreak / STREAK_DAYS_PER_SHIELD);
  availableShields = Math.min(MAX_STORED_SHIELDS, Math.max(availableShields, earnedShields));

  const bestStreak = Math.max(habit.bestStreak || 0, currentStreak);

  return {
    currentStreak,
    bestStreak,
    availableShields,
    shieldedDates: Array.from(shieldedSet),
    recoveredDates: Array.from(recoveredSet),
    shieldUsedNotice: notice,
  };
}

/**
 * Helper to update habit with calculated streak, shields, and forgiveness marks
 */
export function updateHabitStreakState(habit: Habit, todayKey: string): Habit {
  const result = evaluateHabitStreak(habit, todayKey);
  return {
    ...habit,
    streak: result.currentStreak,
    bestStreak: result.bestStreak,
    shields: result.availableShields,
    shieldedDates: result.shieldedDates,
    recoveredDates: result.recoveredDates,
  };
}
