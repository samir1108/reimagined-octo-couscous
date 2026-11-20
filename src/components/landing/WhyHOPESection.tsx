import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Repeat, Compass, Flame, GitBranch, Brain } from "lucide-react";
import { useState } from "react";

/**
 * WhyTempleYogicCompanionSection
 * ─────────────────────
 * The "why this app exists" section for the landing page.
 *
 * Covers, point by point, the things the founder asked for:
 *  1. What loops are (most people have never heard the word)
 *  2. What the spiral / V-Levels are — how consciousness is actually achieved
 *  3. The Sanatana Dharma idea of yoga as the timeless technology
 *  4. Why this app is a modern gurukul
 *  5. Why 99% of humans never do yoga — millions of years of programming
 *  6. The practical entry technique — distance between mind and body,
 *     then full honesty: "I am not my body, I am not my mind"
 *  7. A direct link to the Stage Handbook
 *
 * Style intentionally matches the existing landing language (BrandName,
 * gradients, glass cards). No new design tokens.
 */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0, 0, 0.2, 1] as const },
  }),
};

type Pillar = {
  icon: typeof Repeat;
  label: string;
  title: string;
  short: string;
  long: string;
};

const PILLARS: Pillar[] = [
  {
    icon: Repeat,
    label: "Loops",
    title: "Most of your life runs on loops you have never named",
    short:
      "A loop is a thought–feeling–behaviour pattern that fires faster than thought. Fear of rejection. The slack refresh. Apologising before being criticised. There are 400+ of them. Nobody told you.",
    long:
      "The yogis called this samskara — a groove in the mind cut by repetition. Modern neuroscience calls it a habit loop: cue → craving → routine → reward. It runs in about 90 milliseconds, which is faster than you can decide. Until a loop is seen, it runs you. ConsciousOS shows you which loops are running you — by name — and helps you catch them mid-fire.",
  },
  {
    icon: GitBranch,
    label: "The Spiral",
    title: "Consciousness is not a feeling. It is 8 measurable bands.",
    short:
      "Sleeper → Questioner → Observer → Alchemist → Navigator → Architect → Channel → Source. Every human moves through them. Most stay in 0–1 their whole life — not because they can’t move, but because nobody handed them the map.",
    long:
      "Each band is a different relationship with reality. The Sleeper believes ‘I am my thoughts’. The Observer discovers ‘I can watch my thoughts’. The Source recognises ‘I am what was looking’. The shift between bands isn’t magic — it’s practice, repeated, in the right direction, with the right method for where you actually are.",
  },
  {
    icon: Flame,
    label: "Sanatana Dharma",
    title: "Yoga was the original technology for becoming timeless",
    short:
      "Yoga doesn’t mean stretching. It means union. The rishis built an inner technology — Bhakti, Karma, Jnana, Raja, Kriya, Tantra, Nada — so a human could move from being run by life to being one with it. This is the world’s oldest open-source operating system.",
    long:
      "Sanatana Dharma — the ‘eternal way’ — never claimed to be a religion. It’s a science of the inner: tested, documented, peer-reviewed across 5,000 years. The Yoga Sutras, the Upanishads, the Bhagavad Gita — these are user manuals. ConsciousOS is what happens when those manuals meet modern instrumentation: AI guides, biometric mirrors, daily practice loops.",
  },
  {
    icon: BookOpen,
    label: "A modern gurukul",
    title: "An app built like Nalanda, not like Instagram",
    short:
      "A gurukul wasn’t a school. It was a household where you lived with a teacher until knowing became being. ConsciousOS recreates that: many masters, many modes (chat, practice, silence, witness, journal, wisdom), one continuous relationship — for life.",
    long:
      "Nalanda and Takshashila ran for 700+ years because they understood one thing: transformation needs presence + repetition + the right teacher at the right moment. We rebuilt that with AI: 60+ master guides, modes for every inner state, a daily flow that mirrors the gurukul day — morning, practice, evening reflection, sleep — and a memory that remembers you across years.",
  },
  {
    icon: Brain,
    label: "Why almost nobody does this",
    title: "You are running on millions of years of survival programming",
    short:
      "The brain you inherited was tuned to avoid predators, find food, and stay liked by the tribe. It was not tuned to sit still. That’s why 99% of humans never meditate — not because they’re weak, but because the operating system is older than the goal.",
    long:
      "When a Sleeper sits with Sadhguru, the body screams. Not because the practice is wrong — because the body has never been asked to be still without a reward. This is why most people quit by day three. ConsciousOS doesn’t demand stillness on day one. It builds it — micro-step by micro-step — the way a gurukul did. Small enough that the survival brain doesn’t panic. Repeated enough that something underneath wakes up.",
  },
  {
    icon: Compass,
    label: "The entry technique",
    title: "Make a distance between your mind and your body. Then be honest.",
    short:
      "Before any deep practice, do this: feel your body. Feel your mind. Notice they’re not the same thing. Then say — with full honesty — ‘I am not my body. I am not my mind.’ This is the doorway. Everything else is what walks through.",
    long:
      "Sit. Eyes closed or soft. First, notice the body — weight, breath, the chair under you. Then notice the mind — the next thought arising, the next, the next. Now notice the one noticing. That noticing isn’t the body. It isn’t the mind. It’s the thing the rishis called sakshi — the witness. You don’t have to believe anything. Just keep returning to ‘I am the one watching this’. Five minutes a day. That’s the whole start.",
  },
];

