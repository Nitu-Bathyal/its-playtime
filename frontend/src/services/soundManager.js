// 100% Offline Procedural Horror Audio Engine using Web Audio API
class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.isMuted = false;
    this.isMusicEnabled = true;
    this.isSfxEnabled = true;
    this.volume = 0.7;

    this.isPlayingMusic = false;
    this.musicInterval = null;
    this.windNode = null;

    this._loadSettings();
  }

  _loadSettings() {
    try {
      const saved = localStorage.getItem('its_playtime_audio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.isMuted = parsed.isMuted ?? false;
        this.isMusicEnabled = parsed.isMusicEnabled ?? true;
        this.isSfxEnabled = parsed.isSfxEnabled ?? true;
        this.volume = parsed.volume ?? 0.7;
      }
    } catch (e) {}
  }

  _saveSettings() {
    try {
      localStorage.setItem('its_playtime_audio_settings', JSON.stringify({
        isMuted: this.isMuted,
        isMusicEnabled: this.isMusicEnabled,
        isSfxEnabled: this.isSfxEnabled,
        volume: this.volume
      }));
    } catch (e) {}
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this._updateGains();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _updateGains() {
    if (!this.masterGain) return;
    const effectiveMaster = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.setValueAtTime(effectiveMaster, this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.isMusicEnabled ? 0.35 : 0, this.ctx.currentTime);
    this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? 0.8 : 0, this.ctx.currentTime);
  }

  // --- Controls ---
  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this._updateGains();
    this._saveSettings();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this._updateGains();
    this._saveSettings();
    return this.isMuted;
  }

  toggleMusic() {
    this.isMusicEnabled = !this.isMusicEnabled;
    this._updateGains();
    this._saveSettings();
    if (!this.isMusicEnabled) {
      this.stopCarnivalMusic();
    } else {
      this.startCarnivalMusic();
    }
    return this.isMusicEnabled;
  }

  toggleSfx() {
    this.isSfxEnabled = !this.isSfxEnabled;
    this._updateGains();
    this._saveSettings();
    return this.isSfxEnabled;
  }

  // --- Sound Effects ---
  playClick() {
    this.init();
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playBalloonSqueak() {
    this.init();
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + 0.08);
    osc.frequency.linearRampToValueAtTime(950, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playBalloonPop() {
    this.init();
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;

    // Pop burst buffer
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start();
  }

  playDoorCreak() {
    this.init();
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(260, this.ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(290, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.7);
  }

  playHeartbeat() {
    this.init();
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;

    const playThump = (timeOffset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, this.ctx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + timeOffset + 0.12);

      gain.gain.setValueAtTime(0.7, this.ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + timeOffset + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + timeOffset);
      osc.stop(this.ctx.currentTime + timeOffset + 0.15);
    };

    playThump(0);
    playThump(0.18);
  }

  playGhostMoan() {
    this.init();
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(340, this.ctx.currentTime + 0.5);
    osc.frequency.linearRampToValueAtTime(190, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  playSuccessChime() {
    this.init();
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;

    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
    });
  }

  // --- Background Carnival Calliope / Music Box ---
  startCarnivalMusic() {
    this.init();
    if (!this.ctx || this.isPlayingMusic || !this.isMusicEnabled || this.isMuted) return;

    this.isPlayingMusic = true;

    // Eerie chromatic carnival theme frequencies (in Hz)
    const melody = [
      440, 466.16, 440, 415.30, 440, 523.25, 493.88, 440,
      392, 415.30, 440, 392, 349.23, 392, 440, 329.63
    ];
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.isPlayingMusic || !this.isMusicEnabled || this.isMuted || !this.ctx) return;

      const freq = melody[noteIdx % melody.length];
      noteIdx++;

      // Synth note (antique music box / celesta)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    }, 450);
  }

  stopCarnivalMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
export default soundManager;
