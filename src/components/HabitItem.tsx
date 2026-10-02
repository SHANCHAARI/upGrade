import React, { useState } from 'react';
import { 
  Check, 
  Flame, 
  Plus, 
  Minus, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Sun,
  Sunset,
  Moon,
  Code2,
  CheckCircle2,
  Droplets,
  BookOpen,
  Dumbbell,
  Sparkles
} from 'lucide-react';
import { Habit } from '../types';
import { sound } from '../utils/audio';
import { triggerCheckConfetti } from '../utils/confetti';
import { GlassCard, CardTint } from './ui/GlassCard';
import { Chip } from './ui/Chip';

interface HabitItemProps {
  habit: Habit;
  dateKey: string;
  onToggle: (habitId: string) => void;
  onUpdateNumeric: (habitId: string, newValue: number) => void;
  onDelete: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  dateKey,
  onToggle,
  onUpdateNumeric,
  onDelete,
  onEdit,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showXpPop, setShowXpPop] = useState(false);

  const isCompleted = habit.completedDates.includes(dateKey);
  const currentValue = habit.numericLogs ? (habit.numericLogs[dateKey] ?? 0) : 0;
  const targetValue = habit.targetValue || 1;
  const progressPercent = Math.min(100, Math.round((currentValue / targetValue) * 100));

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCompleted) {
      sound.playCheck();
      triggerCheckConfetti(e.clientX, e.clientY);
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 1400);
    } else {
      sound.playUncheck();
    }
    onToggle(habit.id);
  };

  const handleIncrement = (e: React.MouseEvent, step = 1) => {
    e.stopPropagation();
    sound.playStep();
    const nextVal = Number((currentValue + step).toFixed(1));
    onUpdateNumeric(habit.id, nextVal);
    if (nextVal >= targetValue && !isCompleted) {
      sound.playCheck();
      triggerCheckConfetti(e.clientX, e.clientY);
      setShowXpPop(true);
      setTimeout(() => setShowXpPop(false), 1400);
    }
  };

  const handleDecrement = (e: React.MouseEvent, step = 1) => {
    e.stopPropagation();
    sound.playStep();
    const nextVal = Math.max(0, Number((currentValue - step).toFixed(1)));
    onUpdateNumeric(habit.id, nextVal);
  };

  // Map category to tint & gradient
  const categoryConfig: Record<string, {
    tint: CardTint;
    iconChipGrad: string;
    icon: React.ReactNode;
    color: string;
  }> = {
    dev: {
      tint: 'dev',
      iconChipGrad: 'bg-gradient-to-tr from-[#4D8DFF] to-[#1FD1F9]',
      icon: <Code2 className="w-5 h-5 text-white" />,
      color: '#4D8DFF',
    },
    health: {
      tint: 'health',
      iconChipGrad: 'bg-gradient-to-tr from-[#FF6B57] to-[#FFC93C]',
      icon: <Dumbbell className="w-5 h-5 text-white" />,
      color: '#FF6B57',
    },
    focus: {
      tint: 'focus',
      iconChipGrad: 'bg-gradient-to-tr from-[#2EE6A6] to-[#B6F34A]',
      icon: <CheckCircle2 className="w-5 h-5 text-white" />,
      color: '#2EE6A6',
    },
    mindset: {
      tint: 'mindset',
      iconChipGrad: 'bg-gradient-to-tr from-[#A678FF] to-[#FF4FA3]',
      icon: <Moon className="w-5 h-5 text-white" />,
      color: '#A678FF',
    },
    growth: {
      tint: 'growth',
      iconChipGrad: 'bg-gradient-to-tr from-[#FF4FA3] to-[#A678FF]',
      icon: <BookOpen className="w-5 h-5 text-white" />,
      color: '#FF4FA3',
    },
  };

  const config = categoryConfig[habit.category] || categoryConfig.focus;

  const renderTimeOfDayChip = () => {
    switch (habit.timeOfDay) {
      case 'morning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--cat-growth)]/15 border border-[var(--cat-growth)]/30 text-[var(--cat-growth)]">
            <Sun className="w-3 h-3" />
            <span>Morning</span>
          </span>
        );
      case 'afternoon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]">
            <Sunset className="w-3 h-3" />
            <span>Afternoon</span>
          </span>
        );
      case 'evening':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--cat-dev)]/15 border border-[var(--cat-dev)]/30 text-[var(--cat-dev)]">
            <Moon className="w-3 h-3" />
            <span>Evening</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--fill)] border border-[var(--separator)] text-[var(--label-2)]">
            <Clock className="w-3 h-3" />
            <span>Anytime</span>
          </span>
        );
    }
  };

  return (
    <GlassCard
      tint={config.tint}
      cornerOrb
      cornerPosition="top-right"
      className={`p-5 sm:p-6 flex flex-col justify-between h-full relative group transition-all duration-220 ${
        isCompleted
          ? 'ring-1 ring-[var(--color-success)]/40 shadow-[0_0_24px_rgba(46,230,166,0.2)]'
          : 'pending-shimmer'
      }`}
    >
      <div>
        {/* Top Header of Card: 40px Icon Chip + Status Badges + More Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            {/* 40px Icon Chip in Category Gradient */}
            <div className={`w-10 h-10 rounded-[14px] ${config.iconChipGrad} flex items-center justify-center shadow-lg shadow-black/30 flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {config.icon}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Chip variant="warn" pill size="sm" icon={<Flame className="w-3.5 h-3.5 fill-[var(--color-warn)]" />}>
                  {habit.streak}d streak
                </Chip>
                {renderTimeOfDayChip()}
              </div>
            </div>
          </div>

          {/* Large 28px Category-Colored Checkbox */}
          <div className="flex items-center space-x-1 relative">
            <button
              type="button"
              role="checkbox"
              aria-checked={isCompleted}
              aria-label={`Mark ${habit.title} ${isCompleted ? 'incomplete' : 'complete'}`}
              onClick={handleCheckboxClick}
              className={`w-7 h-7 rounded-[9px] flex items-center justify-center transition-all duration-220 interactive-control ${
                isCompleted
                  ? 'bg-gradient-to-tr from-[#2EE6A6] to-[#B6F34A] text-[#0F0A1F] shadow-[0_0_14px_rgba(46,230,166,0.8)] scale-105'
                  : 'bg-white/10 hover:bg-white/20 border-2 border-white/25 hover:border-white/50'
              }`}
            >
              {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
            </button>

            {/* Float-up +20 XP Toast */}
            {showXpPop && (
              <div className="absolute right-0 -top-7 pointer-events-none text-[11px] font-mono font-bold text-[#FFC93C] bg-black/80 px-2 py-0.5 rounded-full border border-amber-400/40 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                +25 XP!
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 top-8 w-36 rounded-[var(--radius-control)] bg-[var(--bg-1)] border border-white/20 shadow-2xl py-1 z-30 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-120"
                onMouseLeave={() => setShowMenu(false)}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => { setShowMenu(false); onEdit(habit); }}
                    className="w-full px-3 py-1.5 text-left text-[12px] font-medium text-slate-300 hover:bg-white/10 flex items-center space-x-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Edit Habit</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); onDelete(habit.id); }}
                  className="w-full px-3 py-1.5 text-left text-[12px] font-medium text-rose-400 hover:bg-rose-500/15 flex items-center space-x-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Habit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title 16/600 & Description 13px at 72% white */}
        <div className="mt-3.5">
          <h3 className={`text-[16px] font-semibold text-white tracking-tight leading-snug ${
            isCompleted ? 'text-slate-300 opacity-90 line-through decoration-emerald-400/60' : ''
          }`}>
            {habit.title}
          </h3>

          {habit.description && (
            <p className="text-[13px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
              {habit.description}
            </p>
          )}
        </div>
      </div>

      {/* Numeric Progress Bar (Thick 10px bar with glowing head & 36px circular stepper) */}
      {habit.type === 'numeric' ? (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-[12px] font-mono mb-2">
            <span className="text-slate-300 font-medium">Logged Progress</span>
            <span className="font-bold text-white num-tabular">
              {currentValue.toFixed(1)} / {targetValue.toFixed(1)} {habit.unit}
              <span className="text-[#FFC93C] ml-1.5 font-bold">({progressPercent}%)</span>
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10 relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ${config.iconChipGrad}`}
              style={{
                width: `${progressPercent}%`,
                boxShadow: `0 0 10px ${config.color}`,
              }}
            />
          </div>

          {/* Stepper Buttons (36px circular glass controls) */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] font-mono text-slate-400">
              Tap to step {habit.unit === 'hrs' ? '0.5h' : '1 unit'}
            </span>

            <div className="flex items-center space-x-2 font-mono">
              <button
                type="button"
                onClick={(e) => handleDecrement(e, habit.unit === 'hrs' ? 0.5 : 1)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center interactive-control shadow-sm"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-10 text-center text-[13px] font-bold text-white num-tabular">
                {currentValue.toFixed(1)}
              </span>

              <button
                type="button"
                onClick={(e) => handleIncrement(e, habit.unit === 'hrs' ? 0.5 : 1)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center interactive-control shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Completion status bar for checkbox habits */
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[12px]">
          <span className="text-slate-300 font-medium">
            {isCompleted ? '✓ Completed for today' : '○ Pending completion'}
          </span>
          {isCompleted && (
            <span className="text-[11px] font-mono text-[#2EE6A6] font-bold flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Locked +25 XP
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};
