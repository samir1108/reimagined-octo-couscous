import { useRef } from "react";
import { motion, useTransform } from "framer-motion";
import ParticleField from "../ParticleField";
import CinematicPlate from "../CinematicPlate";
import ReelPortal from "../ReelPortal";
import { ActLabel, Reveal, Shot } from "../SceneStage";
import { useSceneProgress } from "../useSceneProgress";
import { landingImages, landingVideos } from "../landingAssets";

const innerLayers = [
  { label: "Thoughts", note: "The story the mind tells itself" },
  { label: "Emotions", note: "What moves through you unbidden" },
  { label: "Bodily sensations", note: "Tension, breath, the gut" },
  { label: "Habits and actions", note: "What repeats without deciding" },
  { label: "Relationships", note: "The patterns you carry between people" },
  { label: "Meaning and inner life", note: "What you are actually oriented toward" },
];

interface InnerLayerRowProps {
  label: string;
  note: string;
  progress: ReturnType<typeof useSceneProgress>["progress"];
  start: number;
}

function InnerLayerRow({ label, note, progress, start }: InnerLayerRowProps) {
  const opacity = useTransform(
    progress,
    [start, start + 0.05, start + 0.13, start + 0.2],
    [0.15, 1, 1, 0.45],
  );
  const x = useTransform(progress, [start, start + 0.06], [24, 0]);

  return (
    <motion.li
      style={{ opacity, x }}
      className="group flex items-baseline gap-4 rounded-xl border border-foreground/10 bg-black/35 px-4 py-3 backdrop-blur-sm"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-foreground/90">{label}</p>
        <p className="text-sm text-foreground/55">{note}</p>
      </div>
    </motion.li>
  );
}

/**
 * ACT I — The human problem.
 * The thinking field accelerates with scroll, then locks on the word CONTROL.
 */
export function ActHumanQuestion() {
  const { ref, progress } = useSceneProgress();

  const lineOne = useTransform(progress, [0.04, 0.16, 0.3, 0.4], [0, 1, 1, 0]);
  const lineTwo = useTransform(progress, [0.14, 0.26, 0.4, 0.5], [0, 1, 1, 0]);
  const statement = useTransform(progress, [0.34, 0.46, 0.68, 0.78], [0, 1, 1, 0]);
  const control = useTransform(progress, [0.56, 0.66, 0.9, 1], [0, 1, 1, 1]);
  const controlScale = useTransform(progress, [0.56, 0.68], [1.35, 1]);
  const question = useTransform(progress, [0.76, 0.86], [0, 1]);
  const questionY = useTransform(progress, [0.76, 0.9], [24, 0]);
  const fieldOpacity = useTransform(progress, [0, 0.5, 1], [0.9, 1, 0.75]);

  return (
    <section
      id="human-question"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "300vh" }}
      aria-label="Act one: the human question"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <CinematicPlate
          video={landingVideos.humanShadow}
          className="absolute inset-0 h-full w-full"
          overlay="radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,7,5,0.25) 0%, rgba(6,5,4,0.92) 70%, rgba(4,3,3,1) 100%)"
          loading="eager"
        />

        <motion.div className="absolute inset-0" style={{ opacity: fieldOpacity }}>
          <ParticleField progress={progress} freezeAt={0.82} density={150} />
        </motion.div>

        <ReelPortal
          video={landingVideos.humanReel}
          caption="Act I — the opening"
          className="absolute right-6 top-1/2 z-10 hidden w-[168px] -translate-y-1/2 lg:block xl:w-[200px]"
        />

        <div className="relative z-10 w-full max-w-4xl px-6 text-center lg:mr-[220px] xl:mr-[260px]">
          <motion.div style={{ opacity: lineOne }} className="mb-5">
            <p className="text-lg font-light leading-relaxed text-foreground/85 md:text-2xl">
              Everything you do is an attempt to change something.
            </p>
          </motion.div>

          <motion.div style={{ opacity: lineTwo }} className="mb-10">
            <p className="text-lg font-light leading-relaxed text-foreground/75 md:text-2xl">
              Your circumstances. Your emotions. Your future. Yourself.
            </p>
          </motion.div>

          <motion.p
            style={{ opacity: statement }}
            className="mb-6 text-sm uppercase tracking-[0.34em] text-foreground/60 md:text-base"
          >
            Everyone is seeking one thing.
          </motion.p>

          <motion.h1
            style={{ opacity: control, scale: controlScale }}
            className="text-gradient-sunrise text-glow text-6xl font-bold tracking-[0.06em] md:text-8xl lg:text-9xl"
          >
            CONTROL.
          </motion.h1>

          <motion.p
            style={{ opacity: question, y: questionY }}
            className="mx-auto mt-12 max-w-2xl text-lg font-light text-foreground/80 md:text-2xl"
          >
            But have you ever understood the one trying to control everything?
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/**
 * ACT II — Meet yourself.
 * Layers illuminate one by one, then converge into the golden orb.
 */
