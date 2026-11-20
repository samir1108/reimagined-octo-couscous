/**
 * useImmersiveSession — full-screen sitting mode.
 *
 * Two layers:
 *   1. `immersive` — an in-app mode that hides the header and threshold rail so
 *      the practice fills the screen (works everywhere, including iOS Safari,
 *      where element fullscreen is unavailable).
 *   2. browser fullscreen — requested alongside it when supported. Esc or the
 *      browser's own exit returns both to normal.
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "session-shell:immersive";

export function useImmersiveSession() {
  const [immersive, setImmersive] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const supported =
    typeof document !== "undefined" &&
    typeof document.documentElement?.requestFullscreen === "function";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => setBrowserFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const requestFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* Not supported or denied — the in-app immersive mode still applies. */
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, immersive ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [immersive]);

  const enter = useCallback(() => {
    setImmersive(true);
    void requestFullscreen();
  }, [requestFullscreen]);

  const exit = useCallback(() => {
    setImmersive(false);
    void exitFullscreen();
  }, [exitFullscreen]);

  const toggle = useCallback(() => {
    setImmersive((v) => {
      if (v) void exitFullscreen();
      else void requestFullscreen();
      return !v;
    });
  }, [requestFullscreen, exitFullscreen]);

  // Esc leaves the sitting when the browser is not the one holding fullscreen.
  useEffect(() => {
    if (!immersive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setImmersive(false);
        void exitFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [immersive, exitFullscreen]);

  // If the sitter leaves browser fullscreen (Esc / F11), leave the mode with it.
  useEffect(() => {
    if (!immersive) return;
    const onFs = () => {
      if (!document.fullscreenElement && document.fullscreenEnabled) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [immersive]);

  return { immersive, browserFullscreen, supported, enter, exit, toggle, setImmersive };
}
