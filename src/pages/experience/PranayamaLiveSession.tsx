/**
 * PranayamaLiveSession
 * ────────────────────
 * World-class live Nadi Shodhana (alternate-nostril) session.
 * Indigo-cyan visual — a luminous orb that visibly inhales, holds,
 * exhales, holds on a 4·4·4·4 box rhythm. Patanjali lineage voicing.
 *
 * Structure: arrival → calibration → 9 rounds of nadi shodhana
 * → kumbhaka taste → silence → return. ~10 min.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, Volume2, VolumeX, ChevronRight, X } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { useStepNarration } from "@/hooks/useStepNarration";
import heroImg from "@/assets/pranayama-hero.jpg";

type BreathPhase = "in" | "holdIn" | "out" | "holdOut";
type Step = {
  title: string;
  line: string;
  seconds: number;
  /** If true, the orb pulses on a 4·4·4·4 box rhythm during this step. */
  breathing?: boolean;
};

// 4 seconds per phase = 16s per round. The user follows the orb.
const PHASE_MS = 4000;

const STEPS: Step[] = [
  { title: "Arrive",            line: "Sit upright. Spine tall, shoulders soft. Rest the left hand on the knee. Bring the right hand to the face — thumb resting near the right nostril, ring finger near the left.", seconds: 22 },
  { title: "Feel the natural breath", line: "Before changing anything, feel the breath as it already is. Cool on the in-breath, warm on the out-breath. Two slow breaths, only to arrive.", seconds: 20 },
  { title: "Calibrate the rhythm", line: "We will breathe to a count of four. Inhale four, hold four, exhale four, hold four. Follow the orb. It will breathe with you.", seconds: 18, breathing: true },
  { title: "Round 1 — close the right", line: "Gently close the right nostril with the thumb. Inhale slowly through the left.", seconds: 16, breathing: true },
  { title: "Round 2 — switch", line: "Close the left with the ring finger, release the right. Exhale fully through the right. Then inhale through the right.", seconds: 16, breathing: true },
  { title: "Round 3 — switch back", line: "Close the right. Release the left. Exhale through the left. Then inhale through the left.", seconds: 16, breathing: true },
  { title: "Round 4", line: "Continue. The hand becomes the metronome. Smooth. Even. No strain.", seconds: 16, breathing: true },
  { title: "Round 5", line: "Notice the breath is becoming finer. The pause at the top is softening. Stay there a moment longer if it comes naturally.", seconds: 16, breathing: true },
  { title: "Round 6", line: "The two nostrils are two rivers — iḍā and piṅgalā. We are letting them meet in the middle. Susumna.", seconds: 16, breathing: true },
  { title: "Round 7", line: "Continue. Slower if you can. The slower the breath, the slower the mind.", seconds: 16, breathing: true },
  { title: "Round 8", line: "The body is quieter. The hand still guides, but the breath is doing itself now.", seconds: 16, breathing: true },
  { title: "Round 9 — final", line: "One last round. End on an exhale through the left. Then lower the hand.", seconds: 16, breathing: true },
  { title: "Taste the pause", line: "Hands now rest on the knees. Breathe naturally — but notice the small pause between out-breath and in-breath. That pause is what Patanjali called kevala kumbhaka. Just notice it.", seconds: 32 },
  { title: "Silence", line: "Sit. The pranic body is now bright. There is nothing more to do. Let the breath breathe you.", seconds: 36 },
  { title: "Return", line: "Slowly let the eyes open. The breath you take into the rest of your day is not the breath you came in with.", seconds: 22 },
];

