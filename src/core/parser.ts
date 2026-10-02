import { Habit } from './types';

export interface ParsedCommand {
  type: 
    | 'COMPLETE_HABIT'
    | 'LOG_NUMERIC'
    | 'ADD_HABIT'
    | 'NAVIGATE'
    | 'SET_DATE'
    | 'START_FOCUS'
    | 'UNKNOWN';
  habit?: Habit;
  habitTitle?: string;
  value?: number;
  unit?: string;
  scheduleType?: 'daily' | 'weekdays' | 'specific_days';
  targetTab?: string;
  targetDate?: string;
  durationMinutes?: number;
  previewText: string;
  actionText: string;
}

/**
 * Natural-language rule-based parser for Command Bar (Phase 2 A)
 * Handles:
 * - "gym done", "code complete", "deep work done" -> COMPLETE_HABIT
 * - "deep work 2.5h", "water 1.5", "reading 25 pages" -> LOG_NUMERIC
 * - "add habit read 20 pages weekdays" -> ADD_HABIT
 * - "show march", "show yesterday", "show today" -> SET_DATE
 * - "focus 25", "focus 50", "start focus" -> START_FOCUS
 * - "today", "year", "terrain", "trends", "settings", "backup" -> NAVIGATE
 */
export function parseNaturalLanguageCommand(
  rawInput: string,
  habits: Habit[]
): ParsedCommand | null {
  const query = rawInput.trim();
  if (!query) return null;
  const lower = query.toLowerCase();

  // 1. Navigation shortcuts
  if (['today', 'dashboard', 'home'].includes(lower)) {
    return {
      type: 'NAVIGATE',
      targetTab: 'dashboard',
      previewText: 'Go to Today page',
      actionText: 'Navigate to Today',
    };
  }
  if (['year', 'landscape', 'terrain', 'heatmap', '365'].includes(lower)) {
    return {
      type: 'NAVIGATE',
      targetTab: 'heatmap',
      previewText: 'Go to Growth Landscape / Year',
      actionText: 'Navigate to Year Landscape',
    };
  }
  if (['trends', 'analytics', 'charts', 'stats'].includes(lower)) {
    return {
      type: 'NAVIGATE',
      targetTab: 'analytics',
      previewText: 'Go to Trends & Analytics',
      actionText: 'Navigate to Trends',
    };
  }
  if (['focus', 'timer', 'deep work'].includes(lower) && !lower.includes('done') && !/\d/.test(lower)) {
    return {
      type: 'NAVIGATE',
      targetTab: 'focus',
      previewText: 'Open Focus Mode',
      actionText: 'Open Focus Timer',
    };
  }
  if (['backup', 'export', 'import', 'supabase', 'cloud', 'sync'].includes(lower)) {
    return {
      type: 'NAVIGATE',
      targetTab: 'backup' as any,
      previewText: 'Open Storage, Backup & Cloud Sync',
      actionText: 'Open Backup & Supabase Sync',
    };
  }

  // 2. Start Focus Timer preset: "focus 25", "focus 50m", "timer 45"
  const focusMatch = lower.match(/^(?:focus|timer|pomodoro)\s+(\d+)(?:m|min|mins)?$/);
  if (focusMatch) {
    const mins = parseInt(focusMatch[1], 10);
    return {
      type: 'START_FOCUS',
      durationMinutes: mins,
      previewText: `Start ${mins}m Focus Session`,
      actionText: `Launch ${mins} min Focus Mode`,
    };
  }

  // 3. Date jump commands: "show march", "show yesterday", "show today"
  if (lower === 'show today' || lower === 'today') {
    return {
      type: 'SET_DATE',
      targetDate: 'today',
      previewText: 'Jump to Today',
      actionText: 'View Today',
    };
  }
  if (lower === 'show yesterday' || lower === 'yesterday') {
    return {
      type: 'SET_DATE',
      targetDate: 'yesterday',
      previewText: 'Jump to Yesterday',
      actionText: 'View Yesterday',
    };
  }
  const monthMatch = lower.match(/^(?:show\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)$/);
  if (monthMatch) {
    const month = monthMatch[1];
    return {
      type: 'SET_DATE',
      targetDate: month,
      previewText: `Show ${month.charAt(0).toUpperCase() + month.slice(1)} tracking`,
      actionText: `Jump to ${month}`,
    };
  }

  // 4. "add habit [name] [optional target and unit] [optional schedule]"
  // e.g. "add habit read 20 pages weekdays"
  if (lower.startsWith('add habit ') || lower.startsWith('new habit ')) {
    const rest = query.replace(/^(add habit|new habit)\s+/i, '').trim();
    let scheduleType: 'daily' | 'weekdays' | 'specific_days' = 'daily';
    let cleanName = rest;

    if (/weekdays?$/i.test(cleanName)) {
      scheduleType = 'weekdays';
      cleanName = cleanName.replace(/weekdays?$/i, '').trim();
    } else if (/daily$/i.test(cleanName)) {
      scheduleType = 'daily';
      cleanName = cleanName.replace(/daily$/i, '').trim();
    }

    // Check for target number + unit at the end
    const targetMatch = cleanName.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
    if (targetMatch) {
      const name = targetMatch[1].trim();
      const val = parseFloat(targetMatch[2]);
      const unit = targetMatch[3] || 'units';
      return {
        type: 'ADD_HABIT',
        habitTitle: name,
        value: val,
        unit: unit,
        scheduleType,
        previewText: `Create habit: "${name}" (${val} ${unit}, ${scheduleType})`,
        actionText: 'Add New Habit',
      };
    }

    return {
      type: 'ADD_HABIT',
      habitTitle: cleanName,
      scheduleType,
      previewText: `Create habit: "${cleanName}" (${scheduleType})`,
      actionText: 'Add New Habit',
    };
  }

  // 5. Completion commands: "[habit] done", "complete [habit]", "[habit] finished"
  const doneRegex = /^(?:complete\s+(.+)|(.+?)\s+(?:done|finished|checked|complete|yes))$/i;
  const doneMatch = query.match(doneRegex);
  if (doneMatch) {
    const rawTarget = (doneMatch[1] || doneMatch[2]).trim().toLowerCase();
    const matchedHabit = habits.find((h) =>
      h.title.toLowerCase().includes(rawTarget) ||
      rawTarget.includes(h.title.toLowerCase()) ||
      (h.category && h.category.toLowerCase() === rawTarget)
    );

    if (matchedHabit) {
      return {
        type: 'COMPLETE_HABIT',
        habit: matchedHabit,
        habitTitle: matchedHabit.title,
        previewText: `Mark "${matchedHabit.title}" as complete`,
        actionText: `Complete ${matchedHabit.title}`,
      };
    }
  }

  // 6. Numeric logging: "[habit] [value][unit]", e.g. "deep work 2.5h", "water 2.0L", "read 25"
  const numericMatch = query.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(h(?:rs?|ours?)?|pages?|p|l(?:iters?)?|m(?:ins?)?|minutes?|reps?|km)?$/i);
  if (numericMatch) {
    const rawHabit = numericMatch[1].trim().toLowerCase();
    const val = parseFloat(numericMatch[2]);
    const unit = numericMatch[3] || '';

    const matchedHabit = habits.find((h) =>
      h.title.toLowerCase().includes(rawHabit) ||
      rawHabit.includes(h.title.toLowerCase()) ||
      (h.category && h.category.toLowerCase() === rawHabit)
    );

    if (matchedHabit) {
      return {
        type: 'LOG_NUMERIC',
        habit: matchedHabit,
        habitTitle: matchedHabit.title,
        value: val,
        unit: unit || matchedHabit.unit || '',
        previewText: `Log ${val} ${unit || matchedHabit.unit || ''} to "${matchedHabit.title}"`,
        actionText: `Log value to ${matchedHabit.title}`,
      };
    }
  }

  // 7. Habit search fallback: if user typed part of a habit name
  const matchedHabit = habits.find((h) =>
    h.title.toLowerCase().includes(lower)
  );
  if (matchedHabit) {
    const isDone = matchedHabit.completedDates.includes(new Date().toISOString().split('T')[0]);
    return {
      type: 'COMPLETE_HABIT',
      habit: matchedHabit,
      habitTitle: matchedHabit.title,
      previewText: `${isDone ? 'Toggle / undo' : 'Complete'} "${matchedHabit.title}"`,
      actionText: `Toggle ${matchedHabit.title}`,
    };
  }

  return null;
}
