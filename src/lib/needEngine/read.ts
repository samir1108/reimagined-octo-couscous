/**
 * NEED ENGINE — reader
 * ────────────────────
 * Best-effort, read-only evidence collection. No table is treated as required:
 * a missing table means "no evidence yet", never a broken session.
 *
 * Sources:
 *   user_knowledge_nodes        concept familiarity / provenance
 *   sessions                    exposure + completed practice
 *   active_loops                relevance
 *   user_practice_constellation teach / train readiness
 *   user_consciousness_profile  dimension bands + overall band
 */

import { supabase } from "@/lib/supabase";
import { CONCEPTS, CONCEPT_IDS } from "./catalog";
import { computeFamiliarity, emptyConceptEvidenceMap } from "./familiarity";
import { detectNeed, type DetectOptions } from "./detect";
import type { ConceptEvidence, ConceptId, NeedDecision, NeedSignals } from "./types";

const KEYWORDS: Record<ConceptId, string[]> = {
  observation: ["observation", "observe", "sakshi", "noticing"],
  self_inquiry: ["self inquiry", "self-inquiry", "atma vichara", "who am i", "who am i?"],
  neti_neti: ["neti", "not this", "via negativa"],
  witness: ["witness", "drashta", "witnessing"],
  breath: ["breath", "pranayama", "anapana", "anapana"],
  body: ["body", "asana", "body scan", "somatic"],
};

const CONCEPT_PRACTICE_KEY: Record<ConceptId, string> = {
  observation: "observe",
  self_inquiry: "inquiry",
  neti_neti: "jnana",
  witness: "witness",
  breath: "breath",
  body: "body",
};

function textMatches(text: string, concept: ConceptId): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS[concept].some((k) => lower.includes(k));
}

