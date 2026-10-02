import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Check, 
  Flame, 
  Clock, 
  Code2, 
  Volume2, 
  Download, 
  Plus, 
  CheckCircle2,
  Sliders,
  Type,
  Box
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Chip, ChipVariant } from './ui/Chip';
import { IconButton } from './ui/IconButton';
import { SegmentedControl } from './ui/SegmentedControl';

export const DesignSystemPage: React.FC = () => {
  const [selectedSeg, setSelectedSeg] = useState<'tokens' | 'typography' | 'components' | 'motion'>('tokens');
  const [checkboxState, setCheckboxState] = useState(true);

  const colors = [
    { name: 'Accent Primary', varName: '--accent-start', hex: '#10E39A', class: 'bg-[#10E39A]' },
    { name: 'Accent Cyan', varName: '--accent-end', hex: '#22D3EE', class: 'bg-[#22D3EE]' },
    { name: 'Warn Amber', varName: '--color-warn', hex: '#F59E0B', class: 'bg-[#F59E0B]' },
    { name: 'Danger Rose', varName: '--color-danger', hex: '#F43F5E', class: 'bg-[#F43F5E]' },
    { name: 'Info Sky / Dev', varName: '--cat-code', hex: '#38BDF8', class: 'bg-[#38BDF8]' },
    { name: 'Category Health', varName: '--cat-health', hex: '#F59E0B', class: 'bg-[#F59E0B]' },
    { name: 'Category Focus', varName: '--cat-focus', hex: '#10E39A', class: 'bg-[#10E39A]' },
    { name: 'Category Mindset', varName: '--cat-mindset', hex: '#A78BFA', class: 'bg-[#A78BFA]' },
    { name: 'Surface Bg-0', varName: '--bg-0', hex: '#05070D', class: 'bg-[#05070D] border border-white/20' },
    { name: 'Surface Bg-1', varName: '--bg-1', hex: '#0A0E18', class: 'bg-[#0A0E18] border border-white/20' },
  ];

  const spacingScale = [
    { label: 'space-1', value: '4px' },
    { label: 'space-2', value: '8px' },
    { label: 'space-3', value: '12px' },
    { label: 'space-4', value: '16px' },
    { label: 'space-5', value: '20px' },
    { label: 'space-6', value: '24px' },
    { label: 'space-8', value: '32px' },
    { label: 'space-12', value: '48px' },
    { label: 'space-16', value: '64px' },
  ];

  const radii = [
    { label: 'radius-control', value: '8px' },
    { label: 'radius-chip', value: '12px' },
    { label: 'radius-inner', value: '16px' },
    { label: 'radius-card', value: '24px' },
    { label: 'radius-pill', value: '9999px' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-220">
      
      {/* Header Banner */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[var(--radius-control)] bg-[var(--accent-surface)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-start)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-[18px] font-semibold text-white tracking-tight">
                  upGrade Precision Design System
                </h2>
                <Chip variant="accent" pill size="sm">v2.0 Living Spec</Chip>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Precision glass, obsessive spacing, single accent family, Raycast/Linear caliber components.
              </p>
            </div>
          </div>

          <SegmentedControl
            options={[
              { id: 'tokens', label: 'Tokens', icon: <Sliders className="w-3.5 h-3.5" /> },
              { id: 'typography', label: 'Type Scale', icon: <Type className="w-3.5 h-3.5" /> },
              { id: 'components', label: 'Primitives', icon: <Box className="w-3.5 h-3.5" /> },
            ]}
            value={selectedSeg}
            onChange={(val) => setSelectedSeg(val as any)}
            size="sm"
            layoutId="ds-tab-pill"
          />
        </div>
      </GlassCard>

      {/* 1. Design Tokens Tab */}
      {selectedSeg === 'tokens' && (
        <div className="space-y-6">
          
          {/* Colors & Palette */}
          <GlassCard className="p-6">
            <h3 className="text-[15px] font-semibold text-white mb-1">Color Palette & Semantics</h3>
            <p className="text-[12px] text-slate-400 mb-4">
              Restrained dark-first palette with a single primary accent family and consistent category variables.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {colors.map((c) => (
                <div key={c.varName} className="p-3 rounded-[var(--radius-control)] bg-[var(--bg-1)] border border-[var(--border-subtle)] space-y-2">
                  <div className={`w-full h-10 rounded-[calc(var(--radius-control)-2px)] ${c.class}`} />
                  <div>
                    <div className="text-[12px] font-medium text-white">{c.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{c.hex}</div>
                    <div className="text-[9px] font-mono text-[var(--accent-start)]">{c.varName}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Spacing & Radii */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-[15px] font-semibold text-white mb-1">4px Base Spacing Scale</h3>
              <p className="text-[12px] text-slate-400 mb-4">
                Obsessive spatial grid: 4, 8, 12, 16, 20, 24, 32, 48, 64px.
              </p>

              <div className="space-y-2">
                {spacingScale.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-[12px] font-mono">
                    <span className="text-slate-400">var(--{s.label})</span>
                    <div className="flex items-center space-x-2">
                      <div className="bg-[var(--accent-start)]/30 h-3 rounded" style={{ width: s.value }} />
                      <span className="text-white w-10 text-right">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-[15px] font-semibold text-white mb-1">Border Radius System</h3>
              <p className="text-[12px] text-slate-400 mb-4">
                Controls (8px), Chips (12px), Inner cards (16px), Outer cards (24px), Pills (9999px).
              </p>

              <div className="space-y-3">
                {radii.map((r) => (
                  <div key={r.label} className="flex items-center justify-between p-2 rounded-[var(--radius-control)] bg-[var(--bg-1)] border border-[var(--border-subtle)] text-[12px]">
                    <span className="font-mono text-slate-300">var(--{r.label})</span>
                    <span className="font-mono text-[var(--accent-start)] font-bold">{r.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

        </div>
      )}

      {/* 2. Typography Scale Tab */}
      {selectedSeg === 'typography' && (
        <GlassCard className="p-6 space-y-6">
          <div>
            <h3 className="text-[15px] font-semibold text-white mb-1">Typography Scale (1.2 Ratio)</h3>
            <p className="text-[12px] text-slate-400">
              Self-hosted Geist (UI) + Geist Mono (numerals & micro labels). Strict tabular numerals for consistency.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-[var(--border-subtle)]">
            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="label-mono w-28">32px / 600</span>
              <span className="text-[32px] font-semibold tracking-[-0.02em] text-white num-tabular flex-1">
                94% Completion Rate (32.4h)
              </span>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="label-mono w-28">24px / 600</span>
              <span className="text-[24px] font-semibold text-white num-tabular flex-1">
                Everyday Consistency Matrix
              </span>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="label-mono w-28">18px / 600</span>
              <span className="text-[18px] font-semibold text-white flex-1">
                Section Title: Quantified Performance
              </span>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="label-mono w-28">15px / 600</span>
              <span className="text-[15px] font-semibold text-white flex-1">
                Card Title: Deep Work Output
              </span>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="label-mono w-28">13px / 500</span>
              <span className="text-[13px] font-medium text-slate-200 flex-1">
                Interactive control text, buttons, and navigation options.
              </span>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="label-mono w-28">12px / 400</span>
              <span className="text-[12px] text-slate-400 flex-1">
                Supporting description copy and subtitles without wrapping unnecessarily.
              </span>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <span className="label-mono w-28">11px / Mono</span>
              <span className="label-mono flex-1 text-[var(--accent-start)]">
                TRACKING COMPLETED — 4.0H / 4.0H GOAL (TABULAR MONO)
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 3. Primitives & Interactive States */}
      {selectedSeg === 'components' && (
        <div className="space-y-6">
          
          {/* Chip Variants */}
          <GlassCard className="p-6">
            <h3 className="text-[15px] font-semibold text-white mb-1">Chip Primitives</h3>
            <p className="text-[12px] text-slate-400 mb-4">
              All variants with tabular numbers and restrained color coding.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <Chip variant="default">Default Chip</Chip>
              <Chip variant="accent" pill>Accent Pill</Chip>
              <Chip variant="warn" icon={<Flame className="w-3.5 h-3.5 fill-[var(--color-warn)]" />}>28d Streak</Chip>
              <Chip variant="danger">Incomplete</Chip>
              <Chip variant="info">4.0h Logged</Chip>
              <Chip variant="code">Code & Dev</Chip>
              <Chip variant="health">Health & Body</Chip>
              <Chip variant="focus">Deep Focus</Chip>
              <Chip variant="mindset">Mindset</Chip>
              <Chip variant="growth">Growth</Chip>
            </div>
          </GlassCard>

          {/* Interactive Controls & States */}
          <GlassCard className="p-6">
            <h3 className="text-[15px] font-semibold text-white mb-1">
              Interactive States (Hover, Active, Focus, Disabled)
            </h3>
            <p className="text-[12px] text-slate-400 mb-4">
              Every element has 4 distinct states: hover transition (120ms), active scale(0.97), and focus-visible ring.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <IconButton icon={<Volume2 />} label="Default State" />
              <IconButton icon={<Download />} label="Accent State" variant="accent" />
              <IconButton icon={<Plus />} label="Active State" active />
              <IconButton icon={<Clock />} label="Disabled State" disabled />

              {/* Checkbox Interactive Demo */}
              <div className="flex items-center space-x-2 pl-4 border-l border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setCheckboxState(!checkboxState)}
                  className={`precision-checkbox interactive-control ${checkboxState ? 'checked' : ''}`}
                >
                  {checkboxState && <Check className="w-3.5 h-3.5 text-[#05070D] stroke-[3]" />}
                </button>
                <span className="text-[12px] text-slate-300">
                  Precision Checkbox: {checkboxState ? 'Checked' : 'Unchecked'}
                </span>
              </div>
            </div>
          </GlassCard>

        </div>
      )}

    </div>
  );
};
