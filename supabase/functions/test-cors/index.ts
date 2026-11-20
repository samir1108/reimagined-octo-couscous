// Test CORS for composeSessionV3 imports
import { createClient } from "npm:@supabase/supabase-js@2";
import { getUserContext, type Energy, type Gate } from "../_shared/user-context.ts";
import { buildLongTermMemoryBlock, embedText } from "../_shared/long-term-memory.ts";
import { aiGatewayFetch, aiGatewayFetchWithLang, type AiMode } from "../_shared/ai-config.ts";
import { buildPracticeMatrixSignal } from "../_shared/practiceMatrix.ts";
import { detectBlockedChakra } from "../_shared/chakraEngine.ts";
import { loopName } from "../_shared/loopMap.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  return new Response(JSON.stringify({ ok: true, message: "Imports work" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});