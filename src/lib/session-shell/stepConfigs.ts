import { z } from "zod";
import type { StepKind } from "./types";

export const BreathworkConfigSchema = z.object({
  pattern: z.enum(["natural", "box", "4-7-8", "coherent"]).default("natural"),
  durationSeconds: z.number().int().positive().max(3600),
  inhaleSeconds: z.number().int().positive().optional(),
  holdSeconds: z.number().int().nonnegative().optional(),
  exhaleSeconds: z.number().int().positive().optional(),
  pauseSeconds: z.number().int().nonnegative().optional(),
  showPhaseText: z.boolean().default(true),
  showOrb: z.boolean().default(true),
  soundEnabled: z.boolean().default(false),
});
export type BreathworkConfig = z.infer<typeof BreathworkConfigSchema>;

export const WitnessConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  allowManualLogging: z.boolean().default(true),
  showThoughtCounter: z.boolean().default(true),
  categories: z.array(z.string()).optional(),
  showTimer: z.boolean().default(true),
  gentleBell: z.boolean().default(true),
});
export type WitnessConfig = z.infer<typeof WitnessConfigSchema>;

export const SilentSitConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  showOrb: z.boolean().default(true),
  showInstruction: z.boolean().default(false),
  instructionText: z.string().optional(),
  gentleBell: z.boolean().default(true),
  intervalBellSeconds: z.number().int().positive().optional(),
});
export type SilentSitConfig = z.infer<typeof SilentSitConfigSchema>;

export const BodyScanConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  regions: z.array(z.enum(["head", "neck", "shoulders", "chest", "abdomen", "lowerBack", "hips", "thighs", "knees", "calves", "feet"])).optional(),
  paceSecondsPerRegion: z.number().int().positive().default(15),
  autoAdvance: z.boolean().default(true),
  showBodyMap: z.boolean().default(true),
});
export type BodyScanConfig = z.infer<typeof BodyScanConfigSchema>;

export const BodyRegionFocusConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  region: z.enum(["head", "neck", "shoulders", "chest", "abdomen", "lowerBack", "hips", "thighs", "knees", "calves", "feet"]),
  showBodyMap: z.boolean().default(true),
  guidanceText: z.string().optional(),
});
export type BodyRegionFocusConfig = z.infer<typeof BodyRegionFocusConfigSchema>;

export const SelfInquiryConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  question: z.string().min(1),
  contemplationSeconds: z.number().int().positive().default(60),
  allowReflection: z.boolean().default(true),
  reflectionPrompt: z.string().optional(),
  showTimer: z.boolean().default(true),
});
export type SelfInquiryConfig = z.infer<typeof SelfInquiryConfigSchema>;

export const SelectionConfigSchema = z.object({
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
  })).min(1),
  allowMultiple: z.boolean().default(false),
  prompt: z.string().optional(),
  showAsCards: z.boolean().default(true),
});
export type SelectionConfig = z.infer<typeof SelectionConfigSchema>;

export const RatingConfigSchema = z.object({
  min: z.number().int().default(0),
  max: z.number().int().default(10),
  step: z.number().int().positive().default(1),
  labels: z.record(z.number(), z.string()).optional(),
  prompt: z.string().optional(),
  showValue: z.boolean().default(true),
});
export type RatingConfig = z.infer<typeof RatingConfigSchema>;

export const JournalConfigSchema = z.object({
  prompt: z.string().optional(),
  placeholder: z.string().default("Write freely… no one is grading this."),
  minWords: z.number().int().nonnegative().default(0),
  maxWords: z.number().int().positive().optional(),
  showWordCount: z.boolean().default(true),
  autoSave: z.boolean().default(false),
  guidedPrompts: z.array(z.string()).optional(),
});
export type JournalConfig = z.infer<typeof JournalConfigSchema>;

export const TimerConfigSchema = z.object({
  mode: z.enum(["countdown", "stopwatch", "interval"]).default("countdown"),
  durationSeconds: z.number().int().positive().max(3600),
  intervalSeconds: z.number().int().positive().optional(),
  intervalCount: z.number().int().positive().optional(),
  showOrb: z.boolean().default(false),
  showPhase: z.boolean().default(false),
  phases: z.array(z.object({
    name: z.string(),
    durationSeconds: z.number().int().positive(),
  })).optional(),
  autoStart: z.boolean().default(false),
  gentleBell: z.boolean().default(true),
});
export type TimerConfig = z.infer<typeof TimerConfigSchema>;

