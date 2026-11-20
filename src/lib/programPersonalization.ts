/**
 * Program personalization engine.
 * Reads the FoundationOnboarding result from localStorage / Supabase and
 * ranks programs by fit for the current user. Also returns a short
 * "why this fits you" reason line per program.
 */
import { supabase } from "@/lib/supabase";
import type { ShowroomProgram } from "@/data/showroomPrograms";
import type { FoundationAnalysis } from "@/lib/onboarding/foundationAnalyzer";

export interface PersonalizationProfile {
  analysis: FoundationAnalysis;
  paths?: { core: string; secondary: string[] };
}

/** Maps root-loop family → audience IDs this user should be nudged toward. */
const FAMILY_TO_AUDIENCE: Record<string, string[]> = {
  VAL: ["corporate", "founders", "creators"],
  CTL: ["corporate", "founders", "government"],
  AVD: ["healers", "creators"],
  SRV: ["government", "healers", "healthcare"],
  BOD: ["healthcare", "athletes"],
  ENR: ["healthcare", "corporate", "parents"],
  EMO: ["healers", "grief", "parents"],
  MEN: ["students", "creators", "founders"],
  BHV: ["healers", "athletes"],
  HAB: ["students", "athletes"],
  SOC: ["teachers", "parents"],
  REL: ["parents", "teachers", "grief"],
  IDN: ["healers", "ritual"],
  EGO: ["founders", "corporate"],
  BLF: ["ritual", "healers"],
  PUR: ["government", "teachers", "healers"],
  SPR: ["ritual", "healers"],
  PRD: ["corporate", "students", "founders"],
  COG: ["students", "founders"],
  MOT: ["athletes", "students"],
};

const FAMILY_LABEL: Record<string, string> = {
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

/** Path → category-of-program affinity (matches ShowroomProgram["category"]). */
const PATH_TO_CATEGORY: Record<string, string[]> = {
  kriya: ["nervous", "willpower"],
  karma: ["purpose", "decision"],
  bhakti: ["love"],
  jnana: ["decision", "self-inquiry", "knowledge"],
  tantra: ["art", "shadow"],
  dhyana: ["self-inquiry", "attention"],
};

export async function loadPersonalizationProfile(): Promise<PersonalizationProfile | null> {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) return null;
    const raw = localStorage.getItem(`foundation_result_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.analysis) return { analysis: parsed.analysis, paths: parsed.paths };
    }
    const { data: cp } = await (supabase as any)
      .from("user_consciousness_profile")
      .select("assessment_data")
      .eq("user_id", uid)
      .maybeSingle();
    const assess = cp?.assessment_data;
    if (assess?.analysis) return { analysis: assess.analysis, paths: assess.paths };
    return null;
  } catch {
    return null;
  }
}

export interface ScoredProgram {
  program: ShowroomProgram;
  score: number;
  reason: string;
}

export function scorePrograms(
  programs: ShowroomProgram[],
  profile: PersonalizationProfile | null,
): ScoredProgram[] {
  if (!profile || !profile.analysis) {
    return programs.map((p) => ({ program: p, score: 0, reason: "" }));
  }
  const { analysis, paths } = profile;
  const rootFamily = analysis.loopRoot;
  const wantedAudiences = new Set(FAMILY_TO_AUDIENCE[rootFamily] ?? []);
  const wantedCategories = new Set<string>();
  const secondaryPaths = paths?.secondary ?? analysis.suggestedSecondary ?? [];
  for (const p of secondaryPaths) {
    for (const c of PATH_TO_CATEGORY[p] ?? []) wantedCategories.add(c);
  }

  return programs
    .map((program) => {
      let score = 0;
      const reasons: string[] = [];

      if (program.audience && wantedAudiences.has(program.audience)) {
        score += 5;
        reasons.push(
          `Your root loop — ${FAMILY_LABEL[rootFamily] ?? "your pattern"} — is what this program rewires.`,
        );
      }
      if (program.category && wantedCategories.has(program.category)) {
        score += 3;
        if (reasons.length === 0) {
          const pathLabels = secondaryPaths.slice(0, 2).join(" + ");
          reasons.push(`Matches your path (${pathLabels}).`);
        }
      }
      // Band nudges: high-band → self-inquiry/knowledge programs, low-band → nervous/willpower.
      if (analysis.band >= 6 && (program.category === "self-inquiry" || program.category === "knowledge")) {
        score += 1;
      }
      if (analysis.band <= 3 && (program.category === "nervous" || program.category === "willpower")) {
        score += 1;
      }

      return { program, score, reason: reasons[0] ?? "" };
    })
    .sort((a, b) => b.score - a.score);
}

export function topForYou(scored: ScoredProgram[], n = 4): ScoredProgram[] {
  return scored.filter((s) => s.score > 0).slice(0, n);
}
