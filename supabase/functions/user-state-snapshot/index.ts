// ============================================================
// USER STATE SNAPSHOT — The Mainspring
// ------------------------------------------------------------
// Single source of truth for "who is this user right now".
// Wraps the shared getUserContext() with per-user 60s caching.
//
// Every engine should call THIS instead of querying raw tables.
// Clients can also call it for diagnostics / "my state" views.
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { getUserContext, type UserContextRuntime } from "../_shared/user-context.ts";

// In-memory cache (per-instance). 60s TTL.
type CacheEntry = { ctx: unknown; expires: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 60_000;

function cacheKey(userId: string, runtime: UserContextRuntime): string {
  // Cache key includes runtime so "morning low-energy 5min" != "evening high 15min"
  return [
    userId,
    runtime.gate ?? "",
    runtime.energy ?? "",
    runtime.timeBudgetMin ?? "",
    runtime.mood ?? "",
  ].join("|");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Identify caller — accept either JWT (client) or service-role (internal)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    let userId: string | null = null;
    let runtime: UserContextRuntime = {};
    let forceFresh = false;

    // Parse body (POST) or query (GET)
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      runtime = body.runtime ?? {};
      forceFresh = !!body.forceFresh;
      // Internal callers (service-role) can pass userId directly
      if (token === serviceKey && typeof body.userId === "string") {
        userId = body.userId;
      }
    }

    // If still no userId, resolve from JWT
    if (!userId) {
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Missing Authorization" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const authed = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData, error: userErr } = await authed.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      userId = userData.user.id;
    }

    const key = cacheKey(userId, runtime);
    const now = Date.now();
    if (!forceFresh) {
      const hit = cache.get(key);
      if (hit && hit.expires > now) {
        return new Response(
          JSON.stringify({ snapshot: hit.ctx, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" } },
        );
      }
    }

    // Build fresh snapshot with service-role (reads across user-owned tables)
    const svc = createClient(supabaseUrl, serviceKey);
    const ctx = await getUserContext(svc, userId, runtime);

    cache.set(key, { ctx, expires: now + TTL_MS });

    // Opportunistic eviction
    if (cache.size > 500) {
      for (const [k, v] of cache) {
        if (v.expires < now) cache.delete(k);
      }
    }

    return new Response(
      JSON.stringify({ snapshot: ctx, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" } },
    );
  } catch (err) {
    console.error("[user-state-snapshot] error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
