import { motion, useTransform } from "framer-motion";
import { ActLabel } from "../SceneStage";
import CinematicPlate from "../CinematicPlate";
import ReelPortal from "../ReelPortal";
import { useSceneProgress } from "../useSceneProgress";
import { landingVideos } from "../landingAssets";

interface SessionStep {
  step: number;
  title: string;
  body: string;
  detail: string;
}

const sessionSteps: SessionStep[] = [
  {
    step: 1,
    title: "Arrival",
    body: "You open ConsciousOS. The orb is waiting. The slot, the theme and your current context are already known.",
    detail: "A deliberate moment of attention, not another notification.",
  },
  {
    step: 2,
    title: "Orientation",
    body: "The session names its purpose before it asks for anything. Stone Lantern Meditation: notice the difference between a thought appearing and your attention following it.",
    detail: "You always know what you are exploring, and why.",
  },
  {
    step: 3,
    title: "Guided observation",
    body: "The practice directs attention: the head, the body, the gut, the thought that keeps catching hold — and whether it can be seen without being obeyed.",
    detail: "The observation matches the intent of the session.",
  },
  {
    step: 4,
    title: "Central practice",
    body: "The core exercise: breath awareness, body scanning, observing thoughts, emotional awareness, self-inquiry, or noticing an impulse before it becomes an action.",
    detail: "Audio, text, timing and animation support the practice — the practice still comes first.",
  },
  {
    step: 5,
    title: "Integration",
    body: "The audio stops and the session does not. A short, optional reflection: what did you notice that you usually overlook?",
    detail: "Tied to the purpose of this session, not a generic journal box.",
  },
  {
    step: 6,
    title: "Carry it into life",
    body: "One small relevant action. The next time you feel the urge to react, pause for one breath and notice what happened immediately before the urge.",
    detail: "No guilt, no pressure, no streak to protect.",
  },
  {
    step: 7,
    title: "Update the journey",
    body: "Engagement, reflection depth and completion produce a session quality signal. The theme is updated, the engine re-runs, and tomorrow starts from what happened today.",
    detail: "A continuing journey — not a completion badge.",
  },
];

const architecture = [
  "User context",
  "Session intent",
  "Practice selection",
  "Orientation",
  "Guided observation",
  "Central practice",
  "Integration",
  "Daily transfer",
  "User reflection",
  "Journey update",
  "Next session",
];

/**
 * ACT VI — Every session has a purpose.
 * The timeline assembles itself as the visitor scrolls.
 */
export function ActSession() {
  const { ref, progress } = useSceneProgress();

  const introOpacity = useTransform(progress, [0, 0.1, 0.17, 0.25], [0, 1, 1, 0]);
  const architectureOpacity = useTransform(progress, [0.82, 0.92], [0, 1]);
  const lineScale = useTransform(progress, [0.05, 0.9], [0, 1]);

  return (
    <section
      id="session"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "380vh" }}
      aria-label="Act six: how a session is designed"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <CinematicPlate
          video={landingVideos.sessionSage}
          className="absolute inset-0 h-full w-full"
          overlay="radial-gradient(ellipse 60% 55% at 50% 45%, rgba(8,6,5,0.45) 0%, rgba(6,5,4,0.92) 72%, rgba(4,3,3,1) 100%)"
        />

        <motion.div
          className="absolute inset-x-0 top-0 z-20 px-6 pt-24 text-center"
          style={{ opacity: introOpacity }}
        >
          <div>
            <ActLabel>Act VI — Every session has a purpose</ActLabel>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              A session is a designed sequence, not a track.
            </h2>
          </div>
        </motion.div>

        <ReelPortal
          video={landingVideos.sessionReel}
          caption="Act VI — the session"
          className="absolute right-6 top-1/2 z-20 hidden w-[150px] -translate-y-1/2 lg:block xl:w-[180px]"
        />

        <div className="relative z-10 w-full max-w-5xl px-6 lg:mr-[210px] xl:mr-[250px]">
          <div className="relative">
            <div className="absolute left-[19px] top-2 h-full w-px bg-foreground/10 md:left-1/2" aria-hidden />
            <motion.div
              className="absolute left-[19px] top-2 w-px origin-top bg-gradient-to-b from-primary/80 via-primary/40 to-transparent md:left-1/2"
              style={{ height: "100%", scaleY: lineScale }}
              aria-hidden
            />

            <ol className="space-y-4">
              {sessionSteps.map((item, index) => (
                <SessionStepRow key={item.step} item={item} index={index} progress={progress} />
              ))}
            </ol>
          </div>

          <motion.div
            className="mt-8 rounded-2xl border border-foreground/10 bg-black/50 p-5 backdrop-blur"
            style={{ opacity: architectureOpacity }}
          >
            <p className="text-[0.6rem] uppercase tracking-[0.28em] text-foreground/45">
              Session architecture
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
              {architecture.map((node, index) => (
                <span key={node} className="flex items-center gap-2">
                  <span className="rounded-full border border-foreground/15 px-3 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-foreground/70">
                    {node}
                  </span>
                  {index < architecture.length - 1 ? (
                    <span className="text-primary/50" aria-hidden>
                      →
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SessionStepRow({
  item,
  index,
  progress,
}: {
  item: SessionStep;
  index: number;
  progress: ReturnType<typeof useSceneProgress>["progress"];
}) {
  const start = 0.06 + index * 0.1;
  const opacity = useTransform(progress, [start, start + 0.05, start + 0.16, start + 0.24], [0.12, 1, 1, 0.45]);
  const x = useTransform(progress, [start, start + 0.07], [30, 0]);

  return (
    <motion.li
      style={{ opacity, x }}
      className="relative grid grid-cols-[40px_1fr] gap-4 md:grid-cols-[1fr_40px_1fr]"
    >
      <div className="hidden md:block" aria-hidden>
        {index % 2 === 1 ? (
          <motion.div
            className="rounded-2xl border border-foreground/10 bg-black/45 p-5 backdrop-blur"
            style={{ opacity, x }}
          >
            <StepBody item={item} />
          </motion.div>
        ) : null}
      </div>

      <div className="flex justify-center" aria-hidden>
        <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-[#0a0807] font-mono text-[0.65rem] text-primary">
          {String(item.step).padStart(2, "0")}
        </span>
      </div>

      <div className="md:pl-2">
        {index % 2 === 0 ? (
          <motion.div
            className="rounded-2xl border border-foreground/10 bg-black/45 p-5 backdrop-blur"
            style={{ opacity, x }}
          >
            <StepBody item={item} />
          </motion.div>
        ) : (
          <motion.div className="md:hidden" style={{ opacity, x }}>
            <div className="rounded-2xl border border-foreground/10 bg-black/45 p-5 backdrop-blur">
              <StepBody item={item} />
            </div>
          </motion.div>
        )}
      </div>
    </motion.li>
  );
}

function StepBody({ item }: { item: SessionStep }) {
  return (
    <>
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/90 md:text-base">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/75">{item.body}</p>
      <p className="mt-2 text-xs italic text-foreground/50">{item.detail}</p>
    </>
  );
}
