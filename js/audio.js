/**
 * Don't Look Away - Procedural Audio Engine
 * Pure Web Audio API synthesis - no external audio files required.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.staticGain = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.initialized = false;

    // Heartbeat loop state
    this.heartbeatTimer = null;
    this.heartbeatRate = 70; // BPM
    this.heartbeatActive = false;

    // Ambient nodes
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.staticNode = null;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Start continuous ambient sound
      this._setupAmbience();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      const target = mute ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  _setupAmbience() {
    if (!this.ctx) return;

    // 1. Dark Sub-Bass Drone (Electrical transformer / room presence)
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.connect(this.ambientGain);

    // Osc 1: 52Hz low hum
    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc1.type = 'sawtooth';
    this.ambientOsc1.frequency.setValueAtTime(52, this.ctx.currentTime);
    this.ambientOsc1.connect(filter);
    this.ambientOsc1.start();

    // Osc 2: 56Hz beating dissonance
    this.ambientOsc2 = this.ctx.createOscillator();
    this.ambientOsc2.type = 'sine';
    this.ambientOsc2.frequency.setValueAtTime(56.5, this.ctx.currentTime);
    this.ambientOsc2.connect(filter);
    this.ambientOsc2.start();

    // 2. Analog CCTV Tape / Static Hiss (White noise through bandpass)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.staticNode = this.ctx.createBufferSource();
    this.staticNode.buffer = noiseBuffer;
    this.staticNode.loop = true;

    const staticFilter = this.ctx.createBiquadFilter();
    staticFilter.type = 'bandpass';
    staticFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    staticFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.staticGain = this.ctx.createGain();
    this.staticGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    this.staticNode.connect(staticFilter);
    staticFilter.connect(this.staticGain);
    this.staticGain.connect(this.masterGain);
    this.staticNode.start();
  }

  /** Mechanical terminal click */
  playClick() {
    if (!this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  /** Anomaly correctly identified - Positive surveillance ping */
  playReportSuccess() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 high tech chime
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.1, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.4);
    });
  }

  /** False report buzzer - harsh error */
  playFalseAlarm() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.setValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /** Sudden anomaly appearance cue / electrical glitch */
  playGlitch(intensity = 1) {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const dur = 0.15 * intensity;

    // Noise burst
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);

    // Eerie micro tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + dur);

    oscGain.gain.setValueAtTime(0.15 * intensity, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  /** Door knocking / pounding sound */
  playDoorPound() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    [0, 0.14, 0.28].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t + offset);
      osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.08);

      gain.gain.setValueAtTime(0.3, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.12);
    });
  }

  /** Shadow whisper / chilling spectral breath */
  playWhisper() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const dur = 1.2;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + dur);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + dur * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  /** Single heartbeat "lub-dub" */
  playHeartbeatPulse(urgency = 1) {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const vol = 0.15 + 0.15 * Math.min(1, urgency);

    // "Lub"
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65, t);
    osc1.frequency.exponentialRampToValueAtTime(35, t + 0.1);

    gain1.gain.setValueAtTime(vol, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.13);

    // "Dub" (slightly delayed and softer)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55, t + 0.14);
    osc2.frequency.exponentialRampToValueAtTime(30, t + 0.24);

    gain2.gain.setValueAtTime(vol * 0.8, t + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t + 0.14);
    osc2.stop(t + 0.27);
  }

  startHeartbeat(urgency = 1) {
    if (this.heartbeatActive) return;
    this.heartbeatActive = true;

    const beatLoop = () => {
      if (!this.heartbeatActive) return;
      this.playHeartbeatPulse(urgency);
      const interval = Math.max(450, 1000 - urgency * 450); // scales from 1000ms down to 450ms
      this.heartbeatTimer = setTimeout(beatLoop, interval);
    };

    beatLoop();
  }

  stopHeartbeat() {
    this.heartbeatActive = false;
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  updateHeartbeatRate(urgency) {
    // If running, the next loop cycle automatically uses the interval formula
    if (!this.heartbeatActive && urgency > 0.3) {
      this.startHeartbeat(urgency);
    } else if (this.heartbeatActive && urgency <= 0.1) {
      this.stopHeartbeat();
    }
  }

  /** Dramatic Jumpscare / Horror Stinger for Game Over or Catastrophic Event */
  playStinger() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const dur = 2.5;

    // Dissonant chord cluster: low saw waves
    const freqs = [65.4, 92.5, 123.47, 174.61, 246.94]; // Detuned minor cluster
    freqs.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 0.9, t + dur);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + dur);
    });

    // Intense static crash burst
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.8), this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    noise.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(t);
  }

  /** 6:00 AM Dawn Chimes - Solemn, beautiful Westminster chime */
  playDawnChimes() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Westminster chime phrase: E4, G#4, F#4, B3, ...
    const notes = [
      { f: 329.63, time: 0.0, dur: 0.8 }, // E4
      { f: 415.30, time: 0.7, dur: 0.8 }, // G#4
      { f: 369.99, time: 1.4, dur: 0.8 }, // F#4
      { f: 246.94, time: 2.1, dur: 1.2 }, // B3
      { f: 164.81, time: 3.4, dur: 2.5 }  // Deep E3 Bell strike
    ];

    notes.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t + note.time);

      gain.gain.setValueAtTime(0.25, t + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + note.time);
      osc.stop(t + note.time + note.dur);
    });
  }

  /** Camera Channel Switch - CRT video sync clunk and static click */
  playCamSwitch() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    
    // Low mechanical clunk
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.06);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.07);

    // Static burst chirp
    const dur = 0.08;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.18, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(t);
  }

  /** Heavy Pneumatic Door Lock Slam */
  playDoorLock() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Heavy metal impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.18);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.22);

    // Air pressure hiss
    const dur = 0.25;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, t);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.15, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(t);
  }

  /** Pneumatic Door Unlock Release */
  playDoorUnlock() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Lighter hydraulic release
    const dur = 0.16;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.linearRampToValueAtTime(600, t + dur);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.16, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(t);
  }

  /** Motion Scanner Sensor Ping */
  playScannerPing() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, t);
    osc.frequency.exponentialRampToValueAtTime(920, t + 0.35);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  /** Camera Reboot Modem Tone */
  playCameraReboot() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    [440, 660, 880, 1320].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.06, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.08);
    });
  }

  /** Low Battery Warning Alarm */
  playLowBatteryAlarm() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    [0, 0.15].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, t + offset);

      gain.gain.setValueAtTime(0.12, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.12);
    });
  }
}

// Global instance
window.soundSystem = new SoundSystem();
