import { Habit } from './types';

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateKey(date: Date, timezone?: string): string {
  if (timezone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date);
    } catch {
      // Fallback if timezone string is invalid
    }
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD string into a standard Date at local noon (to prevent DST boundary issues)
 */
export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/**
 * Compute the "logical" today date key taking into account custom day rollover hour.
 * For example: if rolloverHour is 4 (4:00 AM), 2:30 AM on Oct 3 belongs to Oct 2.
 */
export function getLogicalTodayKey(options?: {
  rolloverHour?: number;
  timezone?: string;
  now?: Date;
}): string {
  const rolloverHour = options?.rolloverHour ?? 4; // Default to 4 AM for night owls
  const now = options?.now ?? new Date();

  // Shift timestamp backward by rolloverHour
  const shiftedMs = now.getTime() - rolloverHour * 3600 * 1000;
  const shiftedDate = new Date(shiftedMs);

  return formatDateKey(shiftedDate, options?.timezone);
}

/**
 * Add or subtract days from a YYYY-MM-DD string
 */
export function addDays(dateKey: string, delta: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + delta);
  return formatDateKey(date);
}

/**
 * Compute difference in whole calendar days: toKey - fromKey
 */
export function getDaysDifference(fromKey: string, toKey: string): number {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  const diffMs = to.getTime() - from.getTime();
  return Math.round(diffMs / (24 * 3600 * 1000));
}

/**
 * Returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
 */
export function getDayOfWeek(dateKey: string): number {
  return parseDateKey(dateKey).getDay();
}

/**
 * Returns true if dateKey is strictly before todayKey
 */
export function isPastDate(dateKey: string, todayKey: string): boolean {
  return dateKey < todayKey;
}

/**
 * Returns a list of past N date keys ending at (and including/excluding) the reference date
 */
export function getPastDateRange(count: number, endDateKey: string, includeEnd = false): string[] {
  const result: string[] = [];
  const startOffset = includeEnd ? 0 : 1;
  for (let i = count - 1 + startOffset; i >= startOffset; i--) {
    result.push(addDays(endDateKey, -i));
  }
  return result;
}

/**
 * Checks whether a given habit is scheduled on the specified dateKey,
 * and whether that day is considered a scheduled Rest Day.
 */
export function getHabitScheduleStatus(
  habit: Habit,
  dateKey: string
): { isScheduled: boolean; isRestDay: boolean } {
  const dayOfWeek = getDayOfWeek(dateKey);

  // Check if it's an explicit or scheduled rest day
  const isScheduledRestDay = (habit.restDays || []).includes(dayOfWeek);
  const isExplicitRestDate = (habit.restDates || []).includes(dateKey);
  const isRestDay = isScheduledRestDay || isExplicitRestDate;

  if (isRestDay) {
    return { isScheduled: false, isRestDay: true };
  }

  const schedule = habit.schedule || { type: 'daily' };

  switch (schedule.type) {
    case 'daily':
      return { isScheduled: true, isRestDay: false };

    case 'weekdays':
      // 1 = Monday to 5 = Friday
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      return { isScheduled: isWeekday, isRestDay: !isWeekday };

    case 'specific_days':
      const isSpecificDay = (schedule.days || []).includes(dayOfWeek);
      return { isScheduled: isSpecificDay, isRestDay: !isSpecificDay };

    case 'weekly_target':
      // Target N days a week: every day is an eligible candidate until target is hit
      return { isScheduled: true, isRestDay: false };

    default:
      return { isScheduled: true, isRestDay: false };
  }
}
