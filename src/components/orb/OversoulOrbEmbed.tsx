import { useEffect, useMemo, useRef, useState } from "react";
import type { GateId } from "@/lib/consciousness/dailyGates";
import { useOrbPersonalization } from "@/hooks/useOrbPersonalization";
import ConsciousnessOrb from "./ConsciousnessOrb";
import {
  DEFAULT_ORB_PALETTE,
  orbPaletteForBand,
  orbPaletteForGate,
  orbPaletteFromHue,
  type OrbDimension,
  type OrbPalette,
} from "./palettes";

export interface OrbStateInput {
  band?: number | null;
  vLevel?: number | null;
  weakestDimension?: OrbDimension | null;
  activeLoopCount?: number | null;
  streak?: number | null;
}

interface OversoulOrbEmbedProps {
  className?: string;
  currentGate?: GateId;
  /** Consciousness readout. When absent the orb falls back to time of day. */
  orbState?: OrbStateInput | null;
  /** Called once when the user's band crosses upward. */
  onBandUp?: (band: number) => void;
  onActivate?: () => void;
  onHold?: () => void;
  onDouble?: () => void;
  onTriple?: () => void;
}

const LAST_BAND_KEY = "orb:last-band";

/**
 * Shared React Three Fiber orb. Gesture handling stays in the surrounding DOM
 * control so the visual can be replaced without changing session behavior.
 *
 * Two bindings make it a readout rather than decoration:
 *  • palette  ← consciousness band (accented by the weakest dimension)
 *  • charge   ← depth (band/vLevel) minus loop load plus streak
 */
export default function OversoulOrbEmbed({
  className = "",
  currentGate,
  orbState = null,
  onBandUp,
  onActivate,
  onHold,
  onDouble,
  onTriple,
}: OversoulOrbEmbedProps) {
  const band = orbState?.band ?? null;
  const { hue: personalizationHue } = useOrbPersonalization();

  const palette = useMemo(() => {
    // A saved practice focus recolours the orb around its family hue while the
    // consciousness band keeps the middle stop, so both readings stay visible.
    if (typeof personalizationHue === "number") {
      const focused = orbPaletteFromHue(personalizationHue);
      if (typeof band === "number") {
        const bandPalette = orbPaletteForBand(band, orbState?.weakestDimension ?? null);
        const blended: OrbPalette = [focused[0], bandPalette[1], focused[2], focused[3]];
        return blended;
      }
      return focused;
    }
    if (typeof band === "number") {
      return orbPaletteForBand(band, orbState?.weakestDimension ?? null);
    }
    return currentGate ? orbPaletteForGate(currentGate) : DEFAULT_ORB_PALETTE;
  }, [band, orbState?.weakestDimension, currentGate, personalizationHue]);

  const stateCharge = useMemo(() => {
    if (band == null && orbState?.vLevel == null) return undefined;
    const depthSource = band ?? orbState?.vLevel ?? 0;
    const depth = Math.max(0, Math.min(1, depthSource / 7));
    const loopPenalty = Math.min(0.25, (orbState?.activeLoopCount ?? 0) * 0.03);
    const streakBoost = Math.min(0.15, (orbState?.streak ?? 0) * 0.01);
    return Math.max(0.08, Math.min(1, depth - loopPenalty + streakBoost));
  }, [band, orbState?.vLevel, orbState?.activeLoopCount, orbState?.streak]);

  // Band-up ceremony: one outward pulse, no toast, no modal.
  const [ceremony, setCeremony] = useState(0);
  const announcedRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof band !== "number") return;
    try {
      const stored = Number(localStorage.getItem(LAST_BAND_KEY));
      const hasStored = Number.isFinite(stored) && stored > 0;
      if (hasStored && band > stored && announcedRef.current !== band) {
        announcedRef.current = band;
        setCeremony((c) => c + 1);
        onBandUp?.(band);
      }
      if (!hasStored || band !== stored) localStorage.setItem(LAST_BAND_KEY, String(band));
    } catch {
      /* storage is optional */
    }
  }, [band, onBandUp]);

  return (
    <ConsciousnessOrb
      className={`aspect-square w-full ${className}`}
      palette={palette}
      stateCharge={stateCharge}
      pulseSignal={ceremony}
      ariaLabel={
        typeof band === "number"
          ? `Consciousness orb. Band ${band.toFixed(1)}. Hold to begin a session, triple-tap to open today's meditation practice.`
          : "Consciousness orb. Hold to begin a session, triple-tap to open today's meditation practice."
      }
      onActivate={onActivate}
      onHold={onHold}
      onDouble={onDouble}
      onTriple={onTriple}
    />
  );
}
