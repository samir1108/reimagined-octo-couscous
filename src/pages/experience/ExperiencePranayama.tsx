import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wind } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { PRANAYAMA_LADDER } from "@/data/pranayamaLadder";

const ExperiencePranayama = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="The Pranayama Ladder — 7 levels from breath awareness to kevala kumbhaka"
        description="The complete map of yogic breath, in seven walkable levels. From feeling the breath, through alternate nostril and retention, to spontaneous stillness. Free."
        canonicalPath="/experience/pranayama"
        keywords="pranayama, breathwork, nadi shodhana, kumbhaka, kevala kumbhaka, hatha yoga, patanjali, breath meditation"
      />
      <main className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/25 via-background to-teal-900/25" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-16">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-amber-300/80">
                <Wind className="w-3.5 h-3.5" /> The Pranayama Ladder
              </div>
              <div className="text-4xl md:text-6xl text-amber-200/80 mb-2" style={{ fontFamily: "serif" }}>प्राणायाम</div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                Seven levels of breath.
              </h1>
              <p className="mt-4 text-base md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
                From feeling the breath that is already happening, to the moment the breath
                stops by itself and stillness remains. The complete yogic map.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 pb-20 space-y-8">
          {PRANAYAMA_LADDER.map((lvl, i) => (
            <motion.section
              key={lvl.level}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur p-6 md:p-10 overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-200 text-sm font-light">
                    {lvl.level}
                  </div>
                  {lvl.sanskrit && (
                    <span className="text-sm text-amber-200/70 italic" style={{ fontFamily: "serif" }}>{lvl.sanskrit}</span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-light tracking-tight">{lvl.title}</h2>
                <p className="mt-2 text-base md:text-lg text-amber-100/80 italic border-l-2 border-amber-500/40 pl-4">
                  {lvl.oneLine}
                </p>

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
                  <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-teal-300/80 mb-2">Sign of readiness</div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{lvl.signOfReadiness}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          <section className="border-t border-border/40 pt-10 text-center space-y-5">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Sit with the breath now — a free, voice-guided Nāḍī Śodhana. The orb breathes with you.
            </p>
            <Link
              to="/experience/pranayama/session"
              className="inline-block px-7 py-3 rounded-full bg-cyan-300 text-black font-medium hover:bg-cyan-200 transition text-sm shadow-[0_0_50px_-10px_rgba(103,232,249,0.6)]"
            >
              Begin a live guided session →
            </Link>
            <div>
              <Link
                to="/auth"
                className="inline-block mt-2 px-5 py-2 rounded-full border border-amber-500/40 text-amber-100/90 hover:bg-amber-500/10 transition text-xs uppercase tracking-[0.2em]"
              >
                Find your level inside the app
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperiencePranayama;
