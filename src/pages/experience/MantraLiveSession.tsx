/**
 * MantraLiveSession
 * ─────────────────
 * World-class live Mantra Japa session. So'ham — the natural mantra of
 * the breath. Saffron-gold visual; a slowly turning circle of 108 dots
 * (the mala) advances one bead per breath. Krishna voice.
 *
 * Structure: arrival → mantra introduction → 27 breaths (quarter mala)
 * → silence → return. ~9 min.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, Volume2, VolumeX, ChevronRight, X } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { useStepNarration } from "@/hooks/useStepNarration";
import heroImg from "@/assets/mantra-hero.jpg";

type Step = {
  title: string;
  line: string;
  seconds: number;
  /** Number of bead-breaths advanced during this step (visual mala). */
  beads?: number;
};

const TOTAL_BEADS = 108;

const STEPS: Step[] = [
  { title: "Arrive",               line: "Sit upright. Hands resting easily. Eyes closed. Feel the seat, the spine, the small weight of the head. There is nowhere else to be.", seconds: 22 },
  { title: "The natural mantra",   line: "Every breath you have ever taken has carried a mantra. On the in-breath: so. On the out-breath: hum. So-hum. It means: I am That. The breath is saying it whether you listen or not.", seconds: 28 },
  { title: "Listen first",         line: "For three breaths, do not say anything. Just listen. So on the in. Hum on the out. The breath is the teacher.", seconds: 24 },
  { title: "Join silently",        line: "Now begin to silently match the breath with the syllables. Inhale: so. Exhale: hum. Soft, inside the chest. No effort.", seconds: 20 },
  { title: "First quarter — 27 beads", line: "We will turn one round of a quarter mala — twenty-seven breaths. The dots will move with you. So… hum…", seconds: 168, beads: 27 },
  { title: "Let the mantra carry you", line: "Now stop counting. Stop trying. Let so-hum become as automatic as the breath itself. If the mind wanders, return — softly — to so. Then hum.", seconds: 60 },
  { title: "Silence between",       line: "Notice the small space between so and hum, between hum and so. The mantra is in the syllables. The teaching is in the silence between them.", seconds: 40 },
  { title: "Rest as That",          line: "So-hum. I am That. Not the small I — the vast I. Rest as that. The mantra has done its work.", seconds: 30 },
  { title: "Return",                line: "Slowly let the syllables fade. Let the breath alone remain. When you are ready, open the eyes. The mantra goes with you, breath by breath.", seconds: 22 },
];

