// Named session blueprints: configurable ordered step-key sequences.
// The engine selects a blueprint by context (gate, time, energy, level) and
// may splice/trim steps to fit the time budget.

import type { SessionStepCategoryId } from "@/data/sessionStepCatalog";

export interface SessionBlueprint {
  id: string;
  title: string;
  /** Minimum minutes this blueprint needs. */
  minMinutes: number;
  /** Preferred gates. */
  gates: ("morning" | "midday" | "evening" | "night")[];
  /** Energy fit. */
  energy: ("low" | "medium" | "high" | "any")[];
  /** Ordered step keys (from sessionStepCatalog). */
  steps: string[];
}

export const SESSION_BLUEPRINTS: SessionBlueprint[] = [
  {
    id: "morning_quick",
    title: "Morning Quick Reset",
    minMinutes: 3,
    gates: ["morning"],
    energy: ["any"],
    steps: ["welcome", "intention_setting", "breath_attention", "attention_anchoring", "micro_commitment", "session_complete"],
  },
  {
    id: "morning_deep",
    title: "Morning Deep Practice",
    minMinutes: 15,
    gates: ["morning"],
    energy: ["medium", "high"],
    steps: ["welcome", "intention_setting", "context_recall", "state_check", "energy_check", "posture_setup", "sensory_settling", "breath_attention", "attention_anchoring", "sustained_attention", "thought_observation", "insight_capture", "integration_action", "session_recap", "session_complete"],
  },
  {
    id: "midday_inquiry",
    title: "Midday Inquiry",
    minMinutes: 8,
    gates: ["midday"],
    energy: ["any"],
    steps: ["welcome", "state_check", "attention_anchoring", "identity_inquiry", "awareness_inquiry", "insight_capture", "real_world_action_selection", "session_complete"],
  },
  {
    id: "evening_integration",
    title: "Evening Integration",
    minMinutes: 10,
    gates: ["evening"],
    energy: ["low", "medium"],
    steps: ["welcome", "experience_recall", "emotion_naming", "emotion_body_mapping", "self_compassion", "gratitude_reflection", "integration_action", "session_recap", "session_complete"],
  },
  {
    id: "night_release",
    title: "Night Release",
    minMinutes: 5,
    gates: ["night"],
    energy: ["low", "medium"],
    steps: ["welcome", "sensory_settling", "relaxation_scan", "guided_silence", "gratitude_close", "transition_to_day", "session_complete"],
  },
  {
    id: "breath_regulation",
    title: "Breath & Regulation",
    minMinutes: 6,
    gates: ["morning", "midday", "evening", "night"],
    energy: ["low", "medium", "high"],
    steps: ["welcome", "posture_setup", "natural_breathing", "paced_breathing", "extended_exhalation", "breath_body_sync", "grounding", "settling_pause", "session_complete"],
  },
  {
    id: "self_inquiry_deep",
    title: "Self-Inquiry Deep Dive",
    minMinutes: 20,
    gates: ["morning", "midday", "evening"],
    energy: ["medium", "high"],
    steps: ["welcome", "intention_setting", "state_check", "attention_anchoring", "thought_observation", "thought_owner_inquiry", "who_am_i_inquiry", "awareness_inquiry", "observer_observed_inquiry", "spacious_awareness", "guided_silence", "insight_capture", "journal_prompt", "session_recap", "session_complete"],
  },
  {
    id: "karma_habits",
    title: "Karma & Habit Reset",
    minMinutes: 12,
    gates: ["morning", "midday", "evening"],
    energy: ["any"],
    steps: ["welcome", "trigger_identification", "habit_loop_mapping", "intention_action_review", "alternative_response_design", "behavioral_commitment", "environment_design", "if_then_planning", "habit_rehearsal", "karma_integration", "session_complete"],
  },
  {
    id: "mantra_japa",
    title: "Mantra Japa",
    minMinutes: 8,
    gates: ["morning", "evening", "night"],
    energy: ["any"],
    steps: ["welcome", "mantra_introduction", "breath_synchronized_japa", "mantra_counting", "mantra_listening", "mantra_silence_transition", "meaning_contemplation", "repetition_completion", "session_complete"],
  },
  {
    id: "open_awareness",
    title: "Open Awareness",
    minMinutes: 10,
    gates: ["morning", "midday", "evening", "night"],
    energy: ["any"],
    steps: ["welcome", "sensory_settling", "open_attention", "open_monitoring", "nonjudgmental_noticing", "sound_space_awareness", "thought_space_awareness", "awareness_rest", "guided_silence", "session_complete"],
  },
];

export function getBlueprintsForContext(
  gate: string,
  energy: string,
  timeBudgetMin: number
): SessionBlueprint[] {
  return SESSION_BLUEPRINTS.filter(
    (b) => b.gates.includes(gate as SessionBlueprint["gates"][number]) && (b.energy.includes(energy as SessionBlueprint["energy"][number]) || b.energy.includes("any")) && b.minMinutes <= timeBudgetMin
  );
}
