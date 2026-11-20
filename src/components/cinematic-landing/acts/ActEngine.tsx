import { motion, useTransform } from "framer-motion";
import { CheckCircle2, CircleDashed, FlaskConical } from "lucide-react";
import { ActLabel } from "../SceneStage";
import CinematicPlate from "../CinematicPlate";
import { useSceneProgress } from "../useSceneProgress";
import { landingVideos } from "../landingAssets";

interface EngineLayer {
  id: string;
  title: string;
  body: string;
  line: string;
  inputs: string[];
}

const engineLayers: EngineLayer[] = [
  {
    id: "understand",
    title: "Layer 1 — Understand the person",
    body: "The engine assembles a working picture from what you have actually given it: assessment answers, journal entries, session history, active loops, practice levels, your stated goals and the time of day you are in.",
    line: "Every person arrives with a different starting point.",
    inputs: [
      "Assessment & onboarding answers",
      "Journal entries and reflections",
      "Session history and practice levels",
      "Active loops and stated goals",
      "Time of day and session context",
    ],
  },
  {
    id: "map",
    title: "Layer 2 — Map the current state",
    body: "Those observations become a current working model: a developmental band, dimension-level emphasis, what is ready and what is not, the loops still running, and how much of what has been learned has actually been integrated.",
    line: "The goal isn't to label you. It's to understand what might help next.",
    inputs: [
      "Consciousness-development band",
      "Dimension emphasis and limits",
      "Readiness and integration state",
      "Recurring loops and triggers",
      "Bypassing-risk check on advanced work",
    ],
  },
  {
    id: "choose",
    title: "Layer 3 — Choose the next practice",
    body: "Selection is scored, not shuffled. The engine weighs the dimension that needs work, the loops you are actively running, your growth path, the practice level you have reached, recent session quality and recency — then returns the practice that fits this moment.",
    line: "Not another recommendation feed. A next step chosen in the context of your journey.",
    inputs: [
      "Weakest dimension (weighted)",
      "Active loop relevance (weighted)",
      "Growth path and theme alignment",
      "Appropriate difficulty for your level",
      "Repeat versus introduce something new",
    ],
  },
  {
    id: "learn",
    title: "Layer 4 — Learn from the experience",
    body: "A session is not a dead end. Engagement, reflection depth and completion produce a session quality signal, themes are updated with it, and the engine re-runs so the next session starts from what just happened.",
    line: "Your journey evolves as your observations become clearer.",
    inputs: [
      "Engagement + reflection depth + completion",
      "Session quality written back to the theme",
      "Engine re-run after each session",
      "Journal and presence-card signals",
      "Explicit per-session ratings — in development",
    ],
  },
];

const flow = [
  "User observation",
  "Current context",
  "Practice selection",
  "A session for this moment",
  "Reflection + feedback",
  "Updated user model",
];

const capabilityRows = [
  {
    status: "live",
    label: "Live today",
    items: [
      "Working model built from assessments, journal, sessions, loops and levels",
      "Scored next-practice selection with difficulty, recency and appropriateness checks",
      "Session quality (engagement, reflection depth, completion) feeding back into the engine",
      "Band, dimension emphasis, loops, themes and presence cards surfaced in the app",
    ],
  },
  {
    status: "model",
    label: "Working model — not measurement",
    items: [
      "Developmental bands, chakras, archetypes and bypassing-risk scores are the product's own framework",
      "They are inferred from your reports and practice history — they are not clinical or scientific measurement",
    ],
  },
  {
    status: "next",
    label: "In development",
    items: [
      "Explicit per-session feedback steering — “too hard”, “not relevant”, “tell me more”",
      "Mission chains that bind several sessions to one theme across a full day",
    ],
  },
];

/**
 * ACT V — The Consciousness Engine.
 */
