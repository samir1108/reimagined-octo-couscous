import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Sparkles, Mountain } from "lucide-react";
import { motion } from "framer-motion";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { EXPERIENCE_GAMES, gamesByTier } from "@/data/experienceGames";
import { getExperienceGameVideo } from "@/data/experienceGameVideos";
import LazyVideo from "@/components/LazyVideo";


const tierMeta = {
  flagship: { label: "Flagship — the world-class three", icon: Flame, color: "text-rose-400", description: "Deep, replayable, life-changing. Each one is a $99 product on its own." },
  daily:    { label: "Daily — the 5-minute reset", icon: Sparkles, color: "text-amber-400", description: "Short, addictive, free forever. Play one a day, become someone different in a year." },
  deep:     { label: "Deep cuts — the uncomfortable ones", icon: Mountain, color: "text-violet-400", description: "Hard. Confronting. The ones that actually move the needle." },
};

const ExperienceGames = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="Contemplative Games — 12 world-class trainers for the mind"
        description="Not Candy Crush. Twelve curated games that train attention, breath, witness, willpower, and ego — from Vipassanā to Vigyan Bhairav Tantra. Free to read about, playable in the app."
        canonicalPath="/experience/games"
        keywords="contemplative games, mindfulness games, vipassana, breath training, witness practice, atma vichara"
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
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400/90">Contemplative Games</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-light tracking-tight">
              Twelve games. One nervous system.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              Not Candy Crush. Each game trains one specific faculty — attention, breath, witness,
              willpower, ego, surrender. Drawn from Vipassanā, Vigyan Bhairav Tantra, Ramana, Patanjali,
              and 21st-century neuroscience. Sixty seconds to twenty minutes each.
            </p>
          </header>

          {(["flagship", "daily", "deep"] as const).map(tier => {
            const games = gamesByTier(tier);
            const meta = tierMeta[tier];
            const Icon = meta.icon;
            return (
              <section key={tier} className="mb-16">
                <div className="flex items-baseline gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                  <h2 className="text-xl md:text-2xl font-light">{meta.label}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{meta.description}</p>
                <div className={`grid gap-4 ${tier === "flagship" ? "md:grid-cols-3" : "md:grid-cols-3"}`}>
                  {games.map((g, i) => (
                    <motion.div
                      key={g.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <Link
                        to={`/app/games/${g.id}`}
                        className={`group block h-full rounded-2xl border bg-card/60 backdrop-blur hover:border-amber-500/40 hover:bg-card transition relative overflow-hidden ${
                          tier === "flagship" ? "border-amber-500/30" : "border-border/50"
                        }`}
                      >
                        {g.image && (
                          <div className="relative aspect-[16/10] overflow-hidden">
                            {(() => {
                              const vid = getExperienceGameVideo(g.id);
                              return vid ? (
                                <LazyVideo
                                  src={vid}
                                  poster={g.image}
                                  aria-label={g.name}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                              ) : (
                                <img
                                  src={g.image}
                                  alt={g.name}
                                  loading="lazy"
                                  width={1536}
                                  height={896}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              );
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                            <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-white/80 bg-black/40 backdrop-blur px-2 py-0.5 rounded-full border border-white/15">
                              {g.durationLabel}
                            </div>
                            <div className="absolute bottom-3 left-4 text-3xl drop-shadow-lg">{g.symbol}</div>
                          </div>
                        )}
                        {tier === "flagship" && !g.image && (
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 pointer-events-none" />
                        )}
                        <div className="relative p-5">
                          {!g.image && (
                            <div className="flex items-start justify-between mb-3">
                              <div className="text-4xl">{g.symbol}</div>
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{g.durationLabel}</span>
                            </div>
                          )}
                          <div className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1">{g.tradition}</div>
                          <h3 className="text-lg font-medium group-hover:text-amber-100 transition">
                            {g.name}
                          </h3>
                          <p className="mt-1 text-sm text-foreground/75 leading-snug">{g.oneLine}</p>
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-xs text-muted-foreground italic leading-relaxed">{g.why}</p>
                          </div>
                          <div className="mt-3 text-[11px] text-violet-300/70">
                            Trains: {g.trains}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}

          <section className="border-t border-border/40 pt-10 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
              Each game opens like a film and closes like a temple bell. Sign in to play —
              your inner data follows you across the whole app.
            </p>
            <Link
              to="/auth"
              className="inline-block px-7 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
            >
              Sign in to play
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperienceGames;
