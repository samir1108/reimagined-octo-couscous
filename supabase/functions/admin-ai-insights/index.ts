import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) throw new Error("Access denied");

    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id required");

    // Fetch user data with service role
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [profileRes, consciousnessRes, loopsRes, sessionsRes, journalsRes, healthRes] = await Promise.all([
      serviceClient.from("profiles").select("*").eq("user_id", user_id).maybeSingle(),
      serviceClient.from("user_consciousness_profile").select("*").eq("user_id", user_id).maybeSingle(),
      serviceClient.from("user_loops").select("*").eq("user_id", user_id),
      serviceClient.from("sessions").select("type, status, time_slot, session_date").eq("user_id", user_id).order("created_at", { ascending: false }).limit(20),
      serviceClient.from("journal_entries").select("title, mood, created_at").eq("user_id", user_id).order("created_at", { ascending: false }).limit(10),
      serviceClient.from("user_health_scores").select("*").eq("user_id", user_id).maybeSingle(),
    ]);

    const userData = `
USER PROFILE: ${JSON.stringify(profileRes.data || {})}
CONSCIOUSNESS: ${JSON.stringify(consciousnessRes.data || {})}
ACTIVE LOOPS: ${JSON.stringify(loopsRes.data || [])}
RECENT SESSIONS (last 20): ${JSON.stringify(sessionsRes.data || [])}
RECENT JOURNALS (last 10): ${JSON.stringify(journalsRes.data || [])}
HEALTH SCORE: ${JSON.stringify(healthRes.data || {})}
`;

    const __billing = await getBillingFromReq(req, "admin-ai-insights");

    const response = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a user intelligence analyst for HOPE. Analyze this user's data and provide a comprehensive intelligence report.

Include:
1. **User Summary** - Who they are, how engaged, key metrics
2. **Behavioral Patterns** - What they do most, when they're active, preferences
3. **Problems & Friction** - Where they struggled, dropped off, or showed confusion
4. **Psychological Loops** - Active patterns, severity, awareness level
5. **Engagement Health** - Risk of churn, engagement trajectory
6. **Recommendations** - How to better serve this user, what content/features they need

Be specific with data. Use markdown formatting.`,
          },
          {
            role: "user",
            content: `Analyze this user:\n${userData}`,
          },
        ],
        stream: false,
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const aiResult = await response.json();
    const analysis = aiResult.choices?.[0]?.message?.content || "Analysis unavailable";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
