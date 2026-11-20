// Master Mirror question bank.
// Wave 1: full coverage for Cognitive (22 questions). Other categories use 1
// generic scenario+slider per dimension (auto-generated) so the master mirror
// is fully runnable end-to-end. Wave 2 will replace these with hand-crafted Qs.

import { DIMENSIONS } from "./dimensions";

export type QuestionType = "scenario" | "slider" | "text";

export interface MirrorQuestion {
  id: string;             // unique
  dimension_id: string;
  type: QuestionType;
  prompt: string;
  // For scenario: pick one option; choices[].weight maps 0-100
  choices?: { label: string; weight: number }[];
  // For slider: min/max labels
  sliderLabels?: { low: string; high: string };
  // For text: placeholder
  placeholder?: string;
}

// ─── Hand-crafted: Cognitive (22 questions, 2 per dimension) ───
const COGNITIVE: MirrorQuestion[] = [
  // analytical_thinking
  { id: "cog_at_1", dimension_id: "cog_analytical_thinking", type: "scenario",
    prompt: "A complex problem lands on your plate at work. Your first move is:",
    choices: [
      { label: "Break it into smaller parts and map dependencies", weight: 90 },
      { label: "Talk it through with someone to find the angle", weight: 60 },
      { label: "Sit with it until a sense of direction arises", weight: 50 },
      { label: "Try the most obvious solution and adjust", weight: 30 },
    ]},
  { id: "cog_at_2", dimension_id: "cog_analytical_thinking", type: "slider",
    prompt: "How often do you find flaws in arguments others miss?",
    sliderLabels: { low: "Rarely", high: "Almost always" } },

  // creative_thinking
  { id: "cog_ct_1", dimension_id: "cog_creative_thinking", type: "scenario",
    prompt: "When the standard solution doesn't fit, you tend to:",
    choices: [
      { label: "Combine ideas from unrelated fields", weight: 90 },
      { label: "Iterate on what exists with small twists", weight: 60 },
      { label: "Wait for inspiration", weight: 40 },
      { label: "Ask others for fresh angles", weight: 50 },
    ]},
  { id: "cog_ct_2", dimension_id: "cog_creative_thinking", type: "slider",
    prompt: "How often do original ideas come to you, unprompted?",
    sliderLabels: { low: "Rarely", high: "Daily" } },

  // meta_cognition
  { id: "cog_mc_1", dimension_id: "cog_meta_cognition", type: "scenario",
    prompt: "You catch yourself getting upset. What usually happens next?",
    choices: [
      { label: "I observe the reaction and ask what's underneath", weight: 95 },
      { label: "I name the feeling and let it move", weight: 75 },
      { label: "I push it down and continue", weight: 25 },
      { label: "I act on it and reflect later — sometimes", weight: 40 },
    ]},
  { id: "cog_mc_2", dimension_id: "cog_meta_cognition", type: "slider",
    prompt: "How aware are you of your own thinking patterns in real time?",
    sliderLabels: { low: "Rarely notice", high: "Constantly aware" } },

  // pattern_recognition
  { id: "cog_pr_1", dimension_id: "cog_pattern_recognition", type: "scenario",
    prompt: "Reading a long document, what catches you first?",
    choices: [
      { label: "The structural pattern — what kind of argument it is", weight: 90 },
      { label: "Repeating themes or words", weight: 75 },
      { label: "The conclusion and key facts", weight: 50 },
      { label: "I read linearly and let it unfold", weight: 30 },
    ]},
  { id: "cog_pr_2", dimension_id: "cog_pattern_recognition", type: "slider",
    prompt: "How often do you spot the same pattern across very different domains?",
    sliderLabels: { low: "Rarely", high: "Almost daily" } },

  // learning_speed
  { id: "cog_ls_1", dimension_id: "cog_learning_speed", type: "slider",
    prompt: "How quickly do you usually pick up a brand new skill or concept?",
    sliderLabels: { low: "Slowly, with reps", high: "Almost immediately" } },
  { id: "cog_ls_2", dimension_id: "cog_learning_speed", type: "text",
    prompt: "Name the last thing you learned faster than people around you.",
    placeholder: "A skill, idea, tool…" },

  // cognitive_flexibility
  { id: "cog_cf_1", dimension_id: "cog_cognitive_flexibility", type: "scenario",
    prompt: "Plans change at the last minute. Inside, you usually:",
    choices: [
      { label: "Re-orient quickly and find the new advantage", weight: 90 },
      { label: "Feel a brief jolt, then adapt", weight: 70 },
      { label: "Resist for a while before accepting", weight: 40 },
      { label: "Get stuck and need time", weight: 20 },
    ]},
  { id: "cog_cf_2", dimension_id: "cog_cognitive_flexibility", type: "slider",
    prompt: "How easily can you hold two opposing views at the same time?",
    sliderLabels: { low: "Difficult", high: "Natural" } },

  // abstract_reasoning
  { id: "cog_ar_1", dimension_id: "cog_abstract_reasoning", type: "slider",
    prompt: "How comfortable are you with ideas that have no concrete example?",
    sliderLabels: { low: "Uncomfortable", high: "Very at home" } },
  { id: "cog_ar_2", dimension_id: "cog_abstract_reasoning", type: "scenario",
    prompt: "When you read philosophy or math, you mostly:",
    choices: [
      { label: "Build mental models and play with them", weight: 90 },
      { label: "Translate to examples first", weight: 60 },
      { label: "Skim and grab what feels useful", weight: 35 },
      { label: "Avoid it", weight: 15 },
    ]},

  // decision_quality
  { id: "cog_dq_1", dimension_id: "cog_decision_quality", type: "slider",
    prompt: "Looking at decisions you made last year — how many would you make again?",
    sliderLabels: { low: "Few", high: "Almost all" } },
  { id: "cog_dq_2", dimension_id: "cog_decision_quality", type: "scenario",
    prompt: "Before a big decision, you usually:",
    choices: [
      { label: "Map outcomes, sit with it, then decide cleanly", weight: 90 },
      { label: "Ask a few trusted voices", weight: 65 },
      { label: "Go with gut and refine later", weight: 55 },
      { label: "Procrastinate until forced", weight: 25 },
    ]},

  // memory_integration
  { id: "cog_mi_1", dimension_id: "cog_memory_integration", type: "slider",
    prompt: "How often do you connect today's experience to something from years ago?",
    sliderLabels: { low: "Rarely", high: "Constantly" } },
  { id: "cog_mi_2", dimension_id: "cog_memory_integration", type: "text",
    prompt: "Describe one memory that quietly shapes how you see the world.",
    placeholder: "It can be small…" },

  // conceptual_depth
  { id: "cog_cd_1", dimension_id: "cog_conceptual_depth", type: "slider",
    prompt: "When you understand something, how deep do you usually go?",
    sliderLabels: { low: "Surface", high: "First principles" } },
  { id: "cog_cd_2", dimension_id: "cog_conceptual_depth", type: "scenario",
    prompt: "A topic genuinely interests you. You typically:",
    choices: [
      { label: "Read until I can teach it", weight: 90 },
      { label: "Read enough to use it well", weight: 65 },
      { label: "Watch a few summaries", weight: 40 },
      { label: "Move on quickly", weight: 20 },
    ]},

  // intuitive_knowing
  { id: "cog_ik_1", dimension_id: "cog_intuitive_knowing", type: "slider",
    prompt: "How often does a 'knowing' arrive before you can explain why?",
    sliderLabels: { low: "Rarely", high: "Often" } },
  { id: "cog_ik_2", dimension_id: "cog_intuitive_knowing", type: "scenario",
    prompt: "When intuition and analysis disagree, you usually:",
    choices: [
      { label: "Pause and look for the third truth they share", weight: 90 },
      { label: "Trust intuition first", weight: 70 },
      { label: "Trust analysis first", weight: 60 },
      { label: "Defer to others", weight: 25 },
    ]},
];

// ─── Auto-generated minimal coverage for the other 88 dimensions ───
const OTHER: MirrorQuestion[] = DIMENSIONS
  .filter((d) => d.category !== "cognitive")
  .flatMap((d) => [
    {
      id: `${d.id}_q1`,
      dimension_id: d.id,
      type: "slider" as const,
      prompt: `How developed do you feel your ${d.label.toLowerCase()} is right now?`,
      sliderLabels: { low: "Just beginning", high: "Deeply developed" },
    },
    {
      id: `${d.id}_q2`,
      dimension_id: d.id,
      type: "text" as const,
      prompt: `Give one concrete example of ${d.label.toLowerCase()} showing up — or being absent — in your life recently.`,
      placeholder: "Anything that comes to mind…",
    },
  ]);

export const QUESTIONS: MirrorQuestion[] = [...COGNITIVE, ...OTHER];

export const totalQuestions = () => QUESTIONS.length;
