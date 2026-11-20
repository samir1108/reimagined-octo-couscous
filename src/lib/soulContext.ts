/**
 * soulContext.ts — the bridge between the "Meet Yourself" onboarding
 * and every LLM prompt in the app.
 *
 * getSoulContextMessage(profile) → a single "system"-style string that any
 * edge function can prepend to their system prompt. Adiyogi, the Saptarishis,
 * the guru voices, the loop LLMs — none of them know this human until they
 * read this.
 *
 * Also exports the doorway-score computation used by Chamber 5.
 */
import type { PathSlug, Chamber, Question } from "@/data/onboarding/soulChambers";
import type { SoulProfileState } from "@/hooks/useSoulProfile";
import { ARCHETYPE_BY_SLUG, type ArchetypeSlug } from "@/data/onboarding/archetypes";
import { LOOP_FAMILY_BY_SLUG, type LoopFamilySlug } from "@/data/onboarding/loopFamilies";
import { COUNCIL_BY_SLUG, type CouncilSlug } from "@/data/onboarding/innerCouncil";

// ─── Doorway scoring (Chamber 5 diagnostic) ─────────────────────────────────
export function computeDoorwayScores(
  answers: Record<string, any>,
  chamber: Chamber,
): { scores: Record<PathSlug, number>; primary: PathSlug } {
  const scores: Record<PathSlug, number> = {
    bhakti: 0, jnana: 0, karma: 0, raja: 0, tantra: 0, shakti: 0,
  };
  const applyWeights = (w?: Partial<Record<PathSlug, number>>) => {
    if (!w) return;
    for (const k of Object.keys(w) as PathSlug[]) scores[k] += w[k] ?? 0;
  };
  for (const q of chamber.questions) {
    const v = answers[q.id];
    if (v == null) continue;
    if (q.kind === "single" && q.options) {
      const opt = q.options.find(o => o.value === v);
      applyWeights(opt?.weights);
    } else if (q.kind === "multi" && q.options && Array.isArray(v)) {
      for (const val of v) applyWeights(q.options.find(o => o.value === val)?.weights);
    }
  }
  const primary = (Object.entries(scores) as [PathSlug, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  return { scores, primary };
}

// Entry level 1..6 for the user's primary path, from depth signals.
export function computeEntryLevel(answers: Record<string, any>): number {
  const depth = answers["prior_depth"];
  const alreadyDoing: string[] = Array.isArray(answers["already_doing"]) ? answers["already_doing"] : [];
  const solitude = answers["solitude"];
  const lastCry = answers["last_cry"];
  let level = 1;
  if (depth === "few_apps") level = 2;
  else if (depth === "years") level = 3;
  else if (depth === "deep") level = 4;
  else if (depth === "teacher") level = 5;
  // Bonus: sitting practice + emotional access → move a level up (max 6)
  const somaticSignal = ["meditate", "breath", "yoga_body", "tantra"].filter(x => alreadyDoing.includes(x)).length;
  if (somaticSignal >= 2) level = Math.min(6, level + 1);
  if (solitude === "daily_hour" && ["month", "week"].includes(lastCry)) level = Math.min(6, level + 1);
  return level;
}

// ─── Chamber 8: archetype scoring ───────────────────────────────────────────
export function computeArchetype(answers: Record<string, any>): {
  primary: ArchetypeSlug | null; shadow: ArchetypeSlug | null;
} {
  const selfImg = answers["arch_self_image"] as ArchetypeSlug | undefined;
  const dread   = answers["arch_secret_dread"] as ArchetypeSlug | undefined;
  const move    = answers["arch_default_move"] as ArchetypeSlug | undefined;
  const scores: Record<string, number> = {};
  const add = (k?: string, w = 1) => { if (k) scores[k] = (scores[k] ?? 0) + w; };
  add(selfImg, 3); add(move, 2);
  const primary = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] as ArchetypeSlug) ?? selfImg ?? null;
  // Shadow: the twin of primary, or the "dread" (they name it directly).
  const shadow = dread ?? (primary ? ARCHETYPE_BY_SLUG[primary].shadowTwin : null);
  return { primary, shadow };
}

