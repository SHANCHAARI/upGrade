import Dexie, { type Table } from 'dexie';
import { Habit, DayActivity, AppSettings, UserStats } from './types';
import { calculateConsistencyScore } from './score';
import { evaluateHabitStreak } from './streaks';
import { getLogicalTodayKey, formatDateKey } from './time';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  dayRolloverHour: 4, // 4 AM for night owls
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  theme: 'auto',
  accentIntensity: 'default',
  weekStartsOn: 1, // Monday
  soundEnabled: true,
  hapticsEnabled: true,
  aiCoachEnabled: false,
};

export class UpgradeDatabase extends Dexie {
  habits!: Table<Habit, string>;
  history!: Table<DayActivity, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('UpgradeDatabase');
    // Schema version 1: habits, history, settings
    this.version(1).stores({
      habits: 'id, category, type, streak, createdAt',
      history: 'date, consistencyScore, focusMinutes',
      settings: 'key',
    });
  }
}

export const db = new UpgradeDatabase();

// LocalStorage backward compatibility keys
const V1_STORAGE_KEYS = {
  HABITS: 'upgrade_habits_v1',
  HISTORY: 'upgrade_history_v1',
  STATS: 'upgrade_stats_v1',
  MIGRATED_V2: 'upgrade_migrated_v2',
};

/**
 * Migration helper: Upgrades v1 Habit into v2 Habit with full schedule, shields, and rest-days
 */
