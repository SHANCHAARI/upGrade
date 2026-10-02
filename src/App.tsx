import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TabBar } from './components/ui/TabBar';
import { ActivityRingsHero } from './components/ui/ActivityRingsHero';
import { StatCard } from './components/ui/StatCard';
import { HabitChecklist } from './components/HabitChecklist';
import { GrowthLandscape } from './components/landscape/GrowthLandscape';
import { AnalyticsGraphs } from './components/AnalyticsGraphs';
import { FocusTimer } from './components/FocusTimer';
import { CommandBar } from './components/command/CommandBar';
import { AddHabitModal } from './components/AddHabitModal';
import { ExportImportModal } from './components/ExportImportModal';
import { Footer } from './components/Footer';
import { Habit, DayActivity, UserStats, ViewTab } from './types';
import { loadInitialData } from './utils/storage';
import { sound } from './utils/audio';
import { 
  initializeAndMigrateStorage, 
  persistHabits, 
  persistHistory 
} from './core/db';
import { calculateConsistencyScore } from './core/score';
import { evaluateHabitStreak } from './core/streaks';
import { getLogicalTodayKey } from './core/time';
import { undoManager } from './core/undo';
import { focusManager } from './core/focusState';
import { Flame, Award, Clock, ChevronLeft, ChevronRight, Shield, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const todayKey = useMemo(() => getLogicalTodayKey({ rolloverHour: 4 }), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState<boolean>(false);
  const [undoNotice, setUndoNotice] = useState<string | null>(null);
  const [shieldNotice, setShieldNotice] = useState<string | null>(null);

  // Fast synchronous initial state from local storage, then upgrade with Dexie
  const [data, setData] = useState<{
    habits: Habit[];
    history: Record<string, DayActivity>;
  }>(() => {
    const loaded = loadInitialData();
    return { habits: loaded.habits, history: loaded.history };
  });

  // Local-first IndexedDB migration and synchronization
  useEffect(() => {
    initializeAndMigrateStorage(todayKey).then((migrated) => {
      if (migrated && migrated.habits.length > 0) {
        setData({ habits: migrated.habits, history: migrated.history });
      }
    });
  }, [todayKey]);

  // Global ⌘K / Ctrl+K keyboard shortcut for Command Bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Subscribe to undo manager events
  useEffect(() => {
    return undoManager.subscribe((state) => {
      if (state.lastAction) {
        setUndoNotice(state.lastAction.description);
      }
    });
  }, []);

  // Autosave to IndexedDB & local cache
  useEffect(() => {
    persistHabits(data.habits);
  }, [data.habits]);

  useEffect(() => {
    persistHistory(data.history);
  }, [data.history]);

  const isToday = selectedDate === todayKey;
  const habits = data.habits;
  const history = data.history;

  // Consistency Score: Rolling 28-day exponential decay calculation
  const scoreResult = useMemo(() => {
    return calculateConsistencyScore(habits, todayKey, history);
  }, [habits, todayKey, history]);

  const selectedDayActivity = history[selectedDate] || {
    date: selectedDate,
    habitsCompleted: 0,
    totalHabits: habits.length,
    consistencyPercentage: 0,
    consistencyScore: scoreResult.score,
    projectedScore: scoreResult.projectedScore,
    focusMinutes: 0,
  };

  const userStats: UserStats = useMemo(() => {
    let checkins = 0;
    let focusMinutesTotal = 0;
    let totalShields = 0;

    habits.forEach((h) => {
      checkins += (h.completedDates || []).length;
      totalShields += (h.shields || 0);
    });

    Object.values(history).forEach((d) => {
      focusMinutesTotal += d.focusMinutes || 0;
    });

    const maxHabitStreak = Math.max(0, ...habits.map((h) => h.streak || 0));
    const maxHabitBest = Math.max(0, ...habits.map((h) => h.bestStreak || 0));

    // Dynamic level progression: 10 checkins per level
    const level = Math.max(1, Math.floor(checkins / 10) + 1);
    const currentXp = (checkins % 10) * 10;
    const xpToNextLevel = 100;

    return {
      level,
      currentXp,
      xpToNextLevel,
      currentStreak: maxHabitStreak,
      bestStreak: maxHabitBest,
      totalCheckins: checkins,
      consistencyRating: scoreResult.score,
      projectedRating: scoreResult.projectedScore,
      availableShields: totalShields,
    };
  }, [habits, history, scoreResult]);

  const recalculateDay = (dateKey: string, updatedHabits: Habit[]) => {
    const doneCount = updatedHabits.filter((h) => h.completedDates.includes(dateKey)).length;
    const totalCount = updatedHabits.length;
    const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    let focusMins = 0;
    const devHabit = updatedHabits.find((h) => h.id === 'habit-1');
    if (devHabit && devHabit.numericLogs && devHabit.numericLogs[dateKey]) {
      focusMins = Math.round(devHabit.numericLogs[dateKey] * 60);
    } else {
      const prev = history[dateKey];
      focusMins = prev ? prev.focusMinutes : doneCount * 35;
    }

    const updatedScore = calculateConsistencyScore(updatedHabits, todayKey, history);

    const updatedHistory = {
      ...history,
      [dateKey]: {
        date: dateKey,
        habitsCompleted: doneCount,
        totalHabits: totalCount,
        consistencyPercentage: pct,
        consistencyScore: updatedScore.score,
        projectedScore: updatedScore.projectedScore,
        focusMinutes: focusMins,
      },
    };

    setData({
      habits: updatedHabits,
      history: updatedHistory,
    });

    if (pct === 100 && totalCount > 0) {
      sound.playCelebration();
    }
  };

  const handleToggleHabit = (habitId: string) => {
    const prevHabits = [...habits];
    const prevHistory = { ...history };
    const targetHabit = habits.find((h) => h.id === habitId);

    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        const alreadyDone = h.completedDates.includes(selectedDate);
        let newDates: string[];

        if (alreadyDone) {
          newDates = h.completedDates.filter((d) => d !== selectedDate);
          sound.playStep();
        } else {
          newDates = [...h.completedDates, selectedDate];
          sound.playCheck();
        }

        const habitWithDates: Habit = {
          ...h,
          completedDates: newDates,
        };

        // Forgiveness & Streak calculation
        const streakResult = evaluateHabitStreak(habitWithDates, todayKey);

        if (streakResult.shieldUsedNotice) {
          setShieldNotice(`Streak shield protected your streak on ${streakResult.shieldUsedNotice.date}`);
          setTimeout(() => setShieldNotice(null), 5000);
        }

        return {
          ...habitWithDates,
          streak: streakResult.currentStreak,
          bestStreak: streakResult.bestStreak,
          shields: streakResult.availableShields,
          shieldedDates: streakResult.shieldedDates,
          recoveredDates: streakResult.recoveredDates,
        };
      }
      return h;
    });

    // Push action to 20-item undo stack
    undoManager.pushAction({
      id: `toggle-${habitId}-${Date.now()}`,
      type: 'TOGGLE_HABIT',
      description: targetHabit ? `Toggled "${targetHabit.title}"` : 'Toggled habit',
      timestamp: Date.now(),
      undo: () => {
        setData({ habits: prevHabits, history: prevHistory });
      },
      redo: () => {
        recalculateDay(selectedDate, updatedHabits);
      },
    });

    recalculateDay(selectedDate, updatedHabits);
  };

  const handleUpdateNumeric = (habitId: string, newValue: number) => {
    const prevHabits = [...habits];
    const prevHistory = { ...history };

    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        const logs = { ...(h.numericLogs || {}), [selectedDate]: newValue };
        const isDone = newValue >= (h.targetValue || 1);
        let newDates = [...h.completedDates];

        if (isDone && !newDates.includes(selectedDate)) {
          newDates.push(selectedDate);
          sound.playCheck();
        } else if (!isDone && newDates.includes(selectedDate)) {
          newDates = newDates.filter((d) => d !== selectedDate);
        } else {
          sound.playStep();
        }

        const habitWithDates: Habit = {
          ...h,
          numericLogs: logs,
          completedDates: newDates,
        };

        const streakResult = evaluateHabitStreak(habitWithDates, todayKey);

        return {
          ...habitWithDates,
          streak: streakResult.currentStreak,
          bestStreak: streakResult.bestStreak,
          shields: streakResult.availableShields,
          shieldedDates: streakResult.shieldedDates,
          recoveredDates: streakResult.recoveredDates,
        };
      }
      return h;
    });

    undoManager.pushAction({
      id: `numeric-${habitId}-${Date.now()}`,
      type: 'UPDATE_NUMERIC',
      description: `Updated progress to ${newValue}`,
      timestamp: Date.now(),
      undo: () => {
        setData({ habits: prevHabits, history: prevHistory });
      },
      redo: () => {
        recalculateDay(selectedDate, updatedHabits);
      },
    });

    recalculateDay(selectedDate, updatedHabits);
  };

  const handleAddHabit = (newHabit: Habit) => {
    const prevHabits = [...habits];
    const updated = [newHabit, ...habits];

    undoManager.pushAction({
      id: `add-${newHabit.id}`,
      type: 'ADD_HABIT',
      description: `Added "${newHabit.title}"`,
      timestamp: Date.now(),
      undo: () => {
        setData((prev) => ({ ...prev, habits: prevHabits }));
      },
      redo: () => {
        setData((prev) => ({ ...prev, habits: updated }));
      },
    });

    recalculateDay(selectedDate, updated);
  };

  const handleDeleteHabit = (habitId: string) => {
    const prevHabits = [...habits];
    const deleted = habits.find((h) => h.id === habitId);
    const updated = habits.filter((h) => h.id !== habitId);

    undoManager.pushAction({
      id: `delete-${habitId}`,
      type: 'DELETE_HABIT',
      description: deleted ? `Deleted "${deleted.title}"` : 'Deleted habit',
      timestamp: Date.now(),
      undo: () => {
        setData((prev) => ({ ...prev, habits: prevHabits }));
      },
      redo: () => {
        setData((prev) => ({ ...prev, habits: updated }));
      },
    });

    recalculateDay(selectedDate, updated);
  };

  const handleLogFocusSession = (minutes: number, note?: string) => {
    const hours = Number((minutes / 60).toFixed(1));
    const devHabit = habits.find((h) => h.category === 'dev' || h.id === 'habit-1');

    if (devHabit) {
      const currentVal = devHabit.numericLogs ? (devHabit.numericLogs[todayKey] ?? 0) : 0;
      handleUpdateNumeric(devHabit.id, Number((currentVal + hours).toFixed(1)));
    } else {
      const currentDay = history[todayKey] || {
        date: todayKey,
        habitsCompleted: 0,
        totalHabits: habits.length,
        consistencyPercentage: 0,
        consistencyScore: scoreResult.score,
        focusMinutes: 0,
      };

      setData((prev) => ({
        ...prev,
        history: {
          ...prev.history,
          [todayKey]: {
            ...currentDay,
            focusMinutes: currentDay.focusMinutes + minutes,
            note: note || currentDay.note,
          },
        },
      }));
    }
  };

  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const nextKey = current.toISOString().split('T')[0];
    setSelectedDate(nextKey);
  };

  const handleDataReload = () => {
    const loaded = loadInitialData();
    setData({ habits: loaded.habits, history: loaded.history });
  };

  const completedCount = habits.filter((h) => h.completedDates.includes(selectedDate)).length;
  const consistencyPercentage = habits.length > 0 
    ? Math.round((completedCount / habits.length) * 100) 
    : 0;

  // Format date display
  const dateFormatted = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--label)] flex flex-col transition-colors duration-200">
      
      {/* 52px Translucent Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isToday={isToday}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        userLevel={userStats.level}
        userXp={userStats.currentXp}
        currentStreak={userStats.currentStreak}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1080px] w-full mx-auto px-4 sm:px-6 pt-[76px] pb-24 sm:pb-16">
        
        {/* Shield gentle notification */}
        {shieldNotice && (
          <div className="mb-4 p-3 rounded-[12px] bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--label)] flex items-center justify-between text-[13px] animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent)]" />
              <span>{shieldNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setShieldNotice(null)}
              className="text-[12px] text-[var(--label-2)] hover:text-[var(--label)]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Today Page */}
        {currentTab === 'dashboard' && (
          <div className="space-y-10 sm:space-y-12">
            
            {/* 1. Large Title "Today" with date in --label-2 beneath */}
            <div className="pt-4 flex items-end justify-between">
              <div>
                <h1 className="text-page-title text-[var(--label)]">
                  Today
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[15px] text-[var(--label-2)]">
                    {dateFormatted}
                  </span>
                  {!isToday && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate(todayKey)}
                      className="text-[13px] text-[var(--accent)] font-medium hover:underline"
                    >
                      Return to today
                    </button>
                  )}
                </div>
              </div>

              {/* Date navigation arrows */}
              <div className="flex items-center gap-1 bg-[var(--fill)] rounded-full p-1">
                <button
                  type="button"
                  onClick={() => handleShiftDate(-1)}
                  aria-label="Previous day"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--label-2)] hover:text-[var(--label)] hover:bg-[var(--surface)] transition active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftDate(1)}
                  aria-label="Next day"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--label-2)] hover:text-[var(--label)] hover:bg-[var(--surface)] transition active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. ACTIVITY RINGS HERO */}
            <ActivityRingsHero
              consistencyPercentage={consistencyPercentage}
              completedRituals={completedCount}
              totalRituals={habits.length}
              focusMinutesToday={selectedDayActivity.focusMinutes}
              focusGoalMinutes={240}
              habits={habits}
              selectedDate={selectedDate}
            />

            {/* 3. Row of Three Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Streak Card with Shield Count */}
              <StatCard
                icon={<Flame className="w-4 h-4" />}
                iconBg="rgba(255, 149, 0, 0.12)"
                iconColor="var(--system-orange)"
                label="Streak"
                value={`${userStats.currentStreak} days`}
                caption={
                  userStats.availableShields > 0
                    ? `Best ${userStats.bestStreak}d • ${userStats.availableShields} shield${userStats.availableShields > 1 ? 's' : ''} stored`
                    : `Best streak ${userStats.bestStreak} days`
                }
              />

              {/* 28-Day Consistency Score Card (Replaces raw daily %) */}
              <StatCard
                icon={<Award className="w-4 h-4" />}
                iconBg="var(--accent-tint)"
                iconColor="var(--accent)"
                label="Consistency"
                value={`${scoreResult.score}%`}
                caption={`28-day weighted • ${scoreResult.projectedScore}% projected`}
                progressPercent={scoreResult.score}
              />

              {/* Focus Time Card */}
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                iconBg="rgba(52, 199, 89, 0.12)"
                iconColor="var(--system-green)"
                label="Focus Time"
                value={`${(selectedDayActivity.focusMinutes / 60).toFixed(1)} hr`}
                caption="Goal 4.0 hr today"
                progressPercent={(selectedDayActivity.focusMinutes / 240) * 100}
              />

            </div>

            {/* 4. Rituals Section */}
            <section aria-labelledby="rituals-heading" className="pt-2">
              <div className="mb-4">
                <h2 id="rituals-heading" className="text-section-title text-[var(--label)]">
                  Rituals
                </h2>
                <p className="text-[15px] text-[var(--label-2)] mt-0.5">
                  Compounding habits with rest days and streak shields
                </p>
              </div>

              {/* Inset Grouped List Component */}
              <HabitChecklist
                habits={habits}
                selectedDate={selectedDate}
                onToggleHabit={handleToggleHabit}
                onUpdateNumeric={handleUpdateNumeric}
                onDeleteHabit={handleDeleteHabit}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </section>

          </div>
        )}

        {/* Tab 2: Growth Landscape (Topographic 365-Day Terrain & Warm Heatmap) */}
        {currentTab === 'heatmap' && (
          <GrowthLandscape
            history={history}
            habits={habits}
            selectedDate={selectedDate}
            onSelectDate={(dateKey) => {
              setSelectedDate(dateKey);
              setCurrentTab('dashboard');
            }}
          />
        )}

        {/* Tab 3: Trends & Graphs */}
        {currentTab === 'analytics' && (
          <AnalyticsGraphs history={history} habits={habits} />
        )}

        {/* Tab 4: Focus Mode (Deep Work that logs itself) */}
        {currentTab === 'focus' && (
          <FocusTimer 
            onLogFocusSession={handleLogFocusSession} 
            habits={habits}
          />
        )}

        {/* Studio Footer & Creative Manifesto */}
        <Footer 
          onOpenCommandBar={() => setIsCommandBarOpen(true)}
          onOpenBackup={() => setIsExportModalOpen(true)}
        />

      </main>

      {/* Floating Undo Toast (⌘Z) */}
      {undoNotice && (
        <aside
          aria-label="Undo Notification"
          className="fixed bottom-20 sm:bottom-6 right-6 z-40 bg-[var(--surface-2)]/95 backdrop-blur-md border border-[var(--separator)] shadow-lg rounded-full py-2 px-4 flex items-center gap-3 text-[13px] text-[var(--label)] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="font-medium">{undoNotice}</span>
          <button
            type="button"
            onClick={async () => {
              await undoManager.undo();
              setUndoNotice(null);
            }}
            className="flex items-center gap-1 font-semibold text-[var(--accent)] hover:opacity-80 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo (⌘Z)</span>
          </button>
        </aside>
      )}

      {/* Mobile Translucent Tab Bar (under 800px) */}
      <TabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Command Bar (⌘K / Ctrl+K) */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        habits={habits}
        onToggleHabit={handleToggleHabit}
        onUpdateNumeric={handleUpdateNumeric}
        onAddHabit={handleAddHabit}
        onNavigate={(tab) => setCurrentTab(tab)}
        onSelectDate={(d) => setSelectedDate(d)}
        onStartFocus={(mins) => {
          setCurrentTab('focus');
          focusManager.startSession({ durationMins: mins });
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Clean Modals */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHabit={handleAddHabit}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onDataReload={handleDataReload}
        habits={habits}
        history={history}
      />

    </div>
  );
};

export default App;
