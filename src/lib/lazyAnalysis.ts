// Lazy analysis helper.
// Instead of running 3-Lens + memory extraction at the moment a session ends
// or a journal entry is saved (expensive, often never reviewed), we defer it
// until the user actually opens that item in History. Results are persisted
// in `consciousness_signals` so the work happens at most once per source.

import { supabase } from "@/lib/supabase";

export type LazySourceType = "guide_session" | "journal";

/**
 * Runs three-lens-analyzer + memory-extract for a given source, but ONLY if
 * no `consciousness_signals` row already exists for it. Safe to call multiple
 * times — subsequent calls short-circuit. Returns true if analysis was run.
 */
export async function ensureAnalysisFor(params: {
  sourceType: LazySourceType;
  sourceId: string;
  text: string;
}): Promise<boolean> {
  const { sourceType, sourceId, text } = params;
  if (!sourceId || !text || text.trim().length < 20) return false;

  // Short-circuit if already analyzed
  const { data: existing } = await supabase
    .from("consciousness_signals")
    .select("id")
    .eq("source_id", sourceId)
    .limit(1)
    .maybeSingle();
  if (existing) return false;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Run 3-Lens (the one that actually writes to consciousness_signals) and
  // wait for it so the caller can refetch when it's done. Memory extraction
  // can run in the background.
  try {
    await fetch(`${baseUrl}/functions/v1/three-lens-analyzer`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text, sourceType, sourceId }),
    });
  } catch {
    return false;
  }

  // Fire-and-forget: long-term memory + (journal-only) embedding
  fetch(`${baseUrl}/functions/v1/memory-extract`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text, sourceType, sourceId }),
  }).catch(() => {});

  if (sourceType === "journal") {
    fetch(`${baseUrl}/functions/v1/embed-memory`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: text,
        source_type: "journal",
        source_id: sourceId,
        tags: [],
      }),
    }).catch(() => {});
  }

  return true;
}