export function ActInnerWorld() {
  const { ref, progress } = useSceneProgress();

  const orbScale = useTransform(progress, [0.55, 0.95], [0.2, 1]);
  const orbOpacity = useTransform(progress, [0.5, 0.75], [0, 1]);
  const figureOpacity = useTransform(progress, [0, 0.3, 0.75, 1], [0.85, 1, 0.65, 0.35]);
  const layersOpacity = useTransform(progress, [0.6, 0.85], [1, 0.25]);

  return (
    <section
      id="inner-world"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "280vh" }}
      aria-label="Act two: meet yourself"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <CinematicPlate
          video={landingVideos.innerReflection}
          className="absolute inset-0 h-full w-full"
          overlay="linear-gradient(to bottom, rgba(6,5,4,0.85) 0%, rgba(8,6,5,0.35) 40%, rgba(5,4,3,0.95) 100%)"
        />

        <motion.div
          className="absolute inset-0"
          style={{ opacity: figureOpacity }}
          aria-hidden
        >
          <Shot
            image={landingImages.innerSeated}
            className="h-full w-full"
            overlay="radial-gradient(ellipse 45% 55% at 50% 45%, transparent 0%, rgba(6,5,4,0.55) 70%, rgba(4,3,3,0.95) 100%)"
          />
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-1/2 h-[38vmin] w-[38vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ opacity: orbOpacity, scale: orbScale }}
          aria-hidden
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,236,170,0.55)_0%,rgba(251,191,36,0.28)_35%,transparent_70%)] blur-[2px]" />
          <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(255,248,220,0.85)_0%,rgba(251,191,36,0.35)_45%,transparent_75%)]" />
          <div className="absolute -inset-[6%] rounded-full border border-primary/20" />
        </motion.div>

        <ReelPortal
          video={landingVideos.innerReel}
          caption="Act II — the layers"
          className="absolute right-6 top-1/2 z-10 hidden w-[168px] -translate-y-1/2 lg:block xl:w-[200px]"
        />

        <div className="relative z-10 w-full max-w-6xl px-6 lg:mr-[220px] xl:mr-[260px]">
          <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div>
              <Reveal>
                <ActLabel>Act II — Meet yourself</ActLabel>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 text-4xl font-bold leading-[1.05] text-foreground md:text-6xl">
                  The mind is only
                  <br />
                  the beginning.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-foreground/80 md:text-xl">
                  You are not just what you think. You are also what you feel, what you repeat, what you
                  avoid, and what you have never learned to notice.
                </p>
              </Reveal>
            </div>

            <motion.ul className="space-y-2" style={{ opacity: layersOpacity }}>
              {innerLayers.map((layer, index) => (
                <InnerLayerRow
                  key={layer.label}
                  label={layer.label}
                  note={layer.note}
                  progress={progress}
                  start={0.08 + index * 0.075}
                />
              ))}
            </motion.ul>
          </div>
        </div>
      </div>
    </section>
  );
}
