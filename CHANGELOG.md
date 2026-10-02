# Changelog: upGrade v2

All notable changes to upGrade are documented here.

## [2.0.0-phase1] - 2026-10-02

### Added
- **Rolling 28-Day Consistency Score (`src/core/score.ts`)**:
  - Replaces raw daily percentage with a mathematically grounded exponential decay weighted score ($w_k = \lambda^{k-1}$, $\lambda = 0.96$).
  - Recent days weigh more; missing a single day gently dents the score (~4-6%) without destroying momentum.
  - Today is always treated as "in progress" and excluded from the official past score, preventing demotivating morning score drops while rendering a projected score.
- **Forgiveness Mechanics & Streaks (`src/core/streaks.ts`)**:
  - **"Never miss twice"**: A single missed day between completed days never resets a streak; the next completed day restores the streak with a subtle "Recovered" badge.
  - **Streak Shields**: 1 shield earned per 14-day unbroken streak (max 2 stored). Automatically protects streaks on missed days with a calm notice.
  - **Scheduled Rest Days**: Habits can define custom weekly rest days (e.g. weekends for code, Wednesday/Sunday for fitness) that are strictly exempt from penalizing streaks or consistency scores.
- **Extended Habit Types & Schedules (`src/core/types.ts`)**:
  - Added support for 4 habit types: Yes/No (`boolean`), Quantity (`quantity` with units like liters or pages), Duration (`duration` in hours), and Stopwatch (`timer`).
  - Added 4 schedule types: `daily`, `weekdays`, `weekly_target` ($N$ days/week), and `specific_days` with weekday selectors.
- **Time Model & Night Owl Rollover (`src/core/time.ts`)**:
  - Local timezone resolution (`Intl.DateTimeFormat`).
  - Configurable day rollover hour (default 4:00 AM) so late-night check-ins count toward the previous day without breaking streaks.
  - Support for backfilling past dates and relative date differences.
- **Local-First Storage & Undo Stack (`src/core/db.ts`, `src/core/undo.ts`)**:
  - IndexedDB implementation with Dexie.js (`UpgradeDatabase` v2 schema).
  - Transparent migration of legacy `v1` localStorage habits and tracking records into Dexie without any data loss.
  - Dual-write caching ensures 0ms hydration on startup with reliable persistent storage.
  - Comprehensive export and import for both JSON backups and CSV spreadsheets (RFC 4180 compliant).
  - 20-action undo stack with `⌘Z` / `Ctrl+Z` (and `⇧⌘Z` / `Ctrl+Y` redo) shortcuts and a floating Apple Clean undo toast.
- **Unit Test Suite**:
  - 19 unit tests passing across `score.test.ts`, `streaks.test.ts`, `time.test.ts`, and `db.test.ts`.
