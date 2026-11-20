import { useEffect, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActLabel, Reveal, Shot } from "../SceneStage";
import CinematicPlate from "../CinematicPlate";
import { useSceneProgress } from "../useSceneProgress";
import { landingImages, landingVideos } from "../landingAssets";
import HomeScreenRecreation from "../screens/HomeScreenRecreation";
import ConsciousnessMapRecreation from "../screens/ConsciousnessMapRecreation";
import JourneyRecreation from "../screens/JourneyRecreation";
import ProfileRecreation from "../screens/ProfileRecreation";

const dayPhases = [
  {
    phase: "Morning",
    room: "The Awakening",
    action: "Begin Awakening",
    ritual: "Sankalpa",
    intent: "Set the tone before the noise begins.",
    focus: "Establish an intention and notice the starting state.",
  },
  {
    phase: "Midday",
    room: "The Pulse",
    action: "60-Second Reset",
    ritual: "The Reset",
    intent: "Sixty seconds. That's all this asks.",
    focus: "Observe one recurring thought or behavioural loop.",
  },
  {
    phase: "Evening",
    room: "The Hall",
    action: "Begin Integration",
    ritual: "Three Stones",
    intent: "Decompress, then look back gently.",
    focus: "Reflect on how the pattern appeared during the day.",
  },
  {
    phase: "Night",
    room: "The Sanctuary",
    action: "Enter Sanctuary",
    ritual: "Empty Bowl",
    intent: "Let the day go. Nothing to achieve here.",
    focus: "Integrate the observation and prepare for tomorrow.",
  },
];

/**
 * ACT VII — A practice becomes a journey.
 * The sky moves from dawn to night as the day unfolds.
 */
