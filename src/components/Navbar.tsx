import React, { useState, useEffect, useRef } from 'react';
import { ViewTab } from '../types';
import { 
  Flame, 
  Plus, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Download, 
  SlidersHorizontal,
  Search,
  Play,
  Pause,
  Square,
  Clock,
  Cloud
} from 'lucide-react';
import { sound } from '../utils/audio';
import { focusManager, FocusSessionState } from '../core/focusState';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  isToday: boolean;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenCommandBar?: () => void;
  userLevel: number;
  userXp: number;
  currentStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  onOpenExportModal,
  onOpenCommandBar,
  userLevel,
  currentStreak,
}) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [focusState, setFocusState] = useState<FocusSessionState>(() => focusManager.getState());
  const [isDynamicIslandHovered, setIsDynamicIslandHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Subscribe to running focus session for Dynamic Island pill
  useEffect(() => {
    return focusManager.subscribe((st) => setFocusState(st));
  }, []);

  // Track scroll for hairline separator
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleTheme = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('upgrade-theme', 'dark');
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#050505');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('upgrade-theme', 'light');
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#F1E6D3');
    }
  };

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    sound.setEnabled(next);
  };

  const navLinks: { id: ViewTab; label: string }[] = [
    { id: 'dashboard', label: 'Today' },
    { id: 'heatmap', label: 'Year' },
    { id: 'analytics', label: 'Trends' },
    { id: 'focus', label: 'Focus' },
  ];

  // Helper for dynamic island time display
  const displaySecs = focusState.isOpenEnded ? focusState.secondsElapsed : focusState.secondsRemaining;
  const mins = Math.floor(displaySecs / 60);
  const secs = displaySecs % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-[52px] w-full transition-all duration-200 select-none ${
        hasScrolled ? 'border-b border-[var(--separator)]' : ''
      }`}
      style={{
        backgroundColor: 'var(--nav-bg)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}
    >
      <div className="max-w-[1080px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2 text-left focus-visible:outline-none"
          >
            <div className="w-6 h-6 rounded-[7px] bg-[var(--accent)] flex items-center justify-center text-[var(--on-accent)] shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-[var(--label)]">
              upGrade
            </span>
          </button>
        </div>

        {/* Dynamic Island Pill (Active when Focus Session runs) */}
        {focusState.isActive ? (
          <div
            onMouseEnter={() => setIsDynamicIslandHovered(true)}
            onMouseLeave={() => setIsDynamicIslandHovered(false)}
            onClick={() => onTabChange('focus')}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)]/90 border border-[var(--accent)]/40 shadow-sm text-[13px] font-medium text-[var(--label)] cursor-pointer hover:border-[var(--accent)] transition-all animate-in fade-in duration-200"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="tnum font-semibold">{timeFormatted}</span>
            <span className="hidden md:inline text-[var(--label-2)] text-[12px] truncate max-w-[100px]">
              {focusState.habitTitle.split('/')[0].trim()}
            </span>

            {/* Hover quick controls */}
            {isDynamicIslandHovered && (
              <div
                className="flex items-center gap-1 ml-1 pl-1.5 border-l border-[var(--separator)]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => focusState.isPaused ? focusManager.resume() : focusManager.pause()}
                  className="p-1 hover:text-[var(--accent)] text-[var(--label-2)]"
                  title={focusState.isPaused ? 'Resume' : 'Pause'}
                >
                  {focusState.isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playCelebration();
                    focusManager.completeSession();
                  }}
                  className="p-1 hover:text-rose-500 text-[var(--label-2)]"
                  title="Stop and Log"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Center: Clean Text Links */
          <nav className="hidden sm:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`relative text-[14px] transition-colors py-1 ${
                    isActive
                      ? 'font-semibold text-[var(--label)]'
                      : 'font-normal text-[var(--label-2)] hover:text-[var(--label)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Command Bar Trigger, Quick Stats, + Action, and Menu */}
        <div className="flex items-center gap-2">
          
          {/* Command Bar Button (⌘K) */}
          {onOpenCommandBar && (
            <button
              type="button"
              onClick={onOpenCommandBar}
              aria-label="Open command bar"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--fill)] hover:bg-[var(--fill-secondary)] text-[var(--label)] text-[13px] font-medium transition active:scale-95"
            >
              <Search className="w-3.5 h-3.5 text-[var(--label-3)]" />
              <span className="hidden md:inline text-[var(--label-2)]">Search</span>
              <kbd className="hidden sm:inline text-[10px] px-1 py-0.2 rounded bg-[var(--surface)] text-[var(--label-3)] font-mono">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Streak Chip */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--fill)] text-[var(--label)] text-[13px] font-medium tnum"
            title={`${currentStreak} day streak`}
          >
            <Flame className="w-3.5 h-3.5 text-[var(--cat-growth)] fill-[var(--cat-growth)]" />
            <span>{currentStreak}d</span>
          </div>

          {/* Level Chip */}
          <div 
            className="hidden lg:flex items-center px-2 py-1 rounded-full bg-[var(--fill)] text-[var(--label-2)] text-[12px] font-medium tnum"
            title={`Level ${userLevel}`}
          >
            <span>Lv {userLevel}</span>
          </div>

          {/* New Tracker "+" Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            aria-label="New ritual"
            className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center transition active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Avatar / Settings Menu Popover */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Settings and preferences"
              aria-expanded={isMenuOpen}
              className="w-8 h-8 rounded-full bg-[var(--fill)] hover:bg-[var(--fill-secondary)] text-[var(--label)] flex items-center justify-center transition active:scale-95 text-[13px] font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Apple Style Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[var(--surface)] text-[var(--label)] rounded-[14px] shadow-[0_12px_36px_rgba(60,40,15,0.18)] border border-[var(--separator)] p-1.5 z-50 text-[14px] animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[8px] hover:bg-[var(--fill)] transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {isDarkMode ? <Sun className="w-4 h-4 text-[var(--cat-growth)]" /> : <Moon className="w-4 h-4 text-[var(--accent)]" />}
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <span className="text-[12px] text-[var(--label-3)]">
                    {isDarkMode ? 'Off' : 'On'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[8px] hover:bg-[var(--fill)] transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[var(--cat-focus)]" /> : <VolumeX className="w-4 h-4 text-[var(--label-3)]" />}
                    <span>Haptic Sound</span>
                  </div>
                  <span className="text-[12px] text-[var(--label-3)]">
                    {isSoundEnabled ? 'On' : 'Off'}
                  </span>
                </button>

                <div className="h-[0.5px] bg-[var(--separator)] my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenExportModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] hover:bg-[var(--fill)] transition text-left"
                >
                  <Cloud className="w-4 h-4 text-[var(--accent)]" />
                  <span>Backup & Cloud Sync</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