export function ActEngine() {
  const { ref, progress } = useSceneProgress();

  const introOpacity = useTransform(progress, [0, 0.1, 0.18, 0.26], [0, 1, 1, 0]);
  const mapOpacity = useTransform(progress, [0.05, 0.2, 0.85, 1], [0.35, 0.7, 0.35, 0.15]);
  const mapScale = useTransform(progress, [0.05, 0.9], [1, 1.12]);

  return (
    <section
      id="engine"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "340vh" }}
      aria-label="Act five: the consciousness engine"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity: mapOpacity, scale: mapScale }}>
          <CinematicPlate
            video={landingVideos.engineSignal}
            className="h-full w-full"
            overlay="radial-gradient(ellipse 70% 60% at 50% 45%, rgba(9,7,5,0.35) 0%, rgba(6,5,4,0.9) 70%, rgba(4,3,3,1) 100%)"
          />
        </motion.div>

        <motion.div
          className="absolute inset-x-0 top-0 z-20 px-6 pt-24 text-center"
          style={{ opacity: introOpacity }}
        >
          <div>
            <ActLabel>Act V — The Consciousness Engine</ActLabel>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Four layers between you and the next session.
            </h2>
          </div>
        </motion.div>

        <div className="relative z-10 w-full max-w-6xl px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {engineLayers.map((layer, index) => (
              <EngineLayerCard key={layer.id} layer={layer} index={index} progress={progress} />
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-foreground/10 bg-black/45 p-5 backdrop-blur">
              <p className="text-[0.6rem] uppercase tracking-[0.28em] text-foreground/45">
                The loop that runs behind every session
              </p>
              <ol className="mt-3 space-y-1.5">
                {flow.map((step, index) => (
                  <li key={step} className="flex items-center gap-3 text-sm text-foreground/75">
                    <span className="font-mono text-[0.6rem] text-primary/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <CapabilityStatus progress={progress} />
          </div>
        </div>
      </div>
    </section>
  );
}

function EngineLayerCard({
  layer,
  index,
  progress,
}: {
  layer: EngineLayer;
  index: number;
  progress: ReturnType<typeof useSceneProgress>["progress"];
}) {
  const start = 0.1 + index * 0.19;
  const opacity = useTransform(progress, [start, start + 0.05, start + 0.2, start + 0.3], [0.15, 1, 1, 0.5]);
  const y = useTransform(progress, [start, start + 0.07], [34, 0]);

  return (
    <motion.article
      style={{ opacity, y }}
      className="rounded-2xl border border-foreground/10 bg-black/45 p-6 backdrop-blur"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[0.65rem] text-primary/70">0{index + 1}</span>
        <h3 className="text-base font-semibold uppercase tracking-[0.14em] md:text-lg">{layer.title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/75">{layer.body}</p>
      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
        {layer.inputs.map((input) => (
          <li key={input} className="flex items-start gap-2 text-xs text-foreground/55">
            <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
            {input}
          </li>
        ))}
      </ul>
      <p className="mt-4 border-l border-primary/40 pl-3 text-sm italic text-foreground/85">
        &ldquo;{layer.line}&rdquo;
      </p>
    </motion.article>
  );
}

function CapabilityStatus({ progress }: { progress: ReturnType<typeof useSceneProgress>["progress"] }) {
  const opacity = useTransform(progress, [0.72, 0.82], [0, 1]);
  const y = useTransform(progress, [0.72, 0.86], [28, 0]);

  const icons = {
    live: CheckCircle2,
    model: FlaskConical,
    next: CircleDashed,
  } as const;

  return (
    <motion.div
      style={{ opacity, y }}
      className="rounded-2xl border border-foreground/10 bg-black/45 p-5 backdrop-blur"
    >
      <p className="text-[0.6rem] uppercase tracking-[0.28em] text-foreground/45">
        What is true today — and what is not
      </p>
      <div className="mt-4 space-y-4">
        {capabilityRows.map((row) => {
          const Icon = icons[row.status];
          return (
            <div key={row.status} className="flex gap-3">
              <Icon
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  row.status === "live"
                    ? "text-emerald-400/80"
                    : row.status === "model"
                      ? "text-primary/80"
                      : "text-foreground/40"
                }`}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/85">
                  {row.label}
                </p>
                <ul className="mt-1 space-y-1">
                  {row.items.map((item) => (
                    <li key={item} className="text-xs leading-relaxed text-foreground/60">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
