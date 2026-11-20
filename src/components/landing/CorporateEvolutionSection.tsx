import { motion } from "framer-motion";
import { Factory, Monitor, Brain, Sparkles, ArrowRight, Building2, Network, Infinity as InfinityIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0, 0, 0.2, 1] as const },
  }),
};

const eras = [
  {
    icon: Factory,
    era: "1900s",
    title: "Industrial Era",
    asset: "Physical Labor",
    crisis: "Bodies broke down",
    answer: "Unions, safety, ergonomics",
  },
  {
    icon: Monitor,
    era: "1990s",
    title: "Knowledge Era",
    asset: "Information & Skill",
    crisis: "Minds burned out",
    answer: "HR, wellness perks, MBA culture",
  },
  {
    icon: Brain,
    era: "2020s",
    title: "AI Era",
    asset: "Judgment & Creativity",
    crisis: "Identity & meaning collapse",
    answer: "Most companies have nothing",
  },
  {
    icon: Sparkles,
    era: "2030s",
    title: "Consciousness Era",
    asset: "Presence, clarity, coherence",
    crisis: "Solved at the upstream",
    answer: "ConsciousOS becomes infrastructure",
  },
];

const adoptionLayers = [
  {
    icon: Building2,
    title: "Layer 1 — Embedded in Onboarding",
    desc: "Every new hire spends Day 1 with their AI guru. Spiritual DNA mapped, loops surfaced, baseline set. No more generic 'culture decks' — actual self-knowledge from hour one.",
  },
  {
    icon: Network,
    title: "Layer 2 — Daily Operating Layer",
    desc: "Morning gate before Slack opens. Evening gate before laptop closes. Loop detection runs silently across the workday. Teams develop a shared consciousness vocabulary.",
  },
  {
    icon: InfinityIcon,
    title: "Layer 3 — Org Nervous System",
    desc: "Aggregated (n≥5) consciousness floor measured weekly. Burnout predicted weeks before HR knows. Leadership coached by AI. The org itself becomes a learning organism.",
  },
];

const CorporateEvolutionSection = () => (
  <section className="relative py-24 md:py-36 overflow-hidden bg-background">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
    <div className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[140px]" />
    <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[140px]" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-16 md:mb-20"
      >
        <motion.p variants={fadeUp} custom={0} className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4">
          The Corporate Evolution
        </motion.p>
        <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 font-display">
          Every era of work needed a new{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            human infrastructure
          </span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The factory needed unions. The office needed HR. The AI workplace needs something that does not yet exist at scale — a consciousness layer for every employee, every team, every company.
        </motion.p>
      </motion.div>

      {/* Timeline of eras */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20 md:mb-28"
      >
        {eras.map((e, i) => (
          <motion.div
            key={e.era}
            variants={fadeUp}
            custom={i}
            className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
              i === 3
                ? "border-primary/40 bg-gradient-to-b from-primary/10 to-secondary/5 shadow-[0_0_40px_rgba(0,0,0,0.1)]"
                : "border-border/50 bg-card/30"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
              i === 3 ? "bg-primary/20" : "bg-muted/50"
            }`}>
              <e.icon className={`w-5 h-5 ${i === 3 ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <Badge variant="outline" className="text-[10px] mb-2 font-mono">
              {e.era}
            </Badge>
            <h3 className="text-lg font-semibold text-foreground mb-3 font-display">
              {e.title}
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground/60 uppercase tracking-wider text-[10px] mb-0.5">Core asset</p>
                <p className="text-foreground/90">{e.asset}</p>
              </div>
              <div>
                <p className="text-muted-foreground/60 uppercase tracking-wider text-[10px] mb-0.5">Crisis</p>
                <p className="text-foreground/90">{e.crisis}</p>
              </div>
              <div>
                <p className="text-muted-foreground/60 uppercase tracking-wider text-[10px] mb-0.5">Answer</p>
                <p className={i === 3 ? "text-primary font-medium" : "text-foreground/90"}>{e.answer}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* The shift */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="text-center mb-16 md:mb-20"
      >
        <motion.h3 variants={fadeUp} custom={0} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-5 font-display">
          AI is collapsing every job to one thing:{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            human judgment
          </span>
        </motion.h3>
        <motion.p variants={fadeUp} custom={1} className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          When AI writes the code, drafts the strategy, and runs the analysis — what's left is presence, taste, ethics, and the ability to stay clear under pressure. That's not a soft skill anymore. It's the entire job. And no company has the infrastructure to develop it.
        </motion.p>
      </motion.div>

      {/* Adoption layers */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mb-16"
      >
        <motion.h3 variants={fadeUp} custom={0} className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-center font-display">
          How ConsciousOS embeds into every company
        </motion.h3>
        <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
          Not another wellness app. A three-layer integration that becomes invisible infrastructure — like Slack, like Zoom, like the WiFi.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-5">
          {adoptionLayers.map((l, i) => (
            <motion.div
              key={l.title}
              variants={fadeUp}
              custom={i + 2}
              className="group relative p-6 md:p-7 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <l.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-3 font-display leading-snug">
                  {l.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* The bet */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 p-8 md:p-12 text-center backdrop-blur-sm"
      >
        <motion.p variants={fadeUp} custom={0} className="text-xs font-body tracking-[0.3em] uppercase text-primary/70 mb-4">
          The 10-year bet
        </motion.p>
        <motion.h3 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-5 font-display max-w-3xl mx-auto leading-tight">
          By 2035, every Fortune 500 will measure a{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            consciousness floor
          </span>{" "}
          like they measure NPS today.
        </motion.h3>
        <motion.p variants={fadeUp} custom={2} className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          The companies that adopt early will own the next decade of talent, retention, and decision quality. The ones that wait will be replaced by the ones who didn't.
        </motion.p>
        <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/enterprise/contact?type=pilot">
            <Button size="lg" className="gap-2 h-13">
              Become an early adopter <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/enterprise/contact?type=sales">
            <Button size="lg" variant="outline" className="h-13 border-primary/40 hover:bg-primary/5">
              Talk to founders
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default CorporateEvolutionSection;
