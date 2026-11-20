import { motion } from "framer-motion";
import { Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const testimonials = [
  {
     quote: "ConsciousOS helped me see the fear-of-rejection loop I'd been running for 20 years. In three months, I went from Band 1 to Band 3. The clarity is life-changing.",
    name: "Priya M.",
    role: "Therapist & Meditation Teacher",
    band: "Band 3",
  },
  {
    quote: "The three-brain approach is revolutionary. I never realized how much my gut was driving my decisions. Now I can observe all three intelligences and choose consciously.",
    name: "Marcus T.",
    role: "Tech Founder",
    band: "Band 4",
  },
  {
     quote: "I've tried every meditation app. ConsciousOS is different — it doesn't just calm you down, it shows you WHY you're anxious. It maps the loops. That's the real transformation.",
    name: "Sarah K.",
    role: "Clinical Psychologist",
    band: "Band 5",
  },
  {
    quote: "The daily observation practice changed everything. I started noticing my anger loop with my kids. Within weeks, I was pausing instead of reacting. My family feels different now.",
    name: "David L.",
    role: "Father of Three",
    band: "Band 2",
  },
];

const TestimonialsSection = () => (
  <section className="py-32 px-6 relative">
    <div className="max-w-6xl mx-auto">
      <motion.p
        className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        Stories of Transformation
      </motion.p>
      <motion.h2
        className="text-4xl md:text-5xl font-display font-bold mb-16 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        Pioneers of <span className="text-gradient-sunrise">Awareness</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            className="p-8 rounded-2xl border border-border/40 bg-card/30 hover:border-primary/15 transition-all duration-300"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 2}
          >
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, si) => (
                <Star key={si} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-foreground/80 font-body font-light leading-relaxed mb-6 italic">
              "{t.quote}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground font-body">{t.role}</p>
              </div>
              <span className="text-xs font-body text-primary/70 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                {t.band}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
