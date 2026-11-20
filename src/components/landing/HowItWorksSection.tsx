import { motion } from "framer-motion";
import { Eye, Search, Repeat, Zap, Sun, Moon } from "lucide-react";
import cosmicEye from "@/assets/cosmic-eye.jpg";
import { BrandName } from "@/components/BrandName";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const steps = [
  {
    icon: Eye,
    title: "Observe",
    desc: "Your AI companion helps you notice thoughts, emotions, and patterns as they arise throughout your day. No judgment — just awareness.",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Search,
    title: "Understand",
    desc: "ConsciousOS maps your observations across 150+ psychological loops, revealing the hidden architecture of your unconscious patterns.",
    color: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Repeat,
    title: "Transform",
    desc: "With clarity comes choice. Break free from automatic reactions and consciously choose new responses aligned with your highest self.",
    color: "from-primary/20 to-golden/5",
  },
];

const dailyFlow = [
  { icon: Sun, time: "Morning", desc: "Set intentions, receive your daily theme, and prepare your consciousness for the day ahead." },
  { icon: Eye, time: "Throughout Day", desc: "Observe patterns in real-time. Your AI companion gently prompts awareness of recurring loops." },
  { icon: Zap, time: "Practice", desc: "Engage in guided meditations, breathwork, and consciousness exercises tailored to your level." },
  { icon: Moon, time: "Evening", desc: "Reflect on observations, journal insights, and track your growth across all life domains." },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
    {/* Background image */}
    <div className="absolute inset-0 opacity-10">
      <img src={cosmicEye} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-background/90" />

    <div className="relative max-w-6xl mx-auto">
      <motion.p
        className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        How It Works
      </motion.p>
      <motion.h2
        className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        Your AI <span className="text-gradient-sunrise">Consciousness Companion</span>
      </motion.h2>
      <motion.p
        className="text-lg font-body font-light text-muted-foreground text-center max-w-2xl mx-auto mb-16"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
      >
        <BrandName /> isn't just an app — it's a companion that walks beside you on your journey of self-discovery.
      </motion.p>

      {/* Three Step Process */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="relative group"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 3}
          >
            <div className={`p-8 rounded-2xl bg-gradient-to-b ${step.color} border border-border/50 hover:border-primary/30 transition-all duration-500 h-full`}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-xs font-body tracking-[0.2em] uppercase text-primary/60 mb-2 block">
                Step {i + 1}
              </span>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground font-body font-light leading-relaxed">{step.desc}</p>
            </div>
            {i < 2 && (
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/30 to-transparent" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Daily Flow */}
      <motion.h3
        className="text-3xl font-display font-bold mb-12 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        Your <span className="text-gradient-sunrise">Daily Flow</span>
      </motion.h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

        {dailyFlow.map((item, i) => (
          <motion.div
            key={item.time}
            className={`relative flex items-start gap-8 mb-12 ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
          >
            <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
              <div className={`p-6 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/20 transition-all inline-block ${i % 2 === 0 ? "md:ml-auto" : ""}`}>
                <span className="text-xs font-body tracking-[0.2em] uppercase text-primary/70 block mb-1">{item.time}</span>
                <p className="text-muted-foreground font-body font-light leading-relaxed max-w-sm">{item.desc}</p>
              </div>
            </div>
            {/* Center dot */}
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary glow-sunrise mt-6" />
            <div className="flex-1 hidden md:block" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
