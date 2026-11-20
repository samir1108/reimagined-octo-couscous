import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Layer = "bio" | "work" | "device";

interface IngestPoint {
  layer: Layer;
  source: string;
  // bio
  metric?: string;
  unit?: string;
  // work
  signal_type?: string;
  text_value?: string;
  // device
  category?: string;
  // shared
  value?: number;
  recorded_at?: string;
  meta?: Record<string, unknown>;
}

const TABLE: Record<Layer, string> = {
  bio: "bio_signals",
  work: "work_signals",
  device: "device_signals",
};

const TIME_COL: Record<Layer, string> = {
  bio: "recorded_at",
  work: "occurred_at",
  device: "bucket_start",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const points: IngestPoint[] = Array.isArray(body?.points) ? body.points : [body];

    if (!points.length || points.length > 500) {
      return new Response(JSON.stringify({ error: "invalid batch size" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consent check — fetch enabled sources for user
    const { data: consents } = await supabase
      .from("signal_consents")
      .select("source, enabled")
      .eq("user_id", userId)
      .eq("enabled", true);
    const allowed = new Set((consents ?? []).map((c) => c.source));

    const grouped: Record<Layer, any[]> = { bio: [], work: [], device: [] };
    let rejected = 0;

    for (const p of points) {
      if (!p?.layer || !TABLE[p.layer] || !p.source) {
        rejected++;
        continue;
      }
      if (!allowed.has(p.source)) {
        rejected++;
        continue;
      }
      const ts = p.recorded_at ?? new Date().toISOString();
      const base: Record<string, unknown> = {
        user_id: userId,
        source: p.source,
        meta: p.meta ?? {},
        [TIME_COL[p.layer]]: ts,
      };
      if (p.layer === "bio") {
        if (!p.metric || typeof p.value !== "number") {
          rejected++;
          continue;
        }
        grouped.bio.push({ ...base, metric: p.metric, value: p.value, unit: p.unit ?? null });
      } else if (p.layer === "work") {
        if (!p.signal_type) {
          rejected++;
          continue;
        }
        grouped.work.push({
          ...base,
          signal_type: p.signal_type,
          value: p.value ?? null,
          text_value: p.text_value ?? null,
        });
      } else {
        if (!p.signal_type || typeof p.value !== "number") {
          rejected++;
          continue;
        }
        grouped.device.push({
          ...base,
          signal_type: p.signal_type,
          category: p.category ?? null,
          value: p.value,
        });
      }
    }

    const inserted: Record<string, number> = {};
    for (const layer of Object.keys(grouped) as Layer[]) {
      const rows = grouped[layer];
      if (!rows.length) continue;
      const { error } = await supabase.from(TABLE[layer]).insert(rows);
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message, layer }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      inserted[layer] = rows.length;
    }

    return new Response(
      JSON.stringify({ ok: true, inserted, rejected }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
