// AI-generated live session for a Showroom / Experience program day.
// Public (no auth). Takes the day's teaching (reading + practice + reflection)
// and returns a warm, voice-narratable multi-step script calibrated to the
// day's practice duration. Uses the ConsciousOS AI Gateway. Falls back to a
// deterministic expansion if the model call fails, so the client is always
// cinematic and voice-narratable.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ReqBody = {
  programSlug: string;
  programTitle: string;
  guru: string;
  day: number;
  totalDays: number;
  dayTitle: string;
  oneLine: string;
  reading: string;
  practice: {
    name: string;
    durationMin: number;
    instructions: string;
  };
  reflection: string;
  audience?: string | null;
};

type Step = {
  title: string;
  line: string;
  seconds: number;
  breath?: "in" | "hold" | "out" | "still";
};

function splitInstructionLines(instructions: string): string[] {
  return instructions
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    // strip leading numbering like "1.", "2)", "- "
    .map((l) => l.replace(/^(?:\d+[.)]|-|\*|•)\s*/, ""));
}

function fallbackSteps(b: ReqBody): Step[] {
  const total = Math.max(120, Math.round(b.practice.durationMin * 60));
  const lines = splitInstructionLines(b.practice.instructions);
  const arrive: Step = {
    title: "Arrive",
    line: `Welcome to day ${b.day} of ${b.programTitle}. Today with ${b.guru}: ${b.dayTitle}. Let the eyes soften. There is nowhere to go.`,
    seconds: 22,
    breath: "still",
  };
  const orient: Step = {
    title: "Today's teaching",
    line: b.oneLine,
    seconds: 18,
    breath: "still",
  };
  const close: Step = {
    title: "Close",
    line: `Sit with this question: ${b.reflection} When you are ready, open the eyes.`,
    seconds: 24,
    breath: "out",
  };
  const remaining = Math.max(60, total - arrive.seconds - orient.seconds - close.seconds);
  const per = Math.max(18, Math.floor(remaining / Math.max(1, lines.length)));
  const core: Step[] = lines.map((line, i) => ({
    title: `Step ${i + 1}`,
    line,
    seconds: per,
    breath: "still" as const,
  }));
  return [arrive, orient, ...core, close];
}

function extractJson(text: string): unknown | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  try { return JSON.parse(raw); } catch { /* fallthrough */ }
  const first = raw.indexOf("[");
  const last = raw.lastIndexOf("]");
  if (first >= 0 && last > first) {
    try { return JSON.parse(raw.slice(first, last + 1)); } catch { /* fallthrough */ }
  }
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
    : Array.isArray((raw as any)?.steps)
      // deno-lint-ignore no-explicit-any
      ? (raw as any).steps
      : null;
  if (!arr || arr.length < 4) return null;
  const cleaned: Step[] = [];
  for (const s of arr) {
    const title = String(s?.title ?? "").slice(0, 80).trim();
    const line = String(s?.line ?? s?.text ?? "").trim();
    const seconds = Math.max(8, Math.min(180, Math.round(Number(s?.seconds ?? 25))));
    const breath = ["in", "hold", "out", "still"].includes(s?.breath) ? s.breath : "still";
    if (!title || !line) continue;
    cleaned.push({ title, line, seconds, breath });
  }
  if (cleaned.length < 4) return null;
  return cleaned;
}

async function generateWithAI(b: ReqBody): Promise<Step[] | null> {
  const key = Deno.env.get("CONSCIOUSOS_API_KEY");
  if (!key) return null;
  const targetSeconds = Math.round(b.practice.durationMin * 60);
  const sys = `You are ${b.guru}, teaching day ${b.day} of a ${b.totalDays}-day contemplative program titled "${b.programTitle}".
You are writing a live, voice-guided session that a real narrator will speak aloud to the practitioner right now.
Follow these rules exactly:

- Return ONLY valid JSON of the form: { "steps": [ { "title": string, "line": string, "seconds": integer, "breath": "in"|"hold"|"out"|"still" } ] }
- 7 to 12 steps total.
- Total of all "seconds" must sum to about ${targetSeconds} (± 15%).
- First step is "Arrive" (18–24s) — greet them into the session in your voice.
- Second step is "Today's teaching" (16–24s) — the one-line essence in your voice.
- Middle steps expand the day's reading into small, digestible spoken beats that lead into the practice — each 20–60s.
- Toward the end, walk them through the practice itself, step by step, as it unfolds in real time.
- Last step is "Close" (18–26s) — deliver the reflection question and close warmly.
- "line" is exactly what the narrator SAYS aloud. Second-person, present-tense, warm, unhurried, in your voice as ${b.guru}. No stage directions. No headings. No numbered lists inside a line. Under 55 words per line.
- "title" is a short cue for the visual (2–4 words).
- "breath" reflects the dominant breath phase during that step ("in", "hold", "out", or "still").
- Faithful to the tradition and the day's teaching. Do not invent doctrine.`;

  const audienceLine = b.audience ? `Audience: ${b.audience}\n` : "";
  const user = `Program: ${b.programTitle}
${audienceLine}Day ${b.day} of ${b.totalDays}: ${b.dayTitle}
Essence of the day: ${b.oneLine}
Practice duration target: ${b.practice.durationMin} minutes (~${targetSeconds}s total)

DAY READING (source material — transform into your spoken voice, do not read verbatim):
${b.reading}

PRACTICE (must be walked through step-by-step in the session):
Name: ${b.practice.name}
Instructions:
${b.practice.instructions}

CLOSING REFLECTION QUESTION (deliver in your voice in the final step):
${b.reflection}

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
    if (!body?.programSlug || !body?.practice?.instructions) {
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