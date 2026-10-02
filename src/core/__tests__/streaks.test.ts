import { describe, it, expect } from 'vitest';
import { evaluateHabitStreak, MAX_STORED_SHIELDS } from '../streaks';
import { Habit } from '../types';
import { addDays } from '../time';

const createMockHabit = (overrides?: Partial<Habit>): Habit => ({
  id: 'mock-streak-1',
  title: 'Deep Work',
  category: 'dev',
  type: 'boolean',
  icon: 'Code',
  color: 'purple',
  timeOfDay: 'morning',
  createdAt: '2026-01-01',
  schedule: { type: 'daily' },
  restDays: [],
  streak: 0,
  bestStreak: 0,
  shields: 0,
  completedDates: [],
  ...overrides,
});

describe('Forgiveness Mechanics & Streaks (Phase 1)', () => {
  const todayKey = '2026-10-02';

  it('"Never miss twice": a single miss never breaks a streak if adjacent days are completed', () => {
    // Days completed: yesterday, 3 days ago, 4 days ago. 2 days ago was missed.
    const d1 = addDays(todayKey, -1); // yesterday completed
    const d2 = addDays(todayKey, -2); // 2 days ago MISSED
    const d3 = addDays(todayKey, -3); // 3 days ago completed
    const d4 = addDays(todayKey, -4); // 4 days ago completed

    const habit = createMockHabit({
      completedDates: [d1, d3, d4], // d2 is missing
      shields: 0,
    });

    const result = evaluateHabitStreak(habit, todayKey);
    // Streak should forgive the single miss and include d1, d2 (recovered), d3, d4 = 4 days
    expect(result.currentStreak).toBe(4);
    expect(result.recoveredDates).toContain(d2);
  });

  it('two consecutive misses break the streak', () => {
    const d1 = addDays(todayKey, -1); // yesterday completed
    const d2 = addDays(todayKey, -2); // 2 days ago MISSED
    const d3 = addDays(todayKey, -3); // 3 days ago MISSED
    const d4 = addDays(todayKey, -4); // 4 days ago completed

    const habit = createMockHabit({
      completedDates: [d1, d4],
      shields: 0,
    });

    const result = evaluateHabitStreak(habit, todayKey);
    // Streak breaks at the 2 consecutive misses (d2, d3), only d1 counts
    expect(result.currentStreak).toBe(1);
  });

  it('Streak Shields: auto-applies on a missed day to protect streak', () => {
    const d1 = addDays(todayKey, -1);
    const d2 = addDays(todayKey, -2); // missed
    const d3 = addDays(todayKey, -3); // missed
    const d4 = addDays(todayKey, -4); // completed

    const habit = createMockHabit({
      completedDates: [d1, d4],
      shields: 1, // Has 1 shield available
    });

    const result = evaluateHabitStreak(habit, todayKey);
    // With 1 shield, one missed day is shielded, and the other can be forgiven by Never Miss Twice!
    expect(result.shieldedDates).toContain(d2);
    expect(result.currentStreak).toBeGreaterThanOrEqual(3);
  });

  it('Earns 1 shield per 14-day streak, capped at 2 stored', () => {
    // 30 days of continuous completion
    const completed: string[] = [];
    for (let i = 1; i <= 30; i++) {
      completed.push(addDays(todayKey, -i));
    }

    const habit = createMockHabit({
      completedDates: completed,
      shields: 0,
    });

    const result = evaluateHabitStreak(habit, todayKey);
    expect(result.currentStreak).toBe(30);
    // 30 / 14 = 2 shields earned, capped at MAX_STORED_SHIELDS (2)
    expect(result.availableShields).toBe(MAX_STORED_SHIELDS);
  });

  it('Scheduled rest days never count against the streak', () => {
    // Habit is scheduled with rest days on Sundays (0) and Saturdays (6)
    // 2026-09-27 was Sunday, 2026-09-26 was Saturday
    const habit = createMockHabit({
      restDays: [0, 6],
      completedDates: [
        '2026-09-28', // Monday
        '2026-09-25', // Friday
        '2026-09-24', // Thursday
      ],
      shields: 0,
    });

    // As of 2026-09-29 (Tuesday)
    const result = evaluateHabitStreak(habit, '2026-09-29');
    // Saturday and Sunday were not completed, but they are rest days, so streak does not break!
    expect(result.currentStreak).toBe(3);
  });
});
