// ─────────────────────────────────────────────────────────────────
// Guide Widget Framework — types
// A widget is an inline practice the Guide can spawn inside chat:
// witness timer, breath orb, self-inquiry, journal, body-scan, etc.
// Each widget shares the same contract { spec, onComplete, onSkip }.
// ─────────────────────────────────────────────────────────────────

export type WidgetKind =
  | "witness_timer"
  | "breath_orb"
  | "self_inquiry"
  | "journal"
  | "micro_act"
  | "reflection_card"
  | "reading";

export interface BaseWidgetSpec {
  kind: WidgetKind;
  /** Optional title shown above the widget. */
  title?: string;
  /** Optional prompt / instruction line. */
  prompt?: string;
  /** The step's 3–5 beat script. Widgets render this as the instruction body. */
  script?: string[];
}

export interface WitnessTimerSpec extends BaseWidgetSpec {
  kind: "witness_timer";
  /** Duration in seconds. Default 120. */
  duration?: number;
  /** Practice level (L0..L4). Cosmetic only. */
  level?: string;
  object?: string;
}

export interface BreathOrbSpec extends BaseWidgetSpec {
  kind: "breath_orb";
  /** Total breaths. Derived from duration when provided. */
  breaths?: number;
  /** Target duration in seconds — authoritative when present. */
  duration?: number;
  /** Pattern: "4-7-8" | "box" | "coherent" | "natural" | "4-4-6" | "fire". */
  pattern?: string;
  /** Short description of the exercise. */
  description?: string;
  /** Why this practice is useful. */
  why?: string;
  /** Step-by-step instructions. */
  instructions?: string[];
}

export interface SelfInquirySpec extends BaseWidgetSpec {
  kind: "self_inquiry";
  /** The single question. */
  question: string;
}

export interface JournalSpec extends BaseWidgetSpec {
  kind: "journal";
  /** Min characters before complete. Default 0. */
  minChars?: number;
  /** 1–3 prompts the user is answering. */
  questions?: string[];
}

export interface MicroActSpec extends BaseWidgetSpec {
  kind: "micro_act";
  /** The act, e.g. "stand up and stretch for 30 seconds". */
  act: string;
  /** When this act is meant to happen. */
  window?: string;
}

export interface ReflectionCardSpec extends BaseWidgetSpec {
  kind: "reflection_card";
  /** Optional summary the Guide produced. */
  summary?: string;
  /** Minimum characters for the closing line (0 = optional). */
  minChars?: number;
}

export interface ReadingSpec extends BaseWidgetSpec {
  kind: "reading";
  /** The passage to read (60–150 words). */
  passage: string;
  /** Attribution / source. */
  source?: string;
  /** Prompt for the one line the reader takes away. */
  highlightPrompt?: string;
}

export type WidgetSpec =
  | WitnessTimerSpec
  | BreathOrbSpec
  | SelfInquirySpec
  | JournalSpec
  | MicroActSpec
  | ReflectionCardSpec
  | ReadingSpec;

export interface WidgetResult {
  kind: WidgetKind;
  /** Free-form data — gets serialized back into Guide as a system note. */
  data: Record<string, unknown>;
  /** A short human-readable summary the Guide can read back. */
  summary: string;
}

export interface WidgetProps<S extends WidgetSpec = WidgetSpec> {
  spec: S;
  onComplete: (result: WidgetResult) => void;
  onSkip: () => void;
  /** True once user finished — widget should freeze in completed state. */
  done?: boolean;
}
