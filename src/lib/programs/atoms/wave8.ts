/**
 * Wave 8 atoms — Samadhi stages.
 * The progressive stages of absorption in classical yoga.
 */
import type { Atom } from "../types";

const read = (
  id: string,
  label: string,
  intent: string,
  body: string,
  tags: string[] = [],
): Atom => ({
  id,
  category: "wisdom-read",
  label,
  intent,
  durationSec: { min: 60, typical: 120, max: 240 },
  level: 0,
  modality: "read",
  intensity: "gentle",
  gates: ["any"],
  energy: ["low", "medium", "high"],
  body,
  tags,
});

const practice = (
  id: string,
  label: string,
  intent: string,
  script: string[],
  level = 2,
  intensity: Atom["intensity"] = "balanced",
  gates: Atom["gates"] = ["any"],
): Atom => ({
  id,
  category: "meditation",
  label,
  intent,
  durationSec: { min: 300, typical: 600, max: 1800 },
  level,
  modality: "sit",
  intensity,
  gates,
  energy: ["low", "medium"],
  script,
});

const teach = (
  id: string,
  label: string,
  intent: string,
  body: string,
  level = 2,
): Atom => ({
  id,
  category: "teaching",
  label,
  intent,
  durationSec: { min: 90, typical: 150, max: 300 },
  level,
  modality: "read",
  intensity: "balanced",
  gates: ["any"],
  energy: ["low", "medium", "high"],
  body,
});

export const WAVE8_ATOMS: Atom[] = [
  // ─── Samadhi stage wisdom-read atoms ───
  read("wisdom.samadhi.savikalpa", "Savikalpa Samadhi", "Absorption with seed — duality still present",
    "In savikalpa samadhi, the mind is absorbed in an object of meditation. The duality of subject and object remains, but the mind is one-pointed. It is the first stage of deep absorption.", ["samadhi", "savikalpa"]),
  read("wisdom.samadhi.nirvikalpa", "Nirvikalpa Samadhi", "Absorption without seed — beyond duality",
    "In nirvikalpa samadhi, even the object of meditation dissolves. There is no subject, no object, no duality. Only pure awareness remains. This is the highest samadhi in the Yoga Sutras.", ["samadhi", "nirvikalpa"]),
  read("wisdom.samadhi.sahaja", "Sahaja Samadhi", "Natural samadhi — absorption in daily life",
    "Sahaja samadhi is the spontaneous, natural absorption that continues while walking, talking, eating. The yogi rests in the self at all times, whether in meditation or activity. It is the integration of samadhi into life.", ["samadhi", "sahaja"]),
  read("wisdom.samadhi.asamprajnata", "Asamprajnata Samadhi", "Non-cognitive absorption — beyond knowledge",
    "Asamprajnata is the same as nirvikalpa — absorption without any object of knowledge. The mind is completely still, the fluctuations ceased. It is the final stage of Patanjali's eight limbs.", ["samadhi", "asamprajnata"]),

  // ─── Teaching atoms ───
  teach("teach.samadhi.stages", "The stages of samadhi", "From effort to effortlessness",
    "The classical progression: 1) Savikalpa — absorption with an object (duality remains). 2) Nirvikalpa/Asamprajnata — absorption without object (non-dual). 3) Sahaja — natural, continuous absorption in all states (waking, dream, deep sleep). The goal is not to attain samadhi, but to rest as the awareness in which samadhi arises.", 2),
  teach("teach.samadhi.transition", "Transitions between stages", "The obstacles and gateways",
    "The transition from savikalpa to nirvikalpa requires the dissolution of the subtle object. The transition from nirvikalpa to sahaja requires the integration of the awakened state into the body and daily life. Common obstacles: subtle attachment to the bliss of samadhi, fear of losing the self, inability to function in the world.", 3),
];