const PranayamaLiveSession = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<BreathPhase>("in");
  const tickRef = useRef<number | null>(null);

  const step = STEPS[stepIdx];
  const totalSeconds = useMemo(() => STEPS.reduce((s, x) => s + x.seconds, 0), []);

  useStepNarration({
    text: started && !paused ? step.line : null,
    guruId: "patanjali",
    enabled: started && !muted,
  });

  // Step timer
  useEffect(() => {
    if (!started || paused) return;
    setElapsed(0);
    const start = performance.now();
    const tick = () => {
      const s = Math.floor((performance.now() - start) / 1000);
      setElapsed(s);
      if (s >= step.seconds) {
        if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
        else setStarted(false);
        return;
      }
      tickRef.current = window.setTimeout(tick, 200);
    };
    tickRef.current = window.setTimeout(tick, 200);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [started, paused, stepIdx, step.seconds]);

  // Breath-phase cycler (in → holdIn → out → holdOut → in …)
  useEffect(() => {
    if (!started || paused) return;
    setPhase("in");
    const order: BreathPhase[] = ["in", "holdIn", "out", "holdOut"];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setPhase(order[i]);
    }, PHASE_MS);
    return () => window.clearInterval(id);
  }, [started, paused, stepIdx]);

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
    else setStarted(false);
  };

  const exit = () => navigate("/experience/pranayama");

  // Visual scale + label for current breath phase
  const orbScale = phase === "in" ? 1.25 : phase === "out" ? 0.85 : phase === "holdIn" ? 1.25 : 0.85;
  const phaseLabel =
    phase === "in" ? "inhale" :
    phase === "out" ? "exhale" :
    phase === "holdIn" ? "hold full" : "hold empty";

  return (
    <>
      <Seo
        title="Nāḍī Śodhana — a live guided pranayama session"
        description="A free, voice-guided alternate-nostril breath session. Nine rounds on a 4·4·4·4 rhythm. The orb breathes with you. Around ten minutes."
        canonicalPath="/experience/pranayama/session"
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover opacity-70"
            style={{ filter: started ? "blur(6px) saturate(0.9)" : "blur(0px)" }}
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
              <div className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/80 mb-4">Prāṇāyāma · Nāḍī Śodhana</div>
              <div className="text-3xl md:text-5xl text-cyan-200/80 mb-3" style={{ fontFamily: "serif" }}>नाडी शोधन</div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">Channel-clearing breath.</h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed">
                Nine rounds on a four-count rhythm. The orb will breathe with you — inhale, hold,
                exhale, hold. Around ten minutes. Headphones recommended. Sit somewhere undisturbed.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3">
                <button onClick={() => setStarted(true)} className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-cyan-300/90 text-black font-medium hover:bg-cyan-200 transition shadow-[0_0_60px_-10px_rgba(103,232,249,0.6)]">
                  Begin the breath <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>
                <button onClick={() => { setMuted(true); setStarted(true); }} className="text-xs text-white/55 hover:text-white/80 transition">
                  or sit in silence (no voice)
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-xl flex flex-col items-center text-center">
              {/* Breathing orb — scales with phase on 4s glide */}
              <div className="relative w-52 h-52 md:w-64 md:h-64 mb-8">
                <motion.div
                  className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl"
                  animate={{ scale: orbScale }}
                  transition={{ duration: PHASE_MS / 1000, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-200/40 via-indigo-400/25 to-purple-700/20 border border-cyan-200/40"
                  animate={{ scale: orbScale }}
                  transition={{ duration: PHASE_MS / 1000, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-14 rounded-full bg-white/40 blur-md"
                  animate={{ scale: orbScale, opacity: phase === "in" || phase === "holdIn" ? 0.7 : 0.4 }}
                  transition={{ duration: PHASE_MS / 1000, ease: "easeInOut" }}
                />
                {step.breathing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.span
                      key={phase}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] uppercase tracking-[0.35em] text-cyan-100/90"
                    >
                      {phaseLabel}
                    </motion.span>
                  </div>
                )}
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
                  <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-200/70 mb-3">
                    Step {stepIdx + 1} of {STEPS.length} · {step.title}
                  </div>
                  <p className="text-lg md:text-xl font-light leading-relaxed text-white/95">{step.line}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={stepIdx}
                  className="h-full bg-cyan-300/70"
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
                <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/80 mb-3">Breath complete</div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">Prāṇa is the bridge between body and mind.</h2>
                <p className="mt-4 text-white/70">Patanjali placed pranayama exactly between the body and the inner limbs. Now you know why.</p>
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button onClick={() => { setStepIdx(0); setStarted(true); }} className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm">
                    Sit again
                  </button>
                  <button onClick={() => navigate("/auth")} className="px-5 py-2.5 rounded-full bg-cyan-300 text-black font-medium hover:bg-cyan-200 transition text-sm">
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
              <motion.div className="h-full bg-cyan-200/60" animate={{ width: `${((stepIdx + elapsed / step.seconds) / STEPS.length) * 100}%` }} transition={{ duration: 0.2, ease: "linear" }} />
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

export default PranayamaLiveSession;
