/**
 * Self-inquiry atoms — atma-vichara, who-am-I.
 */
import type { Atom } from "../types";

export const SELF_INQUIRY_ATOMS: Atom[] = [
  {
    id: "inquiry.who-am-i",
    category: "self-inquiry",
    label: "Who Am I?",
    intent: "Ramana's atma-vichara — the root inquiry",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 2,
    modality: "sit",
    intensity: "fierce",
    gates: ["morning", "midday"],
    energy: ["medium", "high"],
    script: [
      "Sit. Close eyes.",
      "Ask silently: who am I?",
      "Whatever answer arises, ask: who is the one to whom this answer appeared?",
      "Keep turning attention back to the source.",
    ],
    tags: ["jnana", "ramana"],
  },
  {
    id: "inquiry.what-do-i-want",
    category: "self-inquiry",
    label: "What Do I Actually Want?",
    intent: "Cut through surface desires to the real want",
    durationSec: { min: 180, typical: 300, max: 600 },
    level: 1,
    modality: "sit",
    intensity: "balanced",
    gates: ["any"],
    energy: ["low", "medium", "high"],
    script: [
      "Name something you want right now.",
      "Ask: if I had it, what would I really get?",
      "Repeat with the answer. And again.",
      "Stop when you reach something that needs no further answer.",
    ],
    tags: ["desire", "values"],
  },
  {
    id: "inquiry.where-is-the-i",
    category: "self-inquiry",
    label: "Where Is the 'I'?",
    intent: "Look for the location of the self in the body",
    durationSec: { min: 300, typical: 600, max: 1200 },
    level: 3,
    modality: "sit",
    intensity: "fierce",
    gates: ["midday", "evening"],
    energy: ["medium", "high"],
    script: [
      "Sit still.",
      "Where is the 'I' located? Head? Chest? Behind the eyes?",
      "Look directly. Don't think — look.",
      "What do you find?",
    ],
    tags: ["jnana", "advanced"],
  },
];
