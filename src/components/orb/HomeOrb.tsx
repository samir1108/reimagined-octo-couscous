import { Suspense, lazy, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { OrbMood, OrbVariant } from "@/components/OversoulOrb.heavy";

const LazyHomeOrb = lazy(() =>
  import("@/components/OversoulOrb.heavy").then((module) => ({
    default: module.OversoulOrbEmbed,
  })),
);

const noop = () => {};

export interface HomeOrbProps {
  /** Pixel size. Omit to fill the parent. */
  size?: number;
  gate?: string;
  variant?: OrbVariant;
  mood?: OrbMood;
  /** Wires tap/hold/triple-tap gestures. Decorative orbs stay inert. */
  interactive?: boolean;
  /**
   * Shown while the WebGL module loads. Defaults to the warm gradient disc;
   * pass `null` on surfaces where that disc would read as a second, wrong orb.
   */
  fallback?: ReactNode;
  /** Skip the flat tint disc when WebGL is unavailable (show nothing instead). */
  hideWebglFallback?: boolean;
  className?: string;
  onActivate?: () => void;
  onHold?: () => void;
  onTriple?: () => void;
  onHaptic?: (pattern: number | number[]) => void;
}

/**
 * The Home orb — one visual for every orb surface in the app.
 *
 * Home renders this exact orb; every other screen (session shell, guide,
 * practice, temple, widgets) reuses it so the orb never changes shape or
 * behaviour between flows.
 */
export default function HomeOrb({
  size,
  gate = "morning",
  variant,
  mood = "calm",
  interactive = false,
  fallback,
  hideWebglFallback,
  className,
  onActivate,
  onHold,
  onTriple,
  onHaptic,
}: HomeOrbProps) {
  const dimension = useMemo(
    () =>
      size
        ? { width: size, height: size, maxWidth: "100%", maxHeight: "100%" }
        : undefined,
    [size],
  );

  return (
    <div
      className={cn("relative aspect-square", !interactive && "pointer-events-none", className)}
      style={dimension}
      aria-hidden={interactive ? undefined : true}
    >
      <Suspense
        fallback={
          fallback === undefined ? (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, hsl(50 100% 88%) 0%, hsl(38 95% 60%) 45%, hsl(20 85% 35%) 100%)",
                boxShadow: "0 0 90px hsl(38 95% 55% / 0.55)",
              }}
            />
          ) : (
            fallback
          )
        }
      >
        <LazyHomeOrb
          currentGate={gate}
          variant={variant}
          mood={mood}
          hideWebglFallback={hideWebglFallback}
          onActivate={interactive ? onActivate ?? noop : noop}
          onHold={interactive ? onHold ?? noop : noop}
          onTriple={interactive ? onTriple ?? noop : noop}
          onHaptic={interactive ? onHaptic : undefined}
        />
      </Suspense>
    </div>
  );
}