const MantraLiveSession = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [beadCount, setBeadCount] = useState(0);
  const tickRef = useRef<number | null>(null);

  const step = STEPS[stepIdx];
  const totalSeconds = useMemo(() => STEPS.reduce((s, x) => s + x.seconds, 0), []);

  useStepNarration({
    text: started && !paused ? step.line : null,
    guruId: "krishna",
    enabled: started && !muted,
  });

  // Step timer + bead advancer (one bead per ~6s breath when step.beads set)
  useEffect(() => {
    if (!started || paused) return;
    setElapsed(0);
    if (!step.beads) setBeadCount(0);
    const start = performance.now();
    const beadInterval = step.beads ? step.seconds / step.beads : 0;
    const tick = () => {
      const s = (performance.now() - start) / 1000;
      setElapsed(Math.floor(s));
      if (step.beads) {
        setBeadCount(Math.min(step.beads, Math.floor(s / beadInterval)));
      }
      if (s >= step.seconds) {
        if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
        else setStarted(false);
        return;
      }
      tickRef.current = window.setTimeout(tick, 200);
    };
    tickRef.current = window.setTimeout(tick, 200);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [started, paused, stepIdx, step.seconds, step.beads]);

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
    else setStarted(false);
  };

  const exit = () => navigate("/experience/practices");

  // Render 108 dots in a circle; first `beadCount` lit (out of step.beads).
  const beads = useMemo(() => Array.from({ length: TOTAL_BEADS }, (_, i) => i), []);

  return (
    <>
      <Seo
        title="So'ham — a live guided mantra japa session"
        description="A free, voice-guided sitting with the natural mantra of the breath. A quarter-mala — twenty-seven breaths — plus silence. Around nine minutes."
        canonicalPath="/experience/mantra/session"
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover opacity-70"
            style={{ filter: started ? "blur(5px) saturate(0.9)" : "blur(0px)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/90" />
        </div>

        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4">
          <button onClick={exit} className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {started && (
            <div className="flex items-center gap-2">
              <button onClick={() => setMuted((m) => !m)} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition" aria-label={muted ? "Unmute" : "Mute"}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setPaused((p) => !p)} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition" aria-label={paused ? "Resume" : "Pause"}>
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button onClick={exit} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition" aria-label="End">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
          {!started && stepIdx === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-xl text-center">
              <div className="text-[11px] uppercase tracking-[0.35em] text-orange-200/80 mb-4">Mantra Japa · So'ham</div>
              <div className="text-3xl md:text-5xl text-orange-200/80 mb-3" style={{ fontFamily: "serif" }}>सोऽहम्</div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">I am That.</h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed">
                A quarter-mala — twenty-seven breaths — with the natural mantra of the breath itself.
                The dots will turn with you. Around nine minutes. Headphones recommended.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3">
                <button onClick={() => setStarted(true)} className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-orange-300/90 text-black font-medium hover:bg-orange-200 transition shadow-[0_0_60px_-10px_rgba(253,186,116,0.6)]">
                  Begin the japa <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>
                <button onClick={() => { setMuted(true); setStarted(true); }} className="text-xs text-white/55 hover:text-white/80 transition">
                  or sit in silence (no voice)
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-xl flex flex-col items-center text-center">
              {/* Mala — 108 dots in a ring, lit as beads advance */}
              <div className="relative w-56 h-56 md:w-64 md:h-64 mb-8">
                <div className="absolute inset-0 rounded-full bg-orange-400/15 blur-3xl" />
                <svg viewBox="-110 -110 220 220" className="absolute inset-0 w-full h-full">
                  {beads.map((i) => {
                    const angle = (i / TOTAL_BEADS) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * 95;
                    const y = Math.sin(angle) * 95;
                    const targetTotal = step.beads ?? 0;
                    const litRatio = targetTotal ? (i / TOTAL_BEADS) * targetTotal : 0;
                    const lit = step.beads ? litRatio < beadCount : false;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={i === 0 ? 3.5 : 1.8}
                        fill={lit ? "rgba(253, 186, 116, 0.95)" : "rgba(255, 255, 255, 0.18)"}
                        style={{ transition: "fill 600ms ease" }}
                      />
                    );
                  })}
                </svg>
                {/* Center mantra label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <motion.span
                    className="text-3xl md:text-4xl text-orange-100/90 font-light"
                    style={{ fontFamily: "serif" }}
                    animate={step.beads ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.85 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    so'ham
                  </motion.span>
                  {step.beads ? (
                    <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-orange-200/70">
                      {beadCount} / {step.beads}
                    </span>
                  ) : null}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.9 }}
                  className="min-h-[130px]"
                >
                  <div className="text-[10px] uppercase tracking-[0.35em] text-orange-200/70 mb-3">
                    Step {stepIdx + 1} of {STEPS.length} · {step.title}
                  </div>
                  <p className="text-lg md:text-xl font-light leading-relaxed text-white/95">{step.line}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={stepIdx}
                  className="h-full bg-orange-300/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (elapsed / step.seconds) * 100)}%` }}
                  transition={{ duration: 0.2, ease: "linear" }}
                />
              </div>

              <button onClick={next} className="mt-6 text-xs text-white/55 hover:text-white/85 transition inline-flex items-center gap-1">
                Next step <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {!started && stepIdx === STEPS.length - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center px-6">
              <div className="max-w-md text-center">
                <div className="text-[11px] uppercase tracking-[0.3em] text-orange-200/80 mb-3">Japa complete</div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">The mantra is the breath. The breath is you.</h2>
                <p className="mt-4 text-white/70">So'ham was always being said. Today you only listened more carefully. Carry it under everything you do.</p>
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button onClick={() => { setStepIdx(0); setStarted(true); }} className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm">
                    Sit again
                  </button>
                  <button onClick={() => navigate("/auth")} className="px-5 py-2.5 rounded-full bg-orange-300 text-black font-medium hover:bg-orange-200 transition text-sm">
                    Go deeper inside →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {started && (
          <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5">
            <div className="max-w-xl mx-auto h-[1px] bg-white/10 overflow-hidden">
              <motion.div className="h-full bg-orange-200/60" animate={{ width: `${((stepIdx + elapsed / step.seconds) / STEPS.length) * 100}%` }} transition={{ duration: 0.2, ease: "linear" }} />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">
              about {Math.round(totalSeconds / 60)} minutes total
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default MantraLiveSession;
