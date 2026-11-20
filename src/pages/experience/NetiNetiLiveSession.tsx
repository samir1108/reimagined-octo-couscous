/**
 * NetiNetiLiveSession
 * ───────────────────
 * World-class live "Neti Neti" sitting in Shankara's via negativa.
 * Emerald-gold visual language — a slowly dissolving mirror.
 * Each step strips one layer of false identification.
 * Long, deliberate pauses; the negation does its work in silence.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, Volume2, VolumeX, ChevronRight, X } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { useStepNarration } from "@/hooks/useStepNarration";
import heroImg from "@/assets/neti-neti-hero.jpg";

type Step = { title: string; line: string; seconds: number };

// Shankara's classical sequence: refuse every layer until what cannot be
// refused remains. Pacing is slower than Self-Inquiry — each negation needs
// room to land in the body.
const STEPS: Step[] = [
  { title: "Arrive",                line: "Sit upright. Eyes closed, or softly lowered. Tonight we hold the sword of viveka — discrimination. To each false self we will say: neti. Not this.", seconds: 22 },
  { title: "Three gathering breaths", line: "Three slow breaths, only to gather. The mind likes to wander. Give it a sword to hold, and it sharpens.", seconds: 24 },
  { title: "Neti — not the body",   line: "Feel the body. Its weight. Its temperature. Its small movements with the breath. It is changing every moment. You witness it. Neti. I am not this body. The body is in me. I am not in it.", seconds: 34 },
  { title: "Neti — not the breath", line: "Notice the breath rise and fall. You witness the breathing, you do not produce it. Neti. I am not this breath. Breath is in me. I am not in it.", seconds: 30 },
  { title: "Neti — not the emotions", line: "Notice the feeling tone present right now. Calm, restless, heavy, light — whatever it is, it has shape and edge. You witness it. Neti. I am not these feelings. Feelings pass through me. They are not me.", seconds: 32 },
  { title: "Neti — not the thoughts", line: "Notice the thoughts arising. Each one is a small object in the field of awareness. It appears, lingers, dissolves. You witness them. Neti. I am not these thoughts. Thoughts are guests. I am the room.", seconds: 32 },
  { title: "Neti — even the witness", line: "Now the subtlest stroke. Even the sense of being a witness — a someone who is watching all this — that too is an idea, a slight tightening. Neti. Even to that.", seconds: 30 },
  { title: "What cannot be denied", line: "What is left, when even the witness-idea is laid down? Not nothing. Pure, undivided knowing. That you cannot deny. Rest here.", seconds: 40 },
  { title: "Sat–Chit–Ānanda",       line: "Shankara called it sat-chit-ananda. Being. Awareness. Fullness. You do not have to produce it. It has been here, behind every neti, the whole time.", seconds: 32 },
  { title: "Return",                line: "Slowly let the room return. The breath, the seat, the sounds. But now you know — all of this is in you. Not the other way around.", seconds: 24 },
];

const NetiNetiLiveSession = () => {
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
    guruId: "shankara",
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

  const exit = () => navigate("/experience/neti-neti");

  return (
    <>
      <Seo
        title="Neti Neti — a live guided session in Shankara's via negativa"
        description="A free, voice-guided sitting in the Upanishadic 'not this, not this'. Ten steps. Around nine minutes. Strip away every false self until what cannot be stripped remains."
        canonicalPath="/experience/neti-neti/session"
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover opacity-75"
            style={{ filter: started ? "blur(4px) saturate(0.9)" : "blur(0px)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
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
              <div className="text-[11px] uppercase tracking-[0.35em] text-emerald-200/80 mb-4">Via Negativa · Shankara</div>
              <div className="text-3xl md:text-5xl text-emerald-200/80 mb-3" style={{ fontFamily: "serif" }}>नेति नेति</div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">Not this, not this.</h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed">
                Ten slow negations. Around nine minutes. The sword of viveka is placed in your hand —
                refuse every false self until what cannot be refused remains. Headphones recommended.
              </p>
              <div className="mt-10 flex flex-col items-center gap-3">
                <button onClick={() => setStarted(true)} className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-300/90 text-black font-medium hover:bg-emerald-200 transition shadow-[0_0_60px_-10px_rgba(110,231,183,0.6)]">
                  Begin the negation <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>
                <button onClick={() => { setMuted(true); setStarted(true); }} className="text-xs text-white/55 hover:text-white/80 transition">
                  or sit in silence (no voice)
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full max-w-xl flex flex-col items-center text-center">
              {/* Dissolving mirror — emerald smoke rising over bronze disc */}
              <motion.div
                className="relative w-44 h-44 md:w-56 md:h-56 mb-10"
                animate={paused ? { scale: 1, opacity: 0.85 } : { scale: [1, 1.04, 0.98, 1], opacity: [0.95, 0.7, 0.95] }}
                transition={paused ? {} : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full bg-emerald-400/15 blur-3xl" />
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-amber-200/35 via-emerald-500/20 to-emerald-900/30 border border-emerald-200/30" />
                <motion.div
                  className="absolute inset-12 rounded-full bg-emerald-100/15 blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                />
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
                  <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-200/70 mb-3">
                    Step {stepIdx + 1} of {STEPS.length} · {step.title}
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-white/95">{step.line}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={stepIdx}
                  className="h-full bg-emerald-300/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (elapsed / step.seconds) * 100)}%` }}
                  transition={{ duration: 0.25, ease: "linear" }}
                />
              </div>

              <button onClick={next} className="mt-6 text-xs text-white/55 hover:text-white/85 transition inline-flex items-center gap-1">
                Next negation <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {!started && stepIdx === STEPS.length - 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center px-6">
              <div className="max-w-md text-center">
                <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/80 mb-3">Negation complete</div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">Brahma satyam, jagan mithyā.</h2>
                <p className="mt-4 text-white/70">Reality is one; the world is appearance; you are not other than that One. The negation was the path. The affirmation lives in the silence after every word.</p>
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button onClick={() => { setStepIdx(0); setStarted(true); }} className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm">
                    Sit again
                  </button>
                  <button onClick={() => navigate("/auth")} className="px-5 py-2.5 rounded-full bg-emerald-300 text-black font-medium hover:bg-emerald-200 transition text-sm">
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
              <motion.div className="h-full bg-emerald-200/60" animate={{ width: `${((stepIdx + elapsed / step.seconds) / STEPS.length) * 100}%` }} transition={{ duration: 0.25, ease: "linear" }} />
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

export default NetiNetiLiveSession;
