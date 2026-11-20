// daily-briefing: structured consciousness briefing for the day
// Queries: profile + graph + recent sessions + memory + synthesis
// Returns: structured JSON (no LLM)
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type TimeSlot = "morning" | "midday" | "evening" | "night";

interface BriefingRequest {
  time_slot?: TimeSlot;
  energy?: "low" | "medium" | "high";
  free_intent?: string;
}

const CHAKRA_COLORS: Record<string, string> = {
  muladhara: "#DC2626",
  svadhisthana: "#EA580C",
  manipura: "#EAB308",
  anahata: "#22C55E",
  vishuddha: "#3B82F6",
  ajna: "#6366F1",
  sahasrara: "#A855F7",
};

const CHAKRA_LABELS: Record<string, string> = {
  muladhara: "Muladhara — Root",
  svadhisthana: "Svadhisthana — Sacral",
  manipura: "Manipura — Solar Plexus",
  anahata: "Anahata — Heart",
  vishuddha: "Vishuddha — Throat",
  ajna: "Ajna — Third Eye",
  sahasrara: "Sahasrara — Crown",
};

const DIMENSION_LABELS: Record<string, string> = {
  thought: "Thought",
  emotion: "Emotion",
  body: "Body",
  awareness: "Spirit",
  action: "Action",
  connection: "Connection",
};

const SIGNAL_QUESTIONS: Record<string, string> = {
  head: "Is my mind racing ahead of what's happening?",
  gut: "Is there a clench or flutter in my solar plexus?",
  heart: "Am I bracing for an outcome rather than being with this moment?",
  witness: "Can I step back and watch this without becoming it?",
};

const LOOP_JOURNAL_PROMPTS: Record<string, string> = {
  "CTL052": "When did I catastrophize today? What actually happened vs. what I imagined?",
  "CTL054": "When did I plan instead of act? What was I avoiding by preparing?",
  "CTL055": "When did I gather information instead of moving? What was I really afraid of?",
  "CTL066": "When did I forecast the future instead of being here? What moved through my body?",
  "VAL001": "When did I seek approval today? What would I have done if no one was watching?",
  "VAL038": "When did I consume inspiration instead of acting? What small step did I skip?",
  "AVO001": "When did I leave the moment? What was I not willing to feel?",
  "SPB001": "When did I use spiritual ideas to skip a feeling? What was underneath?",
};

function pick<T>(arr: T[] | null | undefined, fallback: T): T {
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : fallback;
}

function pickN<T>(arr: T[] | null | undefined, n: number, fallback: T[]): T[] {
  return Array.isArray(arr) ? arr.slice(0, n) : fallback;
}

// ═══════════════════════════════════════════════════════════════════
// PROSE FLAVORING
// The graph gives us facts. The model gives them a voice. Only the prose
// is rewritten — chakra id, practice id, band numbers and the signal
// questions stay exactly as the graph computed them, so the UI can keep
// rendering deterministically.
// ═══════════════════════════════════════════════════════════════════

const FLAVOR_SYSTEM = `You are the voice of a consciousness mirror in a yoga/meditation app.

You will be given a STRUCTURED daily briefing for one user. Rewrite ONLY the prose so it
sounds like a seasoned teacher who knows this person — never like a report generator.

HARD RULES:
- Reply with a single JSON object and nothing else. No prose, no code fences.
- Output exactly these keys: headline, triggerLine, awarenessMarker, microPause, journalPrompt.
- Use ONLY the facts supplied. Never invent a new loop, chakra, practice, or event.
- Never name, label, or diagnose the user. Describe the pattern, not the person.
- No promises, no fear framing, no clinical or medical claims.
- Keep each field under 140 characters. Plain prose, no emoji, no markdown, no bullet points.
- If a fact you are given is missing, write a calm generic line for that field.`;

function buildFlavorPrompt(b: any, opts: { energy: string | null; timeSlot: string }): string {
  const facts: string[] = [];
  facts.push(`Energy body: ${b.chakra.label}`);
  if (b.watchLoop) {
    facts.push(`Loop on watch: ${b.watchLoop.name} (${b.watchLoop.id})`);
    facts.push(`Its usual trigger: ${b.watchLoop.trigger}`);
    facts.push(`Its body signal: ${b.watchLoop.awarenessMarker}`);
    facts.push(`Its dissolution path: ${b.watchLoop.microPause}`);
    if (b.watchLoop.occurrenceCount > 0) {
      facts.push(`It has surfaced ${b.watchLoop.occurrenceCount} time(s) in recent memory`);
    }
  }
  if (b.dimensionFocus) {
    facts.push(
      `Dimension frontier: ${b.dimensionFocus.dimension} at band ${b.dimensionFocus.currentBand}, next threshold ${b.dimensionFocus.nextThreshold}`,
    );
  }
  if (b.practice) facts.push(`Suggested practice: ${b.practice.name} (~${b.practice.duration} min)`);
  if (b.context?.synthesisNote) facts.push(`Yesterday: ${b.context.synthesisNote}`);
  if (b.context?.recentMemorySnippets?.length) {
    facts.push(
      `Recent entries from their own journal: ${b.context.recentMemorySnippets
        .map((m: any) => m.content)
        .join(" | ")}`,
    );
  }
  facts.push(`Journey day ${b.context?.journeyDay ?? 0}, phase ${b.context?.journeyPhase ?? ""}`);
  if (opts.energy) facts.push(`They report today's energy as "${opts.energy}"`);
  if (opts.timeSlot) facts.push(`Current gate: ${opts.timeSlot}`);
  if (b.context?.freeIntent) facts.push(`They said today is about: "${b.context.freeIntent}"`);

  return `STRUCTURED BRIEFING — rewrite the prose:\n\n${facts.join("\n")}`;
}

function extractJson(text: string): any | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(raw);
  } catch {
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first === -1 || last <= first) return null;
    try {
      return JSON.parse(raw.slice(first, last + 1));
    } catch {
      return null;
    }
  }
}

/** Collapse whitespace and hard-cap a model-authored line. */
function cleanLine(v: unknown, max = 140): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").replace(/^["'\s]+|["'\s]+$/g, "").trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

/** Never let a slow model hold the Home page hostage. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const t = setTimeout(() => {
      console.warn(`daily-briefing: ${label} timed out after ${ms}ms; using graph prose`);
      resolve(null);
    }, ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        throw e;
      },
    ).catch(() => {
      clearTimeout(t);
      resolve(null);
    });
  });
}

async function flavorBriefing<T extends Record<string, any>>(
  briefing: T,
  opts: { energy: string | null; timeSlot: string },
): Promise<T & { flavored: boolean }> {
  const passthrough = { ...briefing, flavored: false } as T & { flavored: boolean };
  // Only flavour when we have something real to say. A brand-new user with no
  // loops gets the calm archetypal line instead of a generated guess.
  if (briefing.confidence === "low" || !briefing.watchLoop) return passthrough;

  try {
    const { aiGatewayFetch } = await import("../_shared/ai-config.ts");
    const call = aiGatewayFetch({
      model: "tier:fast",
      temperature: 0.85,
      max_tokens: 400,
      messages: [
        { role: "system", content: FLAVOR_SYSTEM },
        { role: "user", content: buildFlavorPrompt(briefing, opts) },
      ],
    });
    const resp = await withTimeout(call, 6000, "flavoring");
    if (!resp || !resp.ok) return passthrough;
    const json = await resp.json();
    const content: string =
      json?.choices?.[0]?.message?.content ?? json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJson(content);
    if (!parsed) return passthrough;

    const next: any = { ...briefing };

    const headline = cleanLine(parsed.headline, 110);
    if (headline) next.headline = headline;

    if (next.watchLoop) {
      const triggerLine = cleanLine(parsed.triggerLine);
      if (triggerLine) next.watchLoop = { ...next.watchLoop, trigger: triggerLine };

      const marker = cleanLine(parsed.awarenessMarker);
      if (marker) next.watchLoop = { ...next.watchLoop, awarenessMarker: marker };

      const pause = cleanLine(parsed.microPause, 120);
      if (pause) next.watchLoop = { ...next.watchLoop, microPause: pause };
    }

    const journal = cleanLine(parsed.journalPrompt, 160);
    if (journal) next.journalPrompt = journal;

    next.flavored = true;
    return next;
  } catch (e) {
    console.warn("daily-briefing: flavoring skipped —", (e as Error)?.message);
    return passthrough;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anon = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user } } = await anon.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as BriefingRequest;
    const timeSlot: TimeSlot = body.time_slot ?? "morning";

    // ─── 1. Load profile ───
    const { data: profile, error: profileErr } = await admin
      .from("user_consciousness_profile")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileErr || !profile) {
      // No profile yet (brand-new user). Return a valid low-confidence briefing
      // so the card still renders something calm instead of erroring.
      return new Response(JSON.stringify({
        ok: true,
        briefing: {
          headline: "Today's field is still forming",
          chakra: { id: "manipura", label: "Manipura — Solar Plexus", color: "#EAB308" },
          watchLoop: null,
          dimensionFocus: {
            dimension: "awareness",
            currentBand: 0,
            nextThreshold: 0.5,
          },
          practice: null,
          journalPrompt: "What wants to move through me today?",
          signals: SIGNAL_QUESTIONS,
          confidence: "low",
          flavored: false,
          context: {
            journeyDay: 1,
            journeyPhase: "assessment",
            dominantPath: "path forming",
            synthesisNote: null,
            recentMemorySnippets: [],
            recentSessionSummaries: [],
            freeIntent: null,
          },
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const overallBand = Number(profile.overall_band ?? 0);
    const journeyDay = Number(profile.journey_day ?? 1);
    const journeyPhase = String(profile.journey_phase ?? "assessment");
    const activeLoops: string[] = Array.isArray(profile.active_loops)
      ? profile.active_loops.map(String)
      : [];
    const dimensionBands: Record<string, number> = (profile.dimension_bands as Record<string, number>) ?? {
      thought: 0, emotion: 0, body: 0, awareness: 0,
    };

    // ─── 2. Load graph nodes/edges ───
    const { data: allNodes } = await admin
      .from("graph_nodes")
      .select("id, type, label, data");

    const { data: allEdges } = await admin
      .from("graph_edges")
      .select("id, type, from, to, weight, metadata");

    const nodeMap = new Map<string, any>();
    for (const n of allNodes ?? []) nodeMap.set(n.id, n);
    const edges = allEdges ?? [];

    const node = (id: string) => nodeMap.get(id);

    // ─── 3. Find weakest primary dimension → chakra ───
    const primaryDims = ["thought", "emotion", "body", "awareness"];
    let weakestDim = primaryDims[0];
    let weakestBand = dimensionBands[weakestDim] ?? overallBand;
    for (const d of primaryDims) {
      const b = dimensionBands[d] ?? overallBand;
      if (b < weakestBand) {
        weakestBand = b;
        weakestDim = d;
      }
    }

    const dimNodeId = `dimension::consciousness::${weakestDim}`;
    const chakraEdge = edges.find(
      (e: any) => e.type === "CHAKRA_RELATED_TO_DIMENSION" && e.from === dimNodeId
    );
    const chakraNode = chakraEdge ? node(chakraEdge.to) : null;
    const chakraId = chakraNode?.id?.replace("chakra::", "") ?? "manipura";
    const chakraColor = CHAKRA_COLORS[chakraId] ?? "#EAB308";
    const chakraLabel = CHAKRA_LABELS[chakraId] ?? chakraId;

    // ─── 4. Find active loop common at current band ───
    const bandNodeId = `band::${Math.floor(overallBand)}`;
    const bandLoopEdges = edges.filter(
      (e: any) => e.type === "BAND_COMMON_LOOP" && e.from === bandNodeId
    );
    const overlap = bandLoopEdges.filter((e: any) =>
      activeLoops.includes(e.to.replace("loop::", ""))
    );
    const chosenLoopEdge = pick(overlap, bandLoopEdges[0] ?? null);

    let watchLoop: { id: string; name: string; trigger: string; awarenessMarker: string; microPause: string } | null = null;
    if (chosenLoopEdge) {
      const loopNode = node(chosenLoopEdge.to);
      if (loopNode) {
        const loopId = loopNode.id.replace("loop::", "");
        const loopData = loopNode.data ?? {};
        const dissolution = String(loopData.dissolution_path ?? "").trim();
        const microPause = dissolution.split("\n")[0]?.slice(0, 100) ?? "One slow breath. Name what's true right now.";

        const signalEdges = edges.filter((e: any) => e.type === "SIGNAL_INDICATES_LOOP" && e.to === loopNode.id);
        const signalNodes = signalEdges.map((s: any) => node(s.from)).filter(Boolean);
        const awarenessMarker = signalNodes.map((n: any) => n.label).slice(0, 2).join(" + ") || "the body runs the script before the mind notices";

        const practiceEdge = edges.find((e: any) => e.type === "LOOP_DISSOLVES_VIA" && e.from === loopNode.id);
        const practiceNode = practiceEdge ? node(practiceEdge.to) : null;
        const practiceName = practiceNode?.type === "practice" ? (practiceNode.data as any)?.microPractice ?? practiceNode.label : null;

        watchLoop = {
          id: loopId,
          name: loopNode.label,
          trigger: String(loopData.triggers?.[0] ?? "when patterns repeat unconsciously"),
          awarenessMarker,
          microPause: practiceName ?? microPause,
        };
      }
    }

    // ─── 5. Dimension frontier ───
    const rawNext = Math.ceil(weakestBand) + (weakestBand % 1 >= 0.5 ? 0 : 0.5);
    const nextThreshold = Math.ceil(rawNext * 2) / 2;

    // ─── 6. Practice suggestion for weakest dimension ───
    const dimNodeForPractice = `dimension::consciousness::${weakestDim}`;
    const practiceImpactEdge = edges.find(
      (e: any) => e.type === "PRACTICE_IMPACTS_DIMENSION" && e.to === dimNodeForPractice
    );
    const practiceNode = practiceImpactEdge ? node(practiceImpactEdge.from) : null;
    const practice = practiceNode?.type === "practice"
      ? {
          id: practiceNode.id.replace("practice::", ""),
          name: practiceNode.label,
          duration: Number((practiceNode.data as any)?.durationMin ?? 3),
        }
      : null;

    // ─── 7. Loop occurrence count in last 5 sessions ───
    let loopOccurrences: Record<string, number> = {};
    if (watchLoop?.id) {
      const { data: recentVectors } = await admin
        .from("user_memory_vectors")
        .select("loop_ids, created_at")
        .eq("user_id", user.id)
        .contains("loop_ids", [watchLoop.id])
        .order("created_at", { ascending: false })
        .limit(20);

      for (const row of recentVectors ?? []) {
        const ids = Array.isArray(row.loop_ids) ? row.loop_ids : [];
        for (const lid of ids) {
          loopOccurrences[lid] = (loopOccurrences[lid] ?? 0) + 1;
        }
      }
    }

    const watchLoopCount = watchLoop ? (loopOccurrences[watchLoop.id] ?? 0) : 0;

    // ─── 8. Yesterday's synthesis ───
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: synthesis } = await admin
      .from("daily_memory_synthesis")
      .select("summary, key_themes, loops_touched, mood_signal")
      .eq("user_id", user.id)
      .eq("synthesis_date", yesterdayStr)
      .single();

    // ─── 9. Recent guru_memory for emotional terrain ───
    const { data: recentMemories } = await admin
      .from("guru_memory")
      .select("content, category, tags, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    // ─── 10. Last 3 sessions for context ───
    const { data: recentSessions } = await admin
      .from("sessions")
      .select("id, session_date, time_slot, type, status, summary")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .limit(3);

    // ─── 11. Confidence ───
    const hasActiveLoops = activeLoops.length > 0;
    const hasDimBands = Object.keys(dimensionBands).length > 0;
    const isNewUser = journeyDay < 7;
    const confidence: "high" | "medium" | "low" = hasActiveLoops && hasDimBands && !isNewUser
      ? "high"
      : hasActiveLoops || hasDimBands
        ? "medium"
        : "low";

    // ─── 12. Build headline ───
    let headline = `Today's field: ${chakraLabel}`;
    if (watchLoop && watchLoopCount > 0) {
      headline += ` · ${watchLoop.name} (${watchLoopCount}x recently)`;
    }

    // ─── 13. Build synthesis context note ───
    let synthesisNote: string | null = null;
    if (synthesis) {
      const themes = Array.isArray(synthesis.key_themes) ? synthesis.key_themes.slice(0, 2).join(", ") : null;
      synthesisNote = themes
        ? `Yesterday: ${themes}`
        : synthesis.summary?.slice(0, 100) ?? null;
    }

    // ─── 14. Recent memory context ───
    const recentMemorySnippets = pickN(recentMemories, 2, []).map((m: any) => ({
      content: String(m.content ?? "").slice(0, 120),
      category: String(m.category ?? ""),
      tags: Array.isArray(m.tags) ? m.tags.slice(0, 3) : [],
    }));

    // ─── 15. Recent session context ───
    const recentSessionSummaries = pickN(recentSessions, 2, []).map((s: any) => ({
      date: String(s.session_date ?? ""),
      slot: String(s.time_slot ?? ""),
      status: String(s.status ?? ""),
      summary: String(s.summary ?? "").slice(0, 100),
    }));

    const baseBriefing = {
      headline,
      chakra: { id: chakraId, label: chakraLabel, color: chakraColor },
      watchLoop: watchLoop
        ? { ...watchLoop, occurrenceCount: watchLoopCount }
        : null,
      dimensionFocus: {
        dimension: weakestDim,
        currentBand: weakestBand,
        nextThreshold,
      },
      practice: practice,
      journalPrompt: watchLoop?.id && LOOP_JOURNAL_PROMPTS[watchLoop.id]
        ? LOOP_JOURNAL_PROMPTS[watchLoop.id]
        : "When did I act today before I felt ready? What moved through me?",
      signals: SIGNAL_QUESTIONS,
      confidence,
      context: {
        journeyDay,
        journeyPhase,
        dominantPath: String(profile.dominant_path ?? "path forming"),
        synthesisNote,
        recentMemorySnippets,
        recentSessionSummaries,
        freeIntent: body.free_intent?.trim() ? String(body.free_intent).trim() : null,
      },
    };

    // ─── 16. Prose flavoring ────────────────────────────────────────────
    // The structured fields above are the source of truth. The model only
    // rewrites the *prose* so the card reads like a teacher wrote it instead
    // of a template. Any failure (no key, bad JSON, timeout) degrades to the
    // deterministic briefing untouched.
    const flavored = await flavorBriefing(baseBriefing, {
      energy: body.energy ?? null,
      timeSlot,
    });

    return new Response(JSON.stringify({ ok: true, briefing: flavored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("daily-briefing error", e);
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
