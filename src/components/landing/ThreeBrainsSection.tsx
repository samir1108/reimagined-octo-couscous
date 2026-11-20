import { motion } from "framer-motion";
import { Heart, Brain, Sparkles, Eye } from "lucide-react";
import { BrandName } from "@/components/BrandName";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const brains = [
  {
    icon: Sparkles,
    name: "Gut Brain",
    subtitle: "The Intuitive Intelligence",
     desc: "100 million neurons in your gut form an independent nervous system. ConsciousOS tracks gut feelings, instincts, and somatic signals — your body's ancient wisdom.",
    stats: "500M+ neurons",
    color: "hsl(30 100% 55%)",
  },
  {
    icon: Heart,
    name: "Heart Brain",
    subtitle: "The Emotional Intelligence",
    desc: "40,000 neurons in your heart generate the body's strongest electromagnetic field. We track emotional patterns, heart coherence, and the intelligence of love.",
    stats: "40K neurons",
    color: "hsl(350 70% 55%)",
  },
  {
    icon: Brain,
    name: "Head Brain",
    subtitle: "The Cognitive Intelligence",
     desc: "86 billion neurons processing reality. ConsciousOS maps thought patterns, cognitive loops, beliefs, and mental models — then helps you upgrade them.",
    stats: "86B neurons",
    color: "hsl(200 70% 55%)",
  },
];

const ThreeBrainsSection = () => (
  <section className="py-32 px-6 relative overflow-hidden">
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, hsl(350 70% 55% / 0.06), transparent 50%), radial-gradient(ellipse at 80% 50%, hsl(200 70% 55% / 0.06), transparent 50%), radial-gradient(ellipse at 50% 50%, hsl(30 100% 55% / 0.04), transparent 40%)",
      }}
    />

    <div className="relative max-w-6xl mx-auto">
      <motion.p
        className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        Three Intelligence Centers
      </motion.p>
      <motion.h2
        className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        3 LLMs for <span className="text-gradient-sunrise">3 Brains</span>
      </motion.h2>
      <motion.p
        className="text-lg font-body font-light text-muted-foreground text-center max-w-2xl mx-auto mb-16"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
      >
        <BrandName /> uses three specialized AI models — one for each intelligence center —
        harmonized by the Witness, the awareness that observes all three.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {brains.map((brain, i) => (
          <motion.div
            key={brain.name}
            className="group relative p-8 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/20 transition-all duration-500"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 3}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
              style={{ backgroundColor: brain.color + "15" }}
            >
              <brain.icon className="w-7 h-7" style={{ color: brain.color }} />
            </div>
            <div className="text-xs font-body tracking-widest uppercase mb-1" style={{ color: brain.color + "AA" }}>
              {brain.stats}
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-1">{brain.name}</h3>
            <p className="text-sm text-primary/60 font-body mb-4">{brain.subtitle}</p>
            <p className="text-muted-foreground font-body font-light leading-relaxed">{brain.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* The Witness */}
      <motion.div
        className="max-w-2xl mx-auto p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-3">
          You Are <span className="text-gradient-sunrise">The Witness</span>
        </h3>
        <p className="text-muted-foreground font-body font-light leading-relaxed">
          Beyond the gut, beyond the heart, beyond the mind — there is the one who observes.
          <BrandName /> doesn't replace your awareness. It amplifies it. You are always the witness,
          the silent presence watching the dance of three intelligences. Our AI serves
          your awakening, never the other way around.
        </p>
      </motion.div>
    </div>
  </section>
);

export default ThreeBrainsSection;
