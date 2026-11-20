import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { NETI_NETI_LADDER } from "@/data/netiNetiLadder";

const ExperienceNetiNeti = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="Neti Neti — The 5 levels of 'not this, not this'"
        description="The Upanishadic via negativa, made walkable. Five levels of precise discrimination — body, emotion, thought, witness, and what remains. Free."
        canonicalPath="/experience/neti-neti"
        keywords="neti neti, via negativa, upanishads, advaita, self-inquiry, brihadaranyaka, tat tvam asi"
      />
      <main className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-background to-slate-900/40" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-slate-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-16">
            <button
              onClick={() => navigate("/experience")}
              className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-emerald-300/80">
                <Flame className="w-3.5 h-3.5" /> neti neti
              </div>
              <div className="text-4xl md:text-6xl text-emerald-200/80 mb-2" style={{ fontFamily: "serif" }}>नेति नेति</div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                Not this, not this.
              </h1>
              <p className="mt-4 text-base md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
                The Upanishadic instruction in five precise levels. Refuse every false answer
                until what remains cannot be refused — because it is what is doing the refusing.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 pb-20 space-y-8">
          {NETI_NETI_LADDER.map((lvl, i) => (
            <motion.section
              key={lvl.level}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative rounded-2xl border border-emerald-500/20 bg-card/60 backdrop-blur p-6 md:p-10 overflow-hidden"
            >
              <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 mb-2">Level {lvl.level}</div>
                {lvl.sanskrit && (
                  <div className="text-2xl text-emerald-200/70 italic mb-2" style={{ fontFamily: "serif" }}>{lvl.sanskrit}</div>
                )}
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">{lvl.question}</h2>
                <p className="mt-3 text-base md:text-lg text-emerald-100/80 italic border-l-2 border-emerald-500/40 pl-4">
                  {lvl.oneLine}
                </p>

                <div className="mt-6 prose prose-invert prose-base max-w-none">
                  {lvl.teaching.split("\n\n").map((para, k) => (
                    <p key={k} className="text-foreground/85 leading-relaxed">{para}</p>
                  ))}
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-sky-300/80 mb-2">Micro-practice</div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{lvl.microPractice}</p>
                  </div>
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300/80 mb-2">Common trap</div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{lvl.commonTrap}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          <section className="border-t border-border/40 pt-10 text-center space-y-5">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Sit with Shankara now — a free, voice-guided ten-step negation. Around nine minutes.
            </p>
            <Link
              to="/experience/neti-neti/session"
              className="inline-block px-7 py-3 rounded-full bg-emerald-300 text-black font-medium hover:bg-emerald-200 transition text-sm shadow-[0_0_50px_-10px_rgba(110,231,183,0.6)]"
            >
              Begin a live guided session →
            </Link>
            <div>
              <Link
                to="/auth"
                className="inline-block mt-2 px-5 py-2 rounded-full border border-emerald-500/40 text-emerald-100/90 hover:bg-emerald-500/10 transition text-xs uppercase tracking-[0.2em]"
              >
                Go deeper inside the app
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperienceNetiNeti;
