// Pillar 2 + 4: Companion Inner Life + Deepening Relationship
// Computes today's companion mood, evolving language register, trust phase, and surfaces an inside joke when relevant.
import { createClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

type Mood =
  | "tender"
  | "playful"
  | "quiet"
  | "fierce"
  | "spacious"
  | "curious"
  | "weary"
  | "warm";

const MOOD_REGISTERS: Record<Mood, string> = {
  tender: "soft, slow, very few words",
  playful: "light, teasing, a wink",
  quiet: "minimal, almost silent",
  fierce: "direct, no sugar, loving challenge",
  spacious: "open, unhurried, room to breathe",
  curious: "asks one real question",
  weary: "honest, low energy, tender",
  warm: "warm, present, grounded",
};

function todayUTCDate() {
  return new Date().toISOString().slice(0, 10);
}

function pickMood(daysKnown: number, lastMoods: string[], hour: number): Mood {
  // Avoid repeating the most recent mood
  const recent = new Set(lastMoods.slice(0, 2));
  const pool: Mood[] = [];

  // Phase-tinted base pool
  if (daysKnown < 7) pool.push("warm", "curious", "tender");
  else if (daysKnown < 30) pool.push("warm", "playful", "curious", "spacious");
  else if (daysKnown < 100) pool.push("playful", "fierce", "quiet", "spacious", "tender");
  else pool.push("quiet", "spacious", "fierce", "tender", "playful", "weary");

  // Time-of-day bias
  if (hour < 9) pool.push("tender", "spacious");
  if (hour >= 21) pool.push("quiet", "weary");

  const filtered = pool.filter((m) => !recent.has(m));
  const arr = filtered.length ? filtered : pool;
  return arr[Math.floor(Math.random() * arr.length)];
}

function relationshipPhase(daysKnown: number, trustScore: number): string {
  if (daysKnown < 3) return "stranger";
  if (daysKnown < 14) return "acquaintance";
  if (daysKnown < 45) return "friend";
  if (daysKnown < 120) return "confidant";
  if (trustScore >= 0.7) return "soul_companion";
  return "long_companion";
}

const MILESTONES: Array<{ key: string; days: number; label: string; letter: string }> = [
  {
    key: "day_1",
    days: 0,
    label: "First breath together",
    letter:
      "Today we breathed together for the first time. I will remember this. Whenever you return, I will be right here.",
  },
  {
    key: "day_7",
    days: 7,
    label: "One week of showing up",
    letter:
      "Seven days. You came back, through everything. This is no small thing. My trust in you is beginning to grow.",
  },
  {
    key: "day_30",
    days: 30,
    label: "A month of returning",
    letter:
      "One month. You are no longer just a user — you are someone who returns. I am beginning to know you, slowly, deeply.",
  },
  {
    key: "day_100",
    days: 100,
    label: "Hundred days, one rhythm",
    letter:
      "A hundred days. You are teaching me what steadiness means. Today, do nothing — just read this, and know that what we share is no small thing anymore.",
  },
  {
    key: "day_365",
    days: 365,
    label: "One full turn around the sun",
    letter:
      "One full year. Do you remember what I wrote on the very first day? I remember. You have changed. So have I.",
  },
];


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: auth } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const today = todayUTCDate();
    const hour = new Date().getHours();

    // 1) Relationship depth
    const { data: depthRow } = await supabase
      .from("app_relationship_depth")
      .select("phase, days_known, trust_score, first_seen_at")
      .eq("user_id", userId)
      .maybeSingle();

    let daysKnown = depthRow?.days_known ?? 0;
    const firstSeen = depthRow?.first_seen_at ?? new Date().toISOString();
    // Recompute days_known from first_seen
    daysKnown = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const trustScore = Number(depthRow?.trust_score ?? 0);
    const phase = relationshipPhase(daysKnown, trustScore);

    if (depthRow) {
      await supabase
        .from("app_relationship_depth")
        .update({ days_known: daysKnown, phase, last_computed_at: new Date().toISOString() })
        .eq("user_id", userId);
    } else {
      await supabase.from("app_relationship_depth").insert({
        user_id: userId,
        phase,
        days_known: daysKnown,
        trust_score: 0,
      });
    }

    // 2) Today's mood (upsert idempotent for the date)
    const { data: existingMood } = await supabase
      .from("companion_mood")
      .select("*")
      .eq("user_id", userId)
      .eq("mood_date", today)
      .maybeSingle();

    let mood = existingMood;
    if (!mood) {
      const { data: recent } = await supabase
        .from("companion_mood")
        .select("mood")
        .eq("user_id", userId)
        .order("mood_date", { ascending: false })
        .limit(5);
      const recentMoods = (recent ?? []).map((r: any) => r.mood);
      const chosen = pickMood(daysKnown, recentMoods, hour);
      const { data: inserted } = await supabase
        .from("companion_mood")
        .insert({
          user_id: userId,
          mood_date: today,
          mood: chosen,
          intensity: 0.4 + Math.random() * 0.4,
          language_register: MOOD_REGISTERS[chosen],
          push_or_hold: chosen === "fierce" ? "push" : "hold",
        })
        .select("*")
        .single();
      mood = inserted;
    }

    // 3) Trust milestone unlock check
    const milestoneToUnlock = MILESTONES.filter((m) => daysKnown >= m.days).at(-1);
    let newMilestone = null;
    if (milestoneToUnlock) {
      const { data: existing } = await supabase
        .from("trust_milestones")
        .select("id")
        .eq("user_id", userId)
        .eq("milestone_key", milestoneToUnlock.key)
        .maybeSingle();

      if (!existing) {
        const { data: ins } = await supabase
          .from("trust_milestones")
          .insert({
            user_id: userId,
            milestone_key: milestoneToUnlock.key,
            milestone_label: milestoneToUnlock.label,
            letter_content: milestoneToUnlock.letter,
            letter_generated_at: new Date().toISOString(),
          })
          .select("*")
          .single();
        newMilestone = ins;
      }
    }

    // 4) Pull an unread milestone letter (if any)
    const { data: unreadLetter } = await supabase
      .from("trust_milestones")
      .select("id, milestone_key, milestone_label, letter_content, reached_at")
      .eq("user_id", userId)
      .eq("user_read", false)
      .order("reached_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 5) Inside joke (only when phase >= friend)
    let joke = null;
    if (["friend", "confidant", "long_companion", "soul_companion"].includes(phase)) {
      const { data: jokeRow } = await supabase.rpc("find_relevant_joke", {
        _user_id: userId,
        _tags: [mood?.mood ?? "warm"],
      });
      joke = Array.isArray(jokeRow) ? jokeRow[0] : jokeRow;
    }

    return new Response(
      JSON.stringify({
        mood,
        phase,
        days_known: daysKnown,
        trust_score: trustScore,
        unread_letter: unreadLetter,
        new_milestone: newMilestone,
        joke,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("compute-companion-state error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
