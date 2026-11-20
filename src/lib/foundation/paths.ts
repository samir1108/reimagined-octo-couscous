import type { AdaptivePath, FoundationExploration, TraditionId } from "./types";

export interface AdaptivePathProfile {
  path: AdaptivePath;
  label: string;
  emphasis: string;
  traditions: TraditionId[];
  exploration: FoundationExploration;
}

/**
 * Product-level recommendation layer. It never renames or replaces the four
 * yogic traditions; it only decides which optional exploration is offered.
 */
export const ADAPTIVE_PATHS: Record<AdaptivePath, AdaptivePathProfile> = {
  observer: {
    path: "observer",
    label: "Observer Path",
    emphasis: "Attention, witnessing and stillness",
    traditions: ["dhyana", "kriya"],
    exploration: {
      kind: "v-level",
      ref: "attention",
      label: "One extra minute of pure attention",
    },
  },
  inquirer: {
    path: "inquirer",
    label: "Inquirer Path",
    emphasis: "Discrimination, self-inquiry and texts",
    traditions: ["jnana"],
    exploration: {
      kind: "neti-neti",
      ref: "not-this",
      label: "A Neti-Neti pass over today's theme",
    },
  },
  integrator: {
    path: "integrator",
    label: "Integrator Path",
    emphasis: "Behaviour, missions and repair",
    traditions: ["karma", "tantra"],
    exploration: {
      kind: "text",
      ref: "karma-yoga",
      label: "One verse on action without attachment",
    },
  },
  devotional: {
    path: "devotional",
    label: "Devotional Path",
    emphasis: "Remembrance, gratitude and surrender",
    traditions: ["bhakti"],
    exploration: {
      kind: "guru",
      ref: "remembrance",
      label: "A short teaching on remembrance",
    },
  },
};

const TRADITION_TO_PATH: Record<TraditionId, AdaptivePath> = {
  dhyana: "observer",
  kriya: "observer",
  jnana: "inquirer",
  karma: "integrator",
  tantra: "integrator",
  bhakti: "devotional",
};

export function resolveAdaptivePath(
  affinity: Partial<Record<TraditionId, number>> | undefined
): AdaptivePath {
  if (!affinity) return "observer";
  let best: AdaptivePath = "observer";
  let bestScore = -Infinity;
  for (const [tradition, value] of Object.entries(affinity) as Array<[TraditionId, number | undefined]>) {
    if (typeof value !== "number") continue;
    const path = TRADITION_TO_PATH[tradition];
    if (!path) continue;
    if (value > bestScore) {
      bestScore = value;
      best = path;
    }
  }
  return best;
}
