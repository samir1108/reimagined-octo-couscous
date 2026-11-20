import { useState } from "react";
import { motion, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActLabel, Shot } from "../SceneStage";
import CinematicPlate from "../CinematicPlate";
import ReelPortal from "../ReelPortal";
import { useSceneProgress } from "../useSceneProgress";
import { landingImages, landingVideos } from "../landingAssets";
import HomeScreenRecreation from "../screens/HomeScreenRecreation";

/**
 * ACT III — Meet the actual product.
 * The orb expands until it becomes the Home screen.
 */
export function ActMeetConsciousOS() {
  const { ref, progress } = useSceneProgress();
  const navigate = useNavigate();

  const orbScale = useTransform(progress, [0.05, 0.45], [0.55, 3.4]);
  const orbOpacity = useTransform(progress, [0.35, 0.55], [1, 0]);
  const deviceScale = useTransform(progress, [0.42, 0.68], [0.82, 1]);
  const deviceOpacity = useTransform(progress, [0.4, 0.58], [0, 1]);
  const deviceY = useTransform(progress, [0.42, 0.7], [40, 0]);
  const introOpacity = useTransform(progress, [0, 0.18, 0.34, 0.44], [0, 1, 1, 0]);

  return (
    <section
      id="meet-consciousos"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "280vh" }}
      aria-label="Act three: meet ConsciousOS"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <CinematicPlate
          video={landingVideos.productCosmic}
          className="absolute inset-0 h-full w-full"
          overlay="radial-gradient(ellipse 65% 55% at 50% 45%, rgba(10,8,6,0.2) 0%, rgba(6,5,4,0.9) 70%, rgba(4,3,3,1) 100%)"
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2"
          style={{ scale: orbScale, opacity: orbOpacity }}
          aria-hidden
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,244,210,0.9)_0%,rgba(251,191,36,0.5)_32%,rgba(120,60,30,0.25)_58%,transparent_75%)]" />
          <div className="absolute inset-[8%] rounded-full border border-primary/25" />
        </motion.div>

        <motion.div
          className="relative z-10 w-full max-w-5xl px-6 text-center"
          style={{ opacity: introOpacity }}
        >
          <ActLabel>Act III — Introduce ConsciousOS</ActLabel>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl">
            Your consciousness,
            <br />
            <span className="text-gradient-sunrise">mapped and met.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-foreground/80">
            ConsciousOS builds a picture of your patterns, meets you where you are, and helps you
            discover your next step.
          </p>
        </motion.div>

        <ReelPortal
          video={landingVideos.productReveal}
          caption="Act III — the reveal"
          className="absolute right-6 top-1/2 z-20 hidden w-[168px] -translate-y-1/2 lg:block xl:w-[200px]"
        />

        <motion.div
          className="absolute z-10 w-full max-w-4xl px-6 lg:mr-[220px] xl:mr-[260px]"
          style={{ opacity: deviceOpacity, scale: deviceScale, y: deviceY }}
        >
          <div className="relative mx-auto aspect-[9/16] w-full max-w-[330px] overflow-hidden rounded-[2.2rem] border border-foreground/20 bg-black shadow-[0_40px_120px_-30px_rgba(251,191,36,0.35)] md:aspect-[16/11] md:max-w-[620px] md:rounded-[1.6rem]">
            <div className="absolute inset-0 bg-[#0a0807]" />
            <div className="absolute inset-0 md:hidden">
              <HomeScreenCapture compact />
            </div>
            <div className="absolute inset-0 hidden md:block">
              <div className="grid h-full grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-center gap-4 border-r border-foreground/10 bg-black/30 p-6">
                  <span className="text-[0.6rem] uppercase tracking-[0.3em] text-primary/80">
                    The product
                  </span>
                  <p className="text-xl font-light leading-snug">
                    One orb. One theme. One session that fits the person you are today.
                  </p>
                  <p className="text-sm text-foreground/55">
                    The same Home you meet every day — slot rhythm, daily theme, journey progress and
                    your patterns — rather than a feed of unrelated content.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10"
                  >
                    Open the app
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="relative">
                  <HomeScreenRecreation />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[0.65rem] uppercase tracking-[0.2em] text-foreground/35">
            A faithful recreation of the real Home screen
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * HomeScreenCapture — the real Home capture when one has been published,
 * otherwise the faithful DOM recreation. Never a broken frame.
 */
