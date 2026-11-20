import { useEffect, useRef } from "react";

/**
 * Full ConsciousOS landing page.
 *
 * The complete landing (hero, marquee, and all the middle sections — how it
 * works, the orb, who it's for, safety, research, roadmap, FAQ, etc.) lives in
 * the self-contained document at /landing.html. It is rendered here in a
 * full-viewport frame so it keeps its own scoped styles and scripts, while
 * root-relative CTAs (e.g. /auth) navigate the top window into the SPA.
 */
export default function LandingPage() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const fit = () => {
      el.style.height = `${window.innerHeight}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <iframe
      ref={frameRef}
      src="/landing.html"
      title="ConsciousOS — a teacher for the inner life, in your pocket"
      className="block w-full border-0"
      style={{ height: "100dvh" }}
    />
  );
}