// Master Practice Registry
// Centralized registry over SessionStepDefinition (canonical practices).

import type { SessionStepDefinition } from "../types";
import { ALL_STEPS, getStepRegistry } from "../steps";

export interface PracticeQuery {
  category?: string;
  tag?: string;
  family?: string;
}

export const PracticeRegistry = {
  all(): SessionStepDefinition[] {
    return ALL_STEPS;
  },
  get(id: string): SessionStepDefinition | undefined {
    return getStepRegistry().steps.get(id);
  },
  byCategory(category: string): SessionStepDefinition[] {
    return getStepRegistry().byCategory.get(category) || [];
  },
  byTag(tag: string): SessionStepDefinition[] {
    return getStepRegistry().byTag.get(tag) || [];
  },
  search(query: PracticeQuery): SessionStepDefinition[] {
    let result = ALL_STEPS;
    if (query.category) result = result.filter((s) => s.category === query.category);
    if (query.tag) result = result.filter((s) => s.personalizationTags.includes(query.tag!));
    return result;
  },
  count(): number {
    return ALL_STEPS.length;
  },
  validate(): { valid: boolean; errors: string[] } {
    const ids = ALL_STEPS.map((s) => s.id);
    const errors: string[] = [];
    if (new Set(ids).size !== ids.length) errors.push("Duplicate practice ids");
    return { valid: errors.length === 0, errors };
  },
};

export default PracticeRegistry;
