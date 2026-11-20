/**
 * capabilityMap — capability-domain selectors over the programs and games
 * catalogues.
 *
 * This module is the runtime seam the Programs and Games pages filter through.
 * The domain model itself lives in `@/types/capability` (types) and
 * `@/data/capabilities/capabilities` (definitions); this file only answers
 * "give me everything tagged with this domain / category".
 */

import { ALL_PROGRAMS, type ProgramDefinition } from "./programs/programs";
import { GAMES, type GameDefinition } from "./games/games";

export type {
  CapabilityDomain,
  CapabilityId,
  CapabilityLevel,
  CapabilityState,
  UserCapabilityMap,
} from "@/types/capability";

/** Every program that trains a capability inside `domain`. */
export function getProgramsByDomain(domain: string): ProgramDefinition[] {
  if (!domain) return [];
  return ALL_PROGRAMS.filter((p) => p.domain === domain);
}

/** Every game bucketed under `category`. */
export function getGamesByCategory(category: string): GameDefinition[] {
  if (!category) return [];
  return Object.values(GAMES).filter((g) => g.category === category);
}
