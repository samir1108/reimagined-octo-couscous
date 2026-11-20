import { useEffect, useState } from "react";
import { fetchUnconsumedWhisper, type FutureWhisper } from "@/lib/whisperChain";

export function useFutureWhisper(enabled = true) {
  const [whisper, setWhisper] = useState<FutureWhisper | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const w = await fetchUnconsumedWhisper();
      if (cancelled) return;
      setWhisper(w);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [enabled]);

  return { whisper, loaded };
}
