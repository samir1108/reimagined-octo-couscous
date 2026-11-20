/**
 * Wave 7 atoms — Subtle anatomy: Pancha Kosha + Pancha Prana.
 * 5 sheaths + 5 pranas = 10 programs.
 */
import type { Atom } from "../types";

const practice = (
  id: string,
  label: string,
  intent: string,
  script: string[],
  level = 1,
  intensity: Atom["intensity"] = "gentle",
  gates: Atom["gates"] = ["any"],
): Atom => ({
  id,
  category: "body-scan",
  label,
  intent,
  durationSec: { min: 180, typical: 300, max: 600 },
  level,
  modality: "sit",
  intensity,
  gates,
  energy: ["low", "medium", "high"],
  script,
});

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

const teach = (
  id: string,
  label: string,
  intent: string,
  body: string,
  level = 0,
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

export const WAVE7_ATOMS: Atom[] = [
  // ─── Pancha Kosha (5 sheaths) ───
  read("wisdom.kosha.annamaya", "Annamaya Kosha", "The food sheath — the physical body",
    "Annamaya kosha is the physical body made of food. It is born of food, sustained by food, and returns to food. It is the outermost sheath.", ["kosha", "pancha-kosha"]),
  read("wisdom.kosha.pranamaya", "Pranamaya Kosha", "The energy sheath — the vital breath",
    "Pranamaya kosha is the vital energy body, made of prana. It animates the physical body. It is the breath, the life-force, the subtle wind that moves within.", ["kosha", "pancha-kosha"]),
  read("wisdom.kosha.manomaya", "Manomaya Kosha", "The mental sheath — thoughts and emotions",
    "Manomaya kosha is the mental body, made of thoughts, feelings, and sensory impressions. It is the mind that reacts, feels, and creates stories.", ["kosha", "pancha-kosha"]),
  read("wisdom.kosha.vijnanamaya", "Vijnanamaya Kosha", "The wisdom sheath — intellect and discernment",
    "Vijnanamaya kosha is the wisdom body, made of discriminating intellect. It knows, decides, and discerns. It is the witness that watches the mind.", ["kosha", "pancha-kosha"]),
  read("wisdom.kosha.anandamaya", "Anandamaya Kosha", "The bliss sheath — the causal body",
    "Anandamaya kosha is the bliss body, the causal sheath. It is the subtlest, closest to the self. It is the sheath of deep sleep and the joy of unity.", ["kosha", "pancha-kosha"]),

  // ─── Pancha Prana (5 pranas) ───
  read("wisdom.prana.prana", "Prana Vayu", "The upward-moving life-force",
    "Prana vayu moves upward and inward. It governs inhalation, the heart, the chest, and the upward flow of energy. It is the vital breath that sustains life.", ["prana", "pancha-prana"]),
  read("wisdom.prana.apana", "Apana Vayu", "The downward-moving eliminative force",
    "Apana vayu moves downward and outward. It governs exhalation, elimination, reproduction, and the downward flow of energy. It grounds and releases.", ["prana", "pancha-prana"]),
  read("wisdom.prana.samana", "Samana Vayu", "The equalizing digestive force",
    "Samana vayu moves in a spiral at the navel center. It governs digestion, assimilation, and the equal distribution of nutrients. It balances and centers.", ["prana", "pancha-prana"]),
  read("wisdom.prana.udana", "Udana Vayu", "The upward-expressing force",
    "Udana vayu moves upward from the throat. It governs speech, growth, and the upward expression of energy. It is the force that lifts us higher.", ["prana", "pancha-prana"]),
  read("wisdom.prana.vyana", "Vyana Vayu", "The all-pervading circulatory force",
    "Vyana vayu moves outward in all directions. It governs circulation, movement, and the pervasion of energy throughout the body. It connects all.", ["prana", "pancha-prana"]),

  // ─── Teaching atoms ───
  teach("teach.kosha.overview", "Pancha Kosha — the five sheaths", "From food to bliss",
    "The self is covered by five sheaths: annamaya (food), pranamaya (energy), manomaya (mind), vijnanamaya (wisdom), anandamaya (bliss). Each is subtler than the last. The self is not any sheath — it is the witness of all sheaths. Meditation moves inward through the sheaths to the self.", 0),
  teach("teach.prana.overview", "Pancha Prana — the five vital airs", "The winds that move the body",
    "The life-force manifests as five vayus: prana (upward, chest), apana (downward, pelvis), samana (spiral, navel), udana (upward, throat), vyana (outward, everywhere). Each governs specific functions. Balance the vayus, and the body thrives; the mind steadies.", 0),
];