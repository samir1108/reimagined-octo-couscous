/**
 * PathLevelSession
 * ────────────────
 * Live, cinematic, voice-narrated first-taste session for any level (1-6)
 * of any yogic path (Bhakti, Jnana, Karma, Raja, Tantra, Shakti). Public,
 * no auth. Mirrors ShowroomDaySession — same orb, same narration hook,
 * same controls — but composed from the level's teaching + practices
 * rather than a program day.
 *
 * Route: /experience/paths/:slug/level/:level/session
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Pause, Play, Sparkles, Volume2, VolumeX, X, CheckCircle2,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { useStepNarration } from "@/hooks/useStepNarration";
import { getPathBySlug } from "@/data/experiencePaths";
import { supabase } from "@/lib/supabase";

type ScriptStep = {
  title: string;
  line: string;
  seconds: number;
  breath?: "in" | "hold" | "out" | "still";
};

function guruIdFor(name: string): string {
  const s = name.toLowerCase();
  if (s.includes("krishna")) return "krishna";
  if (s.includes("ramana")) return "ramana";
  if (s.includes("buddha")) return "buddha";
  if (s.includes("shankara")) return "shankara";
  if (s.includes("patanjali")) return "patanjali";
  if (s.includes("lao")) return "lao-tzu";
  if (s.includes("dogen") || s.includes("dōgen")) return "dogen";
  if (s.includes("osho")) return "osho";
  if (s.includes("rumi")) return "rumi";
  if (s.includes("thich")) return "thich-nhat-hanh";
  if (s.includes("krishnamurti")) return "krishnamurti";
  if (s.includes("vivekananda")) return "vivekananda";
  if (s.includes("sadhguru")) return "sadhguru";
  if (s.includes("yogananda")) return "yogananda";
  if (s.includes("frankl")) return "frankl";
  if (s.includes("abhinavagupta")) return "guru_male";
  if (s.includes("meera") || s.includes("anandamayi") || s.includes("kali") || s.includes("yashoda")) return "guru";
  return "guru_male";
}

function fallbackScript(
  teaching: string, practices: string[], promise: string,
  level: number, levelTitle: string, pathName: string, guru: string, durationDays: number,
): ScriptStep[] {
  const arrive: ScriptStep = {
    title: "Arrive", breath: "still", seconds: 24,
    line: `Welcome. Today, with ${guru}, you touch level ${level} of ${pathName}: ${levelTitle}. Soften the eyes. There is nowhere to be but here.`,
  };
  const orient: ScriptStep = {
    title: "The promise", breath: "still", seconds: 20,
    line: `${promise} That is what these ${durationDays} days ripen. This sit is your first taste.`,
  };
  const teach: ScriptStep = {
    title: "Teaching", breath: "still", seconds: 40,
    line: teaching.split(/\n+/).map(l => l.trim()).filter(Boolean).slice(0, 2).join(" ").slice(0, 320),
  };
  const core: ScriptStep[] = practices.slice(0, 6).map((p, i) => ({
    title: `Practice ${i + 1}`, seconds: 45,
    breath: (i % 2 === 0 ? "in" : "out") as ScriptStep["breath"],
    line: `${p}. Let this be simple. Do not perform it. Just meet it.`,
  }));
  const close: ScriptStep = {
    title: "Close", breath: "out", seconds: 24,
    line: `Rest. This is level ${level} of ${pathName} in one breath. When you are ready, open the eyes.`,
  };
  return [arrive, orient, teach, ...core, close];
}

const PathLevelSession = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const { slug, level } = useParams<{ slug: string; level: string }>();
  const levelNum = level ? parseInt(level, 10) : NaN;
  const path = slug ? getPathBySlug(slug) : undefined;
  const lvl = path && !isNaN(levelNum) ? path.levels.find(l => l.level === levelNum) : undefined;

  const [script, setScript] = useState<ScriptStep[] | null>(null);
  const [scriptSource, setScriptSource] = useState<"ai" | "fallback" | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  const voice = path ? guruIdFor(path.guru) : "guru_male";

  useEffect(() => {
    if (!path || !lvl) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-path-level-session", {
          body: {
            pathSlug: path.slug,
            pathName: path.name,
            guru: path.guru,
            guruRole: path.guruRole,
            level: lvl.level,
            totalLevels: path.levels.length,
            levelTitle: lvl.title,
            promise: lvl.promise,
            durationDays: lvl.durationDays,
            practices: lvl.practices,
            teaching: lvl.teaching,
            sessionMinutes: 10,
          },
        });
        if (cancelled) return;
        // deno-lint-ignore no-explicit-any
        const steps: ScriptStep[] | undefined = (data as any)?.steps;
        if (!error && Array.isArray(steps) && steps.length >= 5) {
          setScript(steps);
          // deno-lint-ignore no-explicit-any
          setScriptSource((data as any)?.source === "ai" ? "ai" : "fallback");
        } else {
          setScript(fallbackScript(lvl.teaching, lvl.practices, lvl.promise, lvl.level, lvl.title, path.name, path.guru, lvl.durationDays));
          setScriptSource("fallback");
        }
      } catch {
        if (cancelled) return;
        setScript(fallbackScript(lvl.teaching, lvl.practices, lvl.promise, lvl.level, lvl.title, path.name, path.guru, lvl.durationDays));
        setScriptSource("fallback");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [path, lvl]);

  const step = script?.[stepIdx];
  const totalSeconds = useMemo(() => (script ?? []).reduce((s, x) => s + x.seconds, 0), [script]);

  useStepNarration({
    text: started && !paused && step ? step.line : null,
    guruId: voice,
    enabled: started && !muted && !finished,
  });

  useEffect(() => {
    if (!started || paused || !step) return;
    setElapsed(0);
    const start = performance.now();
    const tick = () => {
      const s = Math.floor((performance.now() - start) / 1000);
      setElapsed(s);
      if (s >= step.seconds) {
        if (script && stepIdx < script.length - 1) setStepIdx(i => i + 1);
        else { setStarted(false); setFinished(true); markDone(); }
        return;
      }
      tickRef.current = window.setTimeout(tick, 250);
    };
    tickRef.current = window.setTimeout(tick, 250);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, paused, stepIdx, step, script]);

  const markDone = () => {
    if (!path || !lvl) return;
    try {
      const key = `path:${path.slug}:levels`;
      const raw = localStorage.getItem(key);
      const arr: number[] = raw ? JSON.parse(raw) : [];
      const updated = Array.from(new Set([...arr, lvl.level])).sort((a, b) => a - b);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* noop */ }
  };

  const next = () => {
    if (!script) return;
    if (stepIdx < script.length - 1) setStepIdx(i => i + 1);
    else { setStarted(false); setFinished(true); markDone(); }
  };

  const exit = () => {
    if (!path) { navigate("/experience/paths"); return; }
    navigate(`/experience/paths/${path.slug}`);
  };

  const restart = () => {
    setStepIdx(0); setElapsed(0); setFinished(false); setStarted(true);
  };

  const goNextLevel = () => {
    if (!path || !lvl) return;
    const nx = lvl.level < path.levels.length ? lvl.level + 1 : null;
    if (nx) navigate(`/experience/paths/${path.slug}/level/${nx}/session`);
    else navigate(`/experience/paths/${path.slug}`);
  };

  if (slug && (!path || !lvl)) return <Navigate to="/experience/paths" replace />;
  if (!path || !lvl) return null;

  return (
    <>
      <Seo
        title={`${path.name} Level ${lvl.level} · ${lvl.title} — a live voice session with ${path.guru}`}
        description={`${lvl.promise} A real voice will walk you through a first taste of level ${lvl.level} of ${path.name}. Free, no signup.`}
        canonicalPath={`/experience/paths/${path.slug}/level/${lvl.level}/session`}
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-black to-black" />
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(251,191,36,0.15), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(147,51,234,0.12), transparent 50%)",
          }} />
        </div>

        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4">
          <button onClick={exit} className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {started && (
            <div className="flex items-center gap-2">
              <button onClick={() => setMuted(m => !m)} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10" aria-label={muted ? "Unmute" : "Mute"}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setPaused(p => !p)} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10" aria-label={paused ? "Resume" : "Pause"}>
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button onClick={exit} className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10" aria-label="End">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
          {!started && !finished ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-xl text-center">
              <div className="text-[11px] uppercase tracking-[0.35em] text-amber-200/80 mb-4">
                {path.name} · Level {lvl.level} of {path.levels.length} · with {path.guru}
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">{lvl.title}</h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed italic">{lvl.promise}</p>
              <p className="mt-3 text-sm text-white/55">
                A real voice will walk you through a ~10-minute first taste of this level's practices. Use headphones if you can.
              </p>
              {loading && (
                <p className="mt-6 text-xs text-white/50 inline-flex items-center gap-2">
                  <Sparkles className="w-3 h-3 animate-pulse" /> {path.guru} is composing your session…
                </p>
              )}
              {!loading && scriptSource === "ai" && (
                <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-amber-200/80 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Composed for you · {script?.length} steps
                </p>
              )}
              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  onClick={() => setStarted(true)}
                  disabled={loading || !script}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition disabled:opacity-50 bg-amber-300 text-black hover:bg-amber-200 shadow-[0_0_60px_-10px_rgba(251,191,36,0.55)]"
                >
                  Hold the orb — begin
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </button>
                <button
                  onClick={() => { setMuted(true); setStarted(true); }}
                  disabled={loading || !script}
                  className="text-xs text-white/55 hover:text-white/80 transition disabled:opacity-40"
                >
                  or begin in silence (no voice)
                </button>
              </div>
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
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-200/40 to-amber-500/10 border border-amber-200/30" />
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
                    Step {stepIdx + 1} of {script!.length} · {step.title}
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-white/95">
                    {step.line}
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
                Next step <ChevronRight className="w-3 h-3" />
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
                  <CheckCircle2 className="w-3.5 h-3.5" /> Level {lvl.level} tasted
                </div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">{lvl.title}</h2>
                <p className="mt-3 text-white/70 text-sm italic">{lvl.promise}</p>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80 mb-2">The full level</div>
                  <p className="text-sm text-white/85 leading-relaxed">
                    This was one breath of {lvl.durationDays} days. Inside the app, {path.guru} walks with you daily — adaptive practices, guru voice, breath tracked, witness held.
                  </p>
                </div>

                <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                  <button onClick={restart} className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm">
                    Sit again
                  </button>
                  {lvl.level < path.levels.length ? (
                    <button onClick={goNextLevel} className="px-5 py-2.5 rounded-full font-medium bg-amber-300 text-black hover:bg-amber-200 transition text-sm inline-flex items-center gap-1.5">
                      Level {lvl.level + 1} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => navigate(`/experience/paths/${path.slug}`)} className="px-5 py-2.5 rounded-full font-medium bg-amber-300 text-black hover:bg-amber-200 transition text-sm">
                      Return to path
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {started && step && script && (
          <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5">
            <div className="max-w-xl mx-auto">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 text-center">
                {path.name} · L{lvl.level} · ~{Math.round(totalSeconds / 60)} min
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default PathLevelSession;