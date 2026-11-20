/**
 * Witness atoms — sakshi bhav, pure observation.
 */
import type { Atom } from "../types";

export const WITNESS_ATOMS: Atom[] = [
  {
    id: "witness.thought-counter",
    category: "witness",
    label: "Thought Counter",
    intent: "Count thoughts without engaging them",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 0,
    modality: "sit",
    intensity: "gentle",
    gates: ["any"],
    energy: ["low", "medium", "high"],
    script: [
      "Sit. Close eyes.",
      "Each time a thought arises, mentally note 'one'.",
      "Next one, 'two'. Don't follow the thought — just count.",
      "If you lose count, start at one again.",
    ],
    tags: ["witness", "beginner"],
  },
  {
    id: "witness.gap-between-thoughts",
    category: "witness",
    label: "Gap Between Thoughts",
    intent: "Notice the space between two thoughts",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 2,
    modality: "sit",
    intensity: "balanced",
    gates: ["morning", "evening"],
    energy: ["low", "medium"],
    script: [
      "Sit still. Eyes closed.",
      "Watch for a thought to end.",
      "Before the next thought begins — notice the gap.",
      "Stay in the gap as long as it lasts.",
    ],
    tags: ["witness", "advanced"],
  },
  {
    id: "witness.who-is-watching",
    category: "witness",
    label: "Who Is Watching?",
    intent: "Turn attention toward the watcher itself",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 3,
    modality: "sit",
    intensity: "fierce",
    gates: ["midday", "evening"],
    energy: ["medium", "high"],
    script: [
      "Notice a thought. Ask: who is noticing?",
      "Don't answer in words. Turn attention back.",
      "Find the source of attention itself.",
      "Rest there.",
    ],
    tags: ["jnana", "advanced"],
  },
];
