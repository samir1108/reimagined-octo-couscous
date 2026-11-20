// THE SLOW TAP v2 — flagship #30, internal time perception without a clock.
//
// The user stares into a breathing "time well" and taps when they believe
// 60 seconds have passed. No numbers, no clock, no progress bar.
// We measure:
//   - elapsed_ms at tap (precision vs. 60s target)
//   - early / late / accurate classification
//   - env_var (mic somatic agitation during the wait)
//   - env_mean
//   - tap_reflection via STT
//
// Senses used:
//   - TTS (framing, calibration, integration)
//   - Microphone envelope (somatic agitation while estimating)
//   - STT (reflection on how time felt)
//   - Sound design + haptics
//
// XState phases:
//   1. settle    — opening line, explain no clock
//   2. wait      — the well breathes; tap when 60s feels right
//   3. reveal    — TTS reveals actual elapsed and what the body did
//   4. words     — STT, "how did time feel?"
//   5. integrate — closing line, then end
//   6. done      — final

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { setup, assign } from "xstate";
import { useMachine } from "@xstate/react";
import CinematicOverlay from "../shell/CinematicOverlay";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useBreathMic } from "../shell/useBreathMic";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import SlowTapCanvas from "./SlowTapCanvas";

const TARGET_MS = 60_000;
const ACCURATE_THRESHOLD_MS = 5_000; // within 5s = accurate

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

