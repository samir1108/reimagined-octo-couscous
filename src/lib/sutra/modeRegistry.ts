// Unified Mode Registry — single source of truth for every session "door"
// the orchestrator can pick.
//
// Sources merged here:
//   • All 25 GuideModes (src/lib/guideModes.ts)
//   • Witness / Wisdom / Journal / Practice / Evening surfaces
//   • Master archetype sessions (Temple)
//   • Practice variants (breathwork, kriya, somatic, body, tantra, neuro)
//
// Total: 50+ entries. The orchestrator (whatNext) reads this to compose
// single OR compound sessions.

import type { Practice } from "./practices";

export type ModeSurface =
  | "guide"        // /app/guide?mode=...
  | "journal"      // /app/journal
  | "temple"       // /temple/:masterId
  | "witness"      // /app/witness
  | "wisdom"       // wisdom card surface
  | "evening"      // /app/evening-reflection
  | "practice";    // /app/practice

export interface ModeEntry {
  id: string;
  label: string;
  surface: ModeSurface;
  practice: Practice;
  /** Can this mode be chained into a compound session block? */
  supportsCompound: boolean;
  defaultDurationSec: number;
  /** Domains it especially serves; 'any' means universal */
  domainsItServes: string[] | "any";
  /** Where to navigate when this mode is picked */
  route: (ctx: { sessionId?: string }) => string;
  /** Quick fit hints for state matching */
  stateFit: {
    energy?: Array<"low" | "medium" | "high">;
    mood?: string[];
    minTimeSec?: number;
    maxTimeSec?: number;
  };
  /** Brief intro/why text shown on the SessionIntroCard */
  intro: string;
}

const route = {
  guide: (mode: string) => `/app/guide?mode=${mode}`,
  journal: (prompt?: string) =>
    prompt ? `/app/journal?prompt=${encodeURIComponent(prompt)}` : "/app/journal",
  witness: () => "/app/guide?mode=witness",
  evening: () => "/app/evening-reflection",
  practice: () => "/app/practice",
  temple: (master: string) => `/temple/${master}`,
};

