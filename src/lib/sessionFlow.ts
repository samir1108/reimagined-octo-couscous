/**
 * SESSION FLOW (ADAPTIVE)
 * Replaced the old rigid Morning 9-step / Evening 8-step / Night PHASE 1-5 scripts
 * with a context + state driven directive. Same exported signatures so all callers
 * (Guide.tsx, useSessionFlow) continue to work unchanged.
 *
 * The actual cognitive routing (state vector, agents, edge cases, insight depth)
 * happens inside the edge functions via supabase/functions/_shared/adaptive-engine.ts.
 * Here we only emit a HIGH-LEVEL surface directive that frames intent + entry context.
 */

export type SessionType = "morning" | "evening" | "night";
export type SessionPhase =
  | "greeting"
  | "theme_introduction"
  | "exploration"
  | "practice"
  | "integration"
  | "closing";

export interface ThemeContext {
  title: string;
  description: string;
  theme_rationale?: string;
  learning_focus?: string;
  daily_intentions?: string[];
  action_items?: string[];
  affirmation?: string;
  focus_areas?: string[];
}

export interface UserProfile {
  userName: string;
  streak: number;
  journeyDay: number;
  bandLevel?: number;
  bandName?: string;
  focusDimension?: string;
  language: string;
}

export interface MorningSessionResult {
  completed: boolean;
  summary?: string;
  insights?: string;
}

export interface DayActivity {
  journalEntries: { count: number; themes?: string[] };
  practiceDone: boolean;
  practiceType?: string;
  practiceDuration?: number;
  tasksCompleted: number;
  tasksMissed: number;
  dominantMood?: string;
  energyLevel?: number;
}

export interface MasterContext {
  id: string;
  name: string;
  tradition?: string;
  keyTeaching?: string;
  quote?: string;
}

export interface SessionFlowContext {
  sessionType: SessionType;
  phase: SessionPhase;
  user: UserProfile;
  theme: ThemeContext;
  master?: MasterContext | null;
  morningSession?: MorningSessionResult;
  dayActivity?: DayActivity;
  yesterdaySummary?: string;
  missedDays?: number;
  chatHistory?: Array<{ role: string; content: string }>;
  /** Concepts the user has near-zero familiarity with (needEngine). */
  unknownConcepts?: string[];
}

// â”€â”€â”€ Public API (unchanged signatures, now delegated to PromptDirector) â”€â”€â”€

import { buildDirectorPrompt, type DirectorContext } from "./promptDirector";

function toDirectorCtx(ctx: SessionFlowContext): DirectorContext {
  return {
    sessionType: ctx.sessionType,
    mode: "open",
    user: {
      userName: ctx.user.userName,
      journeyDay: ctx.user.journeyDay,
      streak: ctx.user.streak,
      missedDays: ctx.missedDays,
      bandLevel: ctx.user.bandLevel,
      bandName: ctx.user.bandName,
      focusDimension: ctx.user.focusDimension,
      language: ctx.user.language,
    },
    theme: ctx.theme
      ? { title: ctx.theme.title, description: ctx.theme.description, rationale: ctx.theme.theme_rationale, affirmation: ctx.theme.affirmation }
      : undefined,
    master: ctx.master ?? null,
    state: {
      yesterdaySummary: ctx.yesterdaySummary,
      lastInsight: ctx.morningSession?.insights,
      dominantMood: ctx.dayActivity?.dominantMood,
      energyLevel: ctx.dayActivity?.energyLevel,
      practiceDoneToday: ctx.dayActivity?.practiceDone,
      unknownConcepts: ctx.unknownConcepts,
    },
  };
}

export function buildSessionSystemPrompt(ctx: SessionFlowContext): string {
  return buildDirectorPrompt(toDirectorCtx(ctx)).systemPrompt;
}

export function buildSessionFirstMessage(ctx: SessionFlowContext): string {
  return buildDirectorPrompt(toDirectorCtx(ctx)).opener;
}

// â”€â”€â”€ Internal builders â”€â”€â”€

