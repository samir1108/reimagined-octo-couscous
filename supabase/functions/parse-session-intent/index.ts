// ============================================================
// parse-session-intent — Natural Language → Session Config
// ------------------------------------------------------------
// Takes a user message and current config, extracts intent,
// returns a config patch that can be applied.
//
// Returns: { ok, intent, configPatch, confirmationMessage, suggestedActions }
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "../_shared/supabase-client.ts";
import { getUserContext, type UserContext } from "../_shared/user-context.ts";
import { aiGatewayFetchWithLang, type AiMode } from "../_shared/ai-config.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
  console.error("[parse-session-intent] Missing required environment variables");
}

const VALID_PRACTICE_IDS = [
  'observation', 'self-inquiry', 'breath', 'witnessing', 'body', 'bhakti', 'karma', 'jnana', 'raja',
  'kriya', 'tantra', 'neuroscience', 'emotional-healing', 'loop-dissolution', 'relationship', 'work-career', 'finance', 'health'
] as const satisfies readonly string[];

const VALID_FOCUS_TYPES = [
  'focus', 'attention', 'self_inquiry', 'raja_yoga', 'jnana', 'bhakti', 'karma', 'tantra',
  'kundalini', 'healing', 'sleep', 'energy', 'relationship', 'work', 'creativity', 'custom'
] as const satisfies readonly string[];

const VALID_GUIDE_STYLES = ['gentle', 'direct', 'inquiry', 'devotional', 'silent'] as const satisfies readonly string[];
const VALID_ENERGY_MODES = ['low', 'medium', 'high', 'adaptive'] as const satisfies readonly string[];
const VALID_GATES = ['morning', 'midday', 'evening', 'night', 'flexible'] as const satisfies readonly string[];
const VALID_STRUCTURES = ['guided', 'hybrid', 'self_directed'] as const satisfies readonly string[];
const VALID_REFLECTIONS = ['micro', 'standard', 'deep'] as const satisfies readonly string[];
const VALID_DIFFICULTIES = ['gentler', 'standard', 'harder'] as const satisfies readonly string[];
const VALID_SPEED_PROFILES = ['fast', 'steady', 'deep', 'adaptive'] as const satisfies readonly string[];
const VALID_DOMAINS = ['relationship', 'work', 'finance', 'health', 'creativity', 'spirituality'] as const satisfies readonly string[];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'required'] as const satisfies readonly string[];
const VALID_SHADOW_IDS = ['abandonment', 'control', 'unworthiness', 'perfectionism', 'avoidance', 'people-pleasing', 'anger', 'grief', 'anxiety'] as const satisfies readonly string[];
const VALID_SHADOW_PRIORITIES = ['low', 'medium', 'high'] as const satisfies readonly string[];
const VALID_MASTER_IDS = [
  'ramana', 'krishnamurti', 'nidargadatta', 'shankara', 'patanjali', 'adiyogi', 'buddha', 'lao-tzu',
  'rumi', 'meera', 'ramakrishna', 'hafiz', 'kabir', 'gita', 'gandhi', 'levine', 'van-der-kolk',
  'abhinavagupta', 'osho', 'hendricks', 'gottman', 'csikszentmihalyi', 'frankl', 'cameron', 'pressfield',
  'kabat-zinn', 'thich-nhat-hanh', 'eckhart-tolle', 'byron-katie'
] as const satisfies readonly string[];
const VALID_SOCIAL_MODES = ['solo', 'partner', 'group', 'teacher'] as const satisfies readonly string[];

interface ConfigPatch {
  focusType?: string;
  timeBudgetMin?: number;
  guideStyle?: string;
  energyMode?: string;
  preferredGate?: string;
  structure?: string;
  reflectionDepth?: string;
  difficultyOverride?: string;
  speedProfile?: string;
  domainWeights?: Record<string, number>;
  practiceLevelTargets?: Record<string, { practiceId: string; targetLevel: number; priority: string; reason: string }>;
  shadowTargets?: { active: Array<{ id: string; name: string; priority: string }> };
  microTechniques?: Record<string, string[]>;
  masterPersonas?: Record<string, string>;
  socialConfig?: Record<string, unknown>;
  intent?: string;
  includedPracticeIds?: string[];
  excludedPracticeIds?: string[];
  includedTags?: string[];
  excludedTags?: string[];
}

