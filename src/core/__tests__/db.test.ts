import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateV1HabitToV2,
  exportToJSON,
  exportToCSV,
  parseAndValidateJSONImport,
  parseHabitsCSV,
} from '../db';
import { undoManager, MAX_UNDO_STACK_SIZE } from '../undo';
import { Habit, DayActivity } from '../types';

describe('Storage, Migrations & Undo Stack (Phase 1)', () => {
  const todayKey = '2026-10-02';

  beforeEach(() => {
    undoManager.clear();
  });

  it('migrates v1 habit schema to v2 without data loss', () => {
    const v1Habit = {
      id: 'old-1',
      title: 'Deep Work',
      category: 'dev',
      type: 'numeric',
      targetValue: 4,
      unit: 'hrs',
      streak: 15,
      bestStreak: 20,
      completedDates: ['2026-10-01'],
      numericLogs: { '2026-10-01': 4.5 },
    };

    const v2Habit = migrateV1HabitToV2(v1Habit, todayKey);

    expect(v2Habit.id).toBe('old-1');
    expect(v2Habit.title).toBe('Deep Work');
    expect(v2Habit.type).toBe('numeric');
    expect(v2Habit.targetValue).toBe(4);
    expect(v2Habit.schedule).toEqual({ type: 'daily' }); // default schedule
    expect(v2Habit.restDays).toEqual([]);
    expect(v2Habit.shields).toBeGreaterThanOrEqual(0);
    expect(v2Habit.numericLogs?.['2026-10-01']).toBe(4.5);
  });

  it('exports and imports data to JSON without loss', () => {
    const habit: Habit = {
      id: 'h-export-1',
      title: 'Hydration',
      category: 'health',
      type: 'quantity',
      targetValue: 3,
      unit: 'L',
      icon: 'Droplets',
      color: 'emerald',
      timeOfDay: 'anytime',
      createdAt: '2026-06-01',
      schedule: { type: 'daily' },
      restDays: [],
      streak: 5,
      bestStreak: 12,
      shields: 0,
      completedDates: ['2026-10-01'],
    };

    const history: Record<string, DayActivity> = {
      '2026-10-01': {
        date: '2026-10-01',
        habitsCompleted: 1,
        totalHabits: 1,
        consistencyPercentage: 100,
        consistencyScore: 95,
        focusMinutes: 45,
      },
    };

    const jsonString = exportToJSON([habit], history);
    expect(jsonString).toContain('"appName": "upGrade"');
    expect(jsonString).toContain('"schemaVersion": 2');

    const importResult = parseAndValidateJSONImport(jsonString);
    expect(importResult.success).toBe(true);
    expect(importResult.habits?.length).toBe(1);
    expect(importResult.habits?.[0].title).toBe('Hydration');
    expect(importResult.history?.['2026-10-01'].consistencyScore).toBe(95);
  });

  it('exports and imports CSV properly', () => {
    const habit: Habit = {
      id: 'h-csv-1',
      title: 'Read Books, "Fast & Slow"',
      category: 'growth',
      type: 'quantity',
      targetValue: 25,
      unit: 'pages',
      icon: 'BookOpen',
      color: 'purple',
      timeOfDay: 'evening',
      createdAt: '2026-07-01',
      schedule: { type: 'daily' },
      restDays: [],
      streak: 7,
      bestStreak: 14,
      shields: 0,
      completedDates: [],
    };

    const history: Record<string, DayActivity> = {
      '2026-10-01': {
        date: '2026-10-01',
        habitsCompleted: 3,
        totalHabits: 4,
        consistencyPercentage: 75,
        consistencyScore: 82,
        focusMinutes: 120,
      },
    };

    const { habitsCSV, historyCSV } = exportToCSV([habit], history);
    expect(habitsCSV).toContain('id,title,category,type');
    expect(historyCSV).toContain('date,habitsCompleted,totalHabits');

    // Parse back
    const parsedHabits = parseHabitsCSV(habitsCSV);
    expect(parsedHabits.length).toBe(1);
    expect(parsedHabits[0].title).toBe('Read Books, "Fast & Slow"');
    expect(parsedHabits[0].streak).toBe(7);
  });

  it('Undo stack limits to 20 actions and supports undo/redo', async () => {
    let state = 0;

    // Push 25 actions
    for (let i = 1; i <= 25; i++) {
      const prevVal = state;
      state = i;
      const currentVal = i;
      undoManager.pushAction({
        id: `action-${i}`,
        type: 'INCREMENT',
        description: `Set state to ${i}`,
        timestamp: Date.now(),
        undo: () => {
          state = prevVal;
        },
        redo: () => {
          state = currentVal;
        },
      });
    }

    // Stack should only hold 20 actions
    expect(undoManager.getUndoCount()).toBe(MAX_UNDO_STACK_SIZE);

    // Undo last action (which set state to 25 from 24)
    const undid = await undoManager.undo();
    expect(undid).toBe(true);
    expect(state).toBe(24);

    // Redo action
    const redid = await undoManager.redo();
    expect(redid).toBe(true);
    expect(state).toBe(25);
  });
});
