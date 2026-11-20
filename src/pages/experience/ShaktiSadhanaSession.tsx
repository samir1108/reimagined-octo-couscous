import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Pause, Play, Sparkles, Volume2, VolumeX, X, CheckCircle2 } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { getPathBySlug } from "@/data/experiencePaths";
import { supabase } from "@/lib/supabase";

type Scene = {
  title: string;
  subtitle: string;
  body: string;
  breath: "in" | "hold" | "out" | "still";
  seconds: number;
};

function buildScenes(path: ReturnType<typeof getPathBySlug>, lvl: { level: number; title: string; teaching: string; practices: string[]; promise: string; durationDays: number }): Scene[] {
  const lines = lvl.teaching.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const practiceLines = lvl.practices.flatMap(p => p.split(/\n+/)).map(l => l.trim()).filter(Boolean);

  const scenes: Scene[] = [
    {
      title: "Arrive",
      subtitle: `${path.name} · Level ${lvl.level} of ${path.levels.length} · with ${path.guru}`,
      body: `Welcome. Today, with ${path.guru}, you touch level ${lvl.level} of ${path.name}: ${lvl.title}. Soften the eyes. There is nowhere to be but here.`,
      breath: "still",
      seconds: 24,
    },
    {
      title: "The Promise",
      subtitle: lvl.promise,
      body: `${lvl.promise} That is what these ${lvl.durationDays} days ripen. This sit is your first taste.`,
      breath: "still",
      seconds: 20,
    },
  ];

  const chunkSize = Math.max(1, Math.ceil(lines.length / 3));
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join(" ");
    scenes.push({
      title: i === 0 ? "Teaching" : `Teaching ${Math.floor(i / chunkSize) + 1}`,
      subtitle: "",
      body: chunk.slice(0, 400),
      breath: "still",
      seconds: 40,
    });
  }

  practiceLines.slice(0, 4).forEach((p, i) => {
    scenes.push({
      title: `Practice ${i + 1}`,
      subtitle: "",
      body: `${p}. Let this be simple. Do not perform it. Just meet it.`,
      breath: i % 2 === 0 ? "in" : "out",
      seconds: 45,
    });
  });

  scenes.push({
    title: "Close",
    subtitle: "",
    body: `Rest. This is level ${lvl.level} of ${path.name} in one breath. When you are ready, open the eyes.`,
    breath: "out",
    seconds: 24,
  });

  return scenes.slice(0, 8);
}

