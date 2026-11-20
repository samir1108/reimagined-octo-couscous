import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { ASHTANGA_LADDER, SECONDARY_LADDERS } from "@/data/prerequisites";

const ExperiencePrerequisites = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="The Prerequisites Map — You Can't Skip Steps"
        description="Patañjali's eight limbs as a working diagram. Why meditation requires the six limbs before it, and what to do at each one. Plus the prerequisite ladders for peace, healing, enlightenment, love. Free, no signup."
        canonicalPath="/experience/prerequisites"
        keywords="ashtanga yoga, eight limbs, yama, niyama, asana, pranayama, pratyahara, dharana, dhyana, samadhi"
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-background to-sky-900/20" />
          <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-16">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-emerald-300/80">
                <ListOrdered className="w-3.5 h-3.5" /> The Prerequisites Map
              </div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                You cannot skip steps.
              </h1>
              <p className="mt-5 text-base md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
                Most people start at the seventh limb and wonder why nothing deepens.
                Here is the actual ladder — Patañjali's eight steps to meditation, with the modern translation
                of what each one looks like for a phone-era life.
              </p>
            </motion.div>
          </div>
        </section>

        {/* THE GOAL */}
        <section className="max-w-3xl mx-auto px-4 pt-12">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 mb-2">What people say</div>
            <p className="text-2xl md:text-3xl font-light italic text-amber-100">"{ASHTANGA_LADDER.goal}"</p>
            <div className="mt-5 text-[10px] uppercase tracking-[0.2em] text-emerald-300/80 mb-2">What it actually requires</div>
            <p className="text-base text-foreground/85 leading-relaxed">{ASHTANGA_LADDER.reality}</p>
          </div>
        </section>

        {/* LADDER */}
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-12 space-y-6">
          {ASHTANGA_LADDER.steps.map((s, i) => (
            <motion.section
              key={s.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-6 md:p-8"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex flex-col items-center justify-center">
                  <div className="text-[10px] text-emerald-300/70">limb</div>
                  <div className="text-lg font-light text-emerald-100">{s.number}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-amber-200/75 italic text-sm mb-1" style={{ fontFamily: "serif" }}>{s.sanskrit}</div>
                  <h2 className="text-xl md:text-2xl font-light tracking-tight">{s.name}</h2>
                  <p className="mt-2 text-base text-amber-100/80 italic">{s.oneLine}</p>
                  <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{s.why}</p>
                  <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-sky-300/80 mb-1.5">What this looks like today</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{s.modernGloss}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* WARNING */}
        <section className="max-w-3xl mx-auto px-4">
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300/80 mb-2">The warning</div>
            <p className="text-base md:text-lg text-foreground/85 leading-relaxed italic">{ASHTANGA_LADDER.warning}</p>
          </div>
        </section>

        {/* SECONDARY LADDERS */}
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-12">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2">Other things people want.</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-xl">
            Same structure. Same news. There is always something before the thing.
          </p>
          <div className="space-y-5">
            {SECONDARY_LADDERS.map((l) => (
              <motion.div
                key={l.goal}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-xl border border-border/50 bg-card/50 p-5"
              >
                <div className="text-base md:text-lg font-light italic text-amber-100/90">"{l.goal}"</div>
                <ul className="mt-3 space-y-2">
                  {l.mustDoFirst.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-[10px] text-emerald-200">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-20 border-t border-border/40 pt-10 mt-6 text-center">
          <Link
            to="/experience/glossary"
            className="inline-block px-7 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-100 hover:bg-emerald-500/30 transition text-sm"
          >
            Read what these words actually mean →
          </Link>
        </section>
      </main>
    </>
  );
};

export default ExperiencePrerequisites;
