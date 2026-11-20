import CinematicPlate, { type LandingVideoSlot } from "./CinematicPlate";

interface ReelPortalProps {
  video: LandingVideoSlot;
  /** Small caption printed under the film frame. */
  caption?: string;
  className?: string;
  overlay?: string;
}

/**
 * ReelPortal — a 9:16 film frame used as a recurring documentary motif.
 *
 * The brand film was cut vertically, so instead of cropping it into a wide
 * plate (which loses the composition) it is shown the way it was made:
 * as a tall, lit frame standing beside the scene.
 */
export default function ReelPortal({
  video,
  caption,
  className = "",
  overlay = "linear-gradient(to bottom, rgba(8,6,5,0.15) 0%, rgba(8,6,5,0.45) 55%, rgba(8,6,5,0.92) 100%)",
}: ReelPortalProps) {
  return (
    <figure className={className}>
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.1rem] border border-foreground/15 bg-black/60 shadow-[0_30px_90px_-30px_rgba(251,191,36,0.35)]">
        <CinematicPlate video={video} className="h-full w-full" overlay={overlay} />
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.1rem] ring-1 ring-inset ring-foreground/10"
          aria-hidden
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-[0.55rem] uppercase tracking-[0.22em] text-foreground/35">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
