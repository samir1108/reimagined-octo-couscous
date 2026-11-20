/**
 * Phone-pickup / restlessness detector.
 * Uses the Page Visibility API to count how often the user re-focuses the app
 * within a session — a proxy for the RES003 restlessness loop.
 * Aggregates and posts to ingest-signal every 5 minutes.
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function usePhonePickups(enabled = true) {
  const pickupsRef = useRef(0);
  const lastFlushRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const flush = async () => {
      const count = pickupsRef.current;
      pickupsRef.current = 0;
      lastFlushRef.current = Date.now();
      if (count <= 0) return;
      try {
        await supabase.functions.invoke("ingest-signal", {
          body: {
            points: [
              {
                layer: "device",
                source: "android_usage",
                signal_type: "phone_pickups",
                category: "restlessness",
                value: count,
              },
            ],
          },
        });
      } catch {
        /* silent */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        pickupsRef.current += 1;
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(flush, 5 * 60_000);
    const beforeUnload = () => flush();
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", beforeUnload);
      flush();
    };
  }, [enabled]);
}