// ─── Chamber 9: active loop families ────────────────────────────────────────
export function computeActiveLoops(answers: Record<string, any>): { slug: LoopFamilySlug; severity: number }[] {
  const active: LoopFamilySlug[] = Array.isArray(answers["loops_active"]) ? answers["loops_active"] : [];
  const dominant = answers["loops_dominant"] as LoopFamilySlug | undefined;
  const sev = Number(answers["loops_severity"] ?? 3);
  return active.map(slug => ({
    slug,
    severity: slug === dominant ? Math.min(5, sev + 1) : Math.max(1, sev - 1),
  }));
}

// ─── Chamber 10: band ───────────────────────────────────────────────────────
export function computeBand(answers: Record<string, any>) {
  return {
    minutes_per_day: Number(answers["band_minutes"] ?? 10),
    tempo: (answers["band_tempo"] as "gentle" | "moderate" | "fierce" | "monastic") ?? "moderate",
    time_of_day: answers["band_time_of_day"] ?? null,
    body_limits: Array.isArray(answers["band_body_limits"]) ? answers["band_body_limits"] : [],
  };
}

// ─── Chamber 11: inner council ──────────────────────────────────────────────
export function computeCouncil(answers: Record<string, any>): {
  chosen: CouncilSlug[]; excluded: CouncilSlug[]; language: string | null;
} {
  const chosen: CouncilSlug[] = Array.isArray(answers["council_choose"]) ? answers["council_choose"] : [];
  const excludedRaw: CouncilSlug[] = Array.isArray(answers["council_never"]) ? answers["council_never"] : [];
  const excluded = excludedRaw.filter(x => (x as string) !== "none");
  return { chosen, excluded, language: (answers["council_language"] as string) ?? null };
}

// ─── Chamber 12: witness baseline ───────────────────────────────────────────
export function computeWitnessBaseline(answers: Record<string, any>): number {
  const a = Number(answers["witness_gap_breath"] ?? 0);
  const b = Number(answers["witness_thought_as_thought"] ?? 0);
  const c = Number(answers["witness_sit_with_emotion"] ?? 0);
  // 3 scales of 1..5 → normalize to 1..10.
  const sum = a + b + c; // 3..15
  return Math.max(1, Math.round(((sum - 3) / 12) * 9 + 1));
}

// ─── System message builder ─────────────────────────────────────────────────
const PATH_LABEL: Record<PathSlug, string> = {
  bhakti: "Bhakti (devotion)",
  jnana: "Jnana (self-inquiry)",
  karma: "Karma (action)",
  raja: "Raja (meditation)",
  tantra: "Tantra (embodied yes)",
  shakti: "Shakti (awakened power)",
};

