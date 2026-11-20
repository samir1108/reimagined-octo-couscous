import { useCallback, useRef, useState, useEffect } from "react";

type SoundType = "tap" | "success" | "toggle" | "notification" | "navigate" | "error";

const STORAGE_KEY = "hope-app-sound-enabled";

// Shared audio context per hook instance, with master bus
function createMaster(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);
  return master;
}

function makeVoice(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  peakGain: number,
  attack = 0.005,
  detune = 0,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  osc.detune.setValueAtTime(detune, startTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), startTime);
  filter.Q.setValueAtTime(0.7, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
  return gain;
}

const PLAYERS: Record<SoundType, (ctx: AudioContext, dest: AudioNode) => void> = {
  tap(ctx, dest) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.08);
    filter.type = "lowpass";
    filter.frequency.value = 3500;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.12);
  },
  success(ctx, dest) {
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const start = t + i * 0.08;
      makeVoice(ctx, freq, "sine", start, 0.6, 0.14, 0.008).connect(dest);
      makeVoice(ctx, freq * 2, "sine", start, 0.4, 0.04, 0.01).connect(dest);
      makeVoice(ctx, freq * 0.5, "triangle", start, 0.5, 0.05, 0.01).connect(dest);
    });
  },
  toggle(ctx, dest) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(660, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.15);
    filter.type = "lowpass";
    filter.frequency.value = 2500;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.2);
  },
  notification(ctx, dest) {
    const t = ctx.currentTime;
    const fundamentals = [880, 1318.5];
    fundamentals.forEach((freq, i) => {
      const start = t + i * 0.06;
      makeVoice(ctx, freq, "sine", start, 0.7, 0.12, 0.006).connect(dest);
      makeVoice(ctx, freq * 2.76, "sine", start, 0.5, 0.025, 0.008).connect(dest);
      makeVoice(ctx, freq, "sine", start, 0.6, 0.05, 0.008, 8).connect(dest);
    });
  },
  navigate(ctx, dest) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.setValueAtTime(330, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.12);
    filter.type = "bandpass";
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.12);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.2);
  },
  error(ctx, dest) {
    const t = ctx.currentTime;
    const freqs = [349.23, 369.99];
    freqs.forEach((freq) => {
      makeVoice(ctx, freq, "triangle", t, 0.35, 0.09, 0.01).connect(dest);
      makeVoice(ctx, freq * 0.5, "sine", t, 0.4, 0.05, 0.012).connect(dest);
    });
  },
};

export function useSoundSystem() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const ensureContext = useCallback(async () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
      masterRef.current = createMaster(audioCtxRef.current);
    }
    const ctx = audioCtxRef.current;
    // "interrupted" is iOS Safari; treat like suspended.
    if (ctx.state === "suspended" || (ctx.state as string) === "interrupted") {
      try {
        await ctx.resume();
      } catch {
        /* ignore — will retry on next play */
      }
    }
    return ctx;
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;
      void (async () => {
        try {
          const ctx = await ensureContext();
          if (!ctx || ctx.state !== "running") return;
          const dest = masterRef.current ?? ctx.destination;
          PLAYERS[type](ctx, dest);
        } catch (e) {
          console.warn("Sound playback failed:", e);
        }
      })();
    },
    [soundEnabled, ensureContext]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}

      // Confirmation chime when enabling — this click IS a user gesture, safe to unlock.
      if (next) {
        void (async () => {
          try {
            const ctx = await ensureContext();
            if (!ctx || ctx.state !== "running") return;
            const dest = masterRef.current ?? ctx.destination;
            PLAYERS.notification(ctx, dest);
          } catch {}
        })();
      }
      return next;
    });
  }, [ensureContext]);

  // Auto-resume on tab focus / visibility change (mobile browsers suspend on background).
  useEffect(() => {
    const resume = () => {
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state !== "closed" && ctx.state !== "running") {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("pointerdown", resume, { passive: true });
    return () => {
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pointerdown", resume);
      // Do NOT close the AudioContext on unmount — the SoundProvider lives
      // for the whole app; StrictMode double-invoke would otherwise kill it.
    };
  }, []);

  return { soundEnabled, toggleSound, playSound, getAudioContext: () => audioCtxRef.current };
}
