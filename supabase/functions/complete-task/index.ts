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
    const { taskId } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    // Get completed task
    const { data: completedTask } = await admin
      .from("observation_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single();

    if (!completedTask) {
      return new Response(JSON.stringify({ error: "Task not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Get all completed tasks for today for context
    const { data: allTasks } = await admin
      .from("observation_tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("chain_order");

    // ─── Fetch theme context and user profile for richer prompting ───
    let themeContext = "";
    let profileContext = "";
    try {
      const [themeRes, profileRes, loopsRes] = await Promise.all([
        admin.from("daily_themes").select("title, description, focus_areas, affirmation").eq("theme_date", today).eq("user_id", user.id).maybeSingle(),
        admin.from("user_consciousness_profile").select("overall_band, dimension_bands, active_loops, journey_phase").eq("user_id", user.id).maybeSingle(),
        admin.from("user_loops").select("loop_id, severity, awareness_score").eq("user_id", user.id).in("status", ["active", "aware"]).limit(5),
      ]);

      // Determine effective topic
      const effectiveTopic = completedTask.user_topic || themeRes.data?.title || "self-awareness";
      const dims = profileRes.data?.dimension_bands || {};
      const dimEntries = Object.entries(dims).filter(([_, v]) => typeof v === "number") as [string, number][];
      const weakest = [...dimEntries].sort((a, b) => (a[1] as number) - (b[1] as number))[0];

      themeContext = `Today's focus topic: "${effectiveTopic}".`;
      if (themeRes.data?.description) themeContext += ` Theme description: ${themeRes.data.description}`;
      if (completedTask.user_topic) themeContext += ` (User chose this custom topic over the suggested theme.)`;

      if (profileRes.data) {
        profileContext = `User's consciousness band: ${profileRes.data.overall_band?.toFixed(1)}. Phase: ${profileRes.data.journey_phase}.`;
        if (weakest) profileContext += ` Weakest dimension: ${weakest[0]} (${(weakest[1] as number).toFixed(1)}).`;
        if (loopsRes.data && loopsRes.data.length > 0) {
          profileContext += ` Active loops: ${loopsRes.data.map((l: any) => `${l.loop_id}(${l.severity})`).join(", ")}.`;
        }
      }
    } catch (ctxErr) {
      console.error("complete-task: context fetch failed (non-blocking):", ctxErr);
    }

    // Generate next chained task
    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a consciousness teacher creating the next observation task in a chain. Each task should deepen based on the previous one. The user has completed the current task and shared their reflection. Build on their experience.

${themeContext}
${profileContext}

RULES:
- The next task MUST relate to today's focus topic: "${completedTask.user_topic || "the daily theme"}".
- Progress from surface observation → subtle awareness → root patterns → the observer itself.
- Keep tasks concrete and actionable (not abstract philosophy).
- Domain should be one of: awareness, emotion, thought, body, relationship, presence, pattern.
- If the user's reflection reveals a loop or pattern, the next task should explore it deeper.`,
          },
          {
            role: "user",
            content: `Completed task: "${completedTask.title}" (domain: ${completedTask.domain}). User reflection: "${completedTask.reflection || "no reflection"}". Previous tasks today: ${JSON.stringify((allTasks || []).map((t: any) => ({ title: t.title, domain: t.domain, status: t.status, reflection: t.reflection })))}. Create the next deeper observation task.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_next_task",
              description: "Create next chained observation task",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  domain: { type: "string" },
                },
                required: ["title", "description", "domain"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_next_task" } },
      });

    if (!aiResp.ok) {
      console.error("AI error:", await aiResp.text());
      await admin.from("ai_usage_log").insert({
        user_id: user.id, function_name: "complete-task", model: "llama-3.1-8b-instant",
        input_tokens: 0, output_tokens: 0, total_tokens: 0,
        estimated_cost_paise: 0, charged_paise: 0, status: "error",
        error_message: "AI gateway error",
      });
      return new Response(JSON.stringify({ error: "Failed to generate next task" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const usage = aiData.usage || {};
    const inputTokens = usage.prompt_tokens || 200;
    const outputTokens = usage.completion_tokens || 100;
    const totalTokens = inputTokens + outputTokens;
    const __billingModel = "tier:fast";
    const __charge = computeChargedPaise(__billingModel, inputTokens, outputTokens);

    const chargedPaise = __charge.chargedPaise;

    const inputCost = __charge.estimatedCostPaise; // legacy alias

    const outputCost = 0; // folded into estimatedCostPaise

    // Atomic charge AFTER successful AI call
    await admin.rpc("check_and_deduct_credits", { p_user_id: user.id, p_amount: chargedPaise, p_description: `Task completion AI (${totalTokens} tokens)` });
    await admin.from("ai_usage_log").insert({
      user_id: user.id, function_name: "complete-task", model: "llama-3.1-8b-instant",
      input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens,
      estimated_cost_paise: inputCost + outputCost, charged_paise: chargedPaise, status: "success",
    });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const nextTask = JSON.parse(toolCall.function.arguments);
      await admin.from("observation_tasks").insert({
        user_id: user.id,
        chain_order: (completedTask.chain_order || 0) + 1,
        parent_task_id: taskId,
        status: "active",
        task_date: today,
        theme_id: completedTask.theme_id,
        user_topic: completedTask.user_topic,
        ...nextTask,
      });
    }

    // Return updated tasks for today only
    const { data: updatedTasks } = await admin
      .from("observation_tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("chain_order");

    return new Response(JSON.stringify({ tasks: updatedTasks || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("complete-task error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
