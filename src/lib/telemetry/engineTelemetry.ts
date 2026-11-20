import { supabase } from "@/lib/supabase";
import { DECISION_POLICY_VERSION } from "@/lib/brain/policy";

/**
 * Fire-and-forget telemetry. Nothing here may throw into a session: a missing
 * table, an offline device or a signed-out user must never break the flow.
 */

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export function hashInput(value: unknown): string {
  const s = stableStringify(value);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

let cachedUserId: Promise<string | null> | null = null;

async function currentUserId(): Promise<string | null> {
  if (!cachedUserId) {
    cachedUserId = supabase.auth
      .getUser()
      .then(({ data }) => data.user?.id ?? null)
      .catch(() => null);
  }
  return cachedUserId;
}

export interface EngineDecisionInput {
  userId?: string | null;
  sessionId?: string | null;
  engine: string;
  brainMode: "local" | "hybrid" | "cloud";
  chosen: Record<string, unknown>;
  alternatives?: Array<Record<string, unknown>>;
  confidence?: number | null;
  latencyMs?: number;
  crisis?: boolean;
  policyVersion?: string;
  /** The inputs that produced the decision — hashed, not stored verbatim. */
  input?: unknown;
}

export async function logEngineDecision(input: EngineDecisionInput): Promise<string | null> {
  try {
    const userId = input.userId ?? (await currentUserId());
    if (!userId) return null;

    const row = {
      user_id: userId,
      session_id: input.sessionId ?? null,
      engine: input.engine,
      brain_mode: input.brainMode,
      policy_version: input.policyVersion ?? DECISION_POLICY_VERSION,
      input_hash: input.input === undefined ? "unknown" : hashInput(input.input),
      chosen: input.chosen,
      alternatives: input.alternatives ?? [],
      confidence: input.confidence ?? null,
      latency_ms: typeof input.latencyMs === "number" ? Math.max(0, Math.round(input.latencyMs)) : null,
      crisis: Boolean(input.crisis),
    };

    const { data, error } = await supabase
      .from("engine_decisions" as never)
      .insert(row as never)
      .select("id")
      .single();

    if (error) return null;
    return (data as { id?: string } | null)?.id ?? null;
  } catch {
    return null;
  }
}

export interface CrisisEventInput {
  userId?: string | null;
  surface: "guide-chat" | "temple-chat" | "compose-session-v3" | "orchestrator";
  severity: "acute" | "elevated";
  matched?: string[];
  action: "short_circuit" | "directive";
  sessionId?: string | null;
}

export async function logCrisisEvent(input: CrisisEventInput): Promise<void> {
  try {
    const userId = input.userId ?? (await currentUserId());
    await supabase.from("crisis_events" as never).insert({
      user_id: userId,
      surface: input.surface,
      severity: input.severity,
      matched: input.matched ?? [],
      action: input.action,
      session_id: input.sessionId ?? null,
    } as never);
  } catch {
    /* telemetry must never break safety copy */
  }
}

export interface AttachDecisionInput {
  sessionId: string;
  decisionId?: string | null;
  brainMode: "local" | "hybrid" | "cloud";
  policyVersion?: string;
}

/** Stamp the session row with how it was produced, so the plan is traceable. */
export async function attachDecisionToSession(input: AttachDecisionInput): Promise<void> {
  try {
    await supabase
      .from("sessions" as never)
      .update({
        brain_mode: input.brainMode,
        policy_version: input.policyVersion ?? DECISION_POLICY_VERSION,
        decision_id: input.decisionId ?? null,
      } as never)
      .eq("id", input.sessionId);
  } catch {
    /* provenance must never break session start */
  }
}

export interface StepEventInput {
  sessionId: string;
  stepIndex: number;
  kind: string;
  title?: string;
  /** Funnel phase. Defaults from completed/skipped when omitted. */
  action?: "shown" | "started" | "completed" | "skipped";
  completed?: boolean;
  skipped?: boolean;
  durationSeconds?: number;
  atomRef?: string | null;
  payload?: Record<string, unknown>;
  userId?: string | null;
}

export async function logStepEvent(input: StepEventInput): Promise<void> {
  try {
    const userId = input.userId ?? (await currentUserId());
    if (!userId) return;

    const now = Date.now();
    const duration = Math.max(0, Math.round(input.durationSeconds ?? 0));

    await supabase.from("session_step_events" as never).insert({
      session_id: input.sessionId,
      user_id: userId,
      step_index: input.stepIndex,
      kind: input.kind,
      atom_ref: input.atomRef ?? null,
      title: input.title ?? null,
      action: input.action ?? (input.skipped ? "skipped" : input.completed ? "completed" : "shown"),
      started_at: new Date(now - duration * 1000).toISOString(),
      ended_at: new Date(now).toISOString(),
      duration_seconds: duration,
      completed: Boolean(input.completed),
      skipped: Boolean(input.skipped),
      payload: input.payload ?? {},
    } as never);
  } catch {
    /* telemetry must never break the step UI */
  }
}