type Ctx = { elapsedMs: number };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "ADVANCE" } | { type: "TAP"; elapsedMs: number } | { type: "FINALIZE" };
  },
  actions: {
    recordTap: assign({
      elapsedMs: (_, e: { elapsedMs: number }) => e.elapsedMs,
    }),
  },
}).createMachine({
  id: "slowTap",
  initial: "settle",
  context: { elapsedMs: 0 },
  states: {
    settle:    { on: { ADVANCE: "wait" } },
    wait:      { on: { TAP: { target: "reveal", actions: "recordTap" } } },
    reveal:    { on: { ADVANCE: "words" } },
    words:     { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as "settle" | "wait" | "reveal" | "words" | "integrate" | "done";
  const elapsedMs = state.context.elapsedMs;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [shockKey, setShockKey] = useState(0);
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listeningFinal, setListeningFinal] = useState(false);

  const waitStartRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const envSamplesRef = useRef<number[]>([]);
  const phaseRef = useRef(phase);
  const endedRef = useRef(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Bed + cleanup
  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sample mic during wait
  useEffect(() => {
    if (phase !== "wait") return;
    envSamplesRef.current.push(breath.envelope);
  }, [breath.envelope, phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("no clock. no numbers. the well breathes. tap when sixty seconds have passed.", "guru");
        if (cancelled) return;
        setTimeout(() => { if (!cancelled) send({ type: "ADVANCE" }); }, 700);
      } else if (phase === "wait") {
        waitStartRef.current = performance.now();
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("say it — how did time feel? was it fast, slow, thick, thin?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListeningFinal(true); } catch {}
      } else if (phase === "integrate") {
        if (listeningFinal) {
          setListeningFinal(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the body has its own clock. it does not need a face to know when time has passed.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onTap = () => {
    if (phaseRef.current !== "wait") return;
    const elapsed = performance.now() - waitStartRef.current;
    buzz("tap");
    sd.chime("rise", 0.14);
    setShockKey((k) => k + 1);
    send({ type: "TAP", elapsedMs: Math.round(elapsed) });
  };

  const variance = (arr: number[]) => {
    if (!arr.length) return 0;
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length;
  };

  const buildRevealLine = (): string => {
    const error = elapsedMs - TARGET_MS;
    const absError = Math.abs(error);
    const envVar = variance(envSamplesRef.current);
    const early = error < 0;
    const accurate = absError <= ACCURATE_THRESHOLD_MS;

    let line: string;
    if (accurate && envVar < 0.008) {
      line = `you tapped at ${(elapsedMs / 1000).toFixed(1)} seconds. within the window. and the body stayed quiet. that quiet accuracy is rare.`;
    } else if (accurate) {
      line = `you tapped at ${(elapsedMs / 1000).toFixed(1)} seconds. close enough. but the breath was busy — the body knew time was passing even when the mind didn't.`;
    } else if (early && absError > 15_000) {
      line = `you tapped at ${(elapsedMs / 1000).toFixed(1)} seconds. the mind raced ahead. notice the hurry — it is older than this moment.`;
    } else if (early) {
      line = `you tapped at ${(elapsedMs / 1000).toFixed(1)} seconds. a little early. time felt shorter than it was. what compressed it?`;
    } else if (!early && absError > 15_000) {
      line = `you tapped at ${(elapsedMs / 1000).toFixed(1)} seconds. the mind stretched time. stillness creates space. but too much space is also a story.`;
    } else {
      line = `you tapped at ${(elapsedMs / 1000).toFixed(1)} seconds. a little late. the body wanted more. notice what it was waiting for.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    transcribe.cancel();

    const error = elapsedMs - TARGET_MS;
    const absError = Math.abs(error);
    const envMean = envSamplesRef.current.length
      ? envSamplesRef.current.reduce((a, b) => a + b, 0) / envSamplesRef.current.length
      : 0;
    const envVar = variance(envSamplesRef.current);

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        target_ms: TARGET_MS,
        elapsed_ms: elapsedMs,
        error_ms: error,
        abs_error_ms: absError,
        early: error < 0,
        late: error > 0,
        accurate: absError <= ACCURATE_THRESHOLD_MS,
        env_mean: +envMean.toFixed(5),
        env_var: +envVar.toFixed(5),
        reveal_line: revealLine,
        tap_reflection: whispered || null,
        mic_ready: breath.ready,
      },
    });
  };

  const elapsedFrac = waitStartRef.current ? (performance.now() - waitStartRef.current) / TARGET_MS : 0;

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <SlowTapCanvas
        envelope={breath.envelope}
        elapsedFrac={elapsedFrac}
        active={phase === "wait"}
        shockKey={shockKey}
      />
      <CinematicOverlay tint="violet" />

      {/* Top-left phase pill */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <motion.div
          key={String(phase)}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.7 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.42em] text-indigo-100/70"
        >
          <motion.span
            className="inline-block w-1 h-1 rounded-full bg-indigo-200/80"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {phase === "settle" && "the slow tap"}
          {phase === "wait" && "waiting"}
          {phase === "reveal" && "calibration"}
          {phase === "words" && "the reflection"}
          {phase === "integrate" && "rest"}
        </motion.div>
      </div>

      {/* Top-right mic */}
      <div className="absolute top-6 right-6 z-30 text-right space-y-1.5 pointer-events-none">
        <div className="flex items-center justify-end gap-1.5">
          {breath.ready ? <Mic className="w-3 h-3 text-indigo-100/70" /> : <MicOff className="w-3 h-3 text-white/30" />}
          <span className="text-[10px] uppercase tracking-widest text-white/50">{breath.ready ? "mic" : "no mic"}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "settle" && (
          <motion.div
            key="settle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-8 text-center"
          >
            <p
              className="text-4xl sm:text-5xl text-indigo-50/90 italic tracking-wide"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              the slow tap
            </p>
            <div className="mt-5 h-px w-16 bg-indigo-100/25" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.4em] text-indigo-100/55 max-w-xs">
              no clock · no numbers
            </p>
            <p className="mt-2 text-xs italic text-white/45 max-w-xs leading-relaxed">
              tap when sixty seconds feel complete
            </p>
          </motion.div>
        )}

        {phase === "wait" && (
          <button
            onClick={onTap}
            onTouchStart={(e) => { e.preventDefault(); onTap(); }}
            className="absolute inset-0 z-20"
            aria-label="Tap when 60 seconds have passed"
          />
        )}

        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[10px] uppercase tracking-[0.45em] text-indigo-100/60 mb-6">calibration</p>
            <div className="h-px w-10 bg-indigo-100/25 mb-6" />
            <p
              className="text-xl sm:text-2xl text-indigo-50/90 italic leading-[1.55] max-w-md"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              "{revealLine || "…"}"
            </p>
          </motion.div>
        )}

        {phase === "words" && (
          <motion.div
            key="words"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center max-w-md mx-auto gap-6"
          >
            <p className="text-[10px] uppercase tracking-[0.42em] text-indigo-100/55">the reflection</p>
            <p
              className="text-xl sm:text-2xl text-indigo-50/90 italic leading-[1.55] max-w-sm"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
            >
              how did time feel?
            </p>
            {listeningFinal ? (
              <button
                onClick={() => send({ type: "ADVANCE" })}
                className="px-5 py-2.5 rounded-full border border-indigo-100/30 text-indigo-50/85 text-[11px] uppercase tracking-[0.3em] bg-white/5 backdrop-blur-sm animate-pulse"
              >
                ● listening · tap when done
              </button>
            ) : (
              <p className="text-xs text-white/40">preparing…</p>
            )}
          </motion.div>
        )}

        {phase === "integrate" && (
          <motion.div
            key="integrate"
            initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 px-8 text-center pointer-events-none"
          >
            <p className="text-[11px] font-light text-indigo-100/65 tracking-[0.5em] uppercase">rest</p>
            <div className="mt-5 h-px w-12 bg-indigo-100/20" />
            {whispered && (
              <p
                className="mt-6 text-lg italic text-indigo-50/70 max-w-sm leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
              >
                "{whispered}"
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase auto-advance timers */}
      <PhaseTimers phase={phase} send={send as any} />

      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-40 text-[10px] uppercase tracking-widest text-white/25 hover:text-white/65 transition"
      >
        end · save
      </button>
    </div>
  );
}

function PhaseTimers({ phase, send }: { phase: string; send: (e: any) => void }) {
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 11_000);
    return () => clearTimeout(t);
  }, [phase, send]);
  useEffect(() => {
    if (phase !== "words") return;
    const t = setTimeout(() => send({ type: "ADVANCE" }), 22_000);
    return () => clearTimeout(t);
  }, [phase, send]);
  useEffect(() => {
    if (phase !== "integrate") return;
    const t = setTimeout(() => send({ type: "FINALIZE" }), 8_000);
    return () => clearTimeout(t);
  }, [phase, send]);
  return null;
}

export default function SlowTap() {
  const g = getLabGame("slow-tap")!;
  return (
    <ConsciousGameShell game={labToMeta(g)}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}
