// Session Framework Registry — Core Frameworks
// 30 core frameworks from the 300-framework blueprint.
// Organized by family. Each is a complete session blueprint.

import type { SessionFramework, FrameworkStep, AdaptationRule, CompletionCriteria } from "../types";

// ─── Helper to build framework steps ───
function fwStep(stepId: string, purpose: string, durationSeconds?: number, optional = false, interaction: FrameworkStep["interaction"] = "display"): FrameworkStep {
  return {
    id: `${stepId}-fw`,
    stepId,
    purpose,
    durationSeconds,
    interaction,
    optional,
    transitions: [{ condition: "always", nextStepId: "*" }],
  };
}

// ─── Family 01: Awareness & Witnessing ───

export const AWARENESS_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-pure-witness", name: "Pure Witness", family: "Awareness & Witnessing",
    purpose: "Observe experience directly without reacting",
    suitableIntentions: ["observe", "witness", "awareness"],
    preferredDurations: [5, 10, 20],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Begin with silence", 30, false, "silence"),
      fwStep("natural_breath_observation", "Observe natural breath", 60, false, "guided-practice"),
      fwStep("observe_thoughts", "Notice thoughts without following", 90, false, "guided-practice"),
      fwStep("open_awareness_period", "Widen to include everything", 120, false, "guided-practice"),
      fwStep("open_ended_question", "What are you noticing?", 60, true, "question"),
      fwStep("guided_silence", "Rest in silence", 90, false, "silence"),
      fwStep("insight_reflection", "What did you notice?", 60, true, "text-input"),
      fwStep("session_completion", "Close the session", 30, false, "display"),
    ],
    adaptationRules: [
      { id: "ar-simplify", trigger: "user-struggling", condition: "response_time > 30", action: "simplify", priority: 1 },
      { id: "ar-deepen", trigger: "user-engaged", condition: "response_quality > 0.7", action: "deepen", priority: 2 },
    ],
    completionCriteria: { minStepsCompleted: 4, requiredSteps: ["opening_silence", "session_completion"], userConfirmRequired: false },
  },
  {
    id: "fw-thought-witness", name: "Thought Witness", family: "Awareness & Witnessing",
    purpose: "Notice and observe thoughts without interference",
    suitableIntentions: ["observe thoughts", "mental clarity"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("transition_into_session", "Arrive", 15, false, "display"),
      fwStep("natural_breath_observation", "Settle with breath", 60, false, "guided-practice"),
      fwStep("observe_thoughts", "Notice thoughts arising", 90, false, "guided-practice"),
      fwStep("observe_without_following", "Watch without chasing", 60, false, "guided-practice"),
      fwStep("thought_observation_question", "What thoughts are present?", 45, true, "question"),
      fwStep("guided_silence", "Rest in awareness", 90, false, "silence"),
      fwStep("insight_reflection", "What did you notice?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [{ id: "ar-ground", trigger: "overwhelm", action: "ground", priority: 1 }],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
  {
    id: "fw-body-witness", name: "Body Witness", family: "Awareness & Witnessing",
    purpose: "Observe bodily sensations with awareness",
    suitableIntentions: ["body awareness", "somatic"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Begin", 20, false, "silence"),
      fwStep("body_state_checkin", "How does the body feel?", 30, true, "question"),
      fwStep("body_scan_guidance", "Scan from crown to feet", 120, false, "guided-practice"),
      fwStep("observe_sensations", "Notice without fixing", 90, false, "guided-practice"),
      fwStep("body_sensation_question", "What sensations are present?", 45, true, "question"),
      fwStep("guided_silence", "Rest", 60, false, "silence"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
  {
    id: "fw-breath-witness", name: "Breath Witness", family: "Awareness & Witnessing",
    purpose: "Observe the natural breath with sustained attention",
    suitableIntentions: ["breath awareness", "calm"],
    preferredDurations: [3, 5, 10],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Begin", 20, false, "silence"),
      fwStep("natural_breath_observation", "Notice the breath", 60, false, "guided-practice"),
      fwStep("breath_rhythm_observation", "Observe the rhythm", 60, false, "guided-practice"),
      fwStep("breath_transition_observation", "Notice transitions", 60, false, "guided-practice"),
      fwStep("guided_silence", "Rest with breath", 90, false, "silence"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
  {
    id: "fw-sensory-awareness", name: "Sensory Awareness", family: "Awareness & Witnessing",
    purpose: "Explore all five senses with open awareness",
    suitableIntentions: ["sensory awareness", "grounding"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("transition_into_session", "Arrive", 15, false, "display"),
      fwStep("grounding_guidance", "Ground in surroundings", 30, false, "guided-practice"),
      fwStep("observe_sensory_input", "Explore each sense", 120, false, "guided-practice"),
      fwStep("observe_environment", "Notice the environment", 60, false, "guided-practice"),
      fwStep("open_ended_question", "What do you notice?", 45, true, "question"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

// ─── Family 02: Self-Inquiry & Identity ───

export const INQUIRY_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-who-am-i", name: "Who Am I?", family: "Self-Inquiry & Identity",
    purpose: "Investigate the nature of self through direct inquiry",
    suitableIntentions: ["self-inquiry", "identity", "who am I"],
    preferredDurations: [10, 20, 40],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 30, false, "silence"),
      fwStep("natural_breath_observation", "Anchor with breath", 60, false, "guided-practice"),
      fwStep("who_am_i_inquiry", "Who is aware?", 90, false, "guided-practice"),
      fwStep("self_inquiry_question", "Who am I?", 60, true, "question"),
      fwStep("guided_silence", "Rest in the question", 120, false, "silence"),
      fwStep("followup_question", "What did you find?", 60, true, "question"),
      fwStep("insight_reflection", "Capture what arose", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [
      { id: "ar-simplify", trigger: "confusion", action: "simplify", priority: 1 },
      { id: "ar-pause", trigger: "overwhelm", action: "pause", priority: 1 },
    ],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
  {
    id: "fw-neti-neti", name: "Neti Neti Journey", family: "Self-Inquiry & Identity",
    purpose: "Investigate identity through negation — not this, not that",
    suitableIntentions: ["neti neti", "identity deconstruction"],
    preferredDurations: [15, 20, 30],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 30, false, "silence"),
      fwStep("body_state_checkin", "Notice the body", 30, true, "question"),
      fwStep("neti_neti_inquiry", "Not this, not that", 120, false, "guided-practice"),
      fwStep("identity_investigation", "What am I not?", 90, false, "guided-practice"),
      fwStep("guided_silence", "Rest", 90, false, "silence"),
      fwStep("insight_reflection", "What remains?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
  {
    id: "fw-thinker-inquiry", name: "The Thinker Inquiry", family: "Self-Inquiry & Identity",
    purpose: "Investigate who is thinking",
    suitableIntentions: ["thought inquiry", "self-inquiry"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 30, false, "silence"),
      fwStep("observe_thoughts", "Notice thoughts", 60, false, "guided-practice"),
      fwStep("who_is_thinking_inquiry", "Who is thinking?", 90, false, "guided-practice"),
      fwStep("guided_silence", "Rest in inquiry", 120, false, "silence"),
      fwStep("insight_reflection", "What arose?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

// ─── Family 03: Focus & Attention ───

export const FOCUS_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-single-pointed-focus", name: "Single-Pointed Focus", family: "Focus & Attention Training",
    purpose: "Train sustained attention on a single anchor",
    suitableIntentions: ["focus", "concentration", "attention"],
    preferredDurations: [5, 10, 20],
    suitableGates: ["morning", "midday"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("intention_selection", "Set intention", 20, true, "choice"),
      fwStep("natural_breath_observation", "Choose anchor", 30, false, "guided-practice"),
      fwStep("observe_attention", "Focus on anchor", 120, false, "guided-practice"),
      fwStep("observe_distraction", "Notice distraction", 30, false, "guided-practice"),
      fwStep("attention_return", "Return to anchor", 30, false, "guided-practice"),
      fwStep("reflection_instruction", "How was the focus?", 45, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [{ id: "ar-simplify", trigger: "distraction-heavy", action: "simplify", priority: 1 }],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
  {
    id: "fw-distraction-recovery", name: "Distraction Recovery", family: "Focus & Attention Training",
    purpose: "Practice recognizing and recovering from distraction",
    suitableIntentions: ["distraction recovery", "attention training"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 20, false, "silence"),
      fwStep("natural_breath_observation", "Anchor", 30, false, "guided-practice"),
      fwStep("observe_attention", "Focus", 60, false, "guided-practice"),
      fwStep("observe_distraction", "Notice when mind wanders", 30, false, "guided-practice"),
      fwStep("attention_return", "Return gently", 30, false, "guided-practice"),
      fwStep("repeat_instruction", "Repeat cycle", 60, false, "guided-practice"),
      fwStep("reflection_instruction", "What did you notice?", 45, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

// ─── Family 04: Breath & Regulation ───

export const BREATH_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-natural-breath-journey", name: "Natural Breath Journey", family: "Breath & Regulation",
    purpose: "Observe and follow the natural breath",
    suitableIntentions: ["breath awareness", "calm", "settling"],
    preferredDurations: [3, 5, 10],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Begin", 20, false, "silence"),
      fwStep("natural_breath_observation", "Notice natural breath", 60, false, "guided-practice"),
      fwStep("breath_rhythm_observation", "Observe rhythm", 60, false, "guided-practice"),
      fwStep("breath_transition_observation", "Notice transitions", 60, false, "guided-practice"),
      fwStep("guided_silence", "Rest with breath", 90, false, "silence"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
  {
    id: "fw-breath-to-silence", name: "Breath-to-Silence", family: "Breath & Regulation",
    purpose: "Follow breath into silence",
    suitableIntentions: ["breath", "silence", "deepening"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "evening", "night"],
    suitableEnergy: ["low", "medium"],
    steps: [
      fwStep("opening_silence", "Begin", 20, false, "silence"),
      fwStep("natural_breath_observation", "Follow breath", 60, false, "guided-practice"),
      fwStep("breath_awareness_pause", "Pause with breath", 30, false, "silence"),
      fwStep("guided_silence", "Breath fades into silence", 120, false, "silence"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

// ─── Family 05: Somatic & Embodied ───

export const SOMATIC_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-full-body-arrival", name: "Full-Body Arrival", family: "Somatic & Embodied Awareness",
    purpose: "Arrive in the body through full-body scanning",
    suitableIntentions: ["body awareness", "grounding", "arrival"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Begin", 20, false, "silence"),
      fwStep("body_state_checkin", "How does the body feel?", 30, true, "question"),
      fwStep("body_scan_guidance", "Scan from crown to feet", 120, false, "guided-practice"),
      fwStep("observe_sensations", "Notice without fixing", 90, false, "guided-practice"),
      fwStep("body_sensation_question", "What sensations are present?", 45, true, "question"),
      fwStep("guided_silence", "Rest in the body", 60, false, "silence"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

// ─── Family 06: Thought & Cognitive ───

export const THOUGHT_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-thought-stream-mapping", name: "Thought Stream Mapping", family: "Thought & Cognitive Patterns",
    purpose: "Observe and categorize thought patterns",
    suitableIntentions: ["thought observation", "mental clarity", "pattern recognition"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 20, false, "silence"),
      fwStep("natural_breath_observation", "Anchor", 30, false, "guided-practice"),
      fwStep("observe_thoughts", "Notice thoughts", 60, false, "guided-practice"),
      fwStep("thought_labeling", "Label thought types", 60, false, "guided-practice"),
      fwStep("thought_observation_question", "What thoughts are present?", 45, true, "question"),
      fwStep("insight_reflection", "What patterns did you notice?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

// ─── Family 07: Emotional Awareness ───

export const EMOTIONAL_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-emotion-discovery", name: "Emotion Discovery", family: "Emotional Awareness",
    purpose: "Identify and explore current emotions",
    suitableIntentions: ["emotion awareness", "emotional intelligence"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("emotional_checkin", "How do you feel?", 30, true, "question"),
      fwStep("emotion_naming", "Name the emotion", 30, true, "question"),
      fwStep("emotion_location_identification", "Where in the body?", 45, true, "question"),
      fwStep("emotion_without_story_observation", "Feel without story", 90, false, "guided-practice"),
      fwStep("self_compassion_prompt", "Offer yourself kindness", 45, true, "guided-practice"),
      fwStep("emotion_integration_reflection", "What did you learn?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [{ id: "ar-ground", trigger: "intensity-high", action: "ground", priority: 1 }],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

// ─── Family 08: Shadow & Recurring Loops ───

export const SHADOW_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-loop-excavation", name: "Loop Excavation", family: "Shadow & Recurring Loops",
    purpose: "Investigate a recurring behavioral pattern",
    suitableIntentions: ["pattern investigation", "shadow work", "loop excavation"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 20, false, "silence"),
      fwStep("loop_identification", "Identify the pattern", 45, true, "question"),
      fwStep("trigger_identification", "What triggers it?", 45, true, "question"),
      fwStep("reaction_chain_reconstruction", "Map the response", 60, true, "question"),
      fwStep("underlying_need_exploration", "What need is underneath?", 60, true, "question"),
      fwStep("alternative_response_generation", "What else could you do?", 45, true, "question"),
      fwStep("loop_review_commitment", "Choose an experiment", 45, true, "choice"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [{ id: "ar-ground", trigger: "distress", action: "ground", priority: 1 }],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

// ─── Family 09: Yogic Wisdom ───

export const WISDOM_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-yoga-sutra-contemplation", name: "Yoga Sutra Contemplation", family: "Yogic Wisdom & Philosophy",
    purpose: "Contemplate a Yoga Sutra and connect to experience",
    suitableIntentions: ["wisdom", "philosophy", "contemplation"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 20, false, "silence"),
      fwStep("scripture_selection", "Select a sutra", 15, true, "choice"),
      fwStep("scripture_passage_display", "Read the passage", 30, false, "display"),
      fwStep("passage_plain_language_explanation", "Explain simply", 45, false, "display"),
      fwStep("personal_relevance_question", "How does this relate to you?", 60, true, "question"),
      fwStep("teaching_silence", "Sit with the teaching", 90, false, "silence"),
      fwStep("teaching_journal_entry", "Capture insight", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

// ─── Family 10: Mantra, Japa & Sound ───

export const MANTRA_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-japa-journey", name: "Japa Journey", family: "Mantra, Japa & Sound",
    purpose: "Practice mantra repetition with awareness",
    suitableIntentions: ["mantra", "japa", "sound", "devotion"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 20, false, "silence"),
      fwStep("mantra_selection", "Choose a mantra", 15, true, "choice"),
      fwStep("mantra_meaning_explanation", "Understand the meaning", 30, false, "display"),
      fwStep("mental_mantra_guidance", "Repeat silently", 120, false, "guided-practice"),
      fwStep("mantra_attention_check", "Notice wandering", 30, false, "guided-practice"),
      fwStep("silence_after_mantra", "Rest in silence", 60, false, "silence"),
      fwStep("mantra_meaning_reflection", "What arose?", 45, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

// ─── Family 11: Four Yogic Paths ───

export const YOGIC_PATH_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-raja-yoga-journey", name: "Raja Yoga Journey", family: "Four Yogic Paths",
    purpose: "Classical yoga: attention, meditation, discipline",
    suitableIntentions: ["raja yoga", "meditation", "discipline"],
    preferredDurations: [15, 20, 30],
    suitableGates: ["morning", "midday"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 30, false, "silence"),
      fwStep("natural_breath_observation", "Pranayama", 60, false, "guided-practice"),
      fwStep("observe_attention", "Dharana - concentration", 120, false, "guided-practice"),
      fwStep("guided_silence", "Dhyana - meditation", 180, false, "silence"),
      fwStep("insight_reflection", "What did you notice?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
  {
    id: "fw-jnana-yoga-journey", name: "Jnana Yoga Journey", family: "Four Yogic Paths",
    purpose: "Discrimination, inquiry, and wisdom",
    suitableIntentions: ["jnana yoga", "inquiry", "wisdom"],
    preferredDurations: [15, 20, 30],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 30, false, "silence"),
      fwStep("who_am_i_inquiry", "Who am I?", 90, false, "guided-practice"),
      fwStep("viveka_contemplation", "Discriminate real from unreal", 90, false, "guided-practice"),
      fwStep("guided_silence", "Rest in inquiry", 120, false, "silence"),
      fwStep("insight_reflection", "What arose?", 60, true, "text-input"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

// ─── Family 14: Relationships ───

export const RELATIONSHIP_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-relationship-mirror", name: "Relationship Mirror", family: "Relationships & Social Awareness",
    purpose: "Reflect on an interpersonal situation",
    suitableIntentions: ["relationship", "conflict", "communication"],
    preferredDurations: [10, 15, 20],
    suitableGates: ["midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 20, false, "silence"),
      fwStep("relationship_question", "What situation?", 45, true, "question"),
      fwStep("perspective_question", "How do you see it?", 45, true, "question"),
      fwStep("emotion_question", "What emotion arises?", 30, true, "question"),
      fwStep("perspective_broadening", "Consider their view", 60, true, "guided-practice"),
      fwStep("conscious_communication_plan", "How will you respond?", 45, true, "choice"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 4, userConfirmRequired: false },
  },
];

// ─── Family 15: Karma & Action ───

export const KARMA_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-one-conscious-act", name: "One Conscious Act", family: "Karma, Action & Real-World Missions",
    purpose: "Choose and commit to one conscious action",
    suitableIntentions: ["action", "karma", "commitment"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning", "midday"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("intention_selection", "What matters today?", 30, true, "choice"),
      fwStep("action_question", "What one action?", 45, true, "question"),
      fwStep("smallest_next_step_selection", "What's the smallest step?", 30, true, "choice"),
      fwStep("commitment_selection", "Commit", 20, true, "choice"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: true },
  },
];

// ─── Family 20: Morning/Evening ───

export const RHYTHM_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-morning-awakening", name: "Morning Awakening", family: "Morning, Evening & Daily Rhythm",
    purpose: "Start the day with intention and presence",
    suitableIntentions: ["morning", "intention", "awakening"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["morning"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Arrive", 20, false, "silence"),
      fwStep("body_state_checkin", "How does the body feel?", 20, true, "question"),
      fwStep("energy_checkin", "Energy level?", 15, true, "choice"),
      fwStep("intention_selection", "Set today's intention", 30, true, "choice"),
      fwStep("natural_breath_observation", "Three conscious breaths", 30, false, "guided-practice"),
      fwStep("session_completion", "Close", 20, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
  {
    id: "fw-evening-review", name: "Evening Review", family: "Morning, Evening & Daily Rhythm",
    purpose: "Review the day with awareness and integration",
    suitableIntentions: ["evening", "review", "integration"],
    preferredDurations: [5, 10, 15],
    suitableGates: ["evening", "night"],
    suitableEnergy: ["low", "medium"],
    steps: [
      fwStep("opening_silence", "Settle", 20, false, "silence"),
      fwStep("evening_reflection", "How was the day?", 45, true, "text-input"),
      fwStep("pattern_reflection", "What pattern did you see?", 45, true, "text-input"),
      fwStep("gratitude_capture", "One gratitude", 30, true, "text-input"),
      fwStep("intention_selection", "Tomorrow's intention", 20, true, "choice"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 3, userConfirmRequired: false },
  },
];

// ─── Family 27: Micro & Short ───

export const MICRO_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-30-second-arrival", name: "30-Second Arrival", family: "Short, Micro & Interruptible Sessions",
    purpose: "Quick arrival and presence reset",
    suitableIntentions: ["micro", "quick", "reset"],
    preferredDurations: [1],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Pause", 10, false, "silence"),
      fwStep("natural_breath_observation", "One breath", 10, false, "guided-practice"),
      fwStep("observe_environment", "Notice surroundings", 10, false, "guided-practice"),
      fwStep("session_completion", "Return", 5, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 2, userConfirmRequired: false },
  },
  {
    id: "fw-one-minute-witness", name: "One-Minute Witness", family: "Short, Micro & Interruptible Sessions",
    purpose: "Brief witness observation",
    suitableIntentions: ["micro", "witness", "quick"],
    preferredDurations: [1],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 10, false, "silence"),
      fwStep("observe_thoughts", "Watch thoughts", 30, false, "guided-practice"),
      fwStep("guided_silence", "Rest", 15, false, "silence"),
      fwStep("session_completion", "Close", 5, false, "display"),
    ],
    adaptationRules: [],
    completionCriteria: { minStepsCompleted: 2, userConfirmRequired: false },
  },
];

// ─── Family 28: Advanced Multi-Stage ───

export const ADVANCED_FRAMEWORKS: SessionFramework[] = [
  {
    id: "fw-observe-inquire-integrate", name: "Observe-Inquire-Integrate", family: "Advanced Multi-Stage Frameworks",
    purpose: "Full journey: observe, inquire, and integrate",
    suitableIntentions: ["deep", "comprehensive", "full journey"],
    preferredDurations: [15, 20, 30],
    suitableGates: ["morning", "midday", "evening"],
    suitableEnergy: ["medium", "high"],
    steps: [
      fwStep("opening_silence", "Settle", 30, false, "silence"),
      fwStep("natural_breath_observation", "Anchor", 60, false, "guided-practice"),
      fwStep("observe_thoughts", "Observe", 90, false, "guided-practice"),
      fwStep("self_inquiry_question", "Inquire", 60, true, "question"),
      fwStep("guided_silence", "Rest", 90, false, "silence"),
      fwStep("insight_reflection", "Integrate", 60, true, "text-input"),
      fwStep("real_world_mission_selection", "Choose an action", 45, true, "choice"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [
      { id: "ar-simplify", trigger: "struggling", action: "simplify", priority: 1 },
      { id: "ar-deepen", trigger: "engaged", action: "deepen", priority: 2 },
    ],
    completionCriteria: { minStepsCompleted: 5, userConfirmRequired: false },
  },
  {
    id: "fw-consciousos-signature", name: "ConsciousOS Signature Journey", family: "Advanced Multi-Stage Frameworks",
    purpose: "The signature ConsciousOS experience: personalized end-to-end",
    suitableIntentions: ["signature", "full", "personalized"],
    preferredDurations: [10, 15, 20, 30],
    suitableGates: ["morning", "midday", "evening", "night"],
    suitableEnergy: ["low", "medium", "high"],
    steps: [
      fwStep("contextual_opening", "Personalized opening", 20, false, "display"),
      fwStep("intention_selection", "What's alive?", 30, true, "choice"),
      fwStep("natural_breath_observation", "Settle", 45, false, "guided-practice"),
      fwStep("observe_thoughts", "Observe", 60, false, "guided-practice"),
      fwStep("self_inquiry_question", "Inquire", 45, true, "question"),
      fwStep("guided_silence", "Rest", 90, false, "silence"),
      fwStep("insight_reflection", "What arose?", 60, true, "text-input"),
      fwStep("real_world_mission_selection", "Choose an action", 45, true, "choice"),
      fwStep("session_completion", "Close", 30, false, "display"),
    ],
    adaptationRules: [
      { id: "ar-simplify", trigger: "struggling", action: "simplify", priority: 1 },
      { id: "ar-deepen", trigger: "engaged", action: "deepen", priority: 2 },
      { id: "ar-ground", trigger: "distress", action: "ground", priority: 1 },
    ],
    completionCriteria: { minStepsCompleted: 5, userConfirmRequired: false },
  },
];

// ─── All frameworks aggregated ───

export const ALL_FRAMEWORKS: SessionFramework[] = [
  ...AWARENESS_FRAMEWORKS,
  ...INQUIRY_FRAMEWORKS,
  ...FOCUS_FRAMEWORKS,
  ...BREATH_FRAMEWORKS,
  ...SOMATIC_FRAMEWORKS,
  ...THOUGHT_FRAMEWORKS,
  ...EMOTIONAL_FRAMEWORKS,
  ...SHADOW_FRAMEWORKS,
  ...WISDOM_FRAMEWORKS,
  ...MANTRA_FRAMEWORKS,
  ...YOGIC_PATH_FRAMEWORKS,
  ...RELATIONSHIP_FRAMEWORKS,
  ...KARMA_FRAMEWORKS,
  ...RHYTHM_FRAMEWORKS,
  ...MICRO_FRAMEWORKS,
  ...ADVANCED_FRAMEWORKS,
];
