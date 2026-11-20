/**
 * useStepAmbient — WebAudio ambient soundscape per step kind.
 * No external assets. Soft sine-wave drones + gentle chime accents.
 * Auto-fades in/out, respects a user mute toggle in localStorage.
 */
import { useEffect, useRef, useState } from "react";
import type { StepKind } from "@/lib/session-shell/types";

type Palette = { drones: number[]; chime?: number[]; gain: number };

const PALETTES: Record<StepKind, Palette> = {
  "wisdom-read": { drones: [110, 165, 220], chime: [880, 1320], gain: 0.06 },
  breathwork:    { drones: [98, 147], gain: 0.09 },
  journal:       { drones: [130.8, 196], gain: 0.05 },
  "micro-act":   { drones: [174.6, 261.6], gain: 0.05 },
  reflection:    { drones: [123.5, 185, 246.9], gain: 0.05 },
  "guide-chat":  { drones: [146.8, 220], gain: 0.045 },
  practice:      { drones: [110, 220], gain: 0.07 },
  "temple-chat": { drones: [82.4, 164.8], gain: 0.05 },
  witness:       { drones: [65.4, 130.8], chime: [1760], gain: 0.055 },
  silent_sit:    { drones: [65.4, 98], gain: 0.04 },
  body_scan:     { drones: [110, 146.8, 220], gain: 0.05 },
  gratitude:     { drones: [196, 261.6], gain: 0.05 },
  loving_kindness:{ drones: [220, 330], gain: 0.05 },
  forgiveness:   { drones: [146.8, 184], gain: 0.05 },
  movement:      { drones: [174.6, 220], gain: 0.06 },
  walking:       { drones: [130.8, 196], gain: 0.05 },
  yoga_asana:    { drones: [82.4, 110, 164.8], gain: 0.05 },
  sound_bath:    { drones: [55, 110, 165, 220, 330], chime: [440, 660], gain: 0.06 },
  mantra:        { drones: [136.1, 272.2], gain: 0.05 },
  visualization: { drones: [98, 147, 196], gain: 0.05 },
  scripture:     { drones: [110, 165, 220], gain: 0.05 },
  affirmation:   { drones: [220, 330, 440], gain: 0.05 },
  contemplation:{ drones: [65.4, 98, 130.8], gain: 0.04 },
  noticing:      { drones: [146.8, 220], gain: 0.05 },
  stretching:    { drones: [174.6, 261.6], gain: 0.06 },
  tai_chi:       { drones: [82.4, 110, 164.8], gain: 0.05 },
  balance:       { drones: [130.8, 196], gain: 0.05 },
  "free_write":  { drones: [146.8, 220], gain: 0.05 },
  plan:          { drones: [110, 165], gain: 0.05 },
};

const MUTE_KEY = "session-shell:sound-muted";

export function isAmbientMuted() {
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
}
export function setAmbientMuted(v: boolean) {
  try { localStorage.setItem(MUTE_KEY, v ? "1" : "0"); } catch {}
  window.dispatchEvent(new CustomEvent("session-shell:mute-changed", { detail: v }));
}

export function useStepAmbient(kind: StepKind | null | undefined) {
  const [muted, setMuted] = useState<boolean>(() => isAmbientMuted());
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const masterRef = useRef<GainNode | null>(null);
  const chimeTimerRef = useRef<number | null>(null);

  // listen for external mute toggle
  useEffect(() => {
    const handler = (e: Event) => setMuted((e as CustomEvent).detail);
    window.addEventListener("session-shell:mute-changed", handler);
    return () => window.removeEventListener("session-shell:mute-changed", handler);
  }, []);

  useEffect(() => {
    if (!kind || muted) return;
    const palette = PALETTES[kind];
    if (!palette) return;

    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        const ctx: AudioContext = new Ctx();
        ctxRef.current = ctx;

        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
        masterRef.current = master;

        // Fade in
        master.gain.linearRampToValueAtTime(palette.gain, ctx.currentTime + 2.5);

        palette.drones.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.type = i % 2 === 0 ? "sine" : "triangle";
          osc.frequency.value = freq;

          const g = ctx.createGain();
          g.gain.value = 1 / palette.drones.length;

          // slow LFO on gain to breathe
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.05 + i * 0.03;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.15;
          lfo.connect(lfoGain).connect(g.gain);
          lfo.start();

          osc.connect(g).connect(master);
          osc.start();
          nodesRef.current.push({ osc, gain: g });
        });

        // Occasional chime
        if (palette.chime && palette.chime.length) {
          const playChime = () => {
            if (!ctxRef.current || !masterRef.current) return;
            const freq = palette.chime![Math.floor(Math.random() * palette.chime!.length)];
            const o = ctxRef.current.createOscillator();
            const g = ctxRef.current.createGain();
            o.type = "sine";
            o.frequency.value = freq;
            g.gain.value = 0;
            o.connect(g).connect(masterRef.current);
            const t = ctxRef.current.currentTime;
            g.gain.linearRampToValueAtTime(0.12, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
            o.start(t);
            o.stop(t + 3.6);
            chimeTimerRef.current = window.setTimeout(playChime, 12000 + Math.random() * 18000);
          };
          chimeTimerRef.current = window.setTimeout(playChime, 6000);
        }
      } catch { /* ignore audio init errors */ }
    };

    // browsers require a gesture; try immediately + on first interaction
    start();
    const kick = () => { if (!ctxRef.current) start(); };
    window.addEventListener("pointerdown", kick, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", kick);
      if (chimeTimerRef.current) window.clearTimeout(chimeTimerRef.current);
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) {
        try {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        } catch {}
        setTimeout(() => {
          nodesRef.current.forEach(({ osc }) => { try { osc.stop(); } catch {} });
          nodesRef.current = [];
          try { ctx.close(); } catch {}
          ctxRef.current = null;
          masterRef.current = null;
        }, 700);
      }
    };
  }, [kind, muted]);

  return { muted, toggleMuted: () => setAmbientMuted(!muted) };
}
