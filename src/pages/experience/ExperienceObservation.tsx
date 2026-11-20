import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { OBSERVATION_LADDER } from "@/data/observationLadder";
import { OBS_LENS_LABEL, OBS_LEVEL_META, OBS_TOTAL, type ObsLens } from "@/data/observationSessions";
import { observationFilmsForLevel, type ObservationFilm } from "@/data/observationVideos";
import {
  getObservationStats,
  levelCompletion,
  nextObsUnlock,
  type ObservationStats,
} from "@/lib/practice/observationProgress";

const ExperienceObservation = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ObservationStats>(() => getObservationStats());
  const [unlock, setUnlock] = useState(() => nextObsUnlock());

  useEffect(() => {
    setStats(getObservationStats());
    setUnlock(nextObsUnlock());
  }, []);

  const nextPosition = Math.min(OBS_TOTAL, stats.uniqueSeeds + 1);
  const activeLevel = unlock?.level ?? 7;
  const activeProgress = levelCompletion(activeLevel);

  return (
    <>
      <Seo
        title="The Observation Ladder — 7 levels from body sensing to choiceless awareness"
        description="The complete map of contemplative observation. Seven levels with teachings, micro-practices, and signs of readiness. Free, no signup."
        canonicalPath="/experience/observation"
        keywords="observation, mindfulness, sakshi bhava, vipassana, choiceless awareness, krishnamurti, ramana"
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-background to-indigo-900/20" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-16">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-sky-300/80">
                <Eye className="w-3.5 h-3.5" /> The Observation Ladder
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                Seven levels of watching.
              </h1>
              <p className="mt-4 text-base md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
                From feeling the weight of your body on a chair, to the disappearance of the watcher itself.
                The complete map. With teachings, micro-practices, signs you are ready for the next —
                and fifteen silent films, assigned to the level you are sitting.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/experience/observation/session"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400/90 text-black font-medium hover:bg-amber-300 transition shadow-[0_0_60px_-10px_rgba(251,191,36,0.6)]"
                >
                  ▶ Begin session {nextPosition} of {OBS_TOTAL}
                </Link>
                <span className="self-center text-xs text-foreground/50">
                  voice-guided · free · a different sitting each time
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROGRESS */}
        <section className="max-w-3xl mx-auto px-4 pt-8">
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-xs uppercase tracking-[0.2em] text-sky-400/80">
                Your ladder
              </div>
              <div className="text-sm text-foreground/60">
                {stats.uniqueSeeds} / {OBS_TOTAL} sittings
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all"
                style={{ width: `${Math.max(stats.percent, 1)}%` }}
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-1">Level</div>
                <div className="text-foreground/90">{activeLevel} · {activeProgress.done}/{activeProgress.total}</div>
              </div>
              <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-1">Next unlock</div>
                <div className="text-foreground/90">
                  {unlock ? `${unlock.title} · ${unlock.remaining} more` : "Ladder complete"}
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-1">Completed</div>
                <div className="text-foreground/90">{stats.completed} sittings</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(OBS_LENS_LABEL) as ObsLens[]).map((lens) => (
                <span
                  key={lens}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 bg-background/40 text-foreground/60"
                >
                  {OBS_LENS_LABEL[lens]} {stats.byLens[lens] ?? 0}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SPIRAL SVG */}
        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6 md:p-10">
            <div className="text-xs uppercase tracking-[0.2em] text-sky-400/80 mb-4 text-center">The arc</div>
            <svg viewBox="0 0 600 200" className="w-full h-auto" aria-hidden="true">
              <defs>
                <linearGradient id="laddergrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(200 80% 60%)" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="hsl(220 80% 60%)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(250 80% 70%)" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M 50 150 Q 150 50, 300 100 T 550 50"
                fill="none"
                stroke="url(#laddergrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {OBSERVATION_LADDER.map((lvl, i) => {
                const x = 50 + (i * 500) / 6;
                const y = 150 - Math.sin((i / 6) * Math.PI) * 80;
                return (
                  <g key={lvl.level}>
                    <circle cx={x} cy={y} r="10" fill="hsl(220 80% 60%)" opacity={0.3 + (i / 7) * 0.7} />
                    <circle cx={x} cy={y} r="5" fill="hsl(200 90% 80%)" />
                    <text x={x} y={y + 28} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">L{lvl.level}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* LEVELS */}
        <div className="max-w-3xl mx-auto px-4 pb-20 space-y-8">
          {OBSERVATION_LADDER.map((lvl, i) => (
            <motion.section
              key={lvl.level}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-6 md:p-10 overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-200 text-sm font-light">
                    {lvl.level}
                  </div>
                  {lvl.sanskrit && (
                    <span className="text-sm text-amber-200/70 italic" style={{ fontFamily: "serif" }}>{lvl.sanskrit}</span>
                  )}
                  <span className="ml-auto text-xs text-foreground/45">
                    {stats.byLevel[lvl.level] ?? 0}/{OBS_LEVEL_META.find((m) => m.level === lvl.level)?.total ?? 0} sittings
                  </span>
                  <Link
                    to={`/experience/observation/session?level=${lvl.level}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-sky-500/40 text-sky-200 hover:bg-sky-500/10 transition"
                  >
                    Sit this level
                  </Link>
                </div>
                <h2 className="text-2xl md:text-3xl font-light tracking-tight">{lvl.title}</h2>
                <p className="mt-2 text-base md:text-lg text-amber-100/80 italic border-l-2 border-sky-500/40 pl-4">
                  {lvl.oneLine}
                </p>

                <LevelFilmStrip level={lvl.level} />

                <div className="mt-6 prose prose-invert prose-base max-w-none">
                  {lvl.teaching.split("\n\n").map((para, k) => (
                    <p key={k} className="text-foreground/85 leading-relaxed">{para}</p>
                  ))}
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80 mb-2">60-second practice</div>
                    <p className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed">{lvl.microPractice}</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 mb-2">Sign of readiness</div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{lvl.signOfReadiness}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          <section className="border-t border-border/40 pt-10 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
              Inside the app, your level is detected from how you actually meditate —
              breath rhythm, witness session length, loop awareness. The ladder adapts to you.
            </p>
            <Link
              to="/auth"
              className="inline-block px-7 py-3 rounded-full bg-sky-500/20 border border-sky-500/50 text-sky-100 hover:bg-sky-500/30 transition text-sm"
            >
              Find your level
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

function LevelFilmStrip({ level }: { level: number }) {
  const films = observationFilmsForLevel(level);
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em] text-sky-300/70">
          Level films
        </span>
        <span className="text-[10px] text-foreground/40">
          {films.length} {films.length === 1 ? "film" : "films"} · plays in the sitting
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
    </div>
  );
}

function FilmCard({ film }: { film: ObservationFilm }) {
  const [play, setPlay] = useState(false);
  return (
    <div
      className="group relative aspect-video overflow-hidden rounded-lg border border-border/40 bg-black outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
      onMouseEnter={() => setPlay(true)}
      onMouseLeave={() => setPlay(false)}
      onFocus={() => setPlay(true)}
      onBlur={() => setPlay(false)}
      tabIndex={0}
      aria-label={`Film: ${film.title}`}
    >
      {film.poster && (
        <img
          src={film.poster}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-30"
        />
      )}
      {play && film.url && (
        <video
          src={film.url}
          poster={film.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <span className="pointer-events-none absolute inset-x-2 bottom-1.5 truncate text-[10px] font-medium text-white/90">
        Film · {film.title}
      </span>
      <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-white/70">
        ▶
      </span>
    </div>
  );
}

export default ExperienceObservation;
