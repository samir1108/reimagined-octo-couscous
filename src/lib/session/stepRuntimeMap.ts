// Bridges the high-level session step catalog (src/data/sessionStepCatalog.ts)
// to the runtime StepKind + WidgetKind the session shell actually renders.
// Category defaults are applied; per-step overrides refine where needed.

import type { StepKind } from "@/lib/session-shell/types";
import type { WidgetKind } from "@/components/guide/widgets/types";
import { SESSION_STEP_CATALOG, type SessionStepCategoryId } from "@/data/sessionStepCatalog";
import { SESSION_WIDGET_CATALOG } from "@/data/sessionWidgetCatalog";

export interface StepRuntimeBinding {
  kind: StepKind;
  widget?: WidgetKind;
  minutes: number;
}

const CATEGORY_DEFAULT_KIND: Record<SessionStepCategoryId, StepKind> = {
  opening_preparation: "reflection",
  attention_concentration: "noticing",
  observation_witnessing: "noticing",
  self_inquiry: "contemplation",
  breath_regulation: "breathwork",
  body_awareness: "body_scan",
  emotion_shadow: "journal",
  karma_habits: "reflection",
  wisdom_knowledge: "wisdom-read",
  jap_mantra: "mantra",
  intention_willpower: "plan",
  relationships_life: "reflection",
  creativity_visualization: "visualization",
  silence_open_awareness: "silent_sit",
  reflection_journaling: "journal",
  session_closing: "reflection",
};

const CATEGORY_DEFAULT_MINUTES: Record<SessionStepCategoryId, number> = {
  opening_preparation: 2,
  attention_concentration: 3,
  observation_witnessing: 3,
  self_inquiry: 4,
  breath_regulation: 3,
  body_awareness: 4,
  emotion_shadow: 4,
  karma_habits: 3,
  wisdom_knowledge: 3,
  jap_mantra: 4,
  intention_willpower: 3,
  relationships_life: 4,
  creativity_visualization: 4,
  silence_open_awareness: 5,
  reflection_journaling: 3,
  session_closing: 2,
};

