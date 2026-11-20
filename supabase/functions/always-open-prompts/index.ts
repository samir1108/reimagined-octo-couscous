import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ALWAYS-OPEN PROMPTS — v2 (30+ modes, journey-aware)
 *
 * Off-rhythm engine: when no session is being pushed, we still offer 3 contextual
 * "doors". Now scores across 30+ modes using:
 *   - consciousness band + state + streak + journey_day
 *   - app relationship phase (newcomer / explorer / committed / deep / sage)
 *   - today's mood/energy + last evening reflection
 *   - active loops (severity + count)
 *   - recent regression / breakthrough events
 *   - life domain stressors / strengths
 *   - dimension scores (head/heart/gut/body/awareness)
 *   - recent journal sentiment + heavy-emotion words
 *   - time of day (early morning, late night, midday, evening)
 *   - whether morning/midday/evening completed today
 */

type Mode =
  // Emotional / support
  | "emotional_support"
  | "grief_holding"
  | "anxiety_soothing"
  | "anger_release"
  | "loneliness"
  | "shame_compassion"
  // Pattern / behavior
  | "observation"
  | "loop_witnessing"
  | "trigger_mapping"
  | "autopilot_check"
  | "reactivity_pause"
  // Inquiry / depth
  | "self_inquiry"
  | "identity_question"
  | "witness_presence"
  | "non_doing"
  | "silence"
  // Positive / integration
  | "gratitude"
  | "celebration"
  | "integration"
  | "breakthrough_anchor"
  | "values_alignment"
  // Body / energy
  | "rest"
  | "body_scan"
  | "breath_anchor"
  | "energy_reset"
  // Relational / domain
  | "relationships"
  | "work_balance"
  | "creative_play"
  | "purpose_check"
  // Time-of-day / journey
  | "morning_intention"
  | "evening_close"
  | "midday_reset"
  | "late_night_settle"
  | "newcomer_welcome"
  | "deep_practitioner"
  // Default
  | "reflection";

type Surface = "journal" | "guide" | "inquiry";

interface Card {
  mode: Mode;
  surface: Surface;
  label: string;
  prompt: string;
  cta: string;
  route: string;
  reason: string;
}

