import { motion } from "framer-motion";
import { ArrowRight, Brain, Database, Layers, Repeat, Sparkles, Zap } from "lucide-react";

const ENGINES = [
  "V-Level / Consciousness Engine",
  "Practice Engine (8 weighted rules)",
  "Adaptive Engine (per-turn AI directive)",
  "Sankalpa Composer (14 archetypes)",
  "Loop Detector (3 cadences)",
  "Memory System (5 layers)",
  "Living Theme Engine",
  "Dimension Tracker",
  "Retention Engine",
  "Speed Profile Engine",
  "Companion Engine",
  "Signal Fusion",
  "Curiosity Engine",
  "Chakra Engine",
  "Kosha Scanner",
  "Three-Brain Inference",
  "Kundli (Vedic astrology)",
];

const BRAIN_FIELDS = [
  "Identity & lifestyle",
  "Band + V-Level (0.0–10.0)",
  "Six dimension bands",
  "96 sub-dimensions",
  "Active loops + severity",
  "Practice levels (per family)",
  "Last 7–30 days of behaviour",
  "Today's gate + energy",
  "Today's theme",
  "Engine signals + loop attributions",
  "Foundation / programme state",
  "Spiritual DNA + confidence",
  "Wearable / work / bio signals",
];

const PHASES = [
  {
    name: "Teaching",
    share: "30%",
    body: "The guide introduces today's theme — pointed, never a lecture.",
  },
  {
    name: "Practice",
    share: "50%",
    body: "Always doing — breath, body, self-inquiry, witness, shadow, relationship.",
  },
  {
    name: "Reflection",
    share: "20%",
    body: "Chat, journal prompt, and a self-rating of how present you were.",
  },
  {
    name: "Integration",
    share: "—",
    body: "An action item for the day, a micro-practice, and a preview of tomorrow.",
  },
];

const GATES = [
  { name: "Morning", hours: "5am–12pm", character: "Intention & new beginnings" },
  { name: "Midday", hours: "12pm–5pm", character: "Awareness in action (60 s)" },
  { name: "Evening", hours: "5pm–9pm", character: "Integration, reflection, release" },
  { name: "Night", hours: "9pm–5am", character: "Rest, surrender, dream" },
];

export default function SystemStory() {
  return (
    <section id="the-system" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <span className="text-[0.62rem] uppercase tracking-[0.34em] text-primary/75">
            The system
          </span>
          <h2 className="mt-4 text-3xl font-light leading-tight text-foreground sm:text-4xl md:text-5xl">
            What is actually running underneath.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            A real architecture, not a prompt wrapper. 102 edge functions, 173 migrations,
            ~200 tables, 11 XState machines, 27 client libraries, 17 engines — all feeding
            one closed feedback loop. Below is the part that matters.
          </p>
        </div>

        {/* The Brain */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-medium text-foreground">The Brain — getUserContext()</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every decision in ConsciousOS starts from a single snapshot. One function assembles
              everything the system knows about you — in parallel, best-effort, never throwing —
              and hands it to every engine. It is the seam that makes the whole platform coherent.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <span className="font-mono text-[0.75rem] text-foreground/70">
                supabase/functions/_shared/user-context.ts
              </span>{" "}
              — 553 lines. Called first by the composer, the guide chat, the session adapter,
              and every personalisation function.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BRAIN_FIELDS.map((field) => (
                <div
                  key={field}
                  className="rounded-xl border border-border/40 bg-card/30 px-3 py-2.5 text-[0.72rem] leading-snug text-foreground/80"
                >
                  {field}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/30 p-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="text-[0.85rem] font-medium uppercase tracking-[0.14em] text-foreground/90">
                Platform scale
              </h3>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                ["Edge functions", "102"],
                ["Shared modules", "30"],
                ["Migrations", "173"],
                ["Database tables", "~200"],
                ["XState machines", "11"],
                ["React hooks", "105"],
                ["Client libraries", "27"],
                ["UI locales", "~40"],
                ["Games", "~30"],
                ["Programs", "120+"],
                ["Masters / guides", "89+"],
                ["Cinematic scripts", "3"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground/70">
                    {label}
                  </dt>
                  <dd className="mt-1 text-lg font-light text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Engine Room */}
        <div className="mt-24">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-medium text-foreground">The Engine Room</h3>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Seventeen engines, running both server-side (authoritative, in edge functions) and
            client-side (instant, offline-capable). Every one of them reads from, and writes
            back to, the same Brain.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {ENGINES.map((engine) => (
              <span
                key={engine}
                className="rounded-full border border-border/40 bg-card/30 px-4 py-2 text-[0.72rem] text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {engine}
              </span>
            ))}
          </div>
        </div>

        {/* The Session */}
        <div className="mt-24">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-medium text-foreground">Every session has a purpose</h3>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            A session is not a video, an audio track, or a random prompt. It is a structured,
            time-bound practice with a fixed formula and four phases — and the system scores
            its own output so the next session is different.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {PHASES.map((phase, index) => (
              <motion.div
                key={phase.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0, 0, 0.2, 1] }}
                className="rounded-2xl border border-border/40 bg-card/30 p-5"
              >
                <div className="flex items-baseline justify-between">
                  <h4 className="text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-foreground/90">
                    {phase.name}
                  </h4>
                  <span className="font-mono text-[0.7rem] text-primary">{phase.share}</span>
                </div>
                <p className="mt-3 text-[0.78rem] leading-relaxed text-muted-foreground">
                  {phase.body}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground/70">
              Four daily gates
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {GATES.map((gate) => (
                <div
                  key={gate.name}
                  className="rounded-2xl border border-border/40 bg-card/30 p-4"
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-foreground/90">
                    {gate.name}
                  </p>
                  <p className="mt-1 font-mono text-[0.65rem] text-primary/80">{gate.hours}</p>
                  <p className="mt-2 text-[0.72rem] leading-snug text-muted-foreground">
                    {gate.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Loop */}
        <div className="mt-24 rounded-3xl border border-border/40 bg-card/30 p-7 md:p-10">
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-medium text-foreground">The closed loop</h3>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            This is the single most important property of the architecture: everything feeds
            back into the Brain. Sessions produce signals — signals update dimensions and
            loops — dimensions update the V-Level — the V-Level changes gating, archetype
            and master selection — the next session is different. The app gets more accurate
            every day, and is designed to be needed less over time.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2 text-[0.72rem] font-mono text-foreground/70">
            {["Session", "Signals", "Dimensions + Loops", "V-Level", "Gating & Master", "Next session"].map(
              (step, index, array) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-primary">
                    {step}
                  </span>
                  {index < array.length - 1 ? (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  ) : (
                    <Repeat className="h-3.5 w-3.5 text-muted-foreground/60" />
                  )}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Honest note */}
        <div className="mt-16 rounded-2xl border border-border/40 bg-card/20 p-6 md:p-7">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-[0.85rem] font-medium uppercase tracking-[0.14em] text-foreground/90">
              Honest about what ships today
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Everything above is implemented and running. A few capabilities are still
            maturing — wearable ingestion, enterprise analytics and multi-master council
            sessions are the most recent additions. The landing page does not promise
            anything the backend does not already do. Spiritual frameworks are presented
            as our model, not as scientifically validated measurements of consciousness.
          </p>
        </div>
      </div>
    </section>
  );
}
