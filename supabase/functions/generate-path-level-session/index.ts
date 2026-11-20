// AI-generated live session for a Yogic Path level (Level 1-6 of any path).
// Public (no auth). Takes the level's teaching + practices + promise and
// returns a warm, voice-narratable multi-step script (~10-14 min compressed
// intro session — a taste of a 30-day level). Uses the ConsciousOS AI Gateway.
// Falls back to a deterministic expansion if the model call fails, so the
// client is always cinematic and voice-narratable.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ReqBody = {
  pathSlug: string;
  pathName: string;
  guru: string;
  guruRole?: string | null;
  level: number;
  totalLevels: number;
  levelTitle: string;
  promise: string;
  durationDays: number;
  practices: string[];
  teaching: string;
  sessionMinutes?: number;
};

type Step = {
  title: string;
  line: string;
  seconds: number;
  breath?: "in" | "hold" | "out" | "still";
};

function fallbackSteps(b: ReqBody): Step[] {
  const minutes = Math.max(6, Math.min(20, b.sessionMinutes ?? 10));
  const total = minutes * 60;
  const arrive: Step = {
    title: "Arrive",
    line: `Welcome. Today, with ${b.guru}, you touch level ${b.level} of ${b.pathName}: ${b.levelTitle}. Soften the eyes. There is nowhere to be but here.`,
    seconds: 24,
    breath: "still",
  };
  const orient: Step = {
    title: "The promise",
    line: `${b.promise} That is what these ${b.durationDays} days ripen. This sit is your first taste.`,
    seconds: 20,
    breath: "still",
  };
  const teach: Step = {
    title: "Teaching",
    line: b.teaching.split(/\n+/).map(l => l.trim()).filter(Boolean).slice(0, 2).join(" ").slice(0, 320),
    seconds: 40,
    breath: "still",
  };
  const practiceSteps: Step[] = b.practices.slice(0, 6).map((p, i) => ({
    title: `Practice ${i + 1}`,
    line: `${p}. Let this be simple. Do not perform it. Just meet it.`,
    seconds: 40,
    breath: i % 2 === 0 ? "in" : "out",
  }));
  const close: Step = {
    title: "Close",
    line: `Rest. This is level ${b.level} of ${b.pathName} in one breath. When you are ready, open the eyes.`,
    seconds: 24,
    breath: "out",
  };
  const used = arrive.seconds + orient.seconds + teach.seconds + close.seconds
    + practiceSteps.reduce((s, x) => s + x.seconds, 0);
  // pad practice steps if we have room
  if (practiceSteps.length && used < total) {
    const extra = Math.floor((total - used) / practiceSteps.length);
    practiceSteps.forEach(s => { s.seconds = Math.min(75, s.seconds + Math.max(0, extra)); });
  }
  return [arrive, orient, teach, ...practiceSteps, close];
}

function extractJson(text: string): unknown | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  try { return JSON.parse(raw); } catch { /* fallthrough */ }
  const fo = raw.indexOf("{");
  const lo = raw.lastIndexOf("}");
  if (fo >= 0 && lo > fo) {
    try { return JSON.parse(raw.slice(fo, lo + 1)); } catch { /* fallthrough */ }
  }
  return null;
}

function normalizeSteps(raw: unknown): Step[] | null {
  // deno-lint-ignore no-explicit-any
  const arr: any[] | null = Array.isArray(raw)
    ? raw
    // deno-lint-ignore no-explicit-any
    : Array.isArray((raw as any)?.steps) ? (raw as any).steps : null;
  if (!arr || arr.length < 5) return null;
  const cleaned: Step[] = [];
  for (const s of arr) {
    const title = String(s?.title ?? "").slice(0, 80).trim();
    const line = String(s?.line ?? s?.text ?? "").trim();
    const seconds = Math.max(10, Math.min(180, Math.round(Number(s?.seconds ?? 30))));
    const breath = ["in", "hold", "out", "still"].includes(s?.breath) ? s.breath : "still";
    if (!title || !line) continue;
    cleaned.push({ title, line, seconds, breath });
  }
  return cleaned.length >= 5 ? cleaned : null;
}

async function generateWithAI(b: ReqBody): Promise<Step[] | null> {
  const key = Deno.env.get("CONSCIOUSOS_API_KEY");
  if (!key) return null;
  const minutes = Math.max(6, Math.min(20, b.sessionMinutes ?? 10));
  const targetSeconds = minutes * 60;
  const sys = `You are ${b.guru}${b.guruRole ? ` — ${b.guruRole}` : ""}, guiding a first taste of level ${b.level} of ${b.totalLevels} of the ${b.pathName} path in the yogic tradition.
You are writing a live, voice-guided session that a real narrator will speak aloud to the practitioner right now. This is NOT the full 30-day level — it is a ~${minutes}-minute compressed sit that lets them feel what the level opens.
Follow these rules exactly:

- Return ONLY valid JSON of the form: { "steps": [ { "title": string, "line": string, "seconds": integer, "breath": "in"|"hold"|"out"|"still" } ] }
- 8 to 12 steps total.
- Total of all "seconds" must sum to about ${targetSeconds} (± 15%).
- First step is "Arrive" (20–26s) — greet them into the sit in your voice.
- Second step is "The promise" (18–24s) — say what this level ripens over its ${b.durationDays} days.
- Middle steps walk the practitioner through the level's actual practices as a live micro-experience, one at a time.
- Include one step that speaks the essence of the teaching in your voice (do not read the source verbatim).
- Last step is "Close" (20–26s) — return them gently and name what they just tasted.
- "line" is exactly what the narrator SAYS aloud. Second-person, present-tense, warm, unhurried, in your voice as ${b.guru}. No stage directions. No headings. Under 60 words per line.
- "title" is a short cue for the visual (2–4 words).
- "breath" reflects the dominant breath phase during that step ("in", "hold", "out", or "still").
- Faithful to the tradition and to this specific level. Do not invent doctrine.`;

  const user = `Path: ${b.pathName} (${b.pathSlug})
Level ${b.level} of ${b.totalLevels}: ${b.levelTitle}
Level promise: ${b.promise}
Level duration in full: ${b.durationDays} days
Compressed session target: ${minutes} minutes (~${targetSeconds}s total)

PRACTICES OF THIS LEVEL (must be walked through as a live micro-experience — one step per practice, in order):
${b.practices.map((p, i) => `${i + 1}. ${p}`).join("\n")}

LEVEL TEACHING (source material — transform into your spoken voice, do not read verbatim):
${b.teaching}

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
    return normalizeSteps(json);
  } catch (e) {
    console.warn("AI gateway exception", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.pathSlug || !body?.levelTitle || !Array.isArray(body?.practices)) {
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