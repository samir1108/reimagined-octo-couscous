/**
 * Wave 3 atoms — pranayama deep-dives.
 * 10 classical pranayama practices.
 */
import type { Atom } from "../types";

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
  category: "breathwork",
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

export const WAVE3_ATOMS: Atom[] = [
  // ─── 10 classical pranayama practice atoms ───
  practice("pranayama.surya-bhedana", "Surya Bhedana", "Right-nostril solar breath",
    ["Close left nostril with ring finger.", "Inhale deeply through the right nostril.", "Close right nostril with thumb, hold briefly.", "Exhale through left nostril.", "Repeat 5–10 rounds."], 1, "balanced", ["morning"]),
  practice("pranayama.chandra-bhedana", "Chandra Bhedana", "Left-nostril lunar breath",
    ["Close right nostril with thumb.", "Inhale deeply through the left nostril.", "Close left nostril with ring finger, hold briefly.", "Exhale through right nostril.", "Repeat 5–10 rounds."], 1, "gentle", ["evening", "night"]),
  practice("pranayama.bhramari", "Bhramari", "Humming bee breath",
    ["Sit tall, close eyes.", "Inhale deeply through both nostrils.", "Exhale with a steady humming sound — like a bee.", "Feel the vibration in the skull and face.", "Repeat 5–10 rounds."], 0, "gentle", ["evening", "night"]),
  practice("pranayama.plavini", "Plavini", "Floating breath — swallow air",
    ["Sit tall, breathe normally.", "Inhale, then swallow air into the stomach (like drinking water).", "Hold the swallowed air comfortably.", "Exhale slowly through the nose.", "Repeat 3–5 times. Advanced — under guidance."], 3, "fierce", ["morning"]),
  practice("pranayama.murcha", "Murcha", "Swooning breath — faint with retention",
    ["Sit tall, inhale deeply.", "Hold the breath with khechari mudra (tongue to palate).", "Lean forward slightly, retain until faint.", "Exhale slowly through the nose.", "Repeat 3–5 times. Advanced — stop if uncomfortable."], 3, "fierce", ["evening"]),
  practice("pranayama.sitali", "Sitali", "Cooling breath — rolled tongue",
    ["Sit tall, curl the tongue into a tube.", "Inhale slowly through the curled tongue.", "Close the mouth, hold briefly.", "Exhale slowly through both nostrils.", "Repeat 5–10 rounds. (If tongue doesn't curl, use sitkari.)"], 0, "gentle", ["midday"]),
  practice("pranayama.sitkari", "Sitkari", "Hissing breath — pressed teeth",
    ["Sit tall, press upper and lower teeth together.", "Inhale slowly through the teeth with a hissing sound.", "Close the mouth, hold briefly.", "Exhale slowly through both nostrils.", "Repeat 5–10 rounds."], 0, "gentle", ["midday"]),
  practice("pranayama.viloma", "Viloma", "Interrupted breath — lift and drop",
    ["Sit tall, inhale.", "Pause for 2 seconds, inhale again.", "Pause, inhale again — fill in thirds.", "Exhale smoothly without interruption.", "Repeat 5 rounds. Then reverse: interrupted exhale."], 1, "gentle", ["any"]),
  practice("pranayama.pratiloma", "Pratiloma", "Reversed breath — opposite nostril",
    ["Sit tall, close right nostril.", "Inhale through left, close left, open right, exhale through right.", "Inhale through right, close right, open left, exhale through left.", "That is one round. Repeat 5–10 rounds."], 2, "balanced", ["morning", "evening"]),
  practice("pranayama.kevala-kumbhaka", "Kevala Kumbhaka", "Spontaneous retention",
    ["Sit tall, establish slow, deep breathing.", "At the end of an exhale, hold the breath out effortlessly.", "Do not force — the hold arises on its own.", "When the urge comes, inhale smoothly.", "Repeat 3–5 times. Advanced — arises from deep practice."], 4, "fierce", ["any"]),

  // ─── Wisdom-read atoms (Hatha Pradipika pranayama chapter) ───
  read("wisdom.hatha.pranayama-chapter", "Hatha · Pranayama Chapter", "Life-force through the nose",
    "When the breath is irregular, the mind is irregular. When the breath is still, the mind is still. Pranayama is the bridge between the body and the inner. Practice it daily, and the inner light dawns.", ["hatha", "pranayama"]),
  read("wisdom.hatha.surya-bhedana", "Hatha · Surya Bhedana", "Piercing the sun",
    "Surya bhedana pranayama pierces the sun (right nostril, solar channel). It heats the body, awakens prana, and burns impurities. Practice it in the morning, when the sun is rising.", ["hatha", "pranayama", "surya"]),
  read("wisdom.hatha.chandra-bhedana", "Hatha · Chandra Bhedana", "Piercing the moon",
    "Chandra bhedana pranayama pierces the moon (left nostril, lunar channel). It cools the body, calms the mind, and opens the heart. Practice it in the evening, when the moon is rising.", ["hatha", "pranayama", "chandra"]),

  // ─── Teaching atoms ───
  teach("teach.pranayama.what-is", "What Is Pranayama?", "The bridge between body and inner",
    "Pranayama is the fourth limb of Raja yoga. 'Prana' is the life-force, 'ayama' is extension or control. Pranayama is the art of extending and controlling the life-force through the breath. When the breath is still, the mind is still.", 0),
  teach("teach.pranayama.nadis", "The Three Nadis", "Ida, pingala, sushumna",
    "The prana flows through three main channels: ida (lunar, left), pingala (solar, right), and sushumna (central). Most people breathe through ida or pingala only. Pranayama balances the two and opens the sushumna, so the kundalini can rise.", 1),
  teach("teach.pranayama.kumbhaka", "Kumbhaka — Retention", "The still point",
    "Kumbhaka is retention of the breath — the still point between inhale and exhale. It is in the still point that the mind becomes still. Practice antar kumbhaka (inner retention) and bahya kumbhaka (outer retention) under guidance.", 2),
];
