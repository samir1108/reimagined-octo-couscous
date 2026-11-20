import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { EXPERIENCE_PRACTICES } from "@/data/experiencePractices";
import { useState } from "react";

const ExperiencePractices = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <>
      <Seo
        title="The Daily 12 — contemplative practices, free, no signup"
        description="Twelve standalone practices from the world's contemplative traditions. Witness, mettā, body scan, ātma vichāra, yoga nidrā, trāṭaka — full step-by-step instructions in plain English."
        canonicalPath="/experience/practices"
        keywords="contemplative practices, meditation instructions, witness practice, body scan, loving kindness, self inquiry, yoga nidra"
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-14">
          <button
            onClick={() => navigate("/experience")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <header className="mt-6 mb-12 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400/90">The Daily 12</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-light tracking-tight">
              Practices, in plain words.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
              Twelve standalone practices, distilled from five thousand years of contemplative work,
              with step-by-step instructions you can follow right now. No app needed.
              Use them as daily tools or whenever the moment asks.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-4">
            {EXPERIENCE_PRACTICES.map((practice, i) => {
              const isOpen = openSlug === practice.slug;
              return (
                <motion.div
                  key={practice.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className={`rounded-2xl border bg-card/60 backdrop-blur transition overflow-hidden ${
                    isOpen ? "border-emerald-500/40 md:col-span-2" : "border-border/50 hover:border-emerald-500/30"
                  }`}
                >
                  <button
                    onClick={() => setOpenSlug(isOpen ? null : practice.slug)}
                    className="w-full text-left p-5 md:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl shrink-0">{practice.symbol}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <div className="text-[10px] uppercase tracking-wider text-emerald-400/80">{practice.tradition}</div>
                          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {practice.durationMin} min
                          </span>
                        </div>
                        <h3 className="mt-1 text-lg md:text-xl font-medium">
                          {practice.name}
                          {practice.sanskrit && (
                            <span className="ml-2 text-sm text-muted-foreground" style={{ fontFamily: "serif" }}>
                              {practice.sanskrit}
                            </span>
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-foreground/75 leading-snug">{practice.oneLine}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground italic">{practice.whenToUse}</p>
                      </div>
                      <span className="text-xs text-emerald-400/70 shrink-0 mt-1">
                        {isOpen ? "Close" : "Open"}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="border-t border-border/30"
                    >
                      {practice.image && (
                        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                          <img
                            src={practice.image}
                            alt={practice.name}
                            loading="lazy"
                            width={1536}
                            height={896}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                        </div>
                      )}
                      <div className="px-5 md:px-6 pb-6 md:pb-8 pt-5">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-3">How to practice</div>
                        <ol className="space-y-3">
                          {practice.instructions.map((step, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-foreground/85 leading-relaxed">
                              <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        <div className="mt-6 pt-5 border-t border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            AI-composed script · real voice · Deepgram
                          </div>
                          <Link
                            to={`/experience/practices/${practice.slug}/session`}
                            className="group inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-400 text-black text-sm font-medium hover:bg-emerald-300 transition"
                          >
                            Begin live session
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <section className="border-t border-border/40 pt-10 mt-12 text-center space-y-5">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Or sit now in a live, voice-guided session — free, no signup.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to="/experience/observation/session" className="px-4 py-2 rounded-full bg-amber-300 text-black text-xs font-medium hover:bg-amber-200 transition">🌅 The Witness</Link>
              <Link to="/experience/self-inquiry/session" className="px-4 py-2 rounded-full bg-rose-300 text-black text-xs font-medium hover:bg-rose-200 transition">🪔 Who am I?</Link>
              <Link to="/experience/neti-neti/session" className="px-4 py-2 rounded-full bg-emerald-300 text-black text-xs font-medium hover:bg-emerald-200 transition">🪞 Neti Neti</Link>
              <Link to="/experience/pranayama/session" className="px-4 py-2 rounded-full bg-cyan-300 text-black text-xs font-medium hover:bg-cyan-200 transition">🌬 Nāḍī Śodhana</Link>
              <Link to="/experience/mantra/session" className="px-4 py-2 rounded-full bg-orange-300 text-black text-xs font-medium hover:bg-orange-200 transition">📿 So'ham Japa</Link>
            </div>
            <div>
              <Link
                to="/auth"
                className="inline-block mt-3 px-7 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-100 hover:bg-emerald-500/30 transition text-sm"
              >
                Practice with a personal guide →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperiencePractices;
