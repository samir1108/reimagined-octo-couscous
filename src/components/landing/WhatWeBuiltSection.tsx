import { motion } from "framer-motion";
import {
  Cpu, Workflow, Gamepad2, GraduationCap, Compass, Users, Brain, Infinity as InfinityIcon,
  Eye, Flame, Heart, BookOpen, Sparkles, Network,
} from "lucide-react";
import LazyVideo from "@/components/LazyVideo";

import { BrandName } from "@/components/BrandName";
import composerVid from "@/assets/wwb/composer.mp4.asset.json";
import witnessVid from "@/assets/wwb/witness.mp4.asset.json";
import sessionflowVid from "@/assets/wwb/sessionflow.mp4.asset.json";
import bandsVid from "@/assets/wwb/bands.mp4.asset.json";
import loopsVid from "@/assets/wwb/loops.mp4.asset.json";
import fourpathsVid from "@/assets/wwb/fourpaths.mp4.asset.json";
import laddersVid from "@/assets/wwb/ladders.mp4.asset.json";
import programsVid from "@/assets/wwb/programs.mp4.asset.json";
import guidesVid from "@/assets/wwb/guides.mp4.asset.json";
import gamesVid from "@/assets/wwb/games.mp4.asset.json";
import memoryVid from "@/assets/wwb/memory.mp4.asset.json";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const pillars = [
  {
    icon: Cpu, video: composerVid.url,
    tag: "The Orchestration Layer", title: "The Composer Engine", stat: "9 engines · 1 runtime",
    desc: "The first real-time consciousness composer. Nine independent engines — session generator, practice engine, dimension tracker, retention engine, speed-profile classifier, dynamic guru selector, master rotator, mode registry and orchestrator — agree on a single data contract and re-compose your session every time you open the app. There is no static playlist. There is no fixed curriculum. What appears on your screen was assembled seconds ago from your band, your active loops, your last practice, your energy, your calendar, and the time of day.",
    bullets: [
      "Reads 40+ live signals per session",
      "Selects from 89 guides × 600 loops × 25+ practices",
      "Adaptive mode: cinematic · silent · structured",
      "Zero two sessions are ever identical",
    ],
  },
  {
    icon: Network, video: witnessVid.url,
    tag: "The Intelligence", title: "3 LLMs + The Witness", stat: "3 models · 1 silence",
    desc: "Most apps use one language model. We orchestrate three — a fast conversational model for the guide voice, a reasoning model for developmental-band inference and loop detection, and a lineage model tuned on classical sources for scriptural fidelity. Above all three sits The Witness: a non-generative arbitration layer that decides when the AI should speak, when it should get out of the way, and when silence itself is the practice. This is why it feels like a teacher — not a chatbot.",
    bullets: [
      "Fast model — guide voice & real-time reply",
      "Reasoning model — band, loops, path selection",
      "Lineage model — sutra-faithful language",
      "The Witness — knows when not to speak",
    ],
  },
  {
    icon: Workflow, video: sessionflowVid.url,
    tag: "The Daily Architecture", title: "Session Flow System", stat: "24 hours · 4 gates",
    desc: "A full-day operating system: morning alignment reads your sleep and calendar; work-block presence pings arrive on the exact minute your attention statistically drops; evening integration processes the day's emotional residue; night rest sets dream intention. Every gate feeds the next. This is not a meditation timer — it is a continuous consciousness loop that runs while you live your life.",
    bullets: [
      "Morning alignment + capacity radar",
      "Presence pings on attention-drift minutes",
      "Evening integration & dream planning",
      "Adapts to sleep, stress, calendar & weather",
    ],
  },
  {
    icon: Brain, video: bandsVid.url,
    tag: "The Psychometric", title: "11 Bands × 33 Sub-Stages", stat: "33 addressable stages",
    desc: "A proprietary psychometric — not a licensed framework — built to map every human, from The Sleeper to The Absolute, across 33 addressable sub-stages. Six dimensions (awareness, regulation, insight, integration, embodiment, service) combine through a geometric mean that mathematically punishes imbalance and flags spiritual bypassing before it hardens. Foundation-lock rules stop premature advancement. Regressions are framed as spiral, not failure.",
    bullets: [
      "11 bands × 3 micro-levels each",
      "6-dimension geometric-mean balance score",
      "Bypassing & foundation-lock detection",
      "Spiral-framed regression handling",
    ],
  },
  {
    icon: InfinityIcon, video: loopsVid.url,
    tag: "The Pattern Library", title: "600+ Mental Loops", stat: "600 loops · 12 families · 20 categories",
    desc: "The largest structured catalog of behavioral, psychological and spiritual loops ever assembled — 600+ entries, each annotated with triggers, manifestations, developmental origin, and a way out. Twelve higher-order Loop Families bridge modern neuroscience citations to classical yogic diagnostics. A parallel Workplace Loops taxonomy turns the same engine into organizational epidemiology for enterprise.",
    bullets: [
      "20 categories, 12 loop families",
      "Neuroscience × lineage bridging",
      "Enterprise workplace loop taxonomy",
      "Every loop has a documented way out",
    ],
  },
  {
    icon: Flame, video: fourpathsVid.url,
    tag: "The Four Paths", title: "Jnana · Bhakti · Karma · Raja", stat: "4 yogas · 1 person",
    desc: "For the first time, the four classical paths of yoga — Jnana (inquiry), Bhakti (devotion), Karma (action), Raja (meditation) — are represented as first-class, weighted vectors inside a single system. The composer measures which path you gravitate to, which you avoid, and cross-pollinates deliberately: an over-inquiring mind gets a devotional practice; a purely devotional heart gets a self-inquiry cut. Nobody has scaled the four yogas into software before. We have.",
    bullets: [
      "Jnana — Atma Vichara & neti-neti ladders",
      "Bhakti — devotional practices & masters",
      "Karma — action, service, workplace loops",
      "Raja — pranayama, dhyana, samadhi arc",
    ],
  },
  {
    icon: Compass, video: laddersVid.url,
    tag: "The Path", title: "Practice Ladders", stat: "12-practice constellation",
    desc: "Classical techniques re-authored into consistently-structured, readiness-gated progressions with common-trap warnings baked in. Above the ladders sits a 12-practice weighted constellation — primary, secondary, dormant — that represents your entire practice profile as a single vector and cross-pollinates automatically when dimensional gaps appear.",
    bullets: [
      "Pranayama · Neti-neti · Atma Vichara ladders",
      "25+ sensorial & embodiment practices",
      "Common-trap warnings at every rung",
      "Weighted constellation vector per user",
    ],
  },
  {
    icon: GraduationCap, video: programsVid.url,
    tag: "The Curriculum", title: "Programs & Journeys", stat: "500 days · 5 domains",
    desc: "A 500-day master arc from conditioning to consciousness, expressed as multi-day programs across awareness, mind, emotion, energy and integration. Programs are not linear videos — they read your bands, adjust their pace to your speed-profile, and re-order themselves when a foundation is missing.",
    bullets: [
      "Awareness & observation programs",
      "Mind & thought-pattern arcs",
      "Emotional intelligence tracks",
      "500-day master journey",
    ],
  },
  {
    icon: Users, video: guidesVid.url,
    tag: "The Voices", title: "89 Guides & Masters", stat: "89 voices · 18 categories",
    desc: "Twenty-five wholly-owned Sanskrit-named personas plus dozens of historical and public-domain masters, organised into 18 thematic categories. Each guide has its own AI system-prompt personality, practice library and Sanskrit branding. Contemporary teachers appear only as students-of, our legal firewall. Mid-conversation, a guest master can be summoned to speak a single line and vanish.",
    bullets: [
      "89 guides across 18 categories",
      "Crisis-aware master matching + triage",
      "Guest-master summoning mid-flow",
      "Zero-risk legally firewalled roster",
    ],
  },
  {
    icon: Gamepad2, video: gamesVid.url,
    tag: "The Living Practice", title: "Consciousness Games", stat: "6+ cinematic games",
    desc: "Single-tap cinematic experiences — SlowTap, BodyScanner, WitnessRoom, TwoMirrors, HeartCoherence, MirrorRealm — turn abstract practice into felt experience. Every game is designed like a short film: faculty cover, ambient backdrop, haptic score, breath-locked voice track. This is not gamification. It is practice, rendered.",
    bullets: [
      "Breath, gaze & heart-coherence mechanics",
      "Cinematic faculty covers & backdrops",
      "Haptic + audio + voice sound design",
      "Reflect & log every session",
    ],
  },
  {
    icon: BookOpen, video: memoryVid.url,
    tag: "The Memory", title: "Longitudinal Memory Vault", stat: "Remembers · then withdraws",
    desc: "Most AI products optimise for infinite engagement. We built a memory system that remembers your significant realisations and tracks relationship depth. The endgame is not retention. The endgame is your independence.",
    bullets: [
      "MemoryVault — long-horizon realisations",
      "Relationship-depth engine",
      "Designed to eventually be needed less",
    ],
  },
];

