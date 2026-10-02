import { Habit, DayActivity } from '../types';

const STORAGE_KEYS = {
  HABITS: 'upgrade_habits_v1',
  STATS: 'upgrade_stats_v1',
  HISTORY: 'upgrade_history_v1',
};

// Formats a date to YYYY-MM-DD
export const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayKey = (): string => {
  return formatDateKey(new Date());
};

// Fresh starter rituals with 0 streaks and 0 check-ins for a new user starting from zero
export const FRESH_STARTER_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Deep Work / Architecture & Code',
    description: 'Ship core features, optimize algorithms, and review PRs without interruptions',
    category: 'dev',
    type: 'numeric',
    targetValue: 4,
    unit: 'hrs',
    icon: 'Code2',
    color: 'purple',
    timeOfDay: 'morning',
    createdAt: getTodayKey(),
    schedule: { type: 'daily' },
    restDays: [0], // Sunday rest
    streak: 0,
    bestStreak: 0,
    shields: 0,
    completedDates: [],
    numericLogs: {},
  },
  {
    id: 'habit-2',
    title: 'Daily System Consistency Check',
    description: 'Review trackings, update progress log, and verify project health',
    category: 'focus',
    type: 'boolean',
    icon: 'CheckCircle2',
    color: 'green',
    timeOfDay: 'morning',
    createdAt: getTodayKey(),
    schedule: { type: 'daily' },
    restDays: [],
    streak: 0,
    bestStreak: 0,
    shields: 0,
    completedDates: [],
  },
  {
    id: 'habit-3',
    title: 'Physical Training / Mobility & Gym',
    description: 'Calisthenics, progressive overload, or zone-2 cardio session',
    category: 'health',
    type: 'boolean',
    icon: 'Flame',
    color: 'amber',
    timeOfDay: 'afternoon',
    createdAt: getTodayKey(),
    schedule: { type: 'specific_days', days: [1, 2, 4, 5, 6] },
    restDays: [0, 3], // Sunday and Wednesday rest days
    streak: 0,
    bestStreak: 0,
    shields: 0,
    completedDates: [],
  },
  {
    id: 'habit-4',
    title: 'Hydration Target',
    description: 'Electrolytes & clean water across the day',
    category: 'health',
    type: 'numeric',
    targetValue: 3.5,
    unit: 'L',
    icon: 'Droplets',
    color: 'emerald',
    timeOfDay: 'anytime',
    createdAt: getTodayKey(),
    schedule: { type: 'daily' },
    restDays: [],
    streak: 0,
    bestStreak: 0,
    shields: 0,
    completedDates: [],
    numericLogs: {},
  },
];

// Alias for compatibility
export const DEFAULT_HABITS: Habit[] = FRESH_STARTER_HABITS;

// Optional: Generates 180-day realistic sample history for demos only
export const generateSeedData = (): { habits: Habit[]; history: Record<string, DayActivity> } => {
  const habits = JSON.parse(JSON.stringify(FRESH_STARTER_HABITS)) as Habit[];
  const history: Record<string, DayActivity> = {};
  const today = new Date();

  // Give sample habits realistic streaks for demo
  habits[0].streak = 19;
  habits[0].bestStreak = 34;
  habits[0].shields = 1;
  habits[1].streak = 28;
  habits[1].bestStreak = 45;
  habits[1].shields = 2;
  habits[2].streak = 12;
  habits[2].bestStreak = 21;
  habits[3].streak = 22;
  habits[3].bestStreak = 26;
  habits[3].shields = 1;

  for (let i = 180; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = formatDateKey(d);

    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCompletionProbability = isWeekend ? 0.65 : 0.85;

    let completedCount = 0;
    let totalFocusMins = 0;

    habits.forEach((habit) => {
      const completes = Math.random() < baseCompletionProbability;
      if (completes && i !== 0) {
        habit.completedDates.push(dateKey);
        completedCount++;

        if (habit.type === 'numeric') {
          if (!habit.numericLogs) habit.numericLogs = {};
          if (habit.id === 'habit-1') {
            const hrs = Number((2.5 + Math.random() * 2.5).toFixed(1));
            habit.numericLogs[dateKey] = hrs;
            totalFocusMins += Math.round(hrs * 60);
          } else if (habit.id === 'habit-4') {
            habit.numericLogs[dateKey] = Number((2.5 + Math.random() * 1.5).toFixed(1));
          }
        }
      }
    });

    if (i === 0) {
      habits[1].completedDates.push(dateKey);
      completedCount++;
    }

    const pct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    history[dateKey] = {
      date: dateKey,
      habitsCompleted: completedCount,
      totalHabits: habits.length,
      consistencyPercentage: pct,
      consistencyScore: pct,
      focusMinutes: totalFocusMins || (completedCount > 0 ? completedCount * 45 : 0),
    };
  }

  return { habits, history };
};

// Storage API: Defaults to a completely fresh setup starting from ZERO
export const loadInitialData = () => {
  try {
    const rawHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);

    if (rawHabits) {
      return {
        habits: JSON.parse(rawHabits) as Habit[],
        history: rawHistory ? (JSON.parse(rawHistory) as Record<string, DayActivity>) : {},
        stats: null,
      };
    }
  } catch (e) {
    console.warn('Failed to load from localStorage', e);
  }

  // Brand-new fresh state starting from zero
  const freshHabits = JSON.parse(JSON.stringify(FRESH_STARTER_HABITS)) as Habit[];
  const freshHistory: Record<string, DayActivity> = {};
  saveHabits(freshHabits);
  saveHistory(freshHistory);

  return { habits: freshHabits, history: freshHistory, stats: null };
};

export const saveHabits = (habits: Habit[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits', e);
  }
};

export const saveHistory = (history: Record<string, DayActivity>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const saveStats = (stats: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
};
