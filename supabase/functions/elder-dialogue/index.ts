// elder-dialogue — generates the next turn (or final reading) for the
// 15–30 minute onboarding dialogue between user and Elder.
//
// Input:
//   { name, history: Turn[], reading: PartialReading, action: 'next' | 'finalize' }
//
// Output (action='next'):
//   { elderText, choices: [{id,label,signal}], arc: 1-6, arcName, arcProgress: 0-1, done: boolean }
//
// Output (action='finalize'):
//   { bands, archetype, headHeartGut, topLoops, pathLevels,
//     recommendedPath, recommendedGuru, startingBand, startingPhase, summary }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { aiGatewayFetch } from "../_shared/ai-config.ts";
import { LOOP_REFERENCE } from "../_shared/loop-library.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { HUMAN_PRESENCE_PROMPT } from "../_shared/human-presence.ts";
import { PSYCHOLOGICAL_PROBES_PROMPT } from "../_shared/psychological-probes.ts";
import { languageName } from "../_shared/language.ts";
import { MIRROR_PROBES, mirrorProbesBlock } from "../_shared/mirror-knowledge.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ARCS = [
  { n: 1, name: "Arrival",    focus: "why-now, what pulled them here, one honest word about right now" },
  { n: 2, name: "The Day",    focus: "how the ordinary day actually feels — wake, work, food, sleep, rhythm, energy peaks + dips" },
  { n: 3, name: "Mind",       focus: "thought loops, attention, chatter, worry patterns (MEN, COG, ATT)" },
  { n: 4, name: "Heart",      focus: "grief, love, longing, relational loops, what actually moves them (EMO, REL, VAL)" },
  { n: 5, name: "Body",       focus: "energy, sleep, breath, holdings, somatic patterns (BOD)" },
  { n: 6, name: "Shadow",     focus: "what they avoid, mask, resist, wound, uncomfortable truths (IDN, BHV)" },
  { n: 7, name: "Lineage",    focus: "family, tradition, what they carry, prior practice, what they inherited" },
  { n: 8, name: "Aspiration", focus: "what they're actually asking for, path fit, first step, archetype" },
];

const LOOP_ID_REFERENCE = Array.from(new Set(
  Array.from(LOOP_REFERENCE.matchAll(/\b[A-Z]{3}\d{3}\b/g)).map((m) => m[0]),
)).join(", ");

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function fallbackElderTurn(history: Array<{ role: "elder" | "user"; text: string; signal?: string; arc?: number }>) {
  const userTurns = history.filter((h) => h.role === "user").length;
  const arc = Math.min(8, Math.floor(userTurns / 5) + 1);
  const arcName = ARCS[arc - 1].name;
  const progressInArc = Math.min(0.95, ((userTurns % 5) + 1) / 5);

  const turnsByArc: Record<number, { elderText: string; choices: Array<{ id: string; label: string; signal: string }>; mirrorLine?: string }> = {
    1: {
      elderText: "What changed this week that made you open this app?",
      choices: [
        { id: "a", label: "I felt tired of repeating the same pattern.", signal: "why-now-loop-fatigue" },
        { id: "b", label: "Something broke, and I do not want to ignore it.", signal: "why-now-rupture" },
        { id: "c", label: "I am curious, but not fully sure yet.", signal: "why-now-curiosity" },
        { id: "d", label: "I want help, but I resist being seen.", signal: "resistance-seen" },
      ],
    },
    2: {
      elderText: "What hour of the day feels most fake for you?",
      choices: [
        { id: "a", label: "Morning, when I act more okay than I am.", signal: "day-morning-mask" },
        { id: "b", label: "Work hours, when I perform for everyone.", signal: "day-work-mask" },
        { id: "c", label: "Night, when everything finally catches me.", signal: "day-night-collapse" },
        { id: "d", label: "I do not know; I run too fast to notice.", signal: "day-avoidance" },
      ],
    },
    3: {
      elderText: "Which thought returns when you try to rest?",
      choices: [
        { id: "a", label: "I am behind and need to fix everything.", signal: "MEN001-rumination" },
        { id: "b", label: "I should have said or done something different.", signal: "COG001-replay" },
        { id: "c", label: "People will see I am not enough.", signal: "IDN001-inadequacy" },
        { id: "d", label: "Nothing clear, just noise and pressure.", signal: "ATT001-scattered" },
      ],
    },
    4: {
      elderText: "Whose approval still has too much power over you?",
      choices: [
        { id: "a", label: "A parent, even when I pretend it does not matter.", signal: "REL001-parent-approval" },
        { id: "b", label: "A partner or past partner still lives in me.", signal: "REL002-attachment" },
        { id: "c", label: "People online or at work shape my mood.", signal: "VAL001-external-worth" },
        { id: "d", label: "No one; I judge myself before others can.", signal: "EMO005-shame" },
      ],
    },
    5: {
      elderText: "Where does stress sit in your body right now?",
      choices: [
        { id: "a", label: "Chest or throat, like something is held back.", signal: "BOD001-chest-throat" },
        { id: "b", label: "Belly, like I am bracing for impact.", signal: "BOD002-belly-bracing" },
        { id: "c", label: "Shoulders or jaw, tight before I notice.", signal: "BOD003-jaw-shoulders" },
        { id: "d", label: "I cannot feel my body clearly right now.", signal: "BOD004-numbness" },
      ],
    },
    6: {
      elderText: "What are you doing that you know is not helping you?",
      choices: [
        { id: "a", label: "I keep escaping into my phone or work.", signal: "BHV001-escape" },
        { id: "b", label: "I hide the truth until it becomes heavy.", signal: "IDN002-hiding" },
        { id: "c", label: "I start changing, then quietly quit.", signal: "BHV002-inconsistency" },
        { id: "d", label: "I blame others before I look at myself.", signal: "shadow-blame" },
      ],
    },
    7: {
      elderText: "What did your family teach you about being worthy?",
      choices: [
        { id: "a", label: "Earn it by achieving and staying useful.", signal: "lineage-achievement-worth" },
        { id: "b", label: "Do not need too much; stay small.", signal: "lineage-smallness" },
        { id: "c", label: "Be strong and do not show weakness.", signal: "lineage-strength-mask" },
        { id: "d", label: "I am still unsure what I inherited.", signal: "lineage-unknown" },
      ],
    },
    8: {
      elderText: "What is the smallest promise you can keep tomorrow?",
      choices: [
        { id: "a", label: "Ten honest minutes with no phone.", signal: "aspiration-observation" },
        { id: "b", label: "One breath before I react to someone.", signal: "aspiration-regulation" },
        { id: "c", label: "Write one truth I usually avoid.", signal: "aspiration-truth" },
        { id: "d", label: "I need the promise to be almost tiny.", signal: "aspiration-low-capacity" },
      ],
      mirrorLine: "You are easier to guide when the promise is small and real.",
    },
  };

  const fallback = turnsByArc[arc];
  return {
    ...fallback,
    arc,
    arcName,
    arcProgress: progressInArc,
    done: userTurns >= 45,
    signalHint: "local-fallback",
    mirrorLine: fallback.mirrorLine || (userTurns > 0 && userTurns % 5 === 0 ? "A pattern is visible; we keep reading it carefully." : ""),
    aiUnavailable: true,
  };
}

