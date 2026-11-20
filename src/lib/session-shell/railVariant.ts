import { logEngineDecision } from "@/lib/telemetry/engineTelemetry";

export type RailVariant = "pipeline" | "dots";

const STORAGE_KEY = "consciousos.rail.variant";

/**
 * Which progress surface the sitting wears.
 *
 * `pipeline` is the horizontal threshold rail; `dots` is the original row of
 * phase dots, kept so acquisition and completion can be compared per variant.
 * Force a variant for QA with `?rail=dots` or by writing the storage key.
 */
export function readRailVariant(): RailVariant {
  try {
    const param = new URLSearchParams(window.location.search).get("rail");
    if (param === "dots" || param === "pipeline") return param;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dots" || stored === "pipeline") return stored;
  } catch {
    /* private mode — fall through to the default */
  }
  return "pipeline";
}

/** Records one exposure per sitting so variant drop-off is measurable. */
export function logRailExposure(sessionId: string, variant: RailVariant): void {
  void logEngineDecision({
    sessionId,
    engine: "session-progress-rail",
    brainMode: "local",
    chosen: { variant },
  });
}
