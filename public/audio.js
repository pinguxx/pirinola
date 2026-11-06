// ============================================================================
// PIRINOLA ONLINE • WEB AUDIO SYNTHESIZER & VOICE LOCUTION (ZERO EXTERNAL ASSETS)
// ============================================================================

class PirinolaAudio {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('pirinola_muted') === 'true';
    this.voiceEnabled = localStorage.getItem('pirinola_voice') !== 'false';
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('pirinola_muted', String(this.muted));
    if (this.muted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return this.muted;
  }

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    localStorage.setItem('pirinola_voice', String(this.voiceEnabled));
    if (!this.voiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return this.voiceEnabled;
  }

  // Charge tick while holding spin button
  playChargeTick(powerNormalized = 0.5) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240 + powerNormalized * 520, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Wooden Pirinola Spin Whir + Decelerating Wobble Clacks + Tip-Over Thud
  playSpinSound(durationMs = 2300, tier = 'fuerte') {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const durSec = Math.max(1.4, durationMs / 1000);

    // 1. Airy wooden gyroscopic whir
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const whirGain = ctx.createGain();

    osc.type = 'sawtooth';
    const startFreq = tier === 'turbo' ? 320 : tier === 'fuerte' ? 250 : 195;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + durSec * 0.92);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, now);
    filter.Q.setValueAtTime(3.2, now);

    whirGain.gain.setValueAtTime(0.001, now);
    whirGain.gain.linearRampToValueAtTime(0.065, now + 0.12);
    whirGain.gain.exponentialRampToValueAtTime(0.001, now + durSec * 0.92);

    osc.connect(filter);
    filter.connect(whirGain);
    whirGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durSec);

    // 2. Rhythmic wooden edge clacks as the hexagonal prism wobbles and tips over
    const clackCount = tier === 'turbo' ? 16 : tier === 'fuerte' ? 12 : 9;
    for (let i = 0; i < clackCount; i++) {
      const progress = i / clackCount;
      // Ease-in spacing so clacks slow down near the end
      const tOffset = Math.pow(progress, 0.72) * (durSec * 0.92);
      const clackTime = now + tOffset;

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      const pitch = 680 - progress * 340;
      clickOsc.frequency.setValueAtTime(pitch, clackTime);
      clickOsc.frequency.exponentialRampToValueAtTime(140, clackTime + 0.035);

      const vol = 0.03 + progress * 0.07;
      clickGain.gain.setValueAtTime(vol, clackTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clackTime + 0.04);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(clackTime);
      clickOsc.stop(clackTime + 0.045);
    }

    // 3. Final wooden face landing thud
    const landTime = now + durSec * 0.95;
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(185, landTime);
    thudOsc.frequency.exponentialRampToValueAtTime(58, landTime + 0.11);

    thudGain.gain.setValueAtTime(0.18, landTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.12);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(landTime);
    thudOsc.stop(landTime + 0.13);
  }

  // Coin clinks when putting or taking from El Pozo
  playCoinClink(count = 2, isGain = true) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const clinks = Math.min(Math.max(1, count), 7);
    const now = ctx.currentTime;

    for (let i = 0; i < clinks; i++) {
      const t = now + i * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const baseFreq = isGain ? 1320 + i * 110 : 880 - i * 45;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, t + 0.08);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  // Brass fanfare for TOMA TODO
  playTomaTodoFanfare() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.09;
      const dur = idx === notes.length - 1 ? 0.42 : 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  }

  // Gentle comic thud for PON 1 / PON 2 / TODOS PONEN
  playPonSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [330, 261.63];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  // Miracle Spin recovery chime
  playMiracleChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [587.33, 739.99, 880, 1174.66];
    const now = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  // Full Victory Fanfare
  playVictoryFanfare() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const melody = [
      { f: 523.25, t: 0.0, d: 0.12 },
      { f: 659.25, t: 0.12, d: 0.12 },
      { f: 783.99, t: 0.24, d: 0.12 },
      { f: 1046.5, t: 0.36, d: 0.26 },
      { f: 783.99, t: 0.64, d: 0.14 },
      { f: 1046.5, t: 0.80, d: 0.55 }
    ];
    const now = ctx.currentTime;
    melody.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.16, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.02);
    });
  }

  // Speech bubble / UI pop
  playPop() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.055);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  // Airy wind puff for "¡Sóplale!"
  playBlowSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.28);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(620, now);
    filter.frequency.exponentialRampToValueAtTime(1450, now + 0.14);
    filter.frequency.exponentialRampToValueAtTime(480, now + 0.27);
    filter.Q.setValueAtTime(2.6, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.28);
  }

  // Resonant wooden table bump for "👊 ¡Golpecito!"
  playTableTapSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [0, 0.085].forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 155 : 185, t);
      osc.frequency.exponentialRampToValueAtTime(46, t + 0.09);

      gain.gain.setValueAtTime(idx === 0 ? 0.22 : 0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.095);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // Fiery brass chime & rising fanfare for "🔥 ¡Sube la Apuesta!"
  playStakeEscalationSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.34);
    });
  }

  // Spoken announcer via SpeechSynthesis
  speakDicho(text, lang = 'es') {
    if (this.muted || !this.voiceEnabled || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'es' ? 'es-MX' : 'en-US';
      utter.rate = 1.04;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }
}

window.pirinolaAudio = new PirinolaAudio();