function HomeScreenCapture({ compact = false }: { compact?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <HomeScreenRecreation compact={compact} />;

  return (
    <img
      src={landingImages.homeScreenshot.src}
      alt={landingImages.homeScreenshot.alt}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

const dimensions = [
  {
    key: "thought",
    title: "Thought",
    explores: "Thinking patterns, attention, recurring mental loops.",
    question: "Do you notice the same thought returning again and again?",
    state: "Engine band today",
  },
  {
    key: "emotion",
    title: "Emotion",
    explores: "Emotional reactions, recurring triggers, regulation.",
    question: "Can you notice an emotional reaction before it becomes an action?",
    state: "Loops + journal signal",
  },
  {
    key: "body",
    title: "Body",
    explores: "Sensations, tension, bodily awareness.",
    question: "Can you recognize what your body is communicating before your mind explains it?",
    state: "Engine band + practice level",
  },
  {
    key: "action",
    title: "Action",
    explores: "Habits, repeated behaviours, intention versus action.",
    question: "Where does what you intend and what you do quietly diverge?",
    state: "Practice history + completion",
  },
  {
    key: "connection",
    title: "Connection",
    explores: "Relationship patterns, boundaries, interpersonal responses.",
    question: "Which reactions do you inherit from the people closest to you?",
    state: "Loop and theme context",
  },
  {
    key: "spirit",
    title: "Spirit",
    explores: "Meaning, values, self-inquiry, witness-oriented practice.",
    question: "What are you actually oriented toward, beneath the daily noise?",
    state: "Assessment + path",
  },
];

/**
 * ACT IV — Six dimensions.
 * Each point illuminates as the scroll advances and connects into one map.
 */
export function ActConsciousnessMap() {
  const { ref, progress } = useSceneProgress();

  const headingOpacity = useTransform(progress, [0, 0.12, 0.2, 0.3], [0, 1, 1, 0.25]);
  const keyOpacity = useTransform(progress, [0.72, 0.86], [0, 1]);

  return (
    <section
      id="consciousness-map"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "320vh" }}
      aria-label="Act four: the consciousness map"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <CinematicPlate
          video={landingVideos.dimensionMap}
          className="absolute inset-0 h-full w-full"
          overlay="radial-gradient(ellipse 60% 55% at 50% 45%, rgba(9,7,5,0.35) 0%, rgba(6,5,4,0.88) 72%, rgba(4,3,3,1) 100%)"
        />

        <motion.div
          className="absolute inset-x-0 top-0 z-20 flex justify-center px-6 pt-24 text-center"
          style={{ opacity: headingOpacity }}
        >
          <div>
            <ActLabel>Act IV — A person is more than a single score</ActLabel>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Six dimensions of experience.
            </h2>
          </div>
        </motion.div>

        <ReelPortal
          video={landingVideos.dimensionReel}
          caption="Act IV — the map"
          className="absolute right-6 top-1/2 z-20 hidden w-[150px] -translate-y-1/2 lg:block xl:w-[180px]"
        />

        <div className="relative z-10 grid w-full max-w-6xl gap-8 px-6 lg:mr-[210px] xl:mr-[250px] md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <DimensionOrbit progress={progress} />
          </div>

          <div className="space-y-2.5">
            {dimensions.map((dimension, index) => (
              <DimensionRow
                key={dimension.key}
                dimension={dimension}
                index={index}
                progress={progress}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 px-6 pb-8"
          style={{ opacity: keyOpacity }}
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-foreground/10 bg-black/55 px-6 py-5 text-center backdrop-blur">
            <p className="text-lg font-medium md:text-xl">
              You cannot understand a person through a single number.
            </p>
            <p className="mt-2 text-sm text-foreground/65">
              ConsciousOS explores different dimensions of experience, one observation at a time.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface DimensionRowProps {
  dimension: (typeof dimensions)[number];
  index: number;
  progress: ReturnType<typeof useSceneProgress>["progress"];
}

function DimensionRow({ dimension, index, progress }: DimensionRowProps) {
  const start = 0.08 + index * 0.11;
  const opacity = useTransform(progress, [start, start + 0.05, start + 0.16, start + 0.24], [0.2, 1, 1, 0.55]);
  const x = useTransform(progress, [start, start + 0.07], [26, 0]);

  return (
    <motion.article
      style={{ opacity, x }}
      className="rounded-2xl border border-foreground/10 bg-black/40 px-5 py-4 backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold uppercase tracking-[0.16em] text-foreground/90 md:text-lg">
          {dimension.title}
        </h3>
        <span className="text-[0.6rem] uppercase tracking-[0.18em] text-primary/70">
          {dimension.state}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-foreground/70">{dimension.explores}</p>
      <p className="mt-2 text-sm italic text-foreground/55">&ldquo;{dimension.question}&rdquo;</p>
    </motion.article>
  );
}

function DimensionOrbit({ progress }: { progress: ReturnType<typeof useSceneProgress>["progress"] }) {
  const ringScale = useTransform(progress, [0, 0.8], [0.85, 1.05]);
  const coreScale = useTransform(progress, [0, 0.85], [0.7, 1]);

  return (
    <div className="relative h-full w-full">
      <motion.div
        className="absolute inset-[6%] rounded-full border border-foreground/10"
        style={{ scale: ringScale }}
        aria-hidden
      />
      <motion.div
        className="absolute inset-[20%] rounded-full border border-primary/15"
        style={{ scale: ringScale }}
        aria-hidden
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,244,210,0.8)_0%,rgba(251,191,36,0.35)_45%,transparent_75%)]"
        style={{ scale: coreScale }}
        aria-hidden
      />
      {dimensions.map((dimension, index) => (
        <DimensionPoint key={dimension.key} dimension={dimension} index={index} progress={progress} />
      ))}
    </div>
  );
}

function DimensionPoint({
  dimension,
  index,
  progress,
}: {
  dimension: (typeof dimensions)[number];
  index: number;
  progress: ReturnType<typeof useSceneProgress>["progress"];
}) {
  const angle = (index / dimensions.length) * Math.PI * 2 - Math.PI / 2;
  const left = 50 + Math.cos(angle) * 40;
  const top = 50 + Math.sin(angle) * 40;
  const start = 0.08 + index * 0.11;

  const opacity = useTransform(progress, [start, start + 0.06], [0.15, 1]);
  const scale = useTransform(progress, [start, start + 0.06], [0.6, 1.5]);

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left}%`, top: `${top}%`, opacity }}
    >
      <motion.span
        className="block h-2.5 w-2.5 rounded-full bg-primary"
        style={{ scale, boxShadow: "0 0 24px rgba(251,191,36,0.9)" }}
        aria-hidden
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.16em] text-foreground/60">
        {dimension.title}
      </span>
    </motion.div>
  );
}