export function getSoulContextMessage(profile: SoulProfileState | null | undefined): string {
  if (!profile) return "";
  const chambersDone = profile.chambers_completed?.length ?? 0;
  if (chambersDone === 0) return "";

  const s = profile.derived ?? {};
  const surface: any = s.surface ?? {};
  const somatic: any = s.somatic ?? {};
  const psych: any = s.psychological ?? {};
  const karmic: any = s.karmic ?? {};
  const shadow: any = s.shadow ?? {};
  const prohibitions: any = s.prohibitions ?? {};
  const doorway: any = s.doorway ?? {};
  const arch: any = s.archetype ?? {};
  const loops: any = s.loops ?? {};
  const band: any = s.band ?? {};
  const council: any = s.council ?? {};
  const witness: any = s.witness ?? {};

  const lines: string[] = [];
  lines.push("──────── THIS HUMAN ────────");
  lines.push("You are speaking to a specific person. What follows is what they told the app about themselves. Honor it. Never quote it back verbatim unless they refer to it first.");
  lines.push("");

  if (surface.age_band || surface.life_stage) {
    lines.push(`Life: ${[surface.age_band, surface.life_stage, surface.work_state].filter(Boolean).join(" · ")}`);
  }
  if (surface.sleep_hours || surface.screen_hours || surface.movement || surface.solitude) {
    const bits: string[] = [];
    if (surface.sleep_hours != null) bits.push(`sleep ~${surface.sleep_hours}h`);
    if (surface.screen_hours != null) bits.push(`screen ~${surface.screen_hours}h`);
    if (surface.movement) bits.push(`movement: ${surface.movement}`);
    if (surface.solitude) bits.push(`solitude: ${surface.solitude}`);
    if (surface.food_relationship) bits.push(`food: ${surface.food_relationship}`);
    lines.push(`Body/day: ${bits.join(" · ")}`);
  }
  if (surface.one_honest_line) lines.push(`Their honest line about daily life: "${surface.one_honest_line}"`);

  if (somatic.arrival_state || somatic.arrival_body_tension) {
    lines.push(`Somatic (as of last arrival): state=${somatic.arrival_state ?? "?"}, tension=${somatic.arrival_body_tension ?? "?"}, breath=${somatic.arrival_breath ?? "?"}`);
  }

  if (psych.dominant_loop || psych.avoidance) {
    lines.push(`Psychology: dominant loop="${psych.dominant_loop ?? "?"}", coping="${psych.avoidance ?? "?"}", last cry=${psych.last_cry ?? "?"}`);
  }
  if (psych.inherited) lines.push(`Inherited pattern they don't want: ${psych.inherited}`);

  if (shadow.loudest_emotion || shadow.denied_emotion) {
    lines.push(`Shadow: loudest emotion=${shadow.loudest_emotion ?? "?"}, denied=${shadow.denied_emotion ?? "?"}${shadow.trigger_person ? `, trigger type: ${shadow.trigger_person}` : ""}`);
    lines.push("→ When you sense their denied emotion, do NOT push it. Reflect gently, let them come to it.");
  }

  if (karmic.stop_doing) lines.push(`They are here to stop: ${karmic.stop_doing}`);
  if (karmic.ideal_day) lines.push(`Their ideal ordinary day: "${karmic.ideal_day}"`);
  if (karmic.unlived) lines.push(`Unlived life: ${karmic.unlived}`);
  if (karmic.stop_pretending) lines.push(`Pretense they are ready to drop: ${karmic.stop_pretending}`);

  if (profile.vow_text) {
    lines.push("");
    lines.push(`THE VOW (their contract with themselves for 90 days):`);
    lines.push(`  "${profile.vow_text}"`);
    lines.push("→ Every reply either honors this vow or is silent about it. Do not lecture.");
  }

  if (profile.primary_path_slug) {
    lines.push("");
    lines.push(`DOORWAY: ${PATH_LABEL[profile.primary_path_slug as PathSlug] ?? profile.primary_path_slug}. Entry level: ${profile.primary_path_level ?? 1}.`);
    if (doorway.scores) {
      const rank = Object.entries(doorway.scores as Record<string, number>)
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
        .map(([k, v]) => `${k}:${v}`).join(" ");
      lines.push(`  Full path affinities: ${rank}`);
    }
    lines.push("→ Speak from this doorway unless a different one is clearly called for by their question.");
  }

  if (profile.archetype_primary) {
    const a = ARCHETYPE_BY_SLUG[profile.archetype_primary];
    const sh = profile.archetype_shadow ? ARCHETYPE_BY_SLUG[profile.archetype_shadow] : null;
    lines.push("");
    lines.push(`ARCHETYPE: ${a.name} — ${a.oneLine}`);
    lines.push(`  Gift to honor: ${a.gift}`);
    lines.push(`  Shadow to watch: ${a.shadow}`);
    if (sh) lines.push(`  Exiled twin (what their soul avoids being): ${sh.name} — ${sh.oneLine}`);
  }

  if (profile.active_loop_families && profile.active_loop_families.length) {
    lines.push("");
    lines.push("ACTIVE LOOP FAMILIES (in descending severity):");
    for (const l of [...profile.active_loop_families].sort((x, y) => y.severity - x.severity)) {
      const f = LOOP_FAMILY_BY_SLUG[l.slug];
      if (!f) continue;
      lines.push(`  • ${f.name} (severity ${l.severity}/5): ${f.oneLine}`);
    }
    lines.push("→ Surface practices from these families first. Do not offer families they did not name.");
  }

  if (profile.practice_band || band.minutes_per_day) {
    const mins = profile.practice_minutes_per_day ?? band.minutes_per_day;
    const tempo = profile.practice_band ?? band.tempo;
    const bits: string[] = [];
    if (mins) bits.push(`${mins} min/day available`);
    if (tempo) bits.push(`${tempo} tempo`);
    if (band.time_of_day) bits.push(`window: ${band.time_of_day}`);
    lines.push("");
    lines.push(`PRACTICE BAND: ${bits.join(" · ")}`);
    if (Array.isArray(band.body_limits) && band.body_limits.filter((x: string) => x !== "none").length) {
      lines.push(`  Body/medical limits to honor: ${band.body_limits.filter((x: string) => x !== "none").join(", ")}`);
      lines.push("  → NEVER prescribe practices that violate these limits. Offer alternatives.");
    }
    lines.push("  → Never suggest a practice longer than the available minutes/day.");
  }

  if (profile.inner_council && profile.inner_council.length) {
    lines.push("");
    lines.push(`INNER COUNCIL (they chose these voices):`);
    for (const slug of profile.inner_council) {
      const g = COUNCIL_BY_SLUG[slug];
      if (g) lines.push(`  • ${g.name}: ${g.systemHint}`);
    }
    const excluded: string[] = Array.isArray(council.excluded) ? council.excluded : [];
    if (excluded.length) {
      lines.push(`  EXCLUDED voices (never use): ${excluded.join(", ")}`);
    }
    if (council.language) {
      lines.push(`  Preferred language register: ${council.language}`);
    }
  }

  if (profile.witness_baseline != null) {
    lines.push("");
    lines.push(`WITNESS BASELINE: ${profile.witness_baseline}/10 (${
      profile.witness_baseline <= 3 ? "still identified with content" :
      profile.witness_baseline <= 6 ? "witness available in flashes" :
      "witness stable — do not over-explain"
    })`);
    if (witness.witness_i_am) lines.push(`  Response to 'I am' calibration: ${witness.witness_i_am}`);
    if (witness.witness_first_taste) lines.push(`  Their first taste of stepping-out-of-self: "${witness.witness_first_taste}"`);
  }

  if (prohibitions.never_say) {
    lines.push("");
    lines.push("HARD PROHIBITIONS (they explicitly asked you never to say):");
    lines.push(`  ${prohibitions.never_say}`);
    lines.push("→ These are not preferences. Do not use these words, tones, or framings.");
  }

  lines.push("");
  lines.push(`Chambers of the ritual completed: ${chambersDone}/12. Do not ask them to repeat what they already told the app.`);
  lines.push("────────────────────────────");

  return lines.join("\n");
}

// Convenience: fetch the profile from Cloud for a given userId (server-side use).
export async function fetchSoulProfileFor(userId: string, supabaseClient: any): Promise<SoulProfileState | null> {
  const { data } = await supabaseClient
    .from("soul_profile").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  const completed: number[] = [];
  for (let i = 1; i <= 12; i++) if (data[`chamber_${i}_completed_at`]) completed.push(i);
  return {
    answers: data.answers ?? {},
    derived: data.derived ?? {},
    chambers_completed: completed,
    primary_path_slug: data.primary_path_slug ?? null,
    primary_path_level: data.primary_path_level ?? null,
    vow_text: data.vow_text ?? null,
    vow_set_at: data.vow_set_at ?? null,
    vow_expires_at: data.vow_expires_at ?? null,
    fully_completed_at: data.fully_completed_at ?? null,
    archetype_primary: data.archetype_primary ?? null,
    archetype_shadow: data.archetype_shadow ?? null,
    active_loop_families: data.active_loop_families ?? [],
    practice_band: data.practice_band ?? null,
    practice_minutes_per_day: data.practice_minutes_per_day ?? null,
    inner_council: data.inner_council ?? [],
    witness_baseline: data.witness_baseline ?? null,
  };
}