// Per-step refinements (key -> partial binding).
const STEP_OVERRIDES: Record<string, Partial<StepRuntimeBinding>> = {
  welcome: { kind: "reflection", minutes: 1 },
  intention_setting: { kind: "reflection", widget: "journal" },
  state_check: { kind: "reflection" },
  energy_check: { kind: "reflection" },
  readiness_check: { kind: "reflection" },
  environment_setup: { kind: "reflection" },
  posture_setup: { kind: "movement", widget: "movement" },
  sensory_settling: { kind: "noticing", widget: "noticing" },
  session_preview: { kind: "reflection" },
  personalized_invocation: { kind: "affirmation", widget: "affirmation" },
  silence_entry: { kind: "silent_sit", widget: "witness_timer" },
  attention_anchoring: { kind: "witness", widget: "witness_timer" },
  single_point_focus: { kind: "witness", widget: "witness_timer" },
  breath_attention: { kind: "breathwork", widget: "breath_orb" },
  sound_attention: { kind: "noticing", widget: "sound_bath" },
  visual_attention: { kind: "witness", widget: "witness_timer" },
  body_point_focus: { kind: "body_scan", widget: "body_scan" },
  attention_counting: { kind: "breathwork", widget: "breath_orb" },
  distraction_detection: { kind: "noticing", widget: "noticing" },
  attention_return: { kind: "witness", widget: "witness_timer" },
  sustained_attention: { kind: "witness", widget: "witness_timer" },
  attention_switching: { kind: "noticing" },
  open_attention: { kind: "noticing", widget: "noticing" },
  thought_observation: { kind: "noticing", widget: "noticing" },
  emotion_observation: { kind: "noticing", widget: "noticing" },
  sensation_observation: { kind: "body_scan", widget: "body_scan" },
  impulse_observation: { kind: "noticing", widget: "noticing" },
  inner_dialogue_observation: { kind: "noticing", widget: "noticing" },
  mental_image_observation: { kind: "noticing", widget: "noticing" },
  reaction_observation: { kind: "noticing", widget: "noticing" },
  pattern_observation: { kind: "noticing", widget: "noticing" },
  witness_perspective: { kind: "witness", widget: "witness_timer" },
  observer_observed_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  spacious_awareness: { kind: "silent_sit", widget: "witness_timer" },
  silence_observation: { kind: "silent_sit", widget: "witness_timer" },
  identity_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  who_am_i_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  thought_owner_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  emotion_owner_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  desire_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  fear_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  belief_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  assumption_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  control_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  attachment_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  impermanence_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  awareness_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  natural_breathing: { kind: "breathwork", widget: "breath_orb" },
  paced_breathing: { kind: "breathwork", widget: "breath_orb" },
  extended_exhalation: { kind: "breathwork", widget: "breath_orb" },
  breath_counting: { kind: "breathwork", widget: "breath_orb" },
  breath_body_sync: { kind: "breathwork", widget: "breath_orb" },
  breath_transition: { kind: "breathwork", widget: "breath_orb" },
  relaxation_scan: { kind: "body_scan", widget: "body_scan" },
  grounding: { kind: "reflection", widget: "balance" },
  sensory_orientation: { kind: "noticing", widget: "noticing" },
  settling_pause: { kind: "silent_sit", widget: "witness_timer" },
  physical_body_scan: { kind: "body_scan", widget: "body_scan" },
  posture_awareness: { kind: "movement", widget: "stretching" },
  interoception: { kind: "body_scan", widget: "body_scan" },
  energy_sensation_mapping: { kind: "body_scan", widget: "body_scan" },
  emotion_body_mapping: { kind: "body_scan", widget: "body_scan" },
  breath_body_mapping: { kind: "breathwork", widget: "breath_orb" },
  body_boundary_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  movement_awareness: { kind: "movement", widget: "movement" },
  stillness_awareness: { kind: "silent_sit", widget: "witness_timer" },
  body_mind_relationship: { kind: "reflection" },
  pranic_body_reflection: { kind: "reflection" },
  mental_body_reflection: { kind: "reflection" },
  wisdom_body_reflection: { kind: "reflection" },
  bliss_body_reflection: { kind: "reflection" },
  emotion_naming: { kind: "journal", widget: "journal" },
  emotion_intensity_check: { kind: "reflection" },
  emotion_allowing: { kind: "loving_kindness", widget: "loving_kindness" },
  emotion_trigger_mapping: { kind: "reflection" },
  reaction_chain_review: { kind: "reflection" },
  shadow_pattern_reflection: { kind: "journal", widget: "journal" },
  projection_reflection: { kind: "reflection" },
  inner_conflict_mapping: { kind: "reflection" },
  self_compassion: { kind: "loving_kindness", widget: "loving_kindness" },
  forgiveness_reflection: { kind: "forgiveness", widget: "forgiveness" },
  acceptance_reflection: { kind: "reflection" },
  emotional_integration: { kind: "reflection" },
  trigger_identification: { kind: "reflection" },
  habit_loop_mapping: { kind: "reflection" },
  karma_pattern_reflection: { kind: "reflection" },
  intention_action_review: { kind: "reflection" },
  consequence_visualization: { kind: "visualization", widget: "visualization" },
  reaction_pause_practice: { kind: "witness", widget: "witness_timer" },
  alternative_response_design: { kind: "plan", widget: "plan" },
  behavioral_commitment: { kind: "micro-act", widget: "micro_act" },
  environment_design: { kind: "plan", widget: "plan" },
  habit_rehearsal: { kind: "visualization", widget: "visualization" },
  pattern_breaking: { kind: "micro-act", widget: "micro_act" },
  karma_integration: { kind: "micro-act", widget: "micro_act" },
  wisdom_teaching: { kind: "wisdom-read", widget: "scripture" },
  sutra_reflection: { kind: "scripture", widget: "scripture" },
  teaching_contemplation: { kind: "contemplation", widget: "contemplation" },
  paradox_inquiry: { kind: "contemplation", widget: "contemplation" },
  metaphor_reflection: { kind: "contemplation", widget: "contemplation" },
  guided_imagination: { kind: "visualization", widget: "visualization" },
  perspective_reframing: { kind: "contemplation", widget: "contemplation" },
  discernment_practice: { kind: "contemplation", widget: "contemplation" },
  knowledge_to_experience: { kind: "reflection" },
  insight_verification: { kind: "reflection" },
  mantra_introduction: { kind: "mantra", widget: "mantra" },
  mental_japa: { kind: "mantra", widget: "mantra" },
  spoken_japa: { kind: "mantra", widget: "mantra" },
  breath_synchronized_japa: { kind: "mantra", widget: "mantra" },
  mantra_counting: { kind: "mantra", widget: "mantra" },
  mantra_listening: { kind: "mantra", widget: "mantra" },
  mantra_silence_transition: { kind: "mantra", widget: "mantra" },
  meaning_contemplation: { kind: "contemplation", widget: "contemplation" },
  devotional_reflection: { kind: "reflection" },
  repetition_completion: { kind: "reflection" },
  goal_clarification: { kind: "plan", widget: "plan" },
  priority_selection: { kind: "plan", widget: "plan" },
  distraction_audit: { kind: "reflection" },
  urge_surfing: { kind: "witness", widget: "witness_timer" },
  delayed_response_practice: { kind: "witness", widget: "witness_timer" },
  commitment_rehearsal: { kind: "visualization", widget: "visualization" },
  obstacle_forecasting: { kind: "plan", widget: "plan" },
  if_then_planning: { kind: "plan", widget: "plan" },
  focus_sprint_setup: { kind: "plan", widget: "plan" },
  willpower_reflection: { kind: "reflection" },
  relationship_reflection: { kind: "reflection" },
  perspective_taking: { kind: "reflection" },
  boundary_reflection: { kind: "reflection" },
  communication_rehearsal: { kind: "reflection" },
  conflict_reflection: { kind: "reflection" },
  gratitude_reflection: { kind: "gratitude", widget: "gratitude" },
  work_purpose_reflection: { kind: "reflection" },
  financial_behavior_reflection: { kind: "reflection" },
  health_routine_reflection: { kind: "reflection" },
  purpose_inquiry: { kind: "contemplation", widget: "self_inquiry" },
  life_domain_priority: { kind: "plan", widget: "plan" },
  real_world_action_selection: { kind: "micro-act", widget: "micro_act" },
  future_self_reflection: { kind: "visualization", widget: "visualization" },
  guided_visualization: { kind: "visualization", widget: "visualization" },
  obstacle_visualization: { kind: "visualization", widget: "visualization" },
  creative_observation: { kind: "noticing", widget: "noticing" },
  possibility_generation: { kind: "reflection" },
  perspective_shift: { kind: "contemplation", widget: "contemplation" },
  mental_rehearsal: { kind: "visualization", widget: "visualization" },
  values_alignment: { kind: "reflection" },
  guided_silence: { kind: "silent_sit", widget: "witness_timer" },
  open_monitoring: { kind: "noticing", widget: "noticing" },
  nonjudgmental_noticing: { kind: "noticing", widget: "noticing" },
  sound_space_awareness: { kind: "noticing", widget: "sound_bath" },
  thought_space_awareness: { kind: "noticing", widget: "noticing" },
  awareness_rest: { kind: "silent_sit", widget: "witness_timer" },
  unstructured_sitting: { kind: "silent_sit", widget: "witness_timer" },
  silence_duration_choice: { kind: "silent_sit", widget: "witness_timer" },
  experience_recall: { kind: "reflection" },
  insight_capture: { kind: "journal", widget: "journal" },
  journal_prompt: { kind: "journal", widget: "journal" },
  voice_reflection: { kind: "journal", widget: "free_write" },
  learning_summary: { kind: "reflection", widget: "reflection_card" },
  uncertainty_capture: { kind: "journal", widget: "journal" },
  pattern_update: { kind: "reflection" },
  session_rating: { kind: "journal", widget: "journal" },
  next_session_recommendation: { kind: "reflection" },
  integration_action: { kind: "micro-act", widget: "micro_act" },
  session_recap: { kind: "reflection", widget: "reflection_card" },
  intention_revisit: { kind: "reflection", widget: "reflection_card" },
  state_recheck: { kind: "reflection" },
  gratitude_close: { kind: "gratitude", widget: "gratitude" },
  grounding_close: { kind: "reflection" },
  transition_to_day: { kind: "reflection" },
  micro_commitment: { kind: "micro-act", widget: "micro_act" },
  session_complete: { kind: "reflection" },
  context_recall: { kind: "reflection" },
};

