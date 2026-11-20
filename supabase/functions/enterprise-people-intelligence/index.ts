import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Decision = "promote" | "at_risk" | "project" | "team_fit" | "general";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const question: string = (body.question || "").toString().slice(0, 1000);
    const decision: Decision = (body.decision || "general") as Decision;
    const orgId: string | undefined = body.org_id;
    const projectContext: string = (body.project_context || "").toString().slice(0, 800);
    const candidateIds: string[] = Array.isArray(body.candidate_ids) ? body.candidate_ids : [];

    if (!orgId) throw new Error("org_id required");
    if (!question.trim() && decision === "general") throw new Error("question required");

    // Verify caller is admin/manager of this org
    const { data: membership, error: memErr } = await userClient
      .from("org_members")
      .select("role, status")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (memErr) throw memErr;
    if (!membership || (membership.role !== "admin" && membership.role !== "manager")) {
      throw new Error("Access denied — admin or manager only");
    }

    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Pull org members + linked profile + consciousness data
    let memberQuery = service
      .from("org_members")
      .select("user_id, email, role, team_id, status, joined_at")
      .eq("org_id", orgId)
      .eq("status", "active")
      .not("user_id", "is", null);

    const { data: members, error: mErr } = await memberQuery;
    if (mErr) throw mErr;

    let userIds = (members || []).map((m: any) => m.user_id);
    if (candidateIds.length > 0) {
      userIds = userIds.filter((id: string) => candidateIds.includes(id));
    }
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ analysis: "No employees match the current filters.", candidates: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const [profilesRes, consciousnessRes, teamsRes] = await Promise.all([
      service.from("profiles").select("user_id, display_name").in("user_id", userIds),
      service
        .from("user_consciousness_profile")
        .select(
          "user_id, overall_band, dimension_bands, journey_phase, journey_day, active_loops",
        )
        .in("user_id", userIds),
      service.from("teams").select("id, name").eq("org_id", orgId),
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.user_id, p]));
    const consMap = new Map((consciousnessRes.data || []).map((c: any) => [c.user_id, c]));
    const teamMap = new Map((teamsRes.data || []).map((t: any) => [t.id, t.name]));

    // Build a compact roster (cap to 60 to keep prompt small)
    const roster = (members || [])
      .filter((m: any) => userIds.includes(m.user_id))
      .slice(0, 60)
      .map((m: any) => {
        const p: any = profileMap.get(m.user_id) || {};
        const c: any = consMap.get(m.user_id) || {};
        const loops = Array.isArray(c.active_loops) ? c.active_loops.slice(0, 3) : [];
        return {
          user_id: m.user_id,
          name: p.display_name || m.email || "Unknown",
          role: m.role,
          team: m.team_id ? teamMap.get(m.team_id) || "—" : "—",
          band: c.overall_band ?? null,
          phase: c.journey_phase || null,
          day: c.journey_day ?? null,
          dims: c.dimension_bands || {},
          loops,
        };
      });

    const decisionGuide: Record<Decision, string> = {
      promote:
        "Identify PROMOTION candidates. Weight: high overall_band, growth trajectory (journey_day), balanced dimensions (especially leadership/witness/clarity), low active loop severity.",
      at_risk:
        "Identify AT-RISK / underperforming employees. Weight: low overall_band, regression signals, many active loops, dimension imbalance, low engagement.",
      project:
        "Match employees to the PROJECT described. Weight dimension fit, role, current capacity, and consciousness band relevant to the project domain.",
      team_fit:
        "Suggest a balanced TEAM. Mix dimension strengths, brain dominance, V-levels. Avoid clones.",
      general: "Answer the founder's question using the roster as evidence.",
    };

    const __billing = await getBillingFromReq(req, "enterprise-people-intelligence");

    const systemPrompt = `You are the People Intelligence advisor for an enterprise founder/admin in HOPE.
You see employee consciousness data (overall_band 0-10, dimension scores, journey phase, active behavioral loops).
Be honest, specific, evidence-based. NEVER invent data. If signal is weak, say so.

Decision mode: ${decision.toUpperCase()}
Guidance: ${decisionGuide[decision]}

Output STRICT JSON with this shape and NOTHING ELSE:
{
  "summary": "2-3 sentence executive answer in markdown",
  "candidates": [
    { "user_id": "...", "name": "...", "score": 0-100, "reason": "1-2 sentences citing band/dims/loops" }
  ],
  "caveats": "Optional 1-2 sentences on data confidence or missing signals"
}
Return up to 8 candidates, ranked best-first. If decision is at_risk, rank worst-first (highest risk score).`;

    const userPrompt = `FOUNDER QUESTION: ${question || "(no free-text question)"}
${projectContext ? `PROJECT CONTEXT: ${projectContext}` : ""}

ROSTER (${roster.length} employees):
${JSON.stringify(roster)}`;

    const response = await aiGatewayFetchWithLang(
      req,
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        stream: false,
      },
      {},
      __billing ?? undefined,
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const aiResult = await response.json();
    const raw = aiResult.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw, candidates: [], caveats: "Model returned non-JSON; showing raw text." };
    }

    return new Response(
      JSON.stringify({
        summary: parsed.summary || "",
        candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
        caveats: parsed.caveats || "",
        roster_size: roster.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("enterprise-people-intelligence error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
