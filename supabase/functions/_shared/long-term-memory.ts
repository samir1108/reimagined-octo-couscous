// Shared long-term memory helper for edge functions.
// - embedUtterance(): fire-and-forget embed via Gemini → user_memory_vectors
// - buildLongTermMemoryBlock(): semantic recall + loop occurrence + recent
//   daily syntheses, returned as a compact system-prompt block. Also logs an
//   ai_callback_log row whenever a recalled memory is >= 7 days old so we can
//   enforce "1 in 5 sessions includes a felt-continuity callback."
import { createClient } from "./supabase-client.ts";
import { embedText } from "./embedding.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE);
}

export { embedText };

export function embedUtterance(input: {
  admin?: any;
  userId: string;
  content: string;
  source_type: "journal" | "chat" | "reflection" | "session" | "session_step" | "observation" | "pulse" | "synthesis";
  source_id?: string | null;
  tags?: string[];
  loop_ids?: string[];
}) {
  // Fire-and-forget — never block the caller
  void (async () => {
    try {
      if (!input.content || input.content.trim().length < 8) return;
      const admin = input.admin ?? adminClient();
      const emb = await embedText(input.content);
      await admin.from("user_memory_vectors").insert({
        user_id: input.userId,
        source_type: input.source_type,
        source_id: input.source_id ?? null,
        content: input.content.slice(0, 4000),
        embedding: emb as any,
        tags: (input.tags ?? []).slice(0, 20),
        loop_ids: (input.loop_ids ?? []).slice(0, 20),
      });
    } catch (e) {
      console.warn("embedUtterance failed", (e as Error).message);
    }
  })();
}

interface MemoryMatch {
  id: string;
  source_type: string;
  content: string;
  loop_ids: string[];
  tags: string[];
  created_at: string;
  days_ago: number;
  similarity: number;
}

/**
 * Returns a compact markdown block ready to append to a system prompt, e.g.:
 *
 *   ## LONG-TERM MEMORY (felt continuity — reference only when it truly lands)
 *   - 14 days ago, user wrote: "..."
 *   - This is the 7th time you've touched abandonment (VAL001) in 60 days.
 *   - Yesterday's synthesis: "..."
 *
 * Returns "" if nothing useful surfaces (so callers can append blindly).
 */
export async function buildLongTermMemoryBlock(opts: {
  admin?: any;
  userId: string;
  queryText: string;
  activeLoops?: string[];
  sessionId?: string | null;
}): Promise<string> {
  try {
    const admin = opts.admin ?? adminClient();
    const queryText = (opts.queryText ?? "").slice(0, 1500);
    if (!queryText || queryText.length < 4) return "";

    const queryEmb = await embedText(queryText);

    // 1) Semantic recall — exclude the very recent (last 24h) so it feels like memory, not recency.
    let matches: MemoryMatch[] = [];
    if (queryEmb) {
      const { data } = await admin.rpc("match_user_memories", {
        p_user_id: opts.userId,
        p_query_embedding: queryEmb as any,
        p_match_count: 4,
        p_min_days_ago: 1,
      });
      matches = (data ?? []) as MemoryMatch[];
    }

    // 2) Loop occurrence count for the most-active loop (callback ammo).
    let loopLine = "";
    const primaryLoop = (opts.activeLoops ?? []).find(Boolean);
    if (primaryLoop) {
      const { data: loopData } = await admin.rpc("count_loop_occurrences", {
        p_user_id: opts.userId,
        p_loop_id: primaryLoop,
        p_days: 60,
      });
      const row = loopData?.[0];
      if (row?.total_count && row.total_count >= 3) {
        loopLine = `- This is the ${row.total_count}th time the pattern \`${primaryLoop}\` has surfaced in the last 60 days (first noticed ${new Date(row.first_seen_at).toLocaleDateString()}, on ${row.distinct_days} distinct days).`;
      }
    }

    // 3) Recent daily syntheses (yesterday-aware mornings).
    const { data: syn } = await admin
      .from("daily_memory_synthesis")
      .select("synthesis_date, summary")
      .eq("user_id", opts.userId)
      .order("synthesis_date", { ascending: false })
      .limit(2);

    const memLines: string[] = [];
    for (const m of matches.slice(0, 3)) {
      if (!m.content || m.days_ago < 1) continue;
      const snip = m.content.replace(/\s+/g, " ").slice(0, 180);
      memLines.push(`- ${m.days_ago} day${m.days_ago === 1 ? "" : "s"} ago (${m.source_type}): "${snip}"`);
    }

    const synLines = (syn ?? []).map((s: any) =>
      `- ${s.synthesis_date}: ${String(s.summary).replace(/\s+/g, " ").slice(0, 240)}`
    );

    if (memLines.length === 0 && !loopLine && synLines.length === 0) return "";

    // 4) Log a callback if any surfaced memory is >= 7 days old — this is the
    //    "1 in 5 sessions must reference >7-day-old memory" enforcement signal.
    const callbackMemory = matches.find((m) => m.days_ago >= 7);
    if (callbackMemory) {
      try {
        await admin.from("ai_callback_log").insert({
          user_id: opts.userId,
          session_id: opts.sessionId ?? null,
          referenced_memory_id: callbackMemory.id,
          referenced_date: callbackMemory.created_at?.slice(0, 10) ?? null,
          days_ago: callbackMemory.days_ago,
          callback_text: callbackMemory.content?.slice(0, 280) ?? null,
        });
      } catch { /* non-blocking */ }
    }

    const sections: string[] = [
      "## LONG-TERM MEMORY (use only when a callback would feel earned — never list, weave in naturally)",
    ];
    if (memLines.length) sections.push("### Semantic echoes from earlier", ...memLines);
    if (loopLine)        sections.push("### Pattern recurrence", loopLine);
    if (synLines.length) sections.push("### Recent daily syntheses (what each day became)", ...synLines);
    sections.push(
      "GUIDANCE: At most ONE callback per reply. Phrase it like a friend who remembers, not a system that logs. Example: \"Three weeks ago you wrote about your father — is this the same ache?\""
    );
    return "\n\n" + sections.join("\n");
  } catch (e) {
    console.warn("buildLongTermMemoryBlock failed", (e as Error).message);
    return "";
  }
}
