import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // ─── Atomic Credit Pre-Check ───
    const { data: creditCheck } = await admin.rpc("check_credit_balance", { p_user_id: user.id, p_min_balance: 50 });
    if (!creditCheck?.sufficient) {
      return new Response(JSON.stringify({ error: "insufficient_credits", message: "Not enough credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Apply decay to all user memories
    await admin.rpc("decay_memories", { p_user_id: user.id });

    // Step 2: Fetch all active memories for consolidation analysis
    const { data: memories } = await admin
      .from("guru_memory")
      .select("id, content, importance, category, tags, emotional_tone, dimension_relevant, linked_loops, created_at, decay_factor")
      .eq("user_id", user.id)
      .eq("is_consolidated", false)
      .is("consolidated_into", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!memories || memories.length < 3) {
      return new Response(JSON.stringify({ consolidated: 0, patterns: 0, decayed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 3: Use AI to find duplicates and patterns
    const memorySummary = memories.map((m, i) => 
      `[${i}] (${m.category}, imp:${m.importance}) ${m.content}`
    ).join("\n");

    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a memory consolidation system. Analyze these memories and:
1. Find groups of similar/duplicate memories that should be merged (same insight said differently)
2. Detect recurring cross-session patterns (themes that appear 3+ times)
Be precise with indices. Only merge truly redundant memories.`,
          },
          {
            role: "user",
            content: `Analyze these ${memories.length} memories:\n\n${memorySummary}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "consolidate_and_detect",
              description: "Return consolidation groups and detected patterns",
              parameters: {
                type: "object",
                properties: {
                  merge_groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        indices: { type: "array", items: { type: "integer" }, description: "Indices of memories to merge" },
                        merged_content: { type: "string", description: "Single consolidated insight combining the duplicates" },
                        merged_importance: { type: "integer", description: "Importance of the consolidated memory (take the highest)" },
                        merged_category: { type: "string", enum: ["breakthrough", "pattern", "trigger", "milestone", "insight", "struggle"] },
                      },
                      required: ["indices", "merged_content", "merged_importance", "merged_category"],
                      additionalProperties: false,
                    },
                    description: "Groups of duplicate/similar memories to merge. Each group has 2+ memories.",
                  },
                  detected_patterns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pattern_name: { type: "string", description: "Short name for the pattern (e.g., 'Recurring anger in relationships')" },
                        description: { type: "string", description: "2-3 sentence description of the pattern and its significance" },
                        memory_indices: { type: "array", items: { type: "integer" }, description: "Indices of memories that form this pattern" },
                        dimension: { type: "string", enum: ["thought", "emotion", "body", "awareness"] },
                        emotional_trend: { type: "string", enum: ["improving", "stable", "worsening", "fluctuating"] },
                        significance: { type: "string", enum: ["emerging", "established", "critical", "resolving"] },
                        linked_loops: { type: "array", items: { type: "string" }, description: "Related loops if any" },
                      },
                      required: ["pattern_name", "description", "memory_indices", "dimension", "emotional_trend", "significance"],
                      additionalProperties: false,
                    },
                    description: "Cross-session patterns detected from 3+ related memories",
                  },
                },
                required: ["merge_groups", "detected_patterns"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "consolidate_and_detect" } },
      });

    if (!aiResp.ok) {
      console.error("AI consolidation error:", aiResp.status);
      return new Response(JSON.stringify({ error: "AI analysis failed", consolidated: 0, patterns: 0 }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();

    // ─── Credit Deduction & Usage Logging ───
    const usage = aiData?.usage || {};
    const inputTokens = usage.prompt_tokens || 500;
    const outputTokens = usage.completion_tokens || 300;
    const totalTokens = inputTokens + outputTokens;
    const __billingModel = "tier:fast";
    const __charge = computeChargedPaise(__billingModel, inputTokens, outputTokens);

    const chargedPaise = __charge.chargedPaise;

    const inputCost = __charge.estimatedCostPaise; // legacy alias

    const outputCost = 0; // folded into estimatedCostPaise

    await admin.rpc("check_and_deduct_credits", { p_user_id: user.id, p_amount: chargedPaise, p_description: `Memory consolidation (${totalTokens} tokens)` });
    await admin.from("ai_usage_log").insert({
      user_id: user.id, function_name: "memory-consolidate", model: "llama-3.1-8b-instant",
      input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens,
      estimated_cost_paise: inputCost + outputCost, charged_paise: chargedPaise, status: "success",
    });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ consolidated: 0, patterns: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    let consolidatedCount = 0;
    let patternsCount = 0;

    // Step 4: Execute merges
    for (const group of (result.merge_groups || [])) {
      if (!group.indices || group.indices.length < 2) continue;
      const validIndices = group.indices.filter((i: number) => i >= 0 && i < memories.length);
      if (validIndices.length < 2) continue;

      const groupMemories = validIndices.map((i: number) => memories[i]);
      const keepMemory = groupMemories[0]; // Keep the first one as the consolidated version

      // Update the kept memory with merged content
      await admin.from("guru_memory").update({
        content: group.merged_content,
        importance: Math.min(10, group.merged_importance),
        category: group.merged_category,
        linked_memory_ids: groupMemories.slice(1).map((m: any) => m.id),
        decay_factor: 1.0, // Reset decay for consolidated memory
      }).eq("id", keepMemory.id);

      // Mark others as consolidated
      for (const m of groupMemories.slice(1)) {
        await admin.from("guru_memory").update({
          consolidated_into: keepMemory.id,
          is_consolidated: true,
        }).eq("id", m.id);
      }

      consolidatedCount += groupMemories.length - 1;
    }

    // Step 5: Store detected patterns
    for (const pattern of (result.detected_patterns || [])) {
      const memoryIds = (pattern.memory_indices || [])
        .filter((i: number) => i >= 0 && i < memories.length)
        .map((i: number) => memories[i].id);

      if (memoryIds.length < 2) continue;

      // Check for existing similar pattern
      const { data: existing } = await admin
        .from("memory_patterns")
        .select("id, frequency, memory_ids")
        .eq("user_id", user.id)
        .eq("pattern_name", pattern.pattern_name)
        .single();

      if (existing) {
        const allMemoryIds = [...new Set([...(existing.memory_ids || []), ...memoryIds])];
        await admin.from("memory_patterns").update({
          frequency: allMemoryIds.length,
          memory_ids: allMemoryIds,
          last_seen_at: new Date().toISOString(),
          emotional_trend: pattern.emotional_trend,
          significance: pattern.significance,
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await admin.from("memory_patterns").insert({
          user_id: user.id,
          pattern_name: pattern.pattern_name,
          description: pattern.description,
          frequency: memoryIds.length,
          memory_ids: memoryIds,
          dimension: pattern.dimension,
          linked_loops: pattern.linked_loops || [],
          emotional_trend: pattern.emotional_trend,
          significance: pattern.significance,
        });
      }

      // Tag memories with their pattern cluster
      for (const memId of memoryIds) {
        await admin.from("guru_memory").update({
          pattern_cluster: pattern.pattern_name,
        }).eq("id", memId);
      }

      patternsCount++;
    }

    return new Response(JSON.stringify({
      consolidated: consolidatedCount,
      patterns: patternsCount,
      totalMemories: memories.length,
      decayed: true,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("memory-consolidate error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
