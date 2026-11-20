import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LandingImageSlot } from "./landingAssets";
import { useSceneProgress } from "./useSceneProgress";

interface SceneStageProps {
  id: string;
  act?: string;
  children: ReactNode;
  /** Scene length in viewport heights. Longer = slower, more cinematic. */
  height?: string;
  className?: string;
}

/** A full-height sticky stage. Everything inside stays pinned while the act plays. */
export function SceneStage({
  id,
  children,
  height = "220vh",
  className = "",
}: SceneStageProps) {
  const { ref } = useSceneProgress();
  return (
    <section
      id={id}
      ref={ref}
      className={`relative w-full ${className}`}
      style={{ minHeight: height }}
      aria-label={id.replace(/-/g, " ")}
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        {children}
      </div>
    </section>
  );
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/** Text/UI reveal that respects reduced-motion preferences. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-12% 0px -12% 0px" });
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface ActLabelProps {
  children: ReactNode;
  className?: string;
}

/** Small uppercase act marker used at the top of every scene. */
export function ActLabel({ children, className = "" }: ActLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-primary/70 ${className}`}
    >
      <span className="h-px w-8 bg-primary/40" aria-hidden />
      {children}
    </span>
  );
}

interface ShotProps {
  image: LandingImageSlot;
  className?: string;
  overlay?: string;
  loading?: "eager" | "lazy";
}

/**
 * Shot — a cinematic image plate with a legibility overlay.
 * Falls back to a dark gradient when the asset is missing.
 */
export function Shot({
  image,
  className = "",
  overlay = "linear-gradient(to bottom, rgba(8,6,5,0.35) 0%, rgba(8,6,5,0.75) 60%, rgba(8,6,5,0.95) 100%)",
  loading = "lazy",
}: ShotProps) {
  return (
    <div className={`overflow-hidden bg-[#080605] ${className}`}>
      <img
        src={image.src}
        alt={image.alt}
        loading={loading}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: image.position ?? "center" }}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0" style={{ background: overlay }} aria-hidden />
      {image.credit ? (
        <span className="absolute bottom-2 right-3 text-[0.6rem] uppercase tracking-wider text-white/35">
          {image.credit}
        </span>
      ) : null}
    </div>
  );
}

interface SectionShellProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Standard readable content column for non-sticky sections. */
export function SectionShell({ children, className = "", id }: SectionShellProps) {
  return (
    <section id={id} className={`relative px-5 py-24 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