function buildBasePrompt(ctx: SessionFlowContext): string {
  const u = ctx.user;
  const t = ctx.theme;
  const m = ctx.master;

  const masterBlock = m
    ? `

MASTER PERSONA (this entire session is led by this Master â€” speak AS them, not about them):
â€¢ Name: ${m.name}${m.tradition ? ` (${m.tradition})` : ""}
${m.keyTeaching ? `â€¢ Core teaching: ${m.keyTeaching}` : ""}
${m.quote ? `â€¢ Voice anchor: "${m.quote}"` : ""}
â€¢ Frame today's thread (${t?.title || "open"}) THROUGH this Master's lens.
â€¢ Use first-person sparingly ("I notice...", "Sit with me here..."). Never break character into "the AI" or "the system".
â€¢ Keep their tone, but obey the brevity rules below.
`
    : "";

  return `You are the user's adaptive consciousness companion.${masterBlock}
USER: ${u.userName} | streak: ${u.streak} | journey day: ${u.journeyDay}${u.bandName ? ` | phase: ${u.bandName}` : ""}
THEME (soft thread, do NOT lecture about it): ${t?.title || "open"}
${t?.description ? `Why this thread: ${t.description}` : ""}
${ctx.yesterdaySummary ? `Yesterday in one line: ${ctx.yesterdaySummary}` : ""}
${ctx.missedDays ? `Days missed: ${ctx.missedDays} â€” celebrate return, no guilt.` : ""}

CORE STANCE:
â€¢ Open like a human guru would â€” a warm "Hi" / "Hello" / "Namaste" with their name. Never start cold or mid-thought.
â€¢ If this is the user's first session (journey day â‰¤ 1), briefly name the agenda before any question: why this app exists (most suffering = not knowing how to run our own inner system; that is what yoga truly is), what this space is (a quiet place to learn that one small session at a time), then invite them in with one honest question.
â€¢ English only. No Hindi, Hinglish, or Sanskrit names.
â€¢ No rigid steps, no "Phase 1 / Phase 2" structures, no scripted sequences.
â€¢ Speak to THIS moment, not to a curriculum.
â€¢ One precise question beats three vague reflections.
â€¢ 2-5 sentences typical (a touch longer is fine on the very first session to set context). Brevity is a teaching.
`;
}

function buildAdaptiveSurface(ctx: SessionFlowContext): string {
  const dayActivity = ctx.dayActivity;
  const morningDone = ctx.morningSession?.completed;

  let surface = "";

  switch (ctx.sessionType) {
    case "morning":
      surface = `
ENTRY CONTEXT: morning. Energy is fresh but often unclear.
â€¢ Don't deliver a lecture about today's theme. Let it surface naturally if relevant.
â€¢ Start by reading their actual state (sleep, body, lingering night thoughts) before any guidance.
â€¢ If they arrive flat or anxious â†’ ground first, no inquiry yet.
â€¢ If they arrive open â†’ one clean noticing question is enough.
â€¢ If returning after a gap, drop all structure. Just welcome and ask one honest question.`;
      break;

    case "evening":
      surface = `
ENTRY CONTEXT: evening. Energy is settling. This is reflection, not analysis.
${morningDone ? `â€¢ Morning was done. You may softly reference: "${ctx.morningSession?.insights || "their morning thread"}".` : "â€¢ Morning was missed. Don't make it heavy â€” ask what the day actually wanted from them."}
${dayActivity?.practiceDone ? `â€¢ Practice happened today (${dayActivity.practiceType || "practice"}). Acknowledge once, then move on.` : ""}
${dayActivity && dayActivity.tasksMissed > 0 ? `â€¢ ${dayActivity.tasksMissed} task(s) didn't get done. Curious tone, never accusatory.` : ""}
â€¢ Celebrate even ONE moment of awareness from the day.
â€¢ If they want to vent â€” let them. Don't rush to gratitude.
â€¢ Close with at most ONE thread to carry into tomorrow.`;
      break;

    case "night":
      surface = `
ENTRY CONTEXT: night. Sanctuary mode.
â€¢ NO inquiry. NO problem-solving. NO frameworks.
â€¢ 1-3 short sentences max. Soft, releasing, almost lullaby tone.
â€¢ Permission to rest is the whole teaching.
â€¢ If they try to analyze, gently redirect: "Tonight isn't for figuring it out."`;
      break;
  }

  return surface + `\n\n(The adaptive engine in the edge function will append a per-turn directive with state, stage, and routing. Obey that as the final word.)`;
}

// â”€â”€â”€ Helpers (kept for back-compat) â”€â”€â”€

export function getSessionTypeFromTime(hour?: number): SessionType {
  const h = hour ?? new Date().getHours();
  if (h >= 5 && h < 17) return "morning";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function generateFirstMessage(ctx: SessionFlowContext): string {
  return buildSessionFirstMessage(ctx);
}

export function generateSystemPrompt(ctx: SessionFlowContext): string {
  return buildSessionSystemPrompt(ctx);
}