const PROMPT_BANK: Record<Mode, { journal: string[]; guide: string[]; inquiry: string[] }> = {
  emotional_support: {
    journal: [
      "What feeling is asking for your attention right now — without trying to fix it?",
      "If this emotion could speak in one sentence, what would it say?",
      "Where in your body is this living? Describe it like a weather pattern.",
    ],
    guide: ["Something heavy is here and I'd like to talk it through.", "I'm not okay right now. Help me sit with this."],
    inquiry: ["Who is the one feeling this — and is that one also a feeling?"],
  },
  grief_holding: {
    journal: [
      "What loss are you still carrying that hasn't been fully named?",
      "If grief had a shape today, what would it look like?",
    ],
    guide: ["I'm grieving something. Can you sit with me?"],
    inquiry: ["What remains, when grief is allowed to simply be?"],
  },
  anxiety_soothing: {
    journal: [
      "What is your anxiety trying to protect you from?",
      "Name three things you can sense right now — without judging them.",
    ],
    guide: ["My mind is racing. Help me slow down.", "I'm anxious. Can we ground together?"],
    inquiry: ["Where exactly is this anxiety — and is the one watching it also anxious?"],
  },
  anger_release: {
    journal: [
      "What is your anger pointing toward — what boundary or value?",
      "If your anger could write one honest sentence, what would it say?",
    ],
    guide: ["I'm angry and I don't want to act on it. Help me unpack it."],
    inquiry: ["Who is the one watching this anger rise?"],
  },
  loneliness: {
    journal: [
      "What kind of company are you actually missing right now?",
      "When did you last feel truly seen — and by whom?",
    ],
    guide: ["I feel alone. I'd like to be heard."],
    inquiry: ["Is the one who feels lonely ever actually alone with itself?"],
  },
  shame_compassion: {
    journal: [
      "What part of yourself are you hiding today, even from you?",
      "Write one sentence to yourself the way a kind friend would.",
    ],
    guide: ["There's something I'm ashamed of. Help me look at it gently."],
    inquiry: ["Who is the one judging — and who is the one being judged?"],
  },
  observation: {
    journal: [
      "What pattern did you catch yourself in today — even briefly?",
      "Where did you go on autopilot? What was the trigger?",
    ],
    guide: ["I keep noticing the same pattern. Help me look at it."],
    inquiry: ["Who is the one watching this pattern — and are they caught in it too?"],
  },
  loop_witnessing: {
    journal: [
      "Describe the loop you keep returning to — without trying to solve it.",
      "What does this loop give you that you're not getting elsewhere?",
    ],
    guide: ["A pattern keeps repeating. Can we map it together?"],
    inquiry: ["What watches the loop, and is itself untouched by it?"],
  },
  trigger_mapping: {
    journal: [
      "What set you off today — and what did it remind you of?",
      "Trace one reaction back to its root. Where does it actually begin?",
    ],
    guide: ["Something triggered me. Help me trace it back."],
    inquiry: ["Is the trigger out there — or is it the meeting of out there with something in here?"],
  },
  autopilot_check: {
    journal: [
      "Where in today did you 'wake up' and realize you'd been gone?",
      "What were you doing on autopilot just before opening this app?",
    ],
    guide: ["I've been on autopilot. Help me re-enter."],
    inquiry: ["Who is the one who notices autopilot? Were they ever asleep?"],
  },
  reactivity_pause: {
    journal: ["What reaction are you holding back right now? What's underneath it?"],
    guide: ["I'm about to react and I don't want to. Hold space with me."],
    inquiry: ["Between stimulus and response — what is here?"],
  },
  self_inquiry: {
    journal: ["If 'I' is just a thought, who is reading these words?"],
    guide: ["I want to go deeper into the question of who I really am."],
    inquiry: [
      "Who is the one experiencing this moment?",
      "What is here, before any thought about what is here?",
      "Where exactly does the 'I' you keep referring to live?",
    ],
  },
  identity_question: {
    journal: ["What story about yourself are you most attached to today?"],
    guide: ["I want to question who I think I am."],
    inquiry: ["Is the one who thinks 'I am this' the same as the 'this' it points to?"],
  },
  witness_presence: {
    journal: ["What is being seen right now — and what is doing the seeing?"],
    guide: ["Help me rest as the witness."],
    inquiry: ["Can the witness be witnessed?"],
  },
  non_doing: {
    journal: ["What would happen if for one breath you did absolutely nothing?"],
    guide: ["I want to practice doing nothing for a moment."],
    inquiry: ["What is here when no doing is happening?"],
  },
  silence: {
    journal: ["What does silence sound like to you right now?"],
    guide: ["I'd like to sit in silence together."],
    inquiry: ["Is the silence in you, or are you in the silence?"],
  },
  gratitude: {
    journal: [
      "What three small things made today bearable — or beautiful?",
      "Who or what carried you today, even invisibly?",
    ],
    guide: ["Something good happened and I want to mark it."],
    inquiry: ["Who is the one who feels grateful — and what is this gratitude pointing to?"],
  },
  celebration: {
    journal: ["What win — even tiny — deserves to be named today?"],
    guide: ["I want to celebrate something quietly."],
    inquiry: ["Can joy itself be the practice right now?"],
  },
  integration: {
    journal: ["What shifted in you recently that you haven't named yet?"],
    guide: ["Something is integrating in me. Help me put words to it."],
    inquiry: ["Is the one who shifted, the same as the one who was stuck?"],
  },
  breakthrough_anchor: {
    journal: ["What insight from this week do you want to live tomorrow?"],
    guide: ["I had a small breakthrough. Can we make it stick?"],
    inquiry: ["What is the simplest form of what you just saw?"],
  },
  values_alignment: {
    journal: ["What did you do today that was aligned with who you actually want to be?"],
    guide: ["I want to check if my life is matching my values."],
    inquiry: ["Who is the one choosing — and what does it most want?"],
  },
  rest: {
    journal: ["Where can you offer yourself permission to do less tomorrow?"],
    guide: ["I'm tired. Help me close the day gently."],
    inquiry: ["Can rest itself be the practice tonight?"],
  },
  body_scan: {
    journal: ["Where in your body is holding the most today? What is it carrying?"],
    guide: ["Can you walk me through a quick body check?"],
    inquiry: ["Is the body something you have, or something you are?"],
  },
  breath_anchor: {
    journal: ["Describe the quality of your breath right now in one line."],
    guide: ["Help me come back to breath for a moment."],
    inquiry: ["Who breathes — you, or something through you?"],
  },
  energy_reset: {
    journal: ["What is draining you today that you could put down — even briefly?"],
    guide: ["I'm depleted. Help me reset without forcing."],
    inquiry: ["What remains, when the draining stops being resisted?"],
  },
  relationships: {
    journal: ["Which relationship is asking for your attention this week?"],
    guide: ["Something with someone close is on my mind."],
    inquiry: ["Who is the 'I' that meets the other?"],
  },
  work_balance: {
    journal: ["Where did work spill into life today in a way you didn't choose?"],
    guide: ["Work feels heavy. Help me see it more clearly."],
    inquiry: ["Who is the one working — and is that one ever off the clock?"],
  },
  creative_play: {
    journal: ["What would you make today if no one would ever see it?"],
    guide: ["I want to play with an idea. Will you play with me?"],
    inquiry: ["What creates, when you are not trying to create?"],
  },
  purpose_check: {
    journal: ["If today was the only day, what mattered most in it?"],
    guide: ["I want to talk about what I'm here for."],
    inquiry: ["Who is the one searching for purpose?"],
  },
  morning_intention: {
    journal: ["What is the one quality you want to carry into today?"],
    guide: ["Help me set the tone for today."],
    inquiry: ["What is here, before today begins?"],
  },
  evening_close: {
    journal: ["If today was a sentence, what would it say?"],
    guide: ["Help me close today consciously."],
    inquiry: ["What of today can you let go of, right now?"],
  },
  midday_reset: {
    journal: ["What does the rest of today need from you, that the morning didn't?"],
    guide: ["The day got away from me. Help me re-center."],
    inquiry: ["Where is now, in the middle of all this doing?"],
  },
  late_night_settle: {
    journal: ["What is your mind still chewing on, that it could place down?"],
    guide: ["I can't quite land. Help me settle."],
    inquiry: ["Can you sleep as the awareness, not as the one trying to sleep?"],
  },
  newcomer_welcome: {
    journal: ["What brought you here? Write it as if you're meeting yourself."],
    guide: ["I'm new to this. Where do I even start?"],
    inquiry: ["What were you looking for when you opened this app?"],
  },
  deep_practitioner: {
    journal: ["What edge are you avoiding in your practice right now?"],
    guide: ["I want to go past where I've been getting stuck."],
    inquiry: ["What is the subtlest thing you can notice right now?"],
  },
  reflection: {
    journal: [
      "What is alive in you right now — without naming it good or bad?",
      "What did today try to teach you that you didn't want to hear?",
    ],
    guide: ["I want to talk about something that's been on my mind."],
    inquiry: ["What is here, before any thought about what is here?"],
  },
};

