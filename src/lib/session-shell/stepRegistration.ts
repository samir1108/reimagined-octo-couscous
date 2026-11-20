import React from "react";
import {
  registerStep,
} from "@/lib/session-shell/stepRegistry";
import { getCompletionContract } from "@/lib/session-shell/completionContracts";
import { getConfigSchemaForKind } from "@/lib/session-shell/stepConfigs";
import { JournalStep } from "@/components/session-shell/steps/JournalStep";
import { WisdomReadStep } from "@/components/session-shell/steps/WisdomReadStep";
import { ReflectionStep } from "@/components/session-shell/steps/ReflectionStep";
import { BreathworkStep } from "@/components/session-shell/steps/BreathworkStep";
import { MicroActStep } from "@/components/session-shell/steps/MicroActStep";
import { WitnessStep } from "@/components/session-shell/steps/WitnessStep";
import { PracticeStep } from "@/components/session-shell/steps/PracticeStep";
import { GuideChatStep } from "@/components/session-shell/steps/GuideChatStep";
import { TempleChatStep } from "@/components/session-shell/steps/TempleChatStep";
import { DataDrivenStep } from "@/components/session-shell/steps/DataDrivenStep";
import { UnsupportedStep } from "@/components/session-shell/steps/UnsupportedStep";
import { SilentSitStep, TimerStep, ContemplationStep } from "@/components/session-shell/steps/TimerSteps";
import { BodyScanStep, BodyRegionFocusStep } from "@/components/session-shell/steps/BodySteps";
import { SelfInquiryStep } from "@/components/session-shell/steps/SelfInquiryStep";
import { SelectionStep, RatingStep, NoticingStep } from "@/components/session-shell/steps/InputSteps";
import { EmotionCheckStep, BreathHoldStep, IntentionSetStep } from "@/components/session-shell/steps/NewSteps";
import {
  MantraStep, AffirmationStep, VisualizationStep, AudioStep, SoundBathStep,
  ExperimentStep, GratitudeStep, LovingKindnessStep, ForgivenessStep, PlanStep,
  FreeWriteStep, MovementStep, ScriptureStep, WisdomReadStepWrapper,
} from "@/components/session-shell/steps/ContentSteps";

const STEP_LABELS: Record<string, { label: string; description: string; family: string }> = {
  "wisdom-read": { label: "Wisdom Read", description: "Read and contemplate wisdom", family: "Knowledge" },
  "breathwork": { label: "Breathwork", description: "Guided breathing exercise", family: "Breathing" },
  "journal": { label: "Journal", description: "Free writing and reflection", family: "Journaling" },
  "micro-act": { label: "Micro-act", description: "Small concrete action", family: "Action" },
  "reflection": { label: "Reflection", description: "Reflect on experience", family: "Integration" },
  "guide-chat": { label: "Guide Chat", description: "Conversational guidance", family: "Chat" },
  "practice": { label: "Practice", description: "Structured practice", family: "Practice" },
  "temple-chat": { label: "Temple Chat", description: "Temple-mode conversation", family: "Chat" },
  "witness": { label: "Witness", description: "Silent observation", family: "Observation" },
  "silent_sit": { label: "Silent Sit", description: "Silent meditation", family: "Observation" },
  "body_scan": { label: "Body Scan", description: "Body awareness scan", family: "Body" },
  "body_region_focus": { label: "Body Region Focus", description: "Focus on body region", family: "Body" },
  "self_inquiry": { label: "Self-Inquiry", description: "Contemplative inquiry", family: "Self-Inquiry" },
  "selection": { label: "Selection", description: "Choose from options", family: "Input" },
  "rating": { label: "Rating", description: "Rate on a scale", family: "Input" },
  "free_write": { label: "Free Write", description: "Unstructured writing", family: "Journaling" },
  "timer": { label: "Timer", description: "Timed experience", family: "Timer" },
  "mantra": { label: "Mantra", description: "Repetition practice", family: "Repetition" },
  "visualization": { label: "Visualization", description: "Guided imagery", family: "Visualization" },
  "audio": { label: "Audio", description: "Audio playback", family: "Audio" },
  "sound_bath": { label: "Sound Bath", description: "Sound immersion", family: "Audio" },
  "experiment": { label: "Experiment", description: "Interactive experiment", family: "Experiments" },
  "movement": { label: "Movement", description: "Mindful movement", family: "Movement" },
  "walking": { label: "Walking", description: "Mindful walking", family: "Movement" },
  "yoga_asana": { label: "Yoga Asana", description: "Yoga postures", family: "Movement" },
  "stretching": { label: "Stretching", description: "Gentle stretching", family: "Movement" },
  "tai_chi": { label: "Tai Chi", description: "Tai chi movements", family: "Movement" },
  "balance": { label: "Balance", description: "Balance practice", family: "Movement" },
  "gratitude": { label: "Gratitude", description: "Gratitude practice", family: "Practice" },
  "loving_kindness": { label: "Loving Kindness", description: "Metta practice", family: "Practice" },
  "forgiveness": { label: "Forgiveness", description: "Forgiveness practice", family: "Practice" },
  "affirmation": { label: "Affirmation", description: "Affirmation repetition", family: "Repetition" },
  "contemplation": { label: "Contemplation", description: "Open contemplation", family: "Observation" },
  "noticing": { label: "Noticing", description: "Thought/sensation noticing", family: "Observation" },
  "plan": { label: "Plan", description: "Action planning", family: "Integration" },
  "data-step": { label: "Data Step", description: "Data-driven step", family: "Data" },
  "emotion_check": { label: "Emotion Check", description: "Name and rate an emotion", family: "Input" },
  "breath_hold": { label: "Breath Hold", description: "Breath retention practice", family: "Breathing" },
  "intention_set": { label: "Intention Set", description: "Set a session intention", family: "Integration" },
  "scripture": { label: "Scripture", description: "Scripture reading", family: "Knowledge" },
};

