import { ambientAudio, AmbientSoundType } from '../utils/ambientAudio';

export interface FocusSessionState {
  isActive: boolean;
  isPaused: boolean;
  isOpenEnded: boolean;
  totalDurationSeconds: number; // e.g. 25 * 60, or 0 if open
  secondsElapsed: number;
  secondsRemaining: number;
  habitId: string;
  habitTitle: string;
  ambientType: AmbientSoundType;
  ambientVolume: number;
}

type FocusListener = (state: FocusSessionState) => void;

class FocusManager {
  private state: FocusSessionState = {
    isActive: false,
    isPaused: false,
    isOpenEnded: false,
    totalDurationSeconds: 25 * 60,
    secondsElapsed: 0,
    secondsRemaining: 25 * 60,
    habitId: 'habit-1',
    habitTitle: 'Deep Work / Architecture & Code',
    ambientType: 'off',
    ambientVolume: 0.3,
  };

  private timerInterval: any = null;
  private listeners: Set<FocusListener> = new Set();
  private onSessionCompleteCallbacks: Array<(elapsedMinutes: number, note?: string) => void> = [];

  constructor() {
    // Restore or initialize
  }

  public getState(): FocusSessionState {
    return { ...this.state };
  }

  public subscribe(listener: FocusListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((fn) => fn(s));
  }

  public startSession(options: {
    durationMins?: number; // if undefined or 0, open-ended
    habitId?: string;
    habitTitle?: string;
  }) {
    this.stopTimer();

    const isPreset = options.durationMins && options.durationMins > 0;
    const totalSecs = isPreset ? options.durationMins! * 60 : 0;

    this.state = {
      ...this.state,
      isActive: true,
      isPaused: false,
      isOpenEnded: !isPreset,
      totalDurationSeconds: totalSecs,
      secondsElapsed: 0,
      secondsRemaining: totalSecs,
      habitId: options.habitId || this.state.habitId,
      habitTitle: options.habitTitle || this.state.habitTitle,
    };

    if (this.state.ambientType !== 'off') {
      ambientAudio.play(this.state.ambientType, this.state.ambientVolume);
    }

    this.timerInterval = setInterval(() => this.tick(), 1000);
    this.notify();
  }

  private tick() {
    if (this.state.isPaused || !this.state.isActive) return;

    if (this.state.isOpenEnded) {
      this.state.secondsElapsed += 1;
      this.notify();
    } else {
      this.state.secondsElapsed += 1;
      this.state.secondsRemaining = Math.max(0, this.state.secondsRemaining - 1);
      this.notify();

      if (this.state.secondsRemaining === 0) {
        this.completeSession();
      }
    }
  }

  public pause() {
    this.state.isPaused = true;
    ambientAudio.stop();
    this.notify();
  }

  public resume() {
    this.state.isPaused = false;
    if (this.state.ambientType !== 'off') {
      ambientAudio.play(this.state.ambientType, this.state.ambientVolume);
    }
    this.notify();
  }

  public setAmbient(type: AmbientSoundType, volume = 0.3) {
    this.state.ambientType = type;
    this.state.ambientVolume = volume;
    if (this.state.isActive && !this.state.isPaused) {
      ambientAudio.play(type, volume);
    } else {
      ambientAudio.stop();
    }
    this.notify();
  }

  public setLinkedHabit(id: string, title: string) {
    this.state.habitId = id;
    this.state.habitTitle = title;
    this.notify();
  }

  public completeSession(note?: string): number {
    this.stopTimer();
    ambientAudio.stop();

    const elapsedMins = Math.max(1, Math.round(this.state.secondsElapsed / 60));
    this.state.isActive = false;
    this.state.isPaused = false;
    this.notify();

    this.onSessionCompleteCallbacks.forEach((cb) => cb(elapsedMins, note));
    return elapsedMins;
  }

  public onSessionComplete(cb: (elapsedMinutes: number, note?: string) => void): () => void {
    this.onSessionCompleteCallbacks.push(cb);
    return () => {
      this.onSessionCompleteCallbacks = this.onSessionCompleteCallbacks.filter((c) => c !== cb);
    };
  }

  public cancelSession() {
    this.stopTimer();
    ambientAudio.stop();
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.secondsElapsed = 0;
    this.state.secondsRemaining = this.state.totalDurationSeconds;
    this.notify();
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

export const focusManager = new FocusManager();
