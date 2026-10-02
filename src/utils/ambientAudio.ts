/**
 * Ambient Audio Generator using Web Audio API (zero external audio files).
 * Synthesizes pure procedural soundscapes:
 * - Rain
 * - Brown Noise (deep calming rumble)
 * - Cafe Ambience
 */

export type AmbientSoundType = 'off' | 'rain' | 'brown_noise' | 'cafe';

class AmbientAudioManager {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'off';
  private masterGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private dropletInterval: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: AmbientSoundType, volume = 0.3) {
    if (type === 'off') {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    this.stop(); // Stop any currently playing audio
    this.currentType = type;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), this.ctx.currentTime + 1.2);
    this.masterGain.connect(this.ctx.destination);

    if (type === 'brown_noise') {
      this.generateBrownNoise();
    } else if (type === 'rain') {
      this.generateRain();
    } else if (type === 'cafe') {
      this.generateCafe();
    }
  }

  private generateBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Gentle low-pass filter to make it deeply relaxing
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.noiseNode = whiteNoise;
    this.filterNode = filter;
  }

  private generateRain() {
    if (!this.ctx || !this.masterGain) return;
    // Base rain rumble: pink/brown noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.6;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(this.masterGain);
    rainSource.start();

    this.noiseNode = rainSource;
    this.filterNode = filter;
  }

  private generateCafe() {
    if (!this.ctx || !this.masterGain) return;
    // Cafe ambient: low warm murmur created by layered lowpass filtered noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.05 * white) / 1.05;
      last = data[i];
    }

    const cafeSource = this.ctx.createBufferSource();
    cafeSource.buffer = buffer;
    cafeSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    cafeSource.connect(filter);
    filter.connect(this.masterGain);
    cafeSource.start();

    this.noiseNode = cafeSource;
    this.filterNode = filter;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.dropletInterval) {
      clearInterval(this.dropletInterval);
      this.dropletInterval = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        try {
          if (this.noiseNode) {
            (this.noiseNode as any).stop?.();
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
        } catch {}
      }, 350);
    }
    this.currentType = 'off';
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }
}

export const ambientAudio = new AmbientAudioManager();
