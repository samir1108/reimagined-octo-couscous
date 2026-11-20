/**
 * github-late-night-watcher
 * Scans last 24h of authored commits per consenting user and counts those made
 * between 22:00 and 05:00 local-ish time (UTC-shifted by user_time_profile if
 * available, else UTC). Writes a single work_signals row per user with a
 * 'late_night_commits' signal_type and a normalized intensity value [0..1].
 *
 * Requires a GITHUB_TOKEN secret (classic PAT or fine-grained, repo:read scope)
 * AND a 'github_username' field on signal_consents.meta for each user.
 * If the token is missing the function is a graceful no-op.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const TOKEN = Deno.env.get("GITHUB_TOKEN");

  if (!TOKEN) {
    return new Response(JSON.stringify({ skipped: true, reason: "GITHUB_TOKEN not set" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: consents } = await sb
    .from("signal_consents")
    .select("user_id, meta")
    .eq("source", "github")
    .eq("enabled", true);

  if (!consents?.length) {
    return new Response(JSON.stringify({ users: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const rows: any[] = [];

  for (const c of consents) {
    const username = (c.meta as any)?.github_username as string | undefined;
    if (!username) continue;

    try {
      const url = `https://api.github.com/search/commits?q=${encodeURIComponent(
        `author:${username} author-date:>${since.slice(0, 10)}`,
      )}&per_page=100&sort=author-date&order=desc`;

      const r = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/vnd.github.cloak-preview+json",
        },
      });

      if (!r.ok) {
        console.error("github fetch", r.status, await r.text());
        continue;
      }

      const j = await r.json();
      const items: any[] = j.items ?? [];

      let lateCount = 0;
      for (const it of items) {
        const dt = new Date(it.commit?.author?.date ?? it.commit?.committer?.date);
        const hour = dt.getUTCHours();
        // 22:00 — 05:00 UTC heuristic
        if (hour >= 22 || hour < 5) lateCount++;
      }

      const total = items.length || 1;
      const intensity = Math.min(1, lateCount / Math.min(20, total));

      rows.push({
        user_id: c.user_id,
        source: "github",
        signal_type: "late_night_commits",
        text_value: lateCount > 5 ? "burning_midnight_oil" : lateCount > 2 ? "late_pushes" : "normal_hours",
        value: intensity,
        meta: { late_count: lateCount, total_24h: items.length, window_hours: 24 },
      });
    } catch (e) {
      console.error("github watcher error for user", c.user_id, e);
    }
  }

  if (rows.length) await sb.from("work_signals").insert(rows);

  return new Response(JSON.stringify({ users: rows.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