export const MODE_REGISTRY: ModeEntry[] = [
  // ─── OBSERVE family ───
  { id: "observe-micro", label: "Notice 3 things", surface: "orb", practice: "observe",
    supportsCompound: true, defaultDurationSec: 90, domainsItServes: "any",
    route: () => "/app", stateFit: { minTimeSec: 60 },
    intro: "Pause. Notice three things present right now." },
  { id: "observe-witness", label: "Silent witness", surface: "witness", practice: "observe",
    supportsCompound: true, defaultDurationSec: 600, domainsItServes: "any",
    route: () => route.witness(), stateFit: { energy: ["medium", "high"], minTimeSec: 300 },
    intro: "Sit. Watch what arises without engaging." },
  { id: "observe-mode", label: "Observe & report", surface: "guide", practice: "observe",
    supportsCompound: true, defaultDurationSec: 360, domainsItServes: "any",
    route: () => route.guide("observation"), stateFit: {},
    intro: "Observe, report, and deepen awareness." },
  { id: "observe-task", label: "Awareness task", surface: "guide", practice: "observe",
    supportsCompound: true, defaultDurationSec: 240, domainsItServes: "any",
    route: () => route.guide("task_giver"), stateFit: { energy: ["medium", "high"] },
    intro: "Get a real-life awareness task for your situation." },

  // ─── INQUIRY family (Guide modes) ───
  { id: "inquiry-open", label: "Open conversation", surface: "guide", practice: "inquiry",
    supportsCompound: false, defaultDurationSec: 600, domainsItServes: "any",
    route: () => route.guide("open"), stateFit: { minTimeSec: 300 },
    intro: "Speak with the Guide. Anything that's alive." },
  { id: "inquiry-self", label: "Who am I?", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.guide("self_inquiry"), stateFit: { energy: ["medium", "high"] },
    intro: "Turn attention back to the one asking." },
  { id: "inquiry-shadow", label: "Shadow work", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 720, domainsItServes: "any",
    route: () => route.guide("shadow_work"), stateFit: { energy: ["medium"] },
    intro: "Meet what you usually push away." },
  { id: "inquiry-pattern", label: "Pattern finder", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 540, domainsItServes: "any",
    route: () => route.guide("pattern_finder"), stateFit: {},
    intro: "Detect loops and recurring behaviors." },
  { id: "inquiry-loop", label: "Loop explorer", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 600, domainsItServes: "any",
    route: () => route.guide("loop_explorer"), stateFit: {},
    intro: "Deep-dive into a specific behavioral loop." },
  { id: "inquiry-decision", label: "Decision clarity", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 540, domainsItServes: ["work", "self"],
    route: () => route.guide("decision"), stateFit: { energy: ["medium", "high"] },
    intro: "Values-based clarity for a decision you're sitting with." },
  { id: "inquiry-relationship", label: "Relationship mirror", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 600, domainsItServes: ["relationships"],
    route: () => route.guide("relationship"), stateFit: {},
    intro: "Explore patterns, projections, and triggers." },
  { id: "inquiry-future-self", label: "Future self", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.guide("future_self"), stateFit: { energy: ["medium", "high"] },
    intro: "Speak with the wisest version of yourself." },
  { id: "inquiry-inner-child", label: "Inner child", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 600, domainsItServes: "any",
    route: () => route.guide("inner_child"), stateFit: { energy: ["medium"] },
    intro: "Heal childhood wounds, gently reparent." },
  { id: "inquiry-checkin", label: "Consciousness check-in", surface: "guide", practice: "inquiry",
    supportsCompound: false, defaultDurationSec: 720, domainsItServes: "any",
    route: () => route.guide("consciousness_checkin"), stateFit: { energy: ["medium", "high"], minTimeSec: 600 },
    intro: "Periodic deep assessment of your inner state." },
  { id: "inquiry-anger", label: "Anger alchemy", surface: "guide", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.guide("anger"), stateFit: { mood: ["agitated", "angry"] },
    intro: "Transform anger safely — not suppress it." },

  // ─── BHAKTI family ───
  { id: "bhakti-gratitude-journal", label: "Gratitude", surface: "journal", practice: "bhakti",
    supportsCompound: true, defaultDurationSec: 180, domainsItServes: "any",
    route: () => route.journal("Three things you are grateful for, and why."), stateFit: {},
    intro: "Name what you are grateful for." },
  { id: "bhakti-gratitude-guide", label: "Gratitude & joy", surface: "guide", practice: "bhakti",
    supportsCompound: true, defaultDurationSec: 360, domainsItServes: "any",
    route: () => route.guide("gratitude"), stateFit: {},
    intro: "Celebrate wins. Cultivate appreciation." },
  { id: "bhakti-manifestation", label: "Sankalpa / intention", surface: "guide", practice: "bhakti",
    supportsCompound: true, defaultDurationSec: 420, domainsItServes: "any",
    route: () => route.guide("manifestation"), stateFit: { energy: ["medium", "high"] },
    intro: "Set intention. Plant the seed." },

  // ─── WITNESS family ───
  { id: "witness-silent", label: "Pure witness", surface: "witness", practice: "witness",
    supportsCompound: false, defaultDurationSec: 900, domainsItServes: "any",
    route: () => route.witness(), stateFit: { energy: ["medium", "high"], minTimeSec: 300 },
    intro: "Distraction-free presence training." },
  { id: "witness-death", label: "Death meditation", surface: "guide", practice: "witness",
    supportsCompound: true, defaultDurationSec: 540, domainsItServes: "any",
    route: () => route.guide("death_meditation"), stateFit: { energy: ["medium", "high"] },
    intro: "Mortality contemplation for perspective." },

  // ─── KARMA family ───
  { id: "karma-action", label: "Action as practice", surface: "journal", practice: "karma",
    supportsCompound: true, defaultDurationSec: 240, domainsItServes: ["work", "relationships"],
    route: () => route.journal("What act of service can you offer today, with no expectation?"), stateFit: {},
    intro: "Service without grasping for outcome." },
  { id: "karma-creative", label: "Creative flow", surface: "guide", practice: "karma",
    supportsCompound: true, defaultDurationSec: 540, domainsItServes: "any",
    route: () => route.guide("creative"), stateFit: { energy: ["medium", "high"] },
    intro: "Unlock creativity. Let what wants to be expressed, arrive." },

  // ─── BREATH family ───
  { id: "breath-reset", label: "Breath reset", surface: "orb", practice: "breath",
    supportsCompound: true, defaultDurationSec: 60, domainsItServes: "any",
    route: () => "/app", stateFit: { mood: ["agitated", "stressed"], minTimeSec: 60 },
    intro: "Sixty seconds of conscious breathing." },
  { id: "breath-pranayama", label: "Pranayama", surface: "practice", practice: "breath",
    supportsCompound: true, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.practice(), stateFit: { energy: ["medium", "high"] },
    intro: "Structured breathwork for energy regulation." },
  { id: "breath-guide", label: "Guided breathwork", surface: "guide", practice: "breath",
    supportsCompound: true, defaultDurationSec: 420, domainsItServes: "any",
    route: () => route.guide("breathwork"), stateFit: {},
    intro: "Pranayama techniques and guided breathing." },

  // ─── BODY family ───
  { id: "body-scan", label: "Body scan", surface: "guide", practice: "body",
    supportsCompound: true, defaultDurationSec: 360, domainsItServes: ["health"],
    route: () => route.guide("somatic"), stateFit: {},
    intro: "Move attention through the body." },
  { id: "body-somatic", label: "Somatic release", surface: "guide", practice: "body",
    supportsCompound: true, defaultDurationSec: 540, domainsItServes: ["health"],
    route: () => route.guide("somatic"), stateFit: { mood: ["tense", "anxious"] },
    intro: "Release stored tension through awareness." },
  { id: "body-emotional", label: "Emotional support", surface: "guide", practice: "body",
    supportsCompound: true, defaultDurationSec: 600, domainsItServes: "any",
    route: () => route.guide("therapy"), stateFit: { mood: ["sad", "agitated"] },
    intro: "Safe space for processing feelings." },

  // ─── JNANA family ───
  { id: "jnana-wisdom", label: "Wisdom teaching", surface: "wisdom", practice: "jnana",
    supportsCompound: true, defaultDurationSec: 240, domainsItServes: "any",
    route: () => route.guide("wisdom"), stateFit: {},
    intro: "A short teaching to contemplate." },
  { id: "jnana-philosophy", label: "Philosophy", surface: "guide", practice: "jnana",
    supportsCompound: true, defaultDurationSec: 540, domainsItServes: "any",
    route: () => route.guide("philosophy"), stateFit: { energy: ["medium", "high"] },
    intro: "Vedanta, Stoicism, Buddhism — meet them live." },
  { id: "jnana-theory", label: "Theory & frameworks", surface: "guide", practice: "jnana",
    supportsCompound: true, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.guide("theory"), stateFit: { energy: ["medium", "high"] },
    intro: "Learn consciousness concepts and frameworks." },
  { id: "jnana-study", label: "Sutra study", surface: "wisdom", practice: "jnana",
    supportsCompound: true, defaultDurationSec: 420, domainsItServes: "any",
    route: () => route.guide("sutra_study"), stateFit: { energy: ["medium", "high"] },
    intro: "Deep dive into a single sutra." },

  // ─── RAJA family ───
  { id: "raja-discipline", label: "Daily discipline", surface: "journal", practice: "raja",
    supportsCompound: true, defaultDurationSec: 240, domainsItServes: ["self", "work"],
    route: () => route.journal("What discipline is asking to be honored today?"), stateFit: {},
    intro: "Structure as the path." },
  { id: "raja-evening-intention", label: "Evening intention", surface: "guide", practice: "raja",
    supportsCompound: true, defaultDurationSec: 300, domainsItServes: "any",
    route: () => route.guide("evening_intention"), stateFit: {},
    intro: "Set one powerful intention for the evening ahead." },

  // ─── TANTRA family ───
  { id: "tantra-energy", label: "Energy awareness", surface: "practice", practice: "tantra",
    supportsCompound: true, defaultDurationSec: 360, domainsItServes: "any",
    route: () => route.practice(), stateFit: { energy: ["medium", "high"] },
    intro: "Feel the body's energetic field." },
  { id: "tantra-dream", label: "Dream analysis", surface: "guide", practice: "tantra",
    supportsCompound: false, defaultDurationSec: 540, domainsItServes: "any",
    route: () => route.guide("dream_analysis"), stateFit: {},
    intro: "Explore dream symbols and meanings." },

  // ─── NEURO family ───
  { id: "neuro-cognitive", label: "Cognitive reframe", surface: "guide", practice: "neuro",
    supportsCompound: true, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.guide("therapy"), stateFit: {},
    intro: "Examine the thought, not just the feeling." },
  { id: "neuro-pattern", label: "Pattern interrupt", surface: "guide", practice: "neuro",
    supportsCompound: true, defaultDurationSec: 360, domainsItServes: "any",
    route: () => route.guide("pattern_finder"), stateFit: { mood: ["agitated", "stressed"] },
    intro: "Catch the loop before it catches you." },

  // ─── KRIYA family ───
  { id: "kriya-cleanse", label: "Cleansing breath", surface: "practice", practice: "kriya",
    supportsCompound: true, defaultDurationSec: 300, domainsItServes: "any",
    route: () => route.practice(), stateFit: { energy: ["medium", "high"] },
    intro: "Purify through structured action." },
  { id: "kriya-energetic", label: "Energetic kriya", surface: "practice", practice: "kriya",
    supportsCompound: true, defaultDurationSec: 600, domainsItServes: "any",
    route: () => route.practice(), stateFit: { energy: ["high"] },
    intro: "Activate. Purify. Integrate." },

  // ─── EVENING / INTEGRATION ───
  { id: "evening-reflection-full", label: "Evening reflection", surface: "evening", practice: "observe",
    supportsCompound: false, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.evening(), stateFit: {},
    intro: "Close the day's loop." },
  { id: "evening-guide", label: "Evening reflection (guided)", surface: "guide", practice: "observe",
    supportsCompound: false, defaultDurationSec: 360, domainsItServes: "any",
    route: () => route.guide("evening_reflection"), stateFit: {},
    intro: "Guided 3–5 min reflection to close your day with awareness." },

  // ─── JOURNAL primaries ───
  { id: "journal-open", label: "Open journal", surface: "journal", practice: "observe",
    supportsCompound: true, defaultDurationSec: 360, domainsItServes: "any",
    route: () => route.journal(), stateFit: {},
    intro: "Free-write what's alive in you." },
  { id: "journal-shadow", label: "Shadow journal", surface: "journal", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 480, domainsItServes: "any",
    route: () => route.journal("What did you push away today? What is it asking?"),
    stateFit: { energy: ["medium"] },
    intro: "Write what you usually avoid." },
  { id: "journal-mirror", label: "Relationship mirror journal", surface: "journal", practice: "inquiry",
    supportsCompound: true, defaultDurationSec: 360, domainsItServes: ["relationships"],
    route: () => route.journal("Who triggered you most this week? What do they reflect?"),
    stateFit: {},
    intro: "What relationships are showing you about yourself." },

  // ─── MASTERS (Temple) — archetype routes; resolved by Temple Hall ───
  { id: "master-vedanta", label: "Sit with a Vedanta master", surface: "temple", practice: "jnana",
    supportsCompound: false, defaultDurationSec: 720, domainsItServes: "any",
    route: () => route.temple("ramana"), stateFit: { energy: ["medium", "high"], minTimeSec: 600 },
    intro: "Direct teachings on the Self." },
  { id: "master-bhakti", label: "Sit with a Bhakti master", surface: "temple", practice: "bhakti",
    supportsCompound: false, defaultDurationSec: 720, domainsItServes: "any",
    route: () => route.temple("mirabai"), stateFit: { minTimeSec: 600 },
    intro: "Devotion as the path." },
  { id: "master-tantra", label: "Sit with a Tantra master", surface: "temple", practice: "tantra",
    supportsCompound: false, defaultDurationSec: 720, domainsItServes: "any",
    route: () => route.temple("osho"), stateFit: { energy: ["high"], minTimeSec: 600 },
    intro: "Energy as the doorway." },
  { id: "master-zen", label: "Sit with a Zen master", surface: "temple", practice: "witness",
    supportsCompound: false, defaultDurationSec: 720, domainsItServes: "any",
    route: () => route.temple("dogen"), stateFit: { energy: ["medium", "high"], minTimeSec: 600 },
    intro: "Just sitting. Just this." },
  { id: "master-karma", label: "Sit with a Karma master", surface: "temple", practice: "karma",
    supportsCompound: false, defaultDurationSec: 720, domainsItServes: "any",
    route: () => route.temple("krishna"), stateFit: { minTimeSec: 600 },
    intro: "Action without attachment." },
];

export function getModeById(id: string): ModeEntry | undefined {
  return MODE_REGISTRY.find((m) => m.id === id);
}

export function getModesByPractice(p: Practice): ModeEntry[] {
  return MODE_REGISTRY.filter((m) => m.practice === p);
}

export function getCompoundCapableModes(): ModeEntry[] {
  return MODE_REGISTRY.filter((m) => m.supportsCompound);
}
