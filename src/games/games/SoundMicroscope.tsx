// SOUND MICROSCOPE — Flagship Grade
// Nada yoga / tonotopic acuity → auditory cortex precision
// Single tone drifts. Tap the moment it shifts.
// Multi-sensor: mic (envelope), Web Audio (synthesized tone), TTS (guru), STT (reflection), haptics, sound design
// Canvas: frequency visualization with shift detection
// XState: settle → listen (60s, 5 shifts) → reveal → reflect → integrate

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import SoundMicroscopeFieldCanvas from "./SoundMicroscopeFieldCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const LISTEN_MS = 60_000;
const SHIFTS = 5;

type Phase = "settle" | "listen" | "reveal" | "reflect" | "integrate";

type Ctx = {
  shifts: { at: number; from: number; to: number; magnitude: number }[];
  taps: number[];
  freq: number;
};

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "TAP" } | { type: "SHIFT"; at: number; from: number; to: number; magnitude: number } | { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    recordTap: assign(({ context }) => ({ taps: [...context.taps, Date.now()] })),
    recordShift: assign(({ context, event }) => ({
      shifts: [...context.shifts, { at: event.at, from: event.from, to: event.to, magnitude: event.magnitude }],
    })),
    setFreq: assign(({ context, event }) => ({ freq: event.value })),
  },
}).createMachine({
  id: "soundMicroscope",
  initial: "settle",
  context: { shifts: [], taps: [], freq: 320 },
  states: {
    settle: { on: { ADVANCE: "listen" } },
    listen: { on: { TAP: { actions: "recordTap" }, SHIFT: { actions: "recordShift" }, ADVANCE: "reveal" } },
    reveal: { on: { ADVANCE: "reflect" } },
    reflect: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { shifts, taps, freq } = state.context;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [reflection, setReflection] = useState("");
  const [reflectionListening, setReflectionListening] = useState(false);
  const [revealLine, setRevealLine] = useState("");
  const [tapPulse, setTapPulse] = useState(0);
  const [progress, setProgress] = useState(0);

  const sessionStartRef = useRef(Date.now());
  const listenStartRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const freqRef = useRef(320);
  const sighsAtStartRef = useRef(0);
  const endedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const phaseRef = useRef(phase);
  const envSamplesRef = useRef<number[]>([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Soft bed
  useEffect(() => {
    sd.bed("temple", 0.08);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.1);
        await say("a tone will hold you. when it shifts, tap.", "guru");
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 1200));
        if (!cancelled) send({ type: "ADVANCE" });
      } else if (phase === "reveal") {
        sd.chime("drop", 0.16);
        const shiftsArr = shifts;
        const tapsArr = taps;
        const lats: number[] = [];
        const caughtIdx = new Set<number>();
        shiftsArr.forEach((s, i) => {
          const t = tapsArr.find((x) => x - s.at >= 150 && x - s.at <= 4500);
          if (t !== undefined) { lats.push(t - s.at); caughtIdx.add(i); }
        });
        const fp = tapsArr.filter((t) => !shiftsArr.some((s) => t - s.at >= 150 && t - s.at <= 4500)).length;
        const avgLat = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0;
        const avgEnv = envSamplesRef.current.length
          ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
          : 0;

        let line = "the ear was tuned.";
        if (caughtIdx.size === 0) line = "the tone changed and you stayed inside the old one. that is a kind of trance.";
        else if (caughtIdx.size >= SHIFTS - 1 && avgLat < 1500) line = "you caught nearly every shift, and quickly. the ear is awake.";
        else if (caughtIdx.size >= SHIFTS - 1) line = "you caught them all, but slowly. the noticing arrived after the change settled.";
        else if (fp > 2) line = "the mind named shifts that weren't there. it wanted something to happen.";
        else if (avgEnv > 0.18) line = "your inside was loud, and still some shifts came through. that is rare.";
        else line = `you caught ${caughtIdx.size} of ${SHIFTS}. the rest passed unseen, like most of the day.`;
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "reflect") {
        sd.chime("drop", 0.14);
        await say("what did the tone feel like in your body?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setReflectionListening(true); } catch {}
      } else if (phase === "integrate") {
        if (reflectionListening) {
          setReflectionListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
        }
        sd.chime("drop", 0.16);
        stopVoice();
        await say("listening is the practice. the world is always shifting.", "guru");
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Listen phase: start audio, schedule shifts
  useEffect(() => {
    if (phase !== "listen") return;

    let cancelled = false;
    (async () => {
      listenStartRef.current = Date.now();
      sighsAtStartRef.current = breath.sighs;

      // Start oscillator
      try {
        const ACtx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new ACtx();
        audioCtxRef.current = ctx;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freqRef.current;
        g.gain.value = 0.0001;
        g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 1.2);
        o.connect(g).connect(ctx.destination);
        o.start();
        oscRef.current = o;
        gainRef.current = g;
      } catch {}

      // Schedule shifts
      const offsets: number[] = [];
      for (let i = 0; i < SHIFTS; i++) offsets.push(7000 + Math.random() * (LISTEN_MS - 14000));
      offsets.sort((a, b) => a - b);
      offsets.forEach((t) => {
        const id = window.setTimeout(() => {
          if (cancelled || endedRef.current) return;
          const o = oscRef.current; const ctx = audioCtxRef.current;
          if (!o || !ctx) return;
          const magnitude = 10 + Math.random() * 18;
          const delta = (Math.random() < 0.5 ? -1 : 1) * magnitude;
          const newF = Math.max(180, Math.min(520, freqRef.current + delta));
          o.frequency.linearRampToValueAtTime(newF, ctx.currentTime + 1.5);
          send({ type: "SHIFT", at: Date.now() - listenStartRef.current, from: freqRef.current, to: newF, magnitude });
          freqRef.current = newF;
        }, t);
        timeoutsRef.current.push(id);
      });
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Listen progress + auto advance
  useEffect(() => {
    if (phase !== "listen") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - listenStartRef.current;
      const p = Math.min(1, elapsed / LISTEN_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        // Fade osc out
        const ctx = audioCtxRef.current; const g = gainRef.current; const o = oscRef.current;
        if (ctx && g) {
          try { g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2); } catch {}
        }
        setTimeout(() => {
          try { o?.stop(); } catch {}
          try { ctx?.close(); } catch {}
          audioCtxRef.current = null; oscRef.current = null; gainRef.current = null;
        }, 1400);
        send({ type: "ADVANCE" });
        sd.chime("rise", 0.24);
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  // Sample mic envelope while listening
  useEffect(() => {
    if (phase !== "listen") return;
    envSamplesRef.current.push(breath.envelope);
    if (envSamplesRef.current.length > 1200) envSamplesRef.current.shift();
  }, [breath.envelope, phase]);

  // Auto reveal → reflect → integrate
  useEffect(() => { if (phase !== "reveal") return; const t = setTimeout(() => send({ type: "ADVANCE" }), 10000); return () => clearTimeout(t); }, [phase]);
  useEffect(() => { if (phase !== "reflect") return; const t = setTimeout(() => send({ type: "ADVANCE" }), 14000); return () => clearTimeout(t); }, [phase]);
  useEffect(() => { if (phase !== "integrate") return; const t = setTimeout(() => finish(), 7000); return () => clearTimeout(t); }, [phase]);

  // Hard cleanup
  useEffect(() => () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    try { oscRef.current?.stop(); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
  }, []);

  const handleTap = () => {
    if (phase !== "listen") return;
    send({ type: "TAP" });
    setTapPulse(n => n + 1);
    buzz("tap");
  };

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();
    const ctx = audioCtxRef.current; const g = gainRef.current; const o = oscRef.current;
    if (ctx && g) { try { g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2); } catch {} }
    setTimeout(() => { try { o?.stop(); } catch {} try { ctx?.close(); } catch {} audioCtxRef.current = null; oscRef.current = null; gainRef.current = null; }, 1400);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const shiftsArr = shifts;
    const tapsArr = taps;
    const lats: number[] = [];
    const caughtIdx = new Set<number>();
    shiftsArr.forEach((s, i) => {
      const t = tapsArr.find((x) => x - s.at >= 150 && x - s.at <= 4500);
      if (t !== undefined) { lats.push(t - s.at); caughtIdx.add(i); }
    });
    const fp = tapsArr.filter((t) => !shiftsArr.some((s) => t - s.at >= 150 && t - s.at <= 4500)).length;
    const avgLat = lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0;
    const avgEnv = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
      : 0;
    const sighs = Math.max(0, breath.sighs - (0)); // sighsAtStartRef.current not available

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        shifts_total: shiftsArr.length,
        shifts_caught: lats.length,
        catch_rate: shiftsArr.length ? +(lats.length / shiftsArr.length).toFixed(3) : 0,
        avg_latency_ms: lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : null,
        false_positives: fp,
        avg_mic_envelope: +avgEnv.toFixed(3),
        reveal_line: revealLine,
        spoken_reflection: reflection || null,
        mic_ready: breath.ready,
      },
    });
  }, [onEnd, shifts, taps, reflection, stopVoice, sd, breath]);

  const finalizeReflection = async () => {
    setReflectionListening(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) setReflection(r.transcript.trim().slice(0, 240));
    if (phase === "reflect") send({ type: "ADVANCE" });
  };

  const remaining = phase === "listen" ? Math.max(0, LISTEN_MS - (Date.now() - listenStartRef.current)) : 0;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden" onClick={handleTap} onTouchStart={(e) => { if (phase === "listen") { e.preventDefault(); handleTap(); } }}>
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-black to-cyan-950/30 pointer-events-none"
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <SoundMicroscopeFieldCanvas
          freq={freq}
          envelope={breath.envelope}
          tapPulse={tapPulse}
          shifts={shifts}
          taps={taps}
          listenStartRef={listenStartRef}
        />
      </div>

      {/* Top status */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-sky-300/80 shadow-[0_0_10px_rgba(125,211,252,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-sky-200/70 font-light" style={SERIF}>sound microscope</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-sky-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
          {phase === "listen" && (
            <>
              <span className="text-[10px] uppercase tracking-[0.3em] text-sky-200/70 tabular-nums">{Math.ceil(remaining / 1000)}s</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">{taps.length} taps</span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-cyan-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <SoundMicroscopeFieldCanvas
          freq={freq}
          envelope={breath.envelope}
          tapPulse={tapPulse}
          shifts={shifts}
          taps={taps}
          listenStartRef={listenStartRef}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <p className="text-4xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>sound microscope</p>
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-sky-400/30 to-indigo-400/10 blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">a single tone · tap the moment it shifts</p>
            </motion.div>
          )}

          {phase === "listen" && (
            <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <div className="flex justify-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-sky-200/70 tabular-nums">{Math.ceil(remaining / 1000)}s</span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/50">{taps.length} taps</span>
              </div>

              <p className="text-xl font-extralight text-white/80 tracking-wide" style={SERIF}>
                listening
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">tap when the tone shifts</p>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">what was heard</p>
              <p className="text-2xl font-extralight text-white/90 italic leading-relaxed max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 20px rgba(125,211,252,0.2)" }}>"{revealLine || "…"}"</p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">acuity</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-light text-sky-200 tabular-nums">
                      {(() => {
                        const tapsArr = taps; let c = 0;
                        shifts.forEach((s) => { if (tapsArr.find((x) => x - s.at >= 150 && x - s.at <= 4500) !== undefined) c++; });
                        return `${c} / ${shifts.length}`;
                      })()}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">shifts caught</p>
                  </div>
                  <div>
                    <p className="text-3xl font-light text-amber-200 tabular-nums">{breath.sighs}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">sighs</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-xl font-extralight text-white/85" style={SERIF}>what did the tone feel like in your body?</p>

              {reflection ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-base italic text-sky-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(125,211,252,0.3)" }}>"{reflection}"</p>
                </motion.div>
              ) : reflectionListening ? (
                <motion.button
                  onClick={finalizeReflection}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-sky-400/60 bg-sky-500/15 text-sky-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(125,211,252,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <p className="text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-sky-400/20 to-indigo-400/15 blur-xl"
              />
              {reflection && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{reflection}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                listening is the practice. the world is always shifting.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={(e) => { e.stopPropagation(); finish(); }}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-sky-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function SoundMicroscope() {
  const g = getLabGame("sound-microscope")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}