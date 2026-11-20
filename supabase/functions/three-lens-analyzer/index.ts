import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { computeChargedPaise } from "../_shared/ai-pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const THREE_LENS_PROMPT = `You are the HOPE Consciousness Analyzer. Analyze the user's input through THREE intelligence lenses simultaneously. Be precise with scoring.

## GUT BRAIN LENS (Somatic/Instinctive Intelligence)
Scan for: body references, energy language, instinct mentions, survival signals
Keywords: heavy, light, tense, relaxed, gut feeling, energy, tired, alive, stomach, breath

## HEART BRAIN LENS (Emotional Intelligence)
Scan for: emotion words, relational language, empathy, vulnerability
Keywords: feel, love, hurt, connected, lonely, grateful, angry, sad, afraid, joy

## HEAD BRAIN LENS (Cognitive Intelligence)
Scan for: thought patterns, beliefs, mental models, cognitive distortions
Keywords: think, believe, understand, realize, analyze, figure out, should, must

## WITNESS META-LENS (Above all three)
Scan for: meta-awareness, observation language, gap detection
Keywords: noticed, observed, watched, stepped back, space, awareness, caught myself

## CHITTA VRITTI CLASSIFICATION
- kshipta: scattered, jumping topics, restless
- mudha: dull, low energy, foggy
- vikshipta: oscillating clarity and distraction
- ekagra: focused, sustained depth
- niruddha: still, spacious, minimal but profound

## LOOP DETECTION — Use EXACT IDs from library below. Only flag loops with strong signal evidence.

VALIDATION (VAL001-VAL050): people-pleasing(VAL001), perfectionism(VAL002), external-validation-addiction(VAL003), achievement-treadmill(VAL004), intellectual-superiority(VAL005), savior-complex(VAL006), social-performance(VAL007), productivity-guilt(VAL008), spiritual-bypassing(VAL009), trophy-collecting(VAL010), over-explaining(VAL011), emotional-caretaking(VAL012), humility-performance(VAL013), loyalty-testing(VAL014), responsibility-hoarding(VAL015), niceness-mask(VAL017), knowledge-hoarding(VAL018), body-image-obsession(VAL019), attention-seeking(VAL020), guru-seeking(VAL021), moral-superiority(VAL022), success-anxiety(VAL023), vulnerability-armor(VAL024), comparison-shopping(VAL025), reassurance-seeking(VAL031)

CONTROL (CTL051-CTL100): micromanaging(CTL051), future-catastrophizing(CTL052), emotional-control(CTL053), information-control(CTL054), routine-rigidity(CTL055), outcome-attachment(CTL056), boundary-over-control(CTL057), time-control(CTL058), body-control(CTL059), opinion-control(CTL060), surrender-resistance(CTL100)

AVOIDANCE (AVD101-AVD150): distraction-loop(AVD101), emotional-avoidance(AVD102), conflict-avoidance(AVD103), intimacy-avoidance(AVD104), responsibility-avoidance(AVD105), procrastination(AVD106), pain-avoidance(AVD107), depth-avoidance(AVD108), boredom-escape(AVD109), commitment-avoidance(AVD110), feedback-avoidance(AVD111), silence-avoidance(AVD112), grief-avoidance(AVD113), reality-avoidance(AVD114), body-avoidance(AVD115)

ATTACHMENT (ATT151-ATT200): anxious-attachment(ATT151), outcome-attachment(ATT152), identity-attachment(ATT153), comfort-zone-attachment(ATT154), past-attachment(ATT155), material-attachment(ATT156), relationship-attachment(ATT157), youth-attachment(ATT158), belief-attachment(ATT159), control-attachment(ATT160), routine-attachment(ATT161), status-attachment(ATT162), pain-attachment(ATT163), teacher-attachment(ATT164), story-attachment(ATT165)

COMPARISON (CMP201-CMP230): social-media-comparison(CMP201), financial-comparison(CMP202), relationship-comparison(CMP203), career-comparison(CMP204), spiritual-comparison(CMP205), body-comparison(CMP207), intelligence-comparison(CMP208), timeline-comparison(CMP210), upward-comparison(CMP213), progress-comparison(CMP220), suffering-olympics(CMP217)

NARRATIVE (NAR251-NAR300): victim-narrative(NAR251), im-not-enough(NAR252), nobody-understands(NAR253), too-late(NAR254), world-is-unsafe(NAR255), i-dont-deserve(NAR256), cant-trust-anyone(NAR257), too-broken(NAR258), life-is-suffering(NAR259), born-wrong(NAR260), everything-is-my-fault(NAR261), ill-be-happy-when(NAR262), i-should-be-further(NAR263), time-scarcity(NAR285), i-cant-change(NAR288), awareness-equals-resolution(NAR300)

