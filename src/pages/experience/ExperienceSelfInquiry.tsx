import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { SELF_INQUIRY_LADDER } from "@/data/selfInquiryLadder";

const ExperienceSelfInquiry = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  return (
    <>
      <Seo
        title="Self-Inquiry — Ramana Maharshi's ātma-vichāra in 5 levels"
        description="The original 'Who am I?' inquiry, made walkable. Five levels with teachings, micro-practices, and the traps to avoid. Free."
        canonicalPath="/experience/self-inquiry"
        keywords="self inquiry, atma vichara, who am i, ramana maharshi, advaita, vedanta"
      />
      <main className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-background to-rose-900/20" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-rose-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
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
                <HelpCircle className="w-3.5 h-3.5" /> ātma vichāra
              </div>
              <div className="text-4xl md:text-6xl text-amber-200/80 mb-2" style={{ fontFamily: "serif" }}>कोऽहम्</div>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight">
                Who am I?
              </h1>
              <p className="mt-4 text-base md:text-xl text-foreground/75 max-w-2xl leading-relaxed">
                Ramana Maharshi's life-question, in five walkable levels.
                The trick: it is not a question to be answered. It is a doorway to be walked through.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/experience/self-inquiry/session"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400/90 text-black font-medium hover:bg-amber-300 transition shadow-[0_0_60px_-10px_rgba(251,191,36,0.6)]"
                >
                  ▶ Begin a live guided inquiry
                </Link>
                <span className="self-center text-xs text-foreground/50">9 minutes · voice-guided · free</span>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 py-12 pb-20 space-y-8">
          {SELF_INQUIRY_LADDER.map((lvl, i) => (
            <motion.section
              key={lvl.level}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative rounded-2xl border border-amber-500/20 bg-card/60 backdrop-blur p-6 md:p-10 overflow-hidden"
            >
              <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.25em] text-amber-400/80 mb-2">Level {lvl.level}</div>
                {lvl.sanskrit && (
                  <div className="text-2xl text-amber-200/70 italic mb-2" style={{ fontFamily: "serif" }}>{lvl.sanskrit}</div>
                )}
                <h2 className="text-3xl md:text-4xl font-light tracking-tight">{lvl.question}</h2>
                <p className="mt-3 text-base md:text-lg text-amber-100/80 italic border-l-2 border-amber-500/40 pl-4">
                  {lvl.oneLine}
                </p>

                <div className="mt-6 prose prose-invert prose-base max-w-none">
                  {lvl.teaching.split("\n\n").map((para, k) => (
                    <p key={k} className="text-foreground/85 leading-relaxed">{para}</p>
                  ))}
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80 mb-2">Micro-practice</div>
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

          <section className="border-t border-border/40 pt-10 text-center">
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-5">
              Inside the app, Ramana himself walks you through the inquiry — turn by turn,
              answering your specific resistance, in your own language.
            </p>
            <Link
              to="/auth"
              className="inline-block px-7 py-3 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-100 hover:bg-amber-500/30 transition text-sm"
            >
              Sit with Ramana
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default ExperienceSelfInquiry;
