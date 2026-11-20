export const SESSION_STAGE_IDS = [
  "arrival",
  "baseline",
  "orientation",
  "settling",
  "induction",
  "core_experience",
  "deepening",
  "observation",
  "insight",
  "application",
  "integration",
  "reflection",
  "adaptation",
] as const;

export type SessionStageId = (typeof SESSION_STAGE_IDS)[number];

export type SessionInteraction = "read" | "respond" | "practice" | "observe" | "reflect" | "act";

export interface SessionStageDefinition {
  id: SessionStageId;
  label: string;
  purpose: string;
  interaction: SessionInteraction;
  defaultWeight: number;
}

export const SESSION_STAGES: readonly SessionStageDefinition[] = [
  { id: "arrival", label: "Arrival", purpose: "Establish what is happening now.", interaction: "respond", defaultWeight: 1 },
  { id: "baseline", label: "Baseline", purpose: "Locate the user's starting state.", interaction: "respond", defaultWeight: 1 },
  { id: "orientation", label: "Orientation", purpose: "Explain what will be explored.", interaction: "read", defaultWeight: 1 },
  { id: "settling", label: "Settling", purpose: "Become present to the experience.", interaction: "practice", defaultWeight: 1 },
  { id: "induction", label: "Induction", purpose: "Enter the chosen practice.", interaction: "practice", defaultWeight: 1 },
  { id: "core_experience", label: "Core Experience", purpose: "Perform the central exercise.", interaction: "practice", defaultWeight: 4 },
  { id: "deepening", label: "Deepening", purpose: "Explore beyond the first reaction.", interaction: "observe", defaultWeight: 2 },
  { id: "observation", label: "Observation", purpose: "Notice what actually happened.", interaction: "observe", defaultWeight: 2 },
  { id: "insight", label: "Insight", purpose: "Recognize a pattern or distinction.", interaction: "reflect", defaultWeight: 1.5 },
  { id: "application", label: "Application", purpose: "Connect the practice to real life.", interaction: "act", defaultWeight: 1.5 },
  { id: "integration", label: "Integration", purpose: "Carry the experience forward.", interaction: "reflect", defaultWeight: 1.5 },
  { id: "reflection", label: "Reflection", purpose: "Capture what was discovered.", interaction: "reflect", defaultWeight: 1.5 },
  { id: "adaptation", label: "Adaptation", purpose: "Choose what should happen next.", interaction: "act", defaultWeight: 1 },
] as const;

export const SESSION_COMPONENT_IDS = [
  "arrival",
  "check_in",
  "intention",
  "orientation",
  "settling",
  "anchor",
  "core_practice",
  "variation",
  "reflection",
  "insight",
  "application",
  "closure",
] as const;

export type SessionComponentId = (typeof SESSION_COMPONENT_IDS)[number];

export const SESSION_MODALITY_IDS = [
  "guided_audio",
  "silent_meditation",
  "orb_interaction",
  "interactive_questions",
  "timed_exercise",
  "visual_attention",
  "sound_based",
  "body_based",
  "journaling",
  "conversational_ai",
  "scenario_simulation",
  "behavioral_mission",
  "walking_practice",
  "multi_day_program",
  "biofeedback_assisted",
  "environmental_practice",
] as const;

export type SessionModality = (typeof SESSION_MODALITY_IDS)[number];

export const FRAMEWORK_CATEGORY_IDS = [
  "attention_concentration",
  "mindfulness_open_awareness",
  "body_sensory_awareness",
  "breath_practice",
  "self_inquiry_witnessing",
  "emotional_awareness",
  "cognitive_reflection",
  "behavioral_change",
  "values_life_direction",
  "yoga_inspired",
  "compassion_relationships",
  "creativity_problem_solving",
  "habit_formation",
  "sleep_unwinding",
  "integration_review",
  "interactive_missions",
  "learning_skill_development",
] as const;

export type FrameworkCategory = (typeof FRAMEWORK_CATEGORY_IDS)[number];

export type FrameworkDifficulty = "beginner" | "intermediate" | "advanced";

export type SessionEnergy = "low" | "medium" | "high";

export type CheckInState =
  | "tired"
  | "distracted"
  | "calm"
  | "confused"
  | "overwhelmed"
  | "curious"
  | "short_on_time"
  | "wants_practical_help";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type OutcomeEvidence = "reported" | "observed" | "behavioral" | "completion";

