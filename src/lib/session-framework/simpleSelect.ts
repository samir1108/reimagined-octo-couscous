// Simple framework selection logic.
// Picks one framework for a user given minimal context, with sensible defaults.
// Used by QuickSession and any "hold the orb → auto-compose" entry point.

import { selectFramework, buildContext } from "@/lib/session-framework";
import type { SessionFramework } from "@/lib/session-framework";

export interface SimpleSelectionInput {
  userId?: string;
  gate?: "morning" | "midday" | "evening" | "night";
  energy?: "low" | "medium" | "high";
  timeBudgetMin?: number;
  intention?: string;
  recentFrameworkIds?: string[];
}

export function pickFrameworkSimple(input: SimpleSelectionInput = {}): SessionFramework {
  const ctx = buildContext({
    userId: input.userId ?? "local",
    gate: input.gate ?? "morning",
    energy: input.energy ?? "medium",
    timeBudgetMin: input.timeBudgetMin ?? 10,
    recentFrameworkIds: input.recentFrameworkIds ?? [],
    preferences: input.intention ? { intention: input.intention } : {},
  });
  return selectFramework(ctx).selected;
}
