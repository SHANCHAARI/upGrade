import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  isSupabaseConfigured,
  SUPABASE_SCHEMA_SQL
} from '../supabase';

describe('Supabase Cloud Sync module', () => {
  let mockStore: Record<string, string> = {};

  beforeAll(() => {
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; },
    };
    (globalThis as any).window = globalThis;
    (globalThis as any).localStorage = mockLocalStorage;
  });

  beforeEach(() => {
    mockStore = {};
  });

  it('loads the default project URL and publishable key provided by user', () => {
    const creds = getSupabaseCredentials();
    expect(creds.url).toBe('https://scbgpwosdhwrxlnqhckf.supabase.co');
    expect(creds.key).toBe('sb_publishable_L96T9JRc3AcMJbIx5Xh2yQ_ETlJMznj');
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('saves and reads custom project URL and key in localStorage', () => {
    const testUrl = 'https://customproject.supabase.co';
    const testKey = 'sb_publishable_custom123';
    saveSupabaseCredentials(testUrl, testKey);

    const creds = getSupabaseCredentials();
    expect(creds.url).toBe(testUrl);
    expect(creds.key).toBe(testKey);
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('contains valid PostgreSQL DDL table definitions in SUPABASE_SCHEMA_SQL', () => {
    expect(SUPABASE_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS public.habits');
    expect(SUPABASE_SCHEMA_SQL).toContain('CREATE TABLE IF NOT EXISTS public.history');
    expect(SUPABASE_SCHEMA_SQL).toContain('ENABLE ROW LEVEL SECURITY');
  });
});
