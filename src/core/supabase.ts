import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from './db';
import { Habit, DayActivity } from './types';

const STORAGE_KEY_URL = 'upgrade_supabase_url';
const STORAGE_KEY_ANON = 'upgrade_supabase_anon_key';

// Default project credentials from user if not set in env
const DEFAULT_PROJECT_URL = 'https://scbgpwosdhwrxlnqhckf.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_L96T9JRc3AcMJbIx5Xh2yQ_ETlJMznj';

export function getSupabaseCredentials(): { url: string; key: string } {
  const url = 
    (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_URL)) ||
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    DEFAULT_PROJECT_URL;
  const key = 
    (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_ANON)) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    DEFAULT_ANON_KEY;
  return { url: url.trim(), key: key.trim() };
}

export function saveSupabaseCredentials(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    if (key) localStorage.setItem(STORAGE_KEY_ANON, key.trim());
    _cachedClient = null; // reset cached client
  }
}

let _cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_cachedClient) return _cachedClient;
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  try {
    _cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return _cachedClient;
  } catch (err) {
    console.warn('[upGrade] Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

/**
 * Tests connection to the Supabase instance
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    const { url } = getSupabaseCredentials();
    if (!url) {
      return { 
        success: false, 
        message: 'Supabase Project URL is missing. Enter your project URL (e.g. https://xyz.supabase.co).' 
      };
    }
    return { success: false, message: 'Invalid Supabase configuration.' };
  }

  try {
    // Attempt a lightweight probe on habits table
    const { error } = await client.from('habits').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        // Connected to Supabase project, but tables are not yet created
        return { 
          success: true, 
          message: 'Connected to Supabase project! (Tables not created yet — click Copy SQL Schema below and run it in Supabase).' 
        };
      }
      return { success: false, message: `Supabase returned: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected and verified Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed.' };
  }
}

/**
 * Push all local Dexie IndexedDB records to Supabase
 */
export async function syncLocalToSupabase(): Promise<{ 
  success: boolean; 
  syncedHabits: number; 
  syncedHistory: number; 
  message?: string 
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, syncedHabits: 0, syncedHistory: 0, message: 'Supabase not configured' };
  }

  try {
    const localHabits = await db.habits.toArray();
    const localHistory = await db.history.toArray();

    if (localHabits.length > 0) {
      const { error: habitsError } = await client
        .from('habits')
        .upsert(localHabits, { onConflict: 'id' });
      if (habitsError) throw habitsError;
    }

    if (localHistory.length > 0) {
      const { error: historyError } = await client
        .from('history')
        .upsert(localHistory, { onConflict: 'date' });
      if (historyError) throw historyError;
    }

    return {
      success: true,
      syncedHabits: localHabits.length,
      syncedHistory: localHistory.length,
      message: `Synced ${localHabits.length} rituals and ${localHistory.length} history records to cloud.`,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedHabits: 0,
      syncedHistory: 0,
      message: err?.message || 'Cloud sync failed',
    };
  }
}

/**
 * Pull Supabase records into local Dexie IndexedDB
 */
export async function syncSupabaseToLocal(): Promise<{ 
  success: boolean; 
  count: number; 
  message?: string 
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, message: 'Supabase not configured' };
  }

  try {
    const { data: habits, error: hErr } = await client.from('habits').select('*');
    if (hErr) throw hErr;

    const { data: history, error: histErr } = await client.from('history').select('*');
    if (histErr) throw histErr;

    let count = 0;
    if (habits && habits.length > 0) {
      await db.habits.bulkPut(habits as Habit[]);
      count += habits.length;
    }
    if (history && history.length > 0) {
      await db.history.bulkPut(history as DayActivity[]);
      count += history.length;
    }

    return {
      success: true,
      count,
      message: `Pulled ${count} records from Supabase into local storage.`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: err?.message || 'Pull from Supabase failed',
    };
  }
}

/**
 * DDL SQL for creating Supabase tables in Supabase SQL editor
 */
export const SUPABASE_SCHEMA_SQL = `
-- upGrade v2 Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Habits / Rituals Table
CREATE TABLE IF NOT EXISTS public.habits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'growth',
  type TEXT DEFAULT 'boolean',
  "targetValue" NUMERIC,
  unit TEXT,
  icon TEXT DEFAULT 'CheckCircle2',
  color TEXT DEFAULT 'orange',
  "timeOfDay" TEXT DEFAULT 'morning',
  "createdAt" TEXT NOT NULL,
  schedule JSONB DEFAULT '{"type":"daily"}'::jsonb,
  "restDays" JSONB DEFAULT '[]'::jsonb,
  streak INTEGER DEFAULT 0,
  "bestStreak" INTEGER DEFAULT 0,
  shields INTEGER DEFAULT 0,
  "completedDates" JSONB DEFAULT '[]'::jsonb,
  "skippedDates" JSONB DEFAULT '[]'::jsonb,
  "shieldedDates" JSONB DEFAULT '[]'::jsonb,
  "recoveredDates" JSONB DEFAULT '[]'::jsonb,
  "restDates" JSONB DEFAULT '[]'::jsonb,
  "numericLogs" JSONB DEFAULT '{}'::jsonb,
  "durationLogs" JSONB DEFAULT '{}'::jsonb,
  identity TEXT,
  archived BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily History & Reflection Table
CREATE TABLE IF NOT EXISTS public.history (
  date TEXT PRIMARY KEY, -- YYYY-MM-DD
  "habitsCompleted" INTEGER DEFAULT 0,
  "totalHabits" INTEGER DEFAULT 0,
  "consistencyPercentage" NUMERIC DEFAULT 0,
  "consistencyScore" NUMERIC DEFAULT 0,
  "projectedScore" NUMERIC,
  "focusMinutes" INTEGER DEFAULT 0,
  mood INTEGER,
  note TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS) - Permissive public access with publishable key
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access with publishable key" ON public.habits
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access with publishable key" ON public.history
  FOR ALL USING (true) WITH CHECK (true);
`;
