import React from 'react';
import { Award, Flame, Clock, Droplets, Moon, Lock, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';

export const BadgesCard: React.FC = () => {
  const badges = [
    {
      id: 'streak-master',
      name: '28d Flame',
      icon: <Flame className="w-5 h-5 fill-[#FFC93C]" />,
      bg: 'bg-gradient-to-tr from-[#FF8A3D] to-[#FFC93C]',
      glow: 'shadow-[0_0_14px_rgba(255,201,60,0.6)]',
      unlocked: true,
    },
    {
      id: 'flow-diver',
      name: '100h Flow',
      icon: <Clock className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-tr from-[#4D8DFF] to-[#1FD1F9]',
      glow: 'shadow-[0_0_14px_rgba(77,141,255,0.6)]',
      unlocked: true,
    },
    {
      id: 'hydration',
      name: 'Hydrated',
      icon: <Droplets className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-tr from-[#2EE6A6] to-[#1FD1F9]',
      glow: 'shadow-[0_0_14px_rgba(46,230,166,0.6)]',
      unlocked: true,
    },
    {
      id: 'zen',
      name: 'Zen Ritual',
      icon: <Moon className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-tr from-[#A678FF] to-[#FF4FA3]',
      glow: 'shadow-[0_0_14px_rgba(166,120,255,0.6)]',
      unlocked: true,
    },
    {
      id: 'centurion',
      name: '100d Streak',
      icon: <Lock className="w-4 h-4 text-purple-400" />,
      bg: 'bg-purple-950/40 border-2 border-purple-500/40',
      glow: 'shadow-[0_0_10px_rgba(166,120,255,0.3)]',
      unlocked: false,
    },
    {
      id: 'master-xp',
      name: '10k Mastery',
      icon: <Lock className="w-4 h-4 text-amber-400" />,
      bg: 'bg-amber-950/40 border-2 border-amber-500/40',
      glow: 'shadow-[0_0_10px_rgba(255,201,60,0.3)]',
      unlocked: false,
    },
  ];

  return (
    <GlassCard 
      tint="growth" 
      cornerOrb 
      cornerPosition="top-right"
      watermark={<Award className="w-40 h-40 text-pink-500/10" />}
      className="p-6 flex flex-col justify-between h-full min-h-[190px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-[12px] font-mono text-[#FF4FA3] font-semibold">
            <Award className="w-4 h-4" />
            <span>TROPHY CABINET</span>
          </div>
          <Chip variant="growth" pill size="sm">
            4 / 6 Unlocked
          </Chip>
        </div>

        {/* Horizontal Row of Glossy Circular Badges */}
        <div className="flex items-center justify-between gap-2.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {badges.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1.5 flex-1 min-w-[56px] group cursor-pointer">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-220 group-hover:scale-110 ${b.bg} ${b.glow}`}
              >
                {b.icon}
              </div>
              <span className={`text-[11px] font-mono font-medium text-center truncate w-full ${b.unlocked ? 'text-white' : 'text-slate-400'}`}>
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-pink-200/70">
        <span>Compounding unlock criteria</span>
        <span className="text-[#FF4FA3] font-semibold">2 Locked Targets</span>
      </div>
    </GlassCard>
  );
};
