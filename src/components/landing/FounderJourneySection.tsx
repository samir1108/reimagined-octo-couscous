import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Honest "Journey so far" section — in place of fabricated testimonials.
 * Narrated as the founder + AI co-building ConsciousOS in public.
 */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0, 0, 0.2, 1] as const },
  }),
};

const milestones = [
  {
    phase: "The Spark",
    when: "Day 0",
    title: "One question wouldn't leave.",
    body: "Why does every app make you need it more? What would an app look like that helped you need it less? That question became ConsciousOS.",
  },
  {
    phase: "The Mapping",
    when: "Months 1–3",
    title: "400+ mental loops, named and mapped.",
    body: "Sat with therapists, monks, founders, parents. Pattern after pattern emerged — fear-of-rejection, scarcity-spiral, performance-mask. Each got an ID. Each got a dissolution path.",
  },
  {
    phase: "The Lineage",
    when: "Months 3–6",
    title: "13 master personalities, one path.",
    body: "Studied Adiyogi, Ramana, Patanjali, Buddha, Krishnamurti, Osho, Vivekananda and others. Distilled their methods into AI gurus you can actually sit with — not chatbots, companions.",
  },
  {
    phase: "The Engine",
    when: "Months 6–9",
    title: "An 11-band consciousness spectrum.",
    body: "Built the Vertical-Level system — a measurable map from conditioning to consciousness. Daily practice adapts to your band. No two journeys look the same.",
  },
  {
    phase: "The Temple",
    when: "Months 9–12",
    title: "A sanctuary, not a dashboard.",
    body: "Most apps shout. The Temple whispers. Cinematic, dark, single-master rooms — designed so the medium itself teaches stillness.",
  },
  {
    phase: "Now",
    when: "Today",
    title: "Open doors. First seekers.",
    body: "ConsciousOS is live. Free for those who cannot pay. Sacred for those who can. The journey from here — we walk with you.",
  },
];

const FounderJourneySection = () => (
  <section className="py-32 px-6 relative">
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="flex items-center justify-center gap-2 mb-4"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={0}
      >
        <Sparkles className="w-3.5 h-3.5 text-primary/70" />
        <p className="text-sm font-body tracking-[0.3em] uppercase text-primary/70">
          The Journey So Far
        </p>
      </motion.div>

      <motion.h2
        className="text-4xl md:text-5xl font-display font-light mb-4 text-center text-foreground tracking-tight"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={1}
      >
        We are <span className="text-gradient-sunrise italic">pre-launch</span> on purpose.
      </motion.h2>

      <motion.p
        className="text-base md:text-lg text-muted-foreground font-body font-light leading-relaxed mb-20 text-center max-w-2xl mx-auto"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={2}
      >
        No fabricated testimonials. No paid reviews. Just the honest log of how
        ConsciousOS came to be — built with AI, in public, one breath at a time.
      </motion.p>

      <div className="relative">
        {/* Vertical line */}
        <div
          aria-hidden
          className="absolute left-[15px] md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/15 to-transparent md:-translate-x-px"
        />

        <div className="space-y-12 md:space-y-20">
          {milestones.map((m, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={m.phase}
                className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-12 ${
                  isLeft ? "" : "md:[&>*:first-child]:order-2"
                }`}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={i + 3}
              >
                {/* Dot */}
                <div className="absolute left-0 md:left-1/2 top-2 -translate-x-[7px] md:-translate-x-1/2">
                  <div className="w-4 h-4 rounded-full bg-primary/80 ring-4 ring-background shadow-[0_0_20px_hsl(var(--primary)/0.6)]" />
                </div>

                <div className={`${isLeft ? "md:text-right md:pr-10" : "md:pl-10"}`}>
                  <p className="text-xs font-body tracking-[0.25em] uppercase text-primary/60 mb-2">
                    {m.when} · {m.phase}
                  </p>
                  <h3 className="text-xl md:text-2xl font-display font-medium text-foreground leading-snug">
                    {m.title}
                  </h3>
                </div>

                <div className={`${isLeft ? "md:pl-10" : "md:text-right md:pr-10"} mt-2 md:mt-0`}>
                  <p className="text-sm md:text-base text-foreground/70 font-body font-light leading-relaxed italic">
                    {m.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.p
        className="mt-20 text-center text-xs font-body tracking-[0.25em] uppercase text-muted-foreground/60"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={milestones.length + 4}
      >
        Real reviews coming — from real seekers, in their own time.
      </motion.p>
    </div>
  </section>
);

export default FounderJourneySection;
