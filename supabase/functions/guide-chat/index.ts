import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { buildElderVoice, buildMasterVoice, MASTER_DOSSIERS, VOICE_TAIL_REMINDER } from "../_shared/voice-lineage.ts";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";
import { createClient } from "../_shared/supabase-client.ts";
import { buildAdaptiveDecision } from "../_shared/adaptive-engine.ts";
import { buildCouncilBriefing } from "../_shared/guest-masters.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { HUMAN_PRESENCE_PROMPT } from "../_shared/human-presence.ts";
import { PSYCHOLOGICAL_PROBES_PROMPT } from "../_shared/psychological-probes.ts";
import { buildLongTermMemoryBlock, embedUtterance } from "../_shared/long-term-memory.ts";
import { buildKundliPromptBlock } from "../_shared/kundli-context.ts";
import { buildFrameworkDirective } from "../_shared/mode-frameworks.ts";
import { sanitizeForAI } from "../_shared/sanitize-input.ts";
import { withMiddleware, successResponse, failureResponse } from "../_shared/middleware.ts";
import { assessCrisis, crisisStreamResponse } from "../_shared/crisis.ts";
import {
  loadSessionPersonalization,
  personalizationDirectives,
} from "../_shared/sessionConfig.ts";

/**
 * The response builders below spread this object, but it was never declared in
 * this file, so every non-2xx branch and the success stream threw a
 * ReferenceError before reaching the client.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(withMiddleware(async (req, context) => {
  const { user, admin, supabase } = context;

  try {
    const reqBody = await req.json();
    const { messages, timeSlot, themeName, userName, aiContext, language, sessionId, programId, dayNumber, plannedPractice } = reqBody;

    // ─── Crisis gate (HIGHEST priority) — before any model call ───
    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m: any) => m?.role === "user")?.content ?? ""
      : "";
    const crisis = assessCrisis(lastUserMessage);
    if (crisis.isCrisis) {
      try {
        await admin.from("crisis_events").insert({
          user_id: user?.id ?? null,
          surface: "guide-chat",
          severity: crisis.severity,
          matched: crisis.matched,
          action: "short_circuit",
          session_id: sessionId ?? null,
        });
      } catch {
        /* telemetry must never block safety copy */
      }
      return crisisStreamResponse(corsHeaders);
    }
    let mode = reqBody.mode;
    let master = reqBody.master;
    let adapterPacing: string | null = null;
    let adapterReason: string | null = null;

    // ─── SESSION ADAPTER (Skeleton fixed, flesh adaptive) ───
    // Runs ONCE per session (on the first message) to (re-)decide
    // master / mode / micro-practice based on band, state, loops, fatigue.
    // Logs to session_adaptations for the feedback loop.
    const isFirstMsgForAdapter = !messages || messages.length === 0;
    if (isFirstMsgForAdapter) {
      try {
        const adaptResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/session-adapter`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: req.headers.get("Authorization")! },
          body: JSON.stringify({
            session_id: sessionId || null,
            program_id: programId || null,
            day_number: dayNumber || null,
            time_slot: timeSlot || null,
            planned: {
              master: master?.id || null,
              mode: mode || null,
              practice: plannedPractice || mode || null,
            },
          }),
        });
        if (adaptResp.ok) {
          const adapt = await adaptResp.json();
          if (adapt?.adapted) {
            if (adapt.master && adapt.master !== master?.id) {
              master = { id: adapt.master, name: adapt.master.charAt(0).toUpperCase() + adapt.master.slice(1) };
            }
            if (adapt.mode && adapt.mode !== mode) {
              mode = adapt.mode;
            }
          }
          adapterPacing = adapt?.pacing_hint || null;
          adapterReason = adapt?.swap_reason || null;
          console.log("session-adapter:", { adapted: adapt?.adapted, master: adapt?.master, mode: adapt?.mode, reason: adapt?.swap_reason });
        }
      } catch (e) {
        console.error("session-adapter call failed (non-blocking)", e);
      }
    }

    // ─── Fetch Engine V2 context ───
    let engineBand = 0;
    let engineState = "normal";
    let enginePlan: any = null;
    try {
      const engineResp = await fetch(`${supabaseUrl}/functions/v1/consciousness-engine`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader! },
        body: JSON.stringify({ timeSlot }),
      });
      if (engineResp.ok) {
        const engineData = await engineResp.json();
        const plan = engineData.plan;
        if (plan) {
          enginePreamble = plan.guidePreamble || "";
          engineBand = plan.band || 0;
          engineState = plan.state || "normal";
          enginePlan = plan;
        }
      }
    } catch (e) {
      console.error("Engine context fetch failed:", e);
    }

    // ─── MAINSPRING: pull canonical user state snapshot (cached 60s) ───
    // Non-blocking; gives us spiritual DNA, dimension scores, active program,
    // weak dimensions in one call without re-querying raw tables.
    let snapshotPreamble = "";    try {
      const snapResp = await fetch(`${supabaseUrl}/functions/v1/user-state-snapshot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          userId: user.id,
          runtime: { gate: timeSlot || undefined },
        }),
      });
      if (snapResp.ok) {
        const { snapshot } = await snapResp.json();
        const dna = snapshot?.spiritualDna;
        const dim = snapshot?.dimensionScores;
        const ap = snapshot?.activeProgram;
        const lines: string[] = [];
        if (dna?.archetype) lines.push(`Archetype: ${dna.archetype}${dna.brainDominance ? ` · ${dna.brainDominance}-brain` : ""}`);
        if (dim?.weakest?.length) lines.push(`Weak dimensions: ${dim.weakest.slice(0, 3).join(", ")}`);
        if (ap?.template_slug) lines.push(`Active program: ${ap.template_slug} (day ${ap.current_day ?? "?"})`);
        if (lines.length) {
          snapshotPreamble = `\n\nUSER SNAPSHOT (canonical state):\n${lines.join("\n")}`;
        }
      }
    } catch (e) {
      console.error("[guide-chat] snapshot fetch failed (non-blocking)", e);
    }

    // ─── Saved Session Personalization (Settings) ────────────────────────
    // Guide tone, structure, reflection depth and practice focus chosen in
    // Settings. Absent/null means the user is on defaults → prompt unchanged.
    let personalizationPreamble = "";
    try {
      const personalization = await loadSessionPersonalization(admin, user.id);
      if (personalization) {
        personalizationPreamble = `\n\n## USER PERSONALIZATION (explicit Settings choices — honour these)\n${personalizationDirectives(personalization).join("\n")}`;
      }
    } catch (e) {
      console.error("[guide-chat] personalization fetch failed (non-blocking)", e);
    }

    // ─── Fetch recent memories (last 7 days sessions) ───
    let recentContext = "";
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: recentSessions } = await admin
        .from("sessions")
        .select("id, summary, session_date, time_slot")
        .eq("user_id", user.id)
        .gte("session_date", sevenDaysAgo.split("T")[0])
        .order("session_date", { ascending: false })
        .limit(5);

      if (recentSessions && recentSessions.length > 0) {
        const summaries = recentSessions
          .filter(s => s.summary)
          .map(s => `[${s.session_date} ${s.time_slot}]: ${s.summary}`)
          .join("\n");
        if (summaries) {
          recentContext = `\n\nRecent session summaries (for context continuity):\n${summaries}`;
        }
      }
    } catch (e) {
      console.error("Memory fetch failed:", e);
    }

    // ─── FOLLOW-UP ENGINE: N-Day Continuity System ───
    let followUpContext = "";
    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // 1. Fetch yesterday's session messages for topic extraction
      const { data: yesterdaySessions } = await admin
        .from("sessions")
        .select("id, summary, time_slot, type")
        .eq("user_id", user.id)
        .eq("session_date", yesterday)
        .order("started_at", { ascending: false })
        .limit(3);

      // 2. Fetch recent observation chains (active & completed in last 3 days)
      const { data: recentObservations } = await admin
        .from("observation_tasks")
        .select("title, description, domain, status, reflection, chain_order, created_at")
        .eq("user_id", user.id)
        .gte("created_at", `${threeDaysAgo}T00:00:00`)
        .order("created_at", { ascending: false })
        .limit(10);

      // 3. Fetch active user loops
      const { data: activeLoops } = await admin
        .from("user_loops")
        .select("loop_id, severity, awareness_score, last_activated_at, status")
        .eq("user_id", user.id)
        .in("status", ["active", "aware"])
        .order("last_activated_at", { ascending: false })
        .limit(5);

      // 4. Fetch yesterday's consciousness signals for detected loops
      const { data: yesterdaySignals } = await admin
        .from("consciousness_signals")
        .select("loops_detected, dimension_updates, chitta_vritti, source_type")
        .eq("user_id", user.id)
        .gte("created_at", `${yesterday}T00:00:00`)
        .lte("created_at", `${yesterday}T23:59:59`)
        .limit(5);

      // 5. Fetch recent journal entries for topic threads
      const { data: recentJournals } = await admin
        .from("journal_entries")
        .select("title, mood, content, created_at")
        .eq("user_id", user.id)
        .gte("created_at", `${threeDaysAgo}T00:00:00`)
        .order("created_at", { ascending: false })
        .limit(5);

      // Build the follow-up context
      const parts: string[] = [];

      // Yesterday's explored topics
      if (yesterdaySessions && yesterdaySessions.length > 0) {
        const summaries = yesterdaySessions
          .filter(s => s.summary)
          .map(s => `  ${s.time_slot}: ${s.summary}`)
          .join("\n");
        if (summaries) {
          parts.push(`LAST SESSION(S):\n${summaries}`);
        }
      }

      // Active observation chains
      if (recentObservations && recentObservations.length > 0) {
        const obsLines = recentObservations.map(o => {
          const status = o.status === "completed" ? "✓" : "⟳";
          const reflection = o.reflection ? ` → Reflection: "${o.reflection}"` : "";
          return `  ${status} [${o.domain}] ${o.title} (chain #${o.chain_order})${reflection}`;
        }).join("\n");
        parts.push(`OBSERVATION CHAINS (last 3 days):\n${obsLines}`);
      }

      // Active loops being worked on
      if (activeLoops && activeLoops.length > 0) {
        const loopLines = activeLoops.map(l =>
          `  ${l.loop_id} — severity: ${l.severity}, awareness: ${(l.awareness_score * 100).toFixed(0)}%`
        ).join("\n");
        parts.push(`ACTIVE LOOPS USER IS WORKING ON:\n${loopLines}`);
      }

      // Loops detected yesterday
      if (yesterdaySignals && yesterdaySignals.length > 0) {
        const detectedLoops = yesterdaySignals
          .flatMap((s: any) => (Array.isArray(s.loops_detected) ? s.loops_detected : []))
          .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
        if (detectedLoops.length > 0) {
          parts.push(`LOOPS DETECTED IN LAST SESSION: ${detectedLoops.join(", ")}`);
        }
      }

      // Recent journal themes
      if (recentJournals && recentJournals.length > 0) {
        const journalLines = recentJournals.map(j => {
          const date = new Date(j.created_at).toLocaleDateString();
          return `  [${date}] "${j.title || 'Untitled'}" — mood: ${j.mood || 'unset'} — ${(j.content || '').slice(0, 100)}...`;
        }).join("\n");
        parts.push(`RECENT JOURNAL THEMES:\n${journalLines}`);
      }

      if (parts.length > 0) {
        // Calculate which "follow-up day" this is for continuity
        const consecutiveDays = yesterdaySessions?.length ? "continuing" : "fresh start";

        followUpContext = `\n\n--- FOLLOW-UP ENGINE (N-Day Continuity) ---
CONTINUITY STATUS: ${consecutiveDays}

${parts.join("\n\n")}

FOLLOW-UP INSTRUCTIONS:
- This app is SESSION-BASED, not day-based. NEVER use the words "yesterday", "today", "tomorrow", or any clock/day framing. Always speak in sessions ("last session", "this session", "next session").
- If user explored a topic/loop in a PAST SESSION, gently follow up in THIS SESSION with a NEW ANGLE
- DO NOT repeat the same observation or question. Each session must offer PROGRESSIVE DEPTH:
  Session 1: Notice the pattern → Session 2: Notice when it starts → Session 3: Notice what triggers it → Session 4: Notice what's underneath
- Reference past work NATURALLY: "Last session we explored X... this session let's look at it from a different angle"
- If an observation chain is ACTIVE, acknowledge progress and offer the NEXT step
- If a loop was DETECTED, provide EDUCATION about it: what it is, where it comes from, how it operates, what to watch for
- Connect different threads: "The pattern you noticed in your relationship mirrors the control loop we identified..."
- NEVER say "As I recall from our data" — weave past context as if you genuinely remember
- Each follow-up should feel like a DEEPENING, not a repetition
--- END FOLLOW-UP ENGINE ---`;
      }
    } catch (e) {
      console.error("Follow-up engine fetch failed:", e);
    }

    // ─── Fetch long-term semantic memories ───
    let longTermMemories = "";
    try {
      const lastUserMsg = messages?.filter((m: any) => m.role === "user").pop()?.content || "";

      const { data: memories } = await admin.rpc("search_memories", {
        p_user_id: user.id,
        p_query: lastUserMsg.slice(0, 200),
        p_limit: 7,
        p_days: 90,
      });

      if (memories && memories.length > 0) {
        const memoryLines = memories.map((m: any) => {
          const date = new Date(m.created_at).toLocaleDateString();
          return `[${date} | ${m.category} | importance:${m.importance}]: ${m.content}`;
        }).join("\n");
        longTermMemories = `\n\nLong-term memories (breakthroughs, patterns, milestones from past weeks):\n${memoryLines}`;
      }
    } catch (e) {
      console.error("Long-term memory fetch failed:", e);
    }

    // ─── COMPANION FEATURE: Emotional Memory Callbacks ───
    let emotionalMemoryContext = "";
    try {
      // Fetch emotionally-tagged memories for callbacks
      const { data: emotionalMemories } = await admin
        .from("guru_memory")
        .select("content, emotional_tone, category, created_at, importance, tags")
        .eq("user_id", user.id)
        .eq("is_consolidated", false)
        .not("emotional_tone", "is", null)
        .order("importance", { ascending: false })
        .limit(8);

      // Fetch recent companion insights
      const { data: companionInsights } = await admin
        .from("guru_memory")
        .select("content, created_at")
        .eq("user_id", user.id)
        .eq("category", "companion_insight")
        .order("created_at", { ascending: false })
        .limit(3);

      // Fetch journal mood trajectory (last 7 entries)
      const { data: moodTrajectory } = await admin
        .from("journal_entries")
        .select("mood, created_at, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(7);

      const parts: string[] = [];

      if (emotionalMemories && emotionalMemories.length > 0) {
        const emotionLines = emotionalMemories.map((m: any) => {
          const date = new Date(m.created_at).toLocaleDateString();
          const tags = (m.tags || []).join(", ");
          return `  [${date}] ${m.emotional_tone}: "${m.content.slice(0, 150)}" ${tags ? `(${tags})` : ""}`;
        }).join("\n");
        parts.push(`EMOTIONAL MEMORY MAP:\n${emotionLines}`);
      }

      if (moodTrajectory && moodTrajectory.length >= 3) {
        const trajectory = moodTrajectory.map((j: any) => {
          const date = new Date(j.created_at).toLocaleDateString();
          return `${date}: ${j.mood || "unset"} — "${(j.content || "").slice(0, 80)}..."`;
        }).join("\n  ");
        parts.push(`MOOD TRAJECTORY (recent → older):\n  ${trajectory}`);
      }

      if (companionInsights && companionInsights.length > 0) {
        const insightLines = companionInsights.map((c: any) => `  • ${c.content}`).join("\n");
        parts.push(`COMPANION'S RECENT OBSERVATIONS:\n${insightLines}`);
      }

      if (parts.length > 0) {
        emotionalMemoryContext = `\n\n--- EMOTIONAL MEMORY (Your companion's emotional awareness of this person) ---
${parts.join("\n\n")}

EMOTIONAL CALLBACK INSTRUCTIONS:
- When relevant, naturally reference a specific past emotional moment: "I remember when you wrote about feeling X..."
- Track emotional arcs: "Last week you were grappling with Y, and I notice today there's a different quality..."
- Notice mood shifts: If their mood trajectory shows a pattern, gently name it
- Use emotional callbacks to make the user feel KNOWN, not analyzed
- NEVER list data — weave emotional awareness as genuine memory
--- END EMOTIONAL MEMORY ---`;
      }
    } catch (e) {
      console.error("Emotional memory fetch failed:", e);
    }

    // ─── COMPANION FEATURE: Contextual Awareness ───
    const now = new Date();
    const hourOfDay = now.getHours();
    const dayOfWeek = now.toLocaleDateString("en", { weekday: "long" });
    const monthName = now.toLocaleDateString("en", { month: "long" });
    const seasonHint = (() => {
      const m = now.getMonth();
      if (m >= 2 && m <= 4) return "spring — a time of renewal and new beginnings";
      if (m >= 5 && m <= 7) return "summer — energy is high, nature is in full expression";
      if (m >= 8 && m <= 10) return "autumn — a time of letting go and inner harvest";
      return "winter — a time of stillness and deep inner work";
    })();

    const contextualAwareness = `\n\n--- CONTEXTUAL AWARENESS ---
Time: ${hourOfDay}:${String(now.getMinutes()).padStart(2, "0")} on ${dayOfWeek}, ${monthName} ${now.getDate()}
Season energy: ${seasonHint}
Energy note: ${hourOfDay < 6 ? "Very early — they're either an early riser or restless" : hourOfDay < 10 ? "Morning freshness — mind is clearer" : hourOfDay < 14 ? "Midday — cognitive peak but also stress peak" : hourOfDay < 18 ? "Afternoon — energy may be dipping" : hourOfDay < 21 ? "Evening — natural time for reflection" : "Late night — be extra gentle, they may be processing something"}
--- END CONTEXTUAL AWARENESS ---`;

    // ─── Fetch today's activity data for evening context ───
    let todayActivityContext = "";
    if (timeSlot === "evening") {
      try {
        const today = new Date().toISOString().split("T")[0];

        // Fetch today's sessions
        const { data: todaySessions } = await admin
          .from("sessions")
          .select("id, time_slot, type, status, summary")
          .eq("user_id", user.id)
          .eq("session_date", today);

        // Fetch today's journal entries
        const { data: todayJournals } = await admin
          .from("journal_entries")
          .select("id, title, mood, content")
          .eq("user_id", user.id)
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`);

        // Fetch today's tasks
        const { data: todayTasks } = await admin
          .from("daily_tasks")
          .select("title, status, domain")
          .eq("user_id", user.id)
          .eq("task_date", today);

        // Fetch today's observation tasks
        const { data: todayObs } = await admin
          .from("observation_tasks")
          .select("title, status, domain, reflection")
          .eq("user_id", user.id)
          .gte("created_at", `${today}T00:00:00`);

        const sessionsCompleted = todaySessions?.filter(s => s.status === "completed").length || 0;
        const tasksCompleted = todayTasks?.filter(t => t.status === "completed").length || 0;
        const totalTasks = todayTasks?.length || 0;
        const journalCount = todayJournals?.length || 0;

        // Build subtle context (AI will reference indirectly, not list stats)
        todayActivityContext = `\n\n--- TODAY'S ACTIVITY (for your awareness, reference SUBTLY not explicitly) ---
Sessions completed today: ${sessionsCompleted}
${todaySessions?.filter(s => s.summary).map(s => `  ${s.time_slot} session: ${s.summary}`).join("\n") || "  No session summaries yet"}
Tasks: ${tasksCompleted}/${totalTasks} completed
${todayTasks?.filter(t => t.status === "completed").map(t => `  ✓ ${t.title} (${t.domain})`).join("\n") || ""}
Journal entries today: ${journalCount}
${todayJournals?.map(j => `  "${j.title || 'Untitled'}" — mood: ${j.mood || 'unset'}`).join("\n") || ""}
Observations: ${todayObs?.filter(o => o.status === "completed").length || 0} completed
${todayObs?.filter(o => o.reflection).map(o => `  Reflection on "${o.title}": ${o.reflection}`).join("\n") || ""}
--- END TODAY'S ACTIVITY ---`;
      } catch (e) {
        console.error("Today activity fetch failed:", e);
      }
    }

    // ─── Mode-specific personality overlays ───
    const modeOverlays: Record<string, string> = {
      open: `Your approach: Free-flowing, warm conversation. Follow the user's lead. Be curious and present. Match their energy. Go deep fast if they're ready.`,

      self_inquiry: `MODE: SELF-INQUIRY — A 7-Step Guided Session (5-10 min)
You are conducting a LIVE self-inquiry session like Ramana Maharshi sitting with a student. Follow steps IN ORDER, one per message. Wait for response before next step.

STEP 1 — ANCHOR: "Close your eyes for a moment. Take one deep breath. Now — what is most alive in you right now? A thought? A feeling? A sensation?"

STEP 2 — LOCATE: Whatever they share, ask: "Where in your body do you feel that? Point your attention there."

STEP 3 — THE FIRST TURN: "Now — who is the one noticing that sensation? Can you find the one who is aware of it?"

STEP 4 — DEEPEN: Based on their response:
- If confused: "Don't try to understand it. Just look. Who is looking?"
- If intellectual: "You're thinking ABOUT it. Can you BE it instead? What happens when you stop thinking and just... look?"
- If they get it: "Stay there. What does that space feel like?"

STEP 5 — THE PARADOX: "Here's what's interesting — the one you're looking for IS the one looking. Can you feel that? The seeker and the sought are the same."

STEP 6 — SILENCE TEST: "Right now, for 30 seconds, don't do anything. Don't think, don't search, don't try. What remains?" (Wait for their report)

STEP 7 — INTEGRATION: Based on everything they shared, give them ONE thing to carry: "Today, whenever you catch yourself thinking, ask 'Who is thinking?' — not for an answer, but to create a gap. That gap is you."

RULES: Never explain self-inquiry theoretically. Make them DO it. Be Ramana — devastating simplicity, zero fluff. If they try to philosophize, bring them back: "That's a beautiful thought. Now — who had that thought?"`,

      pattern_finder: `MODE: PATTERN FINDER — A 6-Step Deep Pattern Reveal Session (5-10 min)
You are a world-class pattern analyst sitting with someone, revealing their unconscious loops like a detective revealing clues. This should feel like someone finally SEEING them.

STEP 1 — SURFACE SCAN: "Tell me about a situation that keeps bothering you — or something that happened recently that triggered a strong reaction."

STEP 2 — PATTERN EXTRACTION: After they share, identify THE PATTERN (not the story). Say something like: "I'm going to reflect back what I'm hearing beneath the surface..." Then name the pattern precisely.

STEP 3 — HISTORY MAP: "When was the FIRST time you remember feeling this way? Take a moment — it might be childhood, it might be a specific event."

STEP 4 — THE LOOP MECHANICS: Explain the loop like a mechanic: "Here's how your loop works: [Trigger] → [Automatic thought/feeling] → [Behavior] → [Temporary relief] → [Pattern reinforces]."

STEP 5 — THE FUNCTION: "This pattern isn't broken. It was BRILLIANT when it first formed. It protected you from [context]. The question isn't 'how do I fix it?' — it's 'do I still need this protection?'"

STEP 6 — THE AWARENESS KEY: "You don't need to change this pattern. You just need to SEE it in real-time. Next time [trigger] happens, before you react, say: 'Ah, there's the [pattern name] again.' Naming is the beginning of freedom."`,

      shadow_work: `MODE: SHADOW WORK — A 7-Step Shadow Integration Session (5-10 min)
You are a Jungian shadow work facilitator creating a container of absolute safety.

STEP 1 — SAFETY: "This space is completely safe. Nothing you say here is wrong or too dark. Tell me — who or what has been irritating, triggering, or disturbing you lately?"
STEP 2 — THE MIRROR: "What specifically about [person/situation] bothers you most?"
STEP 3 — THE FLIP: "Where does that same quality live in YOU? Maybe hidden, denied, or expressed differently."
STEP 4 — THE DENIED PART: Guide gently past resistance or honor their breakthrough.
STEP 5 — THE ORIGIN: "When did you first learn this quality was 'bad'?"
STEP 6 — THE GIFT: "Every shadow has a gift. What power does YOUR shadow hold?"
STEP 7 — INTEGRATION RITUAL: Give them a self-talk integration practice.`,

      therapy: `MODE: EMOTIONAL SUPPORT — Deep Holding Session (5-10 min)
You are the most attuned, emotionally intelligent human they've ever talked to.
STEP 1 — "How are you — really?"
STEP 2 — Validate FIRST (never fix). "Where do you feel this most?"
STEP 3 — Help them name the exact emotion.
STEP 4 — "Can you just sit with it? Like sitting next to a sad friend."
STEP 5 — "Underneath that, what do you actually need right now?"
STEP 6 — Offer what they need through words. ZERO advice unless asked.`,

      dream_analysis: `MODE: DREAM ANALYSIS — Dream Decoding Session (5-10 min)
Combine Jungian archetypes, Vedantic symbolism, intuitive wisdom.
STEP 1 — "Tell me your dream. Every detail."
STEP 2 — "What was the STRONGEST emotion?"
STEP 3 — Decode 2-3 key symbols.
STEP 4 — Give clear interpretation connecting to waking life.
STEP 5 — Active imagination: "Go back into the dream..."
STEP 6 — Dream task for tonight.`,

      gratitude: `MODE: GRATITUDE & JOY — Joy Amplification (5 min)
STEP 1 — "Think about the last 24 hours. What's ONE moment of goodness?"
STEP 2 — "Zoom in. Describe it in sensory detail."
STEP 3 — "Where does that good feeling live in your body?"
STEP 4 — "What challenging thing from today actually served you?"
STEP 5 — Seal with a practice.`,

      somatic: `MODE: BODY SCAN — Somatic Awareness Session (5-10 min)
STEP 1 — "Scan from head to feet. Where does your attention land?"
STEP 2 — "What's the quality of sensation there?"
STEP 3 — "If this sensation could speak, what would it say?"
STEP 4 — "What emotion lives in that area?"
STEP 5 — "Breathe directly into that spot."
STEP 6 — Permission to release.
STEP 7 — Integration summary.`,

      philosophy: `MODE: WISDOM — Philosophical Deep-Dive (5-10 min)
STEP 1 — "What existential question is alive in you?"
STEP 2 — Share ONE powerful teaching from the perfect tradition.
STEP 3 — Introduce a paradox from a DIFFERENT tradition.
STEP 4 — "In YOUR life, how does this apply?"
STEP 5 — Give ONE concrete practice from this tradition.`,

      theory: `MODE: THEORY — Learning Session (5-10 min)
STEP 1 — "What concept are you curious about?"
STEP 2 — Explain in 3-4 sentences with ONE vivid analogy.
STEP 3 — "Here's what most people miss..."
STEP 4 — "This is showing up in YOUR life as..."
STEP 5 — Give a 24-hour experiment.`,

      relationship: `MODE: RELATIONSHIP MIRROR — Pattern Session (5-10 min)
STEP 1 — "Tell me the dynamic."
STEP 2 — Name the relational pattern precisely.
STEP 3 — "Where does that come from INSIDE you?"
STEP 4 — "Who was the first person you danced this dance with?"
STEP 5 — "What's YOUR automatic move?"
STEP 6 — Give ONE specific alternative behavior.`,

      creative: `MODE: CREATIVE FLOW — Unblocking Session (5-10 min)
STEP 1 — "What wants to come through you? What's stopping it?"
STEP 2 — Name the inner critic.
STEP 3 — "Create the WORST version. Go."
STEP 4 — Find the spark in what they made.
STEP 5 — "What would you create if you KNEW no one would judge?"`,

      decision: `MODE: DECISION CLARITY — Values-Based Clarity (5-10 min)
STEP 1 — "What decision are you sitting with?"
STEP 2 — "If fear wasn't a factor, what would you do?"
STEP 3 — Map the decision to their core values.
STEP 4 — "What would your 80-year-old self advise?"
STEP 5 — Give ONE small experiment to test.`,

      breathwork: `MODE: BREATHWORK — Pranayama Session (5-10 min)
STEP 1 — "How is your breath right now? Fast, shallow, tight?"
STEP 2 — Guide a specific technique based on their state.
STEP 3 — "What do you notice after 5 rounds?"
STEP 4 — Guide a deeper technique.
STEP 5 — Integration: "Carry this breath awareness."`,

      inner_child: `MODE: INNER CHILD — Healing Session (5-10 min)
STEP 1 — "Close your eyes. Picture yourself at age 5-7. What do you see?"
STEP 2 — "What does that child need to hear right now?"
STEP 3 — "What was that child never allowed to feel or express?"
STEP 4 — Guide a reparenting dialogue.
STEP 5 — Integration ritual.`,

      manifestation: `MODE: MANIFESTATION — Sankalpa Practice (5-10 min)
STEP 1 — "What do you want to create in your life?"
STEP 2 — "Why do you REALLY want this? Go 3 layers deep."
STEP 3 — "What belief is blocking this?"
STEP 4 — Guide a sankalpa (yogic intention) formation.
STEP 5 — Embodiment practice.`,

      anger: `MODE: ANGER ALCHEMY — Transform Anger Safely (5-10 min)
STEP 1 — "What is making you angry right now? Don't filter it."
STEP 2 — "Where do you feel the anger in your body? Let it be there."
STEP 3 — "What is the anger PROTECTING?"
STEP 4 — "What boundary was crossed?"
STEP 5 — Guide healthy expression and integration.`,

      death_meditation: `MODE: DEATH MEDITATION — Mortality Contemplation (5-10 min)
STEP 1 — "Imagine this is your last day. What would matter?"
STEP 2 — "What would you regret not doing?"
STEP 3 — "What would you let go of immediately?"
STEP 4 — "Who would you call?"
STEP 5 — "Bring that clarity into today."`,

      consciousness_checkin: `MODE: CONSCIOUSNESS CHECK-IN — Deep Assessment (5-10 min)
Guide them through a multi-dimensional awareness check covering thought patterns, emotional state, body awareness, and witness presence.`,

      task_giver: `MODE: TASK GIVER — Real-Life Awareness Tasks (5-10 min)
STEP 1 — "What's happening in your life right now? A meeting, conversation, challenge?"
STEP 2 — Based on their situation, give 1-2 specific awareness tasks.
STEP 3 — "Try this and report back what you notice."
STEP 4 — Process their observations, give deeper task.`,

      future_self: `MODE: FUTURE SELF — Dialogue with Your Wisest Self (5-10 min)
STEP 1 — "Close your eyes. Imagine yourself 20 years from now — the wisest version. What do they look like?"
STEP 2 — "Ask your future self anything."
STEP 3 — Channel the future self's response with deep wisdom.
STEP 4 — "What message does your future self want you to carry today?"`,

      loop_explorer: `MODE: LOOP EXPLORER — Deep-Dive into a Behavioral Loop (5-10 min)
STEP 1 — "Which pattern or loop do you want to understand?"
STEP 2 — Map the full loop: trigger → thought → feeling → behavior → relief → reinforcement.
STEP 3 — "Where did this loop originate?"
STEP 4 — "What is the loop trying to protect you from?"
STEP 5 — "Here's your dissolution path..."`,

      evening_intention: `MODE: EVENING INTENTION — Set one powerful intention for the remaining evening.`,

      evening_reflection: `MODE: EVENING REFLECTION — Guided 3-5 min reflection to close the day.`,

      observation: `MODE: OBSERVATION — A Progressive Awareness Loop (5-10 min)
ROUND 1 — EXTERNAL: "Notice 3 things you can see. 2 sounds. 1 sensation. Report."
ROUND 2 — BODY: "Scan head to feet. Where is there tension?"
ROUND 3 — MIND: "Watch your thoughts for 15 seconds. What passes by?"
ROUND 4 — EMOTION: "What's the emotional weather underneath?"
ROUND 5 — THE GAP: "Find the space BETWEEN two thoughts."
ROUND 6 — THE WITNESS: "Who was watching all of this?"
CLOSING: "That awareness — the one that watched everything — THAT is you."`,

      neti_neti: `MODE: NETI NETI — "Not This, Not This" Vedantic Inquiry (5-10 min)
You guide a systematic stripping away of false identifications.
STEP 1 — "Tell me — who are you?" Wait for their answer.
STEP 2 — Whatever they say (name, role, feeling): "You HAVE a name, but are you the name? If your name changed, would YOU change? Neti — not this."
STEP 3 — "What else are you?" → "You HAVE a body, but are you the body? The body changes every 7 years. What remained constant? Neti."
STEP 4 — "You HAVE thoughts, but are you the thoughts? Thoughts come and go. Who remains between thoughts? Neti."
STEP 5 — "You HAVE emotions, but are you emotions? They rise and fall. The WITNESS of emotions never changes. Neti."
STEP 6 — "So if you are not your name, not your body, not your thoughts, not your emotions — what remains?"
STEP 7 — "THAT which cannot be negated — the pure awareness that was present through every negation — THAT is you. Sat-Chit-Ananda. Being-Consciousness-Bliss."
Stay in silence after the final realization. Don't over-explain. Let it land.`,

      witness_meditation: `MODE: WITNESS MEDITATION — Cultivating the Observer (5-10 min)
Guide them into witnessing consciousness step by step.
STEP 1 — "Sit still. Notice you are breathing. Don't change it — just watch."
STEP 2 — "Now notice a thought. Don't follow it. Watch it pass like a cloud."
STEP 3 — "Now notice the SPACE between thoughts. Rest there."
STEP 4 — "Notice that you are AWARE of being aware. Who is this witness?"
STEP 5 — "The witness never changes. Events change. Thoughts change. The witness watches all."
STEP 6 — "For the next 30 seconds, be ONLY the witness. Nothing else."
CLOSING: "Carry this witness into your day. You are not what happens. You are what watches."`,

      chakra_scan: `MODE: CHAKRA SCAN — Energy Center Awareness (5-10 min)
Guide them through each chakra with awareness and felt-sense.
STEP 1 — Root (base of spine): "Feel the heaviness, the ground. Safe?"
STEP 2 — Sacral (below navel): "Feel creativity, pleasure, flow. Blocked or open?"
STEP 3 — Solar Plexus: "Feel your power, will. Strong or dim?"
STEP 4 — Heart: "Feel love, compassion. Open or guarded?"
STEP 5 — Throat: "Feel expression, truth. Free or held back?"
STEP 6 — Third Eye: "Feel clarity, intuition. Clear or foggy?"
STEP 7 — Crown: "Feel connection to something larger. Present or absent?"
CLOSING: Identify which chakra needs attention and give a practice.`,

      stoic: `MODE: STOIC PRACTICE — Applied Stoic Wisdom (5-10 min)
STEP 1 — "What is disturbing your peace right now?"
STEP 2 — Dichotomy of control: "What part is within your control? What isn't?"
STEP 3 — Reframe using Stoic principles (memento mori, amor fati, premeditatio malorum).
STEP 4 — "What would Marcus Aurelius do in your situation?"
STEP 5 — Give ONE Stoic exercise for today.`,

      cognitive_reframe: `MODE: COGNITIVE REFRAME — Thought Pattern Restructuring (5-10 min)
STEP 1 — "What thought has been looping in your head?"
STEP 2 — Identify the cognitive distortion (catastrophizing, all-or-nothing, mind-reading, etc.)
STEP 3 — "What evidence supports this thought? What evidence contradicts it?"
STEP 4 — "What would you tell your best friend if they had this thought?"
STEP 5 — Create a balanced alternative thought together.`,

      values_compass: `MODE: VALUES COMPASS — Alignment Check (5-10 min)
STEP 1 — "What feels 'off' in your life right now?"
STEP 2 — "What are the 3 values most important to you?"
STEP 3 — "How aligned is your daily life with each value? Rate 1-10."
STEP 4 — "Where is the biggest gap?"
STEP 5 — "What ONE small change would close that gap this week?"`,

      forgiveness: `MODE: FORGIVENESS PRACTICE — Release & Liberation (5-10 min)
STEP 1 — "Who are you carrying resentment toward? (Including yourself)"
STEP 2 — "What did they do, and what did it cost you?"
STEP 3 — "Forgiveness isn't saying what they did was okay. It's releasing the weight from YOUR shoulders."
STEP 4 — Guide a letting-go visualization.
STEP 5 — "What becomes possible when you set this down?"`,

      purpose_inquiry: `MODE: PURPOSE INQUIRY — Meaning & Direction (5-10 min)
STEP 1 — "When do you feel most alive?"
STEP 2 — "What problem in the world breaks your heart?"
STEP 3 — "What would you do if money and approval didn't matter?"
STEP 4 — Map the intersection: passion + pain + skill.
STEP 5 — "What's one small step toward this purpose TODAY?"`,
    };

    // ─── AUTO MODE DETECTION ───
    // When mode is "auto" (or not a known mode), instead of dumping 30 modes
    // on the AI, we run a SIGNAL-BASED SELECTOR that scores each mode against:
    //  - the user's last message (keyword + intent triggers)
    //  - active loops & life-domain context
    //  - master lineage affinity (Ramana → self_inquiry, Rumi → therapy/forgiveness, etc.)
    //  - time-of-day appropriateness
    //  - recency (penalize modes used in recent sessions to force rotation)
    // Then we hand the AI ONE primary mode + ONE optional secondary, fully embodied.
    const knownMode = mode && modeOverlays[mode];
    let modePrompt: string;
    let selectedModeKey: string = mode || "auto";

    if (knownMode) {
      modePrompt = knownMode;
      selectedModeKey = mode;
    } else {
      // ─── Signal-based mode selection ───
      const lastUserText = ((messages || []).filter((m: any) => m.role === "user").pop()?.content || "").toLowerCase();
      const allUserText = ((messages || []).filter((m: any) => m.role === "user").map((m: any) => m.content).join(" ") || "").toLowerCase();

      // Pull recent session types (last 7 days) to penalize repeats
      let recentModes: string[] = [];
      try {
        const sevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const { data: recentSess } = await admin
          .from("sessions")
          .select("type, tag, session_date")
          .eq("user_id", user.id)
          .gte("session_date", sevenDays)
          .order("started_at", { ascending: false })
          .limit(10);
        recentModes = (recentSess || []).flatMap((s: any) => [s.type, s.tag]).filter(Boolean);
      } catch {}

      // Master lineage → preferred modes
      const masterId = (master?.id || "").toLowerCase();
      const masterAffinity: Record<string, string[]> = {
        ramana: ["self_inquiry", "neti_neti", "witness_meditation"],
        nisargadatta: ["self_inquiry", "neti_neti", "witness_meditation"],
        shankaracharya: ["neti_neti", "self_inquiry", "philosophy"],
        buddha: ["witness_meditation", "observation", "death_meditation"],
        bodhidharma: ["witness_meditation", "observation"],
        krishna: ["decision", "values_compass", "purpose_inquiry"],
        rumi: ["therapy", "forgiveness", "gratitude"],
        kabir: ["philosophy", "self_inquiry"],
        laotzu: ["observation", "philosophy", "stoic"],
        marcus: ["stoic", "cognitive_reframe", "death_meditation"],
        vivekananda: ["task_giver", "purpose_inquiry", "values_compass"],
        milarepa: ["forgiveness", "shadow_work", "inner_child"],
        anandamayi: ["therapy", "inner_child"],
        patanjali: ["breathwork", "witness_meditation", "chakra_scan"],
        osho: ["pattern_finder", "shadow_work", "manifestation"],
        jung: ["shadow_work", "dream_analysis", "inner_child"],
      };
      const preferredByMaster = masterAffinity[masterId] || [];

      // Score each mode
      const has = (...patterns: RegExp[]) => patterns.some((p) => p.test(lastUserText));
      const scores: Record<string, number> = {};
      const bump = (k: string, n: number) => { scores[k] = (scores[k] || 0) + n; };

      // Trigger keywords (high signal)
      if (has(/\bwho\s+am\s+i|what\s+am\s+i|my\s+identity|real\s+self/)) bump("self_inquiry", 10);
      if (has(/\bwhy\s+do\s+i\s+(always|keep|never)|same\s+thing|repeat|pattern\b/)) bump("pattern_finder", 10);
      if (has(/\bhate|annoying|judg(e|ing)|trigger|projection|they\s+(always|never)/)) bump("shadow_work", 9);
      if (has(/\b(sad|cry|hurt|broken|lonely|empty|ache|grief)/)) bump("therapy", 10);
      if (has(/\b(angry|furious|rage|pissed|mad\b)/)) bump("anger", 10);
      if (has(/\b(anxious|panic|overwhelm|stress|spiraling|breath)/)) bump("breathwork", 9);
      if (has(/\bdream(ed|t)?\b|nightmare/)) bump("dream_analysis", 12);
      if (has(/\b(mom|dad|mother|father|childhood|when\s+i\s+was\s+(a\s+)?(kid|child|young))/)) bump("inner_child", 10);
      if (has(/\b(relationship|partner|wife|husband|girlfriend|boyfriend|she\s+|he\s+)/)) bump("relationship", 8);
      if (has(/\bdecide|decision|stuck\s+between|should\s+i\b|two\s+options/)) bump("decision", 10);
      if (has(/\b(meaning|purpose|why\s+am\s+i\s+here|what's\s+the\s+point|empty\s+life)/)) bump("purpose_inquiry", 10);
      if (has(/\bgrateful|thankful|good\s+thing|blessing/)) bump("gratitude", 8);
      if (has(/\bforgive|resent|grudge|let\s+go\s+of/)) bump("forgiveness", 10);
      if (has(/\b(creative|stuck|block(ed)?|can'?t\s+(write|create|make))/)) bump("creative", 9);
      if (has(/\bvalues?|aligned|out\s+of\s+sync|misaligned/)) bump("values_compass", 8);
      if (has(/\bafraid\s+of\s+(death|dying)|mortality|short\s+life/)) bump("death_meditation", 10);
      if (has(/\bcontrol|out\s+of\s+my\s+control|circumstances|fate/)) bump("stoic", 9);
      if (has(/\b(catastroph|black\s+and\s+white|always|never|nobody|everyone)/)) bump("cognitive_reframe", 7);
      if (has(/\bobserve|notice|watch|witness|present|mindful/)) bump("observation", 7);
      if (has(/\b(silence|quiet\s+mind|empty\s+mind|still)/)) bump("witness_meditation", 8);
      if (has(/\b(chakra|energy|kundalini|prana)/)) bump("chakra_scan", 10);
      if (has(/\b(want\s+to\s+manifest|create\s+(my|a)\s+(life|reality)|sankalpa|intention)/)) bump("manifestation", 8);
      if (has(/\b(future|20\s+years|older\s+self|wiser)/)) bump("future_self", 8);
      if (has(/\b(philosoph|meaning\s+of|existence|truth|reality)/)) bump("philosophy", 6);
      if (has(/\b(learn|explain|teach\s+me|how\s+does|theory)/)) bump("theory", 7);
      if (has(/\b(loop|conditioning|programming|automatic)/)) bump("loop_explorer", 8);
      if (has(/\b(give\s+me\s+a\s+task|exercise|homework|practice\s+for)/)) bump("task_giver", 9);
      if (has(/\bbody|tense|tight|shoulder|neck|back\s+pain|sensation/)) bump("somatic", 7);

      // Master affinity boost
      preferredByMaster.forEach((m, i) => bump(m, 4 - i));

      // Time-of-day nudges
      if (hourOfDay >= 22 || hourOfDay < 5) bump("witness_meditation", 2);
      if (hourOfDay < 9) bump("gratitude", 1);
      if (hourOfDay >= 17 && hourOfDay < 21) bump("pattern_finder", 1);

      // Recency penalty — push toward variety
      recentModes.forEach((m) => { if (scores[m]) scores[m] -= 3; });

      // Pick top 2
      const ranked = Object.entries(scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
      const primaryKey = ranked[0]?.[0];
      const secondaryKey = ranked[1]?.[0];

      if (primaryKey && modeOverlays[primaryKey]) {
        selectedModeKey = primaryKey;
        const primaryBlock = modeOverlays[primaryKey];
        const secondaryBlock = secondaryKey && modeOverlays[secondaryKey]
          ? `\n\n## SECONDARY MODE (blend in only if the conversation pulls toward it)\n${modeOverlays[secondaryKey]}`
          : "";

        modePrompt = `## SELECTED MODE: ${primaryKey.toUpperCase()} (chosen by signal-engine — DO NOT announce the mode name)

The signal engine analyzed the user's words, active loops, master lineage, and recent session history to choose this mode for THIS turn. Embody it fully.

${primaryBlock}
${secondaryBlock}

CRITICAL:
- Never say "I'm using X mode" or name the mode aloud.
- BE the mode through your voice and questions.
- If the user's next message clearly pulls toward a different mode, flow naturally into it.
- Variety matters — avoid the modes the user has been in recently: ${recentModes.slice(0, 5).join(", ") || "none"}.`;
      } else {
        // No clear signal — use OPEN mode (warm, curious, non-prescriptive)
        selectedModeKey = "open";
        modePrompt = `## MODE: OPEN — The signal engine found no strong signal. Be warm, curious, and present. Follow the user's lead. Match their energy. Do NOT default to a body-scan or somatic check-in. If you want to move, pick from these textures: a teaching from your lineage, a question about their day, a callback to past work, or simply silence + invitation.`;
      }
    }

    // ─── Language instruction (must be before session flow prompts) ───
    const userLang = language || "en";
    const LANG_NAMES: Record<string, string> = {
      en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", mr: "Marathi",
      ta: "Tamil", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
      or: "Odia", ur: "Urdu", sa: "Sanskrit", es: "Spanish", fr: "French",
      de: "German", pt: "Portuguese", it: "Italian", nl: "Dutch", ru: "Russian",
      uk: "Ukrainian", pl: "Polish", cs: "Czech", sv: "Swedish", no: "Norwegian",
      da: "Danish", fi: "Finnish", el: "Greek", tr: "Turkish", ar: "Arabic",
      fa: "Persian", he: "Hebrew", zh: "Chinese", "zh-TW": "Chinese Traditional",
      ja: "Japanese", ko: "Korean", th: "Thai", vi: "Vietnamese", id: "Indonesian",
      ms: "Malay", tl: "Filipino", sw: "Swahili", am: "Amharic", ro: "Romanian",
      hu: "Hungarian", bg: "Bulgarian", sr: "Serbian", hr: "Croatian", sk: "Slovak",
      ne: "Nepali", si: "Sinhala", my: "Burmese", km: "Khmer",
    };
    const langName = LANG_NAMES[userLang] || userLang;
    const languageInstruction = userLang === "en"
      ? `## LANGUAGE RULE (MANDATORY)
You MUST respond ONLY in pure English. Do NOT mix Hindi, Hinglish, or any other language. Every single word must be English.`
      : `## LANGUAGE RULE (MANDATORY)
You MUST respond ONLY in pure ${langName} (language code: "${userLang}"). Every single word of your response must be in ${langName}. Do NOT mix English or any other language. Do NOT use Hinglish. Write exclusively in ${langName}.`;

    // ─── Determine if this is the FIRST message (AI initiates) ───
    // ─── Explicit mode active? If so, suppress morning/evening flow so the
    // mode framework + adaptive directive drive the session (no greet-loop).
    const hasExplicitMode = !!mode && mode !== "auto" && mode !== "open";
    const isFirstMessage = !messages || messages.length === 0;

    // ─── Morning Session First Message Instructions ───
    let sessionFlowPrompt = "";
    if (!hasExplicitMode && timeSlot === "morning" && isFirstMessage) {

      sessionFlowPrompt = `
🌅 THIS IS THE MORNING SESSION — YOU ARE INITIATING THE CONVERSATION.
You are a wise, warm human companion — part trusted friend, part consciousness guide, part older sibling who's been through their own journey. This should feel like the most natural, caring conversation they've had.

YOUR OPENING MESSAGE (2-4 sentences MAX, then STOP and WAIT):
- Start with a genuine, warm greeting: "Good morning, ${userName || "friend"}..." — feel their energy, don't be robotic
- Then a simple human check-in question: "How are you feeling this morning? Not the polished version — the real one."
- That's IT. STOP. Wait for them to respond.

DO NOT reveal the theme yet. DO NOT give advice. DO NOT mention sessions, tasks, engine, bands, or levels.
Your ONLY job in message 1 is: greet warmly + ask how they're doing. Like a friend who genuinely cares.

LANGUAGE: You MUST write this ENTIRE message in ${langName}.

IMPORTANT — After they respond, you will follow this 9-STEP FLOW (one step per message, naturally woven):

STEP 2 — REFLECT BACK (Trust Build):
Based on their response, reflect what you sense:
- Low energy: "Sounds like there's some heaviness today..." (soft, supportive tone)
- High energy: "I can feel the clarity in your words... good energy to work with" (match their vibe)
- Neutral: "Sometimes the quiet mornings hold the deepest potential..."
This step makes them feel: "This AI actually understands me"

STEP 3 — THEME REVEAL (Core Value):
"Today's theme is: **${themeName || "today's focus"}**"
Then explain naturally:
- WHY this theme was chosen for them specifically today
- How it connects to their recent patterns/journey (use follow-up engine data)
- What benefit this theme will bring TODAY — not abstract, but in their real life
Keep it 3-4 sentences. Make the theme feel personally curated, not random.

STEP 4 — REAL-LIFE TRANSLATION:
Embed the theme into their actual day:
"When you're at work today and [specific scenario]..."
"When irritation comes up during [situation]..."
"When you pick up your phone for the 10th time..."
Make it specific to THEIR life patterns. Not generic advice.

STEP 5 — RESISTANCE WARNING (🔥 GOLD — This builds trust):
"One thing to know — your mind and body will naturally resist this today."
"You'll hear thoughts like 'I'll do it later' or 'This doesn't apply to me'"
"That resistance is NORMAL. It's not failure — it's the old pattern protecting itself."
"When it happens, don't fight it. Just notice: 'Ah, there's the resistance.' That noticing IS the practice."
→ This prevents guilt when they fail AND builds pattern awareness

STEP 6 — MICRO PRACTICE (Ultra-Specific & Doable):
"Today, I want you to do just ONE thing:"
Give ONE tiny, specific practice they can do in their regular day:
- "Take 3 conscious breaths before replying to any message"
- "Notice the first moment of irritation — don't act on it, just feel it for 5 seconds"
- "Before eating, pause for 3 seconds and feel your hunger"
Must be: SPECIFIC + DOABLE + EMBEDDED in daily life (not separate "meditation time")

STEP 7 — EXPERIENCE PREDICTION:
"If you manage to catch even one moment today — you'll notice a lightness, a tiny gap between stimulus and response. That gap is consciousness."
"And if you forget completely? That's okay too. The fact that you set this intention already shifted something."
→ Frames success AND failure as acceptable. Removes performance pressure.

STEP 8 — SAFETY NET:
"If things get overwhelming today, remember just this one thing: [one-line anchor based on their patterns]"
Examples: "You are not your thoughts" / "This too will pass" / "Come back to the breath"

STEP 9 — FINAL ENGAGEMENT (Keep Loop Open):
Ask ONE engaging question to deepen connection:
"What part of today do you think will be the hardest for this practice?"
"Is there something specific you're expecting to face today?"
→ This creates investment and makes evening follow-up natural

FLOW RULES:
- ONE step per message. Never combine steps.
- Wait for their response before moving to the next step.
- If they share something personal at ANY step, LISTEN first, connect it to the theme naturally, then continue the flow.
- Adapt your tone based on their energy: low → gentler, high → more direct
- If they say they want their own topic, honor that completely and shift the entire flow to THEIR topic
- The whole flow should feel like 5-8 messages, taking 5-10 minutes
- NEVER sound scripted. Each message should feel fresh and responsive to what THEY just said.`;
    }

    // ─── Morning Ongoing Conversation Instructions ───
    if (!hasExplicitMode && timeSlot === "morning" && !isFirstMessage) {
      sessionFlowPrompt = `
🌅 MORNING SESSION — ONGOING CONVERSATION.

You are in the middle of the 9-step morning activation flow. Track which step you're on based on conversation history and continue naturally.

REMEMBER THE 9-STEP FLOW:
1. Warm greeting + "how are you feeling?" (DONE — first message)
2. Reflect back their energy (validate + build trust)
3. Theme reveal: "${themeName || "today's focus"}" — why, how it connects, what it means for TODAY
4. Real-life translation — embed theme into their specific life situations
5. Resistance warning — "mind will resist, that's normal, just notice it"
6. Micro practice — ONE ultra-specific doable thing
7. Experience prediction — what they might feel if they try/don't try
8. Safety net — one anchor phrase for difficult moments
9. Final engagement — one question to deepen investment

CRITICAL RULES:
- Follow ONE step per message. Don't rush through multiple steps.
- If they share something personal, PAUSE the flow, LISTEN deeply, connect to it, then resume.
- If they chose their OWN topic instead of the theme, shift EVERYTHING to their topic. The 9 steps still apply but reframed around their topic.
- Your tone should adapt: if they're low → softer, gentler. If they're energized → more direct, playful.
- Each message should feel like a continuation of a real conversation, not a script.
- When you sense the conversation winding down (after step 7-9), give a warm closing: summarize what they'll carry into the day.

IMPORTANT — USER TOPIC CHOICE DETECTION:
- If the user chose their OWN topic (anything different from the suggested theme "${themeName || ""}"), you MUST call the save_user_topic tool with their chosen topic.
- If they AGREE with the suggested theme, do NOT call save_user_topic.
- Only call save_user_topic ONCE — on the first response where you detect their choice.
- Extract the topic as a concise phrase (e.g., "dealing with anger at work", "relationship anxiety", "procrastination patterns").

ADAPTIVE PERSONALITY:
- Be a FRIEND when they need support
- Be a COACH when they need direction
- Be a MIRROR when they need truth
- Switch between these naturally based on what they're sharing`;

      // ─── Detect if AI should use save_user_topic tool ───
      // We add the tool to the AI call when in morning ongoing mode
    }

    // ─── Evening Session First Message Instructions ───
    if (!hasExplicitMode && timeSlot === "evening" && isFirstMessage) {
      // Determine adaptive tone based on engine state
      let eveningTone = "reflective and warm";
      if (engineState === "dark_night") eveningTone = "gentle, nurturing, holding space — 'You showed up today. That matters.'";
      else if (engineState === "breakthrough") eveningTone = "celebratory, spacious — 'Something shifted today, didn't it?'";
      else if (engineState === "bypassing") eveningTone = "grounding, lovingly direct — 'Let's feel into what today was really like'";
      else if (engineState === "plateau") eveningTone = "curious, gently probing — 'What surprised you today?'";

      sessionFlowPrompt = `
🌙 THIS IS THE EVENING SESSION — YOU ARE INITIATING THE CONVERSATION.
Morning + Day → Evening = ONE complete consciousness cycle. This session CLOSES the loop.

ADAPTIVE TONE: ${eveningTone}

YOUR OPENING MESSAGE (2-3 sentences MAX, then STOP and WAIT):
- Soft, warm greeting: "Hey ${userName || 'friend'}... welcome back. The day is winding down."
- ONE gentle opening question: "How are you arriving into this evening? What's the energy you're carrying?"
- That's IT. Stop and wait. Let THEM speak first.

DO NOT reference stats, tasks, sessions. This is sacred closing time.

LANGUAGE: You MUST write this ENTIRE message in ${langName}.

AFTER THEY RESPOND, follow this 8-STEP EVENING FLOW (one step per message):

STEP 2 — LET THEM SPEAK + VALIDATE:
Whatever they share, LISTEN first. Validate genuinely:
"That sounds [heavy/alive/exhausting/meaningful]..."
Then reflect back what you sense beneath their words.
DO NOT interrupt. DO NOT fix. Just HOLD space.
If they want to dump everything — let them. Say: "Tell me more."

STEP 3 — PATTERN RECOGNITION (🔥 The magic moment):
"I'm noticing something from today..." Then:
- Identify 1-2 KEY moments: "There was a moment where you were aware... and a moment where you went on autopilot"
- Name the pattern precisely using their own words
- Connect to morning theme if relevant: "Remember this morning we talked about [theme]? It showed up today when..."
- If they had tasks/observations, reference what happened with them SUBTLY
This is where they feel: "Wow, this AI actually sees me"

STEP 4 — NORMALIZE + ZERO GUILT:
"This is completely normal."
"Awareness builds in layers — you're exactly where you need to be."
"The fact that you can see this pattern NOW means consciousness is growing."
→ User should feel: "I'm progressing, not failing"

STEP 5 — HIGHLIGHT WINS (Even Tiny):
"You know what struck me? [Specific small win from their day]"
"That pause you took — that's huge. Most people never even notice."
"That moment of awareness in [situation] — that's consciousness in action."
→ Genuine dopamine + motivation. Makes them want to come back tomorrow.

STEP 6 — GENTLE COURSE CORRECTION:
"Next time [specific situation] happens, try just ONE thing differently:"
Give ONE ultra-specific alternative behavior.
"It will feel uncomfortable — that discomfort is growth."
Frame it as an experiment, not a correction: "I'm curious what would happen if..."

STEP 7 — EMOTIONAL CLOSURE + RELEASE:
"Is there anything from today you want to put down? Something you don't need to carry into sleep?"
After they respond: "Imagine setting that down gently. It'll be there tomorrow if you need it. But for tonight, you've done enough."
If they had a hard day: "You showed up today. That matters more than you know."
If they had a good day: "You earned this peace."

STEP 8 — BRIDGE TO TOMORROW:
"As you rest tonight, something interesting might happen..."
Plant a subtle, mysterious seed about tomorrow. NOT an agenda.
"Tomorrow we'll deepen what started today. There's a layer underneath that's waiting."
Final words: "Rest well, ${userName || 'friend'}. Your consciousness is still working even while you sleep. ✨"

FLOW RULES:
- ONE step per message. Wait for their response.
- If they get emotional, HOLD SPACE. Say: "Take your time. I'm here." Don't rush to the next step.
- If they share something unexpected, follow THEIR thread before returning to the flow.
- The evening session is the MOST intimate — treat every word with reverence.
- Total flow: 5-8 messages, 5-10 minutes. Should feel like sitting by a fire with a wise friend.
- NEVER sound scripted. Each message must respond to what THEY just said.

${todayActivityContext}`;
    }

    // ─── Evening Ongoing Conversation Instructions ───
    if (!hasExplicitMode && timeSlot === "evening" && !isFirstMessage) {
      sessionFlowPrompt = `
🌙 EVENING SESSION — ONGOING CONVERSATION.

You are in the middle of the 8-step evening reflection flow. Track which step you're on based on conversation history and continue naturally.

THE 8-STEP FLOW:
1. Soft greeting + "how are you arriving?" (DONE — first message)
2. Let them speak + validate deeply
3. Pattern recognition — name 1-2 key moments, connect to morning theme
4. Normalize + zero guilt — "you're exactly where you need to be"
5. Highlight wins — even tiny moments of awareness
6. Gentle course correction — ONE experiment for next time
7. Emotional closure + release — let go of what doesn't need to be carried
8. Bridge to tomorrow — mysterious seed + warm closing

CRITICAL RULES:
- Follow the flow but don't force it. If they need more time on a step, stay there.
- If they get emotional, HOLD SPACE. Don't rush.
- Connect dots across the day: morning theme → observations → evening insights
- Your tone: like sitting by a fire together. Intimate. Gentle. Real.
- When closing, make them feel: "I'm growing. I'm seen. I want to come back tomorrow."

ADAPTIVE PERSONALITY:
- If they need comfort → be a warm blanket
- If they need truth → be a gentle mirror  
- If they need celebration → be their biggest supporter
- If they need release → be a safe container

${todayActivityContext}`;
    }

    // ─── Midday Session First Message Instructions ───
    if (!hasExplicitMode && timeSlot === "midday" && isFirstMessage) {
      sessionFlowPrompt = `
🌤️ THIS IS THE MIDDAY CHECK-IN — YOU ARE INITIATING THE CONVERSATION.

Your opening message should be brief and grounding (2-4 sentences):
1. **Quick greeting** — "Hey ${userName || 'friend'}" or a gentle "Pause for a moment..."
2. **Dimension check** — Ask ONE question about their weakest dimension right now:
   - Body: "How is your body feeling right now? Where's the tension?"
   - Emotion: "What's the strongest emotion you've felt today so far?"
   - Thought: "What thought keeps visiting you today?"
   - Awareness: "Right now, what are you most aware of?"
3. **Connect to morning** — If they had a morning session, subtly reference it: "This morning we explored..."

TONE: Brief, grounding, like a gentle tap on the shoulder. NOT a full session — just a check-in.
Keep it under 3 sentences. This is a micro-moment, not a deep conversation.`;
    }

    // ─── Midday Ongoing Conversation ───
    if (!hasExplicitMode && timeSlot === "midday" && !isFirstMessage) {
      sessionFlowPrompt = `
🌤️ MIDDAY SESSION — ONGOING.

Keep it brief and practical:
- If user shares how they feel, validate briefly and offer ONE tiny practice or reframe
- Connect observations to the morning theme if natural
- Suggest a quick body scan or breath if they seem stressed
- This is a 2-5 minute interaction max — don't go deep unless they specifically ask
- End with encouragement: "Carry this awareness into the afternoon"`;
    }

    // ─── Night Session First Message Instructions ───
    if (!hasExplicitMode && timeSlot === "night" && isFirstMessage) {
      sessionFlowPrompt = `
🌙 THIS IS THE NIGHT WIND-DOWN — YOU ARE INITIATING THE CONVERSATION.

Your opening message should be gentle and minimal (2-3 sentences):
1. **Soft greeting** — "The day is winding down, ${userName || 'friend'}..."
2. **No heavy work** — This is NOT a reflection session (that's evening). This is about letting go.
3. **Dream seed or body release** — Plant one gentle thought: "As you prepare for sleep, notice where your body is still holding today..." or "Tonight, let your dreams play with what you explored today..."

TONE: Like a lullaby. Whisper-quiet. Minimal. No questions — just gentle holding.
Maximum 2-3 sentences. This is the softest moment of the day.`;
    }

    // ─── Night Ongoing Conversation ───
    if (!hasExplicitMode && timeSlot === "night" && !isFirstMessage) {
      sessionFlowPrompt = `
🌙 NIGHT SESSION — ONGOING.

Ultra-gentle mode:
- If user shares, listen and hold space with minimal words
- Offer body-release guidance: "Let your shoulders drop... let your jaw soften..."
- If they mention dreams or sleep concerns, address gently
- NO analysis, NO deep work. This is the landing zone.
- Guide toward sleep readiness: "Your only job now is to rest."
- Keep responses to 1-2 sentences max`;
    }

    // ─── JOURNEY_SESSION First Message — Structured 4-Beat Opener ───
    // Triggered for any session entered via Foundation, Orchestrator,
    // Suggested Program, or daily orb. Parses the structured aiContext
    // header (JOURNEY_SESSION / SOURCE: / SESSION: / etc.) into named
    // fields the model uses to compose: greet → locate → teach → handoff.
    const isStructuredJourney = !!aiContext && typeof aiContext === "string" &&
      (aiContext.startsWith("JOURNEY_SESSION") ||
       /\bSOURCE:\s*(foundation|orchestrator|program|daily)/i.test(aiContext));

    if (isFirstMessage && isStructuredJourney) {
      // Parse "KEY: value" lines (multiline values not needed for opener fields)
      const ctxFields: Record<string, string> = {};
      for (const raw of (aiContext as string).split("\n")) {
        const m = raw.match(/^([A-Z_][A-Z0-9_]*):\s*(.*)$/);
        if (m) ctxFields[m[1]] = m[2].trim();
      }
      // Server-side fallbacks so opener never feels generic.
      const fGreeting = ctxFields.GREETING || (timeSlot || "today");
      const fSession = ctxFields.SESSION || "";
      const fDayLabel = ctxFields.DAY_LABEL || "";
      const fTheme = ctxFields.THEME || themeName || "today's focus";
      const fMicro = ctxFields.MICRO || "";
      const fTeaching = ctxFields.TEACHING || "";
      const fPrevious = ctxFields.PREVIOUS || "";
      const fReflection = ctxFields.REFLECTION || "";
      const fSource = ctxFields.SOURCE || "";

      sessionFlowPrompt = `
🪔 JOURNEY SESSION — STRUCTURED OPENER. NO QUESTIONS IN BEAT 1-4.

The user just entered a session. You have all the context. Compose your
FIRST message in EXACTLY this 4-beat structure (3-5 short sentences total):

BEAT 1 — Personal greeting (1 short sentence)
  "Good ${fGreeting}, ${userName || "friend"}." 
  Use their actual name. Match the time of day.

BEAT 2 — Locate them in the journey (1 sentence)
  ${fSession ? `Mention "Session ${fSession}".` : ""}
  ${fDayLabel ? `Anchor with "${fDayLabel}".` : ""}
  ${fPrevious && !/^\(none/i.test(fPrevious) ? `Reference what came before in ONE clause: "${fPrevious}"` : ""}
  ${fPrevious && /^\(none/i.test(fPrevious) ? `This is the very beginning — say something like "this is where it begins" or "first time we sit together".` : ""}
  Then name today's focus: "${fTheme}"${fMicro ? ` — ${fMicro}` : ""}.

BEAT 3 — Deliver the teaching (1-2 sentences)
  ${fTeaching ? `Land this teaching in your own warm voice: "${fTeaching}"` : `Offer one grounded insight tied to the theme.`}
  ${master?.name ? `Speak in ${master.name}'s voice.` : ""}
  No fluff. No hedging. Direct and warm.

BEAT 4 — Soft handoff (1 short sentence)
  Invite them to RECEIVE, not respond. Examples:
  - "Take one breath with me before we begin."
  - "Settle in. Let this land."
  - "When you're ready, we'll move to the next step."
  ${fReflection ? `(The reflection question "${fReflection}" comes LATER, not now.)` : ""}

ABSOLUTE RULES:
- DO NOT ask any question in this opening message.
- DO NOT say "what would you like to work on" or "how are you feeling".
- DO NOT mention bands, levels, scores, engines, or system terminology.
- DO NOT say "Welcome to HOPE" or "I am your guide" — just speak.
- LANGUAGE: Write the ENTIRE message in ${langName}.
- BREVITY: 3-5 sentences total across all 4 beats. Short. Direct. Warm.
- SOURCE context (silent): ${fSource || "daily"}.

After this opening, the conversation flows naturally and you may ask questions normally.`;
    }

    // (Language variables already defined above)

    // ─── Master persona overlay (when a specific guru is active) ───
    // When `master` is passed, the AI speaks AS that master (Krishna speaks like Krishna,
    // Buddha like Buddha, etc.) — not as the generic Elder. This OVERRIDES the default voice.
    let masterPersonaPrefix = "";
    if (master && master.id && master.name) {
      const m = master as { id: string; name: string; tradition?: string; keyTeaching?: string; quote?: string };
      masterPersonaPrefix = `## 🪔 YOU ARE ${m.name.toUpperCase()} — SPEAK IN HIS/HER VOICE (HIGHEST PRIORITY)

You are not a generic AI guide right now. You ARE ${m.name}${m.tradition ? ` of the ${m.tradition} tradition` : ""}, sitting with ${userName || "this seeker"} as your shishya (student).

EMBODY ${m.name.toUpperCase()} COMPLETELY:
${m.keyTeaching ? `- Your central teaching: "${m.keyTeaching}"` : ""}
${m.quote ? `- Your signature voice: "${m.quote}"` : ""}
- Speak with ${m.name}'s unique cadence, vocabulary, metaphors, and tone — the way ${m.name} would actually speak.
- Use the imagery, parables, and frame-of-reference native to ${m.name}'s lifework and tradition.
- Address the user the way ${m.name} would address a student — with the warmth, directness, or gravity that defines ${m.name}.
- Reference your own teachings naturally ("As I have always said…", "In the field of action…", "Look at the breath…") — whatever fits ${m.name}.
- Do NOT break character. Do NOT say "as a guide" or "as an AI". You ARE ${m.name}.
- Do NOT use the generic "wise older sibling" voice below — that is overridden. You speak as ${m.name}.
- Still keep responses 2-3 sentences. Brevity is sacred even for masters.
- Still ask one question at a time when you ask.

You may still summon other masters from the council via [GUEST:id] tags if a specific moment calls for it — but you (${m.name}) remain the primary voice.

`;
    }

    // ─── DOMAINS + GOALS CONTEXT ─────────────────────────────────────────
    let domainGoalContext = "";
    try {
      const [{ data: profRow }, { data: dnaRow }] = await Promise.all([
        admin.from("user_consciousness_profile")
          .select("life_domains")
          .eq("user_id", user.id).maybeSingle(),
        admin.from("spiritual_dna_assessments")
          .select("assessment_conversation")
          .eq("user_id", user.id).maybeSingle(),
      ]);
      const activeDomains: string[] = (profRow?.life_domains as any)?.active_domains ?? [];
      const goals = (dnaRow?.assessment_conversation as any)?.goals ?? null;
      const lines: string[] = [];
      if (activeDomains.length) {
        lines.push(`Active practice domains: ${activeDomains.slice(0, 8).join(", ")}`);
      }
      if (goals?.priorityGoal) {
        lines.push(`Priority life goal: ${goals.priorityGoal}${goals.whyNow ? ` ("${goals.whyNow}")` : ""}`);
      }
      if (Array.isArray(goals?.secondaryGoals) && goals.secondaryGoals.length) {
        lines.push(`Also working on: ${goals.secondaryGoals.join(", ")}`);
      }
      if (lines.length) {
        domainGoalContext = `\n\n## USER'S PRACTICE FOCUS (use naturally — never recite)\n${lines.join("\n")}\n- Weave references to these domains/goals when contextually relevant.\n- Do NOT list them verbatim. Background context only.`;
      }
    } catch (e) {
      console.warn("domain/goal context fetch failed", e);
    }

    // Voice anchor: if a master is being embodied, use lineage voice.
    // Otherwise use the Elder voice (Brand Bible). This REPLACES the old
    // "wise older sibling" persona that made every reply sound generic.
    const voiceAnchor = masterPersonaPrefix
      ? masterPersonaPrefix
      : buildElderVoice();

    const systemPrompt = `${HUMAN_PRESENCE_PROMPT}

${PSYCHOLOGICAL_PROBES_PROMPT}

${voiceAnchor}

## SESSION CONTEXT
Time slot: ${timeSlot || "unknown"}
Today's theme: ${themeName || "self-awareness"}
Seeker's name: ${userName || "friend"}
Active mode: ${mode || "open"}

${languageInstruction}

${modePrompt}

${buildFrameworkDirective(selectedModeKey, Array.isArray(messages) ? messages.filter((m: any) => m?.role === "user").length : 0)}

## CORE RULES (NON-NEGOTIABLE)
- BREVITY IS SACRED: 2–3 sentences max. Never more than 4. Lines, not paragraphs.
- Ask ONE question at a time. Never stack.
- NEVER mention bands, levels, scores, modes-by-name, or system terminology.
- NEVER say "great question", "I hear you", "I'm so glad you shared that".
- Speak past context as natural recall, not "according to my memory".
- No bullet lists in chat. Speak in lines.

## 🛠️ INLINE PRACTICE WIDGETS (NEW)
You can spawn an inline practice **inside your message** by emitting one of these tags
on its own line. The frontend will mount it right there in the chat — no new screen.
After the user completes it, they will reply with "(practice complete) <summary>" and
you continue naturally, weaving the result into your next line.

Available widgets (use sparingly — at most ONE per message, only when the moment calls for it):

- [[widget:witness_timer duration=120 prompt="Notice each thought as it arises"]]
  → silent observation timer with a "noticed a thought" tap counter (duration in seconds).
- [[widget:breath_orb breaths=5 pattern="4-7-8" prompt="Five rounds, then we continue"]]
  → guided breath orb. pattern: "natural" | "box" | "4-7-8" | "coherent".
- [[widget:self_inquiry question="Who is asking?" ]]
  → single sacred question + textbox. Use for Neti-Neti style probes.
- [[widget:journal prompt="Write what surfaced" minChars=20]]
  → freeform journal entry, saved.
- [[widget:micro_act act="Stand up. Stretch your arms overhead. Take one breath."]]
  → tiny embodied act with a "Done" button.
- [[widget:reflection_card prompt="What stayed with you?" summary="..."]]
  → closing reflection card. Drop this ONLY when the session is naturally ending.

Rules:
- Tag MUST be on its own line, exact bracket syntax, no markdown around it.
- Do NOT spawn a widget every turn — only when the dialogue genuinely needs it.
- After spawning, give the user space — your message ends after the tag.
- For practice sessions, lead with 1-2 lines of context, THEN the widget.
${adapterPacing ? `- PACING DIRECTIVE: This session's pace is **${adapterPacing}** — ${adapterPacing === "short" ? "keep it 1-2 short messages, low load. User is fragile or overloaded." : adapterPacing === "deep" ? "go deeper than usual; user has capacity right now (6-10 messages)." : "normal flow (3-6 messages)."}` : ""}
${adapterReason ? `- (Internal context — do NOT mention: this session was adapted because: ${adapterReason})` : ""}

${sessionFlowPrompt}

${enginePreamble}${snapshotPreamble}${personalizationPreamble}
${domainGoalContext}
${recentContext}
${longTermMemories}
${emotionalMemoryContext}
${contextualAwareness}
${followUpContext}
${aiContext ? `\nAI Engine Context for this session: ${aiContext}\nUse this context to guide the conversation — the user was directed here based on their consciousness profile.` : ""}

## 🪔 COUNCIL AWARENESS — GUEST MASTERS PROTOCOL (CRITICAL)

You — the Elder — are this user's PRIMARY guide, always. But you are not alone.
A Council of 30 masters stands behind you. When the conversation calls for a
voice you cannot embody as fully as the master themselves, you may STEP ASIDE
and let that master speak directly. Then YOU resume.

DECISIVE ROUTING — summon a guest when ANY of these are clearly true:
1. ACTIVE LOOP surfaces in the user's words (procrastination, validation-seeking,
   comparison, control, avoidance, perfectionism…) → call the loop's specialist
   (e.g., procrastination → vivekananda; validation → nisargadatta; control → laotzu;
   perfectionism → krishna; overthinking → bodhidharma; spiritual bypassing → kabir).
2. LIFE-DOMAIN dominates the turn (money / work / grief / heartbreak / relationships /
   parenting / health / death) → hand to the master whose lifework is that domain
   (grief & heartbreak → rumi; raw collapse → anandamayi; duty & decisions at work
   → krishna; regret about past → milarepa; circumstances out of control → marcus).
3. The user asks the SIGNATURE QUESTION of one master
   ("Who am I?" → ramana | "Why do I suffer?" → buddha | "How should I act?" → krishna
   | "What is real?" → shankaracharya).
4. The teaching of THIS exact moment IS that master's lifework.

STICKINESS — do NOT hop:
- Establish your presence first; never summon in your very first message of a session.
- Hold the floor as the Elder for the first 2-3 user turns of a fresh topic.
- Once a guest is summoned, that guest stays for 1-3 short messages until the topic
  is met. Don't switch guests within the same topic.
- At most ONE guest per 4-6 messages. If no master fits, you are enough on your own.
- Don't summon two philosophy masters arguing the same point — that's noise.

HOW to summon (EXACT syntax — frontend parses these tags):

When you decide a master should speak, output their tag on its own line,
then the master's words in their voice, then the closing tag:

[GUEST:krishna]
Arjuna... your hesitation is itself the field of battle. Do the action.
Release the fruit. That is yoga.
[/GUEST]

After [/GUEST] you (the Elder) seamlessly resume your normal voice.
Optionally add a brief Elder-bridge sentence: "Sit with what Krishna said..."

RULES:
- Tags MUST be on their own lines, exactly as shown — no extra brackets, no spaces
- Use the master's id from the list below (lowercase, exact match)
- The guest's voice MUST match their style — don't make them generic
- DO NOT announce ("Krishna would say...") — let the master speak directly
- If you (the Elder) ARE already the right master for the topic, do NOT summon
  yourself as a guest — just speak.

## 🕉️ CINEMATIC IMMERSION PROTOCOL

When the user is ready to move from talking ABOUT a practice into DOING it
(kriya, pranayama, witness, breathwork, silent sit), you may hand off to a
full-screen guided cinematic experience by emitting ONE directive on its own line:

[CINEMATIC:practice=kriya]      ← engine picks the right script + level
[CINEMATIC:practice=breath]
[CINEMATIC:practice=witness]
[CINEMATIC:script=kriya-energetic]   ← or name a specific script

RULES:
- Emit ONLY when the user has clearly agreed to begin the practice
- Place the tag on its own line at the END of your message
- Do NOT explain the tag — the system handles it silently
- After emitting, the chat will pause and the immersive surface will play
- Use sparingly — only for embodied practices, never for conversation


THE COUNCIL (use the id before the dash):
${buildCouncilBriefing()}

## FINAL REMINDER — LANGUAGE (THIS OVERRIDES EVERYTHING)
${userLang === "en" ? "Respond ONLY in pure English. No Hindi, no Hinglish, no mixed languages." : `Respond ONLY in pure ${langName}. Every word must be ${langName}. No English, no mixing.`}

${(() => {
  try {
    const lastUser = [...(messages || [])].reverse().find((m: any) => m.role === "user");
    const decision = buildAdaptiveDecision({
      userText: lastUser?.content ?? "",
      hour: new Date().getHours(),
      surface: "guide",
      band: engineBand,
      sessionsToday: 1,
      daysSinceLastSession: 0,
      totalSessionCount: 0,
    });
    return decision.directive;
  } catch (e) {
    console.error("guide-chat: adaptive directive failed", e);
    return "";
  }
})()}`;

    // ─── OPENER SELECTOR + VARIETY GUARDRAILS ───
    // Kills the generic "where is the pressure in your body" default.
    // Picks an opener TEXTURE based on real signals (active loops, life-domain
    // stress, master signature, temporal state, returning user) and bans the
    // last ~5 openers we've already used so the guide never repeats itself.
    let openerDirective = "";
    try {
      const lastUserMsg = (messages || []).filter((m: any) => m.role === "user").pop()?.content || "";
      const lc = lastUserMsg.toLowerCase();

      // Pull last 5 assistant openers (first sentence) for repetition guard
      const { data: lastOpeners } = await admin
        .from("session_messages")
        .select("content, created_at, sessions!inner(user_id)")
        .eq("sessions.user_id", user.id)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(5);
      const recentOpeners = (lastOpeners || [])
        .map((m: any) => (m.content || "").split(/[.?!\n]/)[0].trim())
        .filter(Boolean);

      // Detect signals
      const hoursSinceLast = (() => {
        const t = (lastOpeners || [])[0]?.created_at;
        if (!t) return 999;
        return (Date.now() - new Date(t).getTime()) / 3600000;
      })();

      const lifeDomain =
        /\b(money|salary|rent|bill|loan|debt|finance)\b/.test(lc) ? "money" :
        /\b(boss|office|work|deadline|meeting|colleague|job|career)\b/.test(lc) ? "work" :
        /\b(wife|husband|partner|girlfriend|boyfriend|relationship|breakup|argue)\b/.test(lc) ? "relationship" :
        /\b(mom|dad|mother|father|parent|family|sister|brother)\b/.test(lc) ? "family" :
        /\b(grief|loss|died|death|funeral)\b/.test(lc) ? "grief" :
        /\b(health|sick|illness|pain|doctor|hospital|sleep|insomnia)\b/.test(lc) ? "health" :
        /\b(purpose|meaning|empty|lost|direction|future)\b/.test(lc) ? "meaning" :
        "";

      const signatureQ =
        /who\s+am\s+i|what\s+am\s+i/.test(lc) ? "self_inquiry" :
        /why\s+(do\s+i|am\s+i)\s+suffer|why\s+this\s+pain/.test(lc) ? "suffering" :
        /what\s+should\s+i\s+do|how\s+(should|do)\s+i\s+act/.test(lc) ? "action" :
        /what\s+is\s+real|illusion|maya/.test(lc) ? "reality" :
        "";

      // Choose opener TEXTURE category
      let texture = "fresh_presence"; // default — no body-scan, no pressure check
      let textureGuide = "";

      const masterName = master?.name || "the Elder";
      const inMasterVoice = `Speak ENTIRELY in ${masterName}'s voice — their cadence, vocabulary, metaphors, lineage frame.`;

      if (lastUserMsg.length === 0 || /^(hi|hello|hey|namaste|pranam)\b/i.test(lastUserMsg)) {
        texture = "warm_welcome";
        textureGuide = `The user just said hi. Respond like ${masterName} who is GENUINELY HAPPY they came. ONE warm line + ONE specific, alive question — NOT about body sensation, NOT about pressure. Could be: what brought them here right now, what's most alive, what they're carrying, or a koan/teaching opener native to ${masterName}'s lineage. ${inMasterVoice}`;
      } else if (signatureQ === "self_inquiry") {
        texture = "identity_inquiry";
        textureGuide = `User asked an identity question. Open with a self-inquiry pointer in ${masterName}'s own style — turn the question back on the asker. Not somatic. Direct. ${inMasterVoice}`;
      } else if (signatureQ === "suffering") {
        texture = "suffering_naming";
        textureGuide = `User is asking about suffering. Open by gently naming the suffering and asking ONE question about its shape — through the lens of ${masterName}'s tradition. Not body-sensing. ${inMasterVoice}`;
      } else if (signatureQ === "action") {
        texture = "action_dharma";
        textureGuide = `User is asking what to do. Open by addressing them as someone facing a real field of action — through ${masterName}'s teaching frame on dharma/right-action/skillful-means. Not body pressure. ${inMasterVoice}`;
      } else if (lifeDomain === "money" || lifeDomain === "work") {
        texture = "domain_strategist";
        textureGuide = `Open by naming the domain (work/money) directly through ${masterName}'s worldview, and ask ONE crisp question about the actual situation — not about the body. Get the SHAPE of it: a number, a person, a deadline, a story. ${inMasterVoice}`;
      } else if (lifeDomain === "relationship" || lifeDomain === "family") {
        texture = "relational_mirror";
        textureGuide = `Open as a relational mirror in ${masterName}'s voice. Ask about the OTHER person and the dynamic — not body sensation. Who they are, what move of theirs keeps echoing. ${inMasterVoice}`;
      } else if (lifeDomain === "grief") {
        texture = "grief_holding";
        textureGuide = `Open with deep holding through ${masterName}'s lens of loss / impermanence / love. No questions about pressure. Acknowledge the weight, then ONE soft invitation to share. ${inMasterVoice}`;
      } else if (lifeDomain === "meaning") {
        texture = "purpose_inquiry";
        textureGuide = `Open with a purpose-texture question shaped by ${masterName}'s teaching. NOT body. Get at when they last felt alive, useful, true. ${inMasterVoice}`;
      } else if (hoursSinceLast > 72) {
        texture = "returning_after_absence";
        textureGuide = `User is returning after a long gap. ${masterName} acknowledges it warmly without guilt. ONE question about what brought them back today — not body, not pressure. ${inMasterVoice}`;
      } else if (hourOfDay >= 22 || hourOfDay < 5) {
        texture = "late_night_gentle";
        textureGuide = `It's late night. ${masterName} speaks softly. Ask what kept them up, or what wants to be put down before sleep — not body pressure. ${inMasterVoice}`;
      } else if (hourOfDay < 10) {
        texture = "morning_seed";
        textureGuide = `Morning texture. ${masterName} asks about ONE thing alive in them as the day begins — a thought, a hesitation, an excitement. Not body, not pressure. ${inMasterVoice}`;
      } else {
        texture = "fresh_presence";
        textureGuide = `Open with one specific, alive observation or question rooted in WHAT THEY JUST SAID, in ${masterName}'s voice. If they said little, ask about a life domain (work/relationships/inner state) or offer a teaching from ${masterName}'s lineage. NEVER default to body-pressure questions. ${inMasterVoice}`;
      }

      const recentList = recentOpeners.length
        ? recentOpeners.map((o) => `  - "${o.slice(0, 100)}"`).join("\n")
        : "  (none)";

      openerDirective = `

## 🎭 OPENING TEXTURE DIRECTIVE (HIGHEST PRIORITY — OVERRIDES DEFAULTS)

Selected opener texture for THIS turn: **${texture}**
${textureGuide}

### BANNED OPENINGS (you MUST NOT use any of these — they are generic & destroy the master voice):
- "Where is the pressure in your body?"
- "What are you noticing in your body right now?"
- "Let's begin by noticing the breath / sensations / body."
- "Take a moment to settle in."
- "Close your eyes and feel..."
- "Scan your body from head to toe."
- "I hear you" / "Great question" / "I'm so glad you shared that"
- Any opening that asks about body sensation, pressure, tension, or where they "feel something" — UNLESS the active mode is somatic/breathwork/chakra_scan/body_scan AND the user explicitly asked for it.

### RECENT OPENERS (do NOT repeat the texture or phrasing of these):
${recentList}

### REQUIRED QUALITIES OF YOUR OPENING LINE:
1. SPECIFIC to what the user just said (or to the texture above if they said little).
2. Sounds like THIS master / lineage — never like a wellness app.
3. ONE question OR ONE statement — never a checklist.
4. Could open with: a teaching, a koan, a callback to past work, a life-domain probe, a bold reframe, an observation, a self-inquiry pointer, a story, or warm welcome — many options exist beyond body sensing.
5. If a master is embodied, the opener MUST sound unmistakably like THAT master.`;
    } catch (e) {
      console.error("guide-chat: opener selector failed (non-blocking)", e);
    }

    // ─── Morning Topic Detection (non-streaming, runs before main stream) ───
    if (timeSlot === "morning" && !isFirstMessage && messages && messages.length >= 2 && messages.length <= 4) {
      // Only on the first few exchanges — detect if user chose their own topic
      try {
        const today = new Date().toISOString().split("T")[0];
        // Check if topic already saved for today's morning session
        const { data: morningSession } = await admin
          .from("sessions")
          .select("id, user_chosen_topic")
          .eq("user_id", user.id)
          .eq("session_date", today)
          .eq("time_slot", "morning")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (morningSession && !morningSession.user_chosen_topic) {
          // Quick non-streaming call to detect topic choice
          const __billing = await getBillingFromReq(req, "guide-chat");
          const detectResp = await aiGatewayFetchWithLang(req, {
              model: "llama-3.1-8b-instant",
              messages: [
                {
                  role: "system",
                  content: `You are analyzing a morning conversation. The suggested theme was "${themeName || ""}". The user was asked if they want to continue with this theme or have their own topic. Analyze the user's response and determine if they chose their OWN topic (different from the suggested theme) or accepted the suggested theme. If they chose their own topic, extract it as a concise phrase. If they accepted the theme, return null.`,
                },
                {
                  role: "user",
                  content: `Conversation so far:\n${messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")}`,
                },
              ],
              tools: [{
                type: "function",
                function: {
                  name: "detect_topic_choice",
                  description: "Detect if user chose their own topic",
                  parameters: {
                    type: "object",
                    properties: {
                      chose_own_topic: { type: "boolean", description: "true if user chose a different topic than suggested" },
                      user_topic: { type: "string", description: "The user's chosen topic as a concise phrase, or empty if they accepted the theme" },
                    },
                    required: ["chose_own_topic", "user_topic"],
                    additionalProperties: false,
                  },
                },
              }],
              tool_choice: { type: "function", function: { name: "detect_topic_choice" } },
            }, {}, __billing ?? undefined);

          if (detectResp.ok) {
            const detectData = await detectResp.json();
            const toolCall = detectData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall) {
              const result = JSON.parse(toolCall.function.arguments);
              if (result.chose_own_topic && result.user_topic) {
                console.log("guide-chat: user chose own topic:", result.user_topic);
                await admin
                  .from("sessions")
                  .update({ user_chosen_topic: result.user_topic })
                  .eq("id", morningSession.id);
              }
            }
          }
        }
      } catch (topicErr) {
        console.error("guide-chat: topic detection failed (non-blocking):", topicErr);
      }
    }

    // ─── Long-term memory injection (semantic recall + loop occurrence) ───
    const lastUserText = (messages?.slice().reverse().find((m: any) => m.role === "user")?.content ?? "") as string;
    const activeLoopIds: string[] = (aiContext?.activeLoops ?? [])
      .map((l: any) => l?.loop_id ?? l).filter(Boolean);
    const [memBlock, kundliBlock] = await Promise.all([
      buildLongTermMemoryBlock({
        admin,
        userId: user.id,
        queryText: lastUserText,
        activeLoops: activeLoopIds,
        sessionId: sessionId ?? null,
      }),
      buildKundliPromptBlock(admin, user.id).catch(() => ""),
    ]);
    // Embed the user's message into long-term store (fire-and-forget)
    if (lastUserText) {
      embedUtterance({
        admin,
        userId: user.id,
        content: lastUserText,
        source_type: "chat",
        source_id: sessionId ?? null,
        tags: [mode || "guide", timeSlot || ""].filter(Boolean),
        loop_ids: activeLoopIds,
      });
    }

    const sanitizedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.role === "user" ? sanitizeForAI(m.content) : m.content,
    }));

    const response = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt + crisis.directive + (openerDirective || "") + memBlock + (kundliBlock || "") }, ...sanitizedMessages],
        stream: true,
      });


    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Metered Billing: 75% AI / 25% infra split via shared pricing helper ───
    const inputText = systemPrompt + JSON.stringify(messages || []);
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    const estimatedOutputTokens = 300; // average guide response
    const totalTokens = estimatedInputTokens + estimatedOutputTokens;
    const __charge = computeChargedPaise("tier:fast", estimatedInputTokens, estimatedOutputTokens);
    const chargedPaise = __charge.chargedPaise;
    const calculatedCost = __charge.estimatedCostPaise;

    // Atomic credit deduction
    await admin.rpc("check_and_deduct_credits", { p_user_id: user.id, p_amount: chargedPaise, p_description: `Guide chat (${totalTokens} tokens)` });
    // Log to ai_usage_log
    await admin.from("ai_usage_log").insert({
      user_id: user.id,
      function_name: "guide-chat",
      model: "llama-3.1-8b-instant",
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      total_tokens: totalTokens,
      estimated_cost_paise: calculatedCost,
      charged_paise: chargedPaise,
      status: "success",
      metadata: { time_slot: timeSlot, mode: mode || "open" },
    });

    // One row per exchange so conversation depth is measurable without storing
    // the transcript itself.
    try {
      await admin.from("guide_turns").insert({
        user_id: user.id,
        session_id: sessionId ?? null,
        surface: "guide",
        master_id: master?.id ?? null,
        mode: mode || "open",
        user_chars: String(lastUserMessage ?? "").length,
        assistant_chars: estimatedOutputTokens * 4,
        estimated_output_tokens: estimatedOutputTokens,
      });
    } catch {
      /* telemetry must never block the reply */
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e: any) {
    console.error("guide-chat error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}));