export function migrateV1HabitToV2(h: any, todayKey: string): Habit {
  const schedule = h.schedule || { type: 'daily' };
  const restDays = Array.isArray(h.restDays) ? h.restDays : [];
  const streak = typeof h.streak === 'number' ? h.streak : 0;
  const bestStreak = typeof h.bestStreak === 'number' ? Math.max(h.bestStreak, streak) : streak;
  const shields = typeof h.shields === 'number' ? h.shields : Math.min(2, Math.floor(streak / 14));

  const habitV2: Habit = {
    id: h.id || `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: h.title || 'Untitled Habit',
    description: h.description || '',
    category: h.category || 'growth',
    type: h.type || 'boolean',
    targetValue: h.targetValue,
    unit: h.unit,
    icon: h.icon || 'CheckCircle2',
    color: h.color || 'green',
    timeOfDay: h.timeOfDay || 'morning',
    createdAt: h.createdAt || '2026-06-01',
    schedule,
    restDays,
    streak,
    bestStreak,
    shields,
    completedDates: Array.isArray(h.completedDates) ? h.completedDates : [],
    skippedDates: Array.isArray(h.skippedDates) ? h.skippedDates : [],
    shieldedDates: Array.isArray(h.shieldedDates) ? h.shieldedDates : [],
    recoveredDates: Array.isArray(h.recoveredDates) ? h.recoveredDates : [],
    restDates: Array.isArray(h.restDates) ? h.restDates : [],
    numericLogs: h.numericLogs || {},
    durationLogs: h.durationLogs || {},
    identity: h.identity || '',
    archived: Boolean(h.archived),
  };

  // Re-evaluate streak with forgiveness and shields if completed dates are recorded
  if (habitV2.completedDates.length > 0) {
    const streakRes = evaluateHabitStreak(habitV2, todayKey);
    habitV2.streak = streakRes.currentStreak;
    habitV2.bestStreak = streakRes.bestStreak;
    habitV2.shields = streakRes.availableShields;
    habitV2.shieldedDates = streakRes.shieldedDates;
    habitV2.recoveredDates = streakRes.recoveredDates;
  }

  return habitV2;
}

/**
 * Perform transparent migration from v1 localStorage into Dexie IndexedDB
 */
export async function initializeAndMigrateStorage(todayKey: string = getLogicalTodayKey()): Promise<{
  habits: Habit[];
  history: Record<string, DayActivity>;
  settings: AppSettings;
}> {
  try {
    // Check if Dexie already has records
    const habitCount = await db.habits.count();

    if (habitCount > 0) {
      // Dexie is populated
      const dbHabits = await db.habits.toArray();
      const dbHistoryList = await db.history.toArray();
      const historyMap: Record<string, DayActivity> = {};
      dbHistoryList.forEach((item) => {
        historyMap[item.date] = item;
      });

      const settingsRecord = await db.settings.get('app_settings');
      const settings = (settingsRecord?.value as AppSettings) || DEFAULT_APP_SETTINGS;

      return { habits: dbHabits, history: historyMap, settings };
    }

    // Dexie is empty: check localStorage for v1 data
    const rawV1Habits = localStorage.getItem(V1_STORAGE_KEYS.HABITS);
    const rawV1History = localStorage.getItem(V1_STORAGE_KEYS.HISTORY);

    let habits: Habit[] = [];
    let history: Record<string, DayActivity> = {};

    if (rawV1Habits) {
      const parsedHabits = JSON.parse(rawV1Habits);
      habits = parsedHabits.map((h: any) => migrateV1HabitToV2(h, todayKey));
    }

    if (rawV1History) {
      const parsedHistory = JSON.parse(rawV1History);
      Object.keys(parsedHistory).forEach((dateKey) => {
        const item = parsedHistory[dateKey];
        history[dateKey] = {
          date: dateKey,
          habitsCompleted: item.habitsCompleted || 0,
          totalHabits: item.totalHabits || habits.length,
          consistencyPercentage: item.consistencyPercentage || 0,
          consistencyScore: item.consistencyScore || item.consistencyPercentage || 0,
          focusMinutes: item.focusMinutes || 0,
        };
      });
    }

    // If still empty, generate default habits
    if (habits.length === 0) {
      const { DEFAULT_HABITS } = await import('../utils/storage');
      habits = DEFAULT_HABITS.map((h) => migrateV1HabitToV2(h, todayKey));
    }

    // Calculate score on all history dates
    const scoreRes = calculateConsistencyScore(habits, todayKey, history);
    if (!history[todayKey]) {
      history[todayKey] = {
        date: todayKey,
        habitsCompleted: 0,
        totalHabits: habits.length,
        consistencyPercentage: 0,
        consistencyScore: scoreRes.score,
        projectedScore: scoreRes.projectedScore,
        focusMinutes: 0,
      };
    }

    // Save to Dexie
    await db.transaction('rw', db.habits, db.history, db.settings, async () => {
      await db.habits.bulkPut(habits);
      await db.history.bulkPut(Object.values(history));
      await db.settings.put({ key: 'app_settings', value: DEFAULT_APP_SETTINGS });
    });

    localStorage.setItem(V1_STORAGE_KEYS.MIGRATED_V2, 'true');

    return { habits, history, settings: DEFAULT_APP_SETTINGS };
  } catch (err) {
    console.warn('Dexie initialization failed or not available, falling back to localStorage cache', err);
    // Fallback safely
    const rawV1Habits = localStorage.getItem(V1_STORAGE_KEYS.HABITS);
    const rawV1History = localStorage.getItem(V1_STORAGE_KEYS.HISTORY);
    const habits: Habit[] = rawV1Habits ? JSON.parse(rawV1Habits).map((h: any) => migrateV1HabitToV2(h, todayKey)) : [];
    const history: Record<string, DayActivity> = rawV1History ? JSON.parse(rawV1History) : {};
    return { habits, history, settings: DEFAULT_APP_SETTINGS };
  }
}

/**
 * Resets the application database to zero (clean slate for a new user).
 */
export async function resetDatabaseToZero(): Promise<{
  habits: Habit[];
  history: Record<string, DayActivity>;
}> {
  const { FRESH_STARTER_HABITS } = await import('../utils/storage');
  const todayKey = getLogicalTodayKey();

  const freshHabits: Habit[] = FRESH_STARTER_HABITS.map((h) => ({
    ...h,
    createdAt: todayKey,
    streak: 0,
    bestStreak: 0,
    shields: 0,
    completedDates: [],
    numericLogs: {},
    durationLogs: {},
  }));

  const freshHistory: Record<string, DayActivity> = {
    [todayKey]: {
      date: todayKey,
      habitsCompleted: 0,
      totalHabits: freshHabits.length,
      consistencyPercentage: 0,
      consistencyScore: 100,
      projectedScore: 100,
      focusMinutes: 0,
    },
  };

  localStorage.removeItem(V1_STORAGE_KEYS.HABITS);
  localStorage.removeItem(V1_STORAGE_KEYS.HISTORY);
  localStorage.removeItem(V1_STORAGE_KEYS.STATS);
  localStorage.setItem(V1_STORAGE_KEYS.HABITS, JSON.stringify(freshHabits));
  localStorage.setItem(V1_STORAGE_KEYS.HISTORY, JSON.stringify(freshHistory));

  try {
    if (db.isOpen()) {
      await db.transaction('rw', db.habits, db.history, async () => {
        await db.habits.clear();
        await db.history.clear();
        await db.habits.bulkPut(freshHabits);
        await db.history.bulkPut(Object.values(freshHistory));
      });
    }
  } catch (err) {
    console.warn('Failed to clear Dexie tables during reset', err);
  }

  return { habits: freshHabits, history: freshHistory };
}

/**
 * Loads rich 180-day sample data for demonstration purposes.
 */
export async function loadDemoSampleData(): Promise<{
  habits: Habit[];
  history: Record<string, DayActivity>;
}> {
  const { generateSeedData } = await import('../utils/storage');
  const { habits: sampleHabits, history: sampleHistory } = generateSeedData();

  localStorage.setItem(V1_STORAGE_KEYS.HABITS, JSON.stringify(sampleHabits));
  localStorage.setItem(V1_STORAGE_KEYS.HISTORY, JSON.stringify(sampleHistory));

  try {
    if (db.isOpen()) {
      await db.transaction('rw', db.habits, db.history, async () => {
        await db.habits.clear();
        await db.history.clear();
        await db.habits.bulkPut(sampleHabits);
        await db.history.bulkPut(Object.values(sampleHistory));
      });
    }
  } catch (err) {
    console.warn('Failed to populate Dexie with demo data', err);
  }

  return { habits: sampleHabits, history: sampleHistory };
}

/**
 * Persist habits to Dexie and localStorage cache
 */
export async function persistHabits(habits: Habit[]): Promise<void> {
  try {
    localStorage.setItem(V1_STORAGE_KEYS.HABITS, JSON.stringify(habits));
    if (db.isOpen()) {
      await db.habits.bulkPut(habits);
    }
  } catch (e) {
    console.error('Failed to persist habits', e);
  }
}

/**
 * Persist history to Dexie and localStorage cache
 */
export async function persistHistory(history: Record<string, DayActivity>): Promise<void> {
  try {
    localStorage.setItem(V1_STORAGE_KEYS.HISTORY, JSON.stringify(history));
    if (db.isOpen()) {
      await db.history.bulkPut(Object.values(history));
    }
  } catch (e) {
    console.error('Failed to persist history', e);
  }
}

/**
 * Persist settings
 */
export async function persistSettings(settings: AppSettings): Promise<void> {
  try {
    localStorage.setItem('upgrade_settings_v2', JSON.stringify(settings));
    if (db.isOpen()) {
      await db.settings.put({ key: 'app_settings', value: settings });
    }
  } catch (e) {
    console.error('Failed to persist settings', e);
  }
}

/**
 * Export all data to JSON string
 */
export function exportToJSON(
  habits: Habit[],
  history: Record<string, DayActivity>,
  settings?: AppSettings
): string {
  const payload = {
    appName: 'upGrade',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    settings: settings || DEFAULT_APP_SETTINGS,
    data: {
      habits,
      history,
    },
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Export data to CSV string
 */
export function exportToCSV(
  habits: Habit[],
  history: Record<string, DayActivity>
): { habitsCSV: string; historyCSV: string } {
  // 1. Habits CSV
  const habitHeaders = [
    'id',
    'title',
    'category',
    'type',
    'targetValue',
    'unit',
    'streak',
    'bestStreak',
    'shields',
    'createdAt',
  ];
  const habitRows = habits.map((h) => [
    `"${h.id}"`,
    `"${h.title.replace(/"/g, '""')}"`,
    `"${h.category}"`,
    `"${h.type}"`,
    h.targetValue ?? '',
    `"${h.unit || ''}"`,
    h.streak,
    h.bestStreak,
    h.shields,
    `"${h.createdAt}"`,
  ]);
  const habitsCSV = [habitHeaders.join(','), ...habitRows.map((r) => r.join(','))].join('\n');

  // 2. History CSV
  const historyHeaders = [
    'date',
    'habitsCompleted',
    'totalHabits',
    'consistencyPercentage',
    'consistencyScore',
    'focusMinutes',
  ];
  const sortedDates = Object.keys(history).sort();
  const historyRows = sortedDates.map((date) => {
    const item = history[date];
    return [
      `"${item.date}"`,
      item.habitsCompleted,
      item.totalHabits,
      item.consistencyPercentage,
      item.consistencyScore,
      item.focusMinutes,
    ];
  });
  const historyCSV = [historyHeaders.join(','), ...historyRows.map((r) => r.join(','))].join('\n');

  return { habitsCSV, historyCSV };
}

