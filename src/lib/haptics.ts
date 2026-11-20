// Minimal haptics — uses the Web Vibration API (zero dependencies). On iOS
// Safari this is a silent no-op, which is the desired fallback. On Android
// Chrome / installed PWA it produces the tactile feedback.
//
// Patterns are intentionally short and meaningful — never decorative.
// Requires a user gesture first (browser policy).

let userHasInteracted = false;
const can = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

if (can && typeof window !== "undefined") {
  const markInteracted = () => { userHasInteracted = true; };
  ["click", "touchstart", "keydown", "pointerdown"].forEach((evt) =>
    window.addEventListener(evt, markInteracted, { once: true, passive: true })
  );
}

function vibrate(pattern: number | number[]) {
  if (!can || !userHasInteracted) return;
  try { navigator.vibrate(pattern); } catch { /* swallow */ }
}

/** Sub-perceptual tap — confirms a tap landed. */
export const hapticTick = () => vibrate(8);

/** Breath cycle anchor — soft swell. */
export const hapticBreath = () => vibrate([0, 30, 90, 30]);

/** Loop surfaced — a single attention pulse. */
export const hapticLoopSurface = () => vibrate([0, 18, 60, 35]);

/** Breakthrough — a celebratory triple. */
export const hapticBreakthrough = () => vibrate([0, 25, 50, 25, 50, 60]);

/** Contradiction noticed — two soft pulses, an inhale-pause. */
export const hapticContradiction = () => vibrate([0, 20, 120, 20]);

/** Silence signal — a single slow swell. */
export const hapticSilence = () => vibrate([0, 60]);
