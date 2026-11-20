import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { aiGatewayFetch } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GAME_CONTEXT: Record<string, string> = {
  "bell-in-the-wind":   "Attention. The user heard bells in a black void; we measured tab-blur and cursor-leave counts.",
  "the-pause":          "Impulse mastery. A pulsing red button asked to be pressed; we measured whether the user pressed and when.",
  "silent-mountain":    "Silence. An empty screen revealed stars/path/peaks the longer the user stayed still; any input reset everything.",
  "breath-temple":      "Breath awareness via mic amplitude.",
  "thought-watcher":    "Observation of drifting thought-words.",
  "who-is-thinking":    "Self-inquiry through dwell time.",
  "mirror-realm":       "Ego reactivity through typing biometrics.",
  "emotional-resonance":"Compassion via mic patience.",
  "body-scanner":       "Inner sensing via tap-pattern entropy.",
  "sound-microscope":   "Subtle perception of tone shifts.",
  "real-world-quest":   "Off-screen sit; reflection on return.",
  "non-dual-door":      "Integration: a door that opens to intentional inaction.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { gameId, signals, durationMs, outcome } = await req.json();
    if (!gameId) {
      return new Response(JSON.stringify({ error: "gameId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;

    const ctx = GAME_CONTEXT[gameId] ?? "A small consciousness game.";
    const sys = `You are a quiet inner-witness voice for a meditative micro-game. ` +
      `Reply with EXACTLY ONE short sentence (max 16 words). ` +
      `No advice, no spirituality jargon, no praise, no scoring, no "you did", no instructions. ` +
      `Reflect what the signals reveal. Plain English, lowercase preferred unless starting a sentence.`;
    const user = `Game: ${gameId}\nContext: ${ctx}\nDuration: ${Math.round((durationMs||0)/1000)}s\nOutcome: ${outcome}\nSignals: ${JSON.stringify(signals)}`;

    const billing = await getBillingFromReq(req, "reflect-game");

    const resp = await aiGatewayFetch({
      model: "tier:fast",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      max_tokens: 60,
    }, {}, billing ?? undefined);

    if (!resp.ok) {
      const t = await resp.text();
      console.error("[reflect-game] AI error", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly.", reflection: defaultLine(gameId, signals) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits.", reflection: defaultLine(gameId, signals) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ reflection: defaultLine(gameId, signals) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const json = await resp.json();
    const line = json?.choices?.[0]?.message?.content?.trim?.() || defaultLine(gameId, signals);
    return new Response(JSON.stringify({ reflection: line, userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[reflect-game]", e);
    return new Response(JSON.stringify({ reflection: "Notice what you noticed." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function defaultLine(gameId: string, signals: any): string {
  if (gameId === "the-pause") return signals?.pressed ? "The hand moved before you did." : "The pulse passed. You stayed.";
  if (gameId === "bell-in-the-wind") return (signals?.tab_blur_count ?? 0) > 0 ? "Attention left the room more than once." : "You kept the room.";
  if (gameId === "silent-mountain") return (signals?.revealed_count ?? 0) >= 3 ? "Stillness drew the mountain forward." : "The mountain waits longer than you did.";
  return "Notice what you noticed.";
}
