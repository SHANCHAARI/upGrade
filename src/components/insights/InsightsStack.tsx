import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  X, 
  Flame, 
  TrendingUp, 
  Target, 
  Calendar 
} from 'lucide-react';
import { InsightCardData } from '../../core/insights';
import { Card } from '../ui/Card';

interface InsightsStackProps {
  insights: InsightCardData[];
}

export const InsightsStack: React.FC<InsightsStackProps> = ({ insights }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWhyThis, setShowWhyThis] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const activeInsights = insights.filter((i) => !dismissedIds.includes(i.id));

  if (activeInsights.length === 0) return null;

  const current = activeInsights[Math.min(currentIndex, activeInsights.length - 1)];

  const handleNext = () => {
    setShowWhyThis(false);
    setCurrentIndex((prev) => (prev + 1) % activeInsights.length);
  };

  const handlePrev = () => {
    setShowWhyThis(false);
    setCurrentIndex((prev) => (prev - 1 + activeInsights.length) % activeInsights.length);
  };

  const handleDismiss = () => {
    setDismissedIds((prev) => [...prev, current.id]);
    setShowWhyThis(false);
  };

  const getIcon = (type: InsightCardData['type']) => {
    switch (type) {
      case 'keystone':
        return <Target className="w-4 h-4 text-[var(--accent)]" />;
      case 'correlation':
        return <TrendingUp className="w-4 h-4 text-[var(--cat-dev)]" />;
      case 'streak_risk':
        return <Flame className="w-4 h-4 text-[var(--system-orange)]" />;
      case 'pattern':
        return <Calendar className="w-4 h-4 text-[var(--cat-growth)]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[var(--accent)]" />;
    }
  };

  return (
    <Card className="p-5 sm:p-6 bg-[var(--surface)] border border-[var(--separator)] relative overflow-hidden transition-all duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[8px] bg-[var(--fill)]">
            {getIcon(current.type)}
          </div>
          <span className="text-[13px] font-semibold text-[var(--accent)] tracking-tight">
            {current.headline}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--fill)] text-[var(--label-3)] font-medium">
            {current.confidence} confidence
          </span>
        </div>

        {/* Dismiss and navigation */}
        <div className="flex items-center gap-1.5">
          {activeInsights.length > 1 && (
            <div className="flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous insight"
                className="w-6 h-6 rounded-full hover:bg-[var(--fill)] flex items-center justify-center text-[var(--label-2)] transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-[var(--label-3)] tnum">
                {currentIndex + 1}/{activeInsights.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next insight"
                className="w-6 h-6 rounded-full hover:bg-[var(--fill)] flex items-center justify-center text-[var(--label-2)] transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss insight"
            className="w-6 h-6 rounded-full hover:bg-[var(--fill)] flex items-center justify-center text-[var(--label-3)] hover:text-[var(--label)] transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content & Metric Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-[16px] font-medium text-[var(--label)] leading-snug">
            {current.sentence}
          </p>

          <button
            type="button"
            onClick={() => setShowWhyThis(!showWhyThis)}
            className="mt-2 text-[12px] text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
          >
            <Info className="w-3 h-3" />
            <span>{showWhyThis ? 'Hide math' : 'Why this? (honest math)'}</span>
          </button>
        </div>

        {current.metricNumber && (
          <div className="shrink-0 text-left sm:text-right bg-[var(--fill)] sm:bg-transparent p-3 sm:p-0 rounded-[12px]">
            <div className="text-[28px] sm:text-[32px] font-bold text-[var(--label)] tracking-tight tnum leading-none">
              {current.metricNumber}
            </div>
            {current.metricLabel && (
              <div className="text-[11px] text-[var(--label-2)] mt-0.5">
                {current.metricLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* "Why This?" Honest Math Expander */}
      {showWhyThis && (
        <div className="mt-3 pt-3 border-t border-[var(--separator)] text-[12px] text-[var(--label-2)] bg-[var(--fill-secondary)]/50 p-3 rounded-[10px] space-y-1 animate-in fade-in duration-150">
          <div className="font-semibold text-[var(--label)]">Mathematical Derivation:</div>
          <p>{current.whyThis}</p>
          <div className="text-[11px] text-[var(--label-3)]">
            Sample size: {current.sampleSize} data points evaluated locally on your device.
          </div>
        </div>
      )}

    </Card>
  );
};