const LABELS: Record<Mode, string> = {
  emotional_support: "Emotional support",
  grief_holding: "Holding grief",
  anxiety_soothing: "Soothe anxiety",
  anger_release: "Meet anger",
  loneliness: "With loneliness",
  shame_compassion: "Compassion for shame",
  observation: "Observation",
  loop_witnessing: "Witness the loop",
  trigger_mapping: "Map the trigger",
  autopilot_check: "Autopilot check",
  reactivity_pause: "Pause the reaction",
  self_inquiry: "Self-inquiry",
  identity_question: "Question identity",
  witness_presence: "Rest as witness",
  non_doing: "Non-doing",
  silence: "Sit in silence",
  gratitude: "Gratitude",
  celebration: "Celebrate quietly",
  integration: "Integration",
  breakthrough_anchor: "Anchor the shift",
  values_alignment: "Values check",
  rest: "Rest & close",
  body_scan: "Body scan",
  breath_anchor: "Breath anchor",
  energy_reset: "Energy reset",
  relationships: "Relationships",
  work_balance: "Work & life",
  creative_play: "Creative play",
  purpose_check: "Purpose check",
  morning_intention: "Set the tone",
  evening_close: "Close the day",
  midday_reset: "Midday reset",
  late_night_settle: "Settle for sleep",
  newcomer_welcome: "Begin gently",
  deep_practitioner: "Edge practice",
  reflection: "Reflection",
};

