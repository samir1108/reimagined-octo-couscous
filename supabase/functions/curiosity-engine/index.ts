const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { createClient } from "npm:@supabase/supabase-js@2";

/*
  CURIOSITY ENGINE — Progressive profiling via natural questions
  
  4-Step Loop:
  1. Data Audit — find low-confidence data points
  2. Impact Assessment — would knowing this help?
  3. Contextual Question — natural, 1 at a time
  4. Immediate Integration — adjust engine same day
  
  Rules:
  - Max 1 question per 3 days
  - Always explains WHY
  - Always skippable
  - Never asks sensitive data without user hint
*/

interface ConfidenceScores {
  preferred_time: number;
  learning_style: number;
  evening_energy: number;
  journaling_preference: number;
  guru_resonance_reason: number;
  life_stage: number;
  practice_preference: number;
  stress_triggers: number;
  motivation_style: number;
  [key: string]: number;
}

interface CuriosityQuestion {
  key: string;
  question: string;
  context: string;
  impact: string;
  uiPlacement: string;
}

// Impact assessment: how much would knowing this improve personalization?
const IMPACT_MAP: Record<string, { impact: "high" | "medium" | "low"; benefitTemplate: string }> = {
  preferred_time:        { impact: "high",   benefitTemplate: "I can optimize your session timing" },
  learning_style:        { impact: "high",   benefitTemplate: "I can match teaching to how you learn best" },
  evening_energy:        { impact: "medium", benefitTemplate: "I can adjust evening practices to your energy" },
  journaling_preference: { impact: "medium", benefitTemplate: "I can replace journaling with what works for you" },
  guru_resonance_reason: { impact: "medium", benefitTemplate: "I can find masters who match that quality" },
  life_stage:            { impact: "high",   benefitTemplate: "I can adapt all content to your life context" },
  practice_preference:   { impact: "medium", benefitTemplate: "I can prioritize practices you connect with" },
  stress_triggers:       { impact: "high",   benefitTemplate: "I can prepare practices before stress hits" },
  motivation_style:      { impact: "medium", benefitTemplate: "I can frame challenges your way" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const body = await req.json().catch(() => ({}));
    const action = body.action || "check"; // "check" | "answer" | "skip"

    // Fetch or create curiosity queue
    let { data: queue } = await supabase
      .from("curiosity_queue")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!queue) {
      const { data: newQueue } = await supabase
        .from("curiosity_queue")
        .insert({ user_id: user.id })
        .select()
        .single();
      queue = newQueue;
    }

    if (!queue) throw new Error("Failed to create curiosity queue");

    // Handle answer
    if (action === "answer" && body.answer && queue.active_question) {
      const answerHistory = [...(queue.answer_history || []), {
        question: queue.active_question,
        answer: body.answer,
        answered_at: new Date().toISOString(),
        key: body.key,
      }];

      // Update confidence score for answered key
      const scores = queue.confidence_scores as ConfidenceScores;
      if (body.key && scores[body.key] !== undefined) {
        scores[body.key] = Math.min(1, scores[body.key] + 0.3);
      }

      await supabase.from("curiosity_queue").update({
        active_question: null,
        active_question_context: null,
        cooldown_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 day cooldown
        total_questions_answered: (queue.total_questions_answered || 0) + 1,
        answer_history: answerHistory,
        confidence_scores: scores,
      }).eq("id", queue.id);

      // Integrate answer immediately into spiritual DNA
      await integrateAnswer(supabase, user.id, body.key, body.answer);

      return new Response(JSON.stringify({
        status: "integrated",
        message: "Done. Adjusted your experience based on your answer.",
        key: body.key,
        newConfidence: scores[body.key],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Handle skip
    if (action === "skip" && queue.active_question) {
      await supabase.from("curiosity_queue").update({
        active_question: null,
        active_question_context: null,
        cooldown_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        total_questions_skipped: (queue.total_questions_skipped || 0) + 1,
      }).eq("id", queue.id);

      return new Response(JSON.stringify({
        status: "skipped",
        message: "No problem. I'll ask another time, or not at all.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check action: should we ask a question?
    // 1. Cooldown check
    if (queue.cooldown_until && new Date(queue.cooldown_until) > new Date()) {
      return new Response(JSON.stringify({
        status: "cooling_down",
        nextQuestionAt: queue.cooldown_until,
        activeQuestion: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. If already has active question, return it
    if (queue.active_question) {
      return new Response(JSON.stringify({
        status: "has_question",
        activeQuestion: {
          question: queue.active_question,
          context: queue.active_question_context,
          impact: queue.active_question_impact,
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Data Audit — find lowest confidence scores
    const scores = queue.confidence_scores as ConfidenceScores;
    const gaps = Object.entries(scores)
      .filter(([_, score]) => score < 0.6)
      .sort((a, b) => a[1] - b[1]);

    if (gaps.length === 0) {
      return new Response(JSON.stringify({
        status: "no_gaps",
        message: "All confidence scores are adequate",
        activeQuestion: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 4. Impact Assessment — pick highest impact gap
    let bestGap = gaps[0];
    for (const gap of gaps) {
      const gapImpact = IMPACT_MAP[gap[0]]?.impact || "low";
      const bestImpact = IMPACT_MAP[bestGap[0]]?.impact || "low";
      const impactOrder = { high: 3, medium: 2, low: 1 };
      if (impactOrder[gapImpact] > impactOrder[bestImpact]) {
        bestGap = gap;
      }
    }

    // 5. Generate contextual question
    const question = await generateQuestion(supabase, user.id, bestGap[0]);

    // Save active question
    await supabase.from("curiosity_queue").update({
      active_question: question.question,
      active_question_context: question.context,
      active_question_impact: IMPACT_MAP[bestGap[0]]?.impact || "medium",
      asked_at: new Date().toISOString(),
      total_questions_asked: (queue.total_questions_asked || 0) + 1,
    }).eq("id", queue.id);

    return new Response(JSON.stringify({
      status: "new_question",
      activeQuestion: {
        key: bestGap[0],
        question: question.question,
        context: question.context,
        benefit: IMPACT_MAP[bestGap[0]]?.benefitTemplate,
        impact: IMPACT_MAP[bestGap[0]]?.impact,
        uiPlacement: question.uiPlacement,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateQuestion(supabase: any, userId: string, key: string): Promise<CuriosityQuestion> {
  // Pattern-based questions (no AI needed for most)
  const QUESTION_TEMPLATES: Record<string, CuriosityQuestion> = {
    preferred_time: {
      key: "preferred_time",
      question: "I noticed you open the app at different times. When do you feel most settled for practice?",
      context: "If I know your rhythm, I can prepare the right session at the right time.",
      impact: "high",
      uiPlacement: "companion_chat",
    },
    learning_style: {
      key: "learning_style",
      question: "Do you learn better through stories, direct instructions, or self-discovery?",
      context: "I want to match how gurus teach to how you absorb best.",
      impact: "high",
      uiPlacement: "morning_gate",
    },
    evening_energy: {
      key: "evening_energy",
      question: "Evenings seem heavy for you. Is it energy, timing, or just life?",
      context: "If I know, I can adjust the evening session to fit your rhythm.",
      impact: "medium",
      uiPlacement: "companion_chat",
    },
    journaling_preference: {
      key: "journaling_preference",
      question: "Journaling dropped off recently. Is the format not working, or do you prefer silence now?",
      context: "Either is perfect. I just want to make sure I'm not adding pressure.",
      impact: "medium",
      uiPlacement: "evening_card",
    },
    guru_resonance_reason: {
      key: "guru_resonance_reason",
      question: "What pulls you most about the masters you connect with — their warmth, clarity, stories, or something else?",
      context: "Curious so I can match that quality across different teachers.",
      impact: "medium",
      uiPlacement: "post_session",
    },
    life_stage: {
      key: "life_stage",
      question: "Life looks different for everyone. Are you a student, working professional, parent, or somewhere else?",
      context: "This helps me give practices that fit your actual life, not a generic schedule.",
      impact: "high",
      uiPlacement: "companion_chat",
    },
    practice_preference: {
      key: "practice_preference",
      question: "Which practices feel most natural to you — watching thoughts, breathing, or moving?",
      context: "I want to lead with what resonates and gently introduce the rest.",
      impact: "medium",
      uiPlacement: "morning_gate",
    },
    stress_triggers: {
      key: "stress_triggers",
      question: "I noticed your mood dips on some days. Is there a pattern — work, relationships, health, or something else?",
      context: "If I know the trigger, I can prepare a practice before the stress hits.",
      impact: "high",
      uiPlacement: "companion_chat",
    },
    motivation_style: {
      key: "motivation_style",
      question: "What keeps you going — visible progress, inner peace, curiosity, or accountability?",
      context: "I want to frame your journey in a way that actually motivates you.",
      impact: "medium",
      uiPlacement: "morning_gate",
    },
  };

  return QUESTION_TEMPLATES[key] || {
    key,
    question: `I'd like to understand your ${key.replace(/_/g, " ")} better. Can you share?`,
    context: "This helps me personalize your experience.",
    impact: "medium",
    uiPlacement: "companion_chat",
  };
}

async function integrateAnswer(supabase: any, userId: string, key: string, answer: string) {
  // Immediately update spiritual DNA based on answer
  const updates: Record<string, any> = {};

  switch (key) {
    case "life_stage":
      const stageMap: Record<string, string> = {
        student: "student", professional: "professional", parent: "parent",
        retiree: "retiree", elder: "elder", freelancer: "irregular",
      };
      const detected = Object.entries(stageMap).find(([k]) => answer.toLowerCase().includes(k));
      if (detected) updates.life_stage = detected[1];
      break;

    case "preferred_time":
      // Parse time preference from answer
      if (answer.toLowerCase().includes("morning")) updates.primary_slot = "morning";
      else if (answer.toLowerCase().includes("night")) updates.primary_slot = "night";
      else if (answer.toLowerCase().includes("evening")) updates.primary_slot = "evening";
      break;

    case "learning_style":
      if (answer.toLowerCase().includes("stor")) updates.life_stage_details = { learning_style: "narrative" };
      else if (answer.toLowerCase().includes("direct")) updates.life_stage_details = { learning_style: "direct" };
      else updates.life_stage_details = { learning_style: "discovery" };
      break;
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("user_spiritual_dna").upsert({
      user_id: userId,
      ...updates,
    }, { onConflict: "user_id" });
  }
}
