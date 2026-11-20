/**
 * useProgramDay — the active program layer for Home.
 *
 * Mirrors the enrollment resolution inside useThemeOfDay's compose path, but
 * as a standalone read so Home can show "which program is speaking today"
 * even when the theme was pre-composed:
 *   1. foundation-118 (program_enrollments)  → curriculum day
 *   2. guru program (guru_program_enrollments) → program_curriculum focus
 *   3. personalized program (program_enrollments) → program.curriculum day
 * Returns null when nothing is active — Home then stays theme-only.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getCourseDay, getPhaseForDay } from "@/data/foundation-course";
import { getProgramById } from "@/data/programs";
import { GURUS } from "@/lib/guru-data";

export interface ProgramDay {
  source: "foundation" | "guru" | "program";
  /** e.g. "Foundation · Day 12" or "Shakti Sadhana · Day 4 of 21" */
  label: string;
  /** The day's title/focus, when the curriculum carries one */
  title?: string;
}

export function useProgramDay() {
  return useQuery<ProgramDay | null>({
    queryKey: ["home-program-day"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const uid = session.user.id;

      // 1 — Foundation course
      const { data: foundation } = await supabase
        .from("program_enrollments")
        .select("current_day, status")
        .eq("user_id", uid)
        .eq("program_id", "foundation-118")
        .eq("status", "active")
        .maybeSingle();

      if (foundation) {
        const day = Number(foundation.current_day) || 1;
        const curriculum = getCourseDay(day);
        const phase = getPhaseForDay(day);
        return {
          source: "foundation" as const,
          label: `Foundation · Day ${day}`,
          title: [curriculum?.title, phase?.name].filter(Boolean).join(" · ") || undefined,
        };
      }

      // 2 — Guru program
      const { data: guruEnrollment } = await supabase
        .from("guru_program_enrollments")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (guruEnrollment) {
        const day = Number(guruEnrollment.current_day) || 1;
        const total = Number(guruEnrollment.duration_days) || 0;
        const guru = GURUS.find((g) => g.id === guruEnrollment.guru_id);
        const raw = guruEnrollment.program_curriculum;
        const curriculum = (raw && typeof raw === "object" && !Array.isArray(raw)
          ? (raw as Record<string, unknown>)
          : {}) as { focus?: string };
        return {
          source: "guru" as const,
          label: `${guru?.name || guruEnrollment.program_title || "Your program"} · Day ${day}${total ? ` of ${total}` : ""}`,
          title: curriculum.focus || guruEnrollment.program_title || undefined,
        };
      }

      // 3 — Personalized program
      const { data: progEnrollment } = await supabase
        .from("program_enrollments")
        .select("program_id, current_day, status")
        .eq("user_id", uid)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (progEnrollment) {
        const program = getProgramById(progEnrollment.program_id);
        if (program) {
          const day = Math.max(1, Math.min(Number(progEnrollment.current_day) || 1, program.duration));
          const today = program.curriculum?.find((d) => d.day === day);
          return {
            source: "program" as const,
            label: `${program.title} · Day ${day} of ${program.duration}`,
            title: today?.theme || undefined,
          };
        }
      }

      return null;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}
