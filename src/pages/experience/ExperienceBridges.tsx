import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Atom } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { BRIDGES, BRIDGE_FAMILIES, type Bridge } from "@/data/bridgesExpanded";

const ExperienceBridges = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | Bridge["family"]>("all");

  const list = useMemo(
    () => (filter === "all" ? BRIDGES : BRIDGES.filter(b => b.family === filter)),
    [filter],
  );

  return (
    <>
      <Seo
        title="The Bridges — Modern Science Meets the Seers"
        description="Twelve places where modern science is rediscovering what the yogis already named. From the Default Mode Network to quantum entanglement, mapped to Vedanta. Free, no signup."
        canonicalPath="/experience/bridges"
        keywords="science meets yoga, vedanta quantum, default mode network meditation, polyvagal yoga, neuroplasticity karma"
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/25 via-background to-amber-900/15" />
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-16">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                <Atom className="w-3.5 h-3.5" /> The Bridges
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                Modern science is catching up.
              </h1>
              <p className="mt-5 text-base md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
                The Default Mode Network. Polyvagal theory. Quantum entanglement. Neuroplasticity.
                Each of these is one of the great scientific stories of our time — and each one was already
                mapped, named, and practiced by the seers, thousands of years ago.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="max-w-3xl mx-auto px-4 pt-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                filter === "all"
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-100"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({BRIDGES.length})
            </button>
            {(Object.keys(BRIDGE_FAMILIES) as Bridge["family"][]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  filter === f
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-100"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {BRIDGE_FAMILIES[f].label}
              </button>
            ))}
          </div>
        </section>

        {/* BRIDGES */}
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-20 space-y-6">
          {list.map((b, i) => (
            <motion.section
              key={b.slug}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${BRIDGE_FAMILIES[b.family].color} opacity-25 pointer-events-none`} />
              <div className="relative p-6 md:p-9">
                <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 mb-3">
                  {BRIDGE_FAMILIES[b.family].label}
                </div>

                {/* The Bridge */}
                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-5">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/70 mb-1">Modern</div>
                    <div className="text-base md:text-lg font-light text-cyan-100">{b.modern}</div>
                    <div className="mt-1 text-[11px] text-foreground/55">{b.modernSource}</div>
                  </div>
                  <div className="text-center text-amber-400/60 text-xl select-none">↔</div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70 mb-1">Ancient</div>
                    <div className="text-base md:text-lg font-light text-amber-100" style={{ fontFamily: "serif" }}>{b.ancient}</div>
                    <div className="mt-1 text-[11px] text-foreground/55">{b.ancientSource}</div>
                  </div>
                </div>

                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">{b.bridge}</p>

                <div className="mt-5 border-l-2 border-amber-500/50 pl-4">
                  <p className="text-base md:text-lg text-amber-100/90 italic leading-relaxed">{b.takeaway}</p>
                </div>
              </div>
            </motion.section>
          ))}

          <section className="border-t border-border/40 pt-10 mt-4 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
              These are not coincidences. They are the same territory, mapped twice — once by the meditators
              who turned inward, once by the scientists who turned outward.
            </p>
            <Link
              to="/experience/lineage"
              className="inline-block px-7 py-3 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-100 hover:bg-cyan-500/30 transition text-sm"
            >
              See where these seers came from →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperienceBridges;
