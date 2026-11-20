/**
 * InstallPWA — universal install prompt banner.
 *
 * - Android / Desktop Chrome / Edge: uses native `beforeinstallprompt` event.
 * - iOS Safari: handled separately by <IOSInstallHint />.
 *
 * Per product rule: ALWAYS surface the install option whenever the user is
 * not already running the installed app. Dismissal is session-only (sessionStorage),
 * so reopening the app shows it again.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";

const SESSION_KEY = "pwa_install_dismissed_session";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export default function InstallPWA() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    // Per product rule: always surface install option on every app open.

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      // Small delay so it doesn't slam first paint
      setTimeout(() => setShow(true), 2500);
    };

    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        setDeferred(null);
      }
    } catch {
      /* silent */
    }
  };

  const dismiss = () => {
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && deferred && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-[9999] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl shadow-black/60 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-lg shrink-0">
                🪔
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-display tracking-wide text-white leading-snug">
                  Install ConsciousOS
                </p>
                <p className="mt-0.5 text-[11px] font-body text-white/60 leading-relaxed">
                  Full-screen, faster launch, lives on your home screen.
                </p>
              </div>
              <button
                onClick={install}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-amber-400/90 hover:bg-amber-400 text-black text-[12px] font-medium px-3 py-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="text-white/40 hover:text-white/80 transition-colors text-lg leading-none px-1"
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
