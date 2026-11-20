import { motion } from "framer-motion";
import { Watch, Headphones, Radio, Cpu, Globe, Infinity as InfinityIcon } from "lucide-react";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";
import { BrandName } from "@/components/BrandName";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const visionItems = [
  {
    icon: Watch,
    title: "Consciousness Wearables",
    desc: "Smart bands and watches that continuously track biometric markers of awareness — HRV, brainwaves, skin conductance — feeding real-time data to your consciousness profile.",
  },
  {
    icon: Headphones,
    title: "Always-Listening Companion",
    desc: "An ambient AI that listens to your conversations (with consent), detects unconscious loops in real-time, and gently nudges you toward awareness through subtle haptic feedback.",
  },
  {
    icon: Radio,
    title: "The Consciousness Band™",
    desc: "A new wearable device we're developing — a headband that maps brainwave patterns to our 8-band consciousness model, giving you a real-time readout of your awareness level.",
  },
  {
    icon: Cpu,
    title: "Neural Interface Research",
    desc: "Long-term research into direct neural interfaces that could accelerate consciousness development — making decades of meditation progress accessible in weeks.",
  },
  {
    icon: Globe,
    title: "Global Consciousness Network",
    desc: "Connecting millions of conscious practitioners worldwide to create a measurable field of collective awareness — tracking the evolution of human consciousness as a species.",
  },
  {
    icon: InfinityIcon,
    title: "Open Consciousness Protocol",
    desc: "An open-source standard for consciousness data — ensuring your inner journey is never locked into one platform. Your awareness belongs to you.",
  },
];

const VisionSection = () => (
  <section id="vision" className="py-32 px-6 relative overflow-hidden">
    <div className="absolute inset-0 opacity-15">
      <img src={cosmicNebula} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-background/90" />

    <div className="relative max-w-6xl mx-auto">
      <motion.p
        className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        The Future
      </motion.p>
      <motion.h2
        className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        Our Vision to <span className="text-gradient-sunrise">Uplift Humanity</span>
      </motion.h2>
      <motion.p
        className="text-lg font-body font-light text-muted-foreground text-center max-w-3xl mx-auto mb-16"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
      >
        <BrandName /> is just the beginning. We're building toward a future where technology
        serves consciousness — always-listening devices, wearables, and perhaps entirely
        new hardware designed to uplift the human experience.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visionItems.map((item, i) => (
          <motion.div
            key={item.title}
            className="group p-8 rounded-2xl border border-border/40 bg-card/20 hover:border-primary/20 hover:bg-card/40 transition-all duration-500"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 3}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:scale-110 transition-all">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-3">{item.title}</h3>
            <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default VisionSection;
