import { motion } from "framer-motion";
import { Repeat, ArrowRight } from "lucide-react";
import { BrandName } from "@/components/BrandName";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const loopCategories = [
  { category: "Fear Loops", count: 24, examples: ["Fear of rejection", "Fear of failure", "Fear of judgment", "Imposter syndrome"] },
  { category: "Emotional Loops", count: 28, examples: ["Anger cycles", "Anxiety spirals", "Shame loops", "Guilt patterns"] },
  { category: "Cognitive Loops", count: 21, examples: ["Rumination", "Catastrophizing", "Black-and-white thinking", "Projection"] },
  { category: "Relational Loops", count: 15, examples: ["Abandonment patterns", "Trust issues", "Boundary violations", "Communication walls"] },
];

const LoopsSection = () => (
  <section className="py-32 px-6 relative">
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-16"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
          <Repeat className="w-4 h-4 text-primary" />
          <span className="text-sm font-body text-primary">Deep Pattern Library</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">
          <span className="text-gradient-sunrise">150+</span> Psychological Loops Mapped
        </h2>
        <p className="text-lg font-body font-light text-muted-foreground max-w-2xl mx-auto">
          We've catalogued the most common unconscious patterns across 8 dimensions.
          <BrandName /> helps you identify which loops are running your life — and break free.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loopCategories.map((cat, i) => (
          <motion.div
            key={cat.category}
            className="group p-6 rounded-2xl border border-border/40 bg-card/30 hover:border-primary/20 hover:bg-card/50 transition-all duration-300"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-semibold text-foreground text-sm">{cat.category}</h4>
              <span className="text-xs font-body text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                {cat.count}
              </span>
            </div>
            <ul className="space-y-1.5">
              {cat.examples.map((ex) => (
                <li key={ex} className="flex items-center gap-2 text-sm text-muted-foreground font-body font-light">
                  <ArrowRight className="w-3 h-3 text-primary/40 shrink-0" />
                  {ex}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center text-muted-foreground/60 font-body text-sm mt-8"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}
      >
        And many more — our pattern library grows with each user's journey
      </motion.p>
    </div>
  </section>
);

export default LoopsSection;