const REASONS: Record<Mode, string> = {
  emotional_support: "Heavy feeling detected — let's hold it gently",
  grief_holding: "Loss is in the air",
  anxiety_soothing: "Mind seems to be racing",
  anger_release: "Heat is moving — meet it",
  loneliness: "A felt sense of being alone",
  shame_compassion: "A tender corner asking for kindness",
  observation: "An active pattern is asking to be seen",
  loop_witnessing: "A loop is repeating — witness it",
  trigger_mapping: "Something got activated recently",
  autopilot_check: "Signs of disengagement",
  reactivity_pause: "High reactivity in the field",
  self_inquiry: "You're steady — a good moment to go deeper",
  identity_question: "Ripe to question the 'I'",
  witness_presence: "Witness is available now",
  non_doing: "Permission to stop",
  silence: "Words can rest",
  gratitude: "Things are flowing — anchor it",
  celebration: "Something is going well",
  integration: "Something shifted — let it land",
  breakthrough_anchor: "A breakthrough is fresh",
  values_alignment: "Time to check the compass",
  rest: "Energy is low — softness is the practice",
  body_scan: "The body is talking",
  breath_anchor: "Come back to breath",
  energy_reset: "Battery is low",
  relationships: "Relational signal in your week",
  work_balance: "Work is showing up heavy",
  creative_play: "Space for play",
  purpose_check: "A meaning check feels right",
  morning_intention: "The day is fresh",
  evening_close: "Day is winding down",
  midday_reset: "Mid-day pause",
  late_night_settle: "It's late — settle",
  newcomer_welcome: "You're early in the journey",
  deep_practitioner: "You've been at this a while",
  reflection: "An open moment to check in with yourself",
};

const SURFACE_FOR: Record<Mode, Surface> = {
  emotional_support: "guide",
  grief_holding: "guide",
  anxiety_soothing: "guide",
  anger_release: "guide",
  loneliness: "guide",
  shame_compassion: "guide",
  observation: "journal",
  loop_witnessing: "journal",
  trigger_mapping: "journal",
  autopilot_check: "journal",
  reactivity_pause: "inquiry",
  self_inquiry: "inquiry",
  identity_question: "inquiry",
  witness_presence: "inquiry",
  non_doing: "inquiry",
  silence: "inquiry",
  gratitude: "journal",
  celebration: "journal",
  integration: "journal",
  breakthrough_anchor: "journal",
  values_alignment: "journal",
  rest: "journal",
  body_scan: "guide",
  breath_anchor: "guide",
  energy_reset: "journal",
  relationships: "guide",
  work_balance: "guide",
  creative_play: "journal",
  purpose_check: "guide",
  morning_intention: "journal",
  evening_close: "journal",
  midday_reset: "journal",
  late_night_settle: "guide",
  newcomer_welcome: "journal",
  deep_practitioner: "inquiry",
  reflection: "journal",
};

function pickByDay<T>(arr: T[], offset = 0): T {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + offset;
  return arr[Math.abs(day) % arr.length];
}

