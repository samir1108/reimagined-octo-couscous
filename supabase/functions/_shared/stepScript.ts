/**
 * Step scripts for the deterministic brain.
 *
 * The local composer used to hand the user a single sentence per step (median
 * 55 characters) while the paid path produced 3–5 lines. This module gives the
 * local path the same instructional depth from data, not from an LLM call:
 * every kind has a behavioural contract, and the ingredient's own line sits in
 * the middle of it.
 *
 * The contract lines rotate deterministically from `variantSeed`, so the same
 * ingredient does not read word-for-word the same every sitting. The structure
 * (setup → action → what not to do → stop) never changes.
 */

export interface ScriptInput {
  kind: string;
  label: string;
  body?: string | null;
  minutes: number;
  loopName?: string | null;
  gate?: string | null;
  /** Practice level (1-based) for practice steps. */
  level?: number;
  /** Chakra opening line, when this step is the opening. */
  openingPractice?: string | null;
  /** Rotates the fixed lines. Use a per-sitting value (session id + step index). */
  variantSeed?: string | null;
}

function minutesLine(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  return `Stay for about ${m} minute${m > 1 ? "s" : ""}, then stop on your own signal rather than at a bell.`;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(options: T[], seed: string): T {
  return options[hash(seed) % options.length];
}

const SETUP = [
  "Sit or stand as you are. Let the body take its full weight before you change anything.",
  "Take the seat you already have. Nothing about the posture needs to be corrected first.",
  "Arrive here first — feet, weight, breath. Only then begin.",
];

const DONT = [
  "Do not improve it, do not evaluate it, and do not narrate what happens.",
  "No efforting and no fixing. What you notice is enough.",
  "Do not turn this into a performance. Nothing here is being marked.",
];

const CLOSE = [
  "When you finish, sit still for three breaths before standing and carrying it back out.",
  "End by sitting still for three breaths. Then close the app and keep the quiet.",
  "Before you stand, take three slow breaths and let the sitting close itself.",
];

const KIND_CONTRACT: Record<string, (i: ScriptInput) => { body: string[]; ifBody?: boolean }> = {
  breathwork: (i) => ({
    body: [
      pick(SETUP, `${i.kind}:${i.label}:setup`),
      i.body || `Follow the ${i.label} rhythm without forcing the exhale.`,
      "Keep the breath quiet enough that you could hear a room tone underneath it.",
      "If the count slips, begin again at the next inhale. The returning is the practice.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  witness: (i) => ({
    body: [
      "Take your seat and let the eyes soften or close.",
      i.body || "Watch what arises — thought, feeling, sound — without naming it a problem.",
      "When you notice you have been carried away, notice that too. Nothing needs fixing.",
      pick(DONT, `${i.kind}:${i.label}:dont`),
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  practice: (i) => ({
    body: [
      `Set up for ${i.label}. ${i.level && i.level > 1 ? "Start at the level you can hold cleanly, not the level that impresses." : "Keep it smaller than you think it should be."}`,
      i.body || "Follow the instruction exactly, without adding your own version of it.",
      "If the mind argues, let it argue and continue. Agreement is not required.",
      "End before you are exhausted. A small complete rep beats a large abandoned one.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  inquiry: (i) => ({
    body: [
      "Sit quietly and let one real question land.",
      i.body || `Ask: ${i.label}. Do not answer from memory.`,
      "Notice the answer that arrives first — that is the habit speaking.",
      "Stay with the question itself. Not knowing is the honest position.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  journal: (i) => ({
    body: [
      "Write without stopping and without editing. Spelling does not matter here.",
      i.body || "Answer the question in front of you in plain words.",
      "If you do not know, write that you do not know, and keep going.",
      "Name one thing you would not normally say out loud.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  reflection: (i) => ({
    body: [
      "Sit with the question before you write anything.",
      i.body || "One honest sentence is enough. Do not perform insight.",
      "Say what is actually true right now, even if it is small or unflattering.",
      "Close the sentence and leave it. Do not fix it.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  "wisdom-read": (i) => ({
    body: [
      "Read slowly enough that you hear the words.",
      i.body || "Let one line catch you.",
      "Stop at the line that catches you and read it again.",
      "Do not try to agree with it. Notice what it disturbs.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  "micro-act": (i) => ({
    body: [
      "This one happens outside the sitting, in ordinary life.",
      i.body || i.label,
      "Choose the smallest version that is still real.",
      "Do it before you decide how you feel about it.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  "guide-chat": (i) => ({
    body: [
      "Speak plainly. Nothing here needs to sound spiritual.",
      i.body || "Start with what is actually on your mind.",
      "If you notice yourself performing, say so — that is allowed too.",
      "Say the plain thing rather than the composed thing; the plain thing is what can be worked with.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  "temple-chat": (i) => ({
    body: [
      "Bring one real question to the temple.",
      i.body || "Ask it as you would ask someone you trust.",
      "Bring the question as it actually is, not the polished version of it.",
      "Then wait. Silence is part of the exchange, not a gap in it.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  mantra: (i) => ({
    body: [
      "Sit and let the spine lengthen without stiffening.",
      i.body || `Repeat ${i.label} aloud, then silently.`,
      "Keep the sound and the listening equally weighted.",
      "If the mind wanders, return to the sound without commentary.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  loving_kindness: (i) => ({
    body: [
      "Sit and bring to mind someone easy to care about.",
      i.body || "Offer the phrases slowly enough to feel them.",
      "Then turn the same phrases toward yourself, even if it feels false at first.",
      "End by including someone neutral, then someone difficult.",
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
  default: (i) => ({
    body: [
      pick(SETUP, `${i.kind}:${i.label}:setup`),
      i.body || `Stay with ${i.label}. Nothing to add and nothing to fix.`,
      pick(DONT, `${i.kind}:${i.label}:dont`),
      minutesLine(i.minutes),
    ],
    ifBody: true,
  }),
};

export function buildStepScript(input: ScriptInput): string[] {
  const contract = KIND_CONTRACT[input.kind] ?? KIND_CONTRACT.default;
  const lines: string[] = [];

  if (input.openingPractice) {
    lines.push(input.openingPractice);
  }

  lines.push(...contract(input).body);

  if (input.loopName) {
    lines.push(`This is aimed at "${input.loopName}" — hold that name lightly, not as a task.`);
  }

  lines.push(pick(CLOSE, `${input.kind}:${input.variantSeed ?? input.label}:close`));

  return lines.filter((l) => l && l.trim().length > 0);
}
