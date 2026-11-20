import { motion } from "framer-motion";
import { Eye, Heart, Brain, Briefcase, Wallet, Users, Activity, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const domains = [
  { icon: Brain, label: "Thoughts" },
  { icon: Heart, label: "Emotions" },
  { icon: Activity, label: "Behaviors" },
  { icon: Users, label: "Relationships" },
  { icon: Activity, label: "Health" },
  { icon: Briefcase, label: "Career" },
  { icon: Wallet, label: "Finance" },
  { icon: Sparkles, label: "Spirituality" },
];

const MissionSection = () => (
  <section id="mission" className="py-32 px-6 relative">
    <div className="max-w-5xl mx-auto text-center">
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-sm font-body text-primary tracking-wide">Our Mission</span>
      </motion.div>

      <motion.h2
        className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 text-foreground leading-tight"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        To help humanity{" "}
        <span className="text-gradient-sunrise">observe, understand,</span>
        <br className="hidden md:block" />
        and <span className="text-gradient-sunrise">transform</span> unconscious patterns
      </motion.h2>

      <motion.p
        className="text-lg md:text-xl font-body font-light text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
      >
        Through AI-powered consciousness development — one observation at a time. We track{" "}
        <span className="text-foreground font-medium">everything</span> through observation,
        across every dimension of your life.
      </motion.p>

      {/* Domain Pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mt-12"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
      >
        {domains.map((d, i) => (
          <motion.div
            key={d.label}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
          >
            <d.icon className="w-4 h-4 text-primary/70" />
            <span className="text-sm font-body text-foreground/80">{d.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>

    <motion.div
      className="w-px h-24 bg-gradient-to-b from-primary/50 to-transparent mx-auto mt-20"
      initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
    />
  </section>
);

export default MissionSection;
