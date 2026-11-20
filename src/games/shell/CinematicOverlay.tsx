// Shared cinematic wrapper: radial vignette + subtle SVG film grain.
// Sits above canvas (z ~ 10) and below chrome (z ≥ 20). Non-interactive.
export default function CinematicOverlay({ tint = "amber" }: { tint?: "amber" | "violet" | "cool" | "warm" }) {
  const tints: Record<string, string> = {
    amber:  "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%), radial-gradient(ellipse at center, rgba(255,190,120,0.06) 0%, rgba(0,0,0,0) 60%)",
    violet: "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%), radial-gradient(ellipse at center, rgba(180,150,255,0.06) 0%, rgba(0,0,0,0) 60%)",
    cool:   "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%), radial-gradient(ellipse at center, rgba(150,180,230,0.06) 0%, rgba(0,0,0,0) 60%)",
    warm:   "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%), radial-gradient(ellipse at center, rgba(240,200,150,0.05) 0%, rgba(0,0,0,0) 60%)",
  };
  return (
    <>
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: tints[tint] }} />
      <svg className="absolute inset-0 z-10 w-full h-full opacity-[0.045] pointer-events-none mix-blend-overlay" aria-hidden>
        <filter id="cinematic-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-grain)" />
      </svg>
    </>
  );
}