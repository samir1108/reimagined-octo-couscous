import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { IntroMedia } from "./AppScrollIntro";

interface ScreenMockupProps {
  media?: IntroMedia;
  /** Shown inside the placeholder screen until a real screenshot is provided. */
  fallbackKicker?: string;
  fallbackHeading?: string;
}

/**
 * Desktop + mobile captures of the same screen in one composed shot:
 * the wide capture in a window frame, the phone capture overlapping its corner.
 * Each capture sits above a labelled placeholder, so an unpublish­ed file
 * (404) falls back gracefully to the placeholder.
 */
export function ScreenPair({
  desktop,
  mobile,
}: {
  desktop: IntroMedia;
  mobile: IntroMedia;
}) {
  return (
    <div className="relative mx-auto w-full pb-[6%] pr-[2%]">
      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0906] p-[0.35rem] shadow-[0_50px_120px_-40px_rgba(245,197,102,0.28)]">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#0d0b07]">
          <CaptureLayer media={desktop} placeholder="desktop capture" overlay />
          <div className="pointer-events-none absolute left-3 top-[0.35rem] flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-[0.3rem] w-[0.3rem] rounded-full bg-white/15" />
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-[4%] right-0 w-[26%] min-w-[6.5rem]">
        <div className="aspect-[9/18.5] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0a0906] p-[0.3rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="relative h-full w-full overflow-hidden rounded-[1.35rem] bg-[#0d0b07]">
            <CaptureLayer media={mobile} placeholder="mobile" small />
            <div className="pointer-events-none absolute left-1/2 top-[0.35rem] h-[0.6rem] w-[2.2rem] -translate-x-1/2 rounded-full bg-black/90" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Media above a labelled placeholder; a failed load reveals the placeholder. */
function CaptureLayer({
  media,
  placeholder,
  small = false,
  overlay = false,
}: {
  media: IntroMedia;
  placeholder: string;
  small?: boolean;
  overlay?: boolean;
}) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-white/25",
          small
            ? "text-[0.5rem] tracking-[0.25em]"
            : "text-xs tracking-[0.3em] uppercase",
          overlay && "pt-3",
        )}
      >
        {placeholder}
      </div>
      {media.src &&
        (media.kind === "video" ? (
          <video
            src={media.src}
            autoPlay
            muted
            loop
            playsInline
            aria-label={media.alt ?? ""}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <img
            src={media.src}
            alt={media.alt ?? ""}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ))}
    </>
  );
}

/**
 * Device/window frame for tour screens. When `media.src` is set the screenshot
 * or clip fills the frame; otherwise a styled placeholder renders so the tour
 * is complete before every screenshot is dropped into public/app-screens/.
 */
export default function ScreenMockup({
  media,
  fallbackKicker,
  fallbackHeading,
}: ScreenMockupProps) {
  const frame = media?.frame ?? "phone";
  const isWide = frame === "screen";

  return (
    <div
      className={cn(
        "relative mx-auto w-full border border-white/10 bg-[#0a0906] shadow-[0_50px_120px_-40px_rgba(245,197,102,0.28)]",
        isWide
          ? "aspect-[16/10] rounded-xl p-[0.35rem]"
          : "aspect-[9/18.5] rounded-[2.6rem] p-[0.55rem]",
      )}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden bg-gradient-to-b from-[#171208] via-[#0d0b07] to-[#070603]",
          isWide ? "rounded-lg" : "rounded-[2.15rem]",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={media?.src ?? "placeholder"}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            {/* placeholder stays underneath — a failed capture load reveals it */}
            <PlaceholderScreen kicker={fallbackKicker} heading={fallbackHeading} />
            {media?.src && (
              media.kind === "video" ? (
                <video
                  src={media.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label={media.alt ?? ""}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className={cn(
                    "absolute inset-0 h-full w-full",
                    isWide ? "object-contain" : "object-cover object-top",
                  )}
                />
              ) : (
                <img
                  src={media.src}
                  alt={media.alt ?? ""}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className={cn(
                    "absolute inset-0 h-full w-full",
                    isWide ? "object-contain" : "object-cover object-top",
                  )}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* window chrome / notch + screen gloss */}
        {isWide ? (
          <div className="pointer-events-none absolute left-3 top-[0.3rem] flex gap-1.5">
            {["bg-white/15", "bg-white/15", "bg-white/15"].map((c, i) => (
              <span key={i} className={cn("h-[0.3rem] w-[0.3rem] rounded-full", c)} />
            ))}
          </div>
        ) : (
          <div className="pointer-events-none absolute left-1/2 top-[0.5rem] h-[1.05rem] w-[4.4rem] -translate-x-1/2 rounded-full bg-black/90" />
        )}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10",
            isWide ? "rounded-lg" : "rounded-[2.15rem]",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent",
            isWide ? "rounded-b-lg" : "rounded-b-[2.15rem]",
          )}
        />
      </div>
    </div>
  );
}

function PlaceholderScreen({
  kicker,
  heading,
}: {
  kicker?: string;
  heading?: string;
}) {
  return (
    <div className="flex h-full w-full flex-col px-5 pb-7 pt-10">
      <div className="flex items-center justify-between text-[0.5rem] uppercase tracking-[0.2em] text-white/35">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-amber-300/80" />
          live
        </span>
      </div>
      {kicker && (
        <p className="mt-7 text-[0.55rem] uppercase tracking-[0.3em] text-amber-300/70">
          {kicker}
        </p>
      )}
      {heading && (
        <p className="mt-2 font-display text-lg font-semibold leading-snug text-white/90">
          {heading}
        </p>
      )}
      <div className="mt-6 space-y-2.5">
        {[92, 78, 85, 63].map((width, i) => (
          <div
            key={i}
            className="h-9 rounded-lg border border-white/5 bg-white/[0.04]"
            style={{ width: `${width}%` }}
          >
            <div className="ml-3 mt-3 h-1.5 w-1/2 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full",
              i === 0 ? "w-5 bg-amber-300/70" : "w-1 bg-white/15",
            )}
          />
        ))}
      </div>
    </div>
  );
}
