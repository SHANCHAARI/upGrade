import { describe, it, expect } from 'vitest';
import { calculateConsistencyScore, calculateDayRatio, DECAY_FACTOR } from '../score';
import { Habit } from '../types';
import { addDays } from '../time';

const createMockHabit = (overrides?: Partial<Habit>): Habit => ({
  id: 'mock-1',
  title: 'Morning Code',
  category: 'dev',
  type: 'boolean',
  icon: 'Code',
  color: 'purple',
  timeOfDay: 'morning',
  createdAt: '2026-01-01',
  schedule: { type: 'daily' },
  restDays: [],
  streak: 10,
  bestStreak: 20,
  shields: 1,
  completedDates: [],
  ...overrides,
});

describe('Consistency Score (Phase 1)', () => {
  const todayKey = '2026-10-02';

  it('weights recent days more than distant days (exponential decay)', () => {
    // Weight at day 1 (yesterday) vs day 28
    const w1 = Math.pow(DECAY_FACTOR, 0);
    const w14 = Math.pow(DECAY_FACTOR, 13);
    const w28 = Math.pow(DECAY_FACTOR, 27);

    expect(w1).toBe(1.0);
    expect(w14).toBeLessThan(w1);
    expect(w28).toBeLessThan(w14);
    expect(w28).toBeCloseTo(0.334, 2);
  });

  it('yields 100% when all past 28 days are completed', () => {
    const past28Days: string[] = [];
    for (let i = 1; i <= 28; i++) {
      past28Days.push(addDays(todayKey, -i));
    }

    const habit = createMockHabit({
      completedDates: past28Days,
    });

    const result = calculateConsistencyScore([habit], todayKey);
    expect(result.score).toBe(100);
  });

  it('missing one day dents score slightly, never destroys it', () => {
    // 27 days completed, yesterday missed
    const past28DaysExceptYesterday: string[] = [];
    for (let i = 2; i <= 28; i++) {
      past28DaysExceptYesterday.push(addDays(todayKey, -i));
    }

    const habit = createMockHabit({
      completedDates: past28DaysExceptYesterday,
    });

    const result = calculateConsistencyScore([habit], todayKey);
    // Score drops slightly from 100% to around ~94%, NOT down to 0%
    expect(result.score).toBeGreaterThanOrEqual(92);
    expect(result.score).toBeLessThan(100);
  });

  it('today is always in progress: missing today does NOT drop the score', () => {
    const past28Days: string[] = [];
    for (let i = 1; i <= 28; i++) {
      past28Days.push(addDays(todayKey, -i));
    }

    // Today is NOT in completedDates (it is morning, in progress)
    const habit = createMockHabit({
      completedDates: past28Days,
    });

    const result = calculateConsistencyScore([habit], todayKey);
    // Official score must still be 100% because today is in progress!
    expect(result.score).toBe(100);
    expect(result.projectedScore).toBeGreaterThanOrEqual(95);
  });

  it('correctly handles scheduled rest days without penalizing ratio', () => {
    const habit = createMockHabit({
      restDays: [0, 6], // Sunday & Saturday
      completedDates: [],
    });

    // Pick a Sunday date: 2026-09-27 was Sunday
    const sundayKey = '2026-09-27';
    const dayRatio = calculateDayRatio(sundayKey, [habit]);
    // Rest days are exempt from failure
    expect(dayRatio.scheduled).toBe(0);
    expect(dayRatio.ratio).toBe(1.0);
  });
});
