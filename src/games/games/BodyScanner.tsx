// BODY SCANNER — Flagship Grade
// Goenka body sweep / interoceptive accuracy
// 45s slow scan, head to feet. Tap only where there is actual sensation.
// Multi-sensor: mic (breath envelope), TTS (guru), STT (spoken reflection), haptics, sound design
// Canvas: animated body outline with sensation markers
// XState: settle → scan (45s) → reveal → words → integrate

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
import BodyScannerCanvas, { FeltPoint } from "./BodyScannerCanvas";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const SCAN_SECONDS = 45;

type Phase = "settle" | "scan" | "reveal" | "words" | "integrate";

type Ctx = { feltPoints: FeltPoint[]; tapTimes: number[]; envSamples: number[] };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "FEEL"; x: number; y: number; t: number } | { type: "ADVANCE" } | { type: "FINALIZE" };
  },
  actions: {
    recordFeel: assign(({ context, event }) => ({
      feltPoints: [...context.feltPoints.slice(-30), { x: event.x, y: event.y, t: event.t }],
      tapTimes: [...context.tapTimes, event.t],
    })),
  },
}).createMachine({
  id: "bodyScanner",
  initial: "settle",
  context: { feltPoints: [], tapTimes: [], envSamples: [] },
  states: {
    settle: { on: { ADVANCE: "scan" } },
    scan: { on: { FEEL: { actions: "recordFeel" }, ADVANCE: "reveal" } },
    reveal: { on: { ADVANCE: "words" } },
    words: { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done: { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const { feltPoints, tapTimes } = state.context;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [scanSec, setScanSec] = useState(0);
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listening, setListening] = useState(false);

  const sessionStartRef = useRef(Date.now());
  const scanStartRef = useRef(0);
  const endedRef = useRef(false);
  const envSamplesRef = useRef<number[]>([]);

  useEffect(() => { if (phase === "scan") envSamplesRef.current.push(breath.envelope); }, [breath.envelope, phase]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("a slow scan, head to feet. tap only where there is actual sensation. not where you think there should be.", "guru");
        if (!cancelled) setTimeout(() => send({ type: "ADVANCE" }), 700);
      } else if (phase === "scan") {
        scanStartRef.current = performance.now();
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildReveal();
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "words") {
        sd.chime("drop", 0.08);
        await say("say it — which area surprised you?", "guru");
        if (!cancelled) { try { await transcribe.start(); setListening(true); } catch {} }
      } else if (phase === "integrate") {
        if (listening) {
          setListening(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.12); stopVoice();
        await say("the body is always speaking. the practice is to stop translating.", "guru");
      } else if (phase === "done") finish();
    })();
    return () => { cancelled = true; };
  }, [phase]);

  // Scan timer
  useEffect(() => {
    if (phase !== "scan") return;
    const tick = setInterval(() => {
      const e = (performance.now() - scanStartRef.current) / 1000;
      setScanSec(e);
      if (e >= SCAN_SECONDS) { clearInterval(tick); send({ type: "ADVANCE" }); }
    }, 100);
    return () => clearInterval(tick);
  }, [phase]);

  const onFieldTap = useCallback((e: React.PointerEvent) => {
    if (phase !== "scan") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();
    send({ type: "FEEL", x, y, t: now });
    sd.chime("rise", 0.05);
    buzz("tap");
  }, [phase]);

  const variance = (a: number[]) => { if (!a.length) return 0; const m = a.reduce((x,y)=>x+y,0)/a.length; return a.reduce((x,y)=>x+(y-m)**2,0)/a.length; };

  const buildReveal = (): string => {
    const taps = tapTimes.length;
    const envVar = variance(envSamplesRef.current);
    let line: string;
    if (taps === 0) {
      line = "no taps. either the body was utterly quiet, or you stopped listening. notice which.";
    } else if (taps <= 3 && envVar < 0.008) {
      line = `${taps} sensations. quiet body, quiet breath. that is rare honesty.`;
    } else if (taps >= 12) {
      line = `${taps} taps. the body is full of news. notice if some were imagined — the mind likes to fill silence.`;
    } else if (envVar > 0.015) {
      line = `${taps} sensations, but the breath was busy. the body felt more than the hand could mark.`;
    } else {
      line = `${taps} sensations. a measured scan. notice which one is still here right now.`;
    }
    setRevealLine(line);
    return line;
  };

  const finish = useCallback(() => {
    if (endedRef.current) return; endedRef.current = true;
    transcribe.cancel();
    const envVar = variance(envSamplesRef.current);
    const envMean = envSamplesRef.current.length ? envSamplesRef.current.reduce((a,b)=>a+b,0)/envSamplesRef.current.length : 0;
    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: Date.now() - sessionStartRef.current,
        scan_seconds: SCAN_SECONDS,
        tap_count: tapTimes.length,
        env_mean: +envMean.toFixed(5),
        env_var: +envVar.toFixed(5),
        reveal_line: revealLine,
        reflection: whispered || null,
        mic_ready: breath.ready,
        mic_cycles: breath.cycles,
      },
    });
  }, [onEnd, stopVoice, sd, breath]);

  const handleListening = () => {
    transcribe.stop().catch(() => null).then(r => {
      if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
      send({ type: "ADVANCE" });
    });
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-black to-orange-950/30 pointer-events-none"
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top status */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-amber-200/70 font-light" style={SERIF}>body scanner</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-amber-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      const progress = phase === "scan" ? Math.min(1, scanSec / SCAN_SECONDS) : phase === "reveal" ? 1 : phase === "words" ? 1 : 0;
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Canvas visualization */}
      <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
        <BodyScannerCanvas
          envelope={breath.envelope}
          felt={feltPoints}
          scanFrac={Math.min(1, scanSec / SCAN_SECONDS)}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <p className="text-4xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>body scanner</p>
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/15 blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">head to feet · tap only actual sensation</p>
            </motion.div>
          )}

          {phase === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <div className="flex justify-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-amber-200/70 tabular-nums">{Math.floor(scanSec)}s / {SCAN_SECONDS}s</span>
              </div>

              <p className="text-xl font-extralight text-white/80 tracking-wide" style={SERIF}>
                scanning
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">tap only where there is actual sensation</p>
              <p className="text-sm text-white/35 max-w-md mx-auto">not where you think there should be</p>
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-4">calibration</p>
              <p className="text-2xl font-extralight text-white/90 italic leading-relaxed max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 20px rgba(251,191,36,0.2)" }}>"{revealLine || "…"}"</p>
            </motion.div>
          )}

          {phase === "words" && (
            <motion.div key="words" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center space-y-8 pointer-events-auto">
              <p className="text-xl font-extralight text-white/85" style={SERIF}>which area surprised you?</p>

              {whispered ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-base italic text-amber-100/95" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(251,191,36,0.3)" }}>"{whispered}"</p>
                </motion.div>
              ) : listening ? (
                <motion.button
                  onClick={handleListening}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-amber-400/60 bg-amber-500/15 text-amber-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(251,191,36,0.25)]"
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
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/15 blur-xl"
              />
              {whispered && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{whispered}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the body is always speaking. the practice is to stop translating.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap area for scan phase */}
      {phase === "scan" && (
        <div
          onPointerDown={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            send({ type: "FEEL", x, y, t: Date.now() });
            sd.chime("rise", 0.05);
            buzz("tap");
          }}
          className="absolute inset-0 z-20 cursor-crosshair"
          aria-label="Tap to mark sensation"
        />
      )}

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-amber-200/70 transition-all duration-500"
      >
        end · save
      </button>
    </div>
  );
}

export default function BodyScanner() {
  const g = getLabGame("body-scanner")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}