export type HabitCategory = 'dev' | 'health' | 'focus' | 'mindset' | 'growth' | 'custom';

export type HabitColor = 'green' | 'amber' | 'purple' | 'emerald' | 'orange' | 'red' | 'ochre';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type HabitType = 
  | 'boolean'   // Yes / No completion
  | 'numeric'   // Backward compatible with v1
  | 'quantity'  // Target quantity with unit (liters, pages, etc.)
  | 'duration'  // Target duration in hours/minutes
  | 'timer';    // Count-up timer / stopwatch linked to habit

export type ScheduleType = 'daily' | 'weekdays' | 'weekly_target' | 'specific_days';

export interface HabitSchedule {
  type: ScheduleType;
  targetDaysPerWeek?: number; // for 'weekly_target', e.g. 3
  days?: number[];            // for 'specific_days', 0=Sun, 1=Mon, ..., 6=Sat
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  type: HabitType;
  targetValue?: number;
  unit?: string;
  icon: string;
  color: HabitColor;
  timeOfDay: TimeOfDay;
  createdAt: string; // YYYY-MM-DD
  
  // Phase 1: Schedule & Rest Days
  schedule: HabitSchedule;
  restDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (never count against streaks)

  // Phase 1: Streak & Forgiveness
  streak: number;
  bestStreak: number;
  shields: number; // 0 to 2 (1 earned per 14-day streak, max 2 stored)

  // History & Date Statuses
  completedDates: string[]; // YYYY-MM-DD
  skippedDates?: string[];  // explicitly skipped
  shieldedDates?: string[]; // auto-consumed shield protected streak
  recoveredDates?: string[]; // "Never miss twice" recovery completion
  restDates?: string[];     // marked as rest

  // Value Logging
  numericLogs?: Record<string, number>;  // date -> logged value (e.g., pages, liters)
  durationLogs?: Record<string, number>; // date -> logged minutes

  // Phase 2 Preparation
  identity?: string; // e.g. "I am someone who ships daily"
  archived?: boolean;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  habitsCompleted: number;
  totalHabits: number;
  consistencyPercentage: number; // Raw daily %
  consistencyScore: number;       // Rolling 28-day exponential decay score
  projectedScore?: number;        // Projected score if in-progress today finishes
  focusMinutes: number;
  mood?: number;                  // 1-5 mood score (Phase 2 G)
  note?: string;                  // Short reflection (Phase 2 G)
}

export interface UserStats {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  currentStreak: number;
  bestStreak: number;
  totalCheckins: number;
  consistencyRating: number; // 28-day weighted score
  projectedRating?: number;  // Today's projected score
  availableShields: number;  // Total shields across active habits
}

export interface AppSettings {
  dayRolloverHour: number; // e.g. 4 for 4am rollover (night owls)
  timezone: string;        // e.g. 'America/New_York'
  theme: 'auto' | 'light' | 'dark';
  accentIntensity: 'default' | 'vibrant' | 'calm';
  weekStartsOn: 0 | 1;     // 0 = Sunday, 1 = Monday
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  aiCoachEnabled: boolean;
}

export interface UndoAction {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  undo: () => void | Promise<void>;
  redo?: () => void | Promise<void>;
}

export type ViewTab = 'dashboard' | 'heatmap' | 'analytics' | 'focus' | 'design-system';

export interface FilterOptions {
  category: HabitCategory | 'all';
  timeOfDay: TimeOfDay | 'all';
  searchQuery: string;
  status: 'all' | 'completed' | 'pending';
}
