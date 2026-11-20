import { useMemo } from "react";
import { SHOWROOM_PROGRAMS } from "@/data/showroomPrograms";
import { scorePrograms, topForYou, type ScoredProgram } from "@/lib/programPersonalization";
import type { UserConsciousnessProfile } from "@/types/database";

export interface SuggestedProgram extends ScoredProgram {
  isRecommended: boolean;
}

export function useSuggestedPrograms(profile: UserConsciousnessProfile | null | undefined, max = 3) {
  const programs = useMemo<SuggestedProgram[]>(() => {
    const assessData = (profile?.assessment_data ?? {}) as Record<string, unknown>;
    const analysis = (assessData.analysis ?? null) as Parameters<typeof scorePrograms>[1]["analysis"];
    const paths = (assessData.paths ?? null) as Parameters<typeof scorePrograms>[1]["paths"];
    const scored = scorePrograms(SHOWROOM_PROGRAMS, { analysis, paths });
    const top = topForYou(scored, max);
    if (top.length > 0) return top.map((s) => ({ ...s, isRecommended: s.score > 0 }));
    return SHOWROOM_PROGRAMS.slice(0, max).map((p) => ({ program: p, score: 0, reason: "", isRecommended: false }));
  }, [profile, max]);

  return {
    programs,
    recommended: programs.filter((p) => p.isRecommended),
    popular: programs.filter((p) => !p.isRecommended),
  };
}
