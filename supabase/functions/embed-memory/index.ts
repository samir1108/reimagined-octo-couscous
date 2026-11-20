import { createClient } from "npm:@supabase/supabase-js@2";
import { embedText, EMBEDDING_DIMENSIONS } from "../_shared/embedding.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const ALLOWED_SOURCE_TYPES = new Set([
  "journal",
  "chat",
  "reflection",
  "session",
  "session_step",
  "observation",
  "pulse",
  "synthesis",
]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const content = String(body.content ?? body.text ?? "").trim();
    if (!content) {
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceTypeRaw = String(body.source_type ?? "session").toLowerCase();
    const sourceType = ALLOWED_SOURCE_TYPES.has(sourceTypeRaw) ? sourceTypeRaw : "session";
    const sourceIdRaw = body.source_id == null ? "" : String(body.source_id);
    const sourceId = UUID_RE.test(sourceIdRaw) ? sourceIdRaw : null;
    const tags = Array.isArray(body.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [];
    const loopIds = Array.isArray(body.loop_ids) ? body.loop_ids.filter((t: unknown) => typeof t === "string") : [];

    const rawEmbedding = await embedText(content);
    const embedding = rawEmbedding && rawEmbedding.length === EMBEDDING_DIMENSIONS ? rawEmbedding : null;

    const { error } = await supabase.from("user_memory_vectors").insert({
      user_id: user.id,
      source_type: sourceType,
      source_id: sourceId,
      content,
      embedding,
      tags,
      loop_ids: loopIds,
    });

    if (error) {
      // Storage is best-effort: the embedding itself is still useful for
      // in-session novelty checks, so never turn a write failure into a hard
      // error for the caller.
      console.error("embed-memory insert error", error.code, error.message);
      return new Response(
        JSON.stringify({
          ok: false,
          stored: false,
          embedded: !!embedding,
          embedding,
          error: "memory write failed",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, stored: true, embedded: !!embedding, embedding }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("embed-memory error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
