import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { V2_PROGRAMS, getV2ProgramById } from "@/data/programs/v2";
import { composeProgramSession, estimateRemaining, isProgramComplete } from "@/data/programs/v2/engine";
import type { GeneratedSession, SessionProgram } from "@/data/programs/v2/types";

export interface V2Enrollment {
  id: string;
  user_id: string;
  program_id: string;
  current_session: number;
  current_phase: string;
  user_level: number;
  recent_quality: number[];
  status: string;
  started_at: string;
  completed_at: string | null;
}

export function useActiveV2Enrollment() {
  return useQuery({
    queryKey: ["v2-enrollment-active"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("session_program_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as V2Enrollment | null;
    },
  });
}

export function useEnrollV2Program() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (program: SessionProgram) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      // mark any existing active v2 as paused (one at a time)
      await (supabase as any)
        .from("session_program_enrollments")
        .update({ status: "paused" })
        .eq("user_id", user.id)
        .eq("status", "active");
      const { data, error } = await (supabase as any)
        .from("session_program_enrollments")
        .insert({
          user_id: user.id,
          program_id: program.id,
          current_session: 1,
          current_phase: program.arc[0]?.phase ?? "Foundation",
          user_level: program.arc[0]?.levelRange[0] ?? 0,
          recent_quality: [],
          status: "active",
        })
        .select()
        .single();
      if (error) throw error;
      return data as V2Enrollment;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["v2-enrollment-active"] });
      toast({ title: "Program started", description: "Your first session is ready." });
    },
    onError: (e: any) => {
      toast({ title: "Could not start", description: e?.message || "Try again.", variant: "destructive" });
    },
  });
}

export function useCompleteV2Session() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      enrollment,
      qualityScore,
      reflectText,
    }: { enrollment: V2Enrollment; qualityScore: number; reflectText?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const program = getV2ProgramById(enrollment.program_id);
      if (!program) throw new Error("Program not found");

      // log progress row
      await (supabase as any).from("session_program_progress").insert({
        enrollment_id: enrollment.id,
        user_id: user.id,
        session_index: enrollment.current_session,
        phase: enrollment.current_phase,
        level: enrollment.user_level,
        teach_done: true,
        practice_done: true,
        reflect_text: reflectText || null,
        quality_score: qualityScore,
        completed_at: new Date().toISOString(),
      });

      const recent = [...(enrollment.recent_quality || []), qualityScore].slice(-3);
      const nextSession = enrollment.current_session + 1;
      const ctx = { sessionIndex: nextSession - 1, recentQuality: recent };
      const complete = isProgramComplete(program, ctx);

      const update: any = {
        current_session: complete ? enrollment.current_session : nextSession,
        recent_quality: recent,
      };
      if (complete) {
        update.status = "completed";
        update.completed_at = new Date().toISOString();
      } else {
        // recompute phase
        let cum = 0;
        for (const p of program.arc) {
          cum += p.sessions;
          if (nextSession <= cum) {
            update.current_phase = p.phase;
            break;
          }
        }
      }
      const { error } = await (supabase as any)
        .from("session_program_enrollments")
        .update(update)
        .eq("id", enrollment.id);
      if (error) throw error;
      return { complete };
    },
    onSuccess: ({ complete }) => {
      qc.invalidateQueries({ queryKey: ["v2-enrollment-active"] });
      toast({
        title: complete ? "🎉 Program complete" : "Session logged",
        description: complete ? "You've reached mastery threshold." : "On to the next session.",
      });
    },
  });
}

/** Compose the next session's content from program + enrollment state. */
export function getNextSession(enrollment: V2Enrollment, availableMinutes?: number): GeneratedSession | null {
  const program = getV2ProgramById(enrollment.program_id);
  if (!program) return null;
  return composeProgramSession(program, {
    sessionIndex: enrollment.current_session,
    userLevel: enrollment.user_level,
    recentQuality: enrollment.recent_quality || [],
    availableMinutes,
  });
}

export function getProgramRemaining(enrollment: V2Enrollment): number {
  const program = getV2ProgramById(enrollment.program_id);
  if (!program) return 0;
  return estimateRemaining(program, {
    sessionIndex: enrollment.current_session,
    recentQuality: enrollment.recent_quality || [],
  });
}

export { V2_PROGRAMS };
