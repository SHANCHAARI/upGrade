import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Check, 
  Flame,
  CloudRain,
  Radio,
  Coffee
} from 'lucide-react';
import { Habit } from '../types';
import { focusManager, FocusSessionState } from '../core/focusState';
import { ambientAudio, AmbientSoundType } from '../utils/ambientAudio';
import { sound } from '../utils/audio';
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';

interface FocusTimerProps {
  onLogFocusSession: (minutes: number, note?: string) => void;
  habits?: Habit[];
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onLogFocusSession,
  habits = [],
}) => {
  const [session, setSession] = useState<FocusSessionState>(() => focusManager.getState());
  const [selectedPreset, setSelectedPreset] = useState<number>(25); // 25, 50, 90, 0 = open
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [shipNote, setShipNote] = useState('');
  const [lastElapsedMins, setLastElapsedMins] = useState(0);

  useEffect(() => {
    return focusManager.subscribe((st) => setSession(st));
  }, []);

  const devHabit = habits.find((h) => h.category === 'dev' || h.id === 'habit-1') || habits[0];

  // Presets
  const presets = [
    { label: '25 min', mins: 25 },
    { label: '50 min', mins: 50 },
    { label: '90 min', mins: 90 },
    { label: 'Open-ended', mins: 0 },
  ];

  const handleStart = () => {
    sound.playCheck();
    focusManager.startSession({
      durationMins: selectedPreset,
      habitId: devHabit?.id || 'habit-1',
      habitTitle: devHabit?.title || 'Deep Work',
    });
  };

  const handlePauseToggle = () => {
    sound.playStep();
    if (session.isPaused) {
      focusManager.resume();
    } else {
      focusManager.pause();
    }
  };

  const handleStop = () => {
    sound.playCelebration();
    const elapsed = Math.max(1, Math.round(session.secondsElapsed / 60));
    setLastElapsedMins(elapsed);
    focusManager.pause();
    setIsShipModalOpen(true);
  };

  const handleConfirmShip = () => {
    focusManager.completeSession(shipNote.trim() || undefined);
    onLogFocusSession(lastElapsedMins, shipNote.trim() || undefined);
    setIsShipModalOpen(false);
    setShipNote('');
  };

  // Picture in picture support
  const handleLaunchPiP = async () => {
    try {
      if ('documentPictureInPicture' in window) {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 320,
          height: 180,
        });

        // Copy styles to PiP window
        document.querySelectorAll('link[rel="stylesheet"], style').forEach((style) => {
          pipWindow.document.head.appendChild(style.cloneNode(true));
        });

        // Render mini timer inside PiP
        const container = pipWindow.document.createElement('div');
        container.style.cssText = `
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100vh; background: #050505; color: #FAF4E8; font-family: -apple-system, sans-serif;
        `;
        container.innerHTML = `
          <div style="font-size: 13px; color: #FF7A45; margin-bottom: 4px;">Deep Work</div>
          <div id="pip-time" style="font-size: 48px; font-weight: 700; font-variant-numeric: tabular-nums;">
            ${formatTime(session.isOpenEnded ? session.secondsElapsed : session.secondsRemaining)}
          </div>
        `;
        pipWindow.document.body.appendChild(container);

        // Update PiP timer
        const interval = setInterval(() => {
          const cur = focusManager.getState();
          const timeEl = pipWindow.document.getElementById('pip-time');
          if (timeEl) {
            timeEl.innerText = formatTime(cur.isOpenEnded ? cur.secondsElapsed : cur.secondsRemaining);
          }
        }, 1000);

        pipWindow.addEventListener('pagehide', () => clearInterval(interval));
      }
    } catch (err) {
      console.warn('Document PiP not available or permission denied', err);
    }
  };

  // Time calculations
  function formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const displaySeconds = session.isOpenEnded
    ? session.secondsElapsed
    : (session.isActive ? session.secondsRemaining : selectedPreset * 60);

  const timeFormatted = formatTime(displaySeconds);

  // SVG Ring Progress
  const ringSize = 340;
  const strokeWidth = 10;
  const center = ringSize / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;

  let progressPercent = 0;
  if (!session.isOpenEnded && session.totalDurationSeconds > 0) {
    progressPercent = Math.min(100, (session.secondsElapsed / session.totalDurationSeconds) * 100);
  } else if (session.isOpenEnded) {
    // Soft cycle every 60 minutes
    progressPercent = ((session.secondsElapsed % 3600) / 3600) * 100;
  }
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className={`relative transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-[var(--bg)] flex flex-col justify-between p-6 sm:p-12' : 'max-w-xl mx-auto space-y-8 pt-4'}`}>
      
      {/* Top Header & Ambient Audio controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-[var(--label)]">
            Focus Mode
          </h1>
          <p className="text-[15px] text-[var(--label-2)] mt-0.5">
            Calm deep work that compounds into your rituals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Ambient Soundscape selector */}
          <div className="flex items-center gap-1 bg-[var(--fill)] rounded-full p-1">
            {[
              { type: 'off', label: 'Off', icon: <VolumeX className="w-3.5 h-3.5" /> },
              { type: 'brown_noise', label: 'Brown Noise', icon: <Radio className="w-3.5 h-3.5" /> },
              { type: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" /> },
              { type: 'cafe', label: 'Cafe', icon: <Coffee className="w-3.5 h-3.5" /> },
            ].map((amb) => {
              const isSelected = session.ambientType === amb.type;
              return (
                <button
                  key={amb.type}
                  type="button"
                  title={amb.label}
                  onClick={() => focusManager.setAmbient(amb.type as AmbientSoundType)}
                  className={`p-1.5 rounded-full text-[12px] font-medium transition ${
                    isSelected
                      ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                      : 'text-[var(--label-3)] hover:text-[var(--label)]'
                  }`}
                >
                  {amb.icon}
                </button>
              );
            })}
          </div>

          {/* Full Screen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit full screen' : 'Full screen focus'}
            className="p-2 rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)] transition"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Focus Centerpiece: Giant Ring & 96px Tabular Numerals */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative flex items-center justify-center">
          
          <svg width={ringSize} height={ringSize} className="transform -rotate-90">
            {/* Background ring track (14% opacity) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="var(--accent)"
              strokeWidth={strokeWidth}
              strokeOpacity="0.14"
              fill="transparent"
            />
            {/* Soft progress ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="var(--accent)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* 96px Tabular Time Display */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-[64px] sm:text-[84px] md:text-[96px] font-semibold tracking-tight text-[var(--label)] tnum leading-none select-none">
              {timeFormatted}
            </span>
            <span className="text-[14px] font-medium text-[var(--label-2)] mt-2">
              {session.isActive
                ? (session.isPaused ? 'Paused' : 'Deep Work Session')
                : (selectedPreset === 0 ? 'Open Session' : `${selectedPreset} Minute Flow`)}
            </span>
          </div>

        </div>

        {/* Presets Row (Only visible when not running) */}
        {!session.isActive && (
          <div className="flex items-center gap-2 mt-6">
            {presets.map((preset) => {
              const isSelected = selectedPreset === preset.mins;
              return (
                <button
                  key={preset.mins}
                  type="button"
                  onClick={() => setSelectedPreset(preset.mins)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition ${
                    isSelected
                      ? 'bg-[var(--accent)] text-[var(--on-accent)] shadow-sm'
                      : 'bg-[var(--fill)] text-[var(--label)] hover:bg-[var(--fill-secondary)]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Primary Controls: Calm Pause/Resume & Stop */}
        <div className="flex items-center gap-4 mt-8">
          {!session.isActive ? (
            <button
              type="button"
              onClick={handleStart}
              className="h-14 px-8 rounded-full bg-[var(--accent)] text-[var(--on-accent)] text-[16px] font-medium shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-2.5"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Begin Focus</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePauseToggle}
                className="h-14 px-6 rounded-full bg-[var(--surface-2)] border border-[var(--separator)] text-[var(--label)] text-[15px] font-medium hover:bg-[var(--fill)] active:scale-95 transition-all flex items-center gap-2"
              >
                {session.isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="h-14 px-6 rounded-full bg-[var(--fill)] hover:bg-rose-500/15 hover:text-rose-500 text-[var(--label)] text-[15px] font-medium active:scale-95 transition-all flex items-center gap-2"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>End Session</span>
              </button>
            </>
          )}

          {/* Floating PiP Button */}
          {typeof window !== 'undefined' && 'documentPictureInPicture' in window && (
            <button
              type="button"
              onClick={handleLaunchPiP}
              title="Mini Floating Timer"
              className="w-12 h-12 rounded-full bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)] flex items-center justify-center transition"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Linked Habit Indicator */}
        <div className="mt-6 flex items-center gap-2 text-[13px] text-[var(--label-3)]">
          <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Logs automatically to: <strong className="text-[var(--label)] font-medium">{devHabit?.title || 'Deep Work'}</strong></span>
        </div>
      </div>

      {/* "What did you ship?" Modal Sheet on Session End */}
      <Sheet
        isOpen={isShipModalOpen}
        onClose={() => setIsShipModalOpen(false)}
        title="Session Concluded"
        subtitle={`Logged ${lastElapsedMins} min of deep focus`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[var(--label-2)] mb-1.5">
              What did you ship? (Optional reflection)
            </label>
            <input
              type="text"
              autoFocus
              value={shipNote}
              onChange={(e) => setShipNote(e.target.value)}
              placeholder="e.g. Implemented 28-day exponential decay score engine"
              className="w-full h-11 px-3.5 rounded-[12px] bg-[var(--fill)] text-[var(--label)] placeholder-[var(--label-3)] text-[15px] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmShip();
              }}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--separator)]">
            <Button type="button" variant="plain" onClick={() => setIsShipModalOpen(false)}>
              Skip Note
            </Button>
            <Button type="button" variant="filled" onClick={handleConfirmShip}>
              Save to Habit
            </Button>
          </div>
        </div>
      </Sheet>

    </div>
  );
};
