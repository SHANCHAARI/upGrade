import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  parseDateKey,
  getLogicalTodayKey,
  addDays,
  getDaysDifference,
  isPastDate,
  getHabitScheduleStatus,
} from '../time';
import { Habit } from '../types';

describe('Time Model & Rollover Logic (Phase 1)', () => {
  it('formats Date to YYYY-MM-DD reliably', () => {
    const d = new Date(2026, 9, 2); // Month is 0-indexed: 9 = October
    expect(formatDateKey(d)).toBe('2026-10-02');
  });

  it('parses YYYY-MM-DD correctly without timezone day shifts', () => {
    const d = parseDateKey('2026-10-02');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(9); // Oct
    expect(d.getDate()).toBe(2);
  });

  it('day rollover setting honors night owls (e.g. 4am day boundary)', () => {
    // 3:30 AM on October 3rd, 2026
    const earlyMorningOct3 = new Date(2026, 9, 3, 3, 30, 0);
    const logicalDate = getLogicalTodayKey({
      rolloverHour: 4,
      now: earlyMorningOct3,
    });
    // With 4am rollover, 3:30 AM is still logically yesterday (Oct 2)!
    expect(logicalDate).toBe('2026-10-02');

    // 4:15 AM on October 3rd, 2026
    const postRolloverOct3 = new Date(2026, 9, 3, 4, 15, 0);
    const newDayLogicalDate = getLogicalTodayKey({
      rolloverHour: 4,
      now: postRolloverOct3,
    });
    // After 4:00 AM, it is logically Oct 3
    expect(newDayLogicalDate).toBe('2026-10-03');
  });

  it('date math helpers support backfilling past dates', () => {
    expect(addDays('2026-10-02', -1)).toBe('2026-10-01');
    expect(addDays('2026-10-02', 5)).toBe('2026-10-07');
    expect(getDaysDifference('2026-09-28', '2026-10-02')).toBe(4);
    expect(isPastDate('2026-10-01', '2026-10-02')).toBe(true);
    expect(isPastDate('2026-10-02', '2026-10-02')).toBe(false);
  });

  it('habit schedule resolution identifies weekdays vs weekends and rest days', () => {
    const weekdayHabit: Habit = {
      id: 'h1',
      title: 'Coding',
      category: 'dev',
      type: 'boolean',
      icon: 'Code',
      color: 'purple',
      timeOfDay: 'morning',
      createdAt: '2026-01-01',
      schedule: { type: 'weekdays' },
      restDays: [0, 6], // Sunday & Saturday
      streak: 5,
      bestStreak: 10,
      shields: 0,
      completedDates: [],
    };

    // 2026-10-02 is Friday (day 5)
    const fridayStatus = getHabitScheduleStatus(weekdayHabit, '2026-10-02');
    expect(fridayStatus.isScheduled).toBe(true);
    expect(fridayStatus.isRestDay).toBe(false);

    // 2026-10-03 is Saturday (day 6)
    const saturdayStatus = getHabitScheduleStatus(weekdayHabit, '2026-10-03');
    expect(saturdayStatus.isScheduled).toBe(false);
    expect(saturdayStatus.isRestDay).toBe(true);
  });
});
