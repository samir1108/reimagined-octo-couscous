/**
 * conditioningQuestions — The Light Six (Gate 1 data + scoring)
 * ─────────────────────────────────
 * Six very light multiple-choice questions about human conditioning and
 * consciousness, written for a 2026 user. Each option secretly carries a
 * band signal (0–10) that feeds the engine's initial conditioning read.
 *
 * Kept out of the component file so fast-refresh stays clean and the
 * scoring helper can be reused by the persistence layer.
 */

export interface ConditioningOption {
  label: string;
  band: number;
}

export interface ConditioningQuestion {
  id: string;
  emoji: string;
  eyebrow: string;
  question: string;
  options: ConditioningOption[];
}

export interface ConditioningResult {
  answers: Record<string, number>; // question id → chosen band
  avgBand: number;
  headline: string; // one-line mirror for the reveal
}

export const CONDITIONING_QUESTIONS: ConditioningQuestion[] = [
  {
    id: "notification",
    emoji: "📱",
    eyebrow: "The reflex",
    question: "A notification pops mid-conversation. You…",
    options: [
      { label: "Check it. Instantly. Every time.", band: 1 },
      { label: "Feel the pull — finish the sentence first.", band: 4 },
      { label: "Watch the whole mechanism happen from a distance.", band: 7 },
    ],
  },
  {
    id: "shower_argument",
    emoji: "🚿",
    eyebrow: "The rehearsal",
    question: "You rehearse arguments in the shower that will never happen?",
    options: [
      { label: "Constantly. Oscar-worthy performances.", band: 2 },
      { label: "Sometimes, when something's unresolved.", band: 4 },
      { label: "Rarely. What's here is enough.", band: 7 },
    ],
  },
  {
    id: "admired_understood",
    emoji: "👀",
    eyebrow: "The fuel",
    question: "Would you rather be admired or understood?",
    options: [
      { label: "Admired. Let's be honest.", band: 3 },
      { label: "Understood — by a few.", band: 5 },
      { label: "Neither. Both were never the point.", band: 7 },
    ],
  },
  {
    id: "delete_one_app",
    emoji: "🗑️",
    eyebrow: "The grip",
    question: "You could delete one app forever. The hesitation is real because…",
    options: [
      { label: "I'd miss the drip. You know the one.", band: 2 },
      { label: "I'd disappear from people's lives.", band: 4 },
      { label: "Nothing. I'd just delete it.", band: 7 },
    ],
  },
  {
    id: "ten_minutes_alone",
    emoji: "🧘",
    eyebrow: "The silence",
    question: "Ten minutes. Alone. No input, no phone. How is it?",
    options: [
      { label: "Unbearable. I reach for something.", band: 1 },
      { label: "Restless… then okay.", band: 4 },
      { label: "The most honest part of my day.", band: 8 },
    ],
  },
  {
    id: "unseen_work",
    emoji: "🎭",
    eyebrow: "The why",
    question: "If nobody ever saw your work, would you still do it?",
    options: [
      { label: "What's the point then?", band: 3 },
      { label: "I'd struggle. But yes.", band: 5 },
      { label: "The work was never for them.", band: 8 },
    ],
  },
];

export function computeConditioningResult(answers: Record<string, number>): ConditioningResult {
  const values = Object.values(answers);
  const avgBand = values.length
    ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
    : 3;

  let headline: string;
  if (avgBand < 2.5) {
    headline = "You're deep in the machine — and honest about it. That's exactly where the work begins.";
  } else if (avgBand < 4.5) {
    headline = "You oscillate. Most of us do. The eleven sittings will show you where.";
  } else {
    headline = "You already watch yourself watching. The eleven sittings will go deep.";
  }

  return { answers, avgBand, headline };
}