export const MantraConfigSchema = z.object({
  targetCount: z.number().int().positive().default(108),
  mantra: z.string().default("ॐ"),
  showMala: z.boolean().default(true),
  soundEnabled: z.boolean().default(false),
  vibrationEnabled: z.boolean().default(false),
  autoAdvance: z.boolean().default(false),
  showProgress: z.boolean().default(true),
});
export type MantraConfig = z.infer<typeof MantraConfigSchema>;

export const VisualizationConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  script: z.array(z.object({
    text: z.string(),
    durationSeconds: z.number().int().positive(),
    pauseAfter: z.boolean().default(false),
  })).optional(),
  prompt: z.string().optional(),
  showTimer: z.boolean().default(true),
  background: z.enum(["black", "starfield", "guru-bg", "gradient"]).default("black"),
});
export type VisualizationConfig = z.infer<typeof VisualizationConfigSchema>;

export const AudioConfigSchema = z.object({
  src: z.string().url().or(z.string().startsWith("/")),
  title: z.string().optional(),
  loop: z.boolean().default(false),
  playbackRate: z.number().positive().default(1),
  showControls: z.boolean().default(true),
  autoPlay: z.boolean().default(false),
  fadeIn: z.number().int().nonnegative().default(0),
  fadeOut: z.number().int().nonnegative().default(0),
});
export type AudioConfig = z.infer<typeof AudioConfigSchema>;

export const ExperimentConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  instruction: z.string(),
  steps: z.array(z.object({
    instruction: z.string(),
    durationSeconds: z.number().int().positive(),
    prompt: z.string().optional(),
    inputType: z.enum(["none", "text", "selection", "rating"]).default("none"),
    inputConfig: z.record(z.unknown()).optional(),
  })).min(1),
  showTimer: z.boolean().default(true),
});
export type ExperimentConfig = z.infer<typeof ExperimentConfigSchema>;

export const ReflectionConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600).optional(),
  prompt: z.string().optional(),
  allowJournaling: z.boolean().default(true),
  guidedQuestions: z.array(z.string()).optional(),
  showTimer: z.boolean().default(false),
  integrationPrompt: z.string().optional(),
});
export type ReflectionConfig = z.infer<typeof ReflectionConfigSchema>;

export const WisdomReadConfigSchema = z.object({
  content: z.string(),
  source: z.string().optional(),
  readingTimeSeconds: z.number().int().positive().optional(),
  showTimer: z.boolean().default(false),
  reflectionPrompt: z.string().optional(),
});
export type WisdomReadConfig = z.infer<typeof WisdomReadConfigSchema>;

export const MicroActConfigSchema = z.object({
  action: z.string(),
  durationSeconds: z.number().int().positive().max(300).default(30),
  showTimer: z.boolean().default(true),
  followUpPrompt: z.string().optional(),
});
export type MicroActConfig = z.infer<typeof MicroActConfigSchema>;

export const GuideChatConfigSchema = z.object({
  initialPrompt: z.string().optional(),
  mode: z.string().optional(),
  maxTurns: z.number().int().positive().optional(),
  allowDeeper: z.boolean().default(true),
  systemPromptOverride: z.string().optional(),
});
export type GuideChatConfig = z.infer<typeof GuideChatConfigSchema>;

export const PracticeConfigSchema = z.object({
  practiceId: z.string().optional(),
  widgetId: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  level: z.number().int().min(0).max(7),
  durationSeconds: z.number().int().positive().max(3600),
  guidanceLevel: z.enum(["minimal", "moderate", "full"]).default("moderate"),
  useCinematic: z.boolean().default(true),
});
export type PracticeConfig = z.infer<typeof PracticeConfigSchema>;

export const MovementConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  steps: z.array(z.object({
    instruction: z.string(),
    durationSeconds: z.number().int().positive(),
  })).optional(),
  showTimer: z.boolean().default(true),
  audioGuidance: z.boolean().default(false),
});
export type MovementConfig = z.infer<typeof MovementConfigSchema>;

export const GratitudeConfigSchema = z.object({
  count: z.number().int().positive().default(3),
  prompt: z.string().default("Name three things you're grateful for"),
  showTimer: z.boolean().default(false),
  allowFreeText: z.boolean().default(true),
});
export type GratitudeConfig = z.infer<typeof GratitudeConfigSchema>;

export const LovingKindnessConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  phrases: z.array(z.string()).default([
    "May I be happy",
    "May I be healthy",
    "May I be safe",
    "May I live with ease",
  ]),
  targets: z.array(z.string()).default(["self", "loved one", "neutral person", "difficult person", "all beings"]),
  showTimer: z.boolean().default(true),
});
export type LovingKindnessConfig = z.infer<typeof LovingKindnessConfigSchema>;

