<div align="center">

# upGrade 

### A Ritual Laboratory for Human Momentum

**Crafted with architectural restraint by [The Night Build Studio](https://thenightbuild.vercel.app/)**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-C2502A.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-E88A00.svg)](https://react.dev/)
[![Dexie IndexedDB](https://img.shields.io/badge/Dexie.js-Local--First-8E4FD6.svg)](https://dexie.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud--Sync--Ready-2FA84F.svg)](https://supabase.com/)

</div>

---

## 🏛 The Philosophy

> *"We do not rise to the level of our goals. We fall to the level of our systems."*

Most habit trackers are predatory slot machines: they punish honest illness or travel with broken streaks, blast cool blue light into exhausted retinas at midnight, and turn self-improvement into an arithmetic of guilt.

**upGrade** is an architectural instrument for daily life, built after dark by **[The Night Build Studio](https://thenightbuild.vercel.app/)**. 

We engineered it around three foundational principles:
1. **Architectural Restraint**: Content is the hero; chrome gets out of the way. Translucency exists only on floating navigation layers. No confetti explosions, no neon dopamine traps.
2. **Zero-Blue Spectrometry**: Warm tactile linen paper in the day, deep abyssal black (`#050505`) by night. Every neutral has a warm undertone ($R \ge G \ge B$).
3. **Compound Momentum**: A missed day dents momentum mathematically without wiping out months of discipline.

---

## ✨ Key Capabilities

### 1. Rolling 28-Day Exponential Decay Momentum
Unlike rigid streak counters that wipe progress after 1 missed day, upGrade implements a weighted consistency curve:
$$w_k = \lambda^{k-1}, \quad \lambda = 0.96$$
Yesterday matters more than last week, and last month naturally recedes. Missing one day leaves your score in progress, not shattered.

### 2. Forgiving Shield Mechanics & Rest Days
- **Scheduled Rest Days**: Mark specific days (e.g. Sunday rest) that never count against momentum.
- **Streak Shields**: Earn 1 shield for every 14 days of unbroken consistency (up to 2 stored). When life happens, a shield auto-deploys to preserve your streak.
- **Never Miss Twice**: Immediate visual recovery badges when you bounce back after a lapse.

### 3. Command Bar (`⌘K` / `Ctrl+K`)
Control everything from the keyboard with our rule-based natural language parser:
- `"gym done"` $\rightarrow$ marks workout complete
- `"deep work 2.5h"` $\rightarrow$ logs duration to deep work habit
- `"water 1.5L"` $\rightarrow$ increments hydration
- `"focus 25"` $\rightarrow$ launches 25-minute calm focus mode
- `"backup"` $\rightarrow$ opens storage & cloud sync sheet

### 4. Growth Landscape (Topographic Canvas)
A 365-day topographic terrain elevation hero visual. Days of consistent practice rise into contoured peaks tinted in warm terracotta; lapses form quiet valleys. Scrub across elevation contours to inspect any day of the year.

### 5. Procedural Focus Mode & Acoustics
Full-screen zen timer with Document Picture-in-Picture support, high-clarity tabular numerals, and pure Web Audio procedural acoustics (Rain, Brown Noise, Parisian Cafe) synthesized on-the-fly with 0 external sound files.

### 6. Local-First Dexie Storage + Supabase Cloud Sync
- **Local-First Speed**: Instant zero-latency startup and offline reliability via IndexedDB (Dexie v2).
- **Supabase Cloud Sync**: Connect your Supabase project in 1-click for real-time backup across your devices.
- **Multi-Action Undo (`⌘Z`)**: 20-step undo stack with floating Apple Clean toast notices.

---

## 🛠 Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS Variables & Design Tokens + TailwindCSS
- **Storage**: Dexie.js (IndexedDB v2) + `@supabase/supabase-js`
- **Typography**: Plus Jakarta Sans & Newsreader Serif
- **Testing**: Vitest (Unit tests for parsers, decay scores, streak shields, and sync)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/SHANCHAARI/upGrade.git
cd upGrade
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 📐 The Night Build Studio

This instrument was conceived, designed, and coded by **The Night Build Studio**.

- **Studio Website**: [thenightbuild.vercel.app](https://thenightbuild.vercel.app/)
- **Mission**: Crafting bespoke digital instruments, calm software, and architectural web experiences after dark.

---

## 📄 License

MIT © [The Night Build Studio](https://thenightbuild.vercel.app/)
