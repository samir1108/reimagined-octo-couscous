/**
 * SessionFilmBackdrop — the film body under a guided sitting.
 *
 * A muted, looping cinematic clip drives depth while the voice and orb carry
 * the practice. The poster is always painted underneath, so slow networks and
 * reduced-motion users get a still frame instead of a black hole.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface SessionFilmBackdropProps {
  url?: string;
  poster?: string;
  /** Begin playback (the sitting has started). */
  active: boolean;
  /** Hold the frame when the sitting is paused. */
  paused?: boolean;
  /** Extra class names for the video element. */
  className?: string;
}

export function SessionFilmBackdrop({
  url,
  poster,
  active,
  paused = false,
  className,
}: SessionFilmBackdropProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !paused && !reduce) {
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    } else {
      video.pause();
    }
  }, [active, paused, url, reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black" aria-hidden="true">
      {/* Still frame — instant, and the whole experience under reduced motion */}
      {poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          style={{
            filter: active ? "blur(1.5px) saturate(0.92)" : "blur(0px)",
            transition: "filter 1.2s ease",
          }}
        />
      )}

      {url && !reduce && (
        <motion.video
          ref={videoRef}
          src={url}
          poster={poster}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          className={
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-out " +
            (className ?? "")
          }
          initial={false}
          animate={{ opacity: active && ready ? 0.72 : 0, scale: active ? 1.04 : 1 }}
          transition={{ opacity: { duration: 1.6 }, scale: { duration: 18, ease: "linear" } }}
        />
      )}

      {/* Film grade: soft top/bottom gate + centre focus pull */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/85" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 38%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
