import React from 'react';
import { CheckCircle2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Habit } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';
import { sound } from '../../utils/audio';
import { triggerCheckConfetti } from '../../utils/confetti';

interface NextUpCardProps {
  habits: Habit[];
  selectedDate: string;
  onToggleHabit: (habitId: string) => void;
}

export const NextUpCard: React.FC<NextUpCardProps> = ({
  habits,
  selectedDate,
  onToggleHabit,
}) => {
  const pendingHabits = habits.filter(h => !h.completedDates.includes(selectedDate)).slice(0, 4);

  const handleQuickComplete = (e: React.MouseEvent, habitId: string) => {
    e.stopPropagation();
    sound.playCheck();
    triggerCheckConfetti(e.clientX, e.clientY);
    onToggleHabit(habitId);
  };

  return (
    <GlassCard 
      tint="mindset" 
      cornerOrb 
      cornerPosition="bottom-right"
      watermark={<CheckCircle2 className="w-36 h-36 text-violet-500/10" />}
      className="p-6 flex flex-col justify-between h-full min-h-[260px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-[12px] font-mono text-[#A678FF] font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>NEXT UP RITUALS</span>
          </div>
          <span className="text-[11px] font-mono text-purple-200/80">
            {pendingHabits.length} Pending
          </span>
        </div>

        {/* List of compact colored chips with one-tap complete */}
        <div className="space-y-2 mt-3">
          {pendingHabits.length > 0 ? (
            pendingHabits.map((habit) => (
              <div
                key={habit.id}
                onClick={(e) => handleQuickComplete(e, habit.id)}
                className="flex items-center justify-between p-2.5 rounded-[var(--radius-control)] bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-[#A678FF]/50 transition-all cursor-pointer group interactive-control"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-[#A678FF]/20 border border-[#A678FF]/40 flex items-center justify-center text-[#A678FF] group-hover:bg-[#A678FF] group-hover:text-black transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[13px] font-medium text-white truncate">
                    {habit.title}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-purple-200/70 uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                  {habit.category}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-[13px] text-emerald-300 font-medium flex flex-col items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#2EE6A6] mb-1.5" />
              <span>All rituals completed today! 🔥</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-purple-200/70">
        <span>Click any row for one-tap complete</span>
        <span className="text-[#A678FF] font-semibold">+25 XP each</span>
      </div>
    </GlassCard>
  );
};
