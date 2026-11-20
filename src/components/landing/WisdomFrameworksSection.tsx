import { motion } from "framer-motion";
import { Layers, Route, Zap, Search, Eye, Sparkles } from "lucide-react";
import { BrandName } from "@/components/BrandName";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const frameworks = [
  {
    icon: Layers,
    title: "5 Bodies (Pancha Kosha)",
    origin: "Sadhguru · Vedantic Tradition",
    desc: "Physical, Energy, Mental, Wisdom, and Bliss bodies — we track your progress across all five sheaths, not just the mind.",
  },
  {
    icon: Route,
    title: "4 Paths of Yoga",
    origin: "Swami Vivekananda",
    desc: "Karma, Bhakti, Jnana, and Raja Yoga — our engine identifies which path resonates with your nature and guides accordingly.",
  },
  {
    icon: Zap,
    title: "7 Chakra System",
    origin: "Tantric · Yogic Tradition",
    desc: "From root survival to crown transcendence — energy center awareness is woven into our observation tasks and body practices.",
  },
  {
    icon: Search,
    title: "Self-Inquiry (Atma Vichara)",
    origin: "Ramana Maharshi",
    desc: '"Who am I?" — the most direct path. Our Guide uses this method to help you dissolve identification with thought patterns.',
  },
  {
    icon: Eye,
    title: "Choiceless Observation",
    origin: "Jiddu Krishnamurti",
    desc: "Watching without the watcher — our awareness exercises train you to observe thoughts, emotions, and sensations without judgment or choice.",
  },
  {
    icon: Sparkles,
    title: "Witness Consciousness",
    origin: "Nisargadatta Maharaj",
    desc: '"I Am That" — the art of resting as the witness. Our consciousness bands map your journey from identification to pure awareness.',
  },
];

const WisdomFrameworksSection = () => (
  <section className="py-32 px-6 relative">
    <div className="max-w-6xl mx-auto">
      <motion.p
        className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        What We Work Through
      </motion.p>
      <motion.h2
        className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        Ancient Wisdom, <span className="text-gradient-sunrise">Modern Technology</span>
      </motion.h2>
      <motion.p
        className="text-lg font-body font-light text-muted-foreground text-center max-w-2xl mx-auto mb-16"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
      >
        <BrandName /> doesn't invent a new path — it integrates the deepest frameworks
        humanity has discovered and makes them actionable through AI.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks.map((f, i) => (
          <motion.div
            key={f.title}
            className="group p-8 rounded-2xl border border-border/40 bg-card/20 hover:border-primary/20 hover:bg-card/40 transition-all duration-500"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 3}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:scale-110 transition-all">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-xs font-body text-primary/60 mb-3">{f.origin}</p>
            <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WisdomFrameworksSection;
