// ============================================================
// BUILD LONG-TERM MEMORY BLOCK — Edge Function
// ============================================================
// Builds the memory injection block for AI prompts.
// Called by: get-user-context, compose-session-v3, guide-chat, session-adapter

import { createClient } from "npm:@supabase/supabase-js@2";
import { embedText } from "../_shared/long-term-memory.ts";
import { withMiddleware, successResponse } from "../_shared/middleware.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface BuildMemoryBlockRequest {
  userId: string;
  queryText: string;
  activeLoops: string[];
  minDaysAgo?: number;
  matchCount?: number;
}

Deno.serve(withMiddleware(async (req, context) => {
  const { admin } = context;
  const body = await req.json().catch(() => ({} as BuildMemoryBlockRequest));
  
  const { userId, queryText, activeLoops, minDaysAgo = 1, matchCount = 8 } = body;

  if (!userId || !queryText) {
    return successResponse({ ok: true, memoryBlock: "" });
  }

  try {
    // 1. Embed query
    const queryEmbedding = await embedText(queryText);
    if (!queryEmbedding) {
      return successResponse({ ok: true, memoryBlock: "" });
    }

    // 2. Semantic search (exclude last 24h)
    const { data: memories } = await admin.rpc("match_user_memories", {
      p_user_id: userId,
      p_query_embedding: queryEmbedding as any,
      p_match_count: matchCount,
      p_min_days_ago: minDaysAgo,
    });

    // 3. Loop recurrence check
    let loopCallback = "";
    if (activeLoops.length > 0) {
      const topLoop = activeLoops[0];
      const { data: loopCount } = await admin.rpc("count_loop_occurrences", {
        p_user_id: userId,
        p_loop_id: topLoop,
        p_days: 60,
      });
      const count = Number(loopCount?.[0]?.total_count ?? 0);
      if (count >= 3) {
        const { data: firstOccurrence } = await admin
          .from("loop_attributions")
          .select("created_at")
          .eq("user_id", userId)
          .eq("loop_id", topLoop)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        loopCallback = `\nLOOP RECURRENCE: This is the ${count}th time the pattern "${topLoop}" has surfaced in 60 days (first noticed ${firstOccurrence?.created_at?.slice(0, 10) || "recently"}).`;
      }
    }

    // 4. Yesterday's synthesis
    const { data: recentSynthesis } = await admin
      .from("daily_memory_synthesis")
      .select("summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2);
    
    let yesterdayBlock = "";
    if (recentSynthesis?.length) {
      const yesterday = recentSynthesis[0];
      yesterdayBlock = `\nYESTERDAY'S SYNTHESIS: "${yesterday.summary}"`;
    }

    // 5. Assemble memory block
    const memoryParts: string[] = [];
    
    if (memories?.length) {
      memoryParts.push("RELEVANT MEMORIES (semantic recall):");
      for (const mem of memories.slice(0, 3)) {
        const ageDays = Math.floor((Date.now() - new Date(mem.created_at).getTime()) / 86400000);
        if (ageDays >= 7) {
          // Log callback for 1-in-5 rule enforcement
          await admin.from("ai_callback_log").insert({
            user_id: userId,
            referenced_memory_id: mem.id,
            referenced_date: String(mem.created_at ?? "").slice(0, 10) || null,
            days_ago: ageDays,
            callback_text: String(mem.content ?? "").slice(0, 280),
          });
        }
        memoryParts.push(`  - ${mem.content.slice(0, 300)} (${ageDays}d ago)`);
      }
    }

    if (loopCallback) memoryParts.push(loopCallback);
    if (yesterdayBlock) memoryParts.push(yesterdayBlock);

    const memoryBlock = memoryParts.length > 0
      ? memoryParts.join("\n") + "\n\nINSTRUCTION: At most ONE callback per reply. Phrase it like a friend who remembers, not a system that logs. Example: \"Three weeks ago you wrote about your father — is this the same ache?\""
      : "";

    return successResponse({ ok: true, memoryBlock });

  } catch (error) {
    console.error("[build-long-term-memory] Error:", error);
    return successResponse({ ok: true, memoryBlock: "" });
  }
}));