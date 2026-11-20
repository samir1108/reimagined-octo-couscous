/**
 * finishElderOnboarding — shared helper invoked at the end of the Elder
 * dialogue. Used both by QuickOnboarding (first-run) and ResumeElderBanner
 * (when the user paused mid-dialogue and finishes later from Home).
 *
 * After persisting the reading, it warms the engines (theme, programs,
 * predictive insights) and invalidates all React Query caches so that
 * Home, Analytics, Guide, Practice — every tab — reflects the new
 * baseline immediately, without needing a reload.
 */
import { supabase } from "@/lib/supabase";
import { DEFAULT_ACTIVE_DOMAINS } from "@/data/taskDomains";
import type { ElderReading, ElderTurn } from "@/components/onboarding/elder/ElderDialogue";
import type { LifestyleAnswers } from "@/components/onboarding/LifestylePersonalization";
import type { QueryClient } from "@tanstack/react-query";

export interface FinishArgs {
  userId: string;
  name: string;
  reading: ElderReading;
  history: ElderTurn[];
  chosenPath: ElderReading["recommendedPath"];
  /** Optional — collected on the LifestylePersonalization screen. When
   *  present, daily_anchors and lifestyle context are merged into the
   *  spiritual DNA assessment so reminders and recommendations adapt. */
  lifestyle?: LifestyleAnswers;
  updateAssessment: { mutate: (input: any) => void };
  assessStartingLevels: { mutate: (input: any) => void };
  /** Optional — when provided, every cached query is invalidated so all
   *  tabs (Analytics, Home, Guide…) refresh against the new baseline. */
  queryClient?: QueryClient;
}

