import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { SAPTARISHI } from "@/data/lineageTree";

const ExperienceLineage = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="The Lineage Tree — Saptarishi to Today"
        description="How seven seers seeded the world's contemplative traditions. From Vasishtha to Ramana, from Atri to modern Ayurveda — the ancestry map of every path in this app. Free, no signup."
        canonicalPath="/experience/lineage"
        keywords="saptarishi, lineage, vedanta, tantra, ayurveda, parampara, spiritual ancestry"
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-background to-indigo-900/30" />
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-indigo-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-16">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-amber-300/80">
                <GitBranch className="w-3.5 h-3.5" /> The Lineage Tree
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                Seven seers. Ten thousand years. One ancestry.
              </h1>
              <p className="mt-5 text-base md:text-xl text-foreground/75 max-w-3xl leading-relaxed">
                Every path inside this app — every guru, every practice, every text — descends from one of the
                Saptarishi, the seven original seers of the Vedic tradition. Here is the map of how they branched,
                what each one carried, and which modern science is rediscovering their work.
              </p>
            </motion.div>
          </div>
        </section>

        {/* TREE SVG OVERVIEW */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6 md:p-10">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-400/80 mb-6 text-center">The branching</div>
            <svg viewBox="0 0 800 280" className="w-full h-auto" aria-hidden="true">
              <defs>
                <radialGradient id="rootglow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsl(40 90% 70%)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="hsl(40 90% 70%)" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Root */}
              <circle cx="400" cy="40" r="40" fill="url(#rootglow)" />
              <circle cx="400" cy="40" r="8" fill="hsl(40 90% 70%)" />
              <text x="400" y="20" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">SAPTARISHI</text>
              {/* Branches */}
              {SAPTARISHI.map((b, i) => {
                const x = 50 + (i * 700) / 6;
                const y = 220;
                return (
                  <g key={b.rishi}>
                    <line x1="400" y1="50" x2={x} y2={y - 14} stroke="hsl(40 60% 50%)" strokeOpacity="0.3" strokeWidth="1" />
                    <circle cx={x} cy={y} r="14" fill="hsl(40 60% 50%)" fillOpacity="0.15" stroke="hsl(40 80% 60%)" strokeOpacity="0.6" />
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="14">{b.glyph}</text>
                    <text x={x} y={y + 32} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">{b.rishi.split(" ")[0]}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* BRANCHES */}
        <div className="max-w-4xl mx-auto px-4 pb-24 space-y-10">
          {SAPTARISHI.map((b, i) => (
            <motion.section
              key={b.rishi}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${b.color} opacity-30 pointer-events-none`} />
              <div className="relative p-6 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-3xl mb-2">{b.glyph}</div>
                    <h2 className="text-2xl md:text-3xl font-light tracking-tight">{b.rishi}</h2>
                    <div className="mt-1 text-amber-200/70 italic text-sm" style={{ fontFamily: "serif" }}>
                      {b.rishiSanskrit} — {b.meaning}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-base md:text-lg text-amber-100/85 italic border-l-2 border-amber-500/40 pl-4">
                  {b.stream}
                </div>

                <p className="mt-5 text-foreground/85 leading-relaxed">{b.oneLine}</p>

                <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 mb-2">Modern echo</div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{b.modernEcho}</p>
                </div>

                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 mb-3">The carriers</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {b.masters.map(m => (
                      <div key={m.name} className="rounded-lg border border-border/40 bg-background/40 p-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-sm font-medium text-foreground/90">{m.name}</div>
                          <div className="text-[10px] text-muted-foreground whitespace-nowrap">{m.era}</div>
                        </div>
                        <p className="mt-1 text-xs text-foreground/65 leading-relaxed">{m.contribution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          <section className="border-t border-border/40 pt-10 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
              These seven rivers still flow. Every master in our Temple, every practice in this app,
              descends from one of them. Knowing which one you belong to is half the journey.
            </p>
            <Link
              to="/experience"
              className="inline-block px-7 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
            >
              Back to the Experience
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperienceLineage;
