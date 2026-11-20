import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  PenLine,
  Check,
  Headphones,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import {
  getShowroomDay,
  getShowroomProgram,
  type ShowroomDay as ShowroomDayData,
  type ShowroomProgram,
} from "@/data/showroomPrograms";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const ShowroomDay = () => {
  useForceDarkMode();
  const { slug, day } = useParams<{ slug: string; day: string }>();
  const dayNum = day ? parseInt(day, 10) : NaN;
  const result = slug && !isNaN(dayNum) ? getShowroomDay(slug, dayNum) : undefined;
  if (!result) return <Navigate to="/showroom" replace />;
  return (
    <ShowroomDayView
      key={`${result.program.slug}:${result.day.day}`}
      program={result.program}
      d={result.day}
    />
  );
};

const ShowroomDayView = ({ program, d }: { program: ShowroomProgram; d: ShowroomDayData }) => {
  const navigate = useNavigate();
  const prev = d.day > 1 ? d.day - 1 : null;
  const next = d.day < program.days.length ? d.day + 1 : null;

  const storageKey = `showroom:${program.slug}`;
  const journalKey = `showroom:journal:${program.slug}:${d.day}`;

  // --- Progress (per program, local) ---
  const [completed, setCompleted] = useState<number[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setCompleted(raw ? JSON.parse(raw) : []);
    } catch {/* noop */}
  }, [storageKey]);
  const isDone = completed.includes(d.day);
  const markDone = () => {
    const updated = Array.from(new Set([...completed, d.day])).sort((a, b) => a - b);
    setCompleted(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {/* noop */}
  };

  // --- Practice timer + breath orb ---
  const totalSec = Math.max(60, (d.practice.durationMin || 3) * 60);
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(true);
  const tickRef = useRef<number | null>(null);

  useEffect(() => { setRemaining(totalSec); setRunning(false); }, [d.day, totalSec]);

  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { setRunning(false); markDone(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Soft ambient tone using WebAudio (no asset needed)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  useEffect(() => {
    if (running && !muted) {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current ?? new AC();
        audioCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 110; // low drone
        gain.gain.value = 0.04;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        oscRef.current = { osc, gain };
      } catch {/* noop */}
    }
    return () => {
      if (oscRef.current) {
        try { oscRef.current.osc.stop(); } catch {/* noop */}
        oscRef.current = null;
      }
    };
  }, [running, muted]);

  const progressPct = ((totalSec - remaining) / totalSec) * 100;

  // --- Journal ---
  const [journal, setJournal] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(journalKey);
      if (raw) setJournal(raw);
    } catch {/* noop */}
  }, [journalKey]);
  useEffect(() => {
    if (!journal) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(journalKey, journal); setSavedAt(Date.now()); } catch {/* noop */}
    }, 600);
    return () => clearTimeout(t);
  }, [journal, journalKey]);

  const completionPct = useMemo(
    () => Math.round((completed.length / program.days.length) * 100),
    [completed.length, program.days.length],
  );

  return (
    <>
      <Seo
        title={`Day ${d.day}: ${d.title} — ${program.title}`}
        description={d.oneLine}
        canonicalPath={`/showroom/programs/${program.slug}/day/${d.day}`}
        type="article"
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
          <button
            onClick={() => navigate(`/showroom/programs/${program.slug}`)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> {program.title}
          </button>

          <header className="mt-6 mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-500/70">
              Day {d.day} of {program.days.length} · with {program.guru}
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-light leading-tight">{d.title}</h1>
            <p className="mt-3 text-base text-foreground/70 italic">{d.oneLine}</p>

            {/* Live voice-guided session CTA — launches the real orb runtime */}
            <button
              onClick={() => navigate(`/experience/programs/${program.slug}/day/${d.day}/session`)}
              className="mt-5 group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium text-sm hover:from-amber-300 hover:to-orange-400 transition shadow-[0_0_40px_-8px_rgba(251,191,36,0.6)]"
            >
              <Headphones className="w-4 h-4" />
              Begin the live session
              <span className="opacity-60 text-xs ml-1">· {program.guru}'s voice</span>
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              A real voice walks you through today's teaching + practice. Free · no signup · use headphones.
            </p>
          </header>

          {/* Program progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              <span>Your journey</span>
              <span>{completed.length}/{program.days.length} days · {completionPct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {program.days.map((dd) => {
                const done = completed.includes(dd.day);
                const current = dd.day === d.day;
                return (
                  <Link
                    key={dd.day}
                    to={`/showroom/programs/${program.slug}/day/${dd.day}`}
                    className={`w-7 h-7 rounded-full grid place-items-center text-[11px] border transition ${
                      current
                        ? "bg-amber-500/20 border-amber-400 text-amber-100"
                        : done
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300/90"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={`Day ${dd.day}`}
                  >
                    {done && !current ? <Check className="w-3 h-3" /> : dd.day}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Reading */}
          <article className="prose prose-invert prose-headings:font-light prose-p:leading-relaxed prose-a:text-amber-300 prose-a:no-underline hover:prose-a:underline max-w-none">
            <ReactMarkdown>{d.reading}</ReactMarkdown>
          </article>

          {/* Practice — interactive timer */}
          <section className="mt-10 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300/80 text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Today's practice — {d.practice.durationMin} min
              </div>
              <button
                onClick={() => setMuted((m) => !m)}
                className="text-amber-300/70 hover:text-amber-200"
                aria-label={muted ? "Enable ambient sound" : "Mute ambient sound"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <h2 className="mt-2 text-xl font-light">{d.practice.name}</h2>

            {/* Breath orb */}
            <div className="relative my-6 grid place-items-center">
              <div
                className={`relative w-44 h-44 rounded-full bg-gradient-to-br from-amber-400/40 via-orange-500/20 to-transparent border border-amber-400/30 ${
                  running ? "breath-orb-running" : ""
                }`}
                style={{
                  boxShadow: "0 0 60px hsl(38 95% 55% / 0.35), inset 0 0 24px hsl(20 90% 30% / 0.4)",
                }}
              >
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-3xl font-light tabular-nums text-amber-100">{fmt(remaining)}</div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300/70 mt-1">
                      {running ? "breathe" : remaining === 0 ? "complete" : "ready"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="h-1 w-full rounded-full bg-amber-500/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-100 text-sm transition"
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? "Pause" : remaining === 0 ? "Done" : "Begin"}
              </button>
              <button
                onClick={() => { setRunning(false); setRemaining(totalSec); }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            <div className="mt-5 text-sm md:text-base text-foreground/85 whitespace-pre-line leading-relaxed">
              {d.practice.instructions}
            </div>

            <style>{`
              @keyframes breath-orb {
                0%, 100% { transform: scale(0.92); opacity: .85; }
                50%      { transform: scale(1.08); opacity: 1; }
              }
              .breath-orb-running { animation: breath-orb 6s ease-in-out infinite; }
            `}</style>
          </section>

          {/* Reflection + Journal */}
          <section className="mt-8 rounded-xl border border-border/60 bg-card/50 p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Sit with this</p>
            <p className="text-base text-foreground/85 italic leading-relaxed">{d.reflection}</p>

            <div className="mt-5 pt-5 border-t border-border/40">
              <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                <PenLine className="w-3.5 h-3.5" /> Your reflection
              </label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Write what surfaced. Nobody sees this but you — it lives in your browser."
                className="w-full min-h-[120px] rounded-lg bg-background/40 border border-border/60 focus:border-amber-400/60 focus:outline-none p-3 text-sm text-foreground/90 placeholder:text-muted-foreground/50 resize-y"
              />
              {savedAt && (
                <p className="mt-1.5 text-[10px] text-amber-300/60">Saved locally · {new Date(savedAt).toLocaleTimeString()}</p>
              )}
            </div>
          </section>

          {/* Mark complete */}
          <div className="mt-6 flex items-center justify-center">
            {isDone ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Day {d.day} complete
              </div>
            ) : (
              <button
                onClick={markDone}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-100 text-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark day complete
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
            {prev ? (
              <Link
                to={`/showroom/programs/${program.slug}/day/${prev}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> Day {prev}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/showroom/programs/${program.slug}/day/${next}`}
                className="inline-flex items-center gap-1.5 text-sm text-amber-200 hover:text-amber-100"
              >
                Day {next} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 text-sm text-amber-100 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50"
              >
                Continue the journey →
              </Link>
            )}
          </nav>

          {!next && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              You finished the {program.duration}. Inside the app, {program.guru} keeps teaching, the practice deepens, and the journey continues.
            </p>
          )}
        </div>
      </main>
    </>
  );
};

const _unused = getShowroomProgram;
void _unused;

export default ShowroomDay;
