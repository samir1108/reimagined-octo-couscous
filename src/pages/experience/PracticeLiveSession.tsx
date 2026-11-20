/**
 * PracticeLiveSession
 * ───────────────────
 * Generic, cinematic, AI-narrated live session for ANY of the Daily 12
 * practices. Reads the practice by :slug, calls the `generate-practice-session`
 * edge function (ConsciousOS AI Gateway → Gemini) to expand the raw instructions
 * into a rich spoken script calibrated to the target duration, then narrates
 * each step via Deepgram (`useStepNarration` → `tts-speak`). Also offers an
 * optional voice check-in at the end using Deepgram STT (`useTranscribe`).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Mic, Pause, Play, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { useStepNarration } from "@/hooks/useStepNarration";
import { getPracticeBySlug } from "@/data/experiencePractices";
import { supabase } from "@/lib/supabase";
import { useTranscribe } from "@/games/shell/useTranscribe";
import { getPracticeNarration } from "@/data/practiceNarration";

type ScriptStep = {
  title: string;
  line: string;
  seconds: number;
  breath?: "in" | "hold" | "out" | "still";
  url?: string;
};

// Accent → tailwind class kit. Semantic-ish, but locked to the practice card colors.
const ACCENTS: Record<string, {
  ring: string; text: string; glow: string; button: string; orb1: string; orb2: string;
}> = {
  amber:   { ring: "border-amber-300/40",   text: "text-amber-200",   glow: "shadow-[0_0_60px_-10px_rgba(251,191,36,0.55)]", button: "bg-amber-300 text-black hover:bg-amber-200",   orb1: "bg-amber-300/20",   orb2: "from-amber-200/40 to-amber-500/10 border-amber-200/30" },
  emerald: { ring: "border-emerald-300/40", text: "text-emerald-200", glow: "shadow-[0_0_60px_-10px_rgba(52,211,153,0.55)]",  button: "bg-emerald-300 text-black hover:bg-emerald-200", orb1: "bg-emerald-300/20", orb2: "from-emerald-200/40 to-emerald-500/10 border-emerald-200/30" },
  rose:    { ring: "border-rose-300/40",    text: "text-rose-200",    glow: "shadow-[0_0_60px_-10px_rgba(251,113,133,0.55)]",  button: "bg-rose-300 text-black hover:bg-rose-200",       orb1: "bg-rose-300/20",    orb2: "from-rose-200/40 to-rose-500/10 border-rose-200/30" },
  stone:   { ring: "border-stone-300/40",   text: "text-stone-200",   glow: "shadow-[0_0_60px_-10px_rgba(214,211,209,0.5)]",   button: "bg-stone-200 text-black hover:bg-stone-100",     orb1: "bg-stone-300/20",   orb2: "from-stone-200/40 to-stone-500/10 border-stone-200/30" },
  indigo:  { ring: "border-indigo-300/40",  text: "text-indigo-200",  glow: "shadow-[0_0_60px_-10px_rgba(129,140,248,0.55)]",  button: "bg-indigo-300 text-black hover:bg-indigo-200",   orb1: "bg-indigo-300/20",  orb2: "from-indigo-200/40 to-indigo-500/10 border-indigo-200/30" },
  sky:     { ring: "border-sky-300/40",     text: "text-sky-200",     glow: "shadow-[0_0_60px_-10px_rgba(125,211,252,0.55)]",  button: "bg-sky-300 text-black hover:bg-sky-200",         orb1: "bg-sky-300/20",     orb2: "from-sky-200/40 to-sky-500/10 border-sky-200/30" },
  cyan:    { ring: "border-cyan-300/40",    text: "text-cyan-200",    glow: "shadow-[0_0_60px_-10px_rgba(103,232,249,0.55)]",  button: "bg-cyan-300 text-black hover:bg-cyan-200",       orb1: "bg-cyan-300/20",    orb2: "from-cyan-200/40 to-cyan-500/10 border-cyan-200/30" },
  violet:  { ring: "border-violet-300/40",  text: "text-violet-200",  glow: "shadow-[0_0_60px_-10px_rgba(196,181,253,0.55)]",  button: "bg-violet-300 text-black hover:bg-violet-200",   orb1: "bg-violet-300/20",  orb2: "from-violet-200/40 to-violet-500/10 border-violet-200/30" },
  slate:   { ring: "border-slate-300/40",   text: "text-slate-200",   glow: "shadow-[0_0_60px_-10px_rgba(203,213,225,0.5)]",   button: "bg-slate-200 text-black hover:bg-slate-100",     orb1: "bg-slate-300/20",   orb2: "from-slate-200/40 to-slate-500/10 border-slate-200/30" },
};

// Choose a voice from tradition — the tts-speak function maps guruId → voice.
function voiceForTradition(t: string): string {
  const s = t.toLowerCase();
  if (s.includes("stanford") || s.includes("heartmath")) return "krishnamurti";
  if (s.includes("stoic") || s.includes("upanishad")) return "krishnamurti";
  if (s.includes("buddh") || s.includes("theravāda") || s.includes("theravada") || s.includes("vipassanā") || s.includes("vipassana")) return "buddha";
  if (s.includes("ramana")) return "ramana";
  if (s.includes("tantr") || s.includes("hatha") || s.includes("pranayama") || s.includes("vedic")) return "shiva";
  if (s.includes("bhakti")) return "krishna";
  return "krishnamurti";
}

function fallbackScript(instructions: string[], durationMin: number, name: string): ScriptStep[] {
  const target = Math.max(60, durationMin * 60);
  const arrive: ScriptStep = { title: "Arrive", line: `Sit comfortably. Let the eyes soften. We will practice ${name} together.`, seconds: 18, breath: "still" };
  const close: ScriptStep = { title: "Close", line: "When you are ready, take one slow breath. Open the eyes. Carry this with you.", seconds: 16, breath: "out" };
  const per = Math.max(14, Math.floor((target - arrive.seconds - close.seconds) / Math.max(1, instructions.length)));
  return [arrive, ...instructions.map((line, i) => ({ title: `Step ${i + 1}`, line, seconds: per, breath: "still" as const })), close];
}

const PracticeLiveSession = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const practice = slug ? getPracticeBySlug(slug) : undefined;

  const [script, setScript] = useState<ScriptStep[] | null>(null);
  const [scriptSource, setScriptSource] = useState<"ai" | "fallback" | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [reflection, setReflection] = useState<string>("");
  const tickRef = useRef<number | null>(null);

  const accent = ACCENTS[practice?.accent ?? "amber"] ?? ACCENTS.amber;
  const voice = practice ? voiceForTradition(practice.tradition) : "krishnamurti";
  const transcribe = useTranscribe();

  // Fetch AI script on mount
  useEffect(() => {
    if (!practice) return;
    let cancelled = false;
    setLoading(true);
    // ── Fast path: pre-rendered narration from CDN. No API calls, works offline.
    const prebuilt = getPracticeNarration(practice.slug);
    if (prebuilt && prebuilt.length >= 3) {
      setScript(prebuilt as ScriptStep[]);
      setScriptSource("ai");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-practice-session", {
          body: {
            slug: practice.slug,
            name: practice.name,
            sanskrit: practice.sanskrit,
            tradition: practice.tradition,
            durationMin: practice.durationMin,
            oneLine: practice.oneLine,
            whenToUse: practice.whenToUse,
            instructions: practice.instructions,
            accent: practice.accent,
          },
        });
        if (cancelled) return;
        const steps: ScriptStep[] | undefined = (data as any)?.steps;
        if (!error && Array.isArray(steps) && steps.length >= 3) {
          setScript(steps);
          setScriptSource((data as any)?.source === "ai" ? "ai" : "fallback");
        } else {
          setScript(fallbackScript(practice.instructions, practice.durationMin, practice.name));
          setScriptSource("fallback");
        }
      } catch {
        if (cancelled) return;
        setScript(fallbackScript(practice.instructions, practice.durationMin, practice.name));
        setScriptSource("fallback");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [practice]);

  const step = script?.[stepIdx];
  const totalSeconds = useMemo(() => (script ?? []).reduce((s, x) => s + x.seconds, 0), [script]);

  // Narrate current step. If the step has a pre-rendered CDN URL we play it
  // directly (no TTS call). Otherwise fall back to the on-demand narrator.
  const prerecorded = !!step?.url;
  useStepNarration({
    text: started && !paused && step && !prerecorded ? step.line : null,
    guruId: voice,
    enabled: started && !muted && !finished && !prerecorded,
  });

  // Pre-rendered audio element — reused across steps.
  const cdnAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!prerecorded || !step?.url) return;
    if (!started || paused || muted || finished) {
      cdnAudioRef.current?.pause();
      return;
    }
    const a = cdnAudioRef.current ?? new Audio();
    cdnAudioRef.current = a;
    if (a.src !== step.url) {
      a.src = step.url;
      a.preload = "auto";
    }
    a.muted = false;
    a.play().catch(() => {/* autoplay may need a gesture; ignored */});
    return () => { try { a.pause(); } catch {} };
  }, [prerecorded, step?.url, started, paused, muted, finished]);

  // Preload the next step's audio so playback is instant.
  useEffect(() => {
    if (!script) return;
    const nextStep = script[stepIdx + 1];
    if (nextStep?.url) { const a = new Audio(); a.src = nextStep.url; a.preload = "auto"; }
  }, [script, stepIdx]);

  // Per-step countdown
  useEffect(() => {
    if (!started || paused || !step) return;
    setElapsed(0);
    const start = performance.now();
    const tick = () => {
      const s = Math.floor((performance.now() - start) / 1000);
      setElapsed(s);
      if (s >= step.seconds) {
        if (script && stepIdx < script.length - 1) setStepIdx((i) => i + 1);
        else { setStarted(false); setFinished(true); }
        return;
      }
      tickRef.current = window.setTimeout(tick, 250);
    };
    tickRef.current = window.setTimeout(tick, 250);
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [started, paused, stepIdx, step, script]);

  const next = () => {
    if (!script) return;
    if (stepIdx < script.length - 1) setStepIdx((i) => i + 1);
    else { setStarted(false); setFinished(true); }
  };

  const exit = () => navigate("/experience/practices");

  const restart = () => {
    setStepIdx(0);
    setElapsed(0);
    setFinished(false);
    setReflection("");
    setStarted(true);
  };

  const captureReflection = async () => {
    if (transcribe.recording) {
      const r = await transcribe.stop();
      if (r?.transcript) setReflection(r.transcript.trim());
    } else {
      setReflection("");
      try { await transcribe.start(); } catch { /* mic denied */ }
    }
  };

  if (slug && !practice) return <Navigate to="/experience/practices" replace />;
  if (!practice) return null;

  const bg = practice.image;
  const bgVideo = practice.video;

  return (
    <>
      <Seo
        title={`${practice.name} — a live, voice-guided session`}
        description={`${practice.oneLine} A free, AI-composed and voice-narrated session in ${practice.tradition}. ${practice.durationMin} minutes.`}
        canonicalPath={`/experience/practices/${practice.slug}/session`}
      />
      <main className="fixed inset-0 overflow-hidden bg-black text-white">
        {/* Cinematic backdrop */}
        <div className="absolute inset-0">
          {bgVideo ? (
            <video
              src={bgVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover transition-all duration-1000"
              style={{
                opacity: started ? 0.85 : 0.7,
                filter: started ? "saturate(1.05)" : "saturate(0.95)",
              }}
            />
          ) : bg && (
            <img
              src={bg}
              alt=""
              className="w-full h-full object-cover opacity-70 transition-all duration-1000"
              style={{ filter: started ? "blur(3px) saturate(0.9)" : "blur(0px)" }}
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-b ${bgVideo ? "from-black/30 via-black/10 to-black/80" : "from-black/50 via-black/20 to-black/85"}`} />
        </div>

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4">
          <button
            onClick={exit}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {started && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted((m) => !m)}
                className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition"
                aria-label={paused ? "Resume" : "Pause"}
              >
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={exit}
                className="p-2 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 transition"
                aria-label="End"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stage */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6">
          {!started && !finished ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="max-w-xl text-center"
            >
              <div className={`text-[11px] uppercase tracking-[0.35em] ${accent.text} mb-4`}>
                {practice.sanskrit ? `${practice.sanskrit} · ` : ""}{practice.tradition}
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">
                {practice.name}
              </h1>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed">
                {practice.oneLine} A real voice will walk you through it — {practice.durationMin} minutes.
                Use headphones if you can.
              </p>
              {loading && (
                <p className="mt-6 text-xs text-white/50 inline-flex items-center gap-2">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Composing your session…
                </p>
              )}
              {!loading && scriptSource === "ai" && (
                <p className={`mt-6 text-[11px] uppercase tracking-[0.25em] ${accent.text} inline-flex items-center gap-1.5`}>
                  <Sparkles className="w-3 h-3" /> Script composed for you · {script?.length} steps
                </p>
              )}
              <div className="mt-10 flex flex-col items-center gap-3">
                <button
                  onClick={() => setStarted(true)}
                  disabled={loading || !script}
                  className={`group inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition disabled:opacity-50 ${accent.button} ${accent.glow}`}
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
              {/* Breathing orb — timing follows the step's breath cue.
                  Hidden when a cinematic video backdrop is doing the visual work. */}
              {!bgVideo && (
                <motion.div
                  className="relative w-44 h-44 md:w-56 md:h-56 mb-10"
                  animate={paused ? { scale: 1 } : {
                    scale:
                      step.breath === "in" ? [1, 1.18] :
                      step.breath === "out" ? [1.18, 1] :
                      step.breath === "hold" ? [1.1, 1.1] :
                      [1, 1.12, 1],
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
                  <div className={`absolute inset-0 rounded-full ${accent.orb1} blur-2xl`} />
                  <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${accent.orb2} border`} />
                  <div className="absolute inset-12 rounded-full bg-white/30 blur-md" />
                </motion.div>
              )}
              {bgVideo && <div className="mb-10" />}

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.7 }}
                  className="min-h-[160px]"
                >
                  <div className={`text-[10px] uppercase tracking-[0.35em] ${accent.text} mb-3`}>
                    Step {stepIdx + 1} of {script!.length} · {step.title}
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-white/95">
                    {step.line}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Per-step progress */}
              <div className="mt-8 w-full max-w-xs h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  key={stepIdx}
                  className={`h-full ${accent.button.split(" ")[0]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (elapsed / step.seconds) * 100)}%` }}
                  transition={{ duration: 0.25, ease: "linear" }}
                />
              </div>

              <button
                onClick={next}
                className="mt-6 text-xs text-white/55 hover:text-white/85 transition inline-flex items-center gap-1"
              >
                Next step <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : null}

          {/* Finished overlay — with optional voice reflection */}
          {finished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center px-6"
            >
              <div className="max-w-md text-center w-full">
                <div className={`text-[11px] uppercase tracking-[0.3em] ${accent.text} mb-3`}>Session complete</div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">
                  {practice.name}
                </h2>
                <p className="mt-3 text-white/70 text-sm">{practice.oneLine}</p>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                  <div className={`text-[10px] uppercase tracking-[0.25em] ${accent.text} mb-2`}>One breath before you go</div>
                  <p className="text-sm text-white/80">Speak one word for how you feel right now.</p>
                  <button
                    onClick={captureReflection}
                    disabled={transcribe.transcribing}
                    className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs border transition ${
                      transcribe.recording
                        ? "bg-rose-500/20 border-rose-400/40 text-rose-100 animate-pulse"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/15"
                    } disabled:opacity-50`}
                  >
                    <Mic className="w-3 h-3" />
                    {transcribe.recording ? "Listening… tap to stop" : transcribe.transcribing ? "Transcribing…" : "Speak your word"}
                  </button>
                  {reflection && (
                    <p className="mt-3 text-sm text-white/90 italic">"{reflection}"</p>
                  )}
                </div>

                <div className="mt-7 flex items-center justify-center gap-3">
                  <button
                    onClick={restart}
                    className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
                  >
                    Sit again
                  </button>
                  <button
                    onClick={() => navigate("/experience/practices")}
                    className={`px-5 py-2.5 rounded-full font-medium transition text-sm ${accent.button}`}
                  >
                    All practices →
                  </button>
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
                className={`h-full ${accent.button.split(" ")[0]}`}
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

export default PracticeLiveSession;