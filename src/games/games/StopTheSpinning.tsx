// ============================================================
// Stop the Spinning — DMN suppression / rumination latency (FLAGSHIP GRADE)
// Tap to stop the rumination loop. Measure stop latency distribution.
// Multi-sensor: mic (somatic agitation), TTS (guru), STT (confession)
// Canvas: animated spinning orb with proximity tracking
// ============================================================
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
import StopSpinningCanvas from "./StopSpinningCanvas";

const MAX_DURATION = 3 * 60 * 1000; // 3 minutes
const MIN_LOOP_DURATION = 3000;
const MAX_LOOP_DURATION = 8000;
const PROX_RADIUS_PX = 200;

type Phase = "settle" | "loop" | "reveal" | "confess" | "integrate";

interface LoopEvent {
  loopId: number;
  loopStart: number;
  stopped: boolean;
  stopLatencyMs: number;
  proximityAtStop: number;
  micEnvelopeAtStop: number;
}

type Ctx = { pressed: boolean };

const machine = setup({
  types: {} as {
    context: Ctx;
    events: { type: "ADVANCE" } | { type: "STOP" } | { type: "FINALIZE" };
  },
  actions: {
    markStopped: assign({ pressed: () => true }),
  },
}).createMachine({
  id: "stopSpinning",
  initial: "settle",
  context: { pressed: false },
  states: {
    settle: { on: { ADVANCE: "loop" } },
    loop: {
      on: {
        ADVANCE: "reveal",
        STOP: { target: "reveal", actions: "markStopped" },
      },
    },
    reveal:    { on: { ADVANCE: "confess" } },
    confess:   { on: { ADVANCE: "integrate" } },
    integrate: { on: { FINALIZE: "done" } },
    done:      { type: "final" },
  },
});

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const [state, send] = useMachine(machine);
  const phase = state.value as Phase;
  const stopped = state.context.pressed;

  const breath = useBreathMic(true);
  const { say, stop: stopVoice } = useGuruVoice();
  const transcribe = useTranscribe();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();

  const [loops, setLoops] = useState<LoopEvent[]>([]);
  const [currentLoopId, setCurrentLoopId] = useState(0);
  const loopIdRef = useRef(0);
  const [proximity, setProximity] = useState(0);
  const [revealLine, setRevealLine] = useState("");
  const [whispered, setWhispered] = useState("");
  const [listeningConfession, setListeningConfession] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  const orbRef = useRef<HTMLDivElement | null>(null);
  const loopTimerRef = useRef<number | undefined>(undefined);
  const loopStartRef = useRef(0);
  const holdStartRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const envSamplesRef = useRef<number[]>([]);
  const proxSamplesRef = useRef<number[]>([]);
  const endedRef = useRef(false);
  const nearMissesRef = useRef(0);
  const wasNearRef = useRef(false);
  const lastNearMissAtRef = useRef(0);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.05);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Sample mic during loops
  useEffect(() => {
    if (phaseRef.current !== "loop") return;
    envSamplesRef.current.push(breath.envelope);
  }, [breath.envelope]);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.08);
        await say("a thought loop spins. tap to stop it. each time it restarts, stop it again. notice the gap between the urge and the action.", "guru");
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 2000));
        if (!cancelled) {
          holdStartRef.current = performance.now();
          send({ type: "ADVANCE" });
          startLoop();
        }
      } else if (phase === "reveal") {
        sd.chime("drop", 0.1);
        const line = buildRevealLine();
        setRevealLine(line);
        await say(line, "guru");
      } else if (phase === "confess") {
        sd.chime("drop", 0.08);
        await say(stopped
          ? "you stopped it. say it — what was the thought just before your hand moved?"
          : "the loop completed. say it — what almost made you press?", "guru");
        if (cancelled) return;
        try { await transcribe.start(); setListeningConfession(true); } catch {}
      } else if (phase === "integrate") {
        if (listeningConfession) {
          setListeningConfession(false);
          const r = await transcribe.stop().catch(() => null);
          if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
        }
        sd.chime("drop", 0.12);
        stopVoice();
        await say("the practice was never the loop. the practice was the stopping. that is where the will lives.", "guru");
      } else if (phase === "done") {
        finish();
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const startLoop = useCallback(() => {
    if (endedRef.current || phaseRef.current !== "loop") return;

    const loopId = ++loopIdRef.current;
    setCurrentLoopId(loopId);
    loopStartRef.current = performance.now();

    sd.chime("rise", 0.05);

    const duration = MIN_LOOP_DURATION + Math.random() * (MAX_LOOP_DURATION - MIN_LOOP_DURATION);

    loopTimerRef.current = window.setTimeout(() => {
      if (loopId !== loopIdRef.current) return;
      if (endedRef.current) return;

      // Loop restarted automatically (not stopped)
      setLoops(prev => [...prev, {
        loopId,
        loopStart: loopStartRef.current,
        stopped: false,
        stopLatencyMs: 0,
        proximityAtStop: 0,
        micEnvelopeAtStop: 0,
      }]);

      // Brief pause before next loop
      setTimeout(() => {
        if (!endedRef.current && phaseRef.current === "loop") {
          startLoop();
        }
      }, 500 + Math.random() * 1000);
    }, duration);
  }, []);

  const handleStop = useCallback(() => {
    if (phaseRef.current !== "loop" || stopped || endedRef.current) return;
    if (!loopStartRef.current) return;

    const latency = performance.now() - loopStartRef.current;
    const loopId = loopIdRef.current;

    setLoops(prev => [...prev, {
      loopId,
      loopStart: loopStartRef.current,
      stopped: true,
      stopLatencyMs: latency,
      proximityAtStop: proximity,
      micEnvelopeAtStop: breath.envelope,
    }]);

    sd.chime("drop", 0.12);
    buzz("tap");
    setFlashKey(k => k + 1);

    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = undefined;
    }

    send({ type: "STOP" });

    // Start next loop after brief pause
    setTimeout(() => {
      if (!endedRef.current && phaseRef.current === "loop") {
        startLoop();
      }
    }, 1000 + Math.random() * 2000);
  }, [stopped, proximity, startLoop]);

  // Auto-end after MAX_DURATION
  useEffect(() => {
    if (phase !== "loop") return;
    const timer = setTimeout(() => {
      if (!endedRef.current) send({ type: "ADVANCE" });
    }, MAX_DURATION);
    return () => clearTimeout(timer);
  }, [phase]);

  // Pointer proximity tracker
  useEffect(() => {
    if (phaseRef.current !== "loop") return;
    const onMove = (e: PointerEvent) => {
      const orb = orbRef.current; if (!orb) return;
      const r = orb.getBoundingClientRect();
      const ox = r.left + r.width / 2;
      const oy = r.top + r.height / 2;
      const d = Math.hypot(e.clientX - ox, e.clientY - oy);
      const p = Math.max(0, Math.min(1, 1 - d / PROX_RADIUS_PX));
      setProximity(p);
      proxSamplesRef.current.push(p);

      // Near-miss: proximity peaks above threshold but no press
      if (p >= 0.7 && !wasNearRef.current) {
        wasNearRef.current = true;
        const now = performance.now();
        if (now - lastNearMissAtRef.current > 600) {
          nearMissesRef.current += 1;
          lastNearMissAtRef.current = now;
          setFlashKey(k => k + 1);
          buzz("tap");
        }
      } else if (p < 0.5) {
        wasNearRef.current = false;
      }
    };
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, [phase]);

  const buildRevealLine = () => {
    const stoppedCount = loops.filter(l => l.stopped).length;
    const totalCount = loops.length;
    const avgLatency = loops.filter(l => l.stopped).length > 0
      ? loops.filter(l => l.stopped).reduce((s, l) => s + l.stopLatencyMs, 0) / loops.filter(l => l.stopped).length
      : 0;

    if (totalCount === 0) return "no loops yet.";
    if (stoppedCount === 0) return `the loop spun ${totalCount} times. you never stopped it.`;
    if (stoppedCount === totalCount) return `you stopped all ${totalCount} loops. average latency ${Math.round(avgLatency)}ms.`;
    return `you stopped ${stoppedCount} of ${totalCount} loops. average latency ${Math.round(avgLatency)}ms.`;
  };

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const durationMs = Date.now() - sessionStartRef.current;
    const stoppedLoops = loops.filter(l => l.stopped);
    const totalLoops = loops.length;
    const latencies = stoppedLoops.map(l => l.stopLatencyMs);
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const medianLatency = latencies.length > 0 ? [...latencies].sort((a, b) => a - b)[Math.floor(latencies.length / 2)] : 0;
    const avgProximity = stoppedLoops.length > 0 ? stoppedLoops.reduce((s, l) => s + l.proximityAtStop, 0) / stoppedLoops.length : 0;
    const avgEnvelope = stoppedLoops.length > 0 ? stoppedLoops.reduce((s, l) => s + l.micEnvelopeAtStop, 0) / stoppedLoops.length : 0;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        total_loops: totalLoops,
        loops_stopped: stoppedLoops.length,
        stop_rate: totalLoops > 0 ? +(stoppedLoops.length / totalLoops).toFixed(3) : 0,
        latencies_ms: latencies,
        avg_latency_ms: Math.round(avgLatency),
        median_latency_ms: Math.round(medianLatency),
        min_latency_ms: latencies.length > 0 ? Math.min(...latencies) : 0,
        max_latency_ms: latencies.length > 0 ? Math.max(...latencies) : 0,
        avg_proximity_at_stop: +(avgProximity).toFixed(3),
        avg_mic_envelope_at_stop: +(avgEnvelope).toFixed(3),
        near_misses: nearMissesRef.current,
        mic_ready: breath.ready,
        prox_samples: proxSamplesRef.current.length,
        env_samples: envSamplesRef.current.length,
      },
    });
  }, [onEnd, loops, breath, stopVoice, sd]);

  const elapsed = Date.now() - sessionStartRef.current;
  const progress = Math.min(1, elapsed / MAX_DURATION);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.14, 0.04], y: [0, -10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-rose-950/20 via-black to-red-950/20 pointer-events-none"
      />
      {/* Aurora — rose/red */}
      <motion.div
        animate={{ opacity: [0.03, 0.12, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-rose-400/15 via-transparent to-red-500/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — amber offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent pointer-events-none mix-blend-screen"
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
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-rose-300/80 shadow-[0_0_10px_rgba(251,113,133,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-rose-200/70 font-light" style={SERIF}>stop the spinning</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-rose-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/40">
            loops {loops.length} · stopped {loops.filter(l => l.stopped).length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-400 via-red-400 to-amber-400"
          style={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === "settle" && (
            <motion.div key="settle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <p className="text-4xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>settling…</p>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-28 h-28 border-2 border-rose-400/30 border-t-rose-300 rounded-full"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">the mind spins. the practice is stopping.</p>
            </motion.div>
          )}

          {phase === "loop" && (
            <motion.div key="loop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-xl text-center space-y-10 pointer-events-auto">
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all duration-700 ${
                      i < loops.length % 12 ? "w-6 bg-rose-300/90 shadow-[0_0_8px_rgba(251,113,133,0.5)]" :
                      "w-2 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Spinning orb canvas */}
              <StopSpinningCanvas
                ref={orbRef}
                phase="loop"
                isSpinning={true}
                flashKey={flashKey}
                proximity={proximity}
                onPress={handleStop}
              />

              <p className="text-lg italic text-white/60" style={SERIF}>
                {stopped ? "loop stopped. waiting for next…" : "the loop spins…"}
              </p>

              {loops.length > 0 && !stopped && (
                <p className="text-[11px] text-white/30 tabular-nums">
                  loop {loops.length + 1} · stopped {loops.filter(l => l.stopped).length}
                </p>
              )}
            </motion.div>
          )}

          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8 max-w-xl">
              <p className="text-3xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>the loop reveals</p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-4"
              >
                <p className="text-lg text-white/90 italic" style={SERIF}>{revealLine}</p>
                <div className="flex justify-center gap-8 text-center">
                  <div>
                    <p className="text-3xl font-extralight text-rose-300 tabular-nums">{loops.filter(l => l.stopped).length}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">stopped</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extralight text-white/40 tabular-nums">{loops.filter(l => !l.stopped).length}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">missed</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extralight text-violet-300 tabular-nums">
                      {loops.filter(l => l.stopped).length > 0
                        ? Math.round(loops.filter(l => l.stopped).reduce((s, l) => s + l.stopLatencyMs, 0) / loops.filter(l => l.stopped).length)
                        : 0}ms
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">avg latency</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {phase === "confess" && (
            <motion.div key="confess" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 pointer-events-auto max-w-xl">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.02em]" style={SERIF}>speak the confession</p>

              {whispered ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto"
                >
                  <p className="text-lg italic text-rose-100/95 max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(251,113,133,0.3)" }}>"{whispered}"</p>
                </motion.div>
              ) : listeningConfession ? (
                <motion.button
                  onClick={() => {
                    setListeningConfession(false);
                    transcribe.stop().then(r => {
                      if (r?.transcript) setWhispered(r.transcript.trim().slice(0, 280));
                    });
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-full border-2 border-rose-400/60 bg-rose-500/10 text-rose-100 text-sm uppercase tracking-wide animate-pulse shadow-[0_0_24px_rgba(251,113,133,0.25)]"
                >
                  ● listening — tap when done
                </motion.button>
              ) : (
                <p className="text-white/40">preparing…</p>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-rose-400/20 to-red-500/10 blur-xl"
              />
              {whispered && (
                <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>"{whispered}"</p>
              )}
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the practice was never the loop. the practice was the stopping. that is where the will lives.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-rose-200/70 transition-all duration-500"
      >
        complete →
      </button>
    </div>
  );
}

export default function StopTheSpinning() {
  const g = getLabGame("stop-spinning")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };