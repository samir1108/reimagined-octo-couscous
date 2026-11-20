/**
 * masterMatching — Re-exports from unified shared module
 * 
 * The canonical implementation lives in supabase/functions/_shared/masterSelector.ts
 * This file maintains backward compatibility for existing imports.
 * 
 * For full crisis-aware matching with 13 temple guides, use the server-side
 * selectMaster with context type 'crisis_triage'.
 */

import { selectMaster } from '../../supabase/functions/_shared/masterSelector';

export type { GuidanceCategory, MasterMatchResult, CrisisResource } from "@/temple/types";

export function checkCrisis(text: string): boolean {
  const CRISIS_KEYWORDS = [
    "suicid", "kill myself", "end it all", "hurt myself", "don't want to live",
    "want to die", "self harm", "cutting", "overdose", "harm others",
    "killing", "murder", "mujhe mar", "khudkushi", "jaan se maaro",
  ];
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function categorizeProblem(text: string): "heartbreak" | "grief" | "intrusive-thoughts" | "anxiety" | "depression" | "anger" | "job-crisis" | "financial-stress" | "family-conflict" | "addiction" | "sleep" | "purpose-confusion" | "spiritual-guidance" | "decision-making" | "other" {
  // Simplified - in practice, call server-side selectMaster with crisis_triage
  const lower = text.toLowerCase();
  const categories = [
    "heartbreak", "grief", "intrusive-thoughts", "anxiety", "depression", "anger",
    "job-crisis", "financial-stress", "family-conflict", "addiction", "sleep",
    "purpose-confusion", "spiritual-guidance", "decision-making", "other"
  ] as const;
  return "other"; // Placeholder - real logic on server
}

/**
 * @deprecated Use server-side selectMaster with context type 'crisis_triage' or 'daily_planning'
 * This client-side version is kept for backward compatibility only.
 */
export function matchMasterForGuidance(text: string): {
  isCrisis: boolean;
  category: string;
  topMasters: Array<{ masterId: string; confidence: number; reason: string }>;
  resources?: any[];
} {
  const isCrisis = checkCrisis(text);
  const category = categorizeProblem(text);

  // Fallback to simple mode-based selection
  const fallback = { masterId: "rumi", confidence: 0.5, reason: "Fallback - server-side matching recommended" };

  return { isCrisis, category, topMasters: [fallback], resources: isCrisis ? [] : undefined };
}