/**
 * Wave 10 atoms — Pancha Bhuta (the 5 elements).
 * Earth, Water, Fire, Air, Ether — the building blocks of all manifestation.
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
  intensity: Atom["intensity"] = "gentle",
  gates: Atom["gates"] = ["any"],
): Atom => ({
  id,
  category: "observation",
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

export const WAVE10_ATOMS: Atom[] = [
  // ─── 5 Elements wisdom-read atoms ───
  read("wisdom.bhuta.prithvi", "Prithvi — Earth", "The solid principle — stability, form, smell",
    "Prithvi (earth) is the principle of solidity and form. Its quality is smell (gandha). It governs the bones, flesh, skin, nails, and hair. In the body, it is the structure; in the mind, it is stability and groundedness.", ["bhuta", "prithvi", "earth"]),
  read("wisdom.bhuta.apa", "Apa — Water", "The liquid principle — fluidity, taste, cohesion",
    "Apa (water) is the principle of liquidity and cohesion. Its quality is taste (rasa). It governs blood, lymph, saliva, and all fluids. In the body, it is the flowing; in the mind, it is adaptability and emotional flow.", ["bhuta", "apa", "water"]),
  read("wisdom.bhuta.tejas", "Tejas — Fire", "The radiant principle — heat, light, sight, transformation",
    "Tejas (fire) is the principle of heat, light, and transformation. Its quality is form/color (rupa). It governs digestion, metabolism, body temperature, and the eyes. In the body, it is the fire that cooks; in the mind, it is clarity and discrimination.", ["bhuta", "tejas", "fire"]),
  read("wisdom.bhuta.vayu", "Vayu — Air", "The gaseous principle — movement, touch, breath",
    "Vayu (air) is the principle of movement and expansion. Its quality is touch (sparsha). It governs breath, circulation, nerve impulses, and all movement. In the body, it is the wind; in the mind, it is the movement of thoughts.", ["bhuta", "vayu", "air"]),
  read("wisdom.bhuta.akasha", "Akasha — Ether", "The spatial principle — space, sound, all-pervading",
    "Akasha (ether/space) is the principle of space and pervasiveness. Its quality is sound (shabda). It governs the cavities of the body, the channels, and the space within. In the body, it is the container; in the mind, it is the space of consciousness.", ["bhuta", "akasha", "ether"]),

  // ─── Teaching atoms ───
  teach("teach.bhuta.overview", "Pancha Bhuta — the five elements", "The building blocks of body, mind, and world",
    "The five elements (pancha bhuta) are the fundamental building blocks of all manifestation: prithvi (earth), apa (water), tejas (fire), vayu (air), akasha (ether). Each has a quality (tanmatra): smell, taste, form, touch, sound. Each governs specific body structures, sensory capacities, and mental qualities. The elements are not outside us — they are the very fabric of our body and mind. Balancing the elements balances the whole being.", 0),
  teach("teach.bhuta.tanmatra", "The five tanmatras — the subtle essences", "Smell, taste, form, touch, sound — the subtle roots of the elements",
    "Each element has its subtle essence (tanmatra): prithvi → gandha (smell), apa → rasa (taste), tejas → rupa (form), vayu → sparsha (touch), akasha → shabda (sound). The tanmatras are the bridge between the subtle and gross. By refining the senses, we trace the elements back to their source.", 1),
  teach("teach.bhuta.balance", "Balancing the elements", "When elements are in harmony, health and clarity arise",
    "Each person has a unique elemental constitution. Excess earth = heaviness, inertia. Excess water = emotional flooding, congestion. Excess fire = inflammation, anger. Excess air = anxiety, restlessness. Excess ether = spaciness, dissociation. Balancing: earth → movement, fire → cooling, air → grounding, water → warmth, ether → structure.", 1),
];