export type FrameworkSourceKind = "internal_design" | "research_informed" | "tradition_inspired" | "adaptive_integration";

export interface FrameworkOutcome {
  id: string;
  statement: string;
  evidence: OutcomeEvidence;
}

export interface FrameworkTechnique {
  id: string;
  name: string;
  category: FrameworkCategory;
  description: string;
  compatibleModalities: SessionModality[];
  defaultDurationMinutes: number;
  contraindications?: string[];
}

export interface FrameworkAdaptationRule {
  condition: CheckInState | "short_on_time" | "low_energy" | "uncomfortable" | "user_choice";
  action: "shorten" | "simplify" | "offer_stop" | "ground_and_close" | "branch";
  instruction: string;
}

export interface FrameworkCompletionCriterion {
  id: string;
  type: "stage_completed" | "reflection_recorded" | "mission_selected" | "closure_shown";
  stageId?: SessionStageId;
}

export interface FrameworkProvenance {
  sourceKind: FrameworkSourceKind;
  sourceLabel: string;
  reviewedAt: string;
  notes: string;
}

export interface FrameworkSafety {
  notTreatment: boolean;
  stopSignals: string[];
  avoidWhen: string[];
  professionalGuidanceRecommended: boolean;
}

export interface FrameworkAccessibility {
  reducedMotionSupported: boolean;
  captionsSupported: boolean;
  screenReaderSupported: boolean;
  alternatives: string[];
}

export interface SessionFramework {
  id: string;
  version: string;
  name: string;
  category: FrameworkCategory;
  tradition: string;
  primaryGoal: string;
  description: string;
  durationMinutes: {
    min: number;
    default: number;
    max: number;
  };
  difficulty: FrameworkDifficulty;
  deliveryModes: SessionModality[];
  compatibleTechniques: string[];
  stageSequence: SessionStageId[];
  componentSequence: SessionComponentId[];
  outcomes: FrameworkOutcome[];
  adaptations: FrameworkAdaptationRule[];
  completionCriteria: FrameworkCompletionCriterion[];
  safety: FrameworkSafety;
  accessibility: FrameworkAccessibility;
  provenance: FrameworkProvenance;
}

export interface FrameworkSelectionContext {
  timeBudgetMin: number;
  energy: SessionEnergy;
  checkIn?: CheckInState;
  goal?: string;
  preferredFrameworkId?: string;
  preferredModalities?: SessionModality[];
  experienceLevel?: ExperienceLevel;
  recentFrameworkIds?: string[];
  completedFrameworkIds?: string[];
  avoidFrameworkIds?: string[];
  activeGoalCategories?: FrameworkCategory[];
  preferredDifficulty?: FrameworkDifficulty;
}

export interface FrameworkCandidate {
  framework: SessionFramework;
  score: number;
  reasons: string[];
}

export interface FrameworkSelection {
  selected: SessionFramework;
  score: number;
  reasons: string[];
  alternatives: FrameworkCandidate[];
}

export interface SessionBlueprintStage {
  id: string;
  stageId: SessionStageId;
  componentId: SessionComponentId;
  title: string;
  instruction: string;
  interaction: SessionInteraction;
  durationMinutes: number;
  techniqueIds: string[];
  optional: boolean;
}

export interface SessionBlueprintTechnique {
  id: string;
  name: string;
  durationMinutes: number;
}

export interface SessionBlueprintMission {
  id: string;
  instruction: string;
  successCriteria: string;
  timeframe: "today" | "this_week" | "next_session";
}

export interface SessionBlueprint {
  id: string;
  frameworkId: string;
  frameworkVersion: string;
  title: string;
  intent: string;
  modality: SessionModality;
  durationMinutes: number;
  stages: SessionBlueprintStage[];
  techniques: SessionBlueprintTechnique[];
  outcomes: FrameworkOutcome[];
  mission?: SessionBlueprintMission;
  adaptations: FrameworkAdaptationRule[];
  completionCriteria: FrameworkCompletionCriterion[];
  provenance: FrameworkProvenance;
  selectionReasons: string[];
}

export type SessionAdaptationEvent =
  | { type: "check_in"; state: CheckInState }
  | { type: "time_remaining"; minutes: number }
  | { type: "discomfort" }
  | { type: "stage_completed"; stageId: SessionStageId }
  | { type: "user_choice"; value: string };

export interface SessionBlueprintAdaptation {
  blueprint: SessionBlueprint;
  action: FrameworkAdaptationRule["action"];
  reason: string;
}
