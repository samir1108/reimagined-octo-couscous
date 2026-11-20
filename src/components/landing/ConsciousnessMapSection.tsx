import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cosmicMandala from "@/assets/cosmic-mandala.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const bands = [
  {
    id: 0, name: "THE SLEEPER", icon: "🌑", color: "hsl(0 50% 40%)",
    tagline: "Life runs me",
    levels: ["Autopilot", "First Friction", "Readiness"],
    desc: "Life operates on autopilot — reactions, habits, dopamine loops. You don't yet know you're asleep. Most of humanity begins here. The system meets you with energy, clarity, and performance language — no spiritual jargon.",
    product: "Energy • Clarity • Performance",
  },
  {
    id: 1, name: "THE QUESTIONER", icon: "🌒", color: "hsl(25 70% 48%)",
    tagline: "Something feels off",
    levels: ["First Doubt", "Seeking Begins", "Inner Turning"],
    desc: "A crack appears in the matrix. You sense there's more — consuming books, podcasts, ideas. The intellect reaches for answers the mind cannot provide. This is the birth of the seeker.",
    product: "Self-discovery • Curiosity • Meaning",
  },
  {
    id: 2, name: "THE OBSERVER", icon: "🌓", color: "hsl(42 85% 52%)",
    tagline: "I can watch myself",
    levels: ["Witness in Practice", "Witness in Life", "Witness Stabilized"],
    desc: "The most important shift in human consciousness: you discover you are not your thoughts. The Observer is born. First in meditation, then in daily life. Thoughts are seen, not believed.",
    product: "Awareness • Presence • Witness",
  },
  {
    id: 3, name: "THE ALCHEMIST", icon: "🌔", color: "hsl(340 60% 50%)",
    tagline: "My patterns are my teachers",
    levels: ["Pattern Recognition", "Emotional Alchemy", "Shadow Integration"],
    desc: "Your unconscious patterns become visible — not as enemies, but as teachers. Emotional reactions transform into fuel for growth. Shadow work happens naturally. Life becomes a mirror.",
    product: "Transformation • Shadow Work • Loop Breaking",
  },
  {
    id: 4, name: "THE NAVIGATOR", icon: "🌕", color: "hsl(160 55% 42%)",
    tagline: "I choose my response",
    levels: ["The Pause", "Conscious Choice", "Response Mastery"],
    desc: "Between stimulus and response, a space opens — and in that space, you find freedom. You no longer react; you respond. The gap becomes your superpower. Emotional intelligence reaches a new octave.",
    product: "Mastery • Freedom • Conscious Action",
  },
  {
    id: 5, name: "THE ARCHITECT", icon: "🌌", color: "hsl(200 65% 48%)",
    tagline: "I design from within",
    levels: ["Internal Authority", "Reality Shaping", "Effortless Creation"],
    desc: "You stop seeking externally. Life is now built from the inside out. Decisions arise from inner knowing, not fear or conditioning. You become the architect of your experience — not through force, but through alignment.",
    product: "Inner Authority • Creation • Alignment",
  },
  {
    id: 6, name: "THE CHANNEL", icon: "🌈", color: "hsl(265 55% 55%)",
    tagline: "Life flows through me",
    levels: ["Ego Softening", "Intuitive Flow", "Selfless Action"],
    desc: "The ego softens its grip. You become a clear channel — intuition leads, wisdom speaks through you. Action happens without a doer. The personality remains but serves something deeper. Grace becomes your operating system.",
    product: "Surrender • Flow • Grace",
  },
  {
    id: 7, name: "THE SOURCE", icon: "✦", color: "hsl(45 80% 60%)",
    tagline: "I am what I was seeking",
    levels: ["Recognition", "Stabilized Awakening", "Ordinary Sacredness"],
    desc: "The search ends — not because you found something, but because you recognized what was always here. Awareness recognizes itself. Every moment is sacred. Life lives itself through you. Nothing to attain. Nowhere to go.",
    product: "Being • Liberation • Wholeness",
  },
];

