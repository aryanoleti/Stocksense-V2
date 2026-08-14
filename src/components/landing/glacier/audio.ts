/* Procedural ambient audio — no audio files. Two detuned oscillators through
   a lowpass make a cold pad; short FM blips mark section waypoints. Created
   lazily on the user's first toggle so autoplay policies never fight us. */
export class LandingAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private padGain: GainNode | null = null;
  on = false;

  private ensure(): void {
    if (this.ctx) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const pad = ctx.createGain();
    pad.gain.value = 0.05;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    pad.connect(filter).connect(master);

    [55, 55.6, 110.4].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 2 ? "sine" : "triangle";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.35 : 0.6;
      osc.connect(g).connect(pad);
      osc.start();
    });

    // slow swell so the pad breathes
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    this.ctx = ctx;
    this.master = master;
    this.padGain = pad;
  }

  toggle(): boolean {
    this.ensure();
    if (!this.ctx || !this.master) return false;
    this.on = !this.on;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.master.gain.linearRampToValueAtTime(this.on ? 1 : 0, this.ctx.currentTime + 0.8);
    return this.on;
  }

  /* Soft glassy chime when the visitor crosses into a new section. */
  chime(pitch = 880): void {
    if (!this.on || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const g = this.ctx.createGain();
    mod.frequency.value = pitch * 2.01;
    modGain.gain.value = 60;
    mod.connect(modGain).connect(osc.frequency);
    osc.frequency.value = pitch;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    osc.connect(g).connect(this.master);
    osc.start(t);
    mod.start(t);
    osc.stop(t + 1.5);
    mod.stop(t + 1.5);
  }

  dispose(): void {
    void this.ctx?.close();
    this.ctx = null;
  }
}
