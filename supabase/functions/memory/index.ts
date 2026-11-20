import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface MemoryRequest {
  action: "embed" | "recall" | "synthesize-daily" | "consolidate" | "extract" | "consolidate-thread";
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
    const { action, ...params } = body as MemoryRequest;

    if (!action) return new Response(JSON.stringify({ error: "action required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const functionMap: Record<string, string> = {
      "embed": "embed-memory",
      "recall": "recall-memory",
      "synthesize-daily": "synthesize-daily-memory",
      "consolidate": "memory-consolidate",
      "extract": "memory-extract",
      "consolidate-thread": "consolidate-memory-thread",
    };

    const targetFunction = functionMap[action];
    if (!targetFunction) return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data, error } = await admin.functions.invoke(targetFunction, {
      body: params,
      headers: { Authorization: auth },
    });

    if (error) throw error;
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("memory error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});