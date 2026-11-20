/**
 * ShowroomDaySession
 * ──────────────────
 * Live, cinematic, voice-narrated session for any Showroom/Experience
 * program day. Public (no auth). Mirrors the PracticeLiveSession pattern:
 * calls the `generate-showroom-day-session` edge function to compose a
 * script from the day's reading/practice/reflection, then narrates each
 * step via `useStepNarration` (Deepgram TTS with browser fallback).
 *
 * Route: /experience/programs/:slug/day/:day/session
 *        /showroom/programs/:slug/day/:day/session
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
import { getShowroomDay } from "@/data/showroomPrograms";
import { supabase } from "@/lib/supabase";

type ScriptStep = {
  title: string;
  line: string;
  seconds: number;
  breath?: "in" | "hold" | "out" | "still";
};

// Map a guru display name → guruId used by useStepNarration/tts-speak.
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
  if (s.includes("witness") || s.includes("watcher")) return "krishnamurti";
  if (s.includes("kali") || s.includes("shakti") || s.includes("meera") || s.includes("yashoda")) return "guru"; // female default
  return "guru_male";
}

function fallbackScript(reading: string, practiceInstructions: string, reflection: string, day: number, dayTitle: string, guru: string, durationMin: number): ScriptStep[] {
  const total = Math.max(120, durationMin * 60);
  const lines = practiceInstructions.split(/\n+/).map(l => l.trim().replace(/^(?:\d+[.)]|-|\*|•)\s*/, "")).filter(Boolean);
  const arrive: ScriptStep = {
    title: "Arrive", breath: "still", seconds: 22,
    line: `Welcome to day ${day}. Today with ${guru}: ${dayTitle}. Let the eyes soften. There is nowhere to go.`,
  };
  const orient: ScriptStep = {
    title: "Today's teaching", breath: "still", seconds: 20,
    line: reading.slice(0, 220).replace(/\s+\S*$/, "") + "…",
  };
  const close: ScriptStep = {
    title: "Close", breath: "out", seconds: 24,
    line: `Sit with this question: ${reflection} When you are ready, open the eyes.`,
  };
  const per = Math.max(18, Math.floor((total - 66) / Math.max(1, lines.length)));
  const core: ScriptStep[] = lines.map((line, i) => ({
    title: `Step ${i + 1}`, line, seconds: per, breath: "still" as const,
  }));
  return [arrive, orient, ...core, close];
}

