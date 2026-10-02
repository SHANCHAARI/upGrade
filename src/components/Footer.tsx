import React from 'react';
import { ArrowUpRight, Sparkles, Shield, Compass, Heart, Terminal, Database, Cloud } from 'lucide-react';

interface FooterProps {
  onOpenCommandBar?: () => void;
  onOpenBackup?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCommandBar,
  onOpenBackup,
}) => {
  return (
    <footer className="mt-20 pt-12 pb-16 border-t border-[var(--separator)] text-[var(--label)] relative overflow-hidden">
      
      {/* Subtle Warm Atmospheric Glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] bg-[var(--accent)]/5 blur-[90px] pointer-events-none rounded-full"
      />

      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        
        {/* Creative Manifesto Section */}
        <div className="p-8 sm:p-10 rounded-[24px] bg-[var(--surface)] border border-[var(--separator)] shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--fill)] text-[12px] font-medium text-[var(--accent)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A Ritual Laboratory for Human Momentum</span>
            </div>

            <h3 className="text-[26px] sm:text-[32px] font-serif font-normal tracking-tight text-[var(--label)] leading-[1.25]">
              Designed not to gamify dopamine, but to cultivate quiet, compounding mastery.
            </h3>

            <p className="text-[15px] sm:text-[16px] text-[var(--label-2)] leading-relaxed font-sans">
              upGrade is an architectural instrument for daily life. We rejected predatory streaks that punish honest rest, aggressive blue-light emissions, and third-party data tracking. Instead, we built on principles of architectural restraint: a 28-day exponential decay momentum engine, local-first IndexedDB privacy, and time-aware organic surfaces.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://thenightbuild.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--on-accent)] text-[13px] font-medium transition duration-200 hover:opacity-95 shadow-sm active:scale-95"
              >
                <span>Built by The Night Build Studio</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <span className="text-[13px] text-[var(--label-3)]">
                Crafting digital instruments after dark.
              </span>
            </div>

          </div>

          {/* Architectural Watermark / Seal */}
          <div 
            aria-hidden="true" 
            className="hidden md:block absolute -right-6 -bottom-8 select-none pointer-events-none opacity-5 font-serif text-[180px] italic text-[var(--accent)]"
          >
            N
          </div>
        </div>

        {/* Studio Specs & Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[var(--separator)] text-[13px]">
          
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--label-3)]">
              Architecture
            </span>
            <p className="text-[var(--label-2)] flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Local-First Dexie v2</span>
            </p>
            <p className="text-[12px] text-[var(--label-3)]">
              Zero cloud latency. Your habits stay on your device.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--label-3)]">
              Spectrometry
            </span>
            <p className="text-[var(--label-2)] flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-[var(--cat-growth)]" />
              <span>Zero-Blue Palette</span>
            </p>
            <p className="text-[12px] text-[var(--label-3)]">
              Warm linen paper & deep black #050505.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--label-3)]">
              Acoustics
            </span>
            <p className="text-[var(--label-2)] flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-[var(--cat-focus)]" />
              <span>Web Audio Synthesizer</span>
            </p>
            <p className="text-[12px] text-[var(--label-3)]">
              Pure procedural rain, cafe, and brown noise.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--label-3)]">
              Cloud Sync
            </span>
            <p className="text-[var(--label-2)] flex items-center gap-1.5 font-medium">
              <Cloud className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Supabase Connected</span>
            </p>
            <p className="text-[12px] text-[var(--label-3)]">
              Optional cross-device sync & PostgreSQL storage.
            </p>
          </div>

        </div>

        {/* Bottom Credits & Quick Controls */}
        <div className="pt-6 border-t border-[var(--separator)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--label-3)]">
          
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} upGrade</span>
            <span>•</span>
            <a
              href="https://thenightbuild.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--label)] hover:text-[var(--accent)] font-medium transition"
            >
              The Night Build Studio
            </a>
          </div>

          <div className="flex items-center gap-4 text-[12px]">
            {onOpenCommandBar && (
              <button
                type="button"
                onClick={onOpenCommandBar}
                className="hover:text-[var(--label)] transition flex items-center gap-1"
              >
                <span>Command Bar</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--fill)] font-mono text-[10px]">⌘K</kbd>
              </button>
            )}

            {onOpenBackup && (
              <button
                type="button"
                onClick={onOpenBackup}
                className="hover:text-[var(--label)] transition"
              >
                Backup & Cloud Sync
              </button>
            )}
          </div>

        </div>

      </div>
    </footer>
  );
};
