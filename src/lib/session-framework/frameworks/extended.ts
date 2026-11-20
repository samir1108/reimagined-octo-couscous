// Extended Session Frameworks — additional families

import type { SessionFramework, FrameworkStep, AdaptationRule, CompletionCriteria } from "../types";

function fwStep(stepId: string, purpose: string, durationSeconds?: number, optional = false, interaction: FrameworkStep["interaction"] = "display"): FrameworkStep {
  return { id: `${stepId}-fw`, stepId, purpose, durationSeconds, interaction, optional, transitions: [{ condition: "always", nextStepId: "*" }] };
}

export const CREATIVE_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-creative-expression", name: "Creative Expression", family: "Creativity & Expression",
    purpose: "Express experience through creativity",
    suitableIntentions: ["creativity", "expression"],
    preferredDurations: [10, 20, 30],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("emotional_checkin", "How are you?", 30, true, "question"),
      fwStep("creative_canvas", "Create freely", 180, false, "creative-canvas"),
      fwStep("observe_creation", "Observe what emerged", 60, true, "guided-practice"),
      fwStep("insight_reflection", "What does it say?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const NATURE_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-nature-awareness", name: "Nature Awareness", family: "Nature Awareness",
    purpose: "Engage with natural surroundings",
    suitableIntentions: ["nature", "senses"],
    preferredDurations: [10, 20],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("sensory_awareness", "Engage senses", 90, false, "guided-practice"),
      fwStep("sound_listening", "Listen to nature", 120, false, "sound-listening"),
      fwStep("sky_gazing", "Gaze at sky", 90, true, "visual-contemplation"),
      fwStep("nature_to_self_inquiry", "Nature and self", 60, true, "inquiry"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const DREAM_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-dream-reflection", name: "Dream Reflection", family: "Dream Integration",
    purpose: "Reflect on dreams",
    suitableIntentions: ["dream", "memory"],
    preferredDurations: [10, 15],
    suitableGates: ["morning", "evening"],
    suitableEnergy: ["low", "medium"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("dream_recall", "Recall a dream", 90, false, "memory-recall"),
      fwStep("dream_emotion_mapping", "Map dream emotions", 60, true, "guided-practice"),
      fwStep("dream_to_life_association", "Associate to life", 90, true, "inquiry"),
      fwStep("insight_reflection", "What emerged?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const PURPOSE_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-purpose-exploration", name: "Purpose Exploration", family: "Purpose & Dharma",
    purpose: "Explore purpose and values",
    suitableIntentions: ["purpose", "values", "dharma"],
    preferredDurations: [15, 20, 30],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("values_reflection", "Reflect on values", 90, false, "reflection"),
      fwStep("strengths_investigation", "Investigate strengths", 90, true, "inquiry"),
      fwStep("future_self_contemplation", "Contemplate future self", 90, true, "visualization"),
      fwStep("values_to_action_mapping", "Map values to action", 90, true, "decision"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const DIGITAL_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-digital-reset", name: "Digital Reset", family: "Digital Awareness",
    purpose: "Observe digital habits",
    suitableIntentions: ["digital", "attention", "habit"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("device_urge_observation", "Observe device urge", 60, false, "guided-practice"),
      fwStep("attention_fragmentation_awareness", "Notice fragmentation", 60, true, "guided-practice"),
      fwStep("intentional_tech_use", "Set intention", 60, true, "decision"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const SLEEP_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-sleep-transition", name: "Sleep Transition", family: "Sleep & Rest",
    purpose: "Wind down for sleep",
    suitableIntentions: ["sleep", "rest", "relaxation"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["night"],
    suitableEnergy: ["low"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("evening_body_scan", "Body scan", 120, false, "guided-practice"),
      fwStep("gentle_breath_awareness", "Gentle breath", 90, false, "guided-practice"),
      fwStep("gratitude_before_sleep", "Gratitude", 60, true, "reflection"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const RESILIENCE_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-resilience-practice", name: "Resilience Practice", family: "Resilience",
    purpose: "Build flexible responses",
    suitableIntentions: ["resilience", "recovery"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("setback_integration", "Integrate a setback", 90, false, "reflection"),
      fwStep("self_compassion_practice", "Self-compassion", 90, true, "guided-practice"),
      fwStep("values_based_coping", "Cope from values", 90, true, "inquiry"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const KOSHA_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-five-koshas", name: "Five Koshas", family: "Five Koshas",
    purpose: "Explore five sheaths",
    suitableIntentions: ["koshas", "layers"],
    preferredDurations: [20, 30],
    suitableGates: ["morning", "evening"],
    suitableEnergy: ["medium"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("annamaya_kosha", "Physical sheath", 90, false, "guided-practice"),
      fwStep("pranamaya_kosha", "Energy sheath", 90, true, "guided-practice"),
      fwStep("manomaya_kosha", "Mental sheath", 90, true, "guided-practice"),
      fwStep("vijnanamaya_kosha", "Wisdom sheath", 90, true, "guided-practice"),
      fwStep("anandamaya_kosha", "Bliss sheath", 90, true, "guided-practice"),
      fwStep("five_kosha_integration", "Integrate", 60, true, "reflection"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

export const CHAKRA_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-chakra-contemplation", name: "Chakra Contemplation", family: "Chakra Contemplation",
    purpose: "Contemplate chakra symbolism",
    suitableIntentions: ["chakra", "symbolism"],
    preferredDurations: [15, 20, 30],
    suitableGates: ["morning", "evening"],
    suitableEnergy: ["medium"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("chakra_selection", "Select a chakra", 45, false, "choice"),
      fwStep("chakra_symbolism_contemplation", "Contemplate symbolism", 120, false, "guided-practice"),
      fwStep("chakra_journaling", "Journal", 90, true, "free-text-reflection"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const INTEGRATION_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-integration-embodiment", name: "Integration & Embodiment", family: "Integration & Embodiment",
    purpose: "Integrate insights into daily life",
    suitableIntentions: ["integration", "embodiment"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["morning", "evening"],
    suitableEnergy: ["medium"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("insight_capture", "Capture insight", 60, false, "text-input"),
      fwStep("action_commitment", "Commit to action", 45, false, "choice"),
      fwStep("daily_life_application", "Apply to daily life", 60, true, "reflection"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];



export const COMMUNICATION_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-communication-practice", name: "Communication Practice", family: "Communication",
    purpose: "Practice conscious communication",
    suitableIntentions: ["communication", "listening", "speaking"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["midday", "evening"],
    suitableEnergy: ["medium"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("active_listening", "Practice listening", 90, false, "guided-practice"),
      fwStep("pause_before_response", "Pause before responding", 60, true, "guided-practice"),
      fwStep("conscious_speaking", "Speak consciously", 90, true, "dialogue"),
      fwStep("repair_conversation_planning", "Plan repair", 60, true, "reflection"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

export const COGNITIVE_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-cognitive-awareness", name: "Cognitive Awareness", family: "Cognitive Awareness",
    purpose: "Explore assumptions and mental habits",
    suitableIntentions: ["cognitive", "assumptions", "beliefs"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("assumption_investigation", "Investigate assumptions", 90, false, "inquiry"),
      fwStep("belief_examination", "Examine beliefs", 90, true, "inquiry"),
      fwStep("perspective_shifting", "Shift perspective", 60, true, "guided-practice"),
      fwStep("insight_reflection", "What emerged?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];
export const ALL_EXTENDED_FRAMEWORKS: SessionFramework[] = [
  ...CREATIVE_FRAMEWORKS,
  ...NATURE_FRAMEWORKS,
  ...DREAM_FRAMEWORKS,
  ...PURPOSE_FRAMEWORKS,
  ...DIGITAL_FRAMEWORKS,
  ...SLEEP_FRAMEWORKS,
  ...RESILIENCE_FRAMEWORKS,
  ...KOSHA_FRAMEWORKS,
  ...CHAKRA_FRAMEWORKS,
  ...INTEGRATION_FRAMEWORKS,
    ...COMMUNICATION_FRAMEWORKS,
  ...COGNITIVE_FRAMEWORKS,
];