const ShaktiSadhanaSession = () => {
  useForceDarkMode();
  const [slug] = useState("shakti");
  const path = getPathBySlug(slug);
  const lvl = path?.levels[0];

  const [scenes, setScenes] = useState<Scene[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [showNewHere, setShowNewHere] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!path || !lvl) return;
    setScenes(buildScenes(path, lvl));
    setLoading(false);
  }, [path, lvl]);

  const step = scenes?.[stepIdx];
  const totalScenes = scenes?.length ?? 0;

  useEffect(() => {
    if (!started || paused || !step) return;
    setElapsed(0);
    const start = performance.now();
    const tick = () => {
      const s = Math.floor((performance.now() - start) / 1000);
      setElapsed(s);
      if (s >= step.seconds) {
        if (stepIdx < totalScenes - 1) setStepIdx(i => i + 1);
        else { setStarted(false); setFinished(true); }
        return;
      }
      tickRef.current = window.setTimeout(tick, 250);
    };
    tickRef.current = window.setTimeout(tick, 250);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [started, paused, stepIdx, step, totalScenes]);

  const next = () => {
    if (!scenes) return;
    if (stepIdx < scenes.length - 1) setStepIdx(i => i + 1);
    else { setStarted(false); setFinished(true); }
  };

  const exit = () => {
    window.history.back();
  };

  const restart = () => {
    setStepIdx(0); setElapsed(0); setFinished(false); setStarted(true); setShowNewHere(false);
  };

  const beginSession = () => {
    setShowNewHere(false);
    setStarted(true);
  };

  if (!path || !lvl) {
    return <div className="flex items-center justify-center h-screen text-white/60">Loading…</div>;
  }

  const wisdomText = lvl.teaching.split(/\n+/).map(l => l.trim()).filter(Boolean).slice(0, 3).join(" ").slice(0, 500);

  return (
    <>
      <Seo
        title={`${path.name} Level ${lvl.level} · ${lvl.title} — wisdom session with ${path.guru}`}
        description={`${lvl.promise} A short teaching from ${path.guru}. Free, no signup.`}
        canonicalPath={`/experience/paths/${path.slug}/level/${lvl.level}/session`}
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-black to-black" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(251,191,36,0.12), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(220,38,38,0.10), transparent 50%)",
          }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-radial-gradient(circle at center, transparent 0, transparent 19px, rgba(255,255,255,0.4) 20px)",
            backgroundSize: "40px 40px",
          }} />
        </div>

        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4">
          <button onClick={exit} className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Session
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMuted(m => !m)} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10" aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs text-white/50 tabular-nums">
              {started && scenes ? `${Math.min(stepIdx + 1, totalScenes)} / ${totalScenes}` : `1 / 8`}
            </span>
            <button onClick={exit} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10" aria-label="End">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 pb-24">
          {!started && !finished ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-xl text-center">
              <div className="text-[11px] uppercase tracking-[0.35em] text-amber-200/80 mb-6">
                {path.name} · Level {lvl.level} of {path.levels.length} · with {path.guru}
              </div>

              <motion.div
                className="relative w-44 h-44 md:w-56 md:h-56 mx-auto mb-10 cursor-pointer"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                onClick={() => setShowNewHere(true)}
              >
                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-200/40 to-red-500/10 border border-amber-200/30" />
                <div className="absolute inset-12 rounded-full bg-white/30 blur-md" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Touch</span>
                </div>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">{lvl.title}</h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed italic">{lvl.promise}</p>
              <p className="mt-3 text-sm text-white/55">
                Touch the orb to begin your wisdom read.
              </p>
            </motion.div>
          ) : started && step ? (
            <div className="w-full max-w-xl flex flex-col items-center text-center">
              <motion.div
                className="relative w-44 h-44 md:w-56 md:h-56 mb-10"
                animate={paused ? { scale: 1 } : {
                  scale: step.breath === "in" ? [1, 1.18]
                       : step.breath === "out" ? [1.18, 1]
                       : step.breath === "hold" ? [1.1, 1.1]
                       : [1, 1.12, 1],
                }}
                transition={paused ? {} : {
                  duration: step.breath === "hold" ? 4 : step.breath === "still" ? 8 : 5,
                  repeat: Infinity, ease: "easeInOut",
                }}
              >
                <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-2xl" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-200/40 to-red-500/10 border border-amber-200/30" />
                <div className="absolute inset-12 rounded-full bg-white/30 blur-md" />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.7 }}
                  className="min-h-[160px]"
                >
                  <div className="text-[10px] uppercase tracking-[0.35em] text-amber-200/80 mb-3">
                    Scene {stepIdx + 1} of {totalScenes} · {step.title}
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-white/95">
                    {step.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={stepIdx}
                  className="h-full bg-amber-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (elapsed / step.seconds) * 100)}%` }}
                  transition={{ duration: 0.25, ease: "linear" }}
                />
              </div>

              <button onClick={next} className="mt-6 text-xs text-white/55 hover:text-white/85 transition inline-flex items-center gap-1">
                Next scene <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : null}

          {finished && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center px-6"
            >
              <div className="max-w-md text-center w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Session complete
                </div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">{lvl.title}</h2>
                <p className="mt-3 text-white/70 text-sm italic">{lvl.promise}</p>

                <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                  <button onClick={restart} className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm">
                    Sit again
                  </button>
                  <button onClick={exit} className="px-5 py-2.5 rounded-full font-medium bg-amber-300 text-black hover:bg-amber-200 transition text-sm">
                    Return to path
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {started && step && scenes && (
          <div className="absolute bottom-0 inset-x-0 z-30 px-5 pb-6 pt-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                {scenes.map((_, i) => (
                  <span
                    key={i}
                    className={
                      "h-1 rounded-full transition-all " +
                      (i < stepIdx
                        ? "w-3 bg-amber-300/80"
                        : i === stepIdx
                          ? "w-5 bg-amber-300"
                          : "w-2 bg-white/20")
                    }
                  />
                ))}
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">
                {stepIdx + 1} / {totalScenes}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showNewHere && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-black/80 p-6 md:p-8 shadow-[0_0_80px_-20px_rgba(251,191,36,0.35)]"
              >
                <button
                  onClick={() => setShowNewHere(false)}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:text-white/80 transition"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200/80 mb-3">
                  New here
                </div>
                <h3 className="font-display text-xl text-white mb-3">
                  This is a Wisdom read
                </h3>
                <p className="text-sm leading-relaxed text-white/75 mb-2">
                  A short teaching from a master — a few lines meant to be read slowly, not skimmed. Let it land before you tap next.
                </p>
                <p className="text-xs italic text-white/50 mb-6">
                  Read it twice. The second read is where it opens.
                </p>

                <button
                  onClick={beginSession}
                  className="w-full rounded-full bg-amber-300 px-8 py-3 text-sm font-medium text-black hover:bg-amber-200 transition shadow-[0_0_40px_-10px_rgba(251,191,36,0.5)]"
                >
                  Got it — Begin
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
};

export default ShaktiSadhanaSession;
