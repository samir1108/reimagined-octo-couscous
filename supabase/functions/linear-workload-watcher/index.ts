/**
 * linear-workload-watcher
 * Reads open issues assigned to current user via Linear GraphQL gateway,
 * computes workload (open count, urgent count, due-soon count) and writes
 * work_signals per user. Late-night activity → burnout signal.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const GATEWAY_URL = "https://connector-gateway.consciousos.dev/linear";

const QUERY = `
  query Me {
    viewer {
      assignedIssues(first: 100, filter: { state: { type: { in: ["unstarted", "started"] } } }) {
        nodes { id priority dueDate updatedAt }
      }
    }
  }
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const CONSCIOUSOS_API_KEY = Deno.env.get("CONSCIOUSOS_API_KEY");
  const KEY = Deno.env.get("LINEAR_API_KEY");

  if (!CONSCIOUSOS_API_KEY || !KEY) {
    return new Response(JSON.stringify({ skipped: true, reason: "Linear not connected" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: consents } = await sb
    .from("signal_consents")
    .select("user_id")
    .eq("source", "linear")
    .eq("enabled", true);

  if (!consents?.length) {
    return new Response(JSON.stringify({ users: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let nodes: any[] = [];
  try {
    const r = await fetch(`${GATEWAY_URL}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONSCIOUSOS_API_KEY}`,
        "X-Connection-Api-Key": KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY }),
    });
    const j = await r.json();
    nodes = j?.data?.viewer?.assignedIssues?.nodes ?? [];
  } catch (e) {
    console.error("linear fetch error", e);
  }

  const now = Date.now();
  const open = nodes.length;
  const urgent = nodes.filter((n) => n.priority === 1).length;
  const dueSoon = nodes.filter((n) => n.dueDate && new Date(n.dueDate).getTime() - now < 3 * 86400_000).length;
  const lateNight = nodes.filter((n) => {
    const h = new Date(n.updatedAt).getUTCHours();
    return h >= 20 || h < 5;
  }).length;

  // workload score 0..1
  const workload = Math.tanh(open / 25 + urgent / 5 + dueSoon / 8);

  await sb.from("work_signals").insert(
    consents.map((c) => ({
      user_id: c.user_id,
      source: "linear",
      signal_type: "workload",
      text_value: workload > 0.7 ? "heavy" : workload > 0.4 ? "moderate" : "light",
      value: workload,
      meta: { open, urgent, due_soon: dueSoon, late_night_edits: lateNight },
    })),
  );

  return new Response(JSON.stringify({ open, urgent, dueSoon, lateNight, workload }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