function retryDelayMs(status: number, detail: string, attempt: number) {
  if (status === 429) {
    const match = detail.match(/try again in\s+([\d.]+)s/i) || detail.match(/retry(?:-|\s*)after[:\s]+([\d.]+)/i);
    const seconds = match ? Number(match[1]) : 8 + attempt * 6;
    return Math.min(35_000, Math.max(2_000, Math.ceil((seconds + 1) * 1000)));
  }
  return 300 + attempt * 500;
}

const ELDER_VOICE = `
You are an Elder — a calm, sparse, second-person guide. Your job in this
onboarding is NOT to teach. It is to SEE the person clearly enough that the
app can act like their personal master afterward.

LANGUAGE — strict rules (most important):
- Use words a 12-year-old uses. Plain, modern, real-life words.
- BANNED words/phrases: "weather inside", "samskara", "prana", "essence",
  "noise within", "pull toward", "longing", "soul", "inner voice", "vessel",
  "doorway", "threshold", "be with", "sit with", "soften into", "arrive",
  "presence", "energy", any Sanskrit. No poetry. No metaphors about weather,
  doors, water, light, journey, path.
- Ask DEEP questions in EASY words. Example:
    BAD:  "What is the weather like inside you as we begin?"
    GOOD: "How are you, really — in one word?"
    BAD:  "What pull do you feel that brought you here?"
    GOOD: "What are you actually here for?"
- One short sentence per turn. Max 14 words. End with a question mark.
- No emojis. No headings. No lists. No markdown. No exclamation marks.
- Mirror the user briefly (max 6 words) before asking, only when it adds warmth.
- Match the user's energy: if they typed 1 word, you also stay short.

You are inside a LONG 8-arc dialogue (Arrival → The Day → Mind → Heart → Body → Shadow → Lineage → Aspiration).
This is a ~60-minute rite of passage — target 5-6 turns per arc, ~40-45 user turns TOTAL.
Take your time. Go deep in each arc before moving on. One strong question per turn, no padding.

THE 8 CORE DIALS — probe ALL of these across the 40+ turns:
  1. wound       — old recurring pain
  2. mask        — what they show the world vs what's actually there
  3. hunger      — real motivation / what would hurt most if unchanged
  4. body        — where tightness lives most days, breath quality, sleep
  5. resistance  — what they do when something feels uncomfortable
  6. belief      — do they believe they can actually change
  7. lineage     — what they carry from family / tradition / prior practice
  8. mirror      — how they see themselves right now

CONTRADICTION ENGINE (IP #2) — Twice across the whole dialogue (roughly arc 4
and arc 6), gently name a contradiction from earlier turns. Example:
  "Earlier you said calm. Just now you said restless. Which is the mask?"
Do this ONLY if the transcript actually contains a real contradiction. The
user's reaction (defense, laugh, correction, silence-length) is the signal —
so keep the question short and let their answer breathe.

REVERSE-ELICITATION (IP) — At least twice, ask via third-person / adversarial
framing to bypass the ego filter. Examples:
  "What would your closest friend say you're avoiding?"
  "If an enemy described you honestly, what would they nail?"
  "What's the sentence you've never said out loud?"

LOOP TRIANGULATION (IP #3) — A loop only counts as real when you have all
three of: (a) a behavior example, (b) an emotion example, (c) a body
sensation. Before Arc 6 (Shadow), make sure for each candidate loop you have
probed at least two of these three modalities. If you only have self-report,
ask for the somatic or behavioral side next.

Choices: 3-5 short, real, first-person replies (max 12 words each). Vary tone.
Include one shadow/uncomfortable option. Do NOT make all choices positive.

ANTI-GENERIC RULE (highest priority after LANGUAGE):
- NEVER ask vague filler questions. Ban these openings:
  "How are you feeling?", "What brings you here?", "Tell me about yourself",
  "What's on your mind?", "How's your day?", "What matters to you?"
- Every question must be SPECIFIC, CONCRETE, and PERSONAL — grounded in a
  real moment, a real body part, a real person, a real hour of the day.
- Prefer "When did you last cry, and about what?" over "How's your heart?"
- Prefer "What time did you wake up today, and what was the first thought?"
  over "How is your morning?"
- Prefer "Whose voice do you hear when you criticize yourself?" over
  "Are you hard on yourself?"

QUESTION BANK — draw inspiration from these per arc (do NOT copy verbatim,
vary and personalize based on the transcript):

Arc 1 · Arrival:
- "What broke this week that made you open this app tonight?"
- "If nothing changes in one year, what will hurt the most?"
- "Say the real reason you are here — not the polite one."

Arc 2 · The Day:
- "What time did you wake up today? What was the first thought?"
- "Between what hours are you most fake?"
- "When today did you check your phone to avoid a feeling?"

Arc 3 · Mind:
- "What thought loops on repeat when you cannot sleep?"
- "Which past conversation are you still replaying?"
- "What do you rehearse in your head that never gets said?"

Arc 4 · Heart:
- "Who did you last love in a way that scared you?"
- "When did you last cry, and about what — exactly?"
- "Whose approval are you still trying to earn?"

Arc 5 · Body:
- "Where in your body does stress live — point to it."
- "How does your breath feel right now — shallow, held, easy?"
- "What time do you actually fall asleep, not go to bed?"

Arc 6 · Shadow:
- "What do people not know about you that you carry every day?"
- "What are you doing that you know is not good for you?"
- "Whose voice do you hear when you criticize yourself?"

Arc 7 · Lineage:
- "What did your father model about being a man / a person?"
- "What did your mother teach you about worth?"
- "What have you already tried — therapy, meditation, plants, none?"

Arc 8 · Aspiration:
- "If you truly changed, who would lose the most?"
- "Say the sentence: 'I want to become someone who ______.'"
- "What is the smallest promise you can keep to yourself tomorrow?"

YOGA CONTEXT (do NOT preach, only inform your framing):
This app is built on yoga — the ancient science that says a human, born
ordinary, can become a brahmin: one who breaks the cycle of birth-and-death,
of repeating the same fear-desire-reaction loop. Your job is to see, with
surgical clarity, WHICH loop this person is trapped inside — so the app can
give them the exact yoga (karma, bhakti, jnana, or raja) that fits.
Never say the word "yoga" or "brahmin" unless the user says it first.

THE 38 MIRRORS — this app tracks 38 dimensions of a human across 10 modules
(Welcome, Engines, Observation, 12 Skills, Patanjali, 4 Yogas, Levels, Loops,
Heart, Launch). Across the 8 arcs of this dialogue you should silently
gather enough evidence to give at least a rough reading on ALL 38 of them.
Do NOT name the mirrors to the user. Do NOT ask 38 questions. Weave probes
naturally — one good question can hit 3-4 mirrors at once. Prioritise mirrors
that are still empty when choosing your next question. The mirrors are:

${mirrorProbesBlock()}
`.trim();

