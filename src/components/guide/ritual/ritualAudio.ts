/**
 * Ambient ritual audio using the Web Audio API.
 * - Soft bells on act transitions / practice start / blessing
 * - Low drone during teaching (optional, fade in/out)
 * Falls back silently if AudioContext is unavailable.
 */

let ctx: AudioContext | null = null;
let droneNode: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode } | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const Ctor: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

export type BellKind = "transition" | "start" | "end" | "close";

export function playRitualBell(kind: BellKind = "transition") {
  const c = getCtx();
  if (!c) return;
  try {
    if (c.state === "suspended") void c.resume();
    const now = c.currentTime;
    const baseFreq =
      kind === "start" ? 528 :
      kind === "end" ? 396 :
      kind === "close" ? 432 :
      660;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = baseFreq;

    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 2.7);

    // shimmer overtone
    const osc2 = c.createOscillator();
    const gain2 = c.createGain();
    osc2.type = "sine";
    osc2.frequency.value = baseFreq * 2;
    gain2.gain.value = 0;
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    osc2.connect(gain2).connect(c.destination);
    osc2.start(now);
    osc2.stop(now + 2.1);
  } catch {
    /* noop */
  }
}

export function startRitualDrone() {
  const c = getCtx();
  if (!c || droneNode) return;
  try {
    if (c.state === "suspended") void c.resume();
    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.value = 110; // low om-like drone
    filter.type = "lowpass";
    filter.frequency.value = 400;
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.04, c.currentTime + 2.5);
    osc.connect(filter).connect(gain).connect(c.destination);
    osc.start();
    droneNode = { osc, gain, filter };
  } catch {
    /* noop */
  }
}

export function stopRitualDrone() {
  const c = getCtx();
  if (!c || !droneNode) return;
  try {
    const { osc, gain } = droneNode;
    gain.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
    setTimeout(() => {
      try { osc.stop(); } catch { /* noop */ }
    }, 1700);
    droneNode = null;
  } catch {
    droneNode = null;
  }
}
