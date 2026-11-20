import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export interface LandingVideoSource {
  src: string;
  type: string;
}

export interface LandingVideoSlot {
  /** Ordered sources; the browser picks the first it can decode. */
  sources: LandingVideoSource[];
  /** Poster image shown before playback and when motion is reduced. */
  poster: string;
  alt: string;
  /** Crop hint for the poster and for the video frame. */
  position?: string;
}

interface CinematicPlateProps {
  video: LandingVideoSlot;
  className?: string;
  /** Legibility overlay painted on top of the footage. */
  overlay?: string;
  /** Renders the poster on top of the video until playback starts. */
  showPosterUntilPlaying?: boolean;
  /** Eager-load the poster for above-the-fold plates. */
  loading?: "eager" | "lazy";
  /** Called when the video reaches its end (used for sequenced reels). */
  onEnded?: () => void;
}

/**
 * CinematicPlate — a film plate for the landing page.
 *
 * Behaviour:
 *   - The <video> element is only mounted once the plate comes within 300px
 *     of the viewport, so a page with a dozen plates does not open a dozen
 *     media requests at once.
 *   - It plays muted, looping and inline so it never blocks the page.
 *   - If motion is reduced, or the file cannot be loaded, the poster image
 *     is shown instead — the scene still reads correctly.
 *   - The poster stays visible until the first frame is decoded, so there is
 *     never a black flash.
 */
export default function CinematicPlate({
  video,
  className = "",
  overlay = "linear-gradient(to bottom, rgba(8,6,5,0.35) 0%, rgba(8,6,5,0.75) 60%, rgba(8,6,5,0.95) 100%)",
  showPosterUntilPlaying = true,
  loading = "lazy",
  onEnded,
}: CinematicPlateProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setNearViewport(entry.isIntersecting);
          // Latch: once a plate has been reached it stays mounted, so the
          // buffer survives a scroll away and back.
          if (entry.isIntersecting) setMounted(true);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    if (nearViewport) {
      const attempt = element.play();
      if (attempt) attempt.catch(() => undefined);
    } else {
      element.pause();
    }
  }, [nearViewport, mounted]);

  const shouldRenderVideo = !reduced && !failed && mounted;

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-[#080605] ${className}`}>
      <img
        src={video.poster}
        alt={video.alt}
        loading={loading}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: video.position ?? "center" }}
        aria-hidden={shouldRenderVideo}
      />

      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{
            objectPosition: video.position ?? "center",
            opacity: showPosterUntilPlaying && !playing ? 0 : 1,
          }}
          poster={video.poster}
          muted
          loop={!onEnded}
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-label={video.alt}
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          onEnded={onEnded}
        >
          {video.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      ) : null}

      <div className="absolute inset-0" style={{ background: overlay }} aria-hidden />
    </div>
  );
}
