/**
 * NEED ENGINE — concept catalog
 * ─────────────────────────────
 * Six doors, deliberately ordered. Each entry carries the smallest honest
 * orientation: one teaching, one metaphor, one 60-second taste, one question,
 * one carry. Deeper content already lives in the ladders; this only decides
 * whether the user should meet the door at all.
 */

import type { ConceptDef, ConceptId } from "./types";

export const CONCEPT_IDS: ConceptId[] = [
  "observation",
  "self_inquiry",
  "neti_neti",
  "witness",
  "breath",
  "body",
];

export const CONCEPTS: Record<ConceptId, ConceptDef> = {
  observation: {
    id: "observation",
    label: "Observation",
    sanskrit: "Sakshi",
    practice: "observe",
    ladder: "observation",
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 5,
    trainMinutes: 20,
    teaching:
      "Observation means seeing what is actually happening — sensation, breath, thought — without changing it, fixing it, or commenting on it.",
    metaphor:
      "Think of a cinema. The film is your experience. The screen is you. Observation is noticing the screen while the film plays.",
    taste:
      "For one minute, notice three things in order: the weight of your body on the seat, the air on your skin, one breath at the nostrils. Do not change any of them.",
    question: "Which was easier to notice — the body, or the breath?",
    carry:
      "Once today, when you catch yourself lost in thought, say silently: 'thinking'. Then return to one breath.",
    loopCategories: ["mental", "attention", "narrative", "cognitive_bias"],
    dimensions: ["thought", "awareness"],
  },

  self_inquiry: {
    id: "self_inquiry",
    label: "Self-Inquiry",
    sanskrit: "Atma Vichara",
    practice: "inquiry",
    ladder: "self_inquiry",
    entryLevel: 1,
    prerequisites: [{ concept: "observation", minFamiliarity: 0.35 }],
    tasteMinutes: 8,
    trainMinutes: 20,
    teaching:
      "Self-inquiry turns attention from the answer to the one who asks. The question 'Who am I?' is not a quiz — it is a way of looking back at the looker.",
    metaphor:
      "A torch lights the wall. Inquiry stops staring at the wall and follows the beam back to the hand holding it.",
    taste:
      "Ask once, softly: 'Who am I?' Do not answer. Notice the direction attention turns when no answer is given.",
    question: "What happened when you did not answer the question?",
    carry:
      "Next time a strong emotion rises, ask once: 'To whom does this come?' Let the answer be 'to me' — then look at that me.",
    loopCategories: ["identity", "ego", "belief", "validation", "comparison"],
    dimensions: ["thought", "awareness"],
  },

  neti_neti: {
    id: "neti_neti",
    label: "Neti-Neti",
    sanskrit: "Neti Neti",
    practice: "jnana",
    ladder: "neti_neti",
    entryLevel: 1,
    prerequisites: [
      { concept: "observation", minFamiliarity: 0.45 },
      { concept: "self_inquiry", minFamiliarity: 0.3 },
    ],
    tasteMinutes: 10,
    trainMinutes: 20,
    teaching:
      "Neti-neti is the discipline of saying 'not this' to every false identity until only what cannot be denied remains. It is not denial — it is precise discrimination.",
    metaphor:
      "Peeling an onion of labels — body, emotion, thought — without putting a new label on what is left.",
    taste:
      "Say slowly: 'This body is known by me; I am not only this body.' Feel the small gap between the knower and the known.",
    question: "If you are not only the body, what is doing the knowing?",
    carry:
      "Once today, when you say 'I am tired' or 'I am angry', add silently: 'this is known by me.'",
    loopCategories: ["identity", "ego", "belief", "narrative"],
    dimensions: ["thought", "awareness"],
  },

  witness: {
    id: "witness",
    label: "Witnessing",
    sanskrit: "Drashta",
    practice: "witness",
    ladder: null,
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 6,
    trainMinutes: 18,
    teaching:
      "Witnessing is resting as the awareness that notices thoughts, feelings, and sensations without becoming any of them.",
    metaphor:
      "Weather moves through the sky. You are not the weather, and you are not doing the sky either — you are the space it appears in.",
    taste:
      "Sit for one minute. When a thought appears, label it quietly: 'thinking'. Do not follow it. Return to the next breath.",
    question: "What was watching the thoughts?",
    carry:
      "Three times today, pause for one breath and ask: 'What is aware right now?'",
    loopCategories: ["mental", "attention", "narrative"],
    dimensions: ["thought", "awareness"],
  },

  breath: {
    id: "breath",
    label: "Breath Awareness",
    sanskrit: "Pranayama",
    practice: "breath",
    ladder: null,
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 5,
    trainMinutes: 15,
    teaching:
      "Breath awareness is knowing the breath as it is, without changing it. The breath is the one place body and mind always meet.",
    metaphor:
      "Watch a sleeping animal. You do not wake it to check it is breathing. You simply stay near.",
    taste:
      "For one minute, feel the breath at the nostrils. Long or short, smooth or rough — all of it is allowed.",
    question: "Where did you feel the breath most clearly?",
    carry:
      "Once today, take three breaths without changing them, and notice one thing that shifted.",
    loopCategories: ["control", "survival", "energy", "anxiety"],
    dimensions: ["body", "awareness"],
  },

  body: {
    id: "body",
    label: "Body Sensing",
    sanskrit: "Kaya",
    practice: "body",
    ladder: null,
    entryLevel: 1,
    prerequisites: [],
    tasteMinutes: 7,
    trainMinutes: 18,
    teaching:
      "Body sensing is feeling the body as the body — weight, temperature, contact, vibration — instead of thinking about it.",
    metaphor:
      "The body is already here, already breathing, already touching the floor. The mind is somewhere else. Sensing is coming home.",
    taste:
      "Scan slowly from the crown to the feet. Name only what is actually felt: 'warm', 'tight', 'tingling', 'numb'.",
    question: "Which part of the body felt most awake?",
    carry:
      "Once today, put both feet on the floor and feel the contact for ten seconds.",
    loopCategories: ["body", "avoidance", "control", "survival"],
    dimensions: ["body", "emotion"],
  },
};

export function getConcept(id: ConceptId): ConceptDef {
  return CONCEPTS[id];
}
