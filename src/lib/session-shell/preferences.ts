import { z } from "zod";

export const SessionPreferencesSchema = z.object({
  focusWeights: z.object({
    observation: z.number().min(0).max(100).default(20),
    selfInquiry: z.number().min(0).max(100).default(20),
    breath: z.number().min(0).max(100).default(20),
    body: z.number().min(0).max(100).default(20),
    knowledge: z.number().min(0).max(100).default(20),
  }).default({}),
  guidanceLevel: z.enum(["minimal", "moderate", "full"]).default("moderate"),
  preferredDuration: z.number().int().positive().max(120).default(15),
  preferredInteractionTypes: z.array(z.string()).default([]),
  audioEnabled: z.boolean().default(true),
  visualIntensity: z.enum(["minimal", "moderate", "cinematic"]).default("moderate"),
  reducedMotion: z.boolean().default(false),
  preferredStepKinds: z.array(z.string()).default([]),
  excludedStepKinds: z.array(z.string()).default([]),
});

export type SessionPreferences = z.infer<typeof SessionPreferencesSchema>;

export function normalizeFocusWeights(weights: SessionPreferences["focusWeights"]): SessionPreferences["focusWeights"] {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  if (total === 0) return weights;
  const factor = 100 / total;
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, Math.round(v * factor)])
  ) as SessionPreferences["focusWeights"];
}

export function getPreferredStepKinds(prefs: SessionPreferences): string[] {
  if (prefs.preferredStepKinds.length > 0) return prefs.preferredStepKinds;
  const kinds: string[] = [];
  if (prefs.focusWeights.observation > 20) kinds.push("witness", "silent_sit", "contemplation", "noticing");
  if (prefs.focusWeights.selfInquiry > 20) kinds.push("self_inquiry", "reflection");
  if (prefs.focusWeights.breath > 20) kinds.push("breathwork", "silent_sit");
  if (prefs.focusWeights.body > 20) kinds.push("body_scan", "body_region_focus", "movement");
  if (prefs.focusWeights.knowledge > 20) kinds.push("wisdom-read", "scripture", "guide-chat");
  return [...new Set(kinds)];
}