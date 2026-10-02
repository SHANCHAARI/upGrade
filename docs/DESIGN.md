# upGrade v2 Design System & Core Architecture

## 1. Visual Tokens & Theme Architecture

upGrade follows the **Apple Clean** design philosophy: clarity, deference, and depth.

### Rule Zero: Zero Blue
- Blue in all its forms (sky, cyan, teal, indigo, navy, and cool greys) is strictly banned across UI, charts, library defaults, focus outlines, icons, illustrations, and scrollbars.
- All neutrals are warm with $R \ge G \ge B$.

### Light Mode ("Biscuit")
- `--bg`: `#F1E6D3` (page background)
- `--surface`: `#FAF4E8` (cards, lists, modals)
- `--surface-2`: `#F6EEDF`
- `--fill`: `rgba(110, 80, 40, 0.10)`
- `--separator`: `rgba(90, 65, 35, 0.16)`
- `--label`: `#1E1913` (warm near-black, AA compliant)
- `--label-2`: `#5E5343`
- `--label-3`: `#6F6452` (captions)
- `--accent`: `#C2502A` (terracotta)
- `--on-accent`: `#FFF8EE`

### Dark Mode ("Deep Black")
- `--bg`: `#050505` (page background)
- `--surface`: `#121110` (cards, elevated surfaces)
- `--surface-2`: `#1B1A18`
- `--fill`: `rgba(255, 235, 200, 0.08)`
- `--separator`: `rgba(255, 235, 200, 0.12)`
- `--label`: `#F5EBE1` (warm off-white)
- `--label-2`: `#A89A8A`
- `--label-3`: `#8A7D6E`
- `--accent`: `#FF7A45` (warm orange)
- `--on-accent`: `#1A0F08`

### Glass & Materials
- Vibrancy and backdrop blur (`backdrop-blur-md` / `blur-xl`) are strictly reserved for floating chrome: top navigation, tab bar, modal sheets, and the command palette.

---

## 2. Core Logic & Formulae

### Consistency Score Formula
The rolling 28-day consistency score replaces raw daily percentages with an exponential decay weighted average over the past 28 completed days ($k = 1, \dots, 28$):

$$w_k = \lambda^{k-1}, \quad \text{where } \lambda = 0.96$$

For each past day $d_k$, completion ratio $C_k = \frac{\text{completed / shielded / recovered habits}}{\text{scheduled habits}}$ (scheduled rest days are excluded from the denominator):

$$\text{Consistency Score} = \frac{\sum_{k=1}^{28} w_k \cdot C_k}{\sum_{k=1}^{28} w_k} \times 100$$

- **Weight Decay**: Day 1 (yesterday) has weight $1.00$, Day 14 has weight $0.588$, and Day 28 has weight $0.334$.
- **Graceful Dents**: Missing 1 day only decreases the score by ~4–6%, never wiping away established momentum.
- **In-Progress Today**: Today is strictly excluded from the past 28-day window to guarantee the score never drops upon waking up in the morning. A dashed projected score indicates where the score will land once today's rituals conclude.

### Forgiveness Mechanics & Streaks
1. **"Never Miss Twice"**: A single miss between completed days does not reset a streak. If the next active day is completed, the missed day receives a `recovered` status and the streak continues.
2. **Streak Shields**: 1 shield is earned per 14-day streak, up to a maximum of 2 stored shields. When a day is missed without prior recovery, an available shield is automatically consumed (`shielded`), preserving the streak with a calm toast notice.
3. **Scheduled Rest Days**: Habits can have weekly rest days (e.g. Saturday & Sunday). On these days, habits are exempt from requirement and never break streaks.

---

## 3. Storage, Time & Undo System

### Time Model & Night Owl Rollover
- Configurable `dayRolloverHour` (default `4:00 AM`). Timestamps before 4:00 AM are mathematically shifted backward by 4 hours, ensuring late-night check-ins belong to yesterday's date.
- Explicit backfilling support allows users to navigate to past dates and log completions.

### Local-First Storage (Dexie.js)
- `UpgradeDatabase` stores records in IndexedDB with schema versioning.
- Transparent migration ingests existing `v1` localStorage habits and history into v2 Dexie tables without data loss.
- Dual-write caching ensures 0ms synchronous first paint.
- Full backup export and restore in both JSON and RFC 4180 CSV formats.

### 20-Action Undo Stack
- Maintains a circular buffer of the last 20 actions (`TOGGLE_HABIT`, `UPDATE_NUMERIC`, `ADD_HABIT`, `DELETE_HABIT`).
- Global keyboard listener for `⌘Z` / `Ctrl+Z` (undo) and `⇧⌘Z` / `Ctrl+Y` (redo).
- Floating Apple Clean Undo pill displays description with immediate one-click rollback.
