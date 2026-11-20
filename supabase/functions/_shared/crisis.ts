/**
 * ONE CRISIS GATE.
 *
 * Every surface that can compose a session or answer a message must call
 * `assessCrisis()` BEFORE any model call or archetype decision. Previously
 * three independent keyword lists existed, `guide-chat` and
 * `compose-session-v3` had none at all, and the only real gate sat in a
 * secondary chat surface.
 *
 * Dependency-free on purpose: this file loads in Deno edge functions and is
 * re-exported to the client from `src/supabase/_shared/crisis.ts`.
 */

export type CrisisSeverity = "none" | "elevated" | "acute";

export interface CrisisAssessment {
  severity: CrisisSeverity;
  /** Acute risk — the caller must short-circuit and show safety copy. */
  isCrisis: boolean;
  /** Distress without stated intent — inject the directive, do not drop the user. */
  isElevated: boolean;
  matched: string[];
  /** Prompt block to append when elevated (empty otherwise). */
  directive: string;
}

/** Stated intent or method. Short-circuit territory. */
const ACUTE = [
  /\bsuicid\w*/i,
  /\bkill(ing)?\s+myself\b/i,
  /\bend\s+(my\s+life|it\s+all)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+live\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcutting\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
  /\bhang(ing)?\s+myself\b/i,
  /\bjump\s+off\b/i,
  /\bharm\s+others\b/i,
  /\bkhudkushi\b/i,
  /\batmahatya\b/i,
  /\bmarna\s+chahta\b/i,
  /\bmar\s+jaana\s+chahta\b/i,
  /\bjaan\s+de(na|doon|dunga)\b/i,
  /\bapni\s+jaan\b/i,
];

/** Hopelessness and passive ideation. Directive only. */
const ELEVATED = [
  /\bcan'?t\s+go\s+on\b/i,
  /\bcannot\s+go\s+on\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bnobody\s+would\s+miss\s+me\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\btired\s+of\s+living\b/i,
  /\bno\s+point\s+(in\s+)?living\b/i,
  /\bjeena\s+nahi\s+chahta\b/i,
];

export const CRISIS_ARCHETYPE_EDGE = "Dark Night Hold";
export const CRISIS_ARCHETYPE_LOCAL = "release";

const ELEVATED_DIRECTIVE = [
  "",
  "SAFETY (do not ignore): distress signals detected in this message.",
  "• Drop all frameworks, Sanskrit, philosophy and challenge.",
  "• Do not diagnose, do not reframe, do not ask them to observe anything.",
  "• Name what you heard in one short sentence. Then ask one grounding question",
  "  about the next ten minutes, not about their life.",
  "• If they name intent or a method, stop the conversation and surface crisis lines immediately.",
].join("\n");

export function assessCrisis(text: string | null | undefined): CrisisAssessment {
  const t = String(text ?? "").trim();
  if (!t) {
    return { severity: "none", isCrisis: false, isElevated: false, matched: [], directive: "" };
  }

  const matched: string[] = [];
  for (const re of ACUTE) {
    const m = t.match(re);
    if (m?.[0]) matched.push(m[0]);
  }
  if (matched.length > 0) {
    return {
      severity: "acute",
      isCrisis: true,
      isElevated: true,
      matched: Array.from(new Set(matched)),
      directive: ELEVATED_DIRECTIVE,
    };
  }

  for (const re of ELEVATED) {
    const m = t.match(re);
    if (m?.[0]) matched.push(m[0]);
  }
  if (matched.length > 0) {
    return {
      severity: "elevated",
      isCrisis: false,
      isElevated: true,
      matched: Array.from(new Set(matched)),
      directive: ELEVATED_DIRECTIVE,
    };
  }

  return { severity: "none", isCrisis: false, isElevated: false, matched: [], directive: "" };
}

/** Region-aware enough to be useful without a locale round-trip. */
export function buildCrisisMessage(): string {
  return [
    "Thank you for saying this out loud. What you are carrying is heavy, and you do not have to carry it alone.",
    "",
    "I am not a professional, and this moment needs one. Please reach a human now:",
    "",
    "India — Tele-MANAS 14416 (24/7, 20+ languages) · KIRAN 1800-599-0019 · Emergency 112",
    "US — Call or text 988 · Text HOME to 741741 · Emergency 911",
    "UK — Samaritans 116 123 · Emergency 999",
    "Anywhere — your local emergency number",
    "",
    "If you are in immediate danger, please contact emergency services or go to the nearest hospital.",
    "You matter, and help exists right now.",
  ].join("\n");
}

/**
 * SSE response in the same shape the chat clients already parse, so a crisis
 * reply can short-circuit any streaming surface without touching the client.
 */
export function crisisStreamResponse(corsHeaders: Record<string, string>): Response {
  const text = buildCrisisMessage();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const line of text.split("\n")) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: line + "\n" } }] })}\n\n`),
        );
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}
