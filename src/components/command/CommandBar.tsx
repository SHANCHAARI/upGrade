import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Compass, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  CornerDownLeft, 
  X,
  SlidersHorizontal,
  Flame,
  Cloud
} from 'lucide-react';
import { Habit, ViewTab } from '../../types';
import { parseNaturalLanguageCommand, ParsedCommand } from '../../core/parser';
import { sound } from '../../utils/audio';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  onUpdateNumeric: (habitId: string, value: number) => void;
  onAddHabit: (habit: Habit) => void;
  onNavigate: (tab: ViewTab) => void;
  onSelectDate: (dateKey: string) => void;
  onStartFocus: (minutes: number) => void;
  onOpenExportModal?: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'action' | 'habit' | 'navigation' | 'focus';
  icon: React.ReactNode;
  shortcut?: string;
  run: () => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  isOpen,
  onClose,
  habits,
  onToggleHabit,
  onUpdateNumeric,
  onAddHabit,
  onNavigate,
  onSelectDate,
  onStartFocus,
  onOpenExportModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live natural language parser
  const parsed: ParsedCommand | null = useMemo(() => {
    return parseNaturalLanguageCommand(query, habits);
  }, [query, habits]);

  // Static and dynamic command items
  const items: ActionItem[] = useMemo(() => {
    const list: ActionItem[] = [];

    // 1. If parsed command has a direct action, insert it as the primary item
    if (parsed) {
      list.push({
        id: 'parsed-action',
        title: parsed.previewText,
        subtitle: `Press Enter to execute: ${parsed.actionText}`,
        category: 'action',
        icon: <Sparkles className="w-4 h-4 text-[var(--accent)]" />,
        shortcut: '↵',
        run: () => {
          if (parsed.type === 'COMPLETE_HABIT' && parsed.habit) {
            onToggleHabit(parsed.habit.id);
          } else if (parsed.type === 'LOG_NUMERIC' && parsed.habit && parsed.value !== undefined) {
            const current = parsed.habit.numericLogs ? (parsed.habit.numericLogs[new Date().toISOString().split('T')[0]] || 0) : 0;
            onUpdateNumeric(parsed.habit.id, current + parsed.value);
          } else if (parsed.type === 'NAVIGATE' && parsed.targetTab) {
            if ((parsed.targetTab as string) === 'backup') {
              onOpenExportModal?.();
            } else {
              onNavigate(parsed.targetTab as ViewTab);
            }
          } else if (parsed.type === 'START_FOCUS' && parsed.durationMinutes) {
            onStartFocus(parsed.durationMinutes);
          } else if (parsed.type === 'ADD_HABIT' && parsed.habitTitle) {
            onAddHabit({
              id: `habit-${Date.now()}`,
              title: parsed.habitTitle,
              category: 'growth',
              type: parsed.value ? 'quantity' : 'boolean',
              targetValue: parsed.value,
              unit: parsed.unit,
              icon: 'Check',
              color: 'purple',
              timeOfDay: 'morning',
              createdAt: new Date().toISOString().split('T')[0],
              schedule: { type: parsed.scheduleType || 'daily' },
              restDays: [],
              streak: 0,
              bestStreak: 0,
              shields: 0,
              completedDates: [],
            });
          }
          sound.playCheck();
          onClose();
        },
      });
    }

    // 2. Habits matching query
    habits.forEach((h) => {
      const match = !query || h.title.toLowerCase().includes(query.toLowerCase());
      if (match) {
        list.push({
          id: `habit-${h.id}`,
          title: h.title,
          subtitle: `${h.streak}d streak • ${h.category}`,
          category: 'habit',
          icon: <Flame className="w-4 h-4 text-[var(--accent)]" />,
          run: () => {
            onToggleHabit(h.id);
            sound.playCheck();
            onClose();
          },
        });
      }
    });

    // 3. Navigation shortcuts
    const navItems: Array<{ title: string; tab: ViewTab | 'backup'; icon: React.ReactNode }> = [
      { title: 'Today Dashboard', tab: 'dashboard', icon: <Compass className="w-4 h-4 text-[var(--accent)]" /> },
      { title: 'Growth Landscape & Year', tab: 'heatmap', icon: <Calendar className="w-4 h-4 text-[var(--cat-growth)]" /> },
      { title: 'Trends & Analytics', tab: 'analytics', icon: <TrendingUp className="w-4 h-4 text-[var(--system-green)]" /> },
      { title: 'Focus Mode Timer', tab: 'focus', icon: <Clock className="w-4 h-4 text-[var(--cat-dev)]" /> },
      { title: 'Storage & Supabase Cloud Sync', tab: 'backup', icon: <Cloud className="w-4 h-4 text-[var(--accent)]" /> },
    ];

    navItems.forEach((nav) => {
      if (!query || nav.title.toLowerCase().includes(query.toLowerCase()) || (nav.tab === 'backup' && 'cloud supabase sync'.includes(query.toLowerCase()))) {
        list.push({
          id: `nav-${nav.tab}`,
          title: `Go to ${nav.title}`,
          category: 'navigation',
          icon: nav.icon,
          run: () => {
            if (nav.tab === 'backup') {
              onOpenExportModal?.();
            } else {
              onNavigate(nav.tab as ViewTab);
            }
            sound.playStep();
            onClose();
          },
        });
      }
    });

    // 4. Focus presets
    const focusPresets = [25, 50, 90];
    focusPresets.forEach((mins) => {
      if (!query || `focus ${mins}`.includes(query.toLowerCase()) || 'deep work'.includes(query.toLowerCase())) {
        list.push({
          id: `focus-preset-${mins}`,
          title: `Start ${mins} min Focus Session`,
          subtitle: 'Calm full-screen timer auto-logging to Deep Work',
          category: 'focus',
          icon: <Clock className="w-4 h-4 text-[var(--system-orange)]" />,
          run: () => {
            onStartFocus(mins);
            sound.playStep();
            onClose();
          },
        });
      }
    });

    return list;
  }, [parsed, habits, query, onToggleHabit, onUpdateNumeric, onNavigate, onStartFocus, onAddHabit, onClose]);

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].run();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
        
        {/* Translucent backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* 640px Centered Translucent Glass Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative max-w-[640px] w-full bg-[var(--surface)]/95 dark:bg-[#121110]/95 backdrop-blur-2xl border border-[var(--separator)] shadow-2xl rounded-[20px] overflow-hidden flex flex-col z-10"
        >
          
          {/* Top Search Input Box */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-[var(--separator)]">
            <Search className="w-5 h-5 text-[var(--label-3)] shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a habit, command, or e.g. 'gym done', 'deep work 2.5h'..."
              className="w-full bg-transparent text-[16px] text-[var(--label)] placeholder-[var(--label-3)] outline-none focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-[var(--label-3)] hover:text-[var(--label)] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Live Preview Chip (Visible when NL parser matches) */}
          {parsed && (
            <div className="px-4 py-2 bg-[var(--accent)]/10 border-b border-[var(--separator)] flex items-center gap-2 text-[13px] text-[var(--accent)] font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Will do: {parsed.previewText}</span>
              <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded bg-[var(--accent)]/20 font-mono">
                Press Enter ↵
              </span>
            </div>
          )}

          {/* Command List Results */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-0.5">
            {items.length > 0 ? (
              items.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.run()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-[12px] cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                        : 'text-[var(--label)] hover:bg-[var(--fill)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-[8px] ${isSelected ? 'bg-white/20 text-white' : 'bg-[var(--fill)] text-[var(--label-2)]'}`}>
                        {item.icon}
                      </div>
                      <div className="truncate">
                        <div className="text-[14px] font-medium truncate">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className={`text-[12px] truncate ${isSelected ? 'text-white/80' : 'text-[var(--label-3)]'}`}>
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {item.shortcut ? (
                        <span className={`text-[11px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/25 text-white' : 'bg-[var(--fill)] text-[var(--label-3)]'}`}>
                          {item.shortcut}
                        </span>
                      ) : isSelected ? (
                        <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-[14px] text-[var(--label-3)]">
                No matching habits or actions found
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          <div className="px-4 py-2.5 bg-[var(--surface-2)]/80 border-t border-[var(--separator)] flex items-center justify-between text-[12px] text-[var(--label-3)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--fill)] text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--fill)] text-[10px]">↓</kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--fill)] text-[10px]">↵</kbd>
                <span>select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--fill)] text-[10px]">esc</kbd>
                <span>close</span>
              </span>
            </div>
            <span className="text-[11px] text-[var(--accent)] font-medium">
              Natural Language Enabled
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
