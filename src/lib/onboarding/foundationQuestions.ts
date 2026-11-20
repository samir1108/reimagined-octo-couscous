/**
 * Foundation Onboarding v2 — 8 hand-authored questions.
 * Each option carries scoring tags the analyzer reads.
 *
 * 6 core faculties:
 *   1. Active loop families
 *   2. Practice band / tempo
 *   3. Archetype belief + shadow
 *   4. Path affinity
 *   5. Re-think theme
 *   6. Belief / worldview
 *
 * 2 supplementary:
 *   7. Dominant centre (head/heart/gut)
 *   8. Practice history
 */

import type { ArchetypeSlug } from "@/data/onboarding/archetypes";

export type Brain = "head" | "heart" | "gut";

export type PathId = "kriya" | "karma" | "bhakti" | "jnana" | "tantra" | "dhyana";

export interface FoundationOption {
  id: string;
  label: string;
  hint?: string;
  band?: number;
  brain?: Brain;
  loops?: string[];
  paths?: Partial<Record<PathId, number>>;
  archetype?: ArchetypeSlug;
}

export type FoundationQuestion =
  | {
      id: string;
      kind: "choice";
      title: string;
      subtitle?: string;
      multi?: false;
      options: FoundationOption[];
    }
  | {
      id: string;
      kind: "choice";
      title: string;
      subtitle?: string;
      multi: true;
      maxSelect?: number;
      options: FoundationOption[];
    }
  | {
      id: string;
      kind: "scale";
      title: string;
      subtitle?: string;
      min: number;
      max: number;
      minLabel: string;
      maxLabel: string;
      scoreAs: "discomfort_tolerance" | "intuition_trust";
    }
  | {
      id: string;
      kind: "text";
      title: string;
      subtitle?: string;
      placeholder: string;
      maxLength: number;
    };