const RENDERER_MAP: Record<string, React.ComponentType<Record<string, unknown>>> = {
  "journal": JournalStep,
  "wisdom-read": WisdomReadStep,
  "reflection": ReflectionStep,
  "breathwork": BreathworkStep,
  "micro-act": MicroActStep,
  "witness": WitnessStep,
  "practice": PracticeStep,
  "guide-chat": GuideChatStep,
  "temple-chat": TempleChatStep,
  "data-step": DataDrivenStep,
  "emotion_check": EmotionCheckStep,
  "breath_hold": BreathHoldStep,
  "intention_set": IntentionSetStep,
  "silent_sit": SilentSitStep,
  "timer": TimerStep,
  "contemplation": ContemplationStep,
  "body_scan": BodyScanStep,
  "body_region_focus": BodyRegionFocusStep,
  "self_inquiry": SelfInquiryStep,
  "selection": SelectionStep,
  "rating": RatingStep,
  "noticing": NoticingStep,
  "mantra": MantraStep,
  "affirmation": AffirmationStep,
  "visualization": VisualizationStep,
  "audio": AudioStep,
  "sound_bath": SoundBathStep,
  "experiment": ExperimentStep,
  "gratitude": GratitudeStep,
  "loving_kindness": LovingKindnessStep,
  "forgiveness": ForgivenessStep,
  "plan": PlanStep,
  "free_write": FreeWriteStep,
  "movement": MovementStep,
  "walking": MovementStep,
  "yoga_asana": MovementStep,
  "stretching": MovementStep,
  "tai_chi": MovementStep,
  "balance": MovementStep,
  "scripture": ScriptureStep,
};

export function registerAllSteps() {
  const kinds = Object.keys(STEP_LABELS);
  for (const kind of kinds) {
    const meta = STEP_LABELS[kind];
    const renderer = RENDERER_MAP[kind];
    registerStep({
      kind: kind as string,
      renderer: renderer
        ? (props: Record<string, unknown>) => React.createElement(renderer, {})
        : (props: Record<string, unknown>) => React.createElement(UnsupportedStep, { kind }),
      configSchema: getConfigSchemaForKind(kind as string),
      completionContract: getCompletionContract(kind as string),
      label: meta.label,
      description: meta.description,
      widgetFamily: meta.family,
    });
  }
}

registerAllSteps();