function bump(
  map: Record<ConceptId, ConceptEvidence>,
  concept: ConceptId,
  patch: Partial<ConceptEvidence>,
): void {
  const current = map[concept];
  map[concept] = {
    ...current,
    exposureCount: current.exposureCount + (patch.exposureCount ?? 0),
    practiceCount: current.practiceCount + (patch.practiceCount ?? 0),
    selfReport: Math.max(current.selfReport, patch.selfReport ?? 0),
    lastAt:
      patch.lastAt && (!current.lastAt || new Date(patch.lastAt) > new Date(current.lastAt))
        ? patch.lastAt
        : current.lastAt,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function baseSignals(): NeedSignals {
  return {
    concepts: emptyConceptEvidenceMap(),
    activeLoops: [],
    stressedDomains: [],
    dimensionBands: {},
    overallBand: 0,
    energy: "medium",
    timeBudgetMin: 10,
    recentConceptIds: [],
    capabilityLevels: {},
  };
}

export interface ReadNeedOptions {
  energy?: "low" | "medium" | "high";
  timeBudgetMin?: number;
}

/**
 * Short-lived cache: Home asks for the next session on every focus/refresh.
 * Evidence changes at session boundaries, not per render.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; signals: NeedSignals }>();

export async function readNeedSignals(
  userId: string | null | undefined,
  opts: ReadNeedOptions = {},
): Promise<NeedSignals> {
  const signals = baseSignals();
  signals.energy = opts.energy ?? "medium";
  signals.timeBudgetMin = opts.timeBudgetMin ?? 10;

  if (!userId) return signals;

  const cached = cache.get(userId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return {
      ...cached.signals,
      energy: opts.energy ?? cached.signals.energy,
      timeBudgetMin: opts.timeBudgetMin ?? cached.signals.timeBudgetMin,
    };
  }

  const db = supabase as unknown as {
    from: (table: string) => any;
  };

  const [nodesRes, sessionsRes, loopsRes, constellationRes, profileRes] = await Promise.allSettled([
    db
      .from("user_knowledge_nodes")
      .select("node_type,label,state,provenance,confidence,last_observed_at")
      .eq("user_id", userId)
      .limit(200),
    db
      .from("sessions")
      .select("type,status,metadata,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(120),
    db.from("active_loops").select("loop_id,is_active").eq("user_id", userId).limit(10),
    db.from("user_practice_constellation").select("*").eq("user_id", userId).maybeSingle(),
    db
      .from("user_consciousness_profile")
      .select("overall_band,dimension_bands")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const nodes = nodesRes.status === "fulfilled" ? (nodesRes.value?.data ?? []) : [];
  for (const node of nodes as Array<Record<string, unknown>>) {
    const state = asRecord(node.state);
    const text = `${String(node.label ?? "")} ${JSON.stringify(state)}`;
    const provenance = String(node.provenance ?? "inferred");
    for (const concept of CONCEPT_IDS) {
      if (!textMatches(text, concept)) continue;
      const exposure =
        typeof state.exposure_count === "number" ? Number(state.exposure_count) : 1;
      const practiced =
        typeof state.practice_count === "number"
          ? Number(state.practice_count)
          : provenance === "practiced" || provenance === "observed"
            ? 1
            : 0;
      const report =
        provenance === "reported" ? Math.max(0, Math.min(1, Number(node.confidence ?? 0.6))) : 0;
      bump(signals.concepts, concept, {
        exposureCount: exposure,
        practiceCount: practiced,
        selfReport: report,
        lastAt: node.last_observed_at ? String(node.last_observed_at) : null,
      });
    }
  }

  const sessions = sessionsRes.status === "fulfilled" ? (sessionsRes.value?.data ?? []) : [];
  const recentConcepts = new Set<ConceptId>();
  for (let i = 0; i < (sessions as Array<Record<string, unknown>>).length; i += 1) {
    const session = sessions[i];
    const text = `${String(session.type ?? "")} ${JSON.stringify(session.metadata ?? {})}`;
    const completed = String(session.status ?? "").toLowerCase() === "completed";
    const createdAt = session.created_at ? String(session.created_at) : null;
    for (const concept of CONCEPT_IDS) {
      if (!textMatches(text, concept)) continue;
      bump(signals.concepts, concept, {
        exposureCount: 1,
        practiceCount: completed ? 1 : 0,
        lastAt: createdAt,
      });
      if (i < 3) recentConcepts.add(concept);
    }
  }

  const loops = loopsRes.status === "fulfilled" ? (loopsRes.value?.data ?? []) : [];
  signals.activeLoops = (loops as Array<Record<string, unknown>>)
    .filter((l) => l.is_active !== false)
    .map((l) => String(l.loop_id ?? ""))
    .filter(Boolean);

  const constellation =
    constellationRes.status === "fulfilled" ? constellationRes.value?.data : null;
  if (constellation) {
    const row = asRecord(constellation);
    for (const concept of CONCEPT_IDS) {
      const key = `${CONCEPT_PRACTICE_KEY[concept]}_level`;
      const level = Number(row[key]);
      if (Number.isFinite(level)) signals.capabilityLevels[concept] = level;
    }
  }

  const profile = profileRes.status === "fulfilled" ? profileRes.value?.data : null;
  if (profile) {
    const row = asRecord(profile);
    signals.overallBand = Number(row.overall_band) || 0;
    signals.dimensionBands = asRecord(row.dimension_bands) as Record<string, number>;
  }

  for (const concept of CONCEPT_IDS) {
    signals.concepts[concept] = {
      ...signals.concepts[concept],
      familiarity: computeFamiliarity(signals.concepts[concept]),
    };
  }

  signals.recentConceptIds = Array.from(recentConcepts);

  cache.set(userId, { at: Date.now(), signals });

  return signals;
}

export async function readNeedDecision(
  userId: string | null | undefined,
  opts: ReadNeedOptions & DetectOptions = {},
): Promise<NeedDecision> {
  const signals = await readNeedSignals(userId, opts);
  return detectNeed(signals, { requested: opts.requested });
}

export function allConceptsReady(signals: NeedSignals): boolean {
  return CONCEPT_IDS.every((id) => {
    const def = CONCEPTS[id];
    return def.prerequisites.every(
      (p) => (signals.concepts[p.concept]?.familiarity ?? 0) >= p.minFamiliarity,
    );
  });
}