export const FOUNDATION_QUESTIONS: FoundationQuestion[] = [
  // ── 1. ACTIVE LOOPS (must) ──────────────────────────────────────────
  {
    id: "active_loops",
    kind: "choice",
    title: "Which of these patterns runs loud in you right now?",
    subtitle: "Up to 3. Be honest.",
    multi: true,
    maxSelect: 3,
    options: [
      { id: "loop_not_enough", label: "Not enough — I'm not doing enough", loops: ["VAL001", "BLF001"] },
      { id: "loop_control", label: "Control — if I let go, it all falls apart", loops: ["CTL003", "CTL001"] },
      { id: "loop_avoidance", label: "Avoidance — distraction, scrolling, numbing", loops: ["AVD001", "HAB001"] },
      { id: "loop_worry", label: "Worry — same fear, same story, same knot", loops: ["SRV001", "CTL002"] },
      { id: "loop_people_pleasing", label: "People-pleasing — I can't say no", loops: ["SOC001", "VAL002"] },
      { id: "loop_identity", label: "Identity — 'who am I really?' won't leave", loops: ["IDN001", "IDN002"] },
      { id: "loop_rage", label: "Rage / anger — it rises fast", loops: ["EMO001", "SRV002"] },
      { id: "loop_comparison", label: "Comparison — their life, my lack", loops: ["VAL025", "SOC002"] },
    ],
  },

  // ── 2. BAND / TEMPO (must) ──────────────────────────────────────────
  {
    id: "band_tempo",
    kind: "choice",
    title: "What practice tempo can you actually sustain right now?",
    subtitle: "Not aspiration. What your current life will actually give.",
    options: [
      { id: "gentle", label: "Gentle — one small ritual, sustainable forever", band: 1.5 },
      { id: "moderate", label: "Moderate — daily practice, moderate intensity", band: 3.0 },
      { id: "fierce", label: "Fierce — I want tapas, I want it to burn", band: 4.5 },
      { id: "monastic", label: "Monastic — I want most of the day inside this", band: 5.5 },
    ],
  },

  // ── 3. ARCHETYPE BELIEF (must) ─────────────────────────────────────
  {
    id: "archetype_belief",
    kind: "choice",
    title: "When you daydream about your best self, they are...",
    options: [
      { id: "seeker", label: "Free — always learning, always moving", archetype: "seeker" },
      { id: "devotee", label: "In love — dissolved into something larger", archetype: "devotee" },
      { id: "warrior", label: "Unshakeable — cutting through anything", archetype: "warrior" },
      { id: "sage", label: "Wise — quiet, clear, others come to them", archetype: "sage" },
      { id: "mystic", label: "Between worlds — seeing what others can't", archetype: "mystic" },
      { id: "healer", label: "A quiet presence people heal near", archetype: "healer" },
      { id: "lover", label: "Fully alive — sensual, intimate, here", archetype: "lover" },
      { id: "creator", label: "Making something the world hasn't seen", archetype: "creator" },
      { id: "ruler", label: "Holding a house / kingdom / team well", archetype: "ruler" },
      { id: "rebel", label: "Refusing the false — even alone", archetype: "rebel" },
      { id: "hermit", label: "Alone in the mountain, undistracted", archetype: "hermit" },
      { id: "servant", label: "Useful — small acts, done well", archetype: "servant" },
    ],
  },

  // ── 4. PATH AFFINITY (must) ────────────────────────────────────────
  {
    id: "path_affinity",
    kind: "choice",
    title: "Which doorway is closest to you right now?",
    options: [
      { id: "bhakti", label: "Devotion — music, tears, surrender", paths: { bhakti: 3, tantra: 1 } },
      { id: "jnana", label: "Knowing — inquiry, clarity, truth", paths: { jnana: 3, kriya: 1 } },
      { id: "karma", label: "Action — service, doing, results", paths: { karma: 3 } },
      { id: "dhyana", label: "Stillness — silent sitting, depth", paths: { dhyana: 3, kriya: 1 } },
      { id: "tantra", label: "Sacred body — breath, energy, weaving", paths: { tantra: 3 } },
      { id: "kriya", label: "Energy work — breath, inner technique, aliveness", paths: { kriya: 3, tantra: 1 } },
    ],
  },

  // ── 5. RE-THINK THEME (must) ───────────────────────────────────────
  {
    id: "re_think",
    kind: "choice",
    title: "What are you here to rethink?",
    options: [
      { id: "belief", label: "A belief I've carried since childhood" },
      { id: "relationship", label: "How I relate to others" },
      { id: "work", label: "My relationship with work and effort" },
      { id: "body", label: "How I treat this body" },
      { id: "emotion", label: "What I allow myself to feel" },
      { id: "identity", label: "Who I think I am" },
      { id: "future", label: "What I'm building toward" },
    ],
  },

  // ── 6. BELIEF / WORLDVIEW (must) ───────────────────────────────────
  {
    id: "belief_state",
    kind: "choice",
    title: "Which feels most true?",
    options: [
      { id: "life_happens_to_me", label: "Life happens to me", band: 1 },
      { id: "i_have_some_choice", label: "I have some choice in how I respond", band: 2.5 },
      { id: "awareness_shapes_reality", label: "Awareness shapes my reality", band: 4 },
      { id: "only_awareness", label: "There is only awareness", band: 5.5 },
    ],
  },

  // ── 7. DOMINANT CENTRE (supplementary) ─────────────────────────────
  {
    id: "brain_centre",
    kind: "choice",
    title: "When something hard happens, where do you go first?",
    subtitle: "Notice the very first move.",
    options: [
      { id: "head", label: "Into my head — analyze, plan, replay", brain: "head" },
      { id: "heart", label: "Into my heart — feel, reach for someone", brain: "heart" },
      { id: "gut", label: "Into action — move, fix, do something", brain: "gut" },
    ],
  },

  // ── 8. PRACTICE HISTORY (supplementary) ────────────────────────────
  {
    id: "practice_history",
    kind: "choice",
    title: "How familiar are you with watching your own thoughts?",
    options: [
      { id: "brand_new", label: "Brand new to this" },
      { id: "tried_on_off", label: "I've tried, on and off" },
      { id: "practice_regularly", label: "I practice regularly" },
      { id: "steady_part", label: "It's a steady part of my life" },
    ],
  },
];

export type FoundationQuestionType = typeof FOUNDATION_QUESTIONS[number];
