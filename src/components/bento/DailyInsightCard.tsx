import React from 'react';
import { Lightbulb, TrendingUp, Sparkles, Compass } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Chip } from '../ui/Chip';

export const DailyInsightCard: React.FC = () => {
  return (
    <GlassCard 
      tint="hero" 
      cornerOrb 
      cornerPosition="top-left"
      watermark={<Compass className="w-40 h-40 text-purple-500/10" />}
      className="p-6 flex flex-col justify-between h-full min-h-[190px]"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-[12px] font-mono text-[#FFC93C] font-semibold">
            <Lightbulb className="w-4 h-4 fill-current" />
            <span>BEHAVIORAL AI INSIGHT</span>
          </div>
          <Chip variant="warn" pill size="sm">
            Live Pattern
          </Chip>
        </div>

        <div className="text-[17px] sm:text-[19px] font-display font-bold text-white tracking-tight leading-snug mt-2">
          “You're <span className="text-[#2EE6A6]">+14% more consistent</span> on mornings when starting with Deep Work before 10 AM.”
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[12px] text-purple-200/80">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF3D9A]" />
          <span>Recommended next block: <strong>50m Flow State</strong></span>
        </span>
        <span className="font-mono text-[#FF8A3D] font-bold text-[11px]">OPTIMIZED ROUTINE</span>
      </div>
    </GlassCard>
  );
};
