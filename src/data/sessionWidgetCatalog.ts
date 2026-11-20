// Catalog of interactive session widgets (UI elements used inside session steps).
// Source: src/components/guide/widgets/types.ts (WidgetKind union) + session step catalog.

export type SessionWidgetId =
  | "witness_timer"
  | "breath_orb"
  | "self_inquiry"
  | "journal"
  | "micro_act"
  | "reflection_card"
  | "body_scan"
  | "gratitude"
  | "loving_kindness"
  | "forgiveness"
  | "movement"
  | "walking"
  | "yoga_asana"
  | "sound_bath"
  | "mantra"
  | "visualization"
  | "scripture"
  | "affirmation"
  | "contemplation"
  | "noticing"
  | "stretching"
  | "tai_chi"
  | "balance"
  | "free_write"
  | "plan";

export interface SessionWidgetDefinition {
  id: SessionWidgetId;
  title: string;
  description: string;
  /** Step keys from sessionStepCatalog that this widget naturally serves. */
  relatedStepKeys: string[];
}

export const SESSION_WIDGET_CATALOG: SessionWidgetDefinition[] = [
  { id: "witness_timer", title: "Witness Timer", description: "Timed silent witnessing practice.", relatedStepKeys: ["witness_perspective", "sustained_attention", "silence_entry", "guided_silence"] },
  { id: "breath_orb", title: "Breath Orb", description: "Visual breathing pacer (orb).", relatedStepKeys: ["breath_attention", "paced_breathing", "extended_exhalation", "natural_breathing", "breath_counting", "breath_body_sync", "breath_synchronized_japa"] },
  { id: "self_inquiry", title: "Self-Inquiry", description: "Single-question contemplation widget.", relatedStepKeys: ["identity_inquiry", "who_am_i_inquiry", "thought_owner_inquiry", "emotion_owner_inquiry", "desire_inquiry", "fear_inquiry", "belief_inquiry", "assumption_inquiry", "control_inquiry", "attachment_inquiry", "impermanence_inquiry", "awareness_inquiry"] },
  { id: "journal", title: "Journal", description: "Free-text journaling with min length.", relatedStepKeys: ["journal_prompt", "insight_capture", "experience_recall", "uncertainty_capture", "session_rating"] },
  { id: "micro_act", title: "Micro-Act", description: "One small real-world action.", relatedStepKeys: ["micro_commitment", "integration_action", "real_world_action_selection", "behavioral_commitment"] },
  { id: "reflection_card", title: "Reflection Card", description: "Guide-produced summary reflection.", relatedStepKeys: ["session_recap", "learning_summary", "intention_revisit"] },
  { id: "body_scan", title: "Body Scan", description: "Guided region-by-region body scan.", relatedStepKeys: ["physical_body_scan", "relaxation_scan", "interoception", "sensation_observation"] },
  { id: "gratitude", title: "Gratitude", description: "Name N things appreciated.", relatedStepKeys: ["gratitude_reflection", "gratitude_close"] },
  { id: "loving_kindness", title: "Loving-Kindness", description: "Phased metta practice.", relatedStepKeys: ["self_compassion", "emotion_allowing"] },
  { id: "forgiveness", title: "Forgiveness", description: "Multi-step forgiveness reflection.", relatedStepKeys: ["forgiveness_reflection"] },
  { id: "movement", title: "Movement", description: "Guided movement sequence.", relatedStepKeys: ["movement_awareness", "posture_setup"] },
  { id: "walking", title: "Walking", description: "Mindful walking practice.", relatedStepKeys: ["movement_awareness", "grounding", "sensory_orientation"] },
  { id: "yoga_asana", title: "Yoga Asana", description: "Pose with sides and instructions.", relatedStepKeys: ["posture_setup", "movement_awareness", "stillness_awareness"] },
  { id: "sound_bath", title: "Sound Bath", description: "Ambient sound practice.", relatedStepKeys: ["sound_attention", "sound_space_awareness", "sensory_settling"] },
  { id: "mantra", title: "Mantra", description: "Repetition counter for japa.", relatedStepKeys: ["mental_japa", "spoken_japa", "breath_synchronized_japa", "mantra_counting", "mantra_listening", "mantra_introduction"] },
  { id: "visualization", title: "Visualization", description: "Progressive scene visualization.", relatedStepKeys: ["guided_visualization", "future_self_reflection", "obstacle_visualization", "mental_rehearsal", "guided_imagination"] },
  { id: "scripture", title: "Scripture", description: "Progressive text reveal.", relatedStepKeys: ["sutra_reflection", "wisdom_teaching", "scripture"] },
  { id: "affirmation", title: "Affirmation", description: "Repeated affirmation.", relatedStepKeys: ["affirmation", "personalized_invocation"] },
  { id: "contemplation", title: "Contemplation", description: "Sit-with-a-question timer.", relatedStepKeys: ["teaching_contemplation", "paradox_inquiry", "metaphor_reflection", "perspective_reframing", "meaning_contemplation"] },
  { id: "noticing", title: "Noticing", description: "Targeted noticing practice.", relatedStepKeys: ["thought_observation", "emotion_observation", "impulse_observation", "inner_dialogue_observation", "mental_image_observation", "reaction_observation", "pattern_observation", "nonjudgmental_noticing", "open_monitoring"] },
  { id: "stretching", title: "Stretching", description: "Stretch sequence.", relatedStepKeys: ["posture_awareness", "movement_awareness", "relaxation_scan"] },
  { id: "tai_chi", title: "Tai Chi", description: "Phased tai chi movement.", relatedStepKeys: ["movement_awareness", "stillness_awareness", "grounding"] },
  { id: "balance", title: "Balance", description: "Balance pose practice.", relatedStepKeys: ["posture_awareness", "grounding", "body_boundary_inquiry"] },
  { id: "free_write", title: "Free Write", description: "Timed free writing.", relatedStepKeys: ["free_write", "voice_reflection", "journal_prompt"] },
  { id: "plan", title: "Plan", description: "Structured if-then planning.", relatedStepKeys: ["if_then_planning", "obstacle_forecasting", "commitment_rehearsal", "alternative_response_design", "environment_design"] },
];

export const SESSION_WIDGET_BY_ID: Record<string, SessionWidgetDefinition> = Object.fromEntries(
  SESSION_WIDGET_CATALOG.map((w) => [w.id, w])
);

export const SESSION_WIDGET_COUNT = SESSION_WIDGET_CATALOG.length;
