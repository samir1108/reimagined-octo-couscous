/**
 * Conscious Toast Engine
 * ──────────────────────
 * Translates dry system events into in-character HOPE voice.
 *
 * Principle:  Awareness + Compassion + Direction  (never Error + Excuse)
 * Structure:  Acknowledge → Reframe → Guide next step
 *
 * Tone scales with user depth:
 *   - "light"  → quick UI actions (sharp, short)
 *   - "deep"   → sessions, spiritual flow (poetic, longer)
 *   - "silence"→ peak: just "…" + subtle pulse, no words
 *
 * Level-aware (when V-level is provided):
 *   - L0–2 Beginner  → plain, reassuring
 *   - L3–5 Intermediate→ steady, awareness-leaning
 *   - L6+  Advanced  → non-identifying, witness language
 */

import { toast as sonnerToast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Voice library — multiple variants per state, picked by level + randomness
// ─────────────────────────────────────────────────────────────────────────────

type Tier = "beginner" | "intermediate" | "advanced";
type Tone = "light" | "deep" | "silence";

interface VoiceLine {
  title: string;
  description?: string;
}

type Voice = Record<Tier, VoiceLine[]>;

const V = {
  // AI / guide unavailable, rate-limited, slow
  aiQuiet: {
    beginner: [
      { title: "The guide is quiet right now", description: "Try again in a few breaths." },
      { title: "A pause in the conversation", description: "Sit with this moment — I’ll return shortly." },
    ],
    intermediate: [
      { title: "Silence is part of the path", description: "Try again in a moment." },
      { title: "The guide rests", description: "Use the gap. Notice what’s here." },
    ],
    advanced: [
      { title: "Connection paused", description: "Your awareness doesn’t need guidance right now." },
      { title: "The voice withdraws", description: "Stay with what remains." },
    ],
  } as Voice,

  // Out of credits / paywall
  noCredits: {
    beginner: [
      { title: "You’ve used today’s guidance", description: "Now, practice what you’ve seen." },
      { title: "Take a break from words", description: "Add credits when you’re ready to continue." },
    ],
    intermediate: [
      { title: "No more words for now", description: "Let experience teach you." },
      { title: "Pause here", description: "Integration matters more than consumption." },
    ],
    advanced: [
      { title: "The well is empty", description: "Drink from your own depth today." },
      { title: "Enough teaching for now", description: "Sit. Let what you have settle." },
    ],
  } as Voice,

  // Network / offline
  offline: {
    beginner: [
      { title: "You’ve stepped offline", description: "Reconnect when ready." },
      { title: "No signal", description: "Your breath is still here." },
    ],
    intermediate: [
      { title: "The outer world is unreachable", description: "The inner one is still open." },
      { title: "Disconnected", description: "Stay with yourself until the line returns." },
    ],
    advanced: [
      { title: "No outside voice", description: "Notice what speaks from within." },
      { title: "Off the network", description: "On the path." },
    ],
  } as Voice,

  // Generic “something went wrong”
  somethingSlipped: {
    beginner: [
      { title: "Something slipped", description: "Stay steady — try again." },
      { title: "A small hiccup", description: "Nothing is lost. Try once more." },
    ],
    intermediate: [
      { title: "The flow broke for a moment", description: "Let’s begin again." },
      { title: "A small disturbance", description: "Nothing is lost." },
    ],
    advanced: [
      { title: "Disturbance noticed", description: "Don’t identify. Try again." },
      { title: "A wave passed", description: "Return to the breath, then continue." },
    ],
  } as Voice,

  // Action failed (button, save)
  actionMissed: {
    beginner: [
      { title: "It didn’t land", description: "Gently try once more." },
      { title: "Not saved", description: "Place it again." },
    ],
    intermediate: [
      { title: "Missed this time", description: "Awareness is in trying again." },
      { title: "Not captured", description: "Return and place it again." },
    ],
    advanced: [
      { title: "Unheld", description: "Offer it once more, with attention." },
      { title: "It dissolved", description: "Form it again, slowly." },
    ],
  } as Voice,

  // Loading / waiting
  unfolding: {
    beginner: [
      { title: "One moment…", description: "Something is forming for you." },
      { title: "Hold for a breath", description: "Your next step is arriving." },
    ],
    intermediate: [
      { title: "Stay present", description: "The path is unfolding." },
      { title: "Wait here", description: "Something is forming." },
    ],
    advanced: [
      { title: "Becoming…", description: "Hold the space." },
      { title: "Arriving", description: "" },
    ],
  } as Voice,

  // Success / save
  noted: {
    beginner: [
      { title: "Noted ✨", description: "Stay aware of what follows." },
      { title: "Captured", description: "Watch how this shapes your day." },
    ],
    intermediate: [
      { title: "Held in your vault", description: "It will return when it matters." },
      { title: "Saved", description: "Now live it." },
    ],
    advanced: [
      { title: "Received", description: "Let it work on you." },
      { title: "Done", description: "Now embody it." },
    ],
  } as Voice,

  // Empty state nudge
  beginHere: {
    beginner: [
      { title: "Nothing written yet", description: "Start where you are." },
      { title: "Begin", description: "Even one word is enough." },
    ],
    intermediate: [
      { title: "This space is empty", description: "Like the mind before a thought." },
      { title: "A blank field", description: "Plant the first seed." },
    ],
    advanced: [
      { title: "Pure space", description: "Mark it." },
      { title: "Empty", description: "Begin without trying." },
    ],
  } as Voice,

  // Validation / write more
  writeMore: {
    beginner: [
      { title: "Write a few words first", description: "Even one line is enough." },
      { title: "A little more, please", description: "Let the words come." },
    ],
    intermediate: [
      { title: "Give it some weight", description: "A line or two will do." },
      { title: "Say more", description: "The thought wants form." },
    ],
    advanced: [
      { title: "Not yet formed", description: "Let it come fully, then place it." },
      { title: "Too thin to hold", description: "Let it deepen." },
    ],
  } as Voice,

  // Voice / mic problems
  voiceUnheard: {
    beginner: [
      { title: "I couldn’t hear you", description: "Try again, a little closer." },
      { title: "Voice missed", description: "Speak once more." },
    ],
    intermediate: [
      { title: "The words didn’t arrive", description: "Try again when ready." },
      { title: "Sound slipped past", description: "Speak again." },
    ],
    advanced: [
      { title: "Unheard", description: "Form it again, with breath." },
      { title: "The mic missed it", description: "Offer it once more." },
    ],
  } as Voice,

  // Sign-in needed
  needPresence: {
    beginner: [
      { title: "Sign in first", description: "So your work can be remembered." },
    ],
    intermediate: [
      { title: "Show up first", description: "Sign in so this can be held." },
    ],
    advanced: [
      { title: "Be known here first", description: "Sign in to continue." },
    ],
  } as Voice,
} as const;

export type ConsciousState = keyof typeof V;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function tierFromBand(band?: number | null): Tier {
  if (band == null || isNaN(band)) return "beginner";
  if (band >= 6) return "advanced";
  if (band >= 3) return "intermediate";
  return "beginner";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface ConsciousOptions {
  /** User V-level / overall band (0–10). Adjusts depth of language. */
  band?: number | null;
  /** Override tone manually. */
  tone?: Tone;
  /** Append a quiet system detail (e.g. raw error code) for power users. */
  detail?: string;
  /** Sonner type. */
  kind?: "default" | "success" | "error" | "warning" | "info";
  /** Duration in ms. */
  duration?: number;
}

/**
 * Show a conscious toast for a known system state.
 *
 * @example
 *   conscious("aiQuiet", { band: profile?.overall_band });
 *   conscious("noCredits", { kind: "info" });
 */
export function conscious(state: ConsciousState, opts: ConsciousOptions = {}) {
  const { band, tone, detail, kind = "default", duration = 4200 } = opts;

  // Silence mode — peak HOPE
  if (tone === "silence") {
    sonnerToast("…", { duration: 1800 });
    return;
  }

  const tier = tierFromBand(band);
  const line = pick(V[state][tier]);

  const description = detail
    ? line.description
      ? `${line.description}  ·  ${detail}`
      : detail
    : line.description;

  const fn =
    kind === "success" ? sonnerToast.success
    : kind === "error" ? sonnerToast.error
    : kind === "warning" ? sonnerToast.warning
    : kind === "info" ? sonnerToast.info
    : sonnerToast;

  fn(line.title, { description, duration });
}

/**
 * Translate a raw error into the right conscious state, then show it.
 * Inspects message / status for known signals (rate limit, payment, network).
 */
export function consciousFromError(err: unknown, fallback: ConsciousState = "somethingSlipped", opts: ConsciousOptions = {}) {
  const msg = String((err as any)?.message || err || "").toLowerCase();
  const status = (err as any)?.status ?? (err as any)?.code;

  let state: ConsciousState = fallback;

  if (msg.includes("429") || status === 429 || msg.includes("rate limit") || msg.includes("busy")) {
    state = "aiQuiet";
  } else if (msg.includes("402") || status === 402 || msg.includes("credit") || msg.includes("payment")) {
    state = "noCredits";
  } else if (msg.includes("network") || msg.includes("offline") || msg.includes("failed to fetch") || msg.includes("fetch failed")) {
    state = "offline";
  } else if (msg.includes("401") || status === 401 || msg.includes("unauthor") || msg.includes("not authenticated")) {
    state = "needPresence";
  } else if (msg.includes("save") || msg.includes("write")) {
    state = "actionMissed";
  }

  conscious(state, { kind: "error", ...opts });
}

/** Silence toast — just "…", subtle, no detail. Peak HOPE. */
export function silenceToast() {
  sonnerToast("…", { duration: 1600 });
}

/**
 * A failed action that the user can retry. Used when nothing was created —
 * e.g. the session composer failed, so no session exists and retrying is the
 * only honest next step.
 */
export function consciousRetry(
  opts: ConsciousOptions & {
    title?: string;
    description?: string;
    onRetry?: () => void;
  } = {},
) {
  const { title, description, onRetry, detail, duration = 8000, band } = opts;
  void band;
  sonnerToast.error(title ?? "That didn't go through", {
    description:
      description ??
      detail ??
      "Nothing was started. Check your connection and retry.",
    duration,
    action: onRetry
      ? {
          label: "Retry",
          onClick: onRetry,
        }
      : undefined,
  });
}