const ConsciousnessMapSection = () => {
  const [activeBand, setActiveBand] = useState<number | null>(null);

  return (
    <section id="consciousness-map" className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.07]">
        <img src={cosmicMandala} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-background/95" />

      <div className="relative max-w-6xl mx-auto">
        <motion.p
          className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
        >
          The Vertical Level System
        </motion.p>
        <motion.h2
          className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
        >
          From <span className="text-gradient-sunrise">Sleeper</span> to <span className="text-gradient-sunrise">Source</span>
        </motion.h2>
        <motion.p
          className="text-lg font-body font-light text-muted-foreground text-center max-w-2xl mx-auto mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
        >
          8 bands. 24 levels. Not a ladder to climb — a deepening relationship with reality.
          The AI maps where you are and guides your unfolding.
        </motion.p>

        {/* Interactive Band Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Visual Tower */}
          <motion.div
            className="relative"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
          >
            <div className="flex flex-col-reverse gap-2">
              {bands.map((band) => (
                <motion.button
                  key={band.id}
                  onClick={() => setActiveBand(activeBand === band.id ? null : band.id)}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                    activeBand === band.id
                      ? "border-primary/50 bg-primary/10 scale-[1.02]"
                      : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Band indicator */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: band.color + "20", color: band.color }}
                  >
                    {band.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">
                      Band {band.id}
                    </span>
                    <h4 className="text-sm font-display font-semibold text-foreground leading-tight">
                      {band.name}
                    </h4>
                    <p className="text-xs text-muted-foreground/70 font-body italic">
                      "{band.tagline}"
                    </p>
                  </div>
                  {/* Level dots */}
                  <div className="flex gap-1.5 shrink-0">
                    {band.levels.map((_, li) => (
                      <div
                        key={li}
                        className="w-2 h-2 rounded-full transition-colors"
                        style={{ backgroundColor: band.color + (activeBand === band.id ? "CC" : "44") }}
                      />
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right: Detail Panel */}
          <motion.div
            className="lg:sticky lg:top-32"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}
          >
            <AnimatePresence mode="wait">
              {activeBand !== null ? (
                <motion.div
                  key={activeBand}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: bands[activeBand].color + "20" }}
                    >
                      {bands[activeBand].icon}
                    </div>
                    <div>
                      <p className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground">
                        Band {activeBand}
                      </p>
                      <h3 className="text-2xl font-display font-bold text-foreground">
                        {bands[activeBand].name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm italic text-primary/80 font-body mb-4">
                    "{bands[activeBand].tagline}"
                  </p>

                  <p className="text-muted-foreground font-body font-light leading-relaxed mb-8 text-sm">
                    {bands[activeBand].desc}
                  </p>

                  {/* Sub-levels */}
                  <div className="space-y-2 mb-6">
                    {bands[activeBand].levels.map((level, i) => (
                      <div
                        key={level}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-background/50"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-display font-bold shrink-0"
                          style={{ backgroundColor: bands[activeBand].color + "15", color: bands[activeBand].color }}
                        >
                          {activeBand}.{i + 1}
                        </div>
                        <span className="font-body text-foreground/80 text-sm">{level}</span>
                        <span className="text-[10px] text-muted-foreground/50 ml-auto font-body">
                          {["Entry", "Integration", "Mastery"][i]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Product language tag */}
                  <div className="pt-4 border-t border-border/20">
                    <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground/60 mb-1">
                      Product Language
                    </p>
                    <p className="text-xs font-body text-primary/70">
                      {bands[activeBand].product}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 rounded-2xl border border-dashed border-border/30 bg-card/20 text-center"
                >
                  <p className="text-4xl mb-4">🌑 → ✦</p>
                  <p className="text-muted-foreground font-body text-lg">
                    Click a band to explore
                  </p>
                  <p className="text-muted-foreground/50 font-body text-sm mt-2">
                    Each band is a quantum leap in your relationship with reality
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ConsciousnessMapSection;
