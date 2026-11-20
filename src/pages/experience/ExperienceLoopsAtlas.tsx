import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Library } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { LOOP_ESSAYS, LOOP_ATLAS_CATEGORIES, type LoopEssay } from "@/data/loopsAtlas";

const ExperienceLoopsAtlas = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(LOOP_ESSAYS[0]?.slug ?? null);
  const [filter, setFilter] = useState<"all" | LoopEssay["category"]>("all");

  const list = useMemo(
    () => (filter === "all" ? LOOP_ESSAYS : LOOP_ESSAYS.filter(l => l.category === filter)),
    [filter],
  );

  const active = LOOP_ESSAYS.find(l => l.slug === open) ?? list[0];

  return (
    <>
      <Seo
        title="The Loops Atlas — Behavioral Patterns, Mapped"
        description="Twelve universal loops every nervous system runs — people-pleasing, doom-scrolling, perfectionism, rumination. Each with trigger, neuroscience, ancient diagnosis, and the dissolution path. Free, no signup."
        canonicalPath="/experience/loops-atlas"
        keywords="behavioral loops, people pleasing, doom scrolling, impostor syndrome, rumination, perfectionism, sanskrit kleshas, samskara"
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-background to-rose-900/20" />
          <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-12">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-violet-300/80">
                <Library className="w-3.5 h-3.5" /> The Loops Atlas
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                The patterns running your life.
              </h1>
              <p className="mt-5 text-base md:text-xl text-foreground/75 max-w-3xl leading-relaxed">
                Twelve universal behavioral loops — each with its trigger, what's happening in the nervous system,
                what the ancients already named it, and the practice that breaks it.
                A working atlas, not a list of symptoms.
              </p>
            </motion.div>
          </div>
        </section>

        {/* LAYOUT */}
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-20 grid md:grid-cols-[260px_1fr] gap-6">
          {/* SIDEBAR */}
          <aside className="md:sticky md:top-4 md:self-start space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  filter === "all"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {(Object.keys(LOOP_ATLAS_CATEGORIES) as LoopEssay["category"][]).map(c => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition capitalize ${
                    filter === c
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {LOOP_ATLAS_CATEGORIES[c].label}
                </button>
              ))}
            </div>
            <nav className="rounded-xl border border-border/50 bg-card/40 p-2 max-h-[60vh] overflow-y-auto">
              {list.map(l => (
                <button
                  key={l.slug}
                  onClick={() => setOpen(l.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    active?.slug === l.slug
                      ? "bg-violet-500/15 text-violet-100"
                      : "text-foreground/75 hover:bg-card/60 hover:text-foreground"
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* CONTENT */}
          {active && (
            <motion.article
              key={active.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden"
            >
              <div className={`px-6 md:px-10 pt-8 pb-6 bg-gradient-to-br ${LOOP_ATLAS_CATEGORIES[active.category].color}`}>
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/90 mb-1">
                  {LOOP_ATLAS_CATEGORIES[active.category].label}
                </div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white">{active.name}</h2>
                <div className="mt-1 text-amber-200/80 italic text-sm" style={{ fontFamily: "serif" }}>
                  {active.ancientName}
                </div>
                <p className="mt-4 text-lg text-white/90 italic">"{active.oneLine}"</p>
              </div>

              <div className="px-6 md:px-10 py-8 space-y-6">
                {[
                  { label: "Trigger", body: active.trigger, color: "amber" },
                  { label: "How it shows up", body: active.manifestation, color: "rose" },
                  { label: "What's happening in the nervous system", body: active.neuroscience, color: "cyan" },
                  { label: "What the lineage said about it", body: active.ancientDiagnosis, color: "violet" },
                  { label: "The dissolution", body: active.dissolution, color: "emerald" },
                  { label: "Sign of healing", body: active.signOfHealing, color: "amber" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <div className={`text-[10px] uppercase tracking-[0.2em] text-${s.color}-300/80 mb-1.5`}>
                      {s.label}
                    </div>
                    <p className="text-sm md:text-base text-foreground/85 leading-relaxed whitespace-pre-line">{s.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.article>
          )}
        </div>

        <section className="max-w-3xl mx-auto px-4 pb-20 text-center border-t border-border/40 pt-10">
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
            Inside the app, the engine watches which of these loops is firing in your week —
            and the practices adapt to the one most alive.
          </p>
          <Link
            to="/loops"
            className="inline-block px-7 py-3 rounded-full bg-violet-500/20 border border-violet-500/50 text-violet-100 hover:bg-violet-500/30 transition text-sm"
          >
            See the full 300+ loop library →
          </Link>
        </section>
      </main>
    </>
  );
};

export default ExperienceLoopsAtlas;
