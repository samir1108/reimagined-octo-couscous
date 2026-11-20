import { motion } from "framer-motion";
import { Crown, Users, BookOpen, Zap, HeartPulse, MessageCircleHeart } from "lucide-react";
import { Badge } from "@/design-system";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0, 0, 0.2, 1] as const },
  }),
};

const programs = [
  {
    icon: Crown,
    title: "Conscious Leadership",
    desc: "Move beyond ego-driven management. AI maps your leadership blind spots, reveals unconscious patterns, and guides you from reactive authority to conscious influence.",
    who: "C-Suite, VPs",
    format: "1-on-1 AI Coaching",
  },
  {
    icon: Users,
    title: "Team Coherence Practices",
    desc: "Measure real-time team synchrony and psychological safety. When teams are conscious together, collaboration flows — no forcing required.",
    who: "Teams of 5–20",
    format: "Weekly Group Sessions",
  },
  {
    icon: BookOpen,
    title: "Knowledge Sessions",
    desc: "Consciousness lunch-and-learns, department micro-trainings, and curated wisdom series. Transform break time into breakthrough time.",
    who: "All Employees",
    format: "30-min Sessions",
  },
  {
    icon: Zap,
    title: "Peak Performance",
    desc: "Train flow states on demand. AI-guided focus optimization, decision clarity exercises, and deep work rituals tailored to individual rhythms.",
    who: "Individual Contributors",
    format: "Daily Practices",
  },
  {
    icon: HeartPulse,
    title: "Burnout Prevention",
    desc: "AI detects burnout patterns weeks before they manifest. Proactive micro-interventions replace reactive sick days. Protect your people before they break.",
    who: "Managers + HR",
    format: "Real-time Alerts",
  },
  {
    icon: MessageCircleHeart,
    title: "Conscious Communication",
    desc: "Active listening with AI feedback, non-violent communication training, and empathy development. Transform conflicts into connections.",
    who: "Cross-functional Teams",
    format: "Workshop Series",
  },
];

const EnterpriseProgramsSection = () => (
  <section className="relative py-24 md:py-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px]" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-14 md:mb-18"
      >
        <motion.p variants={fadeUp} custom={0} className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4">
          Corporate Programs
        </motion.p>
        <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 font-display">
          Programs No Other Platform{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Can Offer
          </span>
        </motion.h2>
        <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Six consciousness-based programs designed for the modern workplace. Each one backed by AI, ancient wisdom, and measurable outcomes.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
      >
        {programs.map((p, i) => (
          <motion.div
            key={p.title}
            variants={fadeUp}
            custom={i}
            className="group relative p-6 md:p-7 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-display">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary/80">
                  {p.who}
                </Badge>
                <Badge variant="outline" className="text-xs border-secondary/30 text-secondary/80">
                  {p.format}
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default EnterpriseProgramsSection;
