/**
 * Practice atoms — the authored material the bank multiplies.
 *
 * A framework is a whole arc (arrival → core → integration). A technique is a
 * single movement. Both become atoms so a 1-second impulse and a 12-hour vigil
 * can draw from the same authored corpus instead of invented filler.
 */
import {
  FRAMEWORK_CATALOG,
  TECHNIQUE_CATALOG,
  type FrameworkCategory,
  type FrameworkDifficulty,
  type SessionFramework,
  type FrameworkTechnique,
} from "@/lib/session-frameworks";

export type PracticeAtomKind = "framework" | "technique";

export interface PracticeAtom {
  id: string;
  kind: PracticeAtomKind;
  title: string;
  purpose: string;
  category: FrameworkCategory | string;
  tradition: string;
  difficulty: FrameworkDifficulty | "beginner" | "intermediate" | "advanced";
  /** Human names of the techniques this atom can rotate through. */
  techniques: string[];
  stages: string[];
  minSeconds: number;
  defaultSeconds: number;
  modalities: string[];
}

const TECHNIQUE_BY_ID = new Map<string, FrameworkTechnique>(
  TECHNIQUE_CATALOG.map((technique) => [technique.id, technique]),
);

export const TECHNIQUE_TITLE: Record<string, string> = TECHNIQUE_CATALOG.reduce(
  (acc, technique) => {
    acc[technique.id] = technique.name;
    return acc;
  },
  {} as Record<string, string>,
);

function frameworkAtom(framework: SessionFramework): PracticeAtom {
  const techniques = framework.compatibleTechniques
    .map((id) => TECHNIQUE_BY_ID.get(id))
    .filter((technique): technique is FrameworkTechnique => Boolean(technique));

  return {
    id: `fw:${framework.id}`,
    kind: "framework",
    title: framework.name,
    purpose: framework.primaryGoal,
    category: framework.category,
    tradition: framework.tradition,
    difficulty: framework.difficulty,
    techniques: techniques.length
      ? techniques.map((technique) => technique.name)
      : framework.compatibleTechniques.map((id) => TECHNIQUE_TITLE[id] ?? id),
    stages: framework.stageSequence,
    minSeconds: Math.max(5, Math.round(framework.durationMinutes.min * 60)),
    defaultSeconds: Math.max(30, Math.round(framework.durationMinutes.default * 60)),
    modalities: framework.deliveryModes,
  };
}

function techniqueAtom(technique: FrameworkTechnique): PracticeAtom {
  return {
    id: `tech:${technique.id}`,
    kind: "technique",
    title: technique.name,
    purpose: technique.description,
    category: technique.category,
    tradition: "contemplative",
    difficulty: "beginner",
    techniques: [technique.name],
    stages: ["settling", "core_experience", "integration"],
    minSeconds: Math.max(1, Math.round((technique.defaultDurationMinutes || 1) * 60 * 0.25)),
    defaultSeconds: Math.max(30, Math.round((technique.defaultDurationMinutes || 1) * 60)),
    modalities: technique.compatibleModalities,
  };
}

export const PRACTICE_ATOMS: readonly PracticeAtom[] = [
  ...FRAMEWORK_CATALOG.map(frameworkAtom),
  ...TECHNIQUE_CATALOG.map(techniqueAtom),
];

export const PRACTICE_ATOMS_BY_ID: Record<string, PracticeAtom> = PRACTICE_ATOMS.reduce(
  (acc, atom) => {
    acc[atom.id] = atom;
    return acc;
  },
  {} as Record<string, PracticeAtom>,
);

export function getPracticeAtom(id: string): PracticeAtom | undefined {
  return PRACTICE_ATOMS_BY_ID[id];
}

export function practiceAtomCount(kind?: PracticeAtomKind): number {
  if (!kind) return PRACTICE_ATOMS.length;
  return PRACTICE_ATOMS.filter((atom) => atom.kind === kind).length;
}