const ShowroomDaySession = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const { slug, day } = useParams<{ slug: string; day: string }>();
  const dayNum = day ? parseInt(day, 10) : NaN;
  const found = slug && !isNaN(dayNum) ? getShowroomDay(slug, dayNum) : undefined;

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

  const program = found?.program;
  const d = found?.day;
  const voice = program ? guruIdFor(program.guru) : "guru_male";

  useEffect(() => {
    if (!program || !d) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-showroom-day-session", {
          body: {
            programSlug: program.slug,
            programTitle: program.title,
            guru: program.guru,
            day: d.day,
            totalDays: program.days.length,
            dayTitle: d.title,
            oneLine: d.oneLine,
            reading: d.reading,
            practice: {
              name: d.practice.name,
              durationMin: d.practice.durationMin,
              instructions: d.practice.instructions,
            },
            reflection: d.reflection,
            audience: program.audience ?? null,
          },
        });
        if (cancelled) return;
        // deno-lint-ignore no-explicit-any
        const steps: ScriptStep[] | undefined = (data as any)?.steps;
        if (!error && Array.isArray(steps) && steps.length >= 4) {
          setScript(steps);
          // deno-lint-ignore no-explicit-any
          setScriptSource((data as any)?.source === "ai" ? "ai" : "fallback");
        } else {
          setScript(fallbackScript(d.reading, d.practice.instructions, d.reflection, d.day, d.title, program.guru, d.practice.durationMin));
          setScriptSource("fallback");
        }
      } catch {
        if (cancelled) return;
        setScript(fallbackScript(d.reading, d.practice.instructions, d.reflection, d.day, d.title, program.guru, d.practice.durationMin));
        setScriptSource("fallback");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [program, d]);

  const step = script?.[stepIdx];
  const totalSeconds = useMemo(() => (script ?? []).reduce((s, x) => s + x.seconds, 0), [script]);

  useStepNarration({
    text: started && !paused && step ? step.line : null,
    guruId: voice,
    enabled: started && !muted && !finished,
  });

  // Per-step countdown
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
    if (!program || !d) return;
    try {
      const key = `showroom:${program.slug}`;
      const raw = localStorage.getItem(key);
      const arr: number[] = raw ? JSON.parse(raw) : [];
      const updated = Array.from(new Set([...arr, d.day])).sort((a, b) => a - b);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* noop */ }
  };

  const next = () => {
    if (!script) return;
    if (stepIdx < script.length - 1) setStepIdx(i => i + 1);
    else { setStarted(false); setFinished(true); markDone(); }
  };

  const exit = () => {
    if (!program || !d) { navigate("/experience/programs"); return; }
    navigate(`/experience/programs/${program.slug}/day/${d.day}`);
  };

  const restart = () => {
    setStepIdx(0); setElapsed(0); setFinished(false); setStarted(true);
  };

  const goNextDay = () => {
    if (!program || !d) return;
    const nx = d.day < program.days.length ? d.day + 1 : null;
    if (nx) navigate(`/experience/programs/${program.slug}/day/${nx}/session`);
    else navigate(`/experience/programs/${program.slug}`);
  };

  if (slug && !found) return <Navigate to="/experience/programs" replace />;
  if (!program || !d) return null;

  return (
    <>
      <Seo
        title={`Day ${d.day} · ${d.title} — a live voice session with ${program.guru}`}
        description={`${d.oneLine} A real voice will walk you through day ${d.day} of ${program.title}. Free, no signup.`}
        canonicalPath={`/experience/programs/${program.slug}/day/${d.day}/session`}
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        {/* Ambient starfield backdrop */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-black to-black" />
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(251,191,36,0.15), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(147,51,234,0.12), transparent 50%)",
          }} />
        </div>

        {/* Top bar */}
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

        {/* Stage */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
          {!started && !finished ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-xl text-center">
              <div className="text-[11px] uppercase tracking-[0.35em] text-amber-200/80 mb-4">
                Day {d.day} of {program.days.length} · with {program.guru}
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">{d.title}</h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed italic">{d.oneLine}</p>
              <p className="mt-3 text-sm text-white/55">
                A real voice will walk you through the teaching and the {d.practice.durationMin}-minute practice. Use headphones if you can.
              </p>
              {loading && (
                <p className="mt-6 text-xs text-white/50 inline-flex items-center gap-2">
                  <Sparkles className="w-3 h-3 animate-pulse" /> {program.guru} is composing your session…
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
                  Begin the session
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
              {/* Breathing orb — timing follows breath cue */}
              <motion.div
                className="relative w-44 h-44 md:w-56 md:h-56 mb-10"
                animate={paused ? { scale: 1 } : {
                  scale: step.breath === "in" ? [1, 1.18]
                       : step.breath === "out" ? [1.18, 1]
                       : step.breath === "hold" ? [1.1, 1.1]
                       : [1, 1.12, 1],
                }}
                transition={paused ? {} : {
                  duration:
                    step.breath === "hold" ? Math.max(step.seconds, 1) :
                    step.breath === "still" ? Math.max(step.seconds, 1) :
                    Math.max(step.seconds, 1),
                  repeat: Infinity,
                  ease: "easeInOut",
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

          {/* Finished */}
          {finished && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center px-6"
            >
              <div className="max-w-md text-center w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Day {d.day} complete
                </div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">{d.title}</h2>
                <p className="mt-3 text-white/70 text-sm italic">{d.oneLine}</p>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80 mb-2">Sit with this</div>
                  <p className="text-sm text-white/85 italic leading-relaxed">"{d.reflection}"</p>
                </div>

                <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                  <button onClick={restart} className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm">
                    Sit again
                  </button>
                  {d.day < program.days.length ? (
                    <button onClick={goNextDay} className="px-5 py-2.5 rounded-full font-medium bg-amber-300 text-black hover:bg-amber-200 transition text-sm inline-flex items-center gap-1.5">
                      Day {d.day + 1} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => navigate(`/experience/programs/${program.slug}`)} className="px-5 py-2.5 rounded-full font-medium bg-amber-300 text-black hover:bg-amber-200 transition text-sm">
                      Return to program
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom progress */}
        {started && step && script && (
          <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5">
            <div className="max-w-xl mx-auto h-[1px] bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-amber-300"
                animate={{ width: `${((stepIdx + elapsed / step.seconds) / script.length) * 100}%` }}
                transition={{ duration: 0.25, ease: "linear" }}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">
              about {Math.max(1, Math.round(totalSeconds / 60))} minutes total
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default ShowroomDaySession;