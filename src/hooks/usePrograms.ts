import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";

export interface ProgramEnrollment {
  id: string;
  user_id: string;
  program_id: string;
  started_at: string;
  current_day: number;
  status: string;
  completed_at: string | null;
  grace_days_used: number;
  last_completed_day_at: string | null;
}

export interface ProgramDayProgress {
  id: string;
  enrollment_id: string;
  user_id: string;
  day_number: number;
  knowledge_read: boolean;
  practice_done: boolean;
  reflection_text: string | null;
  completed_at: string | null;
}

export function useActiveEnrollment() {
  return useQuery({
    queryKey: ["active-program-enrollment"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("program_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ProgramEnrollment | null;
    },
  });
}

export function useDayProgress(enrollmentId: string | undefined, dayNumber: number) {
  return useQuery({
    queryKey: ["program-day-progress", enrollmentId, dayNumber],
    enabled: !!enrollmentId,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !enrollmentId) return null;
      const { data, error } = await (supabase as any)
        .from("program_day_progress")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("day_number", dayNumber)
        .maybeSingle();
      if (error) throw error;
      return data as ProgramDayProgress | null;
    },
  });
}

export function useAllDayProgress(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ["program-all-day-progress", enrollmentId],
    enabled: !!enrollmentId,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !enrollmentId) return [];
      const { data, error } = await (supabase as any)
        .from("program_day_progress")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .order("day_number", { ascending: true });
      if (error) throw error;
      return (data || []) as ProgramDayProgress[];
    },
  });
}

export function useEnrollProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (programId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check no active enrollment
      const { data: existing } = await (supabase as any)
        .from("program_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1);
      if (existing && existing.length > 0) {
        throw new Error("You already have an active program. Leave it first.");
      }

      const { data, error } = await (supabase as any)
        .from("program_enrollments")
        .insert({ user_id: user.id, program_id: programId, status: "active", current_day: 1 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-program-enrollment"] });
      toast({ title: "🎯 Program started!", description: "Your transformation journey begins today." });
    },
    onError: (e: any) => {
      consciousFromError(e, "actionMissed");
    },
  });
}

export function useLeaveProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await (supabase as any)
        .from("program_enrollments")
        .update({ status: "abandoned" })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-program-enrollment"] });
      queryClient.invalidateQueries({ queryKey: ["program-day-progress"] });
      queryClient.invalidateQueries({ queryKey: ["program-all-day-progress"] });
      toast({ title: "Program left", description: "You can start a new program anytime." });
    },
  });
}

export function useUpdateDayProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      dayNumber,
      updates,
    }: {
      enrollmentId: string;
      dayNumber: number;
      updates: Partial<Pick<ProgramDayProgress, "knowledge_read" | "practice_done" | "reflection_text" | "completed_at">>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upsert day progress
      const { data: existing } = await (supabase as any)
        .from("program_day_progress")
        .select("id, knowledge_read, practice_done")
        .eq("enrollment_id", enrollmentId)
        .eq("day_number", dayNumber)
        .maybeSingle();

      if (existing) {
        const merged = { ...existing, ...updates };
        // Auto-complete if all 3 steps done
        const isComplete = merged.knowledge_read && merged.practice_done && (updates.reflection_text || existing.reflection_text);
        const { error } = await (supabase as any)
          .from("program_day_progress")
          .update({
            ...updates,
            ...(isComplete ? { completed_at: new Date().toISOString() } : {}),
          })
          .eq("id", existing.id);
        if (error) throw error;
        return isComplete;
      } else {
        const isComplete = updates.knowledge_read && updates.practice_done && updates.reflection_text;
        const { error } = await (supabase as any)
          .from("program_day_progress")
          .insert({
            enrollment_id: enrollmentId,
            user_id: user.id,
            day_number: dayNumber,
            knowledge_read: false,
            practice_done: false,
            ...updates,
            ...(isComplete ? { completed_at: new Date().toISOString() } : {}),
          });
        if (error) throw error;
        return isComplete;
      }
    },
    onSuccess: (dayComplete, variables) => {
      queryClient.invalidateQueries({ queryKey: ["program-day-progress"] });
      queryClient.invalidateQueries({ queryKey: ["program-all-day-progress"] });
      if (dayComplete) {
        // Advance current_day on enrollment
        advanceDay(variables.enrollmentId, variables.dayNumber + 1, queryClient);
      }
    },
  });
}

async function advanceDay(enrollmentId: string, nextDay: number, queryClient: any) {
  await (supabase as any)
    .from("program_enrollments")
    .update({ current_day: nextDay, last_completed_day_at: new Date().toISOString() })
    .eq("id", enrollmentId);
  queryClient.invalidateQueries({ queryKey: ["active-program-enrollment"] });
}

export function useCompleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await (supabase as any)
        .from("program_enrollments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-program-enrollment"] });
      toast({ title: "🎉 Program completed!", description: "Incredible journey! You did it." });
    },
  });
}
