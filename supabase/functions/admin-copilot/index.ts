import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { meterDrainedStream } from "../_shared/ai-billing.ts";
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

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) throw new Error("Access denied");

    const { messages } = await req.json();

    // Fetch platform context for AI
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [statsRes, healthRes] = await Promise.all([
      serviceClient.rpc("get_admin_stats"),
      serviceClient.rpc("get_admin_health_overview"),
    ]);

    const platformContext = `
PLATFORM DATA (Live):
- Total Users: ${statsRes.data?.total_users || 0}
- Onboarded: ${statsRes.data?.onboarded_users || 0}
- Total Sessions: ${statsRes.data?.total_sessions || 0}
- Sessions Today: ${statsRes.data?.sessions_today || 0}
- Total Journals: ${statsRes.data?.total_journals || 0}
- Tasks Completed: ${statsRes.data?.completed_tasks || 0} / ${statsRes.data?.total_tasks || 0}
- Avg Consciousness Band: ${statsRes.data?.avg_consciousness_band || 0}
- Organizations: ${statsRes.data?.total_orgs || 0}
- Total Memories: ${statsRes.data?.total_memories || 0}

HEALTH SCORES:
- Healthy Users: ${healthRes.data?.healthy || 0}
- Warning: ${healthRes.data?.warning || 0}
- At Risk: ${healthRes.data?.at_risk || 0}
- Critical: ${healthRes.data?.critical || 0}
- Avg Engagement: ${healthRes.data?.avg_engagement || 0}
- Avg Churn Risk: ${healthRes.data?.avg_churn_risk || 0}

AT-RISK USERS:
${JSON.stringify(healthRes.data?.at_risk_users || [], null, 2)}
`;

    const __billing = await getBillingFromReq(req, "admin-copilot");

    const response = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are the HOPE Platform Intelligence AI. You help admins (CTO/CEO/Developers) understand their platform.

You have access to live platform data. Answer questions about users, engagement, churn risk, retention, and platform health.

Be data-driven, specific, and actionable. Use numbers from the data. Suggest improvements when relevant.

Format responses with markdown for clarity. Use bullet points and bold for key metrics.

${platformContext}`,
          },
          ...messages,
        ],
        stream: true,
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    // Metering: the auto-meter path in aiGatewayFetch skips streams, so charge
    // this one here after the SSE body drains, or streaming is free.
    const streamed = __billing && response.body
      ? meterDrainedStream(response.body, {
          admin: __billing.admin,
          userId: __billing.userId,
          functionName: "admin-copilot",
          model: "tier:nano",
          inputText: [
            `You are the HOPE Platform Intelligence AI. You help admins (CTO/CEO/Developers) understand their platform.

You have access to live platform data. Answer questions about users, engagement, churn risk, retention, and platform health.

Be data-driven, specific, and actionable. Use numbers from the data. Suggest improvements when relevant.

Format responses with markdown for clarity. Use bullet points and bold for key metrics.

${platformContext}`,
            ...(messages ?? []),
          ].map((m: any) => String(m?.content ?? "")).join("\n"),
        })
      : response.body;

    return new Response(streamed, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("admin-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
