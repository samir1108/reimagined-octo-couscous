// SoundDesign — composed ambient beds + UI chimes built with WebAudio.
// Each bed is a layered drone (sub + air + slow filter sweep) — feels musical,
// not like a raw oscillator. Used as background under games during 'play' phase.
//
// Beds: temple, forest, void, heartbeat, river, storm, fire, cave, bell, water, drone, paper.
// Chimes: bell, drop, rise, gong.
//
// Usage:
//   const sd = useSoundDesign();
//   useEffect(() => { sd.bed("temple", 0.4); return () => sd.stopBed(); }, []);
//   sd.chime("bell");

import { useCallback, useEffect, useRef } from "react";

type Bed =
  | "temple"
  | "forest"
  | "void"
  | "heartbeat"
  | "river"
  | "storm"
  | "fire"
  | "cave"
  | "bell"
  | "water"
  | "drone"
  | "paper";
type Chime = "bell" | "drop" | "rise" | "gong";

export function useSoundDesign() {
  const ctxRef = useRef<AudioContext | null>(null);
  const bedNodesRef = useRef<AudioNode[]>([]);
  const bedGainRef = useRef<GainNode | null>(null);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current?.state === "suspended") ctxRef.current.resume().catch(() => {});
    return ctxRef.current!;
  }, []);

  const stopBed = useCallback(() => {
    const ctx = ctxRef.current;
    bedNodesRef.current.forEach((n) => {
      try {
        if ((n as AudioScheduledSourceNode).stop) (n as AudioScheduledSourceNode).stop();
        n.disconnect();
      } catch {}
    });
    bedNodesRef.current = [];
    if (bedGainRef.current && ctx) {
      try {
        bedGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
        bedGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch {}
    }
  }, []);

  const noiseBuffer = useCallback((ctx: AudioContext, seconds: number, color: "pink" | "white" = "pink") => {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (color === "pink") {
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.96300 * b1 + w * 0.2965164;
        b2 = 0.57000 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
      } else {
        d[i] = w * 0.5;
      }
    }
    return buf;
  }, []);

  const bed = useCallback(
    (kind: Bed, volume = 0.4) => {
      const ctx = ensureCtx();
      stopBed();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);
      master.connect(ctx.destination);
      bedGainRef.current = master;
      const nodes: AudioNode[] = [master];

      const addDrone = (freq: number, type: OscillatorType, gain: number, detune = 0) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.value = gain;
        // Slow LFO on gain for breathing motion
        const lfo = ctx.createOscillator();
        const lfoG = ctx.createGain();
        lfo.frequency.value = 0.07 + Math.random() * 0.05;
        lfoG.gain.value = gain * 0.4;
        lfo.connect(lfoG).connect(g.gain);
        osc.connect(g).connect(master);
        osc.start();
        lfo.start();
        nodes.push(osc, lfo, g, lfoG);
      };

      const addNoise = (color: "pink" | "white", gain: number, filterFreq?: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer(ctx, 4, color);
        src.loop = true;
        const g = ctx.createGain();
        g.gain.value = gain;
        if (filterFreq) {
          const f = ctx.createBiquadFilter();
          f.type = "bandpass";
          f.frequency.value = filterFreq;
          f.Q.value = 0.8;
          src.connect(f).connect(g).connect(master);
          nodes.push(f);
        } else {
          src.connect(g).connect(master);
        }
        src.start();
        nodes.push(src, g);
      };

      switch (kind) {
        case "temple":
          addDrone(110, "sine", 0.45);            // sub
          addDrone(165, "sine", 0.18, 5);         // fifth
          addDrone(220, "triangle", 0.10, -7);    // octave shimmer
          addNoise("pink", 0.04, 800);            // air
          break;
        case "forest":
          addNoise("pink", 0.18, 1200);
          addNoise("pink", 0.08, 4000);
          addDrone(80, "sine", 0.15);
          break;
        case "void":
          addDrone(55, "sine", 0.5);
          addDrone(82, "sine", 0.10, 12);
          break;
        case "heartbeat": {
          addDrone(50, "sine", 0.35);
          // Heartbeat pulse via gain LFO using AudioBufferSource thump
          const pulse = ctx.createOscillator();
          const pg = ctx.createGain();
          pulse.frequency.value = 60;
          pg.gain.value = 0;
          pulse.connect(pg).connect(master);
          pulse.start();
          nodes.push(pulse, pg);
          const beat = () => {
            const t = ctx.currentTime;
            pg.gain.cancelScheduledValues(t);
            pg.gain.setValueAtTime(0, t);
            pg.gain.linearRampToValueAtTime(0.6, t + 0.04);
            pg.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            pg.gain.setValueAtTime(0, t + 0.35);
            pg.gain.linearRampToValueAtTime(0.4, t + 0.42);
            pg.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          };
          beat();
          const id = setInterval(beat, 1100);
          nodes.push({ disconnect: () => clearInterval(id) } as any);
          break;
        }
        case "river":
          addNoise("white", 0.22, 2400);
          addNoise("pink", 0.10, 600);
          break;
        case "storm":
          addNoise("white", 0.35, 6000);
          addNoise("pink", 0.20, 200);
          addDrone(40, "sine", 0.4);
          break;
        case "fire":
          addNoise("white", 0.10, 3000);
          addNoise("pink", 0.16, 700);
          addDrone(70, "sine", 0.18);
          break;
        case "cave":
          addDrone(45, "sine", 0.40);
          addDrone(90, "sine", 0.08, 8);
          addNoise("pink", 0.05, 300);
          break;
        case "bell":
          addDrone(660, "sine", 0.08);
          addDrone(990, "sine", 0.04, 3);
          addDrone(1320, "sine", 0.02, -5);
          addNoise("pink", 0.02, 2000);
          break;
        case "water":
          addNoise("white", 0.14, 1800);
          addNoise("pink", 0.08, 500);
          break;
        case "drone":
          addDrone(110, "sine", 0.35);
          addDrone(165, "triangle", 0.08, 6);
          break;
        case "paper":
          addNoise("white", 0.06, 5000);
          addNoise("pink", 0.04, 2500);
          break;
      }
      bedNodesRef.current = nodes;
    },
    [ensureCtx, noiseBuffer, stopBed]
  );

  const chime = useCallback(
    (kind: Chime = "bell", volume = 0.5) => {
      const ctx = ensureCtx();
      const t0 = ctx.currentTime;
      const partials: { freq: number; gain: number; decay: number }[] =
        kind === "bell"
          ? [{ freq: 880, gain: 0.6, decay: 1.8 }, { freq: 1320, gain: 0.3, decay: 1.4 }, { freq: 1760, gain: 0.18, decay: 1.0 }]
          : kind === "gong"
          ? [{ freq: 110, gain: 0.7, decay: 4.0 }, { freq: 220, gain: 0.4, decay: 3.0 }, { freq: 165, gain: 0.3, decay: 3.5 }, { freq: 330, gain: 0.15, decay: 2.0 }]
          : kind === "drop"
          ? [{ freq: 320, gain: 0.5, decay: 0.9 }, { freq: 160, gain: 0.4, decay: 1.2 }]
          : [{ freq: 523, gain: 0.4, decay: 0.6 }, { freq: 784, gain: 0.3, decay: 0.5 }];

      partials.forEach(({ freq, gain, decay }) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        if (kind === "drop") osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t0 + decay * 0.8);
        if (kind === "rise") osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t0 + decay * 0.8);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(gain * volume, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
        osc.connect(g).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + decay + 0.05);
      });
    },
    [ensureCtx]
  );

  useEffect(() => {
    return () => {
      stopBed();
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [stopBed]);

  return { bed, stopBed, chime };
}
