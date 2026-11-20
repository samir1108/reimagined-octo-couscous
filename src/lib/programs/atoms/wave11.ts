/**
 * Wave 11 atoms — Granthis (the 3 knots).
 * Brahma Granthi, Vishnu Granthi, Rudra Granthi — the knots that bind consciousness.
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
  category: "concentration",
  label,
  intent,
  durationSec: { min: 300, typical: 600, max: 1200 },
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

export const WAVE11_ATOMS: Atom[] = [
  // ─── Granthi wisdom-read atoms ───
  read("wisdom.granthi.brahma", "Brahma Granthi", "The knot of Brahma — attachment to physical existence",
    "Brahma Granthi is located at the muladhara and svadhisthana chakras. It represents attachment to physical survival, sensuality, and the material world. It binds consciousness to the gross body and its needs.", ["granthi", "brahma-granthi", "muladhara", "svadhisthana"]),
  read("wisdom.granthi.vishnu", "Vishnu Granthi", "The knot of Vishnu — attachment to emotional and mental patterns",
    "Vishnu Granthi is located at the anahata and vishuddha chakras. It represents attachment to emotional patterns, ego-identity, and mental constructs. It binds consciousness to the subtle body and its stories.", ["granthi", "vishnu-granthi", "anahata", "vishuddha"]),
  read("wisdom.granthi.rudra", "Rudra Granthi", "The knot of Rudra — attachment to the sense of 'I' and subtle knowledge",
    "Rudra Granthi is located at the ajna and sahasrara chakras. It represents attachment to the subtle sense of 'I am the knower', spiritual pride, and the final veil of individuality. It binds consciousness to the causal body.", ["granthi", "rudra-granthi", "ajna", "sahasrara"]),

  // ─── Teaching atoms ───
  teach("teach.granthi.overview", "The three granthis — the knots that bind", "Where consciousness gets stuck",
    "The granthis are knots in the subtle body that prevent the kundalini from rising and consciousness from expanding. 1) Brahma Granthi (muladhara/svadhisthana) — attachment to survival, sex, and the physical. 2) Vishnu Granthi (anahata/vishuddha) — attachment to emotions, ego, and mental patterns. 3) Rudra Granthi (ajna/sahasrara) — attachment to the knower, spiritual pride, and the final 'I'. Untying them is the work of a lifetime.", 2),
  teach("teach.granthi.untying", "Untying the knots", "From below upward, with patience and grace",
    "The knots untie from bottom to top. Brahma Granthi loosens through ethical living (yama/niyama), asana, and pratyahara. Vishnu Granthi loosens through bhakti, karma yoga, and heart-opening practices. Rudra Granthi loosens through jnana, self-inquiry, and surrender. They cannot be forced — only invited to release through sustained practice and grace.", 3),
];