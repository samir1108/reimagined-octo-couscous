import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookA } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { LIVING_GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryEntry } from "@/data/livingGlossary";

const ExperienceGlossary = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | GlossaryEntry["category"]>("all");

  const entries = useMemo(
    () => (filter === "all" ? LIVING_GLOSSARY : LIVING_GLOSSARY.filter(e => e.category === filter)),
    [filter],
  );

  return (
    <>
      <Seo
        title="The Living Glossary — Words That Got Stolen"
        description="Meditation, yoga, karma, guru, chakra, samadhi, mindfulness — what these words actually mean in the lineage that birthed them. Fifteen reclaimed words. Free, no signup."
        canonicalPath="/experience/glossary"
        keywords="meditation meaning, yoga meaning, karma definition, samadhi, mindfulness, guru, chakra"
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/20 via-background to-amber-900/20" />
          <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-16">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-rose-300/80">
                <BookA className="w-3.5 h-3.5" /> The Living Glossary
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                Words that got stolen. Returned.
              </h1>
              <p className="mt-5 text-base md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
                Meditation isn't a five-minute break. Yoga isn't tight pants. Karma isn't revenge.
                Fifteen sacred words that the wellness market hollowed out — restored to what they actually mean,
                and what they actually demand.
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
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({LIVING_GLOSSARY.length})
            </button>
            {(Object.keys(GLOSSARY_CATEGORIES) as GlossaryEntry["category"][]).map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  filter === c
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {GLOSSARY_CATEGORIES[c].label}
              </button>
            ))}
          </div>
        </section>

        {/* ENTRIES */}
        <div className="max-w-3xl mx-auto px-4 pb-24 pt-8 space-y-8">
          {entries.map((e, i) => (
            <motion.article
              key={e.word}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-6 md:p-10"
            >
              <div className={`text-[10px] uppercase tracking-[0.2em] mb-2 ${GLOSSARY_CATEGORIES[e.category].color}`}>
                {GLOSSARY_CATEGORIES[e.category].label}
              </div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight">{e.word}</h2>
              {e.sanskrit && (
                <div className="mt-1 text-amber-200/70 italic text-sm" style={{ fontFamily: "serif" }}>
                  {e.sanskrit}
                </div>
              )}

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300/80 mb-2">The misuse</div>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">"{e.misuse}"</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80 mb-2">The original</div>
                  <p className="text-sm text-foreground/85 leading-relaxed">{e.original}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 mb-2">The prerequisite</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{e.prerequisite}</p>
              </div>

              <div className="mt-6 border-l-2 border-amber-500/50 pl-4">
                <p className="text-base md:text-lg text-amber-100/90 italic leading-relaxed">{e.correction}</p>
              </div>
            </motion.article>
          ))}

          <section className="border-t border-border/40 pt-10 text-center">
            <Link
              to="/experience/prerequisites"
              className="inline-block px-7 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
            >
              See the prerequisite ladder →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperienceGlossary;
