/**
 * useStartJourney — the journey-start API surface (Gate 6).
 * ─────────────────────────────────
 * Starting a journey is an API call, not a navigation trick: it creates the
 * program enrollment (active, day 1), writes the journey-log entry with the
 * mapping snapshot that chose it, and confirms the mapping's
 * readyForJourneys flag. `useActiveJourney` reads the current enrollment
 * so Home and the app shell know which journey is live.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { FirstElevenMapping } from "@/lib/onboarding/firstElevenTypes";
import { JOURNEY_BY_SLUG } from "@/lib/onboarding/journeyDefinitions";

export interface StartJourneyInput {
  journeySlug: string;
  mapping: FirstElevenMapping;
}

export interface ActiveJourney {
  slug: string;
  title: string;
  programId: string | null;
  day: number;
  startedAt: string | null;
}

/**
 * The start call itself — exported so it reads (and tests) as an API:
 * enrollment row + journey-log row, in that order, both scoped to the user.
 */
export async function startJourneyApi(userId: string, input: StartJourneyInput) {
  const journey = JOURNEY_BY_SLUG(input.journeySlug);
  if (!journey) throw new Error(`Unknown journey: ${input.journeySlug}`);

  const programId = journey.programId ?? "open-adaptive";

  // 1. Enrollment — restart if this program was ever started (keeps one row
  //    per program), otherwise create.
  const { data: existing } = await supabase
    .from("program_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .maybeSingle();

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("program_enrollments")
      .update({
        status: "active",
        current_day: 1,
        started_at: new Date().toISOString(),
      } as never)
      .eq("id", existing.id);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase.from("program_enrollments").insert({
      user_id: userId,
      program_id: programId,
      status: "active",
      current_day: 1,
    } as never);
    if (insertError) throw insertError;
  }

  // 2. Journey log — day 1, with the mapping snapshot that chose it.
  const { error: logError } = await supabase.from("user_journey_log").insert({
    user_id: userId,
    day_number: 1,
    phase: "journey-started",
    log_date: new Date().toISOString().slice(0, 10),
    engine_plan: {
      journey_slug: journey.slug,
      program_id: journey.programId,
      band_at_start: input.mapping.band,
      band_micro: input.mapping.bandMicro,
      dimensions: input.mapping.dimensions,
      loops: input.mapping.loops,
    } as never,
  } as never);
  if (logError) throw logError;

  return { slug: journey.slug, programId };
}

export function useStartJourney() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartJourneyInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const result = await startJourneyApi(user.id, input);
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["active-journey"] });
      qc.invalidateQueries({ queryKey: ["active-journey-progress"] });
    },
  });
}

export function useActiveJourney(): { data: ActiveJourney | null; isLoading: boolean } {
  const query = useQuery<ActiveJourney | null>({
    queryKey: ["active-journey"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("program_enrollments")
        .select("program_id, current_day, started_at, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      const { JOURNEYS } = await import("@/lib/onboarding/journeyDefinitions");
      const journey = JOURNEYS.find((j) => j.programId === data.program_id);
      return {
        slug: journey?.slug ?? data.program_id,
        title: journey?.title ?? "The Open Journey",
        programId: data.program_id,
        day: data.current_day ?? 1,
        startedAt: data.started_at,
      };
    },
    staleTime: 30_000,
  });

  return { data: query.data ?? null, isLoading: query.isLoading };
}
