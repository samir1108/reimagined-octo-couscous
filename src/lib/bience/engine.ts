/**
 * Bience engine - a procedural ambient synthesiser.
 *
 * Every sound is generated live: no audio files, no network, no licences.
 * Fourteen layers share one room (compressor, stereo reverb, limiter) and are
 * built lazily, so a mix only costs CPU for the layers you can actually hear.
 */

import {
  LAYERS,
  LAYER_IDS,
  SILENCE,
  clamp01,
  type BienceMix,
  type BienceWorld,
  type LayerId,
} from "./model";

type TunedOsc = { osc: OscillatorNode; ratio: number };

type Voice = {
  id: LayerId;
  out: GainNode;
  panner: StereoPannerNode;
  send: GainNode;
  level: number;
  stops: (() => void)[];
  tuned: TunedOsc[];
};

type WindowWithAudio = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export type EngineState = "idle" | "playing" | "suspended";

export type Spectrum = {
  level: number;
  bass: number;
  mid: number;
  treble: number;
};

function audioWindow(): WindowWithAudio | null {
  if (typeof window === "undefined") return null;
  return window as WindowWithAudio;
}

export function isAudioSupported(): boolean {
  const win = audioWindow();
  if (!win) return false;
  return Boolean(win.AudioContext || win.webkitAudioContext);
}

function makeAudioContext(): AudioContext | null {
  const win = audioWindow();
  if (!win) return null;
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor({ latencyHint: "playback" });
  } catch {
    try {
      return new Ctor();
    } catch {
      return null;
    }
  }
}