// Invert widget catalog -> step keys for a step->widget lookup fallback.
const WIDGET_BY_STEP: Record<string, WidgetKind> = {};
for (const w of SESSION_WIDGET_CATALOG) {
  for (const sk of w.relatedStepKeys) {
    if (!WIDGET_BY_STEP[sk]) WIDGET_BY_STEP[sk] = w.id;
  }
}

export function getStepRuntimeBinding(key: string): StepRuntimeBinding {
  const def = SESSION_STEP_CATALOG.find((s) => s.key === key);
  const cat = def?.category ?? "opening_preparation";
  const base: StepRuntimeBinding = {
    kind: CATEGORY_DEFAULT_KIND[cat as SessionStepCategoryId],
    minutes: CATEGORY_DEFAULT_MINUTES[cat as SessionStepCategoryId],
  };
  const override = STEP_OVERRIDES[key];
  const widget = override?.widget ?? WIDGET_BY_STEP[key];
  return {
    kind: override?.kind ?? base.kind,
    widget,
    minutes: override?.minutes ?? base.minutes,
  };
}

export function toRuntimeStep(key: string, title?: string) {
  const b = getStepRuntimeBinding(key);
  return {
    kind: b.kind,
    title: title ?? key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    est_minutes: b.minutes,
    params: b.widget ? { widget: b.widget } : undefined,
  };
}

export const STEP_RUNTIME_MAP: Record<string, StepRuntimeBinding> = Object.fromEntries(
  SESSION_STEP_CATALOG.map((s) => [s.key, getStepRuntimeBinding(s.key)])
);

// Re-export types
import { SESSION_STEP_CATALOG } from "@/data/sessionStepCatalog";
import type { SessionStepCategoryId } from "@/data/sessionStepCatalog";
