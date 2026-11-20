import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CinematicPlate from "./CinematicPlate";
import ParticleField from "./ParticleField";
import { landingVideos } from "./landingAssets";

/**
 * ConsciousHero — the orb is the hero.
 *
 * No stock people, no abstract figure, no stock footage of a body: the
 * product's own living WebGL orb is the only thing in the frame. The
 * cinematic footage sits behind it as atmosphere, not as a substitute for
 * the product.
 *
 * The orb is the app's canonical component (`src/components/shared/Orb.tsx`)
 * — the same one on Home — so what a visitor sees here is literally what
 * they will hold when they sign in.
 */
export default function ConsciousHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 pb-20 pt-28"
    >
      <CinematicPlate
        video={landingVideos.productCosmic}
        className="absolute inset-0 h-full w-full"
        overlay="radial-gradient(ellipse 60% 55% at 50% 50%, rgba(10,7,5,0.35) 0%, rgba(6,5,4,0.92) 62%, #040303 100%)"
        loading="eager"
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <ParticleField progress={scrollYProgress} freezeAt={0.9} density={110} />
      </div>

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ scale: orbScale, opacity: orbOpacity }}
      >
        <div
          className="h-[58vmin] w-[58vmin] max-h-[560px] max-w-[560px] overflow-hidden rounded-full opacity-90"
          aria-hidden
        >
          
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center"
        style={{ y: copyY, opacity: copyOpacity }}
      >
        <span className="text-[0.62rem] uppercase tracking-[0.42em] text-primary/75">
          ConsciousOS
        </span>

        <h1 className="mt-6 text-balance text-4xl font-light leading-[1.08] text-foreground sm:text-5xl md:text-6xl">
          Your consciousness,
          <br />
          <span className="text-gradient-sunrise">mapped and met.</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Not a meditation library. A system that reads your patterns, understands where you
          are, and chooses the next practice — then learns from what actually happened.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/auth"
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-sunrise px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:scale-[1.03] glow-sunrise"
          >
            Begin your journey
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center rounded-full border border-primary/30 px-8 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-primary/60 hover:bg-primary/10"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-6 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/60">
          ₹11 free credits on signup &middot; No card required
        </p>
      </motion.div>

      {!reduceMotion ? (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/40"
          animate={{ opacity: [0.35, 0.8, 0.35], y: [0, 6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <div className="h-10 w-px bg-gradient-to-b from-primary/60 to-transparent" />
        </motion.div>
      ) : null}
    </section>
  );
}
