import ConsciousnessOrb from "./ConsciousnessOrb";
import { APP_GOLD_ORB_PALETTE, type OrbPalette } from "./palettes";

interface WitnessOrbStageProps {
  palette?: OrbPalette;
  className?: string;
  onActivate?: () => void;
  onHold?: () => void;
  onDouble?: () => void;
  onTriple?: () => void;
}

/**
 * The GPU half of the witness orb. Kept in its own module so three/R3F stays
 * out of the main bundle until the user actually opens the orb.
 *
 * Gestures stay in ConsciousnessOrb's surrounding DOM control (OrbControl), so
 * the visual can be swapped without touching the interaction contract.
 */
export default function WitnessOrbStage({
  palette = APP_GOLD_ORB_PALETTE,
  className = "",
  onActivate,
  onHold,
  onDouble,
  onTriple,
}: WitnessOrbStageProps) {
  return (
    <ConsciousnessOrb
      palette={palette}
      className={className}
      stateCharge={0.42}
      ariaLabel="Witness orb. Tap the orb to continue, double-tap for neti neti, triple-tap for self-inquiry, press and hold to rest."
      onActivate={onActivate}
      onHold={onHold}
      onDouble={onDouble}
      onTriple={onTriple}
    />
  );
}
