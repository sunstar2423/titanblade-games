// Procedural sound effects using the Web Audio API - no audio assets required
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterVolume = 0.5;
    }

    ensureContext() {
        if (!this.enabled) return false;
        if (!this.ctx) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            } catch (e) {
                this.enabled = false;
                return false;
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return true;
    }

    tone(freq, duration, type = 'square', volume = 0.15, freqEnd = null, delay = 0) {
        if (!this.ensureContext()) return;
        const t0 = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        if (freqEnd !== null) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + duration);
        }
        gain.gain.setValueAtTime(Math.max(0.001, volume * this.masterVolume), t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + duration + 0.05);
    }

    noise(duration, volume = 0.2, delay = 0) {
        if (!this.ensureContext()) return;
        const t0 = this.ctx.currentTime + delay;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 900;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(Math.max(0.001, volume * this.masterVolume), t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(t0);
    }

    swing() { this.tone(320, 0.12, 'triangle', 0.08, 90); }
    shoot() { this.tone(900, 0.08, 'square', 0.06, 220); }
    hit() { this.tone(160, 0.1, 'sawtooth', 0.1, 70); }
    playerHurt() { this.tone(110, 0.22, 'sawtooth', 0.16, 50); }
    coin() {
        this.tone(950, 0.07, 'sine', 0.08);
        this.tone(1400, 0.14, 'sine', 0.08, null, 0.07);
    }
    explosion() {
        this.noise(0.6, 0.5);
        this.tone(85, 0.5, 'sine', 0.3, 28);
    }
    reload() {
        this.tone(500, 0.05, 'square', 0.06);
        this.tone(700, 0.05, 'square', 0.06, null, 0.12);
    }
    waveStart() {
        this.tone(440, 0.14, 'square', 0.09);
        this.tone(554, 0.14, 'square', 0.09, null, 0.14);
        this.tone(659, 0.28, 'square', 0.09, null, 0.28);
    }
    unlock() {
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'square', 0.09, null, i * 0.09));
    }
    enemyDie() { this.tone(420, 0.28, 'sawtooth', 0.09, 60); }
    victory() {
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.11, null, i * 0.13));
    }
    defeat() {
        [400, 350, 300, 200].forEach((f, i) => this.tone(f, 0.3, 'sawtooth', 0.1, null, i * 0.25));
    }
}

window.Sound = new SoundManager();

// Browsers require a user gesture before audio can start
['click', 'keydown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => window.Sound.ensureContext(), { passive: true });
});