export async function finishElderOnboarding({
  userId,
  name,
  reading,
  history,
  chosenPath,
  lifestyle,
  updateAssessment,
  assessStartingLevels,
  queryClient,
}: FinishArgs): Promise<void> {
  // Build daily anchors from lifestyle answers (if collected) so the
  // off-app reminder system schedules notifications on the user's clock.
  const dailyAnchors: Record<string, string> = {};
  if (lifestyle) {
    if (lifestyle.wake_time)  dailyAnchors.wake = lifestyle.wake_time;
    if (lifestyle.sleep_time) dailyAnchors.sleep = lifestyle.sleep_time;
    if (lifestyle.work_start) dailyAnchors.work_start = lifestyle.work_start;
    if (lifestyle.work_end)   dailyAnchors.work_end = lifestyle.work_end;
    if (lifestyle.lunch_time) dailyAnchors.lunch = lifestyle.lunch_time;
    if (lifestyle.brush_time) dailyAnchors.brush = lifestyle.brush_time;
    if (lifestyle.bath_time)  dailyAnchors.bath = lifestyle.bath_time;
  }

  const profileUpdate: Record<string, unknown> = {
    display_name: name,
    onboarded: true,
    onboarding_path: chosenPath,
  };
  if (lifestyle) {
    profileUpdate.lifestyle = lifestyle;
    profileUpdate.wake_time = lifestyle.wake_time;
    profileUpdate.sleep_time = lifestyle.sleep_time;
    profileUpdate.occupation = lifestyle.occupation;
    profileUpdate.country = lifestyle.country;
  }

  const { error: profErr } = await supabase
    .from("profiles")
    .update(profileUpdate as any)
    .eq("user_id", userId);
  if (profErr) {
    await supabase.from("profiles").upsert(
      { user_id: userId, ...profileUpdate } as any,
      { onConflict: "user_id" }
    );
  }

  updateAssessment.mutate({
    dimension_bands: reading.bands,
    initial_band: reading.startingBand,
    archetype_hint: reading.archetype,
    onboarding_completed: true,
    user_name: name,
    calibration_source: "elder_dialogue_v1",
    starting_band: reading.startingBand,
    starting_phase: reading.startingPhase,
    starting_phase_name: reading.startingPhaseName,
    assigned_guru_id: reading.recommendedGuru,
    assigned_guru_name: reading.recommendedGuruName,
    quick_answers: {
      lifetime_path: chosenPath,
      lifetime_path_chosen_at: new Date().toISOString(),
      elder_history: history,
      head_heart_gut: reading.headHeartGut,
      top_loops: reading.topLoops,
      path_levels: reading.pathLevels,
      practice_levels: reading.practiceLevels,
      inner_faculties: reading.inner,
      life_context: reading.context,
      gunas: reading.gunas,
      energy: reading.energy,
      body: reading.body,
      observation: reading.observation,
      shadow_patterns: reading.shadowPatterns,
      life_domain_heat: reading.lifeDomainHeat,
      chosen_path: chosenPath,
      recommended_path: reading.recommendedPath,
      summary: reading.summary,
      // IPs #1/#2/#4 — new onboarding signal fields
      anchors: (reading as any).anchors ?? null,
      defense_style: (reading as any).defenseStyle ?? null,
      latency_stats: (reading as any).latencyStats ?? null,
      refusal_count: (reading as any).refusalCount ?? 0,
      lifestyle: lifestyle ?? null,
    } as any,
    onboarding_path: chosenPath,
    available_time_slots: ["morning", "midday", "evening", "night"],
  });

  // Read existing assessment_conversation so we don't clobber lifestyle
  // saved earlier on the LifestylePersonalization screen.
  const { data: existingAsmt } = await supabase
    .from("spiritual_dna_assessments")
    .select("assessment_conversation")
    .eq("user_id", userId)
    .maybeSingle();
  const existingConv = (existingAsmt?.assessment_conversation as Record<string, unknown>) || {};

  await supabase.from("spiritual_dna_assessments").upsert(
    {
      user_id: userId,
      available_time_daily: 30,
      circadian_type: "flexible",
      assessment_conversation: {
        ...existingConv,
        available_slots: ["morning", "midday", "evening", "night"],
        primary_slot: "morning",
        flexible_mode: true,
        rhythm_pattern: "unified",
        quick_band: reading.startingBand,
        quick_phase: reading.startingPhase,
        assigned_guru: reading.recommendedGuru,
        active_domains: DEFAULT_ACTIVE_DOMAINS,
        calibration_pending: false,
        onboarding_path: chosenPath,
        lifetime_path: chosenPath,
        lifetime_path_chosen_at: new Date().toISOString(),
        elder_reading: reading,
        lifestyle: lifestyle ?? (existingConv as any).lifestyle ?? null,
        daily_anchors: Object.keys(dailyAnchors).length
          ? dailyAnchors
          : (existingConv as any).daily_anchors ?? {},
      } as any,
    },
    { onConflict: "user_id" }
  );

  // Mirror anchors to localStorage so the reminders hook picks them up
  // immediately without waiting for the Supabase round-trip on next load.
  if (Object.keys(dailyAnchors).length) {
    try { localStorage.setItem("off_app_anchors_v1", JSON.stringify(dailyAnchors)); } catch {}
  }

  try {
    const { data: prof } = await supabase
      .from("user_consciousness_profile")
      .select("life_domains")
      .eq("user_id", userId)
      .single();
    const existing =
      prof?.life_domains && typeof prof.life_domains === "object"
        ? (prof.life_domains as Record<string, unknown>)
        : {};
    await supabase
      .from("user_consciousness_profile")
      .update({
        life_domains: { ...existing, active_domains: DEFAULT_ACTIVE_DOMAINS } as any,
      })
      .eq("user_id", userId);
  } catch (e) {
    console.warn("Could not persist active_domains:", e);
  }

  try {
    localStorage.setItem(`first_session_done_${userId}`, "1");
    localStorage.removeItem(`elder_paused_${userId}`);
    localStorage.removeItem(`elder_dialogue_${userId}`);
  } catch {
    /* ignore */
  }

  assessStartingLevels.mutate({
    answers: {
      emotion_response: String(reading.bands.emotion ?? 1),
      practice_history: String(Math.max(reading.pathLevels.raja, reading.pathLevels.jnana)),
      intent: chosenPath,
      belief: String(reading.startingBand),
    },
    band: reading.startingBand,
  });

  // ── Seed every analytics data source with what the Elder reading revealed,
  // so the Analytics tab is a real mirror on day one instead of a placeholder.
  // Every write is fire-and-forget via Promise.allSettled — a missing table or
  // an RLS mismatch degrades gracefully instead of blocking onboarding.
  const r: any = reading;
  const nowIso = new Date().toISOString();
  const source = "onboarding_elder_v2";
  const loops: any[] = Array.isArray(r.loops) ? r.loops : [];
  const council: any = r.council_take || {};
  const prescription: any = r.first_week_prescription || {};
  const nudges: string[] = Array.isArray(r.opening_nudges) ? r.opening_nudges : [];

  await Promise.allSettled([
    // dimension_map_scores — powers Dimension100Radial + Fractal
    supabase.from("dimension_map_scores").upsert(
      {
        user_id: userId,
        scores: reading.bands,
        inner_faculties: reading.inner ?? {},
        practice_levels: reading.practiceLevels ?? {},
        computed_at: nowIso,
        source,
      } as any,
      { onConflict: "user_id" }
    ),
    // user_psyche_profile — PsycheLayer + Council
    supabase.from("user_psyche_profile").upsert(
      {
        user_id: userId,
        gunas: reading.gunas ?? {},
        head_heart_gut: reading.headHeartGut,
        human_map: reading.humanMap ?? {},
        shadow_patterns: reading.shadowPatterns ?? [],
        council_take: council,
        first_week_prescription: prescription,
        updated_at: nowIso,
        source,
      } as any,
      { onConflict: "user_id" }
    ),
    // user_consciousness_profile — CScoreStrip, Overview, ProgressRing
    supabase.from("user_consciousness_profile").upsert(
      {
        user_id: userId,
        current_band: reading.startingBand,
        current_phase: reading.startingPhase,
        phase_name: reading.startingPhaseName,
        primary_path: chosenPath,
        assigned_guru: reading.recommendedGuru,
        archetype: reading.archetype,
        dimension_bands: reading.bands,
        updated_at: nowIso,
      } as any,
      { onConflict: "user_id" }
    ),
    // user_samskaras — PatternsLayer (top 5 loops as samskaras)
    ...(loops.slice(0, 5).map((l: any, i: number) =>
      supabase.from("user_samskaras").insert({
        user_id: userId,
        name: l.name,
        cluster: l.cluster,
        trigger: l.trigger ?? null,
        evidence: l.evidence_quote ?? null,
        severity: l.severity ?? 3,
        confidence: l.confidence ?? 0.6,
        loop_id: l.id ?? null,
        rank: i,
        source,
      } as any)
    )),
    // loop_attributions — LoopAttributionPanel
    ...(loops.map((l: any) =>
      supabase.from("loop_attributions").insert({
        user_id: userId,
        loop_id: l.id ?? null,
        loop_name: l.name,
        cluster: l.cluster,
        trigger: l.trigger ?? null,
        evidence_quote: l.evidence_quote ?? null,
        severity: l.severity ?? 3,
        confidence: l.confidence ?? 0.6,
        source,
        attributed_at: nowIso,
      } as any)
    )),
    // nudge_queue — 3 opening nudges surfaced in the first week
    ...(nudges.slice(0, 3).map((text: string) =>
      supabase.from("nudge_queue").insert({
        user_id: userId,
        text,
        source,
        priority: 1,
        scheduled_for: nowIso,
      } as any)
    )),
    // observation_tasks — WitnessLayer seed
    prescription.one_thing_to_notice
      ? supabase.from("observation_tasks").insert({
          user_id: userId,
          task: prescription.one_thing_to_notice,
          source,
          created_at: nowIso,
        } as any)
      : Promise.resolve(),
    // consciousness_signals — WitnessLayer + InsightsLayer baseline row
    supabase.from("consciousness_signals").insert({
      user_id: userId,
      signal_type: "baseline",
      value: reading.startingBand,
      metadata: {
        bands: reading.bands,
        gunas: reading.gunas,
        head_heart_gut: reading.headHeartGut,
      } as any,
      source,
      recorded_at: nowIso,
    } as any),
    // sessions — Overview streak + ReportsLayer (elder_reading counts as day 1)
    supabase.from("sessions").insert({
      user_id: userId,
      session_type: "elder_reading",
      duration_seconds: 60 * 45, // approx 45 min
      completed_at: nowIso,
      metadata: { archetype: reading.archetype, path: chosenPath } as any,
      source,
    } as any),
    // mirror_readings — Day-0 baseline for all 38 Mirrors, powers the
    // Mirror ring dashboard in Analytics. Upsert one row per mirror.
    ...(Array.isArray((r as any).mirrors) ? (r as any).mirrors : []).map((m: any) =>
      supabase.from("mirror_readings").upsert(
        {
          user_id: userId,
          mirror_number: m.n,
          mirror_slug: m.slug,
          title: m.title,
          module: m.module,
          score: m.score ?? 0,
          confidence: m.confidence ?? 0,
          band: m.band ?? "preliminary",
          evidence: m.evidence ?? null,
          reading_note: m.note ?? null,
          source,
          day_zero: true,
        } as any,
        { onConflict: "user_id,mirror_number" }
      )
    ),
  ]).catch(() => { /* seeds degrade gracefully */ });

  // ── Warm engines so the next session/theme reflects the new baseline.
  // Fire-and-forget; UI doesn't block on these.
  void Promise.allSettled([
    supabase.functions.invoke("evolve-theme", { body: { reason: "onboarding_complete" } }),
    supabase.functions.invoke("suggest-next-program", { body: { reason: "onboarding_complete", lifetime_path: chosenPath } }),
    supabase.functions.invoke("predictive-insights", { body: { reason: "onboarding_complete" } }),
  ]).catch(() => { /* engines warm on next read anyway */ });

  // ── Invalidate every cached query so Analytics/Home/Guide all rebuild
  // against the new bands, path, and practice levels. Broad invalidation is
  // safer than enumerating keys — onboarding completes once, cost is trivial.
  if (queryClient) {
    await queryClient.invalidateQueries();
  }
}
