import { supabase } from "@/lib/supabase";
import {
  setExtraIngredients,
  validateIngredients,
  type Ingredient,
} from "@/supabase/_shared/composer";

/**
 * Published content loads once per session and merges into the composer bank.
 * The in-file 48 remain the offline fallback, so a failure here is harmless.
 */

type ContentRow = {
  id: string;
  kind: string;
  label: string;
  summary: string | null;
  body: string | null;
  practice: string | null;
  depth: string;
  step_kind: string | null;
  params: Record<string, unknown> | null;
  icon: string | null;
  default_minutes: number | null;
  gate_fit: string[] | null;
  energy_fit: string[] | null;
  paths: string[] | null;
  dimensions: string[] | null;
  settles_chitta: string[] | null;
  loop_targets: string[] | null;
  loop_families: string[] | null;
  min_journey_day: number | null;
  safety_class: string | null;
  contraindications: string[] | null;
  requires_witness_stability: number | null;
  media_url: string | null;
};

function mapRow(row: ContentRow): Ingredient {
  return {
    id: row.id,
    kind: row.kind as Ingredient["kind"],
    label: row.label,
    summary: row.summary ?? undefined,
    body: row.body ?? undefined,
    practice: row.practice ?? undefined,
    depth: row.depth as Ingredient["depth"],
    stepKind: (row.step_kind ?? undefined) as Ingredient["stepKind"],
    params: (row.params ?? {}) as Ingredient["params"],
    icon: row.icon ?? undefined,
    defaultMinutes: row.default_minutes ?? undefined,
    gateFit: (row.gate_fit ?? []) as Ingredient["gateFit"],
    energyFit: (row.energy_fit ?? []) as Ingredient["energyFit"],
    paths: (row.paths ?? []) as Ingredient["paths"],
    dimensions: (row.dimensions ?? []) as Ingredient["dimensions"],
    settlesChitta: (row.settles_chitta ?? []) as Ingredient["settlesChitta"],
    loopTargets: row.loop_targets ?? [],
    loopFamilies: row.loop_families ?? [],
    minJourneyDay: row.min_journey_day ?? undefined,
  };
}

let loaded: Promise<number> | null = null;

/** Idempotent: resolves with the number of published ingredients merged. */
export function ensureContentBankLoaded(timeoutMs = 1200): Promise<number> {
  if (loaded) return loaded;

  loaded = (async () => {
    try {
      const query = supabase
        .from("content_ingredients" as never)
        .select("*")
        .eq("status", "published")
        .limit(1000);

      const timeout = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), timeoutMs),
      );

      const result = (await Promise.race([query, timeout])) as {
        data: ContentRow[] | null;
      };

      if (!Array.isArray(result?.data) || result.data.length === 0) return 0;

      const candidates = result.data.map(mapRow);
      const valid = candidates.filter((ing) => validateIngredients([ing]).length === 0);

      setExtraIngredients(valid);
      return valid.length;
    } catch {
      return 0;
    }
  })();

  return loaded;
}

/** Test/maintenance helper. */
export function resetContentBankLoader(): void {
  loaded = null;
  setExtraIngredients([]);
}
