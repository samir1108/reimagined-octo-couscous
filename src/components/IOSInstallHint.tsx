/**
 * IOSInstallHint — gentle bottom sheet shown only on iOS Safari
 * when the app is NOT installed yet. Teaches Share → Add to Home Screen.
 *
 * Hides forever on dismiss. Hides automatically when launched from home screen.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Session-only so the install option re-appears every time the user opens the app.
const STORAGE_KEY = "ios_install_hint_dismissed_session";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPad = /iPad/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  return /iPhone|iPod/.test(ua) || iPad;
}

function isSafari() {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari quirk
    (navigator as any).standalone === true
  );
}

export default function IOSInstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isIOS() || !isSafari() || isStandalone()) return;

    // Wait a beat so it doesn't slam the user on first paint
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-[9999] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl shadow-black/60 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-lg shrink-0">
                🪔
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-display tracking-wide text-white leading-snug">
                  Install ConsciousOS
                </p>
                <p className="mt-1 text-[11px] font-body text-white/60 leading-relaxed">
                  Tap{" "}
                  <span className="inline-flex items-center justify-center w-4 h-4 align-[-2px] mx-0.5">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-amber-300">
                      <path d="M12 3v12M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>{" "}
                  Share, then{" "}
                  <span className="text-amber-300/90">Add to Home Screen</span> — full-screen,
                  splash & faster launch.
                </p>
              </div>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="text-white/40 hover:text-white/80 transition-colors text-lg leading-none px-1 -mt-0.5"
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