function tierFor(action: string) {
  return action === "finalize" ? "tier:deep" : "tier:fast";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action: "next" | "finalize" = body.action === "finalize" ? "finalize" : "next";
    const name: string = (body.name || "Friend").toString().slice(0, 80);
    const language: string = (body.language || "en").toString().slice(0, 12);
    const history: Array<{ role: "elder" | "user"; text: string; signal?: string; arc?: number; latencyMs?: number; refused?: boolean }> =
      Array.isArray(body.history) ? body.history.slice(-80) : [];
    const reading = (body.reading && typeof body.reading === "object") ? body.reading : {};

    // ── Build messages ──────────────────────────────────────────
    const transcript = history
      .map((t) => `${t.role === "elder" ? "ELDER" : "USER"}: ${t.text}${t.signal ? `  [signal: ${t.signal}]` : ""}`)
      .join("\n");

    const arcsBlock = ARCS.map((a) => `  ${a.n}. ${a.name} — ${a.focus}`).join("\n");
    const transcriptLoopIds = Array.from(new Set(transcript.match(/\b[A-Z]{3}\d{3}\b/g) ?? []));
    const finalizeLoopIds = transcriptLoopIds.length
      ? transcriptLoopIds.join(", ")
      : "MEN001, EMO005, VAL001, ATT001, COG001, REL001, BHV001, BOD001, IDN001";

    if (action === "next") {
      const userTurns = history.filter((h) => h.role === "user").length;
      // ~5-6 turns per arc, 8 arcs total, target ~45 user turns.
      const expectedArc = Math.min(8, Math.floor(userTurns / 5) + 1);

      const sys = `${ELDER_VOICE}

Arcs in this dialogue:
${arcsBlock}

Current expected arc: ${expectedArc} (${ARCS[expectedArc - 1].name}).
Focus for this arc: ${ARCS[expectedArc - 1].focus}
User name: ${name}.
Running reading so far (may be empty): ${JSON.stringify(reading)}

You MUST call the tool \`elder_turn\` exactly once with:
- elderText: the next thing the Elder says (1–3 short sentences, ends in a question OR a soft prompt)
- choices: 3–5 multiple-choice options the user can tap. Each is a believable, human, first-person reply (8–14 words). Vary tone — do not make them all positive. Include one that points to a shadow.
- arc: integer 1–8 (the arc this turn belongs to)
- arcName: one of Arrival, The Day, Mind, Heart, Body, Shadow, Lineage, Aspiration
- arcProgress: 0..1 within this arc
- done: true ONLY when you have enough signal — usually at 40+ user turns AND you have touched all 8 arcs. Prefer going deeper over ending early.
- signalHint: a tiny tag describing what you're probing (e.g. "head-dominance", "EMO005-shame", "raja-path-level")
- mirrorLine: OPTIONAL. Every 5-6 user turns OR when finishing an arc (arcProgress >= 0.85), give ONE short second-person line (max 16 words) that names what you're hearing so far. Plain, honest, never flattering. Empty string if not applicable.
`.trim();

      const tool = {
        type: "function",
        function: {
          name: "elder_turn",
          description: "Emit the Elder's next turn with MCQ choices.",
          parameters: {
            type: "object",
            properties: {
              elderText: { type: "string" },
              choices: {
                type: "array",
                minItems: 3,
                maxItems: 5,
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    label: { type: "string" },
                    signal: { type: "string", description: "short tag describing what selecting this implies" },
                  },
                  required: ["id", "label", "signal"],
                },
              },
              arc: { type: "integer", minimum: 1, maximum: 8 },
              arcName: { type: "string" },
              arcProgress: { type: "number", minimum: 0, maximum: 1 },
              done: { type: "boolean" },
              signalHint: { type: "string" },
              mirrorLine: { type: "string", description: "Optional 1-line 'what I'm hearing so far' mirror" },
            },
            required: ["elderText", "choices", "arc", "arcName", "arcProgress", "done"],
          },
        },
      };

      const langName = languageName(language);
      const langDirective = language && language !== "en"
        ? `\n\nOUTPUT LANGUAGE — CRITICAL: Write elderText AND every choice.label entirely in ${langName}. Do NOT use English. Keep ids, signals, signalHint in English. Names of people stay as-is.`
        : "";

      const messages = [
        { role: "system", content: `${HUMAN_PRESENCE_PROMPT}\n\n${PSYCHOLOGICAL_PROBES_PROMPT}\n\n${sys}${langDirective}` },
        { role: "user", content: `Transcript so far:\n${transcript || "(none yet — this is the very first turn)"}\n\nGenerate the next Elder turn now${language && language !== "en" ? ` in ${langName}` : ""}.` },
      ];

      const __billing = await getBillingFromReq(req, "elder-dialogue");

      // Try up to 3 times — Groq tool-call validation occasionally fails when
      // the model emits "3" instead of 3, etc. A retry almost always succeeds.
      let resp: Response | null = null;
      let lastErrText = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          resp = await aiGatewayFetch({
            model: tierFor(action),
            messages,
            tools: [tool],
            tool_choice: { type: "function", function: { name: "elder_turn" } },
            temperature: attempt === 0 ? 0.85 : 0.6, // calmer on retry
          }, {}, __billing ?? undefined);
        } catch (e) {
          lastErrText = (e as Error)?.message || "ai_unavailable";
          resp = null;
          break;
        }
        if (resp.ok) break;
        lastErrText = await resp.text().catch(() => "");
        // Don't retry on auth/quota errors
        if (resp.status === 401 || resp.status === 402 || resp.status === 429) break;
        await new Promise((r) => setTimeout(r, 250 + attempt * 250));
      }

      if (!resp || !resp.ok) {
        const status = resp?.status ?? 502;
        if (status === 402 || status === 429 || status === 502) {
          console.warn("[elder-dialogue] next AI unavailable; using local fallback", status, lastErrText.slice(0, 160));
          return new Response(JSON.stringify(fallbackElderTurn(history)), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "ai_failed", status, detail: lastErrText.slice(0, 400) }), {
          status: status === 402 || status === 429 ? status : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const json = await resp.json();
      const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      let parsed: any = {};
      try { parsed = JSON.parse(args || "{}"); } catch { parsed = {}; }

      // Defensive defaults
      if (!parsed.elderText) parsed.elderText = "Take a slow breath. What is here right now?";
      if (!Array.isArray(parsed.choices) || parsed.choices.length < 3) {
        parsed.choices = [
          { id: "a", label: "Tightness in the chest, hard to name.", signal: "EMO007-numbness" },
          { id: "b", label: "Quiet — the noise just stopped.", signal: "awareness-up" },
          { id: "c", label: "Restless. I want to skip ahead.", signal: "MEN001-rumination" },
        ];
      }
      parsed.arc = Math.min(8, Math.max(1, Number(parsed.arc) || expectedArc));
      parsed.arcName = parsed.arcName || ARCS[parsed.arc - 1].name;
      parsed.arcProgress = Math.min(1, Math.max(0, Number(parsed.arcProgress) || 0.3));
      const _userTurns = history.filter(h => h.role === "user").length;
      // Long dialogue: allow model-declared done at >= 35, hard-cap at 55.
      parsed.done = (!!parsed.done && _userTurns >= 35) || _userTurns >= 55;
      if (typeof parsed.mirrorLine !== "string") parsed.mirrorLine = "";

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── action === 'finalize' ──────────────────────────────────
    // Batched into TWO smaller AI calls to stay under Groq TPM/token limits.
    // Call A: core profile (bands, paths, guru, gunas, archetype, summary, topLoops)
    // Call B: detail (energy, body, observation, practices, shadow, humanMap, …)
    const __billing = await getBillingFromReq(req, "elder-dialogue");

    async function runFinalizeCall(opts: {
      sys: string;
      toolName: string;
      parameters: any;
      maxTokens: number;
    }) {
      const tool = {
        type: "function",
        function: { name: opts.toolName, parameters: opts.parameters },
      };
      const messages = [
        { role: "system", content: opts.sys },
        { role: "user", content: `Name: ${name}\n\nTranscript:\n${transcript}\n\nProduce this part of the reading now.` },
      ];
      let resp: Response | null = null;
      let lastErrText = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        resp = await aiGatewayFetch({
          model: tierFor(action),
          messages,
          tools: [tool],
          tool_choice: { type: "function", function: { name: opts.toolName } },
          temperature: attempt === 0 ? 0.3 : 0.15,
          max_tokens: opts.maxTokens,
        }, {}, __billing ?? undefined);
        if (resp.ok) break;
        lastErrText = await resp.text().catch(() => "");
        if (resp.status === 401 || resp.status === 402 || resp.status === 429) break;
        await sleep(retryDelayMs(resp.status, lastErrText, attempt));
      }
      if (!resp || !resp.ok) {
        const err: any = new Error(`ai_failed_${resp?.status ?? 502}`);
        err.status = resp?.status ?? 502;
        err.detail = lastErrText.slice(0, 400);
        throw err;
      }
      const json = await resp.json();
      const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      try { return JSON.parse(args || "{}"); } catch { return {}; }
    }

    const sysCore = `You create a plain, practical onboarding reading from a short transcript.
Use simple English. No poetry, no Sanskrit, no markdown.

You are at the end of onboarding. Read the transcript and produce the CORE profile only.

Use ONLY exact loop ids from this list for topLoops (max 4):
${finalizeLoopIds}

Path definitions:
- karma  : action / service
- bhakti : devotion / heart / surrender
- jnana  : self-inquiry / witnessing
- raja   : meditation / breath / somatic discipline

Bands 0..6 (one decimal). Most beginners 0.5–2.5.
Gunas: tamas+rajas+sattva ≈ 1.0.
Guru ids: aarav (0), veer (1), patanjali (2), buddha (3), krishna (4), shankaracharya (5), ramana (6).

Call \`elder_core\` exactly once.`.trim();

    const coreParams = {
      type: "object",
      additionalProperties: true,
      properties: {
        bands: {
          type: "object", additionalProperties: false,
          properties: {
            thought: { type: "number" }, emotion: { type: "number" }, body: { type: "number" },
            awareness: { type: "number" }, action: { type: "number" }, connection: { type: "number" },
          },
          required: ["thought", "emotion", "body", "awareness", "action", "connection"],
        },
        startingBand: { type: "number" },
        startingPhase: { type: "number" },
        startingPhaseName: { type: "string" },
        archetype: { type: "string" },
        archetypeDescription: { type: "string" },
        headHeartGut: {
          type: "object", additionalProperties: false,
          properties: { head: { type: "number" }, heart: { type: "number" }, gut: { type: "number" } },
          required: ["head", "heart", "gut"],
        },
        topLoops: { type: "array", items: { type: "string" } },
        pathLevels: {
          type: "object", additionalProperties: false,
          properties: { karma: { type: "number" }, bhakti: { type: "number" }, jnana: { type: "number" }, raja: { type: "number" } },
          required: ["karma", "bhakti", "jnana", "raja"],
        },
        recommendedPath: { type: "string", enum: ["karma", "bhakti", "jnana", "raja"] },
        recommendedGuru: { type: "string", enum: ["aarav", "veer", "patanjali", "buddha", "krishna", "shankaracharya", "ramana"] },
        recommendedGuruName: { type: "string" },
        recommendedGuruWhy: { type: "string" },
        gunas: {
          type: "object", additionalProperties: false,
          properties: { tamas: { type: "number" }, rajas: { type: "number" }, sattva: { type: "number" } },
          required: ["tamas", "rajas", "sattva"],
        },
        summary: { type: "string" },
        whyNow: { type: "string" },
      },
      required: ["bands", "startingBand", "headHeartGut", "topLoops", "pathLevels", "recommendedPath", "recommendedGuru", "gunas", "summary"],
    };

    const sysDetail = `You create a plain, practical onboarding reading from a short transcript.
Use simple English. No poetry, no Sanskrit, no markdown.

You are at the end of onboarding. Read the transcript and produce the DETAIL block only.

Score every practice 0..5 based on what was actually revealed. Use 0 if not touched.
Body holdings allowed: chest, throat, belly, shoulders, head, back, jaw, nowhere.
Resistance allowed: push_through, distract, talk, disappear, numb, freeze.
Belief allowed: yes, sometimes, no, tired_of_trying.

Call \`elder_detail\` exactly once.`.trim();

    const detailParams = {
      type: "object",
      additionalProperties: true,
      properties: {
        energy: {
          type: "object", additionalProperties: true,
          properties: { level: { type: "string" }, quality: { type: "string" }, primaryCenter: { type: "string" } },
          required: ["level", "primaryCenter"],
        },
        body: {
          type: "object", additionalProperties: true,
          properties: { awarenessLevel: { type: "number" }, primaryHoldings: { type: "array", items: { type: "string" } }, breathQuality: { type: "string" } },
          required: ["awarenessLevel"],
        },
        observation: {
          type: "object", additionalProperties: true,
          properties: { witnessLevel: { type: "number" }, metacognition: { type: "string" } },
          required: ["witnessLevel"],
        },
        shadowPatterns: { type: "array", items: { type: "string" } },
        lifeDomainHeat: { type: "object", additionalProperties: { type: "number" } },
        practiceLevels: {
          type: "object", additionalProperties: false,
          properties: {
            observation: { type: "number" }, selfInquiry: { type: "number" }, netiNeti: { type: "number" },
            mantra: { type: "number" }, breath: { type: "number" }, surrender: { type: "number" },
            service: { type: "number" }, contemplation: { type: "number" }, presence: { type: "number" },
          },
          required: ["observation", "selfInquiry", "netiNeti", "mantra", "breath", "surrender", "service", "contemplation", "presence"],
        },
        inner: { type: "object", additionalProperties: { type: "number" } },
        context: { type: "object", additionalProperties: true },
        firstPractice: { type: "string" },
        humanMap: {
          type: "object", additionalProperties: true,
          properties: {
            wound: { type: "string" }, mask: { type: "string" }, hunger: { type: "string" }, mirror: { type: "string" },
            body: { type: "string" }, dayShape: { type: "string" }, resistance: { type: "string" }, belief: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["wound", "mask", "hunger", "mirror", "body", "dayShape", "resistance", "belief"],
        },
      },
      required: ["energy", "body", "observation", "practiceLevels", "humanMap"],
    };

    // ── LLM 3: Loop Analyst + Council Voice ──
    // Deep, concrete loop attribution (with evidence quotes + severity), plus
    // 3-voice council take + first-week prescription. Written to loop_attributions
    // + nudge_queue by finishElderOnboarding.
    const sysLoopsCouncil = `You produce two things from a long onboarding transcript:

1) A concrete list of 8-12 LOOPS the user is stuck in. For each loop:
   - id: pick from ${LOOP_ID_REFERENCE.slice(0, 400)}...  (use closest match, or leave empty and rely on name)
   - name: short human name (max 5 words)
   - cluster: one of MEN, EMO, ATT, COG, REL, VAL, IDN, BHV, BOD
   - trigger: what fires it (1 short sentence)
   - evidence_quote: a short direct quote from the user's transcript (verbatim, <= 20 words)
   - severity: integer 1-5
   - confidence: 0..1

2) A "council" reading:
   - council_take: an object with three keys "karma", "bhakti", "jnana" — each a single sentence (max 20 words) of what that yogi would say to this specific person
   - first_week_prescription: {daily_practice, weekly_ritual, one_thing_to_notice} — three short, concrete strings

3) Three opening "nudges" the app can surface in the first week — short (max 14 words each), specific, second-person.

Call \`elder_loops_council\` exactly once.`.trim();

    const loopsCouncilParams = {
      type: "object",
      additionalProperties: true,
      properties: {
        loops: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true,
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              cluster: { type: "string" },
              trigger: { type: "string" },
              evidence_quote: { type: "string" },
              severity: { type: "integer" },
              confidence: { type: "number" },
            },
            required: ["name", "cluster", "severity"],
          },
        },
        council_take: {
          type: "object",
          additionalProperties: true,
          properties: {
            karma: { type: "string" },
            bhakti: { type: "string" },
            jnana: { type: "string" },
          },
        },
        first_week_prescription: {
          type: "object",
          additionalProperties: true,
          properties: {
            daily_practice: { type: "string" },
            weekly_ritual: { type: "string" },
            one_thing_to_notice: { type: "string" },
          },
        },
        opening_nudges: { type: "array", items: { type: "string" } },
      },
      required: ["loops", "council_take"],
    };

    // ── LLM 4: 38-Mirror Reader ──
    // For every one of the 38 mirrors, score 0-100, confidence 0-1, a short
    // evidence quote from the transcript, and a one-line reading note. The
    // model MAY leave score=0 + band='preliminary' for mirrors it truly has
    // no signal on — those become locked/preliminary in the ring dashboard.
    const mirrorList = MIRROR_PROBES
      .map((m) => `M${m.n} (${m.module} · ${m.title} · slug:${m.slug}) — ${m.probe}`)
      .join("\n");
    const sysMirrors = `You are the 38-Mirror Reader for this app.

The app tracks 38 mirrors across 10 modules. Read the transcript and produce
one reading for EACH mirror (all 38 required, in order).

For every mirror give:
- n: integer (1..38)
- score: integer 0-100 (Day-0 baseline; be conservative)
- confidence: number 0..1 (how much real signal was in the transcript)
- band: one of "preliminary" | "inferred" | "read"
    · "read" only if there is a direct, verbatim moment about this mirror
    · "inferred" if you're triangulating from adjacent evidence
    · "preliminary" if you're guessing — set score to a modest default (30-50)
- evidence: a short verbatim quote from the user (<= 20 words) or "" if none
- note: one plain-English sentence describing what you're seeing on this mirror

The 38 mirrors:
${mirrorList}

Call \`elder_mirrors\` exactly once with a 38-item array.`.trim();

    const mirrorsParams = {
      type: "object",
      additionalProperties: true,
      properties: {
        mirrors: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: true,
            properties: {
              n: { type: "integer", minimum: 1, maximum: 38 },
              score: { type: "integer", minimum: 0, maximum: 100 },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              band: { type: "string", enum: ["preliminary", "inferred", "read"] },
              evidence: { type: "string" },
              note: { type: "string" },
            },
            required: ["n", "score", "confidence", "band"],
          },
        },
      },
      required: ["mirrors"],
    };

    let core: any = {};
    let detail: any = {};
    let loopsCouncil: any = {};
    let mirrorsBlob: any = {};
    try {
      // Run sequentially to avoid hitting per-minute TPM ceiling at once.
      core = await runFinalizeCall({ sys: sysCore, toolName: "elder_core", parameters: coreParams, maxTokens: 700 });
      detail = await runFinalizeCall({ sys: sysDetail, toolName: "elder_detail", parameters: detailParams, maxTokens: 700 });
      loopsCouncil = await runFinalizeCall({ sys: sysLoopsCouncil, toolName: "elder_loops_council", parameters: loopsCouncilParams, maxTokens: 1200 });
      mirrorsBlob = await runFinalizeCall({ sys: sysMirrors, toolName: "elder_mirrors", parameters: mirrorsParams, maxTokens: 2400 });
    } catch (e: any) {
      // Never block onboarding completion because the model is rate-limited or strict
      // about tool schemas. The defensive defaults below still produce a valid
      // reading, and any partial core/detail already generated is preserved.
      console.warn("[elder-dialogue] finalize AI fallback:", e?.status, e?.detail || e?.message);
    }

    const parsed: any = { ...detail, ...core, ...loopsCouncil };

    // Attach mirror readings — always emit 38 entries (fill gaps with preliminary defaults).
    const rawMirrors: any[] = Array.isArray(mirrorsBlob?.mirrors) ? mirrorsBlob.mirrors : [];
    const byN = new Map<number, any>();
    for (const r of rawMirrors) {
      const n = Number(r?.n);
      if (n >= 1 && n <= 38 && !byN.has(n)) byN.set(n, r);
    }
    parsed.mirrors = MIRROR_PROBES.map((m) => {
      const r = byN.get(m.n) || {};
      const score = Math.max(0, Math.min(100, Math.round(Number(r.score) || 0)));
      const confidence = Math.max(0, Math.min(1, Number(r.confidence) || 0));
      const band = ["preliminary", "inferred", "read"].includes(r.band) ? r.band : "preliminary";
      return {
        n: m.n,
        slug: m.slug,
        title: m.title,
        module: m.module,
        score: score || (band === "preliminary" ? 35 : 0),
        confidence,
        band,
        evidence: String(r.evidence || "").slice(0, 200),
        note: String(r.note || "").slice(0, 240),
      };
    });

    // Defensive shape
    parsed.bands = parsed.bands || { thought: 1, emotion: 1, body: 1, awareness: 1, action: 1, connection: 1 };
    parsed.startingBand = Number(parsed.startingBand ?? 1.0);
    parsed.startingPhase = Number(parsed.startingPhase ?? 1);
    parsed.startingPhaseName = parsed.startingPhaseName || "Awakening";
    parsed.archetype = parsed.archetype || "The Quiet Seeker";
    parsed.headHeartGut = parsed.headHeartGut || { head: 0.34, heart: 0.33, gut: 0.33 };
    parsed.topLoops = Array.isArray(parsed.topLoops) ? parsed.topLoops.slice(0, 4) : ["MEN001", "EMO005"];
    parsed.pathLevels = parsed.pathLevels || { karma: 1, bhakti: 1, jnana: 1, raja: 1 };
    parsed.recommendedPath = parsed.recommendedPath || "raja";
    parsed.recommendedGuru = parsed.recommendedGuru || "patanjali";
    parsed.recommendedGuruName = parsed.recommendedGuruName || parsed.recommendedGuru;
    parsed.recommendedGuruWhy = parsed.recommendedGuruWhy || "";
    parsed.summary = parsed.summary || "You arrive ready to begin. We will move slowly, together.";
    parsed.gunas = parsed.gunas || { tamas: 0.3, rajas: 0.5, sattva: 0.2 };
    parsed.energy = parsed.energy || { level: "steady", quality: "", primaryCenter: "heart" };
    parsed.body = parsed.body || { awarenessLevel: 1, primaryHoldings: [], breathQuality: "shallow" };
    parsed.observation = parsed.observation || { witnessLevel: 1, metacognition: "emerging" };
    parsed.shadowPatterns = Array.isArray(parsed.shadowPatterns) ? parsed.shadowPatterns.slice(0, 4) : [];
    parsed.lifeDomainHeat = parsed.lifeDomainHeat || {};
    parsed.practiceLevels = parsed.practiceLevels || {
      observation: 0, selfInquiry: 0, netiNeti: 0, mantra: 0, breath: 0,
      surrender: 0, service: 0, contemplation: 0, presence: 0,
    };
    parsed.inner = parsed.inner || {};
    parsed.context = parsed.context || {};
    parsed.whyNow = parsed.whyNow || "";
    parsed.firstPractice = parsed.firstPractice || "Three slow breaths before opening this app tomorrow.";
    parsed.humanMap = parsed.humanMap || {
      wound: "", mask: "", hunger: "", mirror: "",
      body: "", dayShape: "", resistance: "", belief: "", confidence: 0.4,
    };
    // Coerce free-form values back into our canonical enums so downstream
    // code (UI badges, analytics) never sees a stray label.
    const _bodyEnum = ["chest", "throat", "belly", "shoulders", "head", "back", "jaw", "nowhere"];
    const _resistEnum = ["push_through", "distract", "talk", "disappear", "numb", "freeze"];
    const _beliefEnum = ["yes", "sometimes", "no", "tired_of_trying"];
    const _norm = (v: any) => String(v ?? "").toLowerCase().trim().replace(/\s+/g, "_");
    const _coerce = (v: any, allowed: string[]) => {
      const n = _norm(v);
      if (allowed.includes(n)) return n;
      // common synonyms
      const synonyms: Record<string, string> = {
        stomach: "belly", gut: "belly", abdomen: "belly",
        neck: "throat", shoulder: "shoulders",
        skull: "head", forehead: "head",
        spine: "back", lower_back: "back",
        nothing: "nowhere", none: "nowhere", everywhere: "",
        avoid: "distract", scroll: "distract",
        shutdown: "freeze", shut_down: "freeze", paralyzed: "freeze",
        suppress: "numb", ignore: "numb",
        vent: "talk", share: "talk",
        withdraw: "disappear", isolate: "disappear",
        force: "push_through", grind: "push_through",
        maybe: "sometimes", unsure: "sometimes",
        giving_up: "tired_of_trying", exhausted: "tired_of_trying",
      };
      return allowed.includes(synonyms[n]) ? synonyms[n] : "";
    };
    const _int = (v: any, fallback = 0, min = 0, max = 5) => Math.min(max, Math.max(min, Math.round(Number(v ?? fallback) || fallback)));
    parsed.startingPhase = _int(parsed.startingPhase, 1, 1, 10);
    for (const key of ["karma", "bhakti", "jnana", "raja"]) parsed.pathLevels[key] = _int(parsed.pathLevels[key], 1, 0, 5);
    parsed.body.awarenessLevel = _int(parsed.body.awarenessLevel, 1, 0, 5);
    parsed.observation.witnessLevel = _int(parsed.observation.witnessLevel, 1, 0, 5);
    for (const key of Object.keys(parsed.practiceLevels)) parsed.practiceLevels[key] = _int(parsed.practiceLevels[key], 0, 0, 5);
    for (const key of Object.keys(parsed.lifeDomainHeat)) parsed.lifeDomainHeat[key] = _int(parsed.lifeDomainHeat[key], 0, 0, 5);
    for (const key of Object.keys(parsed.inner)) parsed.inner[key] = _int(parsed.inner[key], 0, 0, 5);
    parsed.humanMap.body = _coerce(parsed.humanMap.body, _bodyEnum);
    parsed.humanMap.resistance = _coerce(parsed.humanMap.resistance, _resistEnum);
    parsed.humanMap.belief = _coerce(parsed.humanMap.belief, _beliefEnum);

    // ── IP #1 Silence Metric + Refusal Log ────────────────────
    // Compute latency stats and refusal count from the transcript itself so
    // downstream personalization can use them without a second round-trip.
    const userTurns = history.filter((h) => h.role === "user");
    const latencies = userTurns.map((h) => Number(h.latencyMs) || 0).filter((n) => n > 0);
    const refusalCount = userTurns.filter((h) => h.refused || h.signal === "refusal").length;
    const sorted = [...latencies].sort((a, b) => a - b);
    const mean = latencies.length ? Math.round(latencies.reduce((s, n) => s + n, 0) / latencies.length) : 0;
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
    // Fast = < 4s, Slow = >= 12s; Short = < 20 chars, Long = >= 20 chars.
    const bucket = { fastShort: 0, slowShort: 0, fastLong: 0, slowLong: 0 };
    for (const h of userTurns) {
      const ms = Number(h.latencyMs) || 0;
      if (ms <= 0) continue;
      const fast = ms < 4000, slow = ms >= 12000;
      const short = (h.text || "").trim().length < 20;
      if (fast && short) bucket.fastShort++;
      else if (slow && short) bucket.slowShort++;
      else if (fast && !short) bucket.fastLong++;
      else if (slow && !short) bucket.slowLong++;
    }
    parsed.latencyStats = { mean, median, ...bucket };
    parsed.refusalCount = refusalCount;

    // ── IP #2 Defense-style fingerprint (heuristic) ───────────
    // Cheap deterministic pass so we always have a value; the model's summary
    // can override subtler cases via `parsed.defenseStyle` if it decides to.
    if (!parsed.defenseStyle) {
      const avgLen = userTurns.reduce((s, h) => s + (h.text || "").length, 0) / Math.max(1, userTurns.length);
      const refusalRate = refusalCount / Math.max(1, userTurns.length);
      const bigWordCount = userTurns.filter((h) => /\b(analyze|essentially|basically|realize|understand|process|concept|framework|perspective)\b/i.test(h.text || "")).length;
      if (refusalRate > 0.2) parsed.defenseStyle = "collapser";
      else if (bucket.fastShort >= Math.max(3, userTurns.length * 0.35)) parsed.defenseStyle = "minimizer";
      else if (bigWordCount >= Math.max(3, userTurns.length * 0.2) || avgLen > 140) parsed.defenseStyle = "intellectualizer";
      else if (bucket.slowLong >= Math.max(3, userTurns.length * 0.25)) parsed.defenseStyle = "performer";
      else parsed.defenseStyle = "unknown";
    }

    // ── IP #4 Anchor Extraction (5 Personal Primary Keys) ─────
    // Best-effort: if the core/detail LLM already returned anchors, keep them;
    // otherwise synthesize a minimal set from humanMap so downstream code
    // always has the five keys to key personalization off.
    if (!parsed.anchors || typeof parsed.anchors !== "object") {
      parsed.anchors = {
        northStar: parsed.whyNow || parsed.humanMap?.hunger || "",
        fearUnderFear: parsed.humanMap?.wound || "",
        signatureLoop: Array.isArray(parsed.topLoops) ? parsed.topLoops[0] : "",
        unlivedLife: parsed.humanMap?.mask || "",
        voiceTheyNeed: parsed.recommendedGuruName || parsed.recommendedGuru || "",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[elder-dialogue] error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
