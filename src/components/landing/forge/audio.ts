/* Ambient bed, synthesised in WebAudio. A looping track would be another
   asset to download and another licence to honour; two detuned oscillators
   through a slow filter sweep give the same cold room tone for nothing.

   Nothing is created until the visitor turns sound on — browsers block audio
   before a gesture anyway, and this keeps the idle page silent and cheap. */
export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private on = false;

  private build(): void {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.6;
    filter.connect(master);
    master.connect(ctx.destination);

    // a low drone plus a fifth, detuned slightly so they beat against each other
    [55, 82.5, 110].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 2 ? "triangle" : "sine";
      osc.frequency.value = freq;
      osc.detune.value = i * 6 - 6;
      gain.gain.value = i === 2 ? 0.12 : 0.3;
      osc.connect(gain).connect(filter);
      osc.start();
      this.nodes.push(osc);
    });

    // slow sweep keeps the pad from sitting still
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    this.lfo = lfo;

    this.ctx = ctx;
    this.master = master;
  }

  toggle(): boolean {
    if (!this.ctx) this.build();
    if (!this.ctx || !this.master) return false;
    void this.ctx.resume();
    this.on = !this.on;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(this.on ? 0.055 : 0, now + 0.6);
    return this.on;
  }

  /* Short percussive tick used when a card changes or a shard shatters. */
  cue(freq: number, dur = 0.5): void {
    if (!this.on || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  dispose(): void {
    this.nodes.forEach((n) => {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
    });
    try {
      this.lfo?.stop();
    } catch {
      /* already stopped */
    }
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.nodes = [];
  }
}
