// Mounts the Consciousness Bus listener app-wide and surfaces high-signal
// events (loop_detected, breakthrough, plateau, band_shift) as subtle toasts.
// Also triggers haptic feedback on capable devices. Renders nothing visible.

import { useEffect } from "react";
import { useConsciousnessBusEvent, type EngineSignal } from "@/hooks/useConsciousnessBus";
import { toast } from "sonner";
import {
  hapticLoopSurface,
  hapticBreakthrough,
  hapticContradiction,
  hapticSilence,
} from "@/lib/haptics";

function copyFor(sig: EngineSignal): { title: string; description?: string } | null {
  const t = sig.signal_type;
  if (t === "loop_detected" && sig.loop_id) {
    return {
      title: "A pattern surfaced",
      description: `${sig.loop_id} — noticed in this moment.`,
    };
  }
  if (t === "breakthrough") {
    return { title: "Something opened", description: "Take a breath. Let it settle." };
  }
  if (t === "plateau") {
    return { title: "A plateau is forming", description: "This is part of the work." };
  }
  if (t === "band_shift") {
    return {
      title: sig.level_hint && sig.level_hint > 0 ? "Moving up a band" : "A softening downward",
    };
  }
  if (t === "contradiction") {
    return {
      title: "A contradiction noticed",
      description: "Worth sitting with — gently.",
    };
  }
  if (t === "silence") {
    const msg = (sig.context as any)?.message;
    return { title: "A quiet area in you", description: typeof msg === "string" ? msg : "Something you've stopped speaking about." };
  }
  return null;
}

export default function ConsciousnessBusListener() {
  // Subscribe to all signals; filter & toast inside the handler so we don't
  // spam the user with low-urgency events.
  useConsciousnessBusEvent("*", (sig) => {
    if (sig.urgency < 0.6) return;
    const copy = copyFor(sig);
    if (!copy) return;
    toast(copy.title, copy.description ? { description: copy.description } : undefined);
    // Haptic accents — meaningful, never decorative.
    switch (sig.signal_type) {
      case "loop_detected": hapticLoopSurface(); break;
      case "breakthrough": hapticBreakthrough(); break;
      case "contradiction": hapticContradiction(); break;
      case "silence": hapticSilence(); break;
    }
  });

  // Ensures the bus is always mounted even if no other consumer is.
  useEffect(() => {
    return () => {};
  }, []);

  return null;
}
