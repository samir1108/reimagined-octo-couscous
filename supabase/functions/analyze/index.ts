import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface AnalyzeRequest {
  type: "three-lens" | "human-map" | "signal-fusion" | "pulse" | "pattern" | "live" | "detect";
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
    const { type, ...params } = body as AnalyzeRequest;

    if (!type) return new Response(JSON.stringify({ error: "type required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const functionMap: Record<string, string> = {
      "three-lens": "three-lens-analyzer",
      "human-map": "integrate-human-map",
      "signal-fusion": "signal-fusion",
      "pulse": "instant-pulse-detector",
      "pattern": "pattern-window-detector",
      "live": "live-detect",
      "detect": "detect",
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
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});