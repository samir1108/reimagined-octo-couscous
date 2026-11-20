import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { EXPERIENCE_PATHS } from "@/data/experiencePaths";
import CardMedia from "@/components/experience/CardMedia";

function readDoneLevels(slug: string): number[] {
  try {
    const raw = localStorage.getItem(`path:${slug}:levels`);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

const ExperiencePaths = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The Six Paths — Bhakti, Jnana, Karma, Raja, Tantra, Shakti",
    url: `${SITE_URL}/experience/paths`,
    description: "Six classical yogic paths as 6-month structured journeys: devotion, self-inquiry, selfless action, meditation, tantra, and shakti.",
  };

  return (
    <>
      <Seo
        title="The Six Paths — Bhakti, Jnana, Karma, Raja, Tantra, Shakti"
        description="Six levels. Six months. One transformation. The six paths of yoga — Bhakti (devotion), Jnana (self-inquiry), Karma (action), Raja (meditation), Tantra (the path of yes), and Shakti (awakened power)."
        canonicalPath="/experience/paths"
        keywords="bhakti yoga, jnana yoga, karma yoga, raja yoga, tantra, shakti, six paths, yogic paths, ramana, krishna, patanjali, meera, abhinavagupta, anandamayi ma"
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-14">
          <button
            onClick={() => navigate("/experience")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <header className="mt-6 mb-12 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-500/80">The Six Paths</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-light tracking-tight">
              Pick a path. Walk it.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              For five thousand years yoga has offered many doors into the same room. Six of them
              are walked here — the four classical paths plus Tantra and Shakti. Each is six
              levels, about six months of daily practice, taught by one of the masters who first
              walked it. Every level is free to read in full.
            </p>
          </header>

          {/* The six paths — large cinematic cards */}
          <div className="grid md:grid-cols-2 gap-5 md:gap-7">
            {EXPERIENCE_PATHS.map((path, i) => {
              const done = readDoneLevels(path.slug);
              const total = path.levels.length;
              const nextLevel =
                path.levels.find((l) => !done.includes(l.level))?.level ?? total;
              const isComplete = done.length >= total;
              return (
              <motion.div
                key={path.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <div className="group block relative overflow-hidden rounded-3xl border border-border/60 hover:border-amber-500/40 transition-all hover:shadow-2xl hover:shadow-amber-500/10">
                  <Link to={`/experience/paths/${path.slug}`} className="block">
                  {/* Hero image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <CardMedia
                      image={path.heroImage}
                      videoUrl={path.heroVideo}
                      alt={`${path.name} — ${path.oneLine}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} mix-blend-overlay opacity-60`} />

                    {/* Sanskrit overlay top-right */}
                    <div className="absolute top-5 right-5 text-right">
                      <div className="text-2xl md:text-3xl font-light text-white/90" style={{ fontFamily: "serif" }}>
                        {path.sanskrit}
                      </div>
                    </div>

                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300/90 mb-2">
                        with {path.guru} · 6 levels · 6 months
                      </div>
                      <h2 className="text-2xl md:text-4xl font-light text-white mb-2">
                        {path.name}
                      </h2>
                      <p className="text-sm md:text-base text-white/80 max-w-md leading-snug">
                        {path.oneLine}
                      </p>
                    </div>
                  </div>
                  </Link>

                  {/* Footer strip */}
                  <div className="px-6 md:px-8 py-4 bg-card/80 backdrop-blur border-t border-border/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                      <span className="text-base">{path.symbol}</span>
                      {done.length > 0 ? (
                        <span className="inline-flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {done.length} / {total} levels tasted
                        </span>
                      ) : (
                        <span className="truncate">All 6 levels free · session by session</span>
                      )}
                    </div>
                    {isComplete ? (
                      <Link
                        to={`/experience/paths/${path.slug}`}
                        className="shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/25 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Path complete · revisit
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/experience/paths/${path.slug}/level/${nextLevel}/session`);
                        }}
                        className="shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-300 text-black font-medium hover:bg-amber-200 transition shadow-[0_0_40px_-12px_rgba(251,191,36,0.6)]"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {done.length > 0 ? `Continue · Level ${nextLevel}` : `Begin · Level 1`}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* Bottom note */}
          <div className="mt-16 text-center border-t border-border/40 pt-10">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              You do not need to choose forever. Most practitioners walk one path for a season,
              then another. The map is wide. Begin where the heart points.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default ExperiencePaths;
