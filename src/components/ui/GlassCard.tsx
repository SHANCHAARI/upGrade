import React, { useRef, useState } from 'react';

export type CardTint = 'hero' | 'dev' | 'health' | 'focus' | 'growth' | 'mindset' | 'streak' | 'success' | 'none';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tint?: CardTint;
  watermark?: React.ReactNode;
  cornerOrb?: boolean;
  cornerPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  hoverEffect?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  tint = 'none',
  watermark,
  cornerOrb = true,
  cornerPosition = 'top-right',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverEffect || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  // Color config based on tint
  const tintConfig: Record<CardTint, {
    bgWash: string;
    border: string;
    shadow: string;
    glowColor: string;
    orbGradient: string;
    spotlight: string;
  }> = {
    hero: {
      bgWash: 'linear-gradient(135deg, rgba(124, 77, 255, 0.22) 0%, rgba(255, 61, 154, 0.12) 50%, rgba(255, 138, 61, 0.05) 100%)',
      border: 'linear-gradient(135deg, rgba(255, 61, 154, 0.6) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(124, 77, 255, 0.28)',
      glowColor: '#FF3D9A',
      orbGradient: 'radial-gradient(circle, rgba(255, 61, 154, 0.35) 0%, transparent 70%)',
      spotlight: 'rgba(255, 61, 154, 0.15)',
    },
    dev: {
      bgWash: 'linear-gradient(135deg, rgba(77, 141, 255, 0.20) 0%, rgba(31, 209, 249, 0.06) 60%, transparent 100%)',
      border: 'linear-gradient(135deg, rgba(77, 141, 255, 0.55) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(77, 141, 255, 0.24)',
      glowColor: '#4D8DFF',
      orbGradient: 'radial-gradient(circle, rgba(77, 141, 255, 0.32) 0%, transparent 70%)',
      spotlight: 'rgba(77, 141, 255, 0.14)',
    },
    health: {
      bgWash: 'linear-gradient(135deg, rgba(255, 107, 87, 0.20) 0%, rgba(255, 201, 60, 0.06) 60%, transparent 100%)',
      border: 'linear-gradient(135deg, rgba(255, 107, 87, 0.55) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(255, 107, 87, 0.24)',
      glowColor: '#FF6B57',
      orbGradient: 'radial-gradient(circle, rgba(255, 107, 87, 0.32) 0%, transparent 70%)',
      spotlight: 'rgba(255, 107, 87, 0.14)',
    },
    focus: {
      bgWash: 'linear-gradient(135deg, rgba(46, 230, 166, 0.20) 0%, rgba(182, 243, 74, 0.06) 60%, transparent 100%)',
      border: 'linear-gradient(135deg, rgba(46, 230, 166, 0.55) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(46, 230, 166, 0.24)',
      glowColor: '#2EE6A6',
      orbGradient: 'radial-gradient(circle, rgba(46, 230, 166, 0.32) 0%, transparent 70%)',
      spotlight: 'rgba(46, 230, 166, 0.14)',
    },
    growth: {
      bgWash: 'linear-gradient(135deg, rgba(255, 79, 163, 0.20) 0%, rgba(166, 120, 255, 0.06) 60%, transparent 100%)',
      border: 'linear-gradient(135deg, rgba(255, 79, 163, 0.55) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(255, 79, 163, 0.24)',
      glowColor: '#FF4FA3',
      orbGradient: 'radial-gradient(circle, rgba(255, 79, 163, 0.32) 0%, transparent 70%)',
      spotlight: 'rgba(255, 79, 163, 0.14)',
    },
    mindset: {
      bgWash: 'linear-gradient(135deg, rgba(166, 120, 255, 0.20) 0%, rgba(124, 77, 255, 0.06) 60%, transparent 100%)',
      border: 'linear-gradient(135deg, rgba(166, 120, 255, 0.55) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(166, 120, 255, 0.24)',
      glowColor: '#A678FF',
      orbGradient: 'radial-gradient(circle, rgba(166, 120, 255, 0.32) 0%, transparent 70%)',
      spotlight: 'rgba(166, 120, 255, 0.14)',
    },
    streak: {
      bgWash: 'linear-gradient(135deg, rgba(255, 201, 60, 0.22) 0%, rgba(255, 138, 61, 0.07) 60%, transparent 100%)',
      border: 'linear-gradient(135deg, rgba(255, 201, 60, 0.6) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(255, 201, 60, 0.26)',
      glowColor: '#FFC93C',
      orbGradient: 'radial-gradient(circle, rgba(255, 201, 60, 0.35) 0%, transparent 70%)',
      spotlight: 'rgba(255, 201, 60, 0.15)',
    },
    success: {
      bgWash: 'linear-gradient(135deg, rgba(182, 243, 74, 0.20) 0%, rgba(46, 230, 166, 0.06) 60%, transparent 100%)',
      border: 'linear-gradient(135deg, rgba(182, 243, 74, 0.55) 0%, rgba(255, 255, 255, 0.1) 100%)',
      shadow: '0 12px 40px rgba(182, 243, 74, 0.24)',
      glowColor: '#B6F34A',
      orbGradient: 'radial-gradient(circle, rgba(182, 243, 74, 0.32) 0%, transparent 70%)',
      spotlight: 'rgba(182, 243, 74, 0.14)',
    },
    none: {
      bgWash: 'rgba(255, 255, 255, 0.04)',
      border: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%)',
      shadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
      glowColor: '#FFFFFF',
      orbGradient: 'transparent',
      spotlight: 'rgba(255, 255, 255, 0.08)',
    },
  };

  const currentTint = tintConfig[tint];

  const orbPosClass = {
    'top-right': '-top-12 -right-12',
    'bottom-right': '-bottom-12 -right-12',
    'top-left': '-top-12 -left-12',
    'bottom-left': '-bottom-12 -left-12',
  }[cornerPosition];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      style={{
        background: `${currentTint.bgWash}, rgba(23, 15, 46, 0.75)`,
        boxShadow: currentTint.shadow,
        '--mx': `${coords.x}px`,
        '--my': `${coords.y}px`,
        '--spotlight-color': currentTint.spotlight,
      } as React.CSSProperties}
      className={`relative rounded-[var(--radius-card)] backdrop-blur-[18px] saturate-[160%] border border-white/10 p-5 sm:p-6 overflow-hidden transition-all duration-220 ${
        hoverEffect ? 'hover:-translate-y-1 hover:shadow-2xl hover:border-white/25' : ''
      } ${className}`}
      {...props}
    >
      {/* Decorative Corner Color Orb (25% opacity) */}
      {cornerOrb && tint !== 'none' && (
        <div
          aria-hidden="true"
          style={{ background: currentTint.orbGradient }}
          className={`absolute ${orbPosClass} w-44 h-44 rounded-full pointer-events-none z-0 opacity-80 blur-xl`}
        />
      )}

      {/* Large Watermark Icon (8% opacity) */}
      {watermark && (
        <div
          aria-hidden="true"
          className="absolute -right-3 -bottom-4 text-white/[0.07] pointer-events-none select-none z-0"
        >
          {watermark}
        </div>
      )}

      {/* Dynamic Cursor Spotlight in the card's own color */}
      {hoverEffect && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-220 z-0"
          style={{
            background: 'radial-gradient(350px circle at var(--mx, 50%) var(--my, 50%), var(--spotlight-color, rgba(255,255,255,0.08)), transparent 70%)',
          }}
        />
      )}

      {/* Inner Content on top of background effects */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