function buildCard(mode: Mode, surface: Surface, offset = 0): Card {
  const bank = PROMPT_BANK[mode][surface] ?? PROMPT_BANK[mode].journal;
  const prompt = pickByDay(bank, offset);
  const route =
    surface === "journal"
      ? `/app/journal?prompt=${encodeURIComponent(prompt)}&source=always_open&mode=${mode}`
      : surface === "guide"
      ? `/app/guide?seed=${encodeURIComponent(prompt)}&source=always_open&mode=${mode}`
      : `/app/guide?seed=${encodeURIComponent(prompt)}&mode=self_inquiry&source=always_open&intent=${mode}`;
  return {
    mode,
    surface,
    label: LABELS[mode],
    prompt,
    cta:
      surface === "journal" ? "Write" : surface === "guide" ? "Open conversation" : "Sit with this",
    route,
    reason: REASONS[mode],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Gather lightweight signals ───
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [
      { data: cons },
      { data: todayCtx },
      { data: recentEvenings },
      { data: activeLoops },
      { data: recentJournals },
      { data: regressions },
      { data: appPhase },
      { data: domains },
      { data: dimensions },
      { data: predictiveSignals },
    ] = await Promise.all([
      admin
        .from("user_consciousness_profile")
        .select("overall_band, state, streak_current, journey_day")
        .eq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("daily_user_context")
        .select("mood_score, energy_score, morning_completed, midday_completed, evening_completed")
        .eq("user_id", user.id)
        .eq("session_date", today)
        .maybeSingle(),
      admin
        .from("evening_reflections")
        .select("mood, energy, reflection_date")
        .eq("user_id", user.id)
        .order("reflection_date", { ascending: false })
        .limit(3),
      admin
        .from("user_loops")
        .select("severity, status, loop_id")
        .eq("user_id", user.id)
        .in("status", ["active", "aware"])
        .order("severity", { ascending: false })
        .limit(5),
      admin
        .from("journal_entries")
        .select("mood, content, created_at")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(5),
      admin
        .from("regression_events")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo)
        .limit(3),
      admin
        .from("app_relationship_depth")
        .select("phase, days_known, trust_score")
        .eq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("life_domain_scores")
        .select("domain, score, trend, stressors, strengths")
        .eq("user_id", user.id),
      admin
        .from("daily_dimension_summary")
        .select("awareness_score, body_score, emotion_score, thought_score, summary_date")
        .eq("user_id", user.id)
        .order("summary_date", { ascending: false })
        .limit(1),
      admin
        .from("predictive_signals")
        .select("signal_type, severity, detected_at")
        .eq("user_id", user.id)
        .gte("detected_at", thirtyDaysAgo)
        .limit(5),
    ]);

    const band = cons?.overall_band ?? 0;
    const state = cons?.state ?? "normal";
    const streak = cons?.streak_current ?? 0;
    const journeyDay = cons?.journey_day ?? 0;
    const phase = appPhase?.phase ?? "newcomer";
    const daysKnown = appPhase?.days_known ?? 0;

    const hour = now.getHours();
    const isEarlyMorning = hour >= 5 && hour < 9;
    const isMidday = hour >= 11 && hour < 15;
    const isEvening = hour >= 18 && hour < 22;
    const isLateNight = hour >= 22 || hour < 5;

    const todayMood = todayCtx?.mood_score ?? null;
    const todayEnergy = todayCtx?.energy_score ?? null;
    const lastEveningMood = recentEvenings?.[0]?.mood ?? null;
    const lastEveningEnergy = recentEvenings?.[0]?.energy ?? null;
    const effectiveMood = todayMood ?? lastEveningMood;
    const effectiveEnergy = todayEnergy ?? lastEveningEnergy;

    const topLoopSeverity = (activeLoops?.[0] as any)?.severity ?? 0;
    const loopCount = activeLoops?.length ?? 0;
    const hadRecentRegression = (regressions?.length ?? 0) > 0;

    // Heavy emotion detection in last journal
    const lastJournalText = (recentJournals?.[0]?.content ?? "").toLowerCase();
    const emotionFlags = {
      grief: /\b(loss|grief|gone|miss(ed|ing)?|died|death|mourn)\b/.test(lastJournalText),
      anxiety: /\b(anx|worry|worried|panic|racing|overthink|spiral)\b/.test(lastJournalText),
      anger: /\b(angry|anger|furious|rage|pissed|annoyed|resent)\b/.test(lastJournalText),
      loneliness: /\b(lonely|alone|isolated|disconnect|no one)\b/.test(lastJournalText),
      shame: /\b(ashamed|shame|guilt|guilty|stupid|worthless|broken)\b/.test(lastJournalText),
      tired: /\b(exhausted|tired|drained|empty|burn(t|ed) out|depleted)\b/.test(lastJournalText),
      stuck: /\b(stuck|trapped|same|repeat|loop|again)\b/.test(lastJournalText),
    };

    // Domain stressors
    const stressedDomains = (domains ?? []).filter((d: any) => (d.score ?? 50) < 40);
    const isWorkStressed = stressedDomains.some((d: any) => d.domain === "work" || d.domain === "career");
    const isRelationshipStressed = stressedDomains.some((d: any) =>
      ["relationships", "family", "intimacy"].includes(d.domain),
    );
    const isCreativeLow = stressedDomains.some((d: any) => ["creativity", "play"].includes(d.domain));
    const isPurposeLow = stressedDomains.some((d: any) => ["purpose", "meaning"].includes(d.domain));

    // Dimension picks
    const dim = dimensions?.[0] ?? null;
    const lowBody = dim && dim.body_score !== undefined && dim.body_score < 4;
    const highAwareness = dim && dim.awareness_score !== undefined && dim.awareness_score >= 6;
    const highThoughtLowAwareness =
      dim && dim.thought_score !== undefined && dim.thought_score >= 7 && (dim.awareness_score ?? 0) < 5;

    // Predictive signal hints
    const sigTypes = new Set((predictiveSignals ?? []).map((s: any) => s.signal_type));

    // ─── Mode scoring ───
    const scores = {} as Record<Mode, number>;
    const allModes: Mode[] = Object.keys(LABELS) as Mode[];
    allModes.forEach((m) => (scores[m] = 0));
    scores.reflection = 1; // baseline

    // Mood-based emotional support
    if (effectiveMood !== null) {
      if (effectiveMood <= 3) scores.emotional_support += 5;
      else if (effectiveMood <= 5) scores.emotional_support += 2;
      if (effectiveMood >= 7) scores.gratitude += 3;
      if (effectiveMood >= 8) scores.celebration += 3;
    }

    // Specific emotion detection from journal
    if (emotionFlags.grief) scores.grief_holding += 5;
    if (emotionFlags.anxiety) scores.anxiety_soothing += 5;
    if (emotionFlags.anger) scores.anger_release += 5;
    if (emotionFlags.loneliness) scores.loneliness += 5;
    if (emotionFlags.shame) scores.shame_compassion += 5;
    if (emotionFlags.tired) {
      scores.rest += 4;
      scores.energy_reset += 3;
    }
    if (emotionFlags.stuck) {
      scores.loop_witnessing += 4;
      scores.observation += 2;
    }

    // Regression / state
    if (hadRecentRegression) scores.emotional_support += 3;
    if (state === "dark_night" || state === "regression") {
      scores.emotional_support += 4;
      scores.shame_compassion += 2;
    }
    if (state === "breakthrough") {
      scores.breakthrough_anchor += 6;
      scores.integration += 4;
    }
    if (state === "integration") scores.integration += 5;
    if (state === "loop_active") scores.loop_witnessing += 4;

    // Loops
    if (topLoopSeverity >= 7) {
      scores.loop_witnessing += 5;
      scores.trigger_mapping += 3;
    } else if (topLoopSeverity >= 4) {
      scores.observation += 3;
      scores.loop_witnessing += 2;
    }
    if (loopCount >= 3) scores.autopilot_check += 2;

    // Reactivity / autopilot via predictive signals
    if (sigTypes.has("high_reactivity")) scores.reactivity_pause += 4;
    if (sigTypes.has("autopilot") || sigTypes.has("disengagement")) scores.autopilot_check += 4;
    if (sigTypes.has("plateau")) scores.deep_practitioner += 3;

    // Band / inquiry depth
    if (band >= 7) {
      scores.witness_presence += 4;
      scores.silence += 3;
      scores.non_doing += 3;
      scores.identity_question += 3;
    } else if (band >= 5) {
      scores.self_inquiry += 4;
      scores.witness_presence += 2;
    } else if (band >= 3 && (effectiveMood ?? 5) >= 6) {
      scores.self_inquiry += 2;
    }
    if (highAwareness) scores.witness_presence += 2;
    if (highThoughtLowAwareness) scores.observation += 3;

    // Gratitude / celebration / values
    if ((effectiveMood ?? 5) >= 7 && streak >= 3) scores.gratitude += 4;
    if (todayCtx?.morning_completed && todayCtx?.evening_completed) scores.gratitude += 2;
    if (streak >= 14) scores.values_alignment += 2;

    // Body / breath / energy
    if (lowBody) {
      scores.body_scan += 4;
      scores.breath_anchor += 2;
    }
    if ((effectiveEnergy ?? 5) <= 3) {
      scores.rest += 4;
      scores.energy_reset += 4;
      scores.breath_anchor += 2;
    } else if ((effectiveEnergy ?? 5) <= 5) {
      scores.energy_reset += 2;
    }

    // Domain-driven
    if (isRelationshipStressed) scores.relationships += 4;
    if (isWorkStressed) scores.work_balance += 4;
    if (isCreativeLow) scores.creative_play += 3;
    if (isPurposeLow) scores.purpose_check += 3;

    // Time-of-day (only nudges, not dominant)
    if (isEarlyMorning && !todayCtx?.morning_completed) scores.morning_intention += 4;
    if (isMidday && todayCtx?.morning_completed && !todayCtx?.midday_completed) scores.midday_reset += 3;
    if (isEvening && !todayCtx?.evening_completed) scores.evening_close += 4;
    if (isLateNight) {
      scores.late_night_settle += 4;
      scores.rest += 2;
    }

    // App relationship phase
    if (phase === "newcomer" || daysKnown < 7 || journeyDay < 7) {
      scores.newcomer_welcome += 5;
      // Newcomers shouldn't get too much deep inquiry
      scores.identity_question = Math.max(0, scores.identity_question - 3);
      scores.silence = Math.max(0, scores.silence - 2);
      scores.non_doing = Math.max(0, scores.non_doing - 2);
    }
    if (phase === "deep" || phase === "sage" || journeyDay >= 90) {
      scores.deep_practitioner += 3;
      scores.witness_presence += 1;
    }
    if (phase === "explorer" || phase === "committed") {
      scores.integration += 1;
      scores.values_alignment += 1;
    }

    // Streak nuance
    if (streak === 0 && journeyDay > 7) scores.reflection += 2; // gentle re-entry
    if (streak >= 7) scores.integration += 1;

    // ─── Pick top 3 with surface diversity ───
    const ranked = allModes
      .map((m) => ({ mode: m, score: scores[m] }))
      .sort((a, b) => b.score - a.score);

    const usedSurfaces = new Set<Surface>();
    const usedModes = new Set<Mode>();
    const cards: Card[] = [];

    for (const { mode, score } of ranked) {
      if (cards.length >= 3) break;
      if (score <= 0) continue;
      if (usedModes.has(mode)) continue;
      let surface = SURFACE_FOR[mode];
      // Try to keep surface variety: if this surface already used twice, skip
      const surfaceUsedCount = cards.filter((c) => c.surface === surface).length;
      if (surfaceUsedCount >= 2) {
        const alt: Surface[] = ["journal", "guide", "inquiry"];
        const free = alt.find((s) => cards.filter((c) => c.surface === s).length === 0);
        if (free) surface = free;
      }
      usedSurfaces.add(surface);
      usedModes.add(mode);
      cards.push(buildCard(mode, surface, cards.length));
    }

    // Fill to 3 with reflection if scoring was sparse
    while (cards.length < 3) {
      const fallbackMode: Mode = cards.length === 0 ? "reflection" : cards.length === 1 ? "self_inquiry" : "gratitude";
      if (usedModes.has(fallbackMode)) break;
      cards.push(buildCard(fallbackMode, SURFACE_FOR[fallbackMode], cards.length));
      usedModes.add(fallbackMode);
    }

    return new Response(
      JSON.stringify({
        cards,
        signals: {
          band,
          state,
          mood: effectiveMood,
          energy: effectiveEnergy,
          topLoopSeverity,
          loopCount,
          hadRecentRegression,
          isEarlyMorning,
          isMidday,
          isEvening,
          isLateNight,
          streak,
          journeyDay,
          phase,
          daysKnown,
          emotionFlags,
          stressedDomains: stressedDomains.map((d: any) => d.domain),
          predictiveSignals: Array.from(sigTypes),
        },
        debug_top_modes: ranked.slice(0, 8),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("always-open-prompts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
