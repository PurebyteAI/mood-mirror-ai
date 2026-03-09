// Ambient mood music engine using Web Audio API
// Generates procedural ambient soundscapes that shift with detected mood

class AmbientMusicEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.oscillators = [];
    this.currentMood = null;
    this.isPlaying = false;
    this.volume = 0.15;
    this.fadeTime = 2.0;
  }

  init() {
    if (this.audioCtx) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.audioCtx.destination);
  }

  // Mood-specific chord and timbre configurations
  getMoodConfig(mood) {
    const configs = {
      happiness: {
        frequencies: [261.63, 329.63, 392.0, 523.25], // C major chord + octave
        waveform: "sine",
        lfoRate: 0.3,
        lfoDepth: 3,
        filterFreq: 2000,
        filterQ: 0.5,
        detune: [0, 2, -2, 1],
      },
      happy: {
        frequencies: [261.63, 329.63, 392.0, 523.25],
        waveform: "sine",
        lfoRate: 0.3,
        lfoDepth: 3,
        filterFreq: 2000,
        filterQ: 0.5,
        detune: [0, 2, -2, 1],
      },
      sadness: {
        frequencies: [220.0, 261.63, 329.63, 440.0], // A minor
        waveform: "sine",
        lfoRate: 0.15,
        lfoDepth: 2,
        filterFreq: 800,
        filterQ: 1,
        detune: [0, -3, 2, -1],
      },
      sad: {
        frequencies: [220.0, 261.63, 329.63, 440.0],
        waveform: "sine",
        lfoRate: 0.15,
        lfoDepth: 2,
        filterFreq: 800,
        filterQ: 1,
        detune: [0, -3, 2, -1],
      },
      calmness: {
        frequencies: [130.81, 196.0, 261.63, 392.0], // C5 power chord, wide intervals
        waveform: "sine",
        lfoRate: 0.08,
        lfoDepth: 1.5,
        filterFreq: 600,
        filterQ: 0.7,
        detune: [0, 1, -1, 0.5],
      },
      calm: {
        frequencies: [130.81, 196.0, 261.63, 392.0],
        waveform: "sine",
        lfoRate: 0.08,
        lfoDepth: 1.5,
        filterFreq: 600,
        filterQ: 0.7,
        detune: [0, 1, -1, 0.5],
      },
      stress: {
        frequencies: [146.83, 174.61, 220.0, 293.66], // D minor, tighter
        waveform: "triangle",
        lfoRate: 0.6,
        lfoDepth: 5,
        filterFreq: 1200,
        filterQ: 2,
        detune: [0, 5, -5, 3],
      },
      stressed: {
        frequencies: [146.83, 174.61, 220.0, 293.66],
        waveform: "triangle",
        lfoRate: 0.6,
        lfoDepth: 5,
        filterFreq: 1200,
        filterQ: 2,
        detune: [0, 5, -5, 3],
      },
      anger: {
        frequencies: [110.0, 130.81, 164.81, 220.0], // Lower, darker
        waveform: "sawtooth",
        lfoRate: 0.8,
        lfoDepth: 8,
        filterFreq: 500,
        filterQ: 3,
        detune: [0, -7, 7, -4],
      },
      angry: {
        frequencies: [110.0, 130.81, 164.81, 220.0],
        waveform: "sawtooth",
        lfoRate: 0.8,
        lfoDepth: 8,
        filterFreq: 500,
        filterQ: 3,
        detune: [0, -7, 7, -4],
      },
      curiosity: {
        frequencies: [293.66, 349.23, 440.0, 523.25], // D major, bright
        waveform: "sine",
        lfoRate: 0.4,
        lfoDepth: 4,
        filterFreq: 1800,
        filterQ: 0.8,
        detune: [0, 3, -2, 4],
      },
      curious: {
        frequencies: [293.66, 349.23, 440.0, 523.25],
        waveform: "sine",
        lfoRate: 0.4,
        lfoDepth: 4,
        filterFreq: 1800,
        filterQ: 0.8,
        detune: [0, 3, -2, 4],
      },
    };

    return configs[mood?.toLowerCase()] || configs.calmness;
  }

  // Gracefully stop all current oscillators
  stopOscillators() {
    const now = this.audioCtx.currentTime;
    this.oscillators.forEach(({ osc, gain }) => {
      gain.gain.setTargetAtTime(0, now, this.fadeTime * 0.3);
      setTimeout(() => {
        try { osc.stop(); } catch (e) { /* already stopped */ }
      }, this.fadeTime * 1000);
    });
    this.oscillators = [];
  }

  // Create ambient soundscape for a mood
  playMood(mood) {
    if (!this.audioCtx) this.init();
    if (this.audioCtx.state === "suspended") this.audioCtx.resume();
    
    if (this.currentMood === mood?.toLowerCase() && this.isPlaying) return;
    this.currentMood = mood?.toLowerCase();

    // Fade out existing
    this.stopOscillators();

    const config = this.getMoodConfig(mood);
    const now = this.audioCtx.currentTime;

    config.frequencies.forEach((freq, i) => {
      // Main oscillator
      const osc = this.audioCtx.createOscillator();
      osc.type = config.waveform;
      osc.frequency.value = freq;
      osc.detune.value = config.detune[i] || 0;

      // LFO for subtle pitch modulation
      const lfo = this.audioCtx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = config.lfoRate + i * 0.02;
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.value = config.lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Filter
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = config.filterFreq;
      filter.Q.value = config.filterQ;

      // Individual gain (for fade-in)
      const gain = this.audioCtx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(
        this.volume / config.frequencies.length,
        now + i * 0.2,
        this.fadeTime * 0.5
      );

      // Connect: osc -> filter -> gain -> master
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.1);
      lfo.start(now);

      this.oscillators.push({ osc, lfo, gain, filter });
    });

    // Fade in master
    this.masterGain.gain.setTargetAtTime(1, now, this.fadeTime * 0.3);
    this.isPlaying = true;
  }

  // Default ambient when no mood is set
  playIdle() {
    this.playMood("calmness");
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioCtx && this.isPlaying) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.setTargetAtTime(this.volume > 0 ? 1 : 0, now, 0.3);
      // Redistribute individual gains
      const config = this.getMoodConfig(this.currentMood);
      this.oscillators.forEach(({ gain }) => {
        gain.gain.setTargetAtTime(
          this.volume / (config?.frequencies?.length || 4),
          now,
          0.3
        );
      });
    }
  }

  stop() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.setTargetAtTime(0, now, this.fadeTime * 0.3);
    setTimeout(() => {
      this.stopOscillators();
      this.isPlaying = false;
      this.currentMood = null;
    }, this.fadeTime * 1000);
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.playMood(this.currentMood || "calmness");
    }
    return this.isPlaying;
  }

  destroy() {
    this.stop();
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

// Singleton
const ambientEngine = new AmbientMusicEngine();
export default ambientEngine;