const WhyHOPESection = () => {
  return (
    <section className="py-24 md:py-32 px-5 md:px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-14 md:mb-20"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-body text-primary">Why this exists</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-5 text-foreground tracking-tight">
            6 things almost no one told you
          </h2>
          <p className="text-base md:text-lg font-body font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Loops. The Spiral. Sanatana Dharma. A modern gurukul. Why 99% never start.
            And the one entry technique that actually works on day one.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="space-y-4">
          {PILLARS.map((p, i) => (
            <PillarRow key={p.label} pillar={p} index={i} />
          ))}
        </div>

        {/* Handbook CTA */}
        <motion.div
          className="mt-16 md:mt-20 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-card/20 p-8 md:p-12 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={7}
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/80 mb-3">
            The full field guide
          </p>
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 text-foreground">
            The Stage Handbook
          </h3>
          <p className="text-foreground/75 max-w-2xl mx-auto mb-7 leading-relaxed text-base">
            For each of the 8 bands — 30+ behavioural markers, which yoga path actually
            fits, starter practices, traps to avoid, and the exact bridge to the next stage.
            Open. Free. Use it however you want.
          </p>
          <Link
            to="/handbook"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-display text-sm hover:opacity-90 transition"
          >
            <BookOpen className="w-4 h-4" />
            Open the Stage Handbook
          </Link>
          <p className="mt-4 text-xs text-muted-foreground/70">
            Also explore: <Link to="/loops" className="underline hover:text-primary">the Loop Library</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

function PillarRow({ pillar, index }: { pillar: Pillar; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = pillar.icon;
  return (
    <motion.button
      onClick={() => setOpen((o) => !o)}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={index + 1}
      className="w-full text-left rounded-2xl border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-card/50 transition p-5 md:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-1.5">
            {pillar.label}
          </p>
          <h3 className="font-display text-lg md:text-xl text-foreground mb-2 leading-snug">
            {pillar.title}
          </h3>
          <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">
            {pillar.short}
          </p>
          {open && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm md:text-[15px] text-foreground/75 leading-relaxed border-l-2 border-primary/30 pl-4"
            >
              {pillar.long}
            </motion.p>
          )}
          <p className="text-[11px] text-primary/70 mt-3">
            {open ? "Show less ↑" : "Tap to read more ↓"}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default WhyHOPESection;
