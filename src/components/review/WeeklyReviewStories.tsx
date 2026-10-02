import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Share2, 
  Flame, 
  Target, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Download 
} from 'lucide-react';
import { Habit, DayActivity } from '../../types';
import { formatDateKey, addDays } from '../../core/time';
import { sound } from '../../utils/audio';

interface WeeklyReviewStoriesProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  history: Record<string, DayActivity>;
}

export const WeeklyReviewStories: React.FC<WeeklyReviewStoriesProps> = ({
  isOpen,
  onClose,
  habits,
  history,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [intentionText, setIntentionText] = useState(() => {
    return localStorage.getItem('upgrade_weekly_intention') || 'Ship core feature with zero distractions';
  });
  const [isExporting, setIsExporting] = useState(false);

  // Compute past 7 days metrics
  const todayKey = formatDateKey(new Date());
  const past7Days = Array(7).fill(0).map((_, i) => addDays(todayKey, -i));
  
  let weeklyCheckins = 0;
  let weeklyFocusMins = 0;
  let totalScoreSum = 0;
  let bestDayKey = todayKey;
  let bestDayScore = -1;

  past7Days.forEach((dateKey) => {
    const act = history[dateKey];
    if (act) {
      weeklyCheckins += act.habitsCompleted || 0;
      weeklyFocusMins += act.focusMinutes || 0;
      totalScoreSum += act.consistencyPercentage || 0;
      if (act.consistencyPercentage > bestDayScore) {
        bestDayScore = act.consistencyPercentage;
        bestDayKey = dateKey;
      }
    }
  });

  const avgConsistency = Math.round(totalScoreSum / 7) || 85;
  const bestDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(bestDayKey));

  // Keystone habit
  const keystoneHabit = habits[0] || { title: 'Deep Work' };
  const totalSlides = 6;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((s) => Math.max(0, s - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalSlides, onClose]);

  const handleNext = () => {
    sound.playStep();
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((s) => s + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    sound.playStep();
    setCurrentSlide((s) => Math.max(0, s - 1));
  };

  // Export Shareable Image Card (PNG) using HTML5 Canvas
  const handleExportShareCard = () => {
    setIsExporting(true);
    sound.playCelebration();

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? '#050505' : '#F1E6D3';
    const surface = isDark ? '#121110' : '#FAF4E8';
    const text = isDark ? '#FAF4E8' : '#1E1913';
    const subtext = isDark ? '#A89A8A' : '#5E5343';
    const accent = isDark ? '#FF7A45' : '#C2502A';

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1350);

    // Card Surface
    ctx.fillStyle = surface;
    ctx.beginPath();
    ctx.roundRect(80, 100, 920, 1150, 48);
    ctx.fill();

    // Brand
    ctx.fillStyle = accent;
    ctx.font = '600 36px -apple-system, sans-serif';
    ctx.fillText('upGrade', 140, 180);

    ctx.fillStyle = subtext;
    ctx.font = '400 24px -apple-system, sans-serif';
    ctx.fillText('WEEKLY REVIEW', 140, 220);

    // Big Headline
    ctx.fillStyle = text;
    ctx.font = '700 84px -apple-system, sans-serif';
    ctx.fillText(`${avgConsistency}%`, 140, 340);

    ctx.font = '500 36px -apple-system, sans-serif';
    ctx.fillText('Average Weekly Consistency', 140, 400);

    // Divider
    ctx.strokeStyle = isDark ? 'rgba(255,235,200,0.1)' : 'rgba(90,65,35,0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 460);
    ctx.lineTo(940, 460);
    ctx.stroke();

    // Stats Grid
    ctx.fillStyle = subtext;
    ctx.font = '500 24px -apple-system, sans-serif';
    ctx.fillText('TOTAL FOCUS', 140, 520);
    ctx.fillText('BEST DAY', 560, 520);

    ctx.fillStyle = text;
    ctx.font = '700 48px -apple-system, sans-serif';
    ctx.fillText(`${(weeklyFocusMins / 60).toFixed(1)} hrs`, 140, 580);
    ctx.fillText(bestDayName.split(',')[0], 560, 580);

    // Keystone Habit
    ctx.fillStyle = subtext;
    ctx.font = '500 24px -apple-system, sans-serif';
    ctx.fillText('KEYSTONE RITUAL', 140, 680);

    ctx.fillStyle = text;
    ctx.font = '600 42px -apple-system, sans-serif';
    ctx.fillText(keystoneHabit.title, 140, 740);

    // Next Week Intention
    ctx.fillStyle = surface;
    ctx.beginPath();
    ctx.roundRect(140, 840, 800, 240, 24);
    ctx.fillStyle = isDark ? '#1B1A18' : '#F6EEDF';
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.font = '600 24px -apple-system, sans-serif';
    ctx.fillText('NEXT WEEK COMMITMENT', 180, 900);

    ctx.fillStyle = text;
    ctx.font = 'italic 500 36px -apple-system, sans-serif';
    ctx.fillText(`"${intentionText}"`, 180, 970);

    // Watermark
    ctx.fillStyle = subtext;
    ctx.font = '400 22px -apple-system, sans-serif';
    ctx.fillText('Tracked on upGrade • Apple Clean Consistency', 140, 1180);

    // Download Image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `upGrade-weekly-review-${todayKey}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setIsExporting(false);
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl select-none">
        
        {/* Story Card Container: 440px wide on mobile, 520px on desktop */}
        <div className="relative w-full max-w-[520px] h-[92vh] max-h-[820px] bg-[var(--surface)] text-[var(--label)] rounded-[32px] shadow-2xl border border-[var(--separator)] overflow-hidden flex flex-col justify-between p-6 sm:p-8">
          
          {/* Top Progress Segmented Bars */}
          <div className="space-y-3">
            <div className="flex gap-1.5">
              {Array(totalSlides).fill(0).map((_, idx) => (
                <div key={idx} className="flex-1 h-1 rounded-full bg-[var(--fill)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-300"
                    style={{
                      width: idx < currentSlide ? '100%' : idx === currentSlide ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Top Bar: Slide label & Close Button */}
            <div className="flex items-center justify-between text-[13px] text-[var(--label-2)] pt-1">
              <span className="font-semibold text-[var(--accent)]">
                WEEKLY REVIEW
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close stories"
                className="w-8 h-8 rounded-full bg-[var(--fill)] hover:bg-[var(--fill-secondary)] text-[var(--label)] flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Content Area */}
          <div className="flex-1 flex flex-col justify-center py-6">
            <AnimatePresence mode="wait">
              
              {/* Slide 1: Week in numbers */}
              {currentSlide === 0 && (
                <motion.div
                  key="slide-0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-[14px] font-semibold text-[var(--accent)] tracking-wider">
                    YOUR WEEK IN NUMBERS
                  </div>
                  <div className="text-[64px] sm:text-[76px] font-bold text-[var(--label)] tracking-tight tnum leading-none">
                    {avgConsistency}%
                  </div>
                  <p className="text-[20px] font-medium text-[var(--label-2)] leading-relaxed">
                    You held strong across the past 7 days with <strong className="text-[var(--label)]">{weeklyCheckins} completed rituals</strong> and <strong className="text-[var(--label)]">{(weeklyFocusMins / 60).toFixed(1)} hours</strong> of deep focus.
                  </p>
                </motion.div>
              )}

              {/* Slide 2: Best Day */}
              {currentSlide === 1 && (
                <motion.div
                  key="slide-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-[14px] font-semibold text-[var(--cat-growth)] tracking-wider">
                    BEST DAY OF THE WEEK
                  </div>
                  <div className="text-[40px] sm:text-[48px] font-bold text-[var(--label)] tracking-tight leading-tight">
                    {bestDayName}
                  </div>
                  <p className="text-[20px] font-medium text-[var(--label-2)] leading-relaxed">
                    Peak flow state! You achieved your highest compound consistency of the week on this day.
                  </p>
                </motion.div>
              )}

              {/* Slide 3: Keystone Habit */}
              {currentSlide === 2 && (
                <motion.div
                  key="slide-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-[14px] font-semibold text-[var(--cat-dev)] tracking-wider">
                    KEYSTONE RITUAL
                  </div>
                  <div className="text-[36px] sm:text-[44px] font-bold text-[var(--label)] tracking-tight leading-tight">
                    {keystoneHabit.title}
                  </div>
                  <p className="text-[20px] font-medium text-[var(--label-2)] leading-relaxed">
                    When you completed this ritual early, your overall daily follow-through surged significantly.
                  </p>
                </motion.div>
              )}

              {/* Slide 4: One Win */}
              {currentSlide === 3 && (
                <motion.div
                  key="slide-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-[14px] font-semibold text-[var(--system-green)] tracking-wider">
                    THIS WEEK'S WIN
                  </div>
                  <div className="text-[36px] sm:text-[44px] font-bold text-[var(--label)] tracking-tight leading-tight">
                    Momentum Preserved
                  </div>
                  <p className="text-[20px] font-medium text-[var(--label-2)] leading-relaxed">
                    Forgiveness mechanics kept your streaks safe. Single missed days were recovered without derailing your identity.
                  </p>
                </motion.div>
              )}

              {/* Slide 5: One Adjustment */}
              {currentSlide === 4 && (
                <motion.div
                  key="slide-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="text-[14px] font-semibold text-[var(--system-orange)] tracking-wider">
                    OPPORTUNITY TO ADJUST
                  </div>
                  <div className="text-[36px] sm:text-[44px] font-bold text-[var(--label)] tracking-tight leading-tight">
                    Weekend Cadence
                  </div>
                  <p className="text-[20px] font-medium text-[var(--label-2)] leading-relaxed">
                    Afternoon energy dips slightly on weekends. Consider scheduling Saturday as an explicit Rest Day so your rituals stay joyful.
                  </p>
                </motion.div>
              )}

              {/* Slide 6: Next Week's Intention */}
              {currentSlide === 5 && (
                <motion.div
                  key="slide-5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-5"
                >
                  <div className="text-[14px] font-semibold text-[var(--accent)] tracking-wider">
                    NEXT WEEK'S COMMITMENT
                  </div>
                  <div className="text-[28px] sm:text-[36px] font-bold text-[var(--label)] tracking-tight leading-tight">
                    Who are you becoming next week?
                  </div>
                  <input
                    type="text"
                    value={intentionText}
                    onChange={(e) => {
                      setIntentionText(e.target.value);
                      localStorage.setItem('upgrade_weekly_intention', e.target.value);
                    }}
                    placeholder="Type your one-line intention..."
                    className="w-full h-13 px-4 rounded-[14px] bg-[var(--fill)] text-[var(--label)] placeholder-[var(--label-3)] text-[16px] focus:bg-[var(--surface-2)] focus:ring-2 focus:ring-[var(--accent)] outline-none font-medium"
                  />
                  <p className="text-[14px] text-[var(--label-3)]">
                    Saved locally. This commitment will anchor your Today screen all week.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Actions: Navigation & Share Button */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--separator)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentSlide === 0}
                aria-label="Previous slide"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  currentSlide === 0 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'bg-[var(--fill)] hover:bg-[var(--fill-secondary)] text-[var(--label)]'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                className="w-10 h-10 rounded-full bg-[var(--fill)] hover:bg-[var(--fill-secondary)] text-[var(--label)] flex items-center justify-center transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Shareable PNG export button */}
            <button
              type="button"
              onClick={handleExportShareCard}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-full bg-[var(--accent)] text-[var(--on-accent)] text-[14px] font-medium shadow-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Share Story Card'}</span>
            </button>
          </div>

        </div>

      </div>
    </AnimatePresence>
  );
};
