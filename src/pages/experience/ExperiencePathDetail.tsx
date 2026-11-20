import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, Lock, Check, Sparkles, Play } from "lucide-react";
import { motion } from "framer-motion";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { getPathBySlug } from "@/data/experiencePaths";
import ReactMarkdown from "react-markdown";
import level1Img from "@/assets/paths/level-1.jpg";
import level2Img from "@/assets/paths/level-2.jpg";
import level3Img from "@/assets/paths/level-3.jpg";
import level4Img from "@/assets/paths/level-4.jpg";
import level5Img from "@/assets/paths/level-5.jpg";
import level6Img from "@/assets/paths/level-6.jpg";

const LEVEL_IMAGES = [level1Img, level2Img, level3Img, level4Img, level5Img, level6Img];

const ExperiencePathDetail = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const path = getPathBySlug(slug);

  if (!path) return <Navigate to="/experience/paths" replace />;

  const l1 = path.levels[0];
  const deeperLevels = path.levels.slice(1);

  return (
    <>
      <Seo
        title={`${path.name} — Level 1 free with ${path.guru}`}
        description={`${path.oneLine} Read the full Level 1 teaching free. ${path.longDescription.slice(0, 140)}`}
        canonicalPath={`/experience/paths/${path.slug}`}
        keywords={`${path.name}, ${path.guru}, yoga path, ${path.slug} yoga, 6 levels, free teaching`}
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative h-[60vh] min-h-[420px] md:min-h-[520px] overflow-hidden">
          <img
            src={path.heroImage}
            alt={path.name}
            width={1536}
            height={896}
            className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-background" />
          <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} mix-blend-overlay opacity-50`} />

          <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-12 h-full flex flex-col">
            <button
              onClick={() => navigate("/experience/paths")}
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-auto"
            >
              <div className="text-3xl md:text-5xl font-light text-white/80 mb-2" style={{ fontFamily: "serif" }}>
                {path.sanskrit}
              </div>
              <h1 className="text-4xl md:text-7xl font-light text-white tracking-tight">
                {path.name}
              </h1>
              <p className="mt-4 text-base md:text-xl text-white/85 max-w-2xl leading-relaxed">
                {path.oneLine}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-wider text-amber-200/90">
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20">with {path.guru}</span>
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20">{path.levels.length} levels</span>
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/20">{path.totalDurationMonths} months</span>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
          {/* About this path */}
          <section className="mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-500/80 mb-3">About this path</div>
            <div className="prose prose-invert prose-lg max-w-none">
              {path.longDescription.split("\n\n").map((p, i) => (
                <p key={i} className="text-foreground/85 leading-relaxed">{p}</p>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground italic">
              Taught by {path.guru} — {path.guruRole}.
            </p>
          </section>

          {/* The 6 levels */}
          <section className="mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-500/80 mb-5">The six levels</div>
            <div className="space-y-3">
              {path.levels.map((lvl, i) => (
                <motion.div
                  key={lvl.level}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 transition ${
                    lvl.unlocked
                      ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card hover:border-amber-400/60"
                      : "border-border/40 bg-card/40"
                  }`}
                >
                  {LEVEL_IMAGES[i] && (
                    <>
                      <img
                        src={LEVEL_IMAGES[i]}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        width={1536}
                        height={896}
                        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
                          lvl.unlocked ? "opacity-25" : "opacity-10 grayscale"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-card/20 pointer-events-none" />
                    </>
                  )}
                  <div className="relative flex items-start gap-4">
                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-light ${
                      lvl.unlocked
                        ? "bg-amber-500/20 text-amber-200 border border-amber-400/40"
                        : "bg-muted/30 text-muted-foreground border border-border/40"
                    }`}>
                      {lvl.unlocked ? lvl.level : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Level {lvl.level} · {lvl.durationDays} days</div>
                        {lvl.unlocked && (
                          <span className="text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                            Free · read now
                          </span>
                        )}
                      </div>
                      <h3 className={`mt-1 text-lg md:text-xl font-medium ${lvl.unlocked ? "text-foreground" : "text-foreground/60"}`}>
                        {lvl.title}
                      </h3>
                      <p className={`mt-1 text-sm ${lvl.unlocked ? "text-foreground/75" : "text-muted-foreground"}`}>
                        {lvl.promise}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {lvl.practices.map(p => (
                          <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/30">
                            {p}
                          </span>
                        ))}
                      </div>
                      {lvl.unlocked && (
                        <div className="mt-3">
                          <Link
                            to={`/experience/paths/${path.slug}/level/${lvl.level}/session`}
                            className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-100 hover:bg-amber-500/30 transition"
                          >
                            <Play className="w-3 h-3" /> Live session · hold the orb
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* L1 TEACHING — full content */}
          {l1.teaching && (
            <section className="mb-16 relative">
              <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-br from-amber-500/10 via-transparent to-rose-500/5 rounded-3xl blur-2xl -z-10" />
              <div className="rounded-2xl border border-amber-500/30 bg-card/80 backdrop-blur p-6 md:p-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs uppercase tracking-[0.2em] text-amber-400">Level 1 — Full teaching</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-6">
                  {l1.title}
                </h2>
                <p className="text-base md:text-lg text-amber-100/90 italic mb-6 border-l-2 border-amber-500/40 pl-4">
                  {l1.promise}
                </p>
                <div className="mb-6">
                  <Link
                    to={`/experience/paths/${path.slug}/level/${l1.level}/session`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-300 text-black font-medium text-sm hover:bg-amber-200 transition shadow-[0_0_60px_-10px_rgba(251,191,36,0.55)]"
                  >
                    <Play className="w-4 h-4" /> Begin live session — Level {l1.level}
                  </Link>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                  <ReactMarkdown>{l1.teaching}</ReactMarkdown>
                </div>
              </div>
            </section>
          )}

          {/* DEEPER LEVELS — full teachings for L2-L6 */}
          {deeperLevels.map((lvl, i) => (
            lvl.teaching ? (
              <section key={lvl.level} className="mb-16 relative">
                <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 rounded-3xl blur-2xl -z-10" />
                <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-6 md:p-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400/70" />
                    <span className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
                      Level {lvl.level} — {lvl.durationDays} days
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-4">{lvl.title}</h2>
                  <p className="text-base md:text-lg text-amber-100/85 italic mb-5 border-l-2 border-amber-500/30 pl-4">
                    {lvl.promise}
                  </p>
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {lvl.practices.map(p => (
                      <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/30">{p}</span>
                    ))}
                  </div>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <ReactMarkdown>{lvl.teaching}</ReactMarkdown>
                  </div>
                  <div className="mt-6">
                    <Link
                      to={`/experience/paths/${path.slug}/level/${lvl.level}/session`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-100 text-sm hover:bg-amber-500/30 transition"
                    >
                      <Play className="w-4 h-4" /> Live session — Level {lvl.level}
                    </Link>
                  </div>
                </div>
              </section>
            ) : null
          ))}

          {/* CTA */}
          <section className="border-t border-border/40 pt-10 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
              All six levels are free to read. Inside the app, the practices adapt to you,
              the guru talks back, your breath is measured, your witness is tracked, and the path becomes yours.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to={`/experience/paths/${path.slug}/level/1/session`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-amber-300 text-black font-medium hover:bg-amber-200 transition text-sm shadow-[0_0_60px_-10px_rgba(251,191,36,0.55)]"
              >
                <Play className="w-4 h-4" /> Begin {path.name} — live session
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center px-7 py-3 rounded-full bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 transition text-sm"
              >
                Walk the full path in the app
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperiencePathDetail;
