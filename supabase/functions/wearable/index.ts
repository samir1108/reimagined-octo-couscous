/**
 * wearable — Unified wearable integration.
 * Actions (via ?action=):
 *   oauth-start  — Start OAuth for a provider (oura|fitbit|whoop)
 *   oauth-callback — Handle OAuth callback, store tokens, enable consent
 *   sync         — Daily sync all providers (cron)
 */
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { encrypt, decrypt, isEncrypted } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const PROJECT_REF = SUPABASE_URL.replace(/^https?:\/\/([^.]+).*/, "$1");
const CALLBACK = `${SUPABASE_URL}/functions/v1/wearable`;

const PROVIDERS = {
  oura: {
    authUrl: "https://cloud.ouraring.com/oauth/authorize",
    tokenUrl: "https://api.ouraring.com/oauth/token",
    scope: "personal daily heartrate",
    clientIdEnv: "OURA_CLIENT_ID",
    clientSecretEnv: "OURA_CLIENT_SECRET",
  },
  fitbit: {
    authUrl: "https://www.fitbit.com/oauth2/authorize",
    tokenUrl: "https://api.fitbit.com/oauth2/token",
    scope: "heartrate sleep activity profile",
    clientIdEnv: "FITBIT_CLIENT_ID",
    clientSecretEnv: "FITBIT_CLIENT_SECRET",
  },
  whoop: {
    authUrl: "https://api.prod.whoop.com/oauth/oauth2/auth",
    tokenUrl: "https://api.prod.whoop.com/oauth/oauth2/token",
    scope: "read:recovery read:cycles read:sleep read:profile",
    clientIdEnv: "WHOOP_CLIENT_ID",
    clientSecretEnv: "WHOOP_CLIENT_SECRET",
  },
};

