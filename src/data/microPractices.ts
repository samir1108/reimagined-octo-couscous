/**
 * Micro Practices — 60-second awareness drops
 * ────────────────────────────────────────────
 * For queues, lifts, red lights, between meetings.
 * Swipeable card library — pure presentation data.
 */

export interface MicroPractice {
  id: string;
  emoji: string;
  title: string;
  durationSec: number;
  script: string;
  tag: "breath" | "body" | "mind" | "heart" | "witness";
}

export const MICRO_PRACTICES: MicroPractice[] = [
  {
    id: "box_60",
    emoji: "🟦",
    title: "Box breath ×4",
    durationSec: 60,
    script: "In 4 · Hold 4 · Out 4 · Hold 4. Four full rounds. That's it.",
    tag: "breath",
  },
  {
    id: "feet_now",
    emoji: "🦶",
    title: "Feet on the ground",
    durationSec: 45,
    script:
      "Feel both feet. Wherever you are. Notice weight, temperature, the floor pressing back. Stay 30 seconds.",
    tag: "body",
  },
  {
    id: "name_three",
    emoji: "🔍",
    title: "Three things, no story",
    durationSec: 45,
    script:
      "Look up. Name three things you see — silently — with no opinion attached. Just colour and shape.",
    tag: "witness",
  },
  {
    id: "soften_jaw",
    emoji: "😶",
    title: "Soften the jaw",
    durationSec: 30,
    script:
      "Notice your jaw. Let the tongue drop from the roof of the mouth. Three breaths in this softness.",
    tag: "body",
  },
  {
    id: "one_thank",
    emoji: "🤍",
    title: "One silent thank-you",
    durationSec: 45,
    script:
      "Bring one person to mind. Silently say: 'Thank you for being in my life.' Notice what arrives in the chest.",
    tag: "heart",
  },
  {
    id: "thought_label",
    emoji: "🪶",
    title: "Label one thought",
    durationSec: 45,
    script:
      "Catch the next thought that arises. Label it: 'planning' / 'judging' / 'remembering'. Then let it pass.",
    tag: "mind",
  },
  {
    id: "exhale_long",
    emoji: "🌬️",
    title: "Long exhale ×3",
    durationSec: 60,
    script:
      "Inhale normal. Exhale twice as long. Three rounds. The nervous system softens almost immediately.",
    tag: "breath",
  },
  {
    id: "horizon_eye",
    emoji: "👁️",
    title: "Soft horizon gaze",
    durationSec: 60,
    script:
      "Look at the farthest point you can see. Let the eyes rest there for one full minute. No focus, no thought.",
    tag: "witness",
  },
];
