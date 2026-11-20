/**
 * SelfInquiryLiveSession
 * ──────────────────────
 * World-class live "Who am I?" sitting in the Ramana lineage.
 * Crimson-gold visual language. Slow, spacious pacing — long silences
 * after each question are the practice.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, Volume2, VolumeX, ChevronRight, X } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { useStepNarration } from "@/hooks/useStepNarration";
import heroImg from "@/assets/self-inquiry-hero.jpg";

type Step = { title: string; line: string; seconds: number };

// Ramana's method: ask the question, then sink into the silence that follows.
// Pacing is slow. The question is short; the gap is long.
const STEPS: Step[] = [
  { title: "Arrive", line: "Sit. Close the eyes, or let them rest on a single point. There is nowhere else to be.", seconds: 18 },
  { title: "Notice the I-feeling", line: "Notice the simple sense of being here. The feeling: I am. Do not name it. Just feel it.", seconds: 24 },
  { title: "Ask the question", line: "Now ask, gently, from inside the chest: Who am I?", seconds: 22 },
  { title: "Rest in the silence", line: "Do not search for an answer. Rest in the silence the question opens.", seconds: 30 },
  { title: "Trace the thought back", line: "When a thought arises, ask: to whom does this thought come? It comes to me. Then: who is this me?", seconds: 28 },
  { title: "Follow the I home", line: "Follow the I-thought back to its source, the way a river is traced back to its spring.", seconds: 28 },
  { title: "Ask again, softly", line: "Ask once more: Who am I? Let the question dissolve into what it points to.", seconds: 24 },
  { title: "The questioner disappears", line: "There comes a moment when the one asking and the one being asked are seen to be the same. Rest there.", seconds: 30 },
  { title: "Stay as that", line: "Stay as the silent I. Not the I of name and history. The I that was here before any of that.", seconds: 26 },
  { title: "Close", line: "When you are ready, open the eyes slowly. Carry this silent I into your day. It does not leave when you stand up.", seconds: 20 },
];

const SelfInquiryLiveSession = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  const step = STEPS[stepIdx];
  const totalSeconds = useMemo(() => STEPS.reduce((s, x) => s + x.seconds, 0), []);

  useStepNarration({
    text: started && !paused ? step.line : null,
    guruId: "ramana",
    enabled: started && !muted,
  });

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
      tickRef.current = window.setTimeout(tick, 250);
    };
    tickRef.current = window.setTimeout(tick, 250);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [started, paused, stepIdx, step.seconds]);

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
    else setStarted(false);
  };

  const exit = () => navigate("/experience/self-inquiry");

  return (
    <>
      <Seo
        title="Who am I? — a live guided session in Ramana's self-inquiry"
        description="A free, voice-guided session in ātma-vichāra. Ten slow steps. Around nine minutes. The shortest and most direct path."
        canonicalPath="/experience/self-inquiry/session"
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover opacity-75"
            style={{ filter: started ? "blur(3px) saturate(0.95)" : "blur(0px)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/85" />
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
              <div className="text-[11px] uppercase tracking-[0.35em] text-amber-200/80 mb-4">Ātma Vichāra · Ramana</div>
              <div className="text-3xl md:text-5xl text-amber-200/80 mb-3" style={{ fontFamily: "serif" }}>कोऽहम्</div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">Who am I?</h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed">
                Ten slow steps. Around nine minutes. Long silences between the words — that is the practice.
                Headphones recommended. Sit somewhere undisturbed.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3">
                <button onClick={() => setStarted(true)} className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-400/90 text-black font-medium hover:bg-amber-300 transition shadow-[0_0_60px_-10px_rgba(251,191,36,0.6)]">
                  Begin the inquiry <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>
                <button onClick={() => { setMuted(true); setStarted(true); }} className="text-xs text-white/55 hover:text-white/80 transition">
                  or sit in silence (no voice)
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-xl flex flex-col items-center text-center">
              {/* Inquiry flame — slow pulsing crimson-gold */}
              <motion.div
                className="relative w-44 h-44 md:w-56 md:h-56 mb-10"
                animate={paused ? { scale: 1 } : { scale: [1, 1.08, 1], rotate: [0, 1, -1, 0] }}
                transition={paused ? {} : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full bg-rose-500/15 blur-3xl" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-amber-300/50 via-orange-500/30 to-rose-700/20 border border-amber-300/40" />
                <div className="absolute inset-14 rounded-full bg-amber-100/50 blur-md" />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 1 }}
                  className="min-h-[140px]"
                >
                  <div className="text-[10px] uppercase tracking-[0.35em] text-amber-200/70 mb-3">
                    Step {stepIdx + 1} of {STEPS.length} · {step.title}
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-white/95">{step.line}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={stepIdx}
                  className="h-full bg-amber-300/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (elapsed / step.seconds) * 100)}%` }}
                  transition={{ duration: 0.25, ease: "linear" }}
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
                <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/80 mb-3">Inquiry complete</div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">The one who was asking was the answer.</h2>
                <p className="mt-4 text-white/70">Ramana sat with this question for fifty years. There is no rush. Return whenever the world feels too loud.</p>
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button onClick={() => { setStepIdx(0); setStarted(true); }} className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm">
                    Sit again
                  </button>
                  <button onClick={() => navigate("/auth")} className="px-5 py-2.5 rounded-full bg-amber-400 text-black font-medium hover:bg-amber-300 transition text-sm">
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
              <motion.div className="h-full bg-amber-200/60" animate={{ width: `${((stepIdx + elapsed / step.seconds) / STEPS.length) * 100}%` }} transition={{ duration: 0.25, ease: "linear" }} />
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

export default SelfInquiryLiveSession;
