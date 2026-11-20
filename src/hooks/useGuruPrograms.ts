import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";
import { GURUS } from "@/lib/guru-data";

export interface GuruProgramEnrollment {
  id: string;
  user_id: string;
  guru_id: string;
  program_title: string;
  program_description: string;
  duration_days: number;
  current_day: number;
  status: string;
  program_curriculum: any;
  started_at: string;
  completed_at: string | null;
}

export interface GuruProgram {
  title: string;
  description: string;
  duration_days: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  focus: string;
  daily_overview: string;
}

export function useActiveGuruProgram() {
  return useQuery({
    queryKey: ["active-guru-program"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("guru_program_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as GuruProgramEnrollment | null;
    },
  });
}

export function useGuruProgramCatalog(guruId: string | null) {
  return useQuery({
    queryKey: ["guru-program-catalog", guruId],
    enabled: !!guruId,
    staleTime: Infinity,
    queryFn: async () => {
      const guru = GURUS.find(g => g.id === guruId);
      if (!guru?.programs) return [];
      return guru.programs.map((p: any) => ({
        title: p.title,
        description: p.description,
        duration_days: p.durationDays || p.duration_days || 7,
        difficulty: p.difficulty || "beginner",
        focus: p.focus || "",
        daily_overview: p.dailyOverview || p.daily_overview || "",
      })) as GuruProgram[];
    },
  });
}

export function useEnrollGuruProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ guruId, program }: { guruId: string; program: GuruProgram }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check no active guru program or regular program
      const { data: existing } = await (supabase as any)
        .from("guru_program_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1);
      if (existing && existing.length > 0) {
        throw new Error("You already have an active guru program. Leave it first.");
      }

      const { data, error } = await (supabase as any)
        .from("guru_program_enrollments")
        .insert({
          user_id: user.id,
          guru_id: guruId,
          program_title: program.title,
          program_description: program.description,
          duration_days: program.duration_days,
          current_day: 1,
          status: "active",
          program_curriculum: program,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-guru-program"] });
      toast({ title: "🙏 Program started!", description: "Your journey with the master begins tomorrow." });
    },
    onError: (e: any) => {
      consciousFromError(e, "actionMissed");
    },
  });
}

export function useLeaveGuruProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await (supabase as any)
        .from("guru_program_enrollments")
        .update({ status: "abandoned" })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-guru-program"] });
      toast({ title: "Program left", description: "You can start a new program anytime." });
    },
  });
}

export function useCompleteGuruProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await (supabase as any)
        .from("guru_program_enrollments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-guru-program"] });
      toast({ title: "🎉 Program completed!", description: "The master is pleased with your dedication." });
    },
  });
}

export function useAdvanceGuruProgramDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enrollment: GuruProgramEnrollment) => {
      const nextDay = enrollment.current_day + 1;
      if (nextDay > enrollment.duration_days) {
        // Complete the program
        const { error } = await (supabase as any)
          .from("guru_program_enrollments")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", enrollment.id);
        if (error) throw error;
        return { completed: true };
      }
      const { error } = await (supabase as any)
        .from("guru_program_enrollments")
        .update({ current_day: nextDay })
        .eq("id", enrollment.id);
      if (error) throw error;
      return { completed: false, nextDay };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["active-guru-program"] });
      if (result.completed) {
        toast({ title: "🎉 Program completed!", description: "The master is pleased with your dedication." });
      }
    },
  });
}
