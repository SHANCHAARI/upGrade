import React from 'react';
import { Sparkles, ArrowRight, Zap, Trophy } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';

interface HeroGreetingCardProps {
  completedCount: number;
  totalCount: number;
  consistencyPercentage: number;
  onLogNext: () => void;
}

export const HeroGreetingCard: React.FC<HeroGreetingCardProps> = ({
  completedCount,
  totalCount,
  consistencyPercentage,
  onLogNext,
}) => {
  // Time of day dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Concentric Apple Fitness multi-rings
  // Ring 1: Mint (Focus/Habits), Ring 2: Electric Blue (Dev), Ring 3: Coral/Hot Pink (Health)
  const ring1Radius = 50;
  const ring2Radius = 40;
  const ring3Radius = 30;

  const circ1 = 2 * Math.PI * ring1Radius;
  const circ2 = 2 * Math.PI * ring2Radius;
  const circ3 = 2 * Math.PI * ring3Radius;

  // Progressive fill for rings based on completed count
  const fill1 = Math.min(1, Math.max(0, consistencyPercentage / 100));
  const fill2 = Math.min(1, Math.max(0, (completedCount >= 1 ? 0.75 : 0.2)));
  const fill3 = Math.min(1, Math.max(0, (completedCount >= 2 ? 0.9 : 0.3)));

  return (
    <GlassCard 
      tint="hero" 
      cornerOrb 
      cornerPosition="top-right"
      watermark={<Trophy className="w-48 h-48" />}
      className="p-6 sm:p-7 flex flex-col justify-between h-full min-h-[310px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <Chip variant="accent" pill size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Daily Baseline Engine
          </Chip>
          <span className="text-[12px] font-mono text-purple-200/80 font-medium">
            {completedCount} of {totalCount} rituals complete
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mt-2">
          <div className="flex-1">
            <h2 className="text-[24px] sm:text-[28px] font-display font-bold text-white tracking-tight leading-tight">
              {getGreeting()}, <span className="bg-gradient-to-r from-white via-[#FF4FA3] to-[#FF8A3D] bg-clip-text text-transparent">Creator</span>
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-sm">
              Your momentum is compounding. Complete pending rituals to lock in your perfect streak rating.
            </p>
          </div>

          {/* Apple Fitness Concentric Multi-Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0 -my-2">
            <svg className="w-full h-full -rotate-90">
              {/* Outer Ring 1: Mint (Focus) */}
              <circle
                cx="64"
                cy="64"
                r={ring1Radius}
                stroke="rgba(46, 230, 166, 0.15)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={ring1Radius}
                stroke="#2EE6A6"
                strokeWidth="7"
                strokeDasharray={circ1}
                strokeDashoffset={circ1 - fill1 * circ1}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
                style={{ filter: 'drop-shadow(0 0 6px rgba(46, 230, 166, 0.6))' }}
              />

              {/* Middle Ring 2: Electric Blue (Dev) */}
              <circle
                cx="64"
                cy="64"
                r={ring2Radius}
                stroke="rgba(77, 141, 255, 0.15)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={ring2Radius}
                stroke="#4D8DFF"
                strokeWidth="7"
                strokeDasharray={circ2}
                strokeDashoffset={circ2 - fill2 * circ2}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
                style={{ filter: 'drop-shadow(0 0 6px rgba(77, 141, 255, 0.6))' }}
              />

              {/* Inner Ring 3: Hot Pink (Health & Mindset) */}
              <circle
                cx="64"
                cy="64"
                r={ring3Radius}
                stroke="rgba(255, 79, 163, 0.15)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={ring3Radius}
                stroke="#FF4FA3"
                strokeWidth="7"
                strokeDasharray={circ3}
                strokeDashoffset={circ3 - fill3 * circ3}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255, 79, 163, 0.6))' }}
              />
            </svg>

            {/* Percentage in center */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[20px] font-display font-bold text-white num-tabular tracking-tight">
                {consistencyPercentage}%
              </span>
              <span className="text-[9px] font-mono text-purple-200/70 font-semibold uppercase">
                SCORE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[12px] text-purple-200/90 font-medium">
          <Zap className="w-4 h-4 text-[#FFC93C]" />
          <span>Next ritual: <strong>Deep Work 4.0h</strong></span>
        </div>

        <button
          type="button"
          onClick={onLogNext}
          className="px-4 py-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[#FF3D9A] via-[#FF8A3D] to-[#FFC93C] text-[#0F0A1F] font-semibold text-[13px] inline-flex items-center space-x-1.5 shadow-[0_0_20px_rgba(255,61,154,0.4)] hover:shadow-[0_0_28px_rgba(255,138,61,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span>Log next ritual</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
};
