import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageCommand } from '../parser';
import { Habit } from '../types';

const mockHabits: Habit[] = [
  {
    id: 'habit-1',
    title: 'Deep Work / Architecture & Code',
    category: 'dev',
    type: 'numeric',
    unit: 'hrs',
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
  },
  {
    id: 'habit-3',
    title: 'Physical Training / Mobility & Gym',
    category: 'health',
    type: 'boolean',
    icon: 'Flame',
    color: 'amber',
    timeOfDay: 'afternoon',
    createdAt: '2026-01-01',
    schedule: { type: 'daily' },
    restDays: [],
    streak: 12,
    bestStreak: 21,
    shields: 0,
    completedDates: [],
  },
  {
    id: 'habit-4',
    title: 'Hydration Target',
    category: 'health',
    type: 'quantity',
    targetValue: 3.5,
    unit: 'L',
    icon: 'Droplets',
    color: 'emerald',
    timeOfDay: 'anytime',
    createdAt: '2026-01-01',
    schedule: { type: 'daily' },
    restDays: [],
    streak: 5,
    bestStreak: 10,
    shields: 0,
    completedDates: [],
  },
];

describe('Natural Language Command Parser (Phase 2 A)', () => {
  it('parses completion commands like "gym done" and "physical training done"', () => {
    const res = parseNaturalLanguageCommand('gym done', mockHabits);
    expect(res).not.toBeNull();
    expect(res?.type).toBe('COMPLETE_HABIT');
    expect(res?.habit?.id).toBe('habit-3');
    expect(res?.previewText).toContain('Physical Training');
  });

  it('parses numeric logging commands like "deep work 2.5h"', () => {
    const res = parseNaturalLanguageCommand('deep work 2.5h', mockHabits);
    expect(res).not.toBeNull();
    expect(res?.type).toBe('LOG_NUMERIC');
    expect(res?.habit?.id).toBe('habit-1');
    expect(res?.value).toBe(2.5);
  });

  it('parses quantity commands like "hydration 2.0"', () => {
    const res = parseNaturalLanguageCommand('hydration 2.0', mockHabits);
    expect(res).not.toBeNull();
    expect(res?.type).toBe('LOG_NUMERIC');
    expect(res?.habit?.id).toBe('habit-4');
    expect(res?.value).toBe(2.0);
  });

  it('parses new habit commands like "add habit read 20 pages weekdays"', () => {
    const res = parseNaturalLanguageCommand('add habit read 20 pages weekdays', mockHabits);
    expect(res).not.toBeNull();
    expect(res?.type).toBe('ADD_HABIT');
    expect(res?.habitTitle).toBe('read');
    expect(res?.value).toBe(20);
    expect(res?.unit).toBe('pages');
    expect(res?.scheduleType).toBe('weekdays');
  });

  it('parses date jump commands like "show march"', () => {
    const res = parseNaturalLanguageCommand('show march', mockHabits);
    expect(res).not.toBeNull();
    expect(res?.type).toBe('SET_DATE');
    expect(res?.targetDate).toBe('march');
  });

  it('parses focus launch commands like "focus 25"', () => {
    const res = parseNaturalLanguageCommand('focus 25', mockHabits);
    expect(res).not.toBeNull();
    expect(res?.type).toBe('START_FOCUS');
    expect(res?.durationMinutes).toBe(25);
  });

  it('parses navigation commands like "trends", "year", "today"', () => {
    expect(parseNaturalLanguageCommand('trends', mockHabits)?.targetTab).toBe('analytics');
    expect(parseNaturalLanguageCommand('year', mockHabits)?.targetTab).toBe('heatmap');
    expect(parseNaturalLanguageCommand('today', mockHabits)?.targetTab).toBe('dashboard');
  });
});