export const ForgivenessConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  stages: z.array(z.object({
    name: z.string(),
    prompt: z.string(),
    durationSeconds: z.number().int().positive(),
  })).optional(),
  showTimer: z.boolean().default(true),
});
export type ForgivenessConfig = z.infer<typeof ForgivenessConfigSchema>;

export const AffirmationConfigSchema = z.object({
  affirmations: z.array(z.string()).min(1),
  repetitions: z.number().int().positive().default(3),
  durationSeconds: z.number().int().positive().max(3600).optional(),
  showTimer: z.boolean().default(false),
  speakAloud: z.boolean().default(false),
});
export type AffirmationConfig = z.infer<typeof AffirmationConfigSchema>;

export const ContemplationConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  prompt: z.string(),
  showTimer: z.boolean().default(true),
  gentleBell: z.boolean().default(true),
  intervalBellSeconds: z.number().int().positive().optional(),
});
export type ContemplationConfig = z.infer<typeof ContemplationConfigSchema>;

export const NoticingConfigSchema = z.object({
  durationSeconds: z.number().int().positive().max(3600),
  focus: z.enum(["thoughts", "emotions", "sensations", "sounds", "breath", "open"]).default("open"),
  allowLogging: z.boolean().default(true),
  categories: z.array(z.string()).optional(),
  showTimer: z.boolean().default(true),
  showCounter: z.boolean().default(true),
});
export type NoticingConfig = z.infer<typeof NoticingConfigSchema>;

export const PlanConfigSchema = z.object({
  steps: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    durationMinutes: z.number().positive(),
  })).min(1),
  showAsTimeline: z.boolean().default(true),
});
export type PlanConfig = z.infer<typeof PlanConfigSchema>;

export const DataStepConfigSchema = z.object({
  source: z.string(),
  query: z.string().optional(),
  transform: z.string().optional(),
  display: z.enum(["list", "chart", "card", "table"]).default("card"),
});
export type DataStepConfig = z.infer<typeof DataStepConfigSchema>;

export const EmotionCheckConfigSchema = z.object({
  emotions: z.array(z.string()).default(["calm","anxious","sad","angry","joyful","tired","hopeful","overwhelmed"]),
  allowIntensity: z.boolean().default(true),
  prompt: z.string().optional(),
});
export type EmotionCheckConfig = z.infer<typeof EmotionCheckConfigSchema>;

export const BreathHoldConfigSchema = z.object({
  rounds: z.number().int().positive().default(4),
  inhaleSeconds: z.number().int().positive().default(4),
  holdSeconds: z.number().int().positive().default(4),
  exhaleSeconds: z.number().int().positive().default(4),
  restSeconds: z.number().int().nonnegative().default(2),
  showOrb: z.boolean().default(true),
});
export type BreathHoldConfig = z.infer<typeof BreathHoldConfigSchema>;

export const IntentionSetConfigSchema = z.object({
  prompt: z.string().default("What is your intention for this session?"),
  placeholder: z.string().default("I intend to..."),
  maxLength: z.number().int().positive().default(200),
  allowSharing: z.boolean().default(false),
});
export type IntentionSetConfig = z.infer<typeof IntentionSetConfigSchema>;