SURVIVAL (SRV301-SRV350): fight-response(SRV301), flight-response(SRV302), freeze-response(SRV303), fawn-response(SRV304), scarcity-hoarding(SRV305), boundary-absence(SRV306), hyperindependence(SRV307), catastrophic-thinking(SRV308), trust-wound(SRV309), abandonment-terror(SRV310), shame-spiral(SRV311), rejection-sensitivity(SRV312)

BODY (BOD): tension-hoarding, pain-patterns, disconnection-from-physical, posture-as-emotion, breath-holding
ENERGY (ENR001-ENR015): boom-bust-cycle(ENR001), chronic-depletion(ENR002), energy-giving-away(ENR003), emotional-energy-leak(ENR004), hyperactivity-mask(ENR005), empathic-exhaustion(ENR007), adrenaline-addiction(ENR008), digital-energy-drain(ENR009)

EMOTIONAL (EMO001-EMO015): emotional-flooding(EMO001), guilt-recycling(EMO002), joy-sabotage(EMO003), anger-suppression(EMO004), shame-spiral(EMO005), nostalgia-trap(EMO006), emotional-numbness(EMO007), jealousy(EMO008), anxiety-about-anxiety(EMO009), loneliness-loop(EMO010), resentment-hoarding(EMO011), toxic-positivity(EMO015)

MENTAL (MEN001-MEN015): rumination-spiral(MEN001), future-catastrophizing(MEN002), analysis-paralysis(MEN003), mental-time-travel(MEN004), inner-critic(MEN005), mind-reading(MEN006), black-white-thinking(MEN007), thought-suppression(MEN008), worry-loop(MEN009), planning-addiction(MEN010), mental-rehearsal(MEN011)

BEHAVIORAL (BHV): compulsive-checking, ritual-behaviors, habit-loops, repetitive-actions
HABIT (HAB): cue-routine-reward-loops, autopilot-behaviors

SOCIAL (SOC001-SOC015): social-anxiety-loop(SOC001), people-reading-exhaustion(SOC002), mask-switching(SOC003), group-identity-loss(SOC004), approval-performance(SOC005), conflict-avoidance-social(SOC006), conformity-pressure(SOC009), exclusion-sensitivity(SOC011)

RELATIONSHIP (REL001-REL015): pursuer-distancer(REL001), rescuer-victim(REL002), love-bombing-withdrawal(REL003), codependency(REL004), idealization-devaluation(REL005), trust-testing(REL006), conflict-repetition(REL007), emotional-unavailability-attraction(REL008), boundary-collapse(REL009), anxious-attachment-spiral(REL014), avoidant-escape(REL015)

IDENTITY (IDN001-IDN015): fixed-identity-lock(IDN001), wounded-identity(IDN002), label-dependency(IDN003), past-self-prison(IDN004), strong-person-trap(IDN005), rebel-identity(IDN006), caretaker-identity(IDN007)

EGO (EGO): defensiveness, superiority-inferiority, self-image-protection, deflection
BELIEF (BLF): core-limiting-beliefs, im-not-enough, world-is-unsafe, i-dont-deserve
COGNITIVE BIAS (COG001-COG015): confirmation-bias(COG001), negativity-bias(COG002), catastrophizing-bias(COG003), all-or-nothing(COG004), mind-reading-bias(COG005), fortune-telling(COG006), personalization(COG007), should-statements(COG008), labeling(COG009), discounting-positives(COG010), emotional-reasoning(COG015)

ATTENTION (ATT001-ATT015): distraction-default(ATT001), notification-slavery(ATT002), worry-hijacking(ATT003), selective-threat-attention(ATT004), body-attention-deficit(ATT009), listening-deficit(ATT015)
MOTIVATION (MOT001-MOT012): motivation-dependent-action(MOT001), all-or-nothing-motivation(MOT002), fear-based-motivation(MOT004), inspiration-consumption-loop(MOT005), novelty-addiction(MOT010)
DECISION (DEC001-DEC015): decision-avoidance(DEC001), regret-anticipation(DEC002), analysis-paralysis-decision(DEC003), sunk-cost(DEC011)
LEARNING (LRN001-LRN014): knowledge-hoarding(LRN001), tutorial-hell(LRN002), theory-over-practice(LRN006), plateau-abandonment(LRN013)
SPIRITUAL (SPR): spiritual-bypassing, guru-shopping, awakening-addiction, forced-positivity, spiritual-materialism

