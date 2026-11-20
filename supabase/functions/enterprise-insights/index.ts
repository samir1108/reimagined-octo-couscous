import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {

    const { employeeProfiles, orgName, teamStats } = await req.json();

    if (!employeeProfiles || employeeProfiles.length === 0) {
      return new Response(JSON.stringify({ insights: { summary: "No employee data available yet. Invite team members and wait for them to start their journey.", recommendations: [], atRisk: [], teamSummaries: [] } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a compact data summary for the AI
    const dataSummary = employeeProfiles.map((ep: any) => ({
      name: ep.profile?.display_name || ep.member?.email || "Unknown",
      role: ep.member?.role,
      band: ep.consciousness?.overall_band || 0,
      streak: ep.consciousness?.streak_current || 0,
      sessions: ep.consciousness?.total_sessions || 0,
      phase: ep.consciousness?.journey_phase || "unknown",
      bypassing_risk: ep.consciousness?.bypassing_risk || 0,
      witness_depth: ep.consciousness?.witness_depth || 0,
      integration: ep.consciousness?.integration_score || 0,
      dimensions: ep.consciousness?.dimension_bands || {},
    }));

    const teamSummary = (teamStats || []).map((ts: any) => ({
      team: ts.team?.name,
      members: ts.memberCount,
      avgBand: ts.avgBand,
      avgStreak: ts.avgStreak,
      totalSessions: ts.totalSessions,
    }));

    const systemPrompt = `You are HOPE Enterprise AI Analyst. You analyze organizational consciousness and wellbeing data. 
Your response must be a JSON object with exactly these fields:
- summary: A 2-3 sentence org health narrative
- recommendations: Array of {title, description, priority} objects (3-5 items). Priority is "high", "medium", or "low"
- atRisk: Array of {name, risk, suggestion} objects for employees needing attention
- teamSummaries: Array of {team, insight} objects with one-line insights per team
- burnoutPredictions: Array of {name, riskLevel, indicators} where riskLevel is 0-100

Be specific, actionable, and compassionate. Reference actual data points.`;

    const userPrompt = `Analyze this organization "${orgName || "Enterprise"}":

Employee Data: ${JSON.stringify(dataSummary)}

Team Stats: ${JSON.stringify(teamSummary)}

Provide your analysis as structured JSON.`;

    const __billing = await getBillingFromReq(req, "enterprise-insights");

    const response = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_insights",
            description: "Provide structured enterprise insights analysis",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                    },
                    required: ["title", "description", "priority"],
                  },
                },
                atRisk: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      risk: { type: "string" },
                      suggestion: { type: "string" },
                    },
                    required: ["name", "risk", "suggestion"],
                  },
                },
                teamSummaries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      team: { type: "string" },
                      insight: { type: "string" },
                    },
                    required: ["team", "insight"],
                  },
                },
                burnoutPredictions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      riskLevel: { type: "number" },
                      indicators: { type: "string" },
                    },
                    required: ["name", "riskLevel", "indicators"],
                  },
                },
              },
              required: ["summary", "recommendations", "atRisk", "teamSummaries", "burnoutPredictions"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_insights" } },
      }, {}, __billing ?? undefined);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let insights;

    if (toolCall?.function?.arguments) {
      insights = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      // Fallback
      insights = {
        summary: "Analysis could not be completed. Please try again.",
        recommendations: [],
        atRisk: [],
        teamSummaries: [],
        burnoutPredictions: [],
      };
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enterprise-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
