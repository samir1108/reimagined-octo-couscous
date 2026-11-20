// Session Framework Registry — Index

import { ALL_FRAMEWORKS as CORE_FRAMEWORKS } from "./core";
import { ALL_EXTENDED_FRAMEWORKS } from "./extended";
import { ALL_EXTRA_FRAMEWORKS } from "./more";
import type { SessionFramework, FrameworkRegistry } from "../types";

const _allFw = [...CORE_FRAMEWORKS, ...ALL_EXTENDED_FRAMEWORKS, ...ALL_EXTRA_FRAMEWORKS];
const _seenFw = new Set<string>();
export const FRAMEWORKS: SessionFramework[] = _allFw.filter((f) => {
  if (_seenFw.has(f.id)) return false;
  _seenFw.add(f.id);
  return true;
});

export function buildFrameworkRegistry(frameworks: SessionFramework[]): FrameworkRegistry {
  const byId = new Map<string, SessionFramework>();
  const byFamily = new Map<string, SessionFramework[]>();
  const byIntention = new Map<string, SessionFramework[]>();
  const byGate = new Map<string, SessionFramework[]>();

  for (const fw of frameworks) {
    byId.set(fw.id, fw);

    if (!byFamily.has(fw.family)) byFamily.set(fw.family, []);
    byFamily.get(fw.family)!.push(fw);

    for (const intent of fw.suitableIntentions) {
      if (!byIntention.has(intent)) byIntention.set(intent, []);
      byIntention.get(intent)!.push(fw);
    }

    for (const gate of fw.suitableGates || []) {
      if (!byGate.has(gate)) byGate.set(gate, []);
      byGate.get(gate)!.push(fw);
    }
  }

  return { frameworks: byId, byFamily, byIntention, byGate };
}

let _registry: FrameworkRegistry | null = null;

export function getFrameworkRegistry(): FrameworkRegistry {
  if (!_registry) {
    _registry = buildFrameworkRegistry(FRAMEWORKS);
  }
  return _registry;
}

export function getFrameworkById(id: string): SessionFramework | undefined {
  return getFrameworkRegistry().frameworks.get(id);
}

export function getFrameworksByFamily(family: string): SessionFramework[] {
  return getFrameworkRegistry().byFamily.get(family) || [];
}

export function getFrameworksByIntention(intention: string): SessionFramework[] {
  return getFrameworkRegistry().byIntention.get(intention) || [];
}

export function getFrameworksByGate(gate: string): SessionFramework[] {
  return getFrameworkRegistry().byGate.get(gate) || [];
}

export type { SessionFramework } from "../types";