export class BienceEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private glue: DynamicsCompressorNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private bus: GainNode | null = null;
  private dry: GainNode | null = null;
  private wetSend: GainNode | null = null;
  private wetReturn: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private voices = new Map<LayerId, Voice>();
  private timers = new Set<number>();
  private noiseBuffer: AudioBuffer | null = null;
  private spectrumData: Uint8Array | null = null;
  private mix: BienceMix | null = null;
  private world: BienceWorld | null = null;
  private root = 110;
  private scaleRatios: readonly number[] = [1, 1.5, 2, 3];
  private reverbTarget = 0.5;
  private masterTarget = 0.8;
  private duckFactor = 1;
  private state: EngineState = "idle";

  onStateChange?: (state: EngineState) => void;

  getState(): EngineState {
    return this.state;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  isPlaying(): boolean {
    return this.state === "playing";
  }

  getLayerLevel(id: LayerId): number {
    return this.voices.get(id)?.level ?? 0;
  }

  async start(mix: BienceMix, world: BienceWorld): Promise<void> {
    if (this.state !== "playing") this.clearTimers();
    this.mix = mix;
    this.world = world;
    this.root = world.root;
    this.scaleRatios = world.scale;
    if (!this.ensureGraph()) {
      this.setState("suspended");
      return;
    }
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        this.setState("suspended");
        return;
      }
    }
    this.state = "playing";
    this.masterTarget = mix.master;
    this.reverbTarget = mix.reverb;
    this.setReverb(mix.reverb, 1.4);
    this.applyLevels(mix, true);
    this.fadeMasterTo(mix.master * this.duckFactor, 2.2);
    this.onStateChange?.("playing");
  }

  stop(fade = 1.2): void {
    if (!this.ctx || !this.master) {
      this.setState("idle");
      return;
    }
    this.fadeMasterTo(SILENCE, fade);
    this.clearTimers();
    const teardown = window.setTimeout(() => {
      this.timers.delete(teardown);
      this.releaseVoices();
      this.setState("idle");
    }, Math.round(fade * 1000) + 220);
    this.timers.add(teardown);
  }

  pause(): void {
    this.stop(0.9);
  }

  sync(mix: BienceMix, world: BienceWorld): void {
    this.mix = mix;
    this.world = world;
    const retune = this.root !== world.root;
    this.root = world.root;
    this.scaleRatios = world.scale;
    if (!this.ctx || this.state !== "playing") return;
    this.masterTarget = mix.master;
    this.fadeMasterTo(mix.master * this.duckFactor, 0.45);
    if (Math.abs(mix.reverb - this.reverbTarget) > 0.01) {
      this.reverbTarget = mix.reverb;
      this.setReverb(mix.reverb, 1.1);
    }
    this.applyLevels(mix, false, retune);
  }

  setMaster(value: number, seconds = 0.5): void {
    this.masterTarget = clamp01(value);
    this.fadeMasterTo(this.masterTarget * this.duckFactor, seconds);
  }

  duck(amount: number, seconds = 0.8): void {
    this.duckFactor = clamp01(amount);
    this.fadeMasterTo(this.masterTarget * this.duckFactor, seconds);
  }

  sleepFade(minutes: number): void {
    if (!this.ctx) return;
    this.fadeMasterTo(SILENCE, Math.max(1, minutes * 60));
  }

  getSpectrum(): Spectrum {
    const analyser = this.analyser;
    if (!analyser || !this.ctx) return { level: 0, bass: 0, mid: 0, treble: 0 };
    if (!this.spectrumData || this.spectrumData.length !== analyser.frequencyBinCount) {
      this.spectrumData = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(this.spectrumData);
    const data = this.spectrumData;
    const binCount = data.length;
    const nyquist = this.ctx.sampleRate / 2;
    const binHz = nyquist / binCount;
    const band = (lowHz: number, highHz: number) => {
      const from = Math.max(1, Math.floor(lowHz / binHz));
      const to = Math.min(binCount, Math.ceil(highHz / binHz));
      let sum = 0;
      let count = 0;
      for (let i = from; i < to; i += 1) {
        sum += data[i];
        count += 1;
      }
      return count > 0 ? sum / count / 255 : 0;
    };
    const bass = band(30, 250);
    const mid = band(250, 2000);
    const treble = band(2000, 12000);
    return {
      level: clamp01(bass * 1.1 + mid * 0.9 + treble * 0.6),
      bass,
      mid,
      treble,
    };
  }

  async resume(): Promise<void> {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
        this.fadeMasterTo(this.masterTarget * this.duckFactor, 1.2);
        this.setState("playing");
      } catch {
        this.setState("suspended");
      }
    }
  }

  dispose(): void {
    this.clearTimers();
    this.releaseVoices();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    this.glue = null;
    this.limiter = null;
    this.analyser = null;
    this.bus = null;
    this.dry = null;
    this.wetSend = null;
    this.wetReturn = null;
    this.convolver = null;
    this.noiseBuffer = null;
    this.spectrumData = null;
    this.mix = null;
    this.world = null;
    this.state = "idle";
    if (ctx) {
      void ctx.close().catch(() => undefined);
    }
    this.onStateChange?.("idle");
  }

  private setState(next: EngineState): void {
    if (this.state === next) return;
    this.state = next;
    this.onStateChange?.(next);
  }

  private ensureGraph(): boolean {
    if (this.ctx) return true;
    const ctx = makeAudioContext();
    if (!ctx) return false;

    const master = ctx.createGain();
    master.gain.value = SILENCE;

    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -20;
    glue.knee.value = 10;
    glue.ratio.value = 2.4;
    glue.attack.value = 0.08;
    glue.release.value = 0.36;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 3;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.18;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;

    const bus = ctx.createGain();
    bus.gain.value = 1;

    const dry = ctx.createGain();
    dry.gain.value = 0.9;

    const wetSend = ctx.createGain();
    wetSend.gain.value = 0.5;

    const preDelay = ctx.createDelay(0.12);
    preDelay.delayTime.value = 0.02;

    const convolver = ctx.createConvolver();
    convolver.buffer = this.buildImpulse(ctx, 4.4, 2.8);

    const wetReturn = ctx.createGain();
    wetReturn.gain.value = 0.5;

    bus.connect(dry).connect(master);
    bus.connect(wetSend).connect(preDelay).connect(convolver).connect(wetReturn).connect(master);
    master.connect(glue).connect(limiter).connect(analyser).connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.glue = glue;
    this.limiter = limiter;
    this.analyser = analyser;
    this.bus = bus;
    this.dry = dry;
    this.wetSend = wetSend;
    this.wetReturn = wetReturn;
    this.convolver = convolver;
    this.noiseBuffer = this.buildNoise(ctx, 4);
    return true;
  }

  private buildImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * seconds));
    const buffer = ctx.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let last = 0;
      let dark = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = last * 0.55 + white * 0.45;
        dark = dark * 0.93 + last * 0.07;
        const t = i / length;
        const tail = Math.pow(1 - t, decay);
        data[i] = (last * 0.62 + dark * 0.38) * tail;
      }
      const reflections = 9;
      for (let r = 0; r < reflections; r += 1) {
        const at = Math.floor((0.02 + Math.random() * 0.22) * rate);
        if (at < length) {
          data[at] += (Math.random() * 2 - 1) * 0.32 * (1 - r / reflections);
        }
      }
    }
    return buffer;
  }

  private buildNoise(ctx: AudioContext, seconds: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.35 + white * 0.65;
      data[i] = white * 0.7 + last * 0.3;
    }
    return buffer;
  }

  private setReverb(amount: number, seconds: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.wetSend || !this.wetReturn) return;
    const now = ctx.currentTime;
    const send = 0.28 + amount * 0.52;
    this.wetSend.gain.cancelScheduledValues(now);
    this.wetSend.gain.setValueAtTime(this.wetSend.gain.value, now);
    this.wetSend.gain.linearRampToValueAtTime(send, now + seconds);
    this.wetReturn.gain.cancelScheduledValues(now);
    this.wetReturn.gain.setValueAtTime(this.wetReturn.gain.value, now);
    this.wetReturn.gain.linearRampToValueAtTime(0.32 + amount * 0.28, now + seconds);
  }

  private fadeMasterTo(value: number, seconds: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(SILENCE, master.gain.value), now);
    master.gain.linearRampToValueAtTime(Math.max(SILENCE, clamp01(value)), now + Math.max(0.05, seconds));
  }

  private applyLevels(mix: BienceMix, immediate: boolean, retune = false): void {
    for (const id of LAYER_IDS) {
      const target = clamp01(mix.levels[id] ?? 0);
      const existing = this.voices.get(id);
      if (target > 0.004) {
        if (!existing) {
          this.buildVoice(id, target, immediate);
        } else {
          this.rampVoice(existing, target, immediate ? 0.25 : 1.1);
          if (retune) this.retuneVoice(existing);
        }
      } else if (existing) {
        this.rampVoice(existing, 0, immediate ? 0.15 : 1.4);
        const timer = window.setTimeout(() => {
          this.timers.delete(timer);
          this.releaseVoice(id);
        }, immediate ? 320 : 1800);
        this.timers.add(timer);
      }
    }
  }

  private rampVoice(voice: Voice, level: number, seconds: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const spec = LAYERS[voice.id];
    const target = Math.max(SILENCE, level * spec.trim);
    const now = ctx.currentTime;
    voice.level = level;
    voice.out.gain.cancelScheduledValues(now);
    voice.out.gain.setValueAtTime(Math.max(SILENCE, voice.out.gain.value), now);
    voice.out.gain.exponentialRampToValueAtTime(target, now + Math.max(0.06, seconds));
  }

  private releaseVoice(id: LayerId): void {
    const voice = this.voices.get(id);
    if (!voice || voice.level > 0.004) return;
    this.voices.delete(id);
    for (const stop of voice.stops) {
      try {
        stop();
      } catch {
        /* node already gone */
      }
    }
    try {
      voice.out.disconnect();
      voice.panner.disconnect();
      voice.send.disconnect();
    } catch {
      /* already disconnected */
    }
  }

  private releaseVoices(): void {
    for (const id of Array.from(this.voices.keys())) {
      const voice = this.voices.get(id);
      if (!voice) continue;
      this.voices.delete(id);
      for (const stop of voice.stops) {
        try {
          stop();
        } catch {
          /* ignore */
        }
      }
      try {
        voice.out.disconnect();
        voice.panner.disconnect();
        voice.send.disconnect();
      } catch {
        /* ignore */
      }
    }
  }

  private clearTimers(): void {
    for (const id of this.timers) window.clearTimeout(id);
    this.timers.clear();
  }

  private buildVoice(id: LayerId, level: number, immediate: boolean): void {
    const ctx = this.ctx;
    const bus = this.bus;
    if (!ctx || !bus) return;
    const out = ctx.createGain();
    out.gain.value = SILENCE;
    const panner = ctx.createStereoPanner();
    panner.pan.value = 0;
    const send = ctx.createGain();
    send.gain.value = id === "sub" ? 0.1 : 0.6;
    out.connect(panner);
    panner.connect(bus);
    panner.connect(send);
    if (this.convolver) send.connect(this.convolver);

    const voice: Voice = { id, out, panner, send, level: 0, stops: [], tuned: [] };
    this.voices.set(id, voice);

    const builder = this.builders[id];
    if (builder) builder.call(this, voice);
    this.rampVoice(voice, level, immediate ? 0.4 : 1.6);
  }

  private scale(voice: Voice): number {
    return Math.max(0.06, Math.min(1, voice.level));
  }

  private noise(opts: {
    type: BiquadFilterType;
    freq: number;
    q?: number;
    gain: number;
    pan?: number;
  }): { gain: GainNode; filter: BiquadFilterNode } | null {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuffer) return null;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.playbackRate.value = 0.92 + Math.random() * 0.16;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.type;
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q ?? 0.7;
    const gain = ctx.createGain();
    gain.gain.value = opts.gain;
    src.connect(filter).connect(gain);
    src.start(0, Math.random() * 3);
    const stopper = gain as GainNode & { __stop?: () => void };
    stopper.__stop = () => {
      try {
        src.stop();
      } catch {
        /* ignore */
      }
    };
    return { gain, filter };
  }

  private placeNoise(
    opts: {
      type: BiquadFilterType;
      freq: number;
      q?: number;
      gain: number;
      pan?: number;
    },
    voice: Voice,
  ): { gain: GainNode; filter: BiquadFilterNode } | null {
    const nodes = this.noise(opts);
    if (nodes) this.place(nodes.gain, voice);
    return nodes;
  }

  private place(node: GainNode | null, voice: Voice, filter?: BiquadFilterNode): void {
    if (!node) return;
    node.connect(voice.out);
    const stopper = node as GainNode & { __stop?: () => void };
    voice.stops.push(() => stopper.__stop?.());
    if (filter) {
      voice.stops.push(() => {
        try {
          filter.disconnect();
        } catch {
          /* ignore */
        }
      });
    }
  }

  private lfo(freq: number, depth: number, target: AudioParam, voice: Voice, phase = 0): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = depth;
    osc.connect(gain).connect(target);
    osc.start(ctx.currentTime + phase);
    voice.stops.push(() => {
      try {
        osc.stop();
      } catch {
        /* ignore */
      }
    });
  }

  private schedule(minMs: number, maxMs: number, fn: () => void): void {
    const tick = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      const timer = window.setTimeout(() => {
        this.timers.delete(timer);
        if (this.state === "playing") fn();
        tick();
      }, delay);
      this.timers.add(timer);
    };
    tick();
  }

  private tone(
    freq: number,
    opts: {
      type?: OscillatorType;
      dur?: number;
      gain?: number;
      attack?: number;
      glide?: number;
      pan?: number;
      filter?: number;
    } = {},
    voice?: Voice,
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const dest = voice?.out ?? this.bus;
    if (!dest) return;
    const t0 = ctx.currentTime + 0.01;
    const dur = opts.dur ?? 0.8;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * opts.glide), t0 + dur * 0.8);
    const peak = Math.max(0.0001, (opts.gain ?? 0.05) * (voice ? this.scale(voice) : 1));
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + (opts.attack ?? 0.006));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (opts.filter) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = opts.filter;
      osc.connect(filter).connect(gain);
    } else {
      osc.connect(gain);
    }
    if (opts.pan != null) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, opts.pan));
      gain.connect(panner).connect(dest);
    } else {
      gain.connect(dest);
    }
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private bell(freq: number, dur = 5, gain = 0.12, partials: number[] = [1, 2, 3, 4.2], voice?: Voice): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const dest = voice?.out ?? this.bus;
    if (!dest) return;
    const scale = voice ? this.scale(voice) : 1;
    const t0 = ctx.currentTime + 0.01;
    partials.forEach((partial, index) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * partial;
      const peak = Math.max(0.0001, gain * scale * Math.pow(0.58, index));
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(peak, t0 + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * (1 - index * 0.08));
      osc.connect(env).connect(dest);
      osc.start(t0);
      osc.stop(t0 + dur + 0.1);
    });
  }

  private boom(freq = 48, dur = 5, gain = 0.2, voice?: Voice): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const dest = voice?.out ?? this.bus;
    if (!dest || !this.noiseBuffer) return;
    const t0 = ctx.currentTime + 0.01;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.5;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 4, t0);
    filter.frequency.exponentialRampToValueAtTime(freq, t0 + dur * 0.5);
    filter.Q.value = 1.4;
    const env = ctx.createGain();
    const peak = Math.max(0.0001, gain * (voice ? this.scale(voice) : 1));
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.12);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(env).connect(dest);
    src.start(t0);
    src.stop(t0 + dur + 0.1);
  }

  private tick(
    opts: { freq: number; q?: number; gain?: number; dur?: number; type?: BiquadFilterType; pan?: number },
    voice: Voice,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuffer) return;
    const t0 = ctx.currentTime + 0.01;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.95 + Math.random() * 0.2;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.type ?? "bandpass";
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q ?? 9;
    const env = ctx.createGain();
    const dur = opts.dur ?? 0.07;
    const peak = Math.max(0.0001, (opts.gain ?? 0.06) * this.scale(voice));
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const panner = ctx.createStereoPanner();
    panner.pan.value = opts.pan ?? Math.random() * 1.4 - 0.7;
    src.connect(filter).connect(env).connect(panner).connect(voice.out);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  private drone(freq: number, gain: number, type: OscillatorType, detune: number, voice: Voice, ratio: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.5;
    filter.connect(voice.out);
    for (const offset of [-detune, detune]) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = offset;
      env.gain.value = gain;
      osc.connect(env).connect(filter);
      osc.start();
      voice.tuned.push({ osc, ratio });
      voice.stops.push(() => {
        try {
          osc.stop();
        } catch {
          /* ignore */
        }
      });
    }
    voice.stops.push(() => {
      try {
        filter.disconnect();
      } catch {
        /* ignore */
      }
    });
  }

  private retuneVoice(voice: Voice): void {
    const ctx = this.ctx;
    if (!ctx || voice.tuned.length === 0) return;
    const now = ctx.currentTime;
    for (const { osc, ratio } of voice.tuned) {
      const next = Math.max(20, this.root * ratio);
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setValueAtTime(osc.frequency.value, now);
      osc.frequency.exponentialRampToValueAtTime(next, now + 2.6);
    }
  }

  private pickScale(octave = 1): number {
    const scale = this.scaleRatios.length > 0 ? this.scaleRatios : [1, 1.5, 2];
    const ratio = scale[Math.floor(Math.random() * scale.length)];
    return ratio * octave;
  }

  private pluck(freq: number, dur = 3.6, gain = 0.075, voice?: Voice): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const dest = voice?.out ?? this.bus;
    if (!dest) return;
    const t0 = ctx.currentTime + 0.006;
    const amount = Math.max(0.0001, gain * (voice ? this.scale(voice) : 1));

    const body = ctx.createBiquadFilter();
    body.type = "lowpass";
    body.Q.value = 0.9;
    body.frequency.setValueAtTime(Math.min(6800, freq * 24), t0);
    body.frequency.exponentialRampToValueAtTime(Math.max(320, freq * 3), t0 + dur * 0.85);
    body.connect(dest);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(amount, t0 + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    env.connect(body);

    const partials: { ratio: number; amp: number; type: OscillatorType; detune: number }[] = [
      { ratio: 1, amp: 0.52, type: "triangle", detune: -4 },
      { ratio: 1.001, amp: 0.2, type: "sine", detune: 5 },
      { ratio: 2, amp: 0.2, type: "sine", detune: 2 },
      { ratio: 3, amp: 0.1, type: "sine", detune: -6 },
      { ratio: 4.01, amp: 0.05, type: "sine", detune: 3 },
    ];
    for (const partial of partials) {
      const osc = ctx.createOscillator();
      const trim = ctx.createGain();
      osc.type = partial.type;
      osc.frequency.value = freq * partial.ratio;
      osc.detune.value = partial.detune;
      trim.gain.value = partial.amp;
      osc.connect(trim).connect(env);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    }

    if (this.noiseBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const pick = ctx.createBiquadFilter();
      pick.type = "bandpass";
      pick.frequency.value = Math.min(6000, freq * 3);
      pick.Q.value = 1.2;
      const pickEnv = ctx.createGain();
      pickEnv.gain.setValueAtTime(amount * 0.5, t0);
      pickEnv.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
      src.connect(pick).connect(pickEnv).connect(body);
      src.start(t0);
      src.stop(t0 + 0.07);
    }
  }

  private builders: Record<LayerId, (voice: Voice) => void> = {
    rain: (voice) => {
      const body = this.placeNoise({ type: "lowpass", freq: 680, gain: 0.15 }, voice);
      const sheet = this.placeNoise({ type: "bandpass", freq: 1900, q: 0.45, gain: 0.075 }, voice);
      this.placeNoise({ type: "highpass", freq: 5200, gain: 0.022 }, voice);
      if (body) this.lfo(0.021, 0.03, body.gain.gain, voice, 0.7);
      if (sheet) this.lfo(0.013, 0.02, sheet.gain.gain, voice, 2.1);
      this.schedule(320, 1400, () => {
        if (Math.random() < 0.62) {
          this.tick(
            {
              freq: 1400 + Math.random() * 3600,
              q: 5 + Math.random() * 6,
              gain: 0.018 + Math.random() * 0.022,
              dur: 0.03 + Math.random() * 0.05,
            },
            voice,
          );
        }
      });
      this.schedule(2400, 9000, () => {
        if (Math.random() < 0.35) this.boom(160 + Math.random() * 80, 0.6, 0.03, voice);
      });
    },
    storm: (voice) => {
      const rumble = this.placeNoise({ type: "lowpass", freq: 92, gain: 0.24 }, voice);
      this.placeNoise({ type: "bandpass", freq: 560, q: 0.35, gain: 0.05 }, voice);
      if (rumble) this.lfo(0.047, 0.11, rumble.gain.gain, voice);
      this.schedule(9000, 22000, () => {
        if (Math.random() > 0.22) {
          this.tick({ freq: 1500, q: 0.7, gain: 0.11, dur: 0.28, type: "highpass" }, voice);
          const roll = window.setTimeout(() => {
            this.timers.delete(roll);
            this.boom(34 + Math.random() * 24, 7 + Math.random() * 3, 0.3, voice);
          }, 340 + Math.random() * 500);
          this.timers.add(roll);
          const second = window.setTimeout(() => {
            this.timers.delete(second);
            if (Math.random() < 0.6) this.boom(46 + Math.random() * 20, 5, 0.16, voice);
          }, 1600 + Math.random() * 2200);
          this.timers.add(second);
        }
      });
    },
    wind: (voice) => {
      const air = this.placeNoise({ type: "bandpass", freq: 390, q: 0.8, gain: 0.12 }, voice);
      const gust = this.placeNoise({ type: "bandpass", freq: 1150, q: 1.6, gain: 0.03 }, voice);
      const whistle = this.placeNoise({ type: "bandpass", freq: 2100, q: 16, gain: 0.012 }, voice);
      if (air) {
        this.lfo(0.041, 220, air.filter.frequency, voice);
        this.lfo(0.057, 0.045, air.gain.gain, voice, 1.2);
      }
      if (gust) this.lfo(0.029, 480, gust.filter.frequency, voice, 0.4);
      if (whistle) this.lfo(0.017, 620, whistle.filter.frequency, voice, 2.2);
      this.lfo(0.033, 0.5, voice.panner.pan, voice, 0.9);
    },
    fire: (voice) => {
      this.placeNoise({ type: "lowpass", freq: 320, gain: 0.15 }, voice);
      this.placeNoise({ type: "highpass", freq: 2200, gain: 0.03 }, voice);
      this.schedule(60, 240, () => {
        if (Math.random() < 0.7) {
          this.tick(
            {
              freq: 650 + Math.random() * 3200,
              q: 2.5,
              gain: 0.02 + Math.random() * 0.045,
              dur: 0.03 + Math.random() * 0.04,
            },
            voice,
          );
        }
      });
      this.schedule(4200, 11000, () => {
        if (Math.random() < 0.55) {
          this.boom(90 + Math.random() * 50, 1.2, 0.05, voice);
          this.tick({ freq: 900, q: 0.8, gain: 0.05, dur: 0.4, type: "highpass" }, voice);
        }
      });
    },
    stream: (voice) => {
      const flow = this.placeNoise({ type: "bandpass", freq: 1250, q: 0.7, gain: 0.12 }, voice);
      this.placeNoise({ type: "lowpass", freq: 430, gain: 0.06 }, voice);
      this.placeNoise({ type: "highpass", freq: 3600, gain: 0.012 }, voice);
      if (flow) this.lfo(0.09, 260, flow.filter.frequency, voice);
      this.schedule(360, 1200, () => {
        if (Math.random() < 0.55) {
          this.tone(900 + Math.random() * 1600, {
            type: "sine",
            dur: 0.1 + Math.random() * 0.12,
            gain: 0.014,
            glide: 1.6 + Math.random() * 0.5,
            pan: Math.random() * 1.7 - 0.85,
          }, voice);
        }
      });
    },
    ocean: (voice) => {
      const surge = this.placeNoise({ type: "lowpass", freq: 460, gain: 0.12 }, voice);
      const deep = this.placeNoise({ type: "lowpass", freq: 165, gain: 0.09 }, voice);
      const foam = this.placeNoise({ type: "highpass", freq: 2400, gain: 0.03 }, voice);
      if (surge) {
        this.lfo(0.062, 0.1, surge.gain.gain, voice);
        this.lfo(0.031, 170, surge.filter.frequency, voice, 0.6);
      }
      if (deep) this.lfo(0.043, 0.07, deep.gain.gain, voice, 2.4);
      if (foam) this.lfo(0.062, 0.02, foam.gain.gain, voice, 1.1);
    },
    birds: (voice) => {
      this.schedule(1300, 4200, () => {
        if (Math.random() < 0.72) {
          const base = 1700 + Math.random() * 1700;
          const notes = 2 + Math.floor(Math.random() * 4);
          const pan = Math.random() * 1.7 - 0.85;
          const up = Math.random() > 0.4;
          const far = Math.random() < 0.3;
          for (let n = 0; n < notes; n += 1) {
            const timer = window.setTimeout(() => {
              this.timers.delete(timer);
              this.tone(base * (1 + n * (up ? 0.11 : -0.07)), {
                dur: 0.09 + Math.random() * 0.09,
                gain: far ? 0.014 : 0.032,
                glide: up ? 1.28 : 0.82,
                pan,
                type: "sine",
              }, voice);
            }, n * (85 + Math.random() * 90));
            this.timers.add(timer);
          }
        }
      });
    },
    crickets: (voice) => {
      const players = [
        { freq: 3900, pan: -0.6, rate: 0.9 },
        { freq: 4600, pan: 0.55, rate: 1.15 },
        { freq: 3400, pan: 0.1, rate: 0.7 },
      ];
      this.schedule(200, 720, () => {
        if (Math.random() > 0.45) {
          const player = players[Math.floor(Math.random() * players.length)];
          const pulses = 3 + Math.floor(Math.random() * 4);
          for (let p = 0; p < pulses; p += 1) {
            const timer = window.setTimeout(() => {
              this.timers.delete(timer);
              this.tick(
                {
                  freq: player.freq + Math.random() * 400,
                  q: 24,
                  gain: 0.012 + Math.random() * 0.028,
                  dur: 0.022 + Math.random() * 0.01,
                  pan: player.pan,
                },
                voice,
              );
            }, p * (38 / player.rate));
            this.timers.add(timer);
          }
        }
      });
    },
    crowd: (voice) => {
      const murmur = this.placeNoise({ type: "bandpass", freq: 480, q: 1.1, gain: 0.085 }, voice);
      const voices = this.placeNoise({ type: "bandpass", freq: 1150, q: 2.2, gain: 0.03 }, voice);
      if (murmur) {
        this.lfo(0.029, 160, murmur.filter.frequency, voice);
        this.lfo(0.019, 0.026, murmur.gain.gain, voice, 0.4);
      }
      if (voices) this.lfo(0.043, 340, voices.filter.frequency, voice, 1.4);
      this.schedule(800, 2400, () => {
        if (Math.random() < 0.45) {
          this.tone(230 + Math.random() * 200, {
            type: "triangle",
            dur: 0.32 + Math.random() * 0.2,
            gain: 0.009,
            pan: Math.random() * 1.7 - 0.85,
            filter: 820,
          }, voice);
        }
      });
    },
    tanpura: (voice) => {
      this.drone(this.root, 0.04, "triangle", 4.5, voice, 1);
      this.drone(this.root * 1.5, 0.017, "triangle", 3.5, voice, 1.5);
      const cycle = [1, 1.5, 1, 1, 2];
      let step = 0;
      this.schedule(1180, 1380, () => {
        this.pluck(this.root * cycle[step % cycle.length], 4.2, 0.085, voice);
        step += 1;
      });
    },
    bowls: (voice) => {
      this.drone(this.root, 0.012, "sine", 2, voice, 1);
      this.bell(this.root * 2, 10, 0.13, [1, 2.76, 5.4, 8.93], voice);
      this.schedule(15000, 30000, () => {
        if (Math.random() > 0.15) {
          this.bell(this.root * 2 * this.pickScale(), 11, 0.14, [1, 2.76, 5.4, 8.93], voice);
        }
      });
    },
    choir: (voice) => {
      const ctx = this.ctx;
      if (!ctx) return;
      const formant = ctx.createBiquadFilter();
      formant.type = "bandpass";
      formant.frequency.value = 720;
      formant.Q.value = 2.6;
      formant.connect(voice.out);
      this.lfo(0.061, 240, formant.frequency, voice);
      const ratios = [1, 1.5, 2];
      ratios.forEach((ratio, index) => {
        for (const offset of [-7, 7]) {
          const osc = ctx.createOscillator();
          const trim = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.value = this.root * ratio;
          osc.detune.value = offset + index * 2;
          trim.gain.value = 0.006 / (index + 1);
          osc.connect(trim);
          trim.connect(formant);
          trim.connect(voice.out);
          osc.start();
          voice.tuned.push({ osc, ratio });
          voice.stops.push(() => {
            try {
              osc.stop();
            } catch {
              /* ignore */
            }
          });
        }
      });
      this.lfo(0.018, 0.012, voice.out.gain, voice, 0.5);
    },
    sub: (voice) => {
      this.drone(this.root / 2, 0.15, "sine", 1.2, voice, 0.5);
      this.drone(this.root, 0.045, "sine", 2.4, voice, 1);
      this.lfo(0.048, 0.015, voice.out.gain, voice, 0.8);
    },
    shimmer: (voice) => {
      const air = this.placeNoise({ type: "highpass", freq: 7200, gain: 0.013 }, voice);
      if (air) this.lfo(0.023, 0.01, air.gain.gain, voice, 1.6);
      this.schedule(3800, 8600, () => {
        this.bell(this.root * 4 * this.pickScale(), 7, 0.042, [1, 2, 3, 4.7], voice);
      });
    },
  };
}


let singleton: BienceEngine | null = null;

export function getBienceEngine(): BienceEngine {
  if (!singleton) singleton = new BienceEngine();
  return singleton;
}
