/**
 * GlobalStarfield — app-wide ambient backdrop.
 *
 * Sits behind everything (fixed inset-0, -z-10) so every screen — landing,
 * onboarding, and the app — gets the same atmosphere underneath.
 *
 * - Dark mode: deep cosmic gradient + twinkling stars
 * - Light mode: soft warm gradient (sunrise/parchment) — no stars
 *
 * Theme is inferred from `documentElement.classList.contains("dark")` and
 * re-evaluated on class changes via MutationObserver, so it follows the
 * existing ThemeProvider without coupling.
 *
 * Pointer-events: none, aria-hidden — purely decorative.
 */
import { useEffect, useMemo, useState } from "react";

const STAR_COUNT =
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
    window.innerWidth < 640)
    ? 24
    : 48;

export const GlobalStarfield = () => {
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Stable star positions across re-renders
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map((_, i) => ({
        top: ((i * 37) % 1000) / 10, // 0–100
        left: ((i * 53) % 1000) / 10,
        size: (i % 3) + 1,
        delay: (i % 9) * 0.35,
        dur: 2.2 + (i % 6) * 0.5,
        baseOpacity: 0.12 + ((i % 5) * 0.1),
      })),
    []
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {isDark ? (
        <>
          {/* Deep cosmic base */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%),radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.06),transparent_55%)]" />
          {/* Stars */}
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-foreground"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: s.size,
                height: s.size,
                opacity: s.baseOpacity,
                animation: `gsfTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </>
      ) : (
        <>
          {/* Light mode: soft sunrise / parchment glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.12),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.10),transparent_60%)]" />
        </>
      )}
      <style>{`@keyframes gsfTwinkle { 0%,100% { opacity: var(--gsf-min, 0.12); } 50% { opacity: 0.85; } }`}</style>
    </div>
  );
};

export default GlobalStarfield;
