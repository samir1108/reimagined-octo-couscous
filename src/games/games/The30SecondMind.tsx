// ============================================================
// The 30-Second Mind — Vipassanā micro-noticing (FLAGSHIP GRADE)
// Self-report mind-wandering every 30 seconds for 5 minutes.
// Multi-sensor: mic (voice clarity), TTS (guru narration), STT (spoken reflections)
// Rich signals: probe consistency, transition latency, verbal articulation depth
// ============================================================
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import ConsciousGameShell, { GameEndPayload } from "../shell/ConsciousGameShell";
import { getLabGame } from "../shell/labRegistry";
import { labToMeta } from "../shell/labMetaAdapter";
import { useGuruVoice } from "../shell/useGuruVoice";
import { useTranscribe } from "../shell/useTranscribe";
import { useSoundDesign } from "../shell/useSoundDesign";
import { useHaptics } from "../shell/useHaptics";
import { useBreathMic } from "../shell/useBreathMic";

const SERIF = { fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" };
const TOTAL_DURATION = 5 * 60 * 1000; // 5 minutes
const PROBE_INTERVAL = 30 * 1000; // 30 seconds
const NUM_PROBES = TOTAL_DURATION / PROBE_INTERVAL; // 10 probes
const PROBE_WINDOW = 10000; // 10 seconds to respond

type Phase = "settle" | "probe" | "reflect" | "integrate";
type ProbeResponse = "on-task" | "wandering" | "unaware";

interface ProbeData {
  index: number;
  timestamp: number;           // absolute ms from session start
  responseTime: number;        // ms from probe onset to response
  response: ProbeResponse;
  verbalReflection?: string;   // optional spoken note
  breathEnvelope: number;      // mic envelope at probe moment
  heartRateProxy?: number;     // from breath variability
}

function PlayLayer({ onEnd }: { onEnd: (p: GameEndPayload) => void }) {
  const { say, stop: stopVoice } = useGuruVoice();
  const sd = useSoundDesign();
  const { buzz } = useHaptics();
  const breath = useBreathMic(true);
  const transcribe = useTranscribe();

  const [phase, setPhase] = useState<Phase>("settle");
  const [probeIndex, setProbeIndex] = useState(0);
  const [probes, setProbes] = useState<ProbeData[]>([]);
  const [currentResponse, setCurrentResponse] = useState<ProbeResponse | null>(null);
  const [showingProbe, setShowingProbe] = useState(false);
  const [probeStartTime, setProbeStartTime] = useState(0);
  const [verbalReflection, setVerbalReflection] = useState("");
  const [listeningReflection, setListeningReflection] = useState(false);
  const [showVerbalInput, setShowVerbalInput] = useState(false);

  const sessionStartRef = useRef(Date.now());
  const endedRef = useRef(false);
  const probeTimerRef = useRef<number | undefined>(undefined);
  const responseTimerRef = useRef<number | undefined>(undefined);
  const missedProbesRef = useRef(0);
  const breathAtProbeRef = useRef(0);

  // Ambient bed
  useEffect(() => {
    sd.bed("temple", 0.04);
    return () => { sd.stopBed(); stopVoice(); };
  }, []);

  // Phase driver
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (phase === "settle") {
        sd.chime("rise", 0.06);
        await say("your mind will wander. every thirty seconds, i'll ask — where were you? answer honestly. the calibration is the practice.", "guru");
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 1500));
        if (!cancelled) {
          setPhase("probe");
          triggerProbe();
        }
      }
    })();
    return () => { cancelled = true; };
  }, [phase]);

  const triggerProbe = useCallback(() => {
    if (endedRef.current || probeIndex >= NUM_PROBES) {
      if (!endedRef.current) finish();
      return;
    }

    setShowingProbe(true);
    const startTime = performance.now();
    setProbeStartTime(startTime);
    breathAtProbeRef.current = breath.envelope;
    sd.chime("drop", 0.08);
    buzz("tap");

    // Voice prompt
    (async () => {
      if (probeIndex === 0) {
        await say("probe one of ten. where was your attention?", "guru");
      } else if (probeIndex === Math.floor(NUM_PROBES / 2)) {
        await say(`probe ${probeIndex + 1}. halfway. where are you now?`, "guru");
      } else if (probeIndex === NUM_PROBES - 1) {
        await say("final probe. where does the mind rest?", "guru");
      } else {
        await say(`probe ${probeIndex + 1}. where was your attention?`, "guru");
      }
    })();

    // Response window timeout
    responseTimerRef.current = window.setTimeout(() => {
      if (showingProbe && !endedRef.current) {
        recordResponse("unaware", null, startTime);
      }
    }, PROBE_WINDOW);
  }, [probeIndex]);

  const recordResponse = useCallback((response: ProbeResponse, verbal?: string | null, startTime?: number) => {
    if (endedRef.current) return;
    if (responseTimerRef.current) clearTimeout(responseTimerRef.current);

    const responseTime = startTime ? performance.now() - startTime : 0;
    const timestamp = Date.now() - sessionStartRef.current;

    const newProbe: ProbeData = {
      index: probeIndex,
      timestamp,
      responseTime,
      response,
      verbalReflection: verbal?.trim(),
      breathEnvelope: breathAtProbeRef.current,
      heartRateProxy: breath.lastCycleMs > 0 ? Math.min(1, Math.max(0, 1 - Math.abs(breath.lastCycleMs - 11000) / 11000)) : undefined,
    };

    setProbes(prev => [...prev, newProbe]);
    setShowingProbe(false);
    setCurrentResponse(response);
    setVerbalReflection("");

    // Brief pause, then next probe or finish
    setTimeout(() => {
      if (!endedRef.current) {
        if (probeIndex >= NUM_PROBES - 1) {
          setPhase("reflect");
        } else {
          setProbeIndex(p => p + 1);
        }
      }
    }, 1500);
  }, [probeIndex]);

  const handleResponse = useCallback((response: ProbeResponse) => {
    if (!showingProbe) return;
    recordResponse(response, verbalReflection || null, probeStartTime);
  }, [showingProbe, recordResponse, verbalReflection, probeStartTime]);

  const startVerbalReflection = async () => {
    try {
      await transcribe.start();
      setListeningReflection(true);
    } catch { /* silent */ }
  };

  const stopVerbalReflection = async () => {
    setListeningReflection(false);
    const r = await transcribe.stop().catch(() => null);
    if (r?.transcript) {
      setVerbalReflection(r.transcript.trim().slice(0, 200));
    }
  };

  const finish = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (probeTimerRef.current) clearTimeout(probeTimerRef.current);
    if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
    transcribe.cancel();
    sd.stopBed();
    stopVoice();

    const durationMs = Date.now() - sessionStartRef.current;
    const onTask = probes.filter(p => p.response === "on-task").length;
    const wandering = probes.filter(p => p.response === "wandering").length;
    const unaware = probes.filter(p => p.response === "unaware").length;
    const total = probes.length;

    const avgResponseTime = total > 0
      ? probes.reduce((s, p) => s + p.responseTime, 0) / total
      : 0;
    const consistency = total > 0
      ? probes.reduce((s, p, i) => {
          if (i === 0) return s;
          return s + (p.response === probes[i-1].response ? 1 : 0);
        }, 0) / (total - 1)
      : 0;

    onEnd({
      outcome: "completed",
      signals: {
        duration_ms: durationMs,
        total_probes: NUM_PROBES,
        completed_probes: total,
        missed_probes: missedProbesRef.current,
        on_task: onTask,
        wandering: wandering,
        unaware: unaware,
        on_task_ratio: total > 0 ? +(onTask / total).toFixed(3) : 0,
        wandering_ratio: total > 0 ? +(wandering / total).toFixed(3) : 0,
        avg_response_time_ms: Math.round(avgResponseTime),
        consistency_index: +(consistency).toFixed(3),
        probes: probes,
        mic_ready: breath.ready,
        cycles_detected: breath.cycles,
        sighs_detected: breath.sighs,
      },
    });
  }, [onEnd, probes, breath, stopVoice, sd]);

  const elapsed = Date.now() - sessionStartRef.current;
  const progress = Math.min(1, elapsed / TOTAL_DURATION);

  // Auto-end safety
  useEffect(() => {
    if (phase !== "probe" && phase !== "reflect" && phase !== "integrate") return;
    const timer = setTimeout(() => { if (!endedRef.current) finish(); }, TOTAL_DURATION + 30000);
    return () => clearTimeout(timer);
  }, [phase, finish]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Cinematic backdrop */}
      <motion.div
        animate={{ opacity: [0.04, 0.12, 0.04], y: [0, -12, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-black to-indigo-950/20 pointer-events-none"
      />
      {/* Aurora — violet/indigo */}
      <motion.div
        animate={{ opacity: [0.03, 0.1, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-br from-violet-400/15 via-transparent to-indigo-500/10 pointer-events-none mix-blend-screen"
      />
      {/* Aurora — rose offset */}
      <motion.div
        animate={{ opacity: [0.02, 0.08, 0.02], scale: [1, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute inset-0 bg-gradient-to-t from-rose-500/10 via-transparent to-transparent pointer-events-none mix-blend-screen"
      />
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top status bar */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-violet-300/80 shadow-[0_0_10px_rgba(196,181,253,0.6)]"
          />
          <span className="text-[10px] uppercase tracking-[0.5em] text-violet-200/70 font-light" style={SERIF}>
            the 30-second mind
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {breath.ready ? <Mic className="w-3.5 h-3.5 text-violet-300/70" /> : <MicOff className="w-3.5 h-3.5 text-white/20" />}
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{breath.ready ? "mic" : "no mic"}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/40">
            probe {Math.min(probeIndex + 1, NUM_PROBES)} / {NUM_PROBES}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-400 via-indigo-400 to-rose-400"
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
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-violet-400/30 to-indigo-500/10 blur-xl"
              />
              <p className="text-sm text-white/40 max-w-md mx-auto tracking-[0.1em] font-light">the mind will wander. the practice is noticing.</p>
            </motion.div>
          )}

          {phase === "probe" && (
            <motion.div key="probe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl space-y-10">
              {/* Probe counter */}
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/30 mb-4">
                  probe {probeIndex + 1} of {NUM_PROBES}
                </p>
                <div className="flex justify-center gap-1.5">
                  {Array.from({ length: NUM_PROBES }).map((_, i) => (
                    <motion.span
                      key={i}
                      animate={i === probeIndex && showingProbe ? { opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] } : {}}
                      transition={i === probeIndex && showingProbe ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
                      className={`block h-1.5 rounded-full transition-all duration-700 ${
                        i < probeIndex ? "w-6 bg-violet-300/90 shadow-[0_0_8px_rgba(196,181,253,0.5)]" :
                        i === probeIndex ? "w-6 bg-violet-300/60" :
                        "w-2 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {showingProbe && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center space-y-8 pointer-events-auto"
                >
                  <motion.p
                    key={probeIndex}
                    initial={{ opacity: 0, letterSpacing: "0.1em" }}
                    animate={{ opacity: 0.95, letterSpacing: "0.35em" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-xl uppercase text-violet-200/90 font-extralight"
                    style={{ textShadow: "0 0 24px rgba(196,181,253,0.4)", ...SERIF }}
                  >
                    where was your attention just now?
                  </motion.p>

                  {/* Response buttons */}
                  <div className="flex justify-center gap-4">
                    <motion.button
                      onClick={() => handleResponse("on-task")}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 rounded-xl border-2 border-violet-400/60 bg-violet-500/10 text-violet-100 font-medium text-base uppercase tracking-wide hover:bg-violet-500/20 hover:border-violet-300 transition-all shadow-[0_0_20px_rgba(196,181,253,0.2)]"
                    >
                      <p className="text-sm">on task</p>
                      <p className="text-[10px] text-violet-300/60 mt-1">key 1</p>
                    </motion.button>
                    <motion.button
                      onClick={() => handleResponse("wandering")}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 rounded-xl border-2 border-amber-400/60 bg-amber-500/10 text-amber-100 font-medium text-base uppercase tracking-wide hover:bg-amber-500/20 hover:border-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                    >
                      <p className="text-sm">wandering</p>
                      <p className="text-[10px] text-amber-300/60 mt-1">key 2</p>
                    </motion.button>
                    <motion.button
                      onClick={() => handleResponse("unaware")}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white/60 font-medium text-base uppercase tracking-wide hover:bg-white/10 hover:border-white/30 hover:text-white/80 transition-all"
                    >
                      <p className="text-sm">unaware</p>
                      <p className="text-[10px] text-white/30 mt-1">key 3</p>
                    </motion.button>
                  </div>

                  {/* Optional verbal reflection */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pointer-events-auto overflow-hidden"
                  >
                    {verbalReflection ? (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg italic text-violet-100/90 max-w-md mx-auto"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 0 16px rgba(196,181,253,0.3)" }}
                      >
                        "{verbalReflection}"
                      </motion.p>
                    ) : (
                      <button
                        onClick={startVerbalReflection}
                        className="px-5 py-2 rounded-full border border-white/20 text-white/50 text-[10px] uppercase tracking-[0.3em] hover:border-violet-300/50 hover:text-violet-200 hover:bg-violet-500/10 transition-all"
                      >
                        speak a note (optional)
                      </button>
                    )}
                  </motion.div>

                  {/* Response timer */}
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: PROBE_WINDOW, ease: "linear" }}
                    className="h-0.5 bg-gradient-to-r from-violet-400 to-amber-400 rounded-full overflow-hidden"
                  />
                </motion.div>
              )}

              {!showingProbe && probeIndex > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="text-center text-[11px] text-white/40 italic"
                  style={SERIF}
                >
                  waiting for next probe…
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "reflect" && (
            <motion.div key="reflect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center space-y-8 pointer-events-auto max-w-xl">
              <p className="text-3xl font-extralight text-white/95 tracking-[0.02em]" style={SERIF}>calibration complete</p>

              <div className="flex justify-center gap-6 text-center">
                <div>
                  <p className="text-4xl font-extralight text-violet-300 tabular-nums">{probes.filter(p => p.response === "on-task").length}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">on task</p>
                </div>
                <div>
                  <p className="text-4xl font-extralight text-amber-300 tabular-nums">{probes.filter(p => p.response === "wandering").length}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">wandering</p>
                </div>
                <div>
                  <p className="text-4xl font-extralight text-white/40 tabular-nums">{probes.filter(p => p.response === "unaware").length}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-1">unaware</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">presence index</p>
                <p className="text-5xl font-extralight text-violet-200 tabular-nums" style={SERIF}>
                  {probes.length > 0 ? Math.round((probes.filter(p => p.response === "on-task").length / probes.length) * 100) : 0}%
                </p>
                <p className="text-sm text-white/50 italic" style={SERIF}>
                  {probes.length > 0
                    ? `you were present ${Math.round((probes.filter(p => p.response === "on-task").length / probes.length) * 100)}% of the probes. the mind wanders — the practice is returning.`
                    : "no probes completed. the practice begins again."}
                </p>
              </motion.div>

              {/* Verbal reflections summary */}
              {probes.some(p => p.verbalReflection) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto text-left"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">your notes</p>
                  <div className="space-y-2">
                    {probes.filter(p => p.verbalReflection).map((p, i) => (
                      <motion.p
                        key={p.index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="text-sm italic text-white/70 border-l-2 border-violet-400/40 pl-3"
                        style={SERIF}
                      >
                        "{p.verbalReflection}"
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "integrate" && (
            <motion.div key="integrate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
              <p className="text-2xl font-extralight text-white/90 tracking-[0.05em]" style={SERIF}>rest</p>
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-500/10 blur-xl"
              />
              <p className="text-white/50 italic max-w-md mx-auto" style={SERIF}>
                the calibration is not the number. it is the honesty. carry this forward.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/20">
        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">1</kbd>
        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">2</kbd>
        <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10">3</kbd>
      </div>

      {/* Safety exit */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-violet-200/70 transition-all duration-500"
      >
        complete →
      </button>
    </div>
  );
}

export default function The30SecondMind() {
  const g = getLabGame("the-30-second-mind")!;
  const meta = labToMeta(g);
  return (
    <ConsciousGameShell game={meta}>
      {({ onEnd }) => <PlayLayer onEnd={onEnd} />}
    </ConsciousGameShell>
  );
}