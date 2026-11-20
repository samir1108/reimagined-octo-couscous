import React from "react";
import { StepKind } from "./types";
import { getCompletionContract } from "./completionContracts";
import { getConfigSchemaForKind } from "./stepConfigs";
import { z } from "zod";

export interface StepRendererProps {
  step: import("./types").SessionStep;
}

export interface StepRegistryEntry {
  kind: StepKind;
  renderer: React.ComponentType<StepRendererProps>;
  configSchema: z.ZodSchema | null;
  completionContract: ReturnType<typeof getCompletionContract>;
  label: string;
  description: string;
  icon?: string;
  widgetFamily: string;
}

export const stepRegistry = new Map<StepKind, StepRegistryEntry>();

export function registerStep(entry: StepRegistryEntry) {
  stepRegistry.set(entry.kind, entry);
}

export function getStepEntry(kind: StepKind): StepRegistryEntry | undefined {
  return stepRegistry.get(kind);
}

export function getAllStepKinds(): StepKind[] {
  return Array.from(stepRegistry.keys());
}

export function hasRenderer(kind: StepKind): boolean {
  return stepRegistry.has(kind);
}

export function getUnsupportedKinds(): StepKind[] {
  const allKinds: StepKind[] = [
    "wisdom-read", "breathwork", "journal", "micro-act", "reflection",
    "guide-chat", "practice", "temple-chat", "witness", "silent_sit",
    "body_scan", "gratitude", "loving_kindness", "forgiveness", "movement",
    "walking", "yoga_asana", "sound_bath", "mantra", "visualization",
    "scripture", "affirmation", "contemplation", "noticing", "stretching",
    "tai_chi", "balance", "free_write", "plan", "data-step",
    "body_region_focus", "self_inquiry", "selection", "rating",
    "timer", "audio", "experiment",
    "emotion_check", "breath_hold", "intention_set",
  ];
  return allKinds.filter((k) => !stepRegistry.has(k));
}