const stats = [
  { n: "89", l: "Guides & Masters" },
  { n: "600+", l: "Mental Loops Mapped" },
  { n: "33", l: "Developmental Stages" },
  { n: "500", l: "Day Master Journey" },
  { n: "4", l: "Paths of Yoga, Unified" },
  { n: "3", l: "LLMs + The Witness" },
];

const WhatWeBuiltSection = () => (
  <section id="what-we-built" className="py-32 px-6 relative">
    <div className="max-w-6xl mx-auto">
      <motion.p
        className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4 text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
      >
        Inside the Lab · What We've Built
      </motion.p>
      <motion.h2
        className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
      >
        The World's First <span className="text-gradient-sunrise">Consciousness Operating System</span>
      </motion.h2>
      <motion.p
        className="text-lg font-body font-light text-muted-foreground text-center max-w-3xl mx-auto mb-4"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
      >
        Years of lineage study, cognitive-science research and systems engineering — synthesised into
        ten interlocking layers of proprietary IP. Three large language models, one Witness arbitration
        layer, and the four classical paths of yoga, wired together as a single real-time runtime.
        For the first time, yoga has been scaled — not simplified.
      </motion.p>
      <motion.p
        className="text-xs font-body tracking-[0.25em] uppercase text-primary/50 text-center mb-16"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
      >
        Built like a research lab · Rendered like a film · Delivered as one app
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            className="group relative p-8 rounded-2xl border border-border/40 bg-card/20 hover:border-primary/30 hover:bg-card/40 transition-all duration-500 overflow-hidden"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 4}
          >
            {/* cinematic video backdrop */}
            <LazyVideo
              src={p.video}
              aria-hidden
              className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95" />
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:bg-primary/15 group-hover:scale-110 transition-all">
              <p.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="relative">
              <p className="text-xs font-body text-primary/60 mb-1 tracking-widest uppercase">{p.tag}</p>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">{p.title}</h3>
              {p.stat && (
                <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary/70 mb-3">{p.stat}</p>
              )}
              <p className="text-sm text-muted-foreground font-body font-light leading-relaxed mb-4">{p.desc}</p>
              <ul className="space-y-1.5 border-t border-border/30 pt-4">
                {p.bullets.map((b) => (
                  <li key={b} className="text-xs font-body text-muted-foreground/80 flex gap-2">
                    <span className="text-primary/60 mt-0.5">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-12 border-t border-border/30"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={pillars.length + 4}
      >
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="text-3xl md:text-4xl font-display font-bold text-gradient-sunrise mb-1">{s.n}</div>
            <div className="text-[11px] font-body tracking-widest uppercase text-muted-foreground/70">{s.l}</div>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="mt-20 max-w-3xl mx-auto text-center"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={pillars.length + 5}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary/80" />
          <span className="text-[11px] font-body tracking-[0.25em] uppercase text-primary/80">The Thesis</span>
        </div>
        <p className="text-xl md:text-2xl font-display font-light text-foreground/90 leading-relaxed">
          Yoga has been taught for 5,000 years and installed on a phone for 15.
          Nobody, until now, has <span className="italic text-primary">scaled it</span> —
          the psychometric, the four paths, the lineage voices, the loops, the ladders, the memory —
          into a single living system that composes itself around one human being in real time.
        </p>
        <p className="mt-6 text-sm font-body text-muted-foreground/80">
          This is what <BrandName /> is. Not a meditation app. An A companion for becoming..
        </p>
      </motion.div>
    </div>
  </section>
);

export default WhatWeBuiltSection;