async function startOAuth(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider");
  const cfg = PROVIDERS[provider as keyof typeof PROVIDERS];
  if (!cfg) return new Response("unknown provider", { status: 400, headers: corsHeaders });

  const auth = req.headers.get("Authorization");
  if (!auth) return new Response("auth required", { status: 401, headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return new Response("unauthorized", { status: 401, headers: corsHeaders });

  const clientId = Deno.env.get(cfg.clientIdEnv);
  if (!clientId) return new Response(JSON.stringify({ error: `Missing ${cfg.clientIdEnv}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const state = btoa(JSON.stringify({ uid: u.user.id, p: provider, t: Date.now() }));
  const redirect = `${cfg.authUrl}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(`${SUPABASE_URL}/functions/v1/wearable?action=oauth-callback`)}&scope=${encodeURIComponent(cfg.scope)}&state=${state}`;
  return new Response(JSON.stringify({ redirect, project: PROJECT_REF }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function handleCallback(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state");
    if (!code || !stateRaw) return new Response("missing code/state", { status: 400 });

    const { uid, p } = JSON.parse(atob(stateRaw));
    const cfg = PROVIDERS[p];
    if (!cfg) return new Response("bad provider", { status: 400 });

    const clientId = Deno.env.get(cfg.clientIdEnv);
    const clientSecret = Deno.env.get(cfg.clientSecretEnv);
    if (!clientId || !clientSecret) return new Response("missing provider secrets", { status: 500 });

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${SUPABASE_URL}/functions/v1/wearable?action=oauth-callback`,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const resp = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`) },
      body: params.toString(),
    });
    const tok = await resp.json();
    if (!resp.ok) return new Response(JSON.stringify(tok), { status: 502 });

    const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const encryptedAccess = await encrypt(tok.access_token);
    const encryptedRefresh = tok.refresh_token ? await encrypt(tok.refresh_token) : null;
    await admin.from("wearable_tokens").upsert(
      {
        user_id: uid,
        provider: p,
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        expires_at: tok.expires_in ? new Date(Date.now() + tok.expires_in * 1000).toISOString() : null,
        scope: tok.scope ?? null,
        meta: { token_type: tok.token_type ?? null },
      },
      { onConflict: "user_id,provider" },
    );

    await admin.from("signal_consents").upsert(
      { user_id: uid, source: p, enabled: true, mode: "balanced", granted_at: new Date().toISOString() },
      { onConflict: "user_id,source" },
    );

    const target = `${url.origin}/app/integrations?connected=${p}`;
    return Response.redirect(target, 302);
  } catch (e) {
    return new Response(`error: ${e instanceof Error ? e.message : "unknown"}`, { status: 500 });
  }
}

async function syncAll() {
  const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: tokens } = await admin.from("wearable_tokens").select("user_id, provider, access_token");

  const SYNC = {
    oura: async (token: string) => {
      const end = new Date().toISOString().slice(0, 10);
      const start = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
      const out: any[] = [];
      const r = await fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${start}&end_date=${end}`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const j = await r.json(); const last = j?.data?.at(-1); if (last?.score) out.push({ metric: "readiness", value: last.score, unit: "score" }); if (last?.contributors?.hrv_balance) out.push({ metric: "hrv_rmssd", value: last.contributors.hrv_balance, unit: "score" }); }
      const s = await fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${start}&end_date=${end}`, { headers: { Authorization: `Bearer ${token}` } });
      if (s.ok) { const j = await s.json(); const last = j?.data?.at(-1); if (last?.score) out.push({ metric: "sleep_score", value: last.score, unit: "score" }); }
      return out;
    },
    fitbit: async (token: string) => {
      const out: any[] = [];
      const date = new Date().toISOString().slice(0, 10);
      const r = await fetch(`https://api.fitbit.com/1/user/-/hrv/date/${date}.json`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const j = await r.json(); const v = j?.hrv?.[0]?.value?.dailyRmssd; if (typeof v === "number") out.push({ metric: "hrv_rmssd", value: v, unit: "ms" }); }
      const s = await fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, { headers: { Authorization: `Bearer ${token}` } });
      if (s.ok) { const j = await s.json(); const eff = j?.sleep?.[0]?.efficiency; if (typeof eff === "number") out.push({ metric: "sleep_score", value: eff, unit: "score" }); }
      return out;
    },
    whoop: async (token: string) => {
      const out: any[] = [];
      const r = await fetch("https://api.prod.whoop.com/developer/v1/recovery", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const j = await r.json(); const last = j?.records?.[0]?.score; if (last?.recovery_score) out.push({ metric: "readiness", value: last.recovery_score, unit: "score" }); if (last?.hrv_rmssd_milli) out.push({ metric: "hrv_rmssd", value: last.hrv_rmssd_milli, unit: "ms" }); if (last?.resting_heart_rate) out.push({ metric: "rhr", value: last.resting_heart_rate, unit: "bpm" }); }
      return out;
    },
  };

  const results = [];
  for (const row of tokens ?? []) {
    const fn = SYNC[row.provider as keyof typeof SYNC];
    if (!fn) continue;
    try {
      const rawToken = isEncrypted(row.access_token) ? await decrypt(row.access_token) : row.access_token;
      const samples = await fn(rawToken);
      if (samples.length) {
        await createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!).from("bio_signals").insert(
          samples.map((s) => ({ user_id: row.user_id, source: row.provider, metric: s.metric, value: s.value, unit: s.unit })),
        );
      }
      results.push({ provider: row.provider, user_id: row.user_id, inserted: samples.length });
    } catch (e) {
      results.push({ provider: row.provider, user_id: row.user_id, inserted: 0, error: e instanceof Error ? e.message : "unknown" });
    }
  }
  return new Response(JSON.stringify({ ok: true, results }), { headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "oauth-start";

  switch (action) {
    case "oauth-start":
      return startOAuth(req);
    case "oauth-callback":
      return handleCallback(req);
    case "sync":
      return syncAll();
    default:
      return new Response(JSON.stringify({ error: "Invalid action. Use oauth-start, oauth-callback, or sync." }), { status: 400, headers: corsHeaders });
  }
});