export function ActDailyJourney() {
  const { ref, progress } = useSceneProgress();

  const sky = useTransform(
    progress,
    [0, 0.22, 0.48, 0.74, 1],
    [
      "rgba(34,23,16,0.72)",
      "rgba(47,34,16,0.68)",
      "rgba(28,23,32,0.74)",
      "rgba(36,18,18,0.76)",
      "rgba(6,5,11,0.82)",
    ],
  );
  const glow = useTransform(
    progress,
    [0, 0.22, 0.48, 0.74, 1],
    [
      "rgba(251,191,36,0.28)",
      "rgba(251,191,36,0.16)",
      "rgba(190,150,255,0.14)",
      "rgba(251,146,60,0.16)",
      "rgba(120,90,220,0.12)",
    ],
  );
  const headingOpacity = useTransform(progress, [0, 0.1, 0.17, 0.25], [0, 1, 1, 0]);
  const themeOpacity = useTransform(progress, [0.7, 0.82], [0, 1]);
  const skyGlow = useTransform(
    glow,
    (value) => `radial-gradient(ellipse 60% 45% at 50% 78%, ${value} 0%, transparent 70%)`,
  );

  return (
    <section
      id="daily-journey"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "340vh" }}
      aria-label="Act seven: the daily journey"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <CinematicPlate
          video={landingVideos.dayDawn}
          className="absolute inset-0 h-full w-full"
          overlay="linear-gradient(to bottom, rgba(8,6,5,0.55) 0%, rgba(8,6,5,0.25) 40%, rgba(8,6,5,0.8) 100%)"
        />
        <motion.div className="absolute inset-0" style={{ background: sky }} aria-hidden />
        <motion.div
          className="absolute inset-0"
          style={{ background: skyGlow }}
          aria-hidden
        />

        <motion.div
          className="absolute inset-x-0 top-0 z-20 px-6 pt-24 text-center"
          style={{ opacity: headingOpacity }}
        >
          <div>
            <ActLabel>Act VII — A practice becomes a journey</ActLabel>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              A session answers what to do now.
              <br className="hidden md:block" />A mission answers why it matters.
            </h2>
          </div>
        </motion.div>

        <div className="relative z-10 w-full max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-4">
            {dayPhases.map((phase, index) => (
              <DayPhaseCard key={phase.phase} phase={phase} index={index} progress={progress} />
            ))}
          </div>

          <motion.div
            className="mt-6 rounded-2xl border border-foreground/10 bg-black/45 p-6 backdrop-blur"
            style={{ opacity: themeOpacity }}
          >
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-foreground/45">
              Today&rsquo;s theme
            </p>
            <h3 className="mt-2 text-xl font-medium md:text-2xl">Stone Lantern Meditation</h3>
            <p className="mt-2 max-w-2xl text-sm text-foreground/70">
              Notice the difference between a thought and your response to that thought.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-foreground/55">
              {[
                "Morning observation",
                "One real-world moment",
                "Evening reflection",
                "Tomorrow's theme evolves",
              ].map((node, index) => (
                <span key={node} className="flex items-center gap-2">
                  <span className="rounded-full border border-foreground/15 px-3 py-1">{node}</span>
                  {index < 3 ? <span className="text-primary/60" aria-hidden>→</span> : null}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DayPhaseCard({
  phase,
  index,
  progress,
}: {
  phase: (typeof dayPhases)[number];
  index: number;
  progress: ReturnType<typeof useSceneProgress>["progress"];
}) {
  const start = 0.08 + index * 0.14;
  const opacity = useTransform(progress, [start, start + 0.05, start + 0.18, start + 0.26], [0.18, 1, 1, 0.5]);
  const y = useTransform(progress, [start, start + 0.07], [26, 0]);

  return (
    <motion.article
      style={{ opacity, y }}
      className="rounded-2xl border border-foreground/10 bg-black/40 p-5 backdrop-blur"
    >
      <p className="text-[0.6rem] uppercase tracking-[0.28em] text-primary/75">{phase.room}</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground/90">{phase.phase}</h3>
      <p className="mt-1 text-xs italic text-foreground/55">{phase.intent}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/75">{phase.focus}</p>
      <div className="mt-4 space-y-1 border-t border-foreground/10 pt-3 text-xs text-foreground/60">
        <p>
          <span className="text-foreground/85">Action:</span> {phase.action}
        </p>
        <p>
          <span className="text-foreground/85">Ritual:</span> {phase.ritual}
        </p>
      </div>
    </motion.article>
  );
}

interface AppScreen {
  id: string;
  title: string;
  purpose: string;
  connection: string;
  image?: { src: string; alt: string };
  route?: string;
  fallback: "home" | "orb" | "map" | "journey" | "profile";
}

const appScreens: AppScreen[] = [
  {
    id: "home",
    title: "Home",
    purpose: "The orb, today's theme, the slot rhythm and where your journey stands.",
    connection: "Everything else in the app is reachable from this one screen.",
    fallback: "home",
    route: "/app",
  },
  {
    id: "experience",
    title: "Experience",
    purpose: "The guided experience paths — observation, self-inquiry, pranayama, witness.",
    connection: "This is where a theme becomes a concrete, guided practice.",
    image: landingImages.appExperience,
    route: "/experience",
    fallback: "orb",
  },
  {
    id: "loops-atlas",
    title: "Loops Atlas",
    purpose: "A map of the recurring patterns the system has noticed in your account.",
    connection: "Loops give the engine something specific to work on next.",
    image: landingImages.appLoopsAtlas,
    route: "/experience/loops-atlas",
    fallback: "orb",
  },
  {
    id: "loops",
    title: "Loops",
    purpose: "Notice what repeats, explore what triggers it, practice responding differently.",
    connection: "A loop you have named is a loop the engine can weight.",
    image: landingImages.appLoops,
    route: "/loops",
    fallback: "orb",
  },
  {
    id: "knowledge",
    title: "Knowledge",
    purpose: "The written map — essays, frameworks and traditions available while you practise.",
    connection: "Understanding is part of the session, not a separate reading list.",
    image: landingImages.appKnowledge,
    route: "/knowledge",
    fallback: "orb",
  },
  {
    id: "handbook",
    title: "Handbook",
    purpose: "Your working handbook: practices, levels and how to use them.",
    connection: "It is the manual for the journey the app is running.",
    image: landingImages.appHandbook,
    route: "/handbook",
    fallback: "orb",
  },
  {
    id: "orb",
    title: "Orb Session",
    purpose: "The focused environment where a session is actually held.",
    connection: "Hold the orb, orient, practise, reflect, and the journey updates.",
    image: landingImages.appOrbSlot,
    route: "/app",
    fallback: "orb",
  },
  {
    id: "map",
    title: "Consciousness Map",
    purpose: "How the dimensions, bands and developmental model fit together.",
    connection: "The map explains why the next practice was chosen for you.",
    image: landingImages.appMapSlot,
    route: "/app/analytics",
    fallback: "map",
  },
  {
    id: "journey",
    title: "Journey",
    purpose: "Completed sessions, observations and milestones in one arc.",
    connection: "The arc is the evidence that the journey is evolving.",
    image: landingImages.appJourneySlot,
    route: "/app/journeys",
    fallback: "journey",
  },
  {
    id: "profile",
    title: "Profile",
    purpose: "The system's current understanding of you, and what you can correct.",
    connection: "Every inference here is a claim you can see — and dispute.",
    image: landingImages.appProfileSlot,
    route: "/app/settings",
    fallback: "profile",
  },
];

/**
 * ACT VIII — From the engine into your hands.
 * The real screens emerge one at a time.
 */
export function ActAppScreens() {
  const { ref, progress } = useSceneProgress();
  const navigate = useNavigate();

  const headingOpacity = useTransform(progress, [0, 0.08, 0.14, 0.2], [0, 1, 1, 0]);

  return (
    <section
      id="app-screens"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "420vh" }}
      aria-label="Act eight: the real application"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <Shot
          image={landingImages.appIntro}
          className="absolute inset-0 h-full w-full"
          overlay="radial-gradient(ellipse 70% 60% at 50% 45%, rgba(8,6,5,0.5) 0%, rgba(6,5,4,0.93) 70%, rgba(4,3,3,1) 100%)"
        />

        <motion.div
          className="absolute inset-x-0 top-0 z-20 px-6 pt-24 text-center"
          style={{ opacity: headingOpacity }}
        >
          <div>
            <ActLabel>Act VIII — From the engine into your hands</ActLabel>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">This is the actual app.</h2>
          </div>
        </motion.div>

        <div className="relative z-10 grid w-full max-w-6xl items-center gap-8 px-6 md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-foreground/15 bg-black/70 shadow-[0_40px_120px_-40px_rgba(251,191,36,0.3)]">
            {appScreens.map((screen, index) => (
              <ScreenPlate key={screen.id} screen={screen} index={index} progress={progress} />
            ))}
          </div>

          <div className="space-y-4">
            {appScreens.map((screen, index) => (
              <ScreenCaption key={screen.id} screen={screen} index={index} progress={progress} />
            ))}
            <Reveal>
              <div className="rounded-2xl border border-foreground/10 bg-black/50 p-5">
                <p className="text-sm leading-relaxed text-foreground/70">
                  Each screen does one job, and each one feeds the next session. The journey is the
                  product — not any single screen.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Open ConsciousOS
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScreenPlate({
  screen,
  index,
  progress,
}: {
  screen: AppScreen;
  index: number;
  progress: ReturnType<typeof useSceneProgress>["progress"];
}) {
  const count = appScreens.length;
  const start = 0.06 + (index / count) * 0.82;
  const end = start + 0.82 / count;
  const opacity = useTransform(progress, [start, start + 0.012, end - 0.012, end], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, start + 0.03, end - 0.03, end], [1.03, 1, 1, 0.98]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity, scale }}>
      <ScreenVisual screen={screen} />
    </motion.div>
  );
}

/**
 * ScreenVisual — shows the real capture when one exists, and the faithful
 * DOM reconstruction of that screen when it does not. The page never shows a
 * broken image or an empty frame.
 */
function ScreenVisual({ screen }: { screen: AppScreen }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(screen.image) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [screen.image?.src]);

  if (!hasImage) {
    return <FallbackScreen kind={screen.fallback} />;
  }

  return (
    <picture>
      {screen.image!.mobileSrc ? (
        <source media="(max-width: 767px)" srcSet={screen.image!.mobileSrc} />
      ) : null}
      <img
        src={screen.image!.src}
        alt={screen.image!.alt}
        className="h-full w-full object-cover"
        onError={() => setImageFailed(true)}
      />
    </picture>
  );
}

function FallbackScreen({ kind }: { kind: AppScreen["fallback"] }) {
  switch (kind) {
    case "home":
      return <HomeScreenRecreation />;
    case "map":
      return <ConsciousnessMapRecreation />;
    case "journey":
      return <JourneyRecreation />;
    case "profile":
      return <ProfileRecreation />;
    case "orb":
    default:
      return <HomeScreenRecreation />;
  }
}

function ScreenCaption({
  screen,
  index,
  progress,
}: {
  screen: AppScreen;
  index: number;
  progress: ReturnType<typeof useSceneProgress>["progress"];
}) {
  const count = appScreens.length;
  const start = 0.06 + (index / count) * 0.82;
  const end = start + 0.82 / count;
  const opacity = useTransform(progress, [start, start + 0.012, end - 0.012, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, start + 0.03], [18, 0]);

  return (
    <motion.article style={{ opacity, y }} className="rounded-2xl border border-foreground/10 bg-black/45 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/90">
        {screen.title}
      </h3>
      <p className="mt-1.5 text-sm text-foreground/75">{screen.purpose}</p>
      <p className="mt-1.5 text-xs italic text-foreground/50">{screen.connection}</p>
    </motion.article>
  );
}
