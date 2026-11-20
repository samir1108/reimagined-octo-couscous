import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface GenerateSessionRequest {
  type: "agenda" | "practice" | "program" | "path" | "showroom" | "ritual" | "nudge" | "master-step" | "master-teaching" | "personal-program" | "personal-rhythm" | "evolve";
  [key: string]: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const token = auth.replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const { type, ...params } = body as GenerateSessionRequest;

    if (!type) return new Response(JSON.stringify({ error: "type required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const functionMap: Record<string, string> = {
      "agenda": "generate-session-agenda",
      "practice": "generate-practice-session",
      "program": "generate-program-session",
      "path": "generate-path-level-session",
      "showroom": "generate-showroom-day-session",
      "ritual": "generate-daily-ritual",
      "nudge": "generate-journey-nudge",
      "master-step": "generate-master-next-step",
      "master-teaching": "generate-master-theme-teaching",
      "personal-program": "generate-personal-program",
      "personal-rhythm": "generate-personal-rhythm",
      "evolve": "evolve-theme",
    };

    const targetFunction = functionMap[type];
    if (!targetFunction) return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data, error } = await admin.functions.invoke(targetFunction, {
      body: params,
      headers: { Authorization: auth },
    });

    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("generate-session error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});