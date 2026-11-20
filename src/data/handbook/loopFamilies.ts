/**
 * The 12 Loop Families — categorical explainer layer over the 400+ loop library.
 * Each family points to exemplar loop IDs (from src/data/loops.ts).
 */

export interface LoopFamily {
  slug: string;
  name: string;
  feels: string;             // what it feels like from the inside
  neuroscience: string;      // brain hook
  exampleIds: string[];      // loop IDs in src/data/loops.ts
  origin: string;            // where it usually comes from
  wayOut: string;            // the practice
  pairedPath: string;
}

export const LOOP_FAMILIES: LoopFamily[] = [
  {
    slug: "validation",
    name: "Validation Loops",
    feels: "Refreshing notifications. Re-reading sent messages. Mood that rises and falls with likes, replies, the absence of replies.",
    neuroscience: "Dopaminergic mesolimbic pathway hijacked by intermittent reinforcement — same circuit as slot machines (Lembke, Dopamine Nation, 2021).",
    exampleIds: ["VAL001", "VAL002", "VAL003"],
    origin: "Childhood mirror-deficit: love that was conditional on performance.",
    wayOut: "Practice: do one good thing and tell no one. Do it again tomorrow.",
    pairedPath: "Karma (anonymous service), Bhakti (inner Beloved)",
  },
  {
    slug: "avoidance",
    name: "Avoidance Loops",
    feels: "The task you've moved across 4 to-do lists. Opening 8 tabs to escape the one that matters.",
    neuroscience: "Anterior cingulate detects effort cost; prefrontal capitulates to immediate relief. Procrastination is emotional regulation, not laziness.",
    exampleIds: ["AVO001", "AVO002"],
    origin: "Task = threat = past punishment for failing similar tasks.",
    wayOut: "Two-minute rule: open the document. Don't write. Just open it. Daily.",
    pairedPath: "Raja (yama: tapas), Karma (skill in action)",
  },
  {
    slug: "control",
    name: "Control Loops",
    feels: "Re-writing the same email 12 times. Micromanaging others. Body tight before any uncertainty.",
    neuroscience: "Amygdala chronically activated; prefrontal over-modulating to compensate. Anxiety = control without information.",
    exampleIds: ["CTL001", "CTL002"],
    origin: "Early environment where unpredictability was unsafe.",
    wayOut: "Practice: hand over one decision per week to someone else. Don't review.",
    pairedPath: "Bhakti (surrender), Tantra (yes to what is)",
  },
  {
    slug: "performance",
    name: "Performance Loops",
    feels: "Always 'on'. Exhausted by small talk. Resume-thinking even during rest.",
    neuroscience: "Self-evaluative cortex (mPFC) chronically engaged; default mode network can't fully disengage in rest.",
    exampleIds: ["PER001", "PER002"],
    origin: "Love = output. Worth = production.",
    wayOut: "10 unproductive minutes daily, scheduled. Stare. Wander. Don't justify.",
    pairedPath: "Karma (fruit-renunciation), Tantra (presence over output)",
  },
  {
    slug: "comparison",
    name: "Comparison Loops",
    feels: "Other people's lives feel sharper than yours. Scrolling = subtle ache.",
    neuroscience: "Social comparison activates same neural circuits as physical pain (dACC). Instagram is a pain machine.",
    exampleIds: ["CMP001", "CMP002"],
    origin: "Sibling/peer ranking; school cultures of relative worth.",
    wayOut: "30-day fast from one comparison surface. Notice what fills the silence.",
    pairedPath: "Jnana (who is comparing?), Bhakti (longing redirected)",
  },
  {
    slug: "rumination",
    name: "Rumination Loops",
    feels: "The same conversation, replayed at 11:47 PM, with better comebacks each time.",
    neuroscience: "Default mode network hyperactivity; PFC stuck in narrative simulation.",
    exampleIds: ["RUM001", "RUM002"],
    origin: "Unprocessed emotion seeking resolution through thought (it can't be solved there).",
    wayOut: "Body-first: when rumination starts, walk 10 minutes. Don't think. Walk.",
    pairedPath: "Kriya (body-first), Raja (pratyahara)",
  },
  {
    slug: "spiritual-bypass",
    name: "Spiritual Bypass Loops",
    feels: "Quoting Rumi instead of feeling. 'It's all one' when something specific is hurting.",
    neuroscience: "Cognitive reframing without limbic processing — concept overrides feeling, but feeling persists somatically.",
    exampleIds: ["SPB001", "SPB002"],
    origin: "Pain that came before the tools to feel it.",
    wayOut: "When you reach for a teaching, ask: what am I trying to not feel?",
    pairedPath: "Tantra (full embrace), Bhakti (sit with the ache)",
  },
  {
    slug: "scarcity",
    name: "Scarcity Loops",
    feels: "Money, time, love — never enough. Hoarding. Bracing for loss.",
    neuroscience: "Cognitive bandwidth narrows under perceived scarcity — Mullainathan & Shafir, Scarcity (2013).",
    exampleIds: ["SCR001", "SCR002"],
    origin: "Early lack — material or emotional — encoded in nervous system.",
    wayOut: "Daily: name 3 things present. Specific. Concrete. Out loud.",
    pairedPath: "Karma (trust through doing), Bhakti (faith)",
  },
  {
    slug: "savior",
    name: "Savior Loops",
    feels: "Always the helper. Tired but can't say no. Identity built on being needed.",
    neuroscience: "Caretaking activates reward circuits; saying no triggers shame circuits.",
    exampleIds: ["SAV001"],
    origin: "Parentified child; love earned through usefulness.",
    wayOut: "Say no once this week, without explanation. Survive it.",
    pairedPath: "Karma (real service has limits), Jnana (who needs to be needed?)",
  },
  {
    slug: "victim",
    name: "Victim Loops",
    feels: "Life happens to you. Patterns repeat. Story of being wronged is well-rehearsed.",
    neuroscience: "Locus of control externalized; cortisol patterns mimic learned helplessness (Seligman).",
    exampleIds: ["VCT001"],
    origin: "Real powerlessness, often early, that crystallized into identity.",
    wayOut: "Daily: one small thing fully chosen, not endured.",
    pairedPath: "Karma (action), Raja (yama)",
  },
  {
    slug: "addictive",
    name: "Addictive Loops",
    feels: "Substance, scroll, sugar, sex — the thing that promises peace and delivers more wanting.",
    neuroscience: "Dopamine deficit state — the activity no longer brings pleasure, only relief from absence.",
    exampleIds: ["ADX001"],
    origin: "Nervous system that hasn't learned: discomfort can be felt, not fled.",
    wayOut: "30-day fast from the one. Feel what shows up. That's the actual practice.",
    pairedPath: "Raja (full path), Kriya (body re-regulation)",
  },
  {
    slug: "perfectionism",
    name: "Perfectionism Loops",
    feels: "Nothing ships. Standard moves whenever you approach it. Self-criticism dressed as standards.",
    neuroscience: "Internalized critic (lateral PFC) hyperactive; ventromedial reward muted.",
    exampleIds: ["PFX001"],
    origin: "Love that came after performance, never before.",
    wayOut: "Ship one thing this week at 70%. Watch what does and doesn't happen.",
    pairedPath: "Karma (skill, not perfection), Tantra (include the flaw)",
  },
];
