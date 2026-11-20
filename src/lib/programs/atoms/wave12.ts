/**
 * Wave 12 atoms — Kriya Yoga deep (the 3 pillars).
 * Tapas (discipline), Svadhyaya (self-study), Ishvara Pranidhana (surrender).
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
  level = 1,
  intensity: Atom["intensity"] = "balanced",
  gates: Atom["gates"] = ["any"],
): Atom => ({
  id,
  category: "kriya",
  label,
  intent,
  durationSec: { min: 180, typical: 300, max: 600 },
  level,
  modality: "sit",
  intensity,
  gates,
  energy: ["medium", "high"],
  script,
});

const teach = (
  id: string,
  label: string,
  intent: string,
  body: string,
  level = 1,
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

export const WAVE12_ATOMS: Atom[] = [
  // ─── Kriya Yoga pillars wisdom-read atoms ───
  read("wisdom.kriya.tapas", "Yoga Sutra 2.1 — Tapas", "Discipline that burns impurities",
    "Tapah svadhyaya ishvarapranidhanani kriyayogah — Kriya Yoga is discipline, self-study, and surrender. Tapas is the fire of discipline that burns the impurities of body and mind.", ["kriya-yoga", "tapas", "discipline"]),
  read("wisdom.kriya.svadhyaya", "Yoga Sutra 2.1 — Svadhyaya", "Self-study that reveals the self",
    "Svadhyaya is the study of the self through sacred texts, mantra repetition, and introspection. It turns the attention inward to know the knower.", ["kriya-yoga", "svadhyaya", "self-study"]),
  read("wisdom.kriya.ishvara", "Yoga Sutra 2.1 — Ishvara Pranidhana", "Surrender to the supreme",
    "Ishvara Pranidhana is the offering of all actions, thoughts, and fruits to the divine. It is the surrender of the false sense of doership to the true source.", ["kriya-yoga", "ishvara-pranidhana", "surrender"]),

  // ─── Teaching atoms ───
  teach("teach.kriya.overview", "Kriya Yoga — the three pillars", "Discipline, self-study, surrender — the yoga of action",
    "Kriya Yoga has three inseparable pillars: Tapas (discipline that purifies), Svadhyaya (self-study that reveals), Ishvara Pranidhana (surrender that liberates). Together they form the complete yoga of action. Tapas burns the impurities, Svadhyaya reveals the self, Ishvara Pranidhana dissolves the doer. All three are needed — one without the others is incomplete.", 1),
  teach("teach.kriya.tapas", "Tapas — the fire of discipline", "Not austerity for its own sake, but focused energy that transforms",
    "Tapas is not self-torture. It is the focused application of energy toward a higher purpose. It is the willingness to endure discomfort for growth. Physical tapas: asana, fasting, silence. Mental tapas: enduring insult, controlling speech, maintaining equanimity. The fire of tapas burns the samskaras that bind us.", 1),
  teach("teach.kriya.svadhyaya", "Svadhyaya — the mirror of self-study", "Study the texts, repeat the mantra, watch the self",
    "Svadhyaya has three aspects: 1) Study of sacred texts (Upanishads, Gita, Yoga Sutras) that point to the self. 2) Mantra japa (repetition of Om, Gayatri, personal mantra) that purifies the mind. 3) Introspection — watching one's thoughts, motives, and patterns. The text is the map, the mantra is the vehicle, the introspection is the arrival.", 1),
  teach("teach.kriya.ishvara", "Ishvara Pranidhana — the surrender that liberates", "Offer everything to the source, keep nothing for the ego",
    "Ishvara Pranidhana is the offering of all actions and their fruits to the divine. It is the recognition that 'I am not the doer.' It dissolves the false sense of authorship. Practice: before each action, offer it. After each action, release the fruit. In meditation, rest as the awareness that witnesses the offering. This is the master key — it unlocks all other practices.", 1),
];