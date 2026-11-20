/**
 * tone-watcher
 * Unified tone watcher for Gmail, Outlook, Teams, and Slack.
 * Accepts `source` query param: gmail | outlook | teams | slack
 * Scores tone (charged / neutral / calm) and writes work_signals rows.
 * Run from pg_cron every 15 min with source param.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SourceConfig {
  gatewayUrl: string;
  apiKeyEnv: string;
  consentSource: string;
  signalType: string;
  charged: string[];
  calm: string[];
  fetchMessages: (gatewayUrl: string, apiKey: string, windowSec: number) => Promise<string[]>;
}

const SOURCE_CONFIGS: Record<string, SourceConfig> = {
  gmail: {
    gatewayUrl: "https://connector-gateway.consciousos.dev/google_mail",
    apiKeyEnv: "GOOGLE_MAIL_API_KEY",
    consentSource: "gmail",
    signalType: "inbox_tone",
    charged: ["urgent", "asap", "escalat", "blocker", "stuck", "fail", "broken", "deadline", "overdue", "critical", "issue", "bug", "incident"],
    calm: ["thanks", "great", "approved", "done", "shipped", "appreciate", "kudos", "celebrat", "well done"],
    async fetchMessages(gatewayUrl: string, apiKey: string, windowSec: number) {
      const sinceSec = Math.floor((Date.now() - windowSec) / 1000);
      const listUrl = `${gatewayUrl}/gmail/v1/users/me/messages?maxResults=25&q=${encodeURIComponent(`in:inbox after:${sinceSec}`)}`;
      const r = await fetch(listUrl, { headers: { Authorization: `Bearer ${Deno.env.get("CONSCIOUSOS_API_KEY")}`, "X-Connection-Api-Key": apiKey } });
      const j = await r.json();
      const ids: string[] = (j.messages ?? []).slice(0, 15).map((m: any) => m.id);
      const snippets: string[] = [];
      for (const id of ids) {
        const mr = await fetch(`${gatewayUrl}/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject`, { headers: { Authorization: `Bearer ${Deno.env.get("CONSCIOUSOS_API_KEY")}`, "X-Connection-Api-Key": apiKey } });
        const m = await mr.json();
        const subj = m?.payload?.headers?.find((h: any) => h.name?.toLowerCase() === "subject")?.value ?? "";
        const snip = m?.snippet ?? "";
        snippets.push(`${subj} ${snip}`);
      }
      return snippets;
    },
  },
  outlook: {
    gatewayUrl: "https://connector-gateway.consciousos.dev/microsoft_outlook",
    apiKeyEnv: "MICROSOFT_OUTLOOK_API_KEY",
    consentSource: "outlook",
    signalType: "inbox_tone",
    charged: ["urgent", "asap", "escalat", "blocker", "stuck", "fail", "broken", "deadline", "overdue", "critical", "issue", "bug"],
    calm: ["thanks", "great", "approved", "done", "shipped", "appreciate", "kudos", "wins", "celebrat"],
    async fetchMessages(gatewayUrl: string, apiKey: string, windowSec: number) {
      const since = new Date(Date.now() - windowSec).toISOString();
      const url = `${gatewayUrl}/v1.0/me/mailFolders/Inbox/messages?$top=25&$select=subject,bodyPreview,receivedDateTime&$filter=${encodeURIComponent(`receivedDateTime ge ${since}`)}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${Deno.env.get("CONSCIOUSOS_API_KEY")}`, "X-Connection-Api-Key": apiKey } });
      const j = await r.json();
      const msgs = j.value ?? [];
      return msgs.map((m: any) => `${m.subject ?? ""} ${m.bodyPreview ?? ""}`);
    },
  },
  teams: {
    gatewayUrl: "https://connector-gateway.consciousos.dev/microsoft_teams",
    apiKeyEnv: "MICROSOFT_TEAMS_API_KEY",
    consentSource: "teams",
    signalType: "chat_tone",
    charged: ["urgent", "asap", "stuck", "blocked", "frustrat", "broken", "panic", "fire", "deadline", "stress"],
    calm: ["thanks", "great", "love", "ship", "shipped", "wins", "merged", "done", "appreciate"],
    async fetchMessages(gatewayUrl: string, apiKey: string, windowSec: number) {
      const r = await fetch(`${gatewayUrl}/v1.0/me/chats/getAllMessages?$top=50`, { headers: { Authorization: `Bearer ${Deno.env.get("CONSCIOUSOS_API_KEY")}`, "X-Connection-Api-Key": apiKey } });
      const j = await r.json();
      const cutoff = Date.now() - windowSec;
      const msgs = (j.value ?? []).filter((m: any) => {
        if (!m.body?.content) return false;
        const ts = new Date(m.createdDateTime).getTime();
        return ts >= cutoff;
      });
      return msgs.map((m: any) => (m.body?.content ?? "").replace(/<[^>]+>/g, " "));
    },
  },
  slack: {
    gatewayUrl: "https://connector-gateway.consciousos.dev/slack/api",
    apiKeyEnv: "SLACK_API_KEY",
    consentSource: "slack",
    signalType: "channel_tone",
    charged: ["urgent", "asap", "stuck", "blocked", "frustrat", "angry", "fail", "broken", "panic", "fire", "deadline", "stress", "overwhelm"],
    calm: ["thanks", "great", "love", "ship", "shipped", "wins", "celebrate", "merged", "done", "appreciate"],
    async fetchMessages(gatewayUrl: string, apiKey: string, windowSec: number) {
      const oldest = Math.floor((Date.now() - windowSec) / 1000);
      const channelsRes = await fetch(`${gatewayUrl}/conversations.list?limit=20&types=public_channel&exclude_archived=true`, {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("CONSCIOUSOS_API_KEY")}`, "X-Connection-Api-Key": apiKey },
      });
      const channelsData = await channelsRes.json();
      const channels = (channelsData.channels ?? []).slice(0, 8);
      const oldestTs = Math.floor((Date.now() - windowSec) / 1000);
      const allTexts: string[] = [];
      for (const ch of channels) {
        const histRes = await fetch(`${gatewayUrl}/conversations.history?channel=${ch.id}&oldest=${oldestTs}&limit=50`, {
          method: "POST",
          headers: { Authorization: `Bearer ${Deno.env.get("CONSCIOUSOS_API_KEY")}`, "X-Connection-Api-Key": apiKey },
        });
        const hist = await histRes.json();
        const msgs = (hist.messages ?? []).filter((m: any) => m.text && !m.bot_id);
        allTexts.push(...msgs.map((m: any) => m.text));
      }
      return allTexts;
    },
  },
};

function score(text: string, charged: string[], calm: string[]) {
  const t = text.toLowerCase();
  let c = 0, k = 0;
  for (const w of charged) if (t.includes(w)) c++;
  for (const w of calm) if (t.includes(w)) k++;
  const energy = Math.tanh((c - k) / 3);
  const tone = c > k + 1 ? "charged" : k > c + 1 ? "calm" : "neutral";
  return { tone, energy };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const source = url.searchParams.get("source");
  const windowMinutes = parseInt(url.searchParams.get("window_minutes") || "15", 10);
  const windowSec = windowMinutes * 60_000;

  if (!source || !SOURCE_CONFIGS[source]) {
    return new Response(JSON.stringify({ error: "Invalid source. Use gmail, outlook, teams, or slack." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const config = SOURCE_CONFIGS[source];
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const CONSCIOUSOS_API_KEY = Deno.env.get("CONSCIOUSOS_API_KEY");
  const API_KEY = Deno.env.get(config.apiKeyEnv);

  if (!CONSCIOUSOS_API_KEY || !API_KEY) {
    return new Response(JSON.stringify({ skipped: true, reason: `${source} not connected` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { data: consents } = await sb
    .from("signal_consents")
    .select("user_id")
    .eq("source", config.consentSource)
    .eq("enabled", true);

  if (!consents?.length) {
    return new Response(JSON.stringify({ users: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let texts: string[] = [];
  try {
    texts = await config.fetchMessages(config.gatewayUrl, API_KEY, windowSec);
  } catch (e) {
    console.error(`${source} fetch error`, e);
  }

  if (!texts.length) {
    return new Response(JSON.stringify({ msgs: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const joined = texts.join(" ");
  const { tone, energy } = score(joined, config.charged, config.calm);

  if (source === "slack") {
    // Slack writes per-channel, but we only have aggregated text here
    // For simplicity, write one row per consenting user
    await sb.from("work_signals").insert(
      consents.map((c) => ({
        user_id: c.user_id,
        source: config.consentSource,
        signal_type: config.signalType,
        text_value: tone,
        value: energy,
        meta: { msg_count: texts.length, window_minutes: windowMinutes },
      }))
    );
  } else {
    await sb.from("work_signals").insert(
      consents.map((c) => ({
        user_id: c.user_id,
        source: config.consentSource,
        signal_type: config.signalType,
        text_value: tone,
        value: energy,
        meta: { msg_count: texts.length, window_minutes: windowMinutes },
      }))
    );
  }

  return new Response(JSON.stringify({ msgs: texts.length, tone, energy, source }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});