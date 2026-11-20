import { useCallback, useRef, useState } from "react";
import { Play } from "lucide-react";
import OrbControl from "./OrbControl";
import ConsciousnessOrbVisual from "./ConsciousnessOrbVisual";
import { DEFAULT_ORB_PALETTE, type OrbPalette } from "./palettes";
import { playSoundEffect } from "@/lib/soundEffects";

interface ConsciousnessOrbProps {
  palette?: OrbPalette;
  breathSeconds?: number;
  sound?: boolean;
  beginLabel?: string;
  ariaLabel?: string;
  className?: string;
  /** Baseline glow from the user's actual state; gestures can exceed it. */
  stateCharge?: number;
  /** External pulse counter — used for the band-up ceremony. */
  pulseSignal?: number;
  /** Hue-drift speed. 1 = one full hue revolution per minute, 0 = static. */
  colorShift?: number;
  onActivate?: () => void;
  onHold?: () => void;
  onDouble?: () => void;
  onTriple?: () => void;
}

export default function ConsciousnessOrb({
  palette = DEFAULT_ORB_PALETTE,
  breathSeconds = 8,
  sound = true,
  beginLabel,
  ariaLabel = "Consciousness orb. Tap to activate, press and hold, double-tap, or triple-tap for available actions.",
  className = "",
  stateCharge,
  pulseSignal = 0,
  colorShift = 1,
  onActivate,
  onHold,
  onDouble,
  onTriple,
}: ConsciousnessOrbProps) {
  const [pulseKey, setPulseKey] = useState(0);
  const pulseRef = useRef(0);

  const pulse = useCallback(() => {
    pulseRef.current += 1;
    setPulseKey(pulseRef.current);
  }, []);

  const chime = useCallback(
    (kind: "tap" | "threshold") => {
      if (sound) playSoundEffect(kind);
    },
    [sound],
  );

  const activate = useCallback(() => {
    pulse();
    chime("tap");
    onActivate?.();
  }, [pulse, chime, onActivate]);

  return (
    <div className={`flex w-full flex-col items-center ${className}`}>
      <OrbControl
        ariaLabel={ariaLabel}
        onActivate={activate}
        onHold={() => {
          pulse();
          chime("threshold");
          onHold?.();
        }}
        onDouble={() => {
          pulse();
          chime("tap");
          onDouble?.();
        }}
        onTriple={() => {
          pulse();
          chime("tap");
          onTriple?.();
        }}
      >
        {({ charge, pointer }) => (
          <ConsciousnessOrbVisual
            palette={palette}
            breathSeconds={breathSeconds}
            charge={Math.max(charge, stateCharge ?? 0)}
            pointer={pointer}
            pulseKey={pulseKey + pulseSignal}
            colorShift={colorShift}
          />
        )}
      </OrbControl>
      {beginLabel ? (
        <button
          type="button"
          onClick={activate}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-display tracking-[0.2em] uppercase text-primary/90 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <Play className="h-3 w-3" aria-hidden />
          {beginLabel}
        </button>
      ) : null}
    </div>
  );
}
