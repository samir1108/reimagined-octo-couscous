import { FOUNDATION_QUESTIONS, type FoundationQuestion, type Brain, type PathId } from "./foundationQuestions";
import { ARCHETYPES, type ArchetypeSlug } from "@/data/onboarding/archetypes";

export type FoundationAnswers = Record<string, string | number | string[]>;

export interface FoundationAnalysis {
  band: number;
  bandLabel: string;
  brain: Brain;
  brainScores: Record<Brain, number>;
  loops: string[];
  loopCounts: Record<string, number>;
  loopRoot: string;
  loopRootLabel: string;
  loopFamilyCounts: Record<string, number>;
  pathAffinity: Record<PathId, number>;
  suggestedSecondary: PathId[];
  reThinkTheme: string;
  archetypePrimary: ArchetypeSlug;
  archetypeShadow: ArchetypeSlug;
}

const FAMILY_LABELS: Record<string, string> = {
  VAL: "Worth & validation",
  CTL: "Control & worry",
  AVD: "Avoidance",
  SRV: "Survival & fight-flight",
  BOD: "Body & fatigue",
  ENR: "Energy & burnout",
  EMO: "Emotional weather",
  MEN: "Overthinking",
  BHV: "Behavioural",
  HAB: "Habits",
  SOC: "Social",
  REL: "Relationships",
  IDN: "Identity",
  EGO: "Ego defence",
  BLF: "Core beliefs",
  PUR: "Purpose",
  SPR: "Spiritual",
  PRD: "Productivity",
  COG: "Cognitive bias",
  MOT: "Motivation",
};

const BAND_LABELS: Record<number, string> = {
  0: "Sleeper",
  1: "Stirring",
  2: "Questioner",
  3: "Seeker",
  4: "Observer",
  5: "Alchemist",
  6: "Navigator",
  7: "Architect",
  8: "Channel",
  9: "Source",
  10: "Witness",
};

export function analyzeFoundation(answers: FoundationAnswers): FoundationAnalysis {
  const brainScores: Record<Brain, number> = { head: 0, heart: 0, gut: 0 };
  const loopCounts: Record<string, number> = {};
  const pathAffinity: Record<PathId, number> = {
    kriya: 0, karma: 0, bhakti: 0, jnana: 0, tantra: 0, dhyana: 0,
  };
  const bandSamples: number[] = [];
  const archetypeVotes: Record<string, number> = {};
  let reThinkTheme = "Mixed";

  for (const q of FOUNDATION_QUESTIONS) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null || raw === "") continue;

    if (q.kind === "choice") {
      const selected = Array.isArray(raw)
        ? q.options.filter((o) => raw.includes(o.id))
        : q.options.filter((o) => o.id === raw);

      for (const opt of selected) {
        if (typeof opt.band === "number") bandSamples.push(opt.band);
        if (opt.brain) brainScores[opt.brain] += 1;
        if (opt.loops) {
          for (const id of opt.loops) {
            loopCounts[id] = (loopCounts[id] ?? 0) + 1;
          }
        }
        if (opt.paths) {
          for (const [k, v] of Object.entries(opt.paths)) {
            pathAffinity[k as PathId] += v ?? 0;
          }
        }
        if (opt.archetype) {
          archetypeVotes[opt.archetype] = (archetypeVotes[opt.archetype] ?? 0) + 1;
        }
        if (q.id === "re_think") {
          reThinkTheme = opt.label;
        }
      }
    } else if (q.kind === "scale") {
      const v = Number(raw);
      if (q.scoreAs === "discomfort_tolerance") {
        bandSamples.push(1 + v);
        if (v >= 3) pathAffinity.dhyana += 1;
      }
      if (q.scoreAs === "intuition_trust") {
        bandSamples.push(v);
        if (v >= 4) pathAffinity.bhakti += 1;
      }
    }
  }

  const band = bandSamples.length
    ? Math.max(0, Math.min(10, Number((bandSamples.reduce((a, b) => a + b, 0) / bandSamples.length).toFixed(1))))
    : 1;
  const bandLabel = BAND_LABELS[Math.round(band)] ?? "Seeker";

  const brain = (Object.entries(brainScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "head") as Brain;

  const loops = Object.entries(loopCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const loopFamilyCounts: Record<string, number> = {};
  for (const [id, n] of Object.entries(loopCounts)) {
    const fam = id.slice(0, 3).toUpperCase();
    loopFamilyCounts[fam] = (loopFamilyCounts[fam] ?? 0) + n;
  }
  const loopRoot = Object.entries(loopFamilyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const loopRootLabel = FAMILY_LABELS[loopRoot] ?? "Mixed patterns";

  const suggestedSecondary = (Object.entries(pathAffinity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id as PathId));

  const archetypePrimary = (Object.entries(archetypeVotes)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "seeker") as ArchetypeSlug;
  const archetype = ARCHETYPES.find((a) => a.slug === archetypePrimary);
  const archetypeShadow = archetype?.shadowTwin || "hermit";

  return {
    band, bandLabel, brain, brainScores,
    loops, loopCounts, loopRoot, loopRootLabel, loopFamilyCounts,
    pathAffinity, suggestedSecondary,
    reThinkTheme,
    archetypePrimary,
    archetypeShadow,
  };
}

export function toPathfinderAnswers(analysis: FoundationAnalysis): Record<string, number> {
  const scaled = Math.min(7, Math.max(0, Math.round((analysis.band / 10) * 7)));
  const head = analysis.brainScores.head;
  const heart = analysis.brainScores.heart;
  const gut = analysis.brainScores.gut;
  const tilt = (n: number) => Math.min(7, Math.max(0, scaled + (n > 0 ? 1 : 0)));
  return {
    reaction: tilt(gut),
    thought: tilt(head),
    happiness: scaled,
    relationship: tilt(heart),
    goal: scaled,
  };
}