interface ParseResponse {
  ok?: boolean;
  intent: string;
  configPatch: ConfigPatch;
  confirmationMessage: string;
  suggestedActions: string[];
  needsClarification: boolean;
  clarificationQuestion: string | null;
  aiMode: AiMode;
}

export function validateConfigPatch(patch: ConfigPatch, _userCtx: UserContext | null, currentConfig: Record<string, unknown>): ConfigPatch {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return {};
  const validated: ConfigPatch = {};

  // Time budget
  if (patch.timeBudgetMin !== undefined) {
    const tb = Number(patch.timeBudgetMin);
    if (Number.isFinite(tb) && tb >= 1 && tb <= 720) validated.timeBudgetMin = tb;
  }

  // Focus type
  if (patch.focusType && VALID_FOCUS_TYPES.includes(patch.focusType)) {
    validated.focusType = patch.focusType;
  }

  // Guide style
  if (patch.guideStyle && VALID_GUIDE_STYLES.includes(patch.guideStyle)) {
    validated.guideStyle = patch.guideStyle;
  }

  // Energy mode
  if (patch.energyMode && VALID_ENERGY_MODES.includes(patch.energyMode)) {
    validated.energyMode = patch.energyMode;
  }

  // Preferred gate
  if (patch.preferredGate && VALID_GATES.includes(patch.preferredGate)) {
    validated.preferredGate = patch.preferredGate;
  }

  // Structure
  if (patch.structure && VALID_STRUCTURES.includes(patch.structure)) {
    validated.structure = patch.structure;
  }

  // Reflection depth
  if (patch.reflectionDepth && VALID_REFLECTIONS.includes(patch.reflectionDepth)) {
    validated.reflectionDepth = patch.reflectionDepth;
  }

  // Difficulty
  if (patch.difficultyOverride && VALID_DIFFICULTIES.includes(patch.difficultyOverride)) {
    validated.difficultyOverride = patch.difficultyOverride;
  }

  // Speed profile
  if (patch.speedProfile && VALID_SPEED_PROFILES.includes(patch.speedProfile)) {
    validated.speedProfile = patch.speedProfile;
  }

  // Domain weights - coerce string numbers
  if (patch.domainWeights && typeof patch.domainWeights === 'object' && patch.domainWeights !== null && !Array.isArray(patch.domainWeights)) {
    const dw: Record<string, number> = {};
    for (const [k, v] of Object.entries(patch.domainWeights)) {
      if (VALID_DOMAINS.includes(k)) {
        const num = typeof v === 'string' ? Number(v) : v;
        if (typeof num === 'number' && Number.isFinite(num) && num >= 0 && num <= 1) {
          dw[k] = num;
        }
      }
    }
    if (Object.keys(dw).length > 0) validated.domainWeights = dw;
  }

  // Practice level targets
  if (patch.practiceLevelTargets && typeof patch.practiceLevelTargets === 'object' && patch.practiceLevelTargets !== null && !Array.isArray(patch.practiceLevelTargets)) {
    const plt: Record<string, { practiceId: string; targetLevel: number; priority: string; reason: string }> = {};
    for (const [practiceId, target] of Object.entries(patch.practiceLevelTargets)) {
      if (
        VALID_PRACTICE_IDS.includes(practiceId) &&
        target &&
        typeof target === 'object' &&
        target.practiceId === practiceId && // ensure key matches practiceId field
        typeof target.targetLevel === 'number' &&
        Number.isFinite(target.targetLevel) &&
        Number.isInteger(target.targetLevel) &&
        target.targetLevel >= 1 &&
        target.targetLevel <= 10 &&
        target.priority &&
        VALID_PRIORITIES.includes(target.priority) &&
        typeof target.reason === 'string' &&
        target.reason.trim().length > 0
      ) {
        plt[practiceId] = {
          practiceId,
          targetLevel: target.targetLevel,
          priority: target.priority,
          reason: target.reason.slice(0, 200),
        };
      }
    }
    if (Object.keys(plt).length > 0) validated.practiceLevelTargets = plt;
  }

  // Shadow targets
  if (patch.shadowTargets && typeof patch.shadowTargets === 'object' && patch.shadowTargets !== null && Array.isArray(patch.shadowTargets.active)) {
    const active = (patch.shadowTargets.active as Array<{ id: string; name: string; priority: string }>)
      .filter(t => t && VALID_SHADOW_IDS.includes(t.id) && typeof t.name === 'string' && t.name.trim().length > 0 && VALID_SHADOW_PRIORITIES.includes(t.priority))
      .slice(0, 5)
      .map(t => ({ id: t.id, name: t.name.slice(0, 50), priority: t.priority }));
    if (active.length > 0) validated.shadowTargets = { active };
  }

  // Micro techniques
  if (patch.microTechniques && typeof patch.microTechniques === 'object' && patch.microTechniques !== null && !Array.isArray(patch.microTechniques)) {
    const mt: Record<string, string[]> = {};
    for (const [practiceId, techniques] of Object.entries(patch.microTechniques)) {
      if (VALID_PRACTICE_IDS.includes(practiceId) && Array.isArray(techniques)) {
        mt[practiceId] = techniques.filter(t => typeof t === 'string' && t.trim().length > 0).slice(0, 10);
      }
    }
    if (Object.keys(mt).length > 0) validated.microTechniques = mt;
  }

  // Master personas
  if (patch.masterPersonas && typeof patch.masterPersonas === 'object' && patch.masterPersonas !== null && !Array.isArray(patch.masterPersonas)) {
    const mp: Record<string, string> = {};
    for (const [practiceId, masterId] of Object.entries(patch.masterPersonas)) {
      if (VALID_PRACTICE_IDS.includes(practiceId) && VALID_MASTER_IDS.includes(masterId)) {
        mp[practiceId] = masterId;
      }
    }
    if (Object.keys(mp).length > 0) validated.masterPersonas = mp;
  }

  // Social config - preserve all fields, validate mode
  if (patch.socialConfig && typeof patch.socialConfig === 'object' && patch.socialConfig !== null && !Array.isArray(patch.socialConfig)) {
    const sc = patch.socialConfig as Record<string, unknown>;
    if (sc.mode && VALID_SOCIAL_MODES.includes(sc.mode as string)) {
      validated.socialConfig = { ...sc, mode: sc.mode };
    }
  }

  // Intent
  if (patch.intent && typeof patch.intent === 'string' && patch.intent.trim().length > 0) {
    validated.intent = patch.intent.slice(0, 500);
  }

  // Included/excluded practices - check for conflicts
  if (Array.isArray(patch.includedPracticeIds)) {
    validated.includedPracticeIds = patch.includedPracticeIds.filter(id => VALID_PRACTICE_IDS.includes(id));
  }
  if (Array.isArray(patch.excludedPracticeIds)) {
    validated.excludedPracticeIds = patch.excludedPracticeIds.filter(id => VALID_PRACTICE_IDS.includes(id));
  }
  // Remove conflicts: excluded takes precedence
  if (validated.includedPracticeIds && validated.excludedPracticeIds) {
    validated.includedPracticeIds = validated.includedPracticeIds.filter(id => !validated.excludedPracticeIds!.includes(id));
  }

  // Included/excluded tags - check for conflicts
  if (Array.isArray(patch.includedTags)) {
    validated.includedTags = patch.includedTags.filter(t => typeof t === 'string' && t.trim().length > 0).slice(0, 20);
  }
  if (Array.isArray(patch.excludedTags)) {
    validated.excludedTags = patch.excludedTags.filter(t => typeof t === 'string' && t.trim().length > 0).slice(0, 20);
  }
  // Remove conflicts: excluded takes precedence
  if (validated.includedTags && validated.excludedTags) {
    validated.includedTags = validated.includedTags.filter(id => !validated.excludedTags!.includes(id));
  }

  return validated;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const message = String((body as any)?.message ?? "");
    const currentConfig = (body as any)?.currentConfig && typeof (body as any).currentConfig === 'object' && !Array.isArray((body as any).currentConfig)
      ? (body as any).currentConfig as Record<string, unknown>
      : {};
    const context = String((body as any)?.context ?? "config_tuning");

    if (!message.trim()) {
      return new Response(JSON.stringify({ error: "Message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userCtx = await getUserContext(userClient, user.id, {}).catch((e) => {
      console.warn("[parse-session-intent] getUserContext failed:", e);
      return null;
    });
    const aiMode: AiMode = userCtx?.identity?.aiMode === "premium" ? "premium" : "fast";

    const systemPrompt = `You are a consciousness session configuration assistant. You help users personalize their practice sessions through natural conversation.

Your job: parse the user's message and extract a configuration patch that can be applied to their session settings.

AVAILABLE CONFIG FIELDS:
- focusType: focus|attention|self_inquiry|raja_yoga|jnana|bhakti|karma|tantra|kundalini|healing|sleep|energy|relationship|work|creativity|custom
- timeBudgetMin: 1-720 (minutes)
- guideStyle: gentle|direct|inquiry|devotional|silent
- energyMode: low|medium|high|adaptive
- preferredGate: morning|midday|evening|night|flexible
- structure: guided|hybrid|self_directed
- reflectionDepth: micro|standard|deep
- difficultyOverride: gentler|standard|harder
- speedProfile: fast|steady|deep|adaptive
- domainWeights: { relationship, work, finance, health, creativity, spirituality } (0-1 each)
- practiceLevelTargets: { [practiceId]: { practiceId, targetLevel, priority: low|medium|high|required, reason } }
- shadowTargets: { active: [{ id, name, priority }] }
- microTechniques: { [practiceId]: [techniqueId] }
- masterPersonas: { [practiceId]: masterId }
- socialConfig: { mode: solo|partner|group|teacher, ... }
- intent: string (natural language description)
- includedPracticeIds: string[]
- excludedPracticeIds: string[]
- includedTags: string[]
- excludedTags: string[]

PRACTICE IDS: observation, self-inquiry, breath, witnessing, body, bhakti, karma, jnana, raja, kriya, tantra, neuroscience, emotional-healing, loop-dissolution, relationship, work-career, finance, health

SHADOW TARGETS: abandonment, control, unworthiness, perfectionism, avoidance, people-pleasing, anger, grief, anxiety

MASTERS: ramana, krishnamurti, nidargadatta, shankara, patanjali, adiyogi, buddha, lao-tzu, rumi, meera, ramakrishna, hafiz, kabir, gita, gandhi, levine, van-der-kolk, abhinavagupta, osho, hendricks, gottman, csikszentmihalyi, frankl, cameron, pressfield, kabat-zinn, thich-nhat-hanh, eckhart-tolle, byron-katie

CONTEXT: ${context}
CURRENT CONFIG: ${JSON.stringify(currentConfig)}

RULES:
1. Only include fields that the user explicitly wants to change
2. Never suggest changes that violate safety rails (calibration caps, foundation locks)
3. If the user's request is ambiguous, ask for clarification in the confirmation message
4. Always provide a warm, encouraging confirmation message
5. Include suggested follow-up actions the user might want

Return ONLY JSON:
{
  "intent": "extracted intent in 1 sentence",
  "configPatch": { /* only changed fields */ },
  "confirmationMessage": "warm message explaining what was changed",
  "suggestedActions": ["action 1", "action 2"],
  "needsClarification": false,
  "clarificationQuestion": null
}`;

    const r = await aiGatewayFetchWithLang(
      req,
      {
        model: "tier:fast",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
      },
      {},
      { admin, userId: user.id, functionName: "parse-session-intent", aiMode },
    );

    if (!r.ok) {
      const err = await r.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: ParseResponse;
    try {
      const j = await r.json();
      const content = j?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty AI response");
      }
      parsed = JSON.parse(content);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error("Invalid AI response shape");
      }
    } catch (e) {
      console.error("[parse-session-intent] Failed to parse AI response:", e);
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate the config patch against safety rules
    const validatedPatch = validateConfigPatch(parsed.configPatch || {}, userCtx, currentConfig);

    return new Response(JSON.stringify({
      ok: true,
      intent: parsed.intent || message,
      configPatch: validatedPatch,
      confirmationMessage: parsed.confirmationMessage || "I've updated your session settings.",
      suggestedActions: parsed.suggestedActions || [],
      needsClarification: parsed.needsClarification || false,
      clarificationQuestion: parsed.clarificationQuestion || null,
      aiMode,
    } satisfies ParseResponse), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("[parse-session-intent] fatal:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});