export const SessionStepConfigSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("breathwork"), config: BreathworkConfigSchema }),
  z.object({ kind: z.literal("witness"), config: WitnessConfigSchema }),
  z.object({ kind: z.literal("silent_sit"), config: SilentSitConfigSchema }),
  z.object({ kind: z.literal("body_scan"), config: BodyScanConfigSchema }),
  z.object({ kind: z.literal("body_region_focus"), config: BodyRegionFocusConfigSchema }),
  z.object({ kind: z.literal("self_inquiry"), config: SelfInquiryConfigSchema }),
  z.object({ kind: z.literal("selection"), config: SelectionConfigSchema }),
  z.object({ kind: z.literal("rating"), config: RatingConfigSchema }),
  z.object({ kind: z.literal("journal"), config: JournalConfigSchema }),
  z.object({ kind: z.literal("timer"), config: TimerConfigSchema }),
  z.object({ kind: z.literal("mantra"), config: MantraConfigSchema }),
  z.object({ kind: z.literal("visualization"), config: VisualizationConfigSchema }),
  z.object({ kind: z.literal("audio"), config: AudioConfigSchema }),
  z.object({ kind: z.literal("experiment"), config: ExperimentConfigSchema }),
  z.object({ kind: z.literal("reflection"), config: ReflectionConfigSchema }),
  z.object({ kind: z.literal("wisdom-read"), config: WisdomReadConfigSchema }),
  z.object({ kind: z.literal("micro-act"), config: MicroActConfigSchema }),
  z.object({ kind: z.literal("guide-chat"), config: GuideChatConfigSchema }),
  z.object({ kind: z.literal("practice"), config: PracticeConfigSchema }),
  z.object({ kind: z.literal("movement"), config: MovementConfigSchema }),
  z.object({ kind: z.literal("walking"), config: MovementConfigSchema }),
  z.object({ kind: z.literal("yoga_asana"), config: MovementConfigSchema }),
  z.object({ kind: z.literal("stretching"), config: MovementConfigSchema }),
  z.object({ kind: z.literal("tai_chi"), config: MovementConfigSchema }),
  z.object({ kind: z.literal("balance"), config: MovementConfigSchema }),
  z.object({ kind: z.literal("gratitude"), config: GratitudeConfigSchema }),
  z.object({ kind: z.literal("loving_kindness"), config: LovingKindnessConfigSchema }),
  z.object({ kind: z.literal("forgiveness"), config: ForgivenessConfigSchema }),
  z.object({ kind: z.literal("affirmation"), config: AffirmationConfigSchema }),
  z.object({ kind: z.literal("contemplation"), config: ContemplationConfigSchema }),
  z.object({ kind: z.literal("noticing"), config: NoticingConfigSchema }),
  z.object({ kind: z.literal("plan"), config: PlanConfigSchema }),
  z.object({ kind: z.literal("data-step"), config: DataStepConfigSchema }),
  z.object({ kind: z.literal("sound_bath"), config: AudioConfigSchema }),
  z.object({ kind: z.literal("scripture"), config: WisdomReadConfigSchema }),
  z.object({ kind: z.literal("free_write"), config: JournalConfigSchema }),
  z.object({ kind: z.literal("temple-chat"), config: GuideChatConfigSchema }),
  z.object({ kind: z.literal("emotion_check"), config: EmotionCheckConfigSchema }),
  z.object({ kind: z.literal("breath_hold"), config: BreathHoldConfigSchema }),
  z.object({ kind: z.literal("intention_set"), config: IntentionSetConfigSchema }),
]);

export type SessionStepConfig = z.infer<typeof SessionStepConfigSchema>;

export function getConfigSchemaForKind(kind: StepKind): z.ZodSchema | null {
  const schemas: Record<StepKind, z.ZodSchema> = {
    "breathwork": BreathworkConfigSchema,
    "witness": WitnessConfigSchema,
    "silent_sit": SilentSitConfigSchema,
    "body_scan": BodyScanConfigSchema,
    "body_region_focus": BodyRegionFocusConfigSchema,
    "self_inquiry": SelfInquiryConfigSchema,
    "selection": SelectionConfigSchema,
    "rating": RatingConfigSchema,
    "journal": JournalConfigSchema,
    "timer": TimerConfigSchema,
    "mantra": MantraConfigSchema,
    "visualization": VisualizationConfigSchema,
    "audio": AudioConfigSchema,
    "experiment": ExperimentConfigSchema,
    "reflection": ReflectionConfigSchema,
    "wisdom-read": WisdomReadConfigSchema,
    "micro-act": MicroActConfigSchema,
    "guide-chat": GuideChatConfigSchema,
    "practice": PracticeConfigSchema,
    "movement": MovementConfigSchema,
    "walking": MovementConfigSchema,
    "yoga_asana": MovementConfigSchema,
    "stretching": MovementConfigSchema,
    "tai_chi": MovementConfigSchema,
    "balance": MovementConfigSchema,
    "gratitude": GratitudeConfigSchema,
    "loving_kindness": LovingKindnessConfigSchema,
    "forgiveness": ForgivenessConfigSchema,
    "affirmation": AffirmationConfigSchema,
    "contemplation": ContemplationConfigSchema,
    "noticing": NoticingConfigSchema,
    "plan": PlanConfigSchema,
    "data-step": DataStepConfigSchema,
    "sound_bath": AudioConfigSchema,
    "scripture": WisdomReadConfigSchema,
    "free_write": JournalConfigSchema,
    "temple-chat": GuideChatConfigSchema,
    "emotion_check": EmotionCheckConfigSchema,
    "breath_hold": BreathHoldConfigSchema,
    "intention_set": IntentionSetConfigSchema,
  };
  return schemas[kind] ?? null;
}