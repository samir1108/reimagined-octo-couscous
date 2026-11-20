import { motion } from "framer-motion";
import cosmicTree from "@/assets/cosmic-tree.jpg";
import { BrandName } from "@/components/BrandName";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const masters = [
  {
    name: "Ramana Maharshi",
    teaching: "Self-Inquiry",
    quote: "Your own Self-realization is the greatest service you can render the world.",
    influence: "The foundation of our 'Who am I?' observation practice",
  },
  {
    name: "Jiddu Krishnamurti",
    teaching: "Choiceless Awareness",
    quote: "The observer is the observed.",
    influence: "Inspired our non-judgmental observation framework",
  },
  {
    name: "Osho",
    teaching: "Dynamic Meditation",
    quote: "Awareness is the greatest alchemy there is.",
    influence: "The basis of our active observation techniques",
  },
  {
    name: "Nisargadatta Maharaj",
    teaching: "I Am That",
    quote: "Wisdom tells me I am nothing. Love tells me I am everything.",
    influence: "Core philosophy behind the Witness consciousness model",
  },
  {
    name: "Patanjali",
    teaching: "Yoga Sutras",
    quote: "Yoga is the cessation of the fluctuations of the mind.",
    influence: "Scientific framework for our consciousness mapping",
  },
  {
    name: "Sadhguru",
    teaching: "Inner Engineering",
    quote: "The most beautiful moments in life are moments when you are expressing your joy.",
    influence: "Integration of ancient wisdom with modern technology",
  },
  {
    name: "Swami Vivekananda",
    teaching: "4 Paths of Yoga",
    quote: "Arise, awake, and stop not till the goal is reached.",
    influence: "Framework for personalizing the journey through Karma, Bhakti, Jnana & Raja Yoga",
  },
];

const InspirationsSection = () => (
  <section className="py-32 px-6 relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.06]">
      <img src={cosmicTree} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-background/95" />

    <div className="relative max-w-6xl mx-auto">
      <motion.p
        className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        Standing on the Shoulders of Giants
      </motion.p>
      <motion.h2
        className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        Inspired by <span className="text-gradient-sunrise">Great Masters</span>
      </motion.h2>
      <motion.p
        className="text-lg font-body font-light text-muted-foreground text-center max-w-2xl mx-auto mb-16"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
      >
        <BrandName /> is built on the timeless wisdom of enlightened masters who
        dedicated their lives to understanding consciousness.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {masters.map((m, i) => (
          <motion.div
            key={m.name}
            className="p-6 rounded-2xl border border-border/40 bg-card/30 hover:border-primary/15 transition-all duration-300"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 3}
          >
            <span className="text-xs font-body tracking-widest uppercase text-primary/50 block mb-2">
              {m.teaching}
            </span>
            <h4 className="text-xl font-display font-bold text-foreground mb-3">{m.name}</h4>
            <p className="text-foreground/60 font-body italic text-sm leading-relaxed mb-4">
              "{m.quote}"
            </p>
            <div className="pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground font-body font-light">{m.influence}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default InspirationsSection;
