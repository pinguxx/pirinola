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

  // 20 Unique Algorithmic Spin Sound Profiles (Hardwoods, Talavera Ceramic, Folk Rattle Tops & Wind Whooshes)
  playSpinSound(durationMs = 2300, tier = 'fuerte') {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const PROFILES = [
      // 1-6: Maderas Tradicionales
      { name: 'Cedro Profundo', wave: 'sawtooth', fStart: 180, fEnd: 55, fCenter: 440, Q: 3.8, clackPitch: 520, clackType: 'triangle', clackRate: 0.72, thudPitch: 160, thudVol: 0.22 },
      { name: 'Pino Torneado', wave: 'sawtooth', fStart: 240, fEnd: 65, fCenter: 580, Q: 3.2, clackPitch: 680, clackType: 'triangle', clackRate: 0.68, thudPitch: 185, thudVol: 0.18 },
      { name: 'Parota Pesada', wave: 'triangle', fStart: 160, fEnd: 48, fCenter: 380, Q: 4.2, clackPitch: 460, clackType: 'sine', clackRate: 0.78, thudPitch: 140, thudVol: 0.26 },
      { name: 'Roble Hueco', wave: 'sawtooth', fStart: 210, fEnd: 60, fCenter: 510, Q: 4.5, clackPitch: 610, clackType: 'triangle', clackRate: 0.75, thudPitch: 175, thudVol: 0.20 },
      { name: 'Caoba Pulida', wave: 'sawtooth', fStart: 260, fEnd: 72, fCenter: 620, Q: 3.0, clackPitch: 740, clackType: 'triangle', clackRate: 0.65, thudPitch: 195, thudVol: 0.17 },
      { name: 'Nogal Clásico', wave: 'triangle', fStart: 195, fEnd: 58, fCenter: 480, Q: 3.6, clackPitch: 580, clackType: 'triangle', clackRate: 0.70, thudPitch: 170, thudVol: 0.21 },

      // 7-11: Cerámica y Barro Talavera
      { name: 'Talavera Vidriada', wave: 'sine', fStart: 380, fEnd: 110, fCenter: 880, Q: 5.5, clackPitch: 1120, clackType: 'sine', clackRate: 0.60, thudPitch: 260, thudVol: 0.15 },
      { name: 'Barro Poroso', wave: 'sawtooth', fStart: 200, fEnd: 62, fCenter: 420, Q: 2.8, clackPitch: 490, clackType: 'triangle', clackRate: 0.76, thudPitch: 155, thudVol: 0.23 },
      { name: 'Cerámica Cocida', wave: 'triangle', fStart: 320, fEnd: 95, fCenter: 740, Q: 4.8, clackPitch: 980, clackType: 'sine', clackRate: 0.64, thudPitch: 230, thudVol: 0.16 },
      { name: 'Vidrio Soplado', wave: 'sine', fStart: 420, fEnd: 130, fCenter: 960, Q: 6.2, clackPitch: 1280, clackType: 'sine', clackRate: 0.58, thudPitch: 290, thudVol: 0.14 },
      { name: 'Loza Poblana', wave: 'sawtooth', fStart: 290, fEnd: 88, fCenter: 680, Q: 4.0, clackPitch: 840, clackType: 'triangle', clackRate: 0.66, thudPitch: 215, thudVol: 0.18 },

      // 12-16: Cascabel y Juguete de Feria con Cuentas
      { name: 'Trompo Cascabel', wave: 'sawtooth', fStart: 270, fEnd: 80, fCenter: 780, Q: 3.5, clackPitch: 890, clackType: 'triangle', clackRate: 0.62, thudPitch: 190, thudVol: 0.19, rattle: true },
      { name: 'Semillas de Jícara', wave: 'triangle', fStart: 225, fEnd: 68, fCenter: 540, Q: 4.2, clackPitch: 720, clackType: 'triangle', clackRate: 0.70, thudPitch: 175, thudVol: 0.20, rattle: true },
      { name: 'Feria Chintete', wave: 'sawtooth', fStart: 310, fEnd: 92, fCenter: 820, Q: 3.2, clackPitch: 950, clackType: 'triangle', clackRate: 0.60, thudPitch: 205, thudVol: 0.17, rattle: true },
      { name: 'Balero Rítmico', wave: 'sawtooth', fStart: 235, fEnd: 70, fCenter: 560, Q: 3.8, clackPitch: 670, clackType: 'triangle', clackRate: 0.69, thudPitch: 180, thudVol: 0.21, rattle: true },
      { name: 'Matraca Suave', wave: 'sawtooth', fStart: 280, fEnd: 85, fCenter: 710, Q: 3.6, clackPitch: 820, clackType: 'triangle', clackRate: 0.63, thudPitch: 195, thudVol: 0.18, rattle: true },

      // 17-20: Bamboleo Rápido y Viento Asimétrico
      { name: 'Silbato de Viento', wave: 'sine', fStart: 350, fEnd: 105, fCenter: 850, Q: 4.6, clackPitch: 780, clackType: 'sine', clackRate: 0.67, thudPitch: 220, thudVol: 0.16, whoosh: true },
      { name: 'Bamboleo Excéntrico', wave: 'sawtooth', fStart: 205, fEnd: 56, fCenter: 490, Q: 4.4, clackPitch: 550, clackType: 'triangle', clackRate: 0.82, thudPitch: 165, thudVol: 0.24, whoosh: true },
      { name: 'Giro Furioso', wave: 'sawtooth', fStart: 340, fEnd: 98, fCenter: 900, Q: 3.4, clackPitch: 920, clackType: 'triangle', clackRate: 0.59, thudPitch: 210, thudVol: 0.19, whoosh: true },
      { name: 'Resonancia Viva', wave: 'triangle', fStart: 250, fEnd: 75, fCenter: 630, Q: 3.9, clackPitch: 760, clackType: 'triangle', clackRate: 0.71, thudPitch: 185, thudVol: 0.20, whoosh: true }
    ];

    // Pick 1 of 20 sound profiles randomly with tier speed adjustments
    const prof = PROFILES[Math.floor(Math.random() * PROFILES.length)];
    const speedMult = tier === 'turbo' ? 1.25 : tier === 'fuerte' ? 1.0 : 0.82;
    const microDetune = 1.0 + (Math.random() - 0.5) * 0.12;

    const now = ctx.currentTime;
    const durSec = Math.max(1.4, durationMs / 1000);

    // 1. Primary body gyroscopic whir with profile timbre
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const whirGain = ctx.createGain();

    osc.type = prof.wave;
    const startFreq = prof.fStart * speedMult * microDetune;
    const endFreq = prof.fEnd * microDetune;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + durSec * 0.93);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(prof.fCenter * microDetune, now);
    filter.Q.setValueAtTime(prof.Q, now);

    whirGain.gain.setValueAtTime(0.001, now);
    whirGain.gain.linearRampToValueAtTime(0.068, now + 0.1);
    whirGain.gain.exponentialRampToValueAtTime(0.001, now + durSec * 0.93);

    osc.connect(filter);
    filter.connect(whirGain);
    whirGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durSec);

    // 2. Extra subtle aerodynamic whoosh for wind & fast profiles
    if (prof.whoosh) {
      const whooshOsc = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whooshOsc.type = 'sine';
      whooshOsc.frequency.setValueAtTime(startFreq * 1.5, now);
      whooshOsc.frequency.exponentialRampToValueAtTime(80, now + durSec * 0.7);
      whooshGain.gain.setValueAtTime(0.001, now);
      whooshGain.gain.linearRampToValueAtTime(0.025, now + 0.08);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + durSec * 0.7);
      whooshOsc.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whooshOsc.start(now);
      whooshOsc.stop(now + durSec * 0.72);
    }

    // 3. Rhythmic edge clacks & decelerating wobble
    const baseCount = tier === 'turbo' ? 15 : tier === 'fuerte' ? 11 : 8;
    const clackCount = baseCount + Math.floor(Math.random() * 4);

    for (let i = 0; i < clackCount; i++) {
      const progress = i / clackCount;
      const tOffset = Math.pow(progress, prof.clackRate) * (durSec * 0.92);
      const clackTime = now + tOffset;

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = prof.clackType;
      const pitch = (prof.clackPitch * microDetune) - progress * (prof.clackPitch * 0.52);
      clickOsc.frequency.setValueAtTime(Math.max(120, pitch), clackTime);
      clickOsc.frequency.exponentialRampToValueAtTime(110, clackTime + 0.032);

      const vol = (0.025 + progress * 0.065) * (prof.rattle ? 1.25 : 1.0);
      clickGain.gain.setValueAtTime(vol, clackTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clackTime + 0.038);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(clackTime);
      clickOsc.stop(clackTime + 0.042);
    }

    // 4. Final face landing body knock
    const landTime = now + durSec * 0.94;
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(prof.thudPitch * microDetune, landTime);
    thudOsc.frequency.exponentialRampToValueAtTime(45, landTime + 0.11);

    thudGain.gain.setValueAtTime(prof.thudVol, landTime);
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
