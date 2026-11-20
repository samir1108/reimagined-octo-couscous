import { DEFAULT_ORB_PALETTE, type OrbPalette } from "./palettes";
import ConsciousnessOrbCanvas from "./ConsciousnessOrbCanvas";

interface ConsciousnessOrbVisualProps {
  palette?: OrbPalette;
  breath?: number;
  breathSeconds?: number;
  charge?: number;
  pointer?: { x: number; y: number };
  pulseKey?: number;
  /** Hue-drift speed. 1 = one full hue revolution per minute, 0 = static. */
  colorShift?: number;
}

export default function ConsciousnessOrbVisual({
  palette = DEFAULT_ORB_PALETTE,
  breath,
  breathSeconds = 8,
  charge = 0,
  pointer = { x: 0, y: 0 },
  pulseKey = 0,
  colorShift = 1,
}: ConsciousnessOrbVisualProps) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="pointer-events-none absolute -inset-[18%] rounded-full"
        style={{
          background: `radial-gradient(circle, ${palette[2]}2b 0%, ${palette[1]}18 42%, transparent 72%)`,
          opacity: 0.7 + charge * 0.3,
          animation:
            colorShift > 0
              ? `orb-aura-hue ${60 / colorShift}s linear infinite`
              : undefined,
        }}
      />
      <ConsciousnessOrbCanvas
        palette={palette}
        breathSeconds={breathSeconds}
        breath={breath}
        charge={charge}
        pointer={pointer}
        pulseKey={pulseKey}
        colorShift={colorShift}
      />
    </div>
  );
}
