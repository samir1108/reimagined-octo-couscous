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
    const { text, sourceType, sourceId } = await req.json();
    if (!text || text.length < 30) {
      return new Response(JSON.stringify({ skipped: true, reason: "Text too short" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth
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

    // Extract insights via AI using tool calling
    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a consciousness insight extractor for HOPE. Analyze text from mindfulness sessions and journals. Extract the most meaningful insights — breakthroughs, recurring patterns, emotional triggers, milestones, or key learnings. Be concise and precise. Focus on what would be useful to remember weeks or months later.\n\nCategorize memories into DEPTH LAYERS:\n- "surface": daily insights, routine observations, current-state reflections\n- "karmic": repeating life patterns, recurring relationship cycles, déjà vu themes, patterns that keep showing up across different life areas\n- "ancestral": family-inherited patterns, generational beliefs, parental conditioning, cultural programming\n- "evolutionary": breakthrough moments, before/after shifts, consciousness level changes, fundamental identity shifts\n- "somatic": body-stored memories, tension patterns, physical sensations linked to emotions, breath signatures, trauma held in the body`,
          },
          {
            role: "user",
            content: `Analyze this ${sourceType === "journal" ? "journal entry" : "guide session conversation"} and extract the key insight:\n\n${text.slice(0, 3000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "store_memory",
              description: "Store a distilled memory insight",
              parameters: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    description: "2-3 sentence distilled insight — the core learning or observation worth remembering",
                  },
                  importance: {
                    type: "integer",
                    description: "1-10 importance score. 1-3: routine observations. 4-6: meaningful patterns. 7-8: significant breakthroughs. 9-10: life-changing realizations.",
                  },
                  category: {
                    type: "string",
                    enum: ["breakthrough", "pattern", "trigger", "milestone", "insight", "struggle"],
                    description: "Type of memory",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-5 relevant tags (e.g., 'self-compassion', 'anger', 'meditation', 'body-awareness')",
                  },
                  emotional_tone: {
                    type: "string",
                    enum: ["peaceful", "curious", "vulnerable", "joyful", "heavy", "anxious", "neutral", "hopeful", "frustrated"],
                    description: "Dominant emotional tone",
                  },
                  dimension_relevant: {
                    type: "string",
                    enum: ["thought", "emotion", "body", "awareness"],
                    description: "Most relevant consciousness dimension",
                  },
                  linked_loops: {
                    type: "array",
                    items: { type: "string" },
                    description: "Any detected loops: origin_loop, worth_loop, safety_loop, power_loop, connection_loop, identity_loop, compulsion_loop. Empty if none.",
                  },
                  memory_layer: {
                    type: "string",
                    enum: ["surface", "karmic", "ancestral", "evolutionary", "somatic"],
                    description: "Depth layer: surface (daily), karmic (repeating patterns), ancestral (family/generational), evolutionary (breakthroughs), somatic (body-stored)",
                  },
                },
                required: ["content", "importance", "category", "tags", "emotional_tone", "dimension_relevant", "memory_layer"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "store_memory" } },
      });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI extraction error:", aiResp.status, errText);
      await admin.from("ai_usage_log").insert({
        user_id: user.id, function_name: "memory-extract", model: "llama-3.1-8b-instant",
        status: "error", error_message: `AI error: ${aiResp.status}`,
      });
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI extraction failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const usage = aiData.usage || {};
    const inputTokens = usage.prompt_tokens || Math.ceil(text.length / 4);
    const outputTokens = usage.completion_tokens || 100;
    const totalTokens = inputTokens + outputTokens;
    const __billingModel = "tier:fast";
    const __charge = computeChargedPaise(__billingModel, inputTokens, outputTokens);

    const chargedPaise = __charge.chargedPaise;

    const inputCost = __charge.estimatedCostPaise; // legacy alias

    const outputCost = 0; // folded into estimatedCostPaise

    // Atomic charge AFTER successful AI call
    await admin.rpc("check_and_deduct_credits", { p_user_id: user.id, p_amount: chargedPaise, p_description: `Memory extraction (${totalTokens} tokens)` });
    await admin.from("ai_usage_log").insert({
      user_id: user.id, function_name: "memory-extract", model: "llama-3.1-8b-instant",
      input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens,
      estimated_cost_paise: inputCost + outputCost, charged_paise: chargedPaise, status: "success",
    });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ skipped: true, reason: "No insight extracted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const memory = JSON.parse(toolCall.function.arguments);

    // Skip low-importance routine observations
    if (memory.importance <= 2) {
      return new Response(JSON.stringify({ skipped: true, reason: "Low importance" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store in guru_memory
    const { data: stored, error: insertError } = await admin
      .from("guru_memory")
      .insert({
        user_id: user.id,
        source_type: sourceType || "session",
        source_id: sourceId || null,
        content: memory.content,
        importance: Math.min(10, Math.max(1, memory.importance)),
        category: memory.category || "insight",
        tags: memory.tags || [],
        emotional_tone: memory.emotional_tone || "neutral",
        dimension_relevant: memory.dimension_relevant || "awareness",
        linked_loops: memory.linked_loops || [],
        memory_layer: memory.memory_layer || "surface",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Memory insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to store memory" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Apply decay + auto-consolidate (fire-and-forget, every 5th memory)
    const { count } = await admin
      .from("guru_memory")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_consolidated", false);

    if (count && count % 5 === 0) {
      // Trigger consolidation in background
      fetch(`${supabaseUrl}/functions/v1/memory-consolidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader!,
        },
        body: JSON.stringify({}),
      }).catch(() => { /* fire-and-forget */ });
    }

    return new Response(JSON.stringify({ success: true, memoryId: stored?.id, importance: memory.importance, category: memory.category }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("memory-extract error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
