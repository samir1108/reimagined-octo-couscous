import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./index.css";
import { installGlobalCreditGuard } from "@/lib/installGlobalCreditGuard";
import { initObservability } from "@/lib/observability";

// Install once, before any edge function call can be made.
installGlobalCreditGuard();
initObservability({ release: import.meta.env.VITE_APP_VERSION as string | undefined });

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </HelmetProvider>
);

// Hand off from the static boot splash (index.html) to the real app once the
// first React paint has landed. Two frames: one for the commit, one for paint.
const dismissBootSplash = () => {
  const boot = (window as Window & { __dismissBootSplash?: () => void }).__dismissBootSplash;
  if (boot) {
    boot();
    return;
  }
  document.getElementById("boot-splash")?.remove();
};

requestAnimationFrame(() => requestAnimationFrame(dismissBootSplash));

// Kick off Deepgram TTS prewarm for all 8 sensorial practices.
// Idempotent + cached in IndexedDB, so this runs at most once per device.
//
// Loaded dynamically AND deferred to idle: the prewarm module reaches the
// full sensorial manifest set (~200 kB of data plus still imagery), and
// pulling that into the first-paint path costs real bytes for work the
// user may never trigger.
const schedulePrewarm = () => {
  void import("@/lib/ttsPrewarm").then((m) => m.startBackgroundPrewarm());
};

if (typeof window !== "undefined" && "requestIdleCallback" in window) {
  (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
    schedulePrewarm,
    { timeout: 8000 }
  );
} else {
  setTimeout(schedulePrewarm, 4000);
}

// Offline app shell. Production only so Vite HMR is never shadowed locally.
if (import.meta.env.PROD) {
  void import("@/hooks/useServiceWorker")
    .then(({ registerServiceWorker }) => registerServiceWorker())
    .catch(() => undefined);
}

