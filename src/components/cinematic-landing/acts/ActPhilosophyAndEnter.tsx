import { motion, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActLabel, Reveal, Shot } from "../SceneStage";
import CinematicPlate from "../CinematicPlate";
import { useSceneProgress } from "../useSceneProgress";
import { landingImages, landingVideos } from "../landingAssets";

/**
 * ACT IX — An inauguration of the journey.
 * The doors open and the hall becomes the app.
 */
export function ActPhilosophy() {
  const { ref, progress } = useSceneProgress();

  const doorsOpen = useTransform(progress, [0.1, 0.45], [0, 1]);
  const lightScale = useTransform(progress, [0.05, 0.5], [0.4, 1.4]);
  const lightOpacity = useTransform(progress, [0.05, 0.3, 0.75, 1], [0, 0.9, 0.65, 0.25]);
  const sageOpacity = useTransform(progress, [0.18, 0.38, 0.7, 0.85], [0, 0.75, 0.55, 0]);
  const copyOpacity = useTransform(progress, [0.35, 0.5, 0.82, 0.92], [0, 1, 1, 0]);
  const copyY = useTransform(progress, [0.35, 0.55], [30, 0]);
  const appOpacity = useTransform(progress, [0.8, 0.94], [0, 1]);

  return (
    <section
      id="philosophy"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "300vh" }}
      aria-label="Act nine: the philosophy"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <CinematicPlate
          video={landingVideos.inauguration}
          className="absolute inset-0 h-full w-full"
          overlay="linear-gradient(to bottom, rgba(5,4,3,0.8) 0%, rgba(6,5,4,0.55) 45%, rgba(4,3,3,0.95) 100%)"
        />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: lightOpacity }}
          aria-hidden
        >
          <motion.div
            className="h-[120vmin] w-[70vmin] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,236,170,0.55)_0%,rgba(251,191,36,0.18)_45%,transparent_72%)] blur-[6px]"
            style={{ scale: lightScale }}
          />
        </motion.div>

        <motion.div
          className="absolute inset-x-0 top-0 z-20 flex justify-center px-6 pt-24"
          style={{ opacity: copyOpacity }}
        >
          <div className="max-w-2xl text-center">
            <ActLabel>Act IX — An inauguration of the journey</ActLabel>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">The search turned inward.</h2>
          </div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-[38%] z-10 h-[46vmin] w-[46vmin] -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: sageOpacity }}
          aria-hidden
        >
          <div className="absolute inset-0 overflow-hidden rounded-full border border-primary/20">
            <Shot
              image={landingImages.sage}
              className="h-full w-full"
              overlay="radial-gradient(ellipse 60% 60% at 50% 35%, transparent 0%, rgba(6,5,4,0.6) 75%, rgba(4,3,3,0.95) 100%)"
            />
          </div>
          <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(255,244,210,0.35)_0%,transparent_70%)]" />
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 px-6 pb-14"
          style={{ opacity: copyOpacity, y: copyY }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg font-light leading-relaxed text-foreground/85 md:text-2xl">
              Across generations, human beings have searched for a deeper understanding of
              themselves.
            </p>
            <p className="mt-4 text-lg font-light leading-relaxed text-foreground/80 md:text-2xl">
              ConsciousOS brings that search into a personal, daily practice.
            </p>
            <p className="mt-4 text-lg font-light leading-relaxed text-foreground/90 md:text-2xl">
              Not by asking you to believe more. But by inviting you to observe more clearly.
            </p>
            <p className="mx-auto mt-8 max-w-2xl text-[0.65rem] uppercase tracking-[0.2em] text-foreground/35">
              An artistic, imagined scene in the visual language of classical Indian philosophy — not
              a historical event, recording, or endorsement.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#070605]"
          style={{ opacity: appOpacity }}
          aria-hidden
        >
          <div className="h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,244,210,0.9)_0%,rgba(251,191,36,0.4)_45%,transparent_75%)]" />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * ACT X — Your journey begins.
 */
export function ActEnter() {
  const navigate = useNavigate();
  const { ref, progress } = useSceneProgress();

  const opacity = useTransform(progress, [0.05, 0.35], [0, 1]);
  const y = useTransform(progress, [0.05, 0.35], [40, 0]);
  const signatureOpacity = useTransform(progress, [0.02, 0.3, 1], [0, 0.55, 0.42]);
  const background = useTransform(
    progress,
    [0, 0.5, 1],
    ["#070605", "#0b0806", "#120d08"],
  );

  return (
    <section
      id="enter"
      ref={ref}
      className="relative w-full"
      style={{ minHeight: "180vh" }}
      aria-label="Act ten: begin your journey"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ background }} aria-hidden />
        <motion.div
          className="absolute left-1/2 top-1/2 aspect-[9/16] h-[72vmin] max-h-[620px] w-auto -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.4rem] border border-foreground/10"
          style={{ opacity: signatureOpacity }}
          aria-hidden
        >
          <CinematicPlate
            video={landingVideos.enterSignature}
            className="h-full w-full"
            overlay="linear-gradient(to bottom, rgba(8,6,5,0.35) 0%, rgba(8,6,5,0.55) 50%, rgba(8,6,5,0.9) 100%)"
          />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2 h-[52vmin] w-[52vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,244,210,0.28)_0%,rgba(251,191,36,0.12)_42%,transparent_70%)]"
          aria-hidden
        />

        <motion.div
          className="relative z-10 w-full max-w-3xl px-6 text-center"
          style={{ opacity, y }}
        >
          <Reveal>
            <ActLabel>Act X — Your journey begins</ActLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-5xl font-bold tracking-tight md:text-7xl">ConsciousOS</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-3 text-xl font-light text-foreground/85 md:text-2xl">
              Your consciousness, mapped and met.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mx-auto mt-8 max-w-md space-y-1.5 text-left text-sm text-foreground/70 md:text-base">
              <p>Begin with where you are.</p>
              <p>Discover what you repeat.</p>
              <p>Learn to observe.</p>
              <p>Take the next step.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                Begin your journey
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/25 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80 transition-colors hover:bg-foreground/5"
              >
                Sign in
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-8 text-xs text-foreground/40">
              Navigation, skip and reduced-motion support stay available the whole way through.
            </p>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