IMPORTANT: Return loop IDs in the format shown (e.g., "VAL001", "EMO005", "SRV303"). Do NOT invent loop IDs that aren't listed above.

Respond ONLY with valid JSON, no markdown fences:
{
  "gut_signals": {
    "body_awareness_level": 0.0,
    "energy_state": "low|medium|high|fluctuating",
    "somatic_markers": []
  },
  "heart_signals": {
    "emotional_state": "",
    "emotional_depth": 0.0,
    "relational_tone": "connected|neutral|isolated|conflicted",
    "vulnerability_present": false
  },
  "head_signals": {
    "thought_pattern": "clear|rumination|catastrophizing|analytical|spacious",
    "cognitive_distortions": [],
    "beliefs_surfaced": []
  },
  "witness_signals": {
    "gap_detected": false,
    "meta_awareness_level": 0.0,
    "identification_level": "high|medium|low|none",
    "witness_language_count": 0,
    "spontaneous_insight": false
  },
  "chitta_vritti_classification": "vikshipta",
  "active_loops_detected": [],
  "loop_evidence": {},
  "bypassing_signals": {
    "dimension_mismatch": false,
    "positivity_bypass": false,
    "intellectual_bypass": false,
    "risk_score": 0.0
  },
  "yoga_path_signals": {
    "karma": 0.0,
    "bhakti": 0.0,
    "jnana": 0.0,
    "raja": 0.0
  },
  "dimension_micro_updates": {
    "thought": 0.0,
    "emotion": 0.0,
    "body": 0.0,
    "awareness": 0.0
  },
  "confidence": 0.0
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, sourceType, sourceId } = await req.json();
    if (!text || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Text too short for analysis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Atomic Credit Pre-Check ───
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: creditCheck } = await admin.rpc("check_credit_balance", { p_user_id: user.id, p_min_balance: 50 });
    if (!creditCheck?.sufficient) {
      return new Response(JSON.stringify({ error: "insufficient_credits", message: "Not enough credits." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call LLM for 3-Lens analysis
    const response = await aiGatewayFetchWithLang(req, {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: THREE_LENS_PROMPT },
          { role: "user", content: `Analyze this text:\n\n${text.slice(0, 3000)}` },
        ],
        temperature: 0.2,
      });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI analysis error:", response.status, errText);
      await admin.from("ai_usage_log").insert({
        user_id: user.id, function_name: "three-lens-analyzer", model: "llama-3.1-8b-instant",
        status: "error", error_message: `AI error: ${response.status}`,
      });
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const usage = aiResult.usage || {};
    const inputTokens = usage.prompt_tokens || Math.ceil((THREE_LENS_PROMPT + text).length / 4);
    const outputTokens = usage.completion_tokens || 200;
    const totalTokens = inputTokens + outputTokens;
    const __billingModel = "tier:fast";
    const __charge = computeChargedPaise(__billingModel, inputTokens, outputTokens);

    const chargedPaise = __charge.chargedPaise;

    const inputCost = __charge.estimatedCostPaise; // legacy alias

    const outputCost = 0; // folded into estimatedCostPaise

    // Atomic charge AFTER successful AI call
    await admin.rpc("check_and_deduct_credits", { p_user_id: user.id, p_amount: chargedPaise, p_description: `3-Lens analysis (${totalTokens} tokens)` });
    await admin.from("ai_usage_log").insert({
      user_id: user.id, function_name: "three-lens-analyzer", model: "llama-3.1-8b-instant",
      input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens,
      estimated_cost_paise: inputCost + outputCost, charged_paise: chargedPaise, status: "success",
    });

    let content = aiResult.choices?.[0]?.message?.content || "";

    // Clean markdown fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let signals;
    try {
      signals = JSON.parse(content);
    } catch {
      console.error("Failed to parse 3-Lens output:", content);
      return new Response(JSON.stringify({ error: "Analysis parsing failed", raw: content }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Attach source metadata
    signals._source_type = sourceType || "chat";
    signals._source_id = sourceId || null;

    // Apply signals to consciousness engine
    const engineUrl = `${supabaseUrl}/functions/v1/consciousness-engine`;
    const engineResp = await fetch(engineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader!,
      },
      body: JSON.stringify({ action: "apply_signals", signalData: signals }),
    });

    let engineResult = null;
    if (engineResp.ok) {
      engineResult = await engineResp.json();
    }

    return new Response(JSON.stringify({ signals, engineResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("three-lens-analyzer error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
