import React from 'react';
import { Zap, Award, Gift, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';

interface LevelXpCardProps {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
}

export const LevelXpCard: React.FC<LevelXpCardProps> = ({
  level,
  currentXp,
  xpToNextLevel,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const xpRatio = Math.min(1, Math.max(0, currentXp / xpToNextLevel));
  const strokeDashoffset = circumference - xpRatio * circumference;
  const xpRemaining = Math.max(0, xpToNextLevel - currentXp);

  return (
    <GlassCard 
      tint="growth" 
      cornerOrb 
      cornerPosition="top-right"
      watermark={<Award className="w-44 h-44 text-pink-500/10" />}
      className="p-6 sm:p-7 flex flex-col justify-between h-full min-h-[310px]"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[12px] font-mono text-[#FF4FA3] font-semibold">
            <Zap className="w-4 h-4 fill-current" />
            <span>PROGRESSION ENGINE</span>
          </div>
          <Chip variant="growth" pill size="sm">
            +30 XP Today
          </Chip>
        </div>

        <div className="flex items-center space-x-5 mt-4">
          {/* Circular Level Badge with Progress Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="rgba(255, 79, 163, 0.18)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="url(#xpGrad)"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 79, 163, 0.7))' }}
              />
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF4FA3" />
                  <stop offset="100%" stopColor="#A678FF" />
                </linearGradient>
              </defs>
            </svg>

            {/* Badge Center */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[26px] font-display font-extrabold text-white leading-none num-tabular">
                {level}
              </span>
              <span className="text-[9px] font-mono font-bold text-pink-300 uppercase tracking-widest mt-0.5">
                LEVEL
              </span>
            </div>
          </div>

          {/* Level Details */}
          <div>
            <div className="text-[18px] font-display font-bold text-white">
              Habit Architect
            </div>
            <div className="flex items-baseline space-x-1.5 text-[14px] font-mono mt-1">
              <span className="font-bold text-[#FF4FA3] num-tabular">{currentXp}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-300 num-tabular">{xpToNextLevel} XP</span>
            </div>
            <div className="text-[12px] text-pink-200/80 font-medium mt-1">
              {Math.round(xpRatio * 100)}% to Tier Mastery
            </div>
          </div>
        </div>
      </div>

      {/* Next Reward Preview */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-control)] bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-[#FF4FA3]">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-pink-200/70 uppercase">Next Reward</div>
            <div className="text-[12px] font-semibold text-white">
              {xpRemaining} XP to Lv {level + 1} Badge
            </div>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#A678FF] font-bold flex items-center">
          Preview <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </GlassCard>
  );
};
