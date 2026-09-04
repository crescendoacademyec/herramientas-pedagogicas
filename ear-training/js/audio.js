(function () {
  'use strict';

  const INSTRUMENTS = {
    piano:  { label:'Piano', sf:'acoustic_grand_piano' },
    rhodes: { label:'Rhodes', sf:'electric_piano_1' },
    guitar: { label:'Guitarra nylon', sf:'acoustic_guitar_nylon' },
    sine:   { label:'Seno puro', sf:null }
  };

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.instrumentId = 'piano';
      this.player = null;
      this.loadingPromise = null;
      this.volume = 0.78;
      this.activeNodes = new Set();
    }

    ensureContext() {
      if (!this.ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume;
        const limiter = this.ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-5, this.ctx.currentTime);
        limiter.knee.setValueAtTime(12, this.ctx.currentTime);
        limiter.ratio.setValueAtTime(8, this.ctx.currentTime);
        limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
        limiter.release.setValueAtTime(0.15, this.ctx.currentTime);
        this.master.connect(limiter);
        limiter.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    }

    setVolume(value) {
      this.volume = Math.max(0, Math.min(1, Number(value) || 0));
      if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.01);
    }

    async setInstrument(id) {
      this.instrumentId = INSTRUMENTS[id] ? id : 'piano';
      this.player = null;
      this.loadingPromise = null;
      // Carga perezosa: el SoundFont se solicita solo al reproducir, después de una interacción del usuario.
      return this.instrumentId;
    }

    async loadInstrument() {
      if (this.instrumentId === 'sine') return null;
      if (this.player) return this.player;
      if (this.loadingPromise) return this.loadingPromise;
      if (!window.Soundfont) return null;
      const ctx = this.ensureContext();
      const sfName = INSTRUMENTS[this.instrumentId].sf;
      this.loadingPromise = window.Soundfont.instrument(ctx, sfName, { destination: this.master })
        .then(player => {
          this.player = player;
          this.loadingPromise = null;
          return player;
        })
        .catch(err => {
          console.warn('SoundFont no disponible; se usará seno puro.', err);
          this.loadingPromise = null;
          this.player = null;
          return null;
        });
      return this.loadingPromise;
    }

    stopAll() {
      for (const node of [...this.activeNodes]) {
        try { node.stop(); } catch (_) {}
        this.activeNodes.delete(node);
      }
    }

    playSine(midi, when, duration, gainScale) {
      const ctx = this.ensureContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.3 * gainScale), when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(when);
      osc.stop(when + duration + 0.06);
      this.activeNodes.add(osc);
      osc.addEventListener('ended', () => this.activeNodes.delete(osc), { once:true });
    }

    async playNotes(notes, when, duration, gainScale = 1) {
      const ctx = this.ensureContext();
      if (this.instrumentId !== 'sine') await this.loadInstrument();
      if (this.player) {
        notes.forEach(midi => {
          try {
            const note = this.player.play(midi, when, { gain: Math.max(0.05, gainScale) });
            if (note) {
              this.activeNodes.add(note);
              try { note.stop(when + duration + 0.08); } catch (_) {}
              setTimeout(() => this.activeNodes.delete(note), Math.ceil((duration + 0.2) * 1000));
            }
          } catch (_) {
            this.playSine(midi, when, duration, gainScale);
          }
        });
      } else {
        notes.forEach(midi => this.playSine(midi, when, duration, gainScale));
      }
      return ctx;
    }

    async playSequence(sequence) {
      const ctx = this.ensureContext();
      const t0 = ctx.currentTime + 0.03;
      for (const step of sequence || []) {
        this.playNotes(step.notes || [], t0 + Number(step.start || 0), Number(step.dur || 1), Number(step.vel || 0.85));
      }
    }
  }

  window.ETAudio = { AudioEngine, INSTRUMENTS };
})();
