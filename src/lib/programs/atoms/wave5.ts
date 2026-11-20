/**
 * Wave 5 atoms — Nada / Laya / Mantra yoga.
 * Practice + teaching atoms for sound-based yoga.
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
  category: "mantra",
  label,
  intent,
  durationSec: { min: 180, typical: 300, max: 600 },
  level,
  modality: "speak",
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

const meditation = (
  id: string,
  label: string,
  intent: string,
  script: string[],
  level = 1,
  intensity: Atom["intensity"] = "balanced",
): Atom => ({
  id,
  category: "meditation",
  label,
  intent,
  durationSec: { min: 300, typical: 600, max: 1200 },
  level,
  modality: "sit",
  intensity,
  gates: ["any"],
  energy: ["low", "medium"],
  script,
});

export const WAVE5_ATOMS: Atom[] = [
  // ─── Nada / Laya / Mantra practice atoms ───
  practice("mantra.nada", "Nada Yoga", "Inner sound — the unstruck melody",
    ["Sit tall, close eyes.", "Gently close the ears with thumbs (shanmukhi mudra).", "Listen for the inner sound — subtle, like a flute, a bell, a hum.", "Merge attention into the sound.", "Rest in the sound for 10–20 minutes."], 2, "gentle", ["evening", "night"]),
  practice("mantra.laya", "Laya Yoga", "Absorption through sound — dissolve into the melody",
    ["Sit tall, close ears with thumbs.", "Follow the inner sound to its source.", "As the sound refines, let attention dissolve into it.", "The sound, the listener, and the listening become one.", "Rest in laya — absorption."], 3, "balanced", ["evening", "night"]),
  practice("mantra.japa-deep", "Mantra Japa Deep", "Repetition → automatic repetition → absorption",
    ["Choose a mantra (Om, So-hum, Gayatri).", "Phase 1: Vocal japa — speak clearly, 108 rounds.", "Phase 2: Whisper japa — lips move, barely audible.", "Phase 3: Mental japa — silent repetition in the mind.", "Phase 4: Ajapa japa — the mantra repeats itself, effortless."], 2, "balanced", ["morning", "evening"]),
  practice("mantra.om", "Om Meditation", "The primordial sound — A-U-M, the three states",
    ["Sit tall, close eyes.", "Inhale deeply.", "Chant Om — AAA (waking), UUU (dream), MMM (deep sleep).", "Feel the silence after the M — the fourth state (turiya).", "Repeat 108 times or for 20 minutes."], 1, "balanced", ["any"]),
  practice("mantra.yantra", "Yantra Yoga", "Sacred geometry focus — form as meditation",
    ["Place a yantra (Sri Yantra, Ganesha, etc.) at eye level.", "Gaze at the center point (bindu).", "Let the eyes soften, absorb the geometry.", "When the image internalizes, close eyes and hold it.", "Rest in the formless within the form."], 1, "gentle", ["any"]),
  practice("mantra.bija", "Bija Mantra Arc", "Seed sounds — the essence of each chakra",
    ["Sit tall, breathe naturally.", "Root: LAM — feel the earth.", "Sacral: VAM — feel the flow.", "Solar: RAM — feel the fire.", "Heart: YAM — feel the air.", "Throat: HAM — feel the space.", "Third Eye: OM — feel the light.", "Crown: silence — feel the source."], 1, "balanced", ["any"]),

  // ─── Wisdom-read atoms ───
  read("wisdom.nada.upanishad", "Nada Upanishad", "The inner sound",
    "The unstruck sound (anahata nada) is heard when the ears are closed and the mind is still. It is the sound of the self, the voice of the absolute. By merging with it, the yogi attains liberation.", ["nada", "upanishad"]),
  read("wisdom.hatha.nada", "Hatha · Nada", "The inner sound that dissolves the mind",
    "Close the ears. Hear the inner sound — the anahata nada, unstruck, rising like the ocean. The mind dissolves into it like salt in water. This is the highest Hatha practice — Nada Yoga.", ["hatha", "nada"]),
  read("wisdom.laya", "Laya Yoga", "Absorption — the mind dissolves in the sound",
    "Laya means dissolution. The mind dissolves in the sound (nada), or in the light, or in the breath, or in the gaze. When the mind is dissolved, what remains is the seer — pure awareness.", ["laya", "nada"]),

  // ─── Teaching atoms ───
  teach("teach.nada", "Nada Yoga — the path of inner sound", "Listen to the unstruck melody",
    "Nada Yoga is the path of listening to the inner sound (anahata nada). It begins with external sounds, then moves to the subtle inner sound. The sound has stages: gross (drums, bells), subtle (flute, veena), subtlest (bee, bell). Follow the sound to its source — the self.", 1),
  teach("teach.laya", "Laya Yoga — absorption", "Dissolve the mind in the sound",
    "Laya Yoga is the yoga of absorption. The mind is dissolved in a medium: sound (nada), light (jyoti), breath (prana), or gaze (trataka). When the mind is fully dissolved, only the seer remains. This is the direct path — no effort, only letting go into the medium.", 2),
  teach("teach.mantra.japa", "Mantra Japa — the arc of repetition", "From spoken to silent to effortless",
    "Mantra Japa has four stages: 1) Vaikhari — spoken aloud. 2) Upamshu — whispered. 3) Manasika — mental, silent. 4) Ajapa — the mantra repeats itself, no effort needed. The progression is natural: start loud, go subtle, arrive at effortless. The mantra becomes the breath.", 1),
  teach("teach.mantra.om", "Om — the primordial sound", "A-U-M, the three states and the fourth",
    "Om is the seed of all sounds. A = waking state, U = dream state, M = deep sleep. The silence after = turiya, the fourth state, the self. Chanting Om aligns the three states and reveals the fourth. It is the most complete mantra — contains all sounds, all states, all realities.", 0),
  teach("teach.mantra.yantra", "Yantra Yoga — sacred geometry", "Form as the doorway to formless",
    "A yantra is a geometric diagram that represents a deity, a chakra, or a cosmic principle. By gazing at it (trataka), the form is internalized. The bindu (center point) is the gateway. The geometry is the map; the destination is the formless center.", 1),
  teach("teach.bija", "Bija Mantras — the seed sounds", "One syllable per chakra, the essence of the element",
    "Each chakra has a bija (seed) mantra: LAM (earth), VAM (water), RAM (fire), YAM (air), HAM (ether), OM (light), silence (source). Chanting the bija activates the chakra's element. Sequence them upward to raise energy, downward to ground.", 1),
];