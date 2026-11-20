// Long-term AI memory client — vector store of every user utterance.
// Use these helpers to embed and recall across sessions so the AI can say
// things like "this is the 7th time you've touched abandonment in 60 days."
import { supabase } from "@/lib/supabase";

const baseUrl = import.meta.env.VITE_SUPABASE_URL;

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

export type MemorySourceType =
  | "journal" | "chat" | "reflection" | "session" | "session_step"
  | "observation" | "pulse" | "synthesis";

/** Fire-and-forget: embed a user utterance into the long-term store. */
export function embedMemory(input: {
  content: string;
  source_type: MemorySourceType;
  source_id?: string | null;
  tags?: string[];
  loop_ids?: string[];
}) {
  if (!input.content || input.content.trim().length < 8) return;
  void (async () => {
    const headers = await authHeaders();
    if (!headers) return;
    fetch(`${baseUrl}/functions/v1/embed-memory`, {
      method: "POST", headers, body: JSON.stringify(input),
    }).catch(() => {});
  })();
}

export interface MemoryMatch {
  id: string;
  source_type: MemorySourceType;
  content: string;
  loop_ids: string[];
  tags: string[];
  created_at: string;
  days_ago: number;
  similarity: number;
}

export interface LoopOccurrence {
  total_count: number;
  first_seen_at: string | null;
  last_seen_at: string | null;
  distinct_days: number;
}

export interface DailySynthesis {
  synthesis_date: string;
  summary: string;
  key_themes: string[];
  loops_touched: string[];
}

export interface RecallResult {
  matches: MemoryMatch[];
  loop_occurrence: LoopOccurrence | null;
  recent_syntheses: DailySynthesis[];
}

/** Semantic recall + loop occurrence count + recent daily syntheses. */
export async function recallMemory(input: {
  query?: string;
  limit?: number;
  min_days_ago?: number;
  loop_id?: string;
  loop_window_days?: number;
}): Promise<RecallResult | null> {
  const headers = await authHeaders();
  if (!headers) return null;
  const r = await fetch(`${baseUrl}/functions/v1/recall-memory`, {
    method: "POST", headers, body: JSON.stringify(input),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return {
    matches: j.matches ?? [],
    loop_occurrence: j.loop_occurrence ?? null,
    recent_syntheses: j.recent_syntheses ?? [],
  };
}

/** Trigger today's synthesis for the current user (idempotent — skips if exists). */
export async function synthesizeTodayForMe(): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers) return false;
  const r = await fetch(`${baseUrl}/functions/v1/synthesize-daily-memory`, {
    method: "POST", headers, body: JSON.stringify({}),
  });
  return r.ok;
}
