/**
 * SESSION BRAIN ROUTER — the single place that decides which brain composes a
 * session and whether the paid online composer is allowed to run.
 *
 * Why this exists: three planners were wired independently and the paid
 * online composer was always tried first, so the deterministic local brain
 * could never be the authoritative one. Every session therefore paid for
 * LLM calls and broke on a weak connection. This module makes the choice
 * explicit, observable on the plan (`_meta.brainMode`), and overridable.
 *
 * Modes
 *   local  — deterministic orchestrator only. No LLM, no credits, no network
 *            dependency beyond the user's own data. The default sitting.
 *   hybrid — local plan is authoritative; paid AI runs only when the caller
 *            explicitly asks for depth (`depth: "deep"`). Default mode.
 *   cloud  — paid online composer first, local only on failure.
 *
 * Override with VITE_AI_BRAIN_MODE (`local` | `hybrid` | `cloud`).
 */

export type BrainMode = "local" | "hybrid" | "cloud";

/** Per-call intent. `deep` is the only value that may spend credits. */
export type BrainDepth = "local" | "deep";

export interface BrainPolicy {
  mode: BrainMode;
  /** true only when the paid online composer may run for this call */
  allowPaidAI: boolean;
  /** short, user-safe explanation; copied onto `_meta.brainReason` */
  reason: string;
}

const VALID_MODES: readonly BrainMode[] = ["local", "hybrid", "cloud"];

export function configuredBrainMode(): BrainMode {
  const raw = String(import.meta.env.VITE_AI_BRAIN_MODE ?? "")
    .trim()
    .toLowerCase();
  return (VALID_MODES as readonly string[]).includes(raw) ? (raw as BrainMode) : "hybrid";
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

export function resolveBrainPolicy(depth?: BrainDepth): BrainPolicy {
  if (depth === "local") {
    return { mode: "local", allowPaidAI: false, reason: "Local sitting requested" };
  }

  const mode = configuredBrainMode();

  if (mode === "local") {
    return { mode, allowPaidAI: false, reason: "Local brain mode" };
  }

  if (!isOnline()) {
    return { mode: "local", allowPaidAI: false, reason: "Offline — deterministic plan" };
  }

  if (mode === "cloud") {
    return { mode, allowPaidAI: true, reason: "Cloud brain mode" };
  }

  return {
    mode,
    allowPaidAI: depth === "deep",
    reason: depth === "deep" ? "Deeper sitting requested" : "Deterministic plan",
  };
}