/**
 * Import and validate JSON data
 */
export function parseAndValidateJSONImport(jsonString: string): {
  success: boolean;
  habits?: Habit[];
  history?: Record<string, DayActivity>;
  settings?: AppSettings;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File content is not valid JSON.' };
    }

    const todayKey = getLogicalTodayKey();
    let importedHabits: Habit[] = [];
    let importedHistory: Record<string, DayActivity> = {};

    if (parsed.data && Array.isArray(parsed.data.habits)) {
      importedHabits = parsed.data.habits.map((h: any) => migrateV1HabitToV2(h, todayKey));
    } else if (Array.isArray(parsed.habits)) {
      importedHabits = parsed.habits.map((h: any) => migrateV1HabitToV2(h, todayKey));
    } else {
      return { success: false, error: 'Missing habits array in import payload.' };
    }

    if (parsed.data && parsed.data.history && typeof parsed.data.history === 'object') {
      importedHistory = parsed.data.history;
    } else if (parsed.history && typeof parsed.history === 'object') {
      importedHistory = parsed.history;
    }

    const settings = parsed.settings || DEFAULT_APP_SETTINGS;

    return {
      success: true,
      habits: importedHabits,
      history: importedHistory,
      settings,
    };
  } catch (err) {
    return { success: false, error: `Invalid JSON format: ${(err as Error).message}` };
  }
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

function cleanCSVValue(val: string): string {
  let s = val.trim();
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    s = s.slice(1, -1);
  }
  return s.replace(/""/g, '"');
}

/**
 * Import Habits CSV
 */
export function parseHabitsCSV(csvContent: string): Habit[] {
  const lines = csvContent.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = parseCSVLine(lines[0]).map(cleanCSVValue);
  const todayKey = getLogicalTodayKey();
  const habits: Habit[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map(cleanCSVValue);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    if (row.title) {
      habits.push(
        migrateV1HabitToV2(
          {
            id: row.id || `csv-habit-${i}`,
            title: row.title,
            category: row.category || 'growth',
            type: row.type || 'boolean',
            targetValue: row.targetValue ? Number(row.targetValue) : undefined,
            unit: row.unit || undefined,
            streak: row.streak ? Number(row.streak) : 0,
            bestStreak: row.bestStreak ? Number(row.bestStreak) : 0,
            shields: row.shields ? Number(row.shields) : 0,
            createdAt: row.createdAt || todayKey,
          },
          todayKey
        )
      );
    }
  }

  return habits;
}
