// AI-generated guided practice script.
// Public (no auth). Takes a practice's core metadata + instructions and returns
// a sequence of narrated steps calibrated to durationMin. Uses the ConsciousOS AI
// Gateway (google/gemini-3-flash-preview). Falls back to a deterministic
// expansion of the raw instructions if the model call fails, so the client
// experience is always cinematic and voice-narratable.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ReqBody = {
  slug: string;
  name: string;
  sanskrit?: string;
  tradition: string;
  durationMin: number;
  oneLine: string;
  whenToUse: string;
  instructions: string[];
  accent?: string;
};

type Step = {
  title: string;
  line: string;
  seconds: number;
  breath?: "in" | "hold" | "out" | "still";
};

function fallbackSteps(b: ReqBody): Step[] {
  const total = Math.max(60, Math.round(b.durationMin * 60));
  const arrive: Step = {
    title: "Arrive",
    line: `Sit comfortably. Let the eyes soften. We will practice ${b.name} together. There is nowhere to go.`,
    seconds: 18,
    breath: "still",
  };
  const close: Step = {
    title: "Close",
    line: "When you are ready, take one slow breath. Open the eyes. Carry this quiet with you.",
    seconds: 16,
    breath: "out",
  };
  const core = b.instructions.map((line, i) => ({
    title: `Step ${i + 1}`,
    line,
    seconds: 0,
    breath: "still" as const,
  }));
  const remaining = Math.max(60, total - arrive.seconds - close.seconds);
  const per = Math.max(14, Math.floor(remaining / Math.max(1, core.length)));
  return [arrive, ...core.map((s) => ({ ...s, seconds: per })), close];
}

function extractJson(text: string): unknown | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  try { return JSON.parse(raw); } catch {}
  const first = raw.indexOf("[");
  const last = raw.lastIndexOf("]");
  if (first >= 0 && last > first) {
    try { return JSON.parse(raw.slice(first, last + 1)); } catch {}
  }
  const fo = raw.indexOf("{");
  const lo = raw.lastIndexOf("}");
  if (fo >= 0 && lo > fo) {
    try { return JSON.parse(raw.slice(fo, lo + 1)); } catch {}
  }
  return null;
}

function normalizeSteps(raw: unknown, b: ReqBody): Step[] | null {
  const arr: any[] | null = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.steps)
      ? (raw as any).steps
      : null;
  if (!arr || arr.length < 3) return null;
  const cleaned: Step[] = [];
  for (const s of arr) {
    const title = String(s?.title ?? "").slice(0, 80).trim();
    const line = String(s?.line ?? s?.text ?? "").trim();
    const seconds = Math.max(6, Math.min(120, Math.round(Number(s?.seconds ?? 20))));
    const breath = ["in", "hold", "out", "still"].includes(s?.breath) ? s.breath : "still";
    if (!title || !line) continue;
    cleaned.push({ title, line, seconds, breath });
  }
  if (cleaned.length < 3) return null;
  return cleaned;
}

async function generateWithAI(b: ReqBody): Promise<Step[] | null> {
  const key = Deno.env.get("CONSCIOUSOS_API_KEY");
  if (!key) return null;
  const targetSeconds = Math.round(b.durationMin * 60);
  const sys = `You are a master contemplative teacher writing a live, voice-guided practice session.
You will be given the practice's raw instructions and metadata. Rewrite them as a warm,
intimate, spoken script for a real voice to narrate. Follow these rules exactly:

- Return ONLY valid JSON of the form: { "steps": [ { "title": string, "line": string, "seconds": integer, "breath": "in"|"hold"|"out"|"still" } ] }
- 6 to 10 steps total.
- Total of all "seconds" must sum to about ${targetSeconds} (± 15%).
- First step is "Arrive" (14–22s). Last step is "Close" (14–20s).
- "line" is what the narrator SAYS aloud. Second-person, present-tense, warm, unhurried. No stage directions. No headings. No numbered lists inside a line. Under 45 words.
- "title" is a short cue for the visual (2–4 words).
- "breath" reflects the dominant breath phase during that step ("in", "hold", "out", or "still").
- Faithful to the tradition; do not invent doctrine.`;

  const user = `Practice: ${b.name}${b.sanskrit ? ` (${b.sanskrit})` : ""}
Tradition: ${b.tradition}
Duration target: ${b.durationMin} minutes (~${targetSeconds}s total)
Essence: ${b.oneLine}
When to use: ${b.whenToUse}

Raw instructions to transform into a live spoken script:
${b.instructions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Return ONLY the JSON object.`;

  try {
    const resp = await fetch("https://ai.gateway.consciousos.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) {
      console.warn("AI gateway failed", resp.status, await resp.text().catch(() => ""));
      return null;
    }
    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    const json = extractJson(text);
    return normalizeSteps(json, b);
  } catch (e) {
    console.warn("AI gateway exception", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.slug || !Array.isArray(body?.instructions)) {
      return new Response(JSON.stringify({ error: "invalid body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const aiSteps = await generateWithAI(body);
    const steps = aiSteps ?? fallbackSteps(body);
    return new Response(
      JSON.stringify({ steps, source: aiSteps ? "ai" : "fallback" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});