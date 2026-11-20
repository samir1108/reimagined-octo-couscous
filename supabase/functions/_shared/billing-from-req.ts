// ============================================================
// Tiny helper: derive { admin, userId, aiMode } from a Request's Authorization
// header. Returns null when unauthenticated. Used by edge functions to
// pass `billing` context into aiGatewayFetch for auto-metering and to
// route between Fast (Groq) and Premium (GPT-5.5) modes per user.
// ============================================================

import { createClient } from "./supabase-client.ts";

export type AiMode = "fast" | "premium";

export async function getBillingFromReq(req: Request, functionName: string) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Look up the user's chosen AI mode (defaults to 'fast' from DB column default).
    let aiMode: AiMode = "fast";
    try {
      const { data } = await admin
        .from("profiles")
        .select("ai_mode")
        .eq("user_id", user.id)
        .maybeSingle();
      const m = (data as any)?.ai_mode;
      if (m === "premium" || m === "fast") aiMode = m;
    } catch {
      /* keep default */
    }

    return { admin, userId: user.id, functionName, aiMode };
  } catch {
    return null;
  }
}
