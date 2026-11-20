import type {
  CapabilityDef,
  CapabilityDomain,
  CapabilityLevel,
  CapabilityLevelDef,
} from "@/types/capability";

/** The six level names are global — a level 3 means the same thing everywhere. */
export const LEVEL_NAMES: Record<CapabilityLevel, string> = {
  0: "Unobserved",
  1: "Can notice",
  2: "Can sustain",
  3: "Can regulate",
  4: "Can apply",
  5: "Holds under pressure",
};

export const DOMAIN_META: Record<
  CapabilityDomain,
  { label: string; essence: string }
> = {
  attention: {
    label: "Attention",
    essence: "Where awareness goes, and for how long it stays.",
  },
  awareness: {
    label: "Awareness",
    essence: "What can be noticed, and how early.",
  },
  will: { label: "Will", essence: "Choosing what happens next." },
  thinking: { label: "Thinking", essence: "Reasoning, pattern, abstraction." },
  emotion: { label: "Emotion", essence: "Feeling, and staying present inside it." },
  social: { label: "Social", essence: "Reading and meeting other people." },
};

/** Six `[markers, exit]` pairs → six level definitions, L0..L5. */
const levels = (spec: [string[], string[]][]): CapabilityLevelDef[] =>
  spec.map(([markers, exit], i) => ({
    level: i as CapabilityLevel,
    name: LEVEL_NAMES[i as CapabilityLevel],
    markers,
    exit,
  }));

export const CAPABILITIES: CapabilityDef[] = [
  // ── Attention ──────────────────────────────────────────────────────────
  {
    id: "sustained-attention",
    name: "Sustained attention",
    domain: "attention",
    essence: "Holding one thing for longer than is comfortable.",
    capacityKey: "attention",
    dependsOn: [],
    modalityOrder: ["game", "practice", "reflection", "experiment"],
    signals: [
      "leaves the task and does not notice",
      "leaves the task and notices late",
      "notices leaving within seconds",
      "returns without being told to",
      "stays through boredom",
      "stays while being interrupted",
    ],
    levels: levels([
      [["Cannot hold a task past a minute without drifting."], ["Wanders off, does not notice."]],
      [["Notices the drift only after it happened."], ["Catches it within ~30s of leaving."]],
      [["Stays with one task for a full work block."], ["Holds 20+ minutes, returning on own."]],
      [["Re-centres on noticing, without effort or self-reproach."], ["Returns in under 10s, most attempts."]],
      [["Uses an external structure to hold long focus."], ["Completes a 45+ minute block from a plan."]],
      [["Holds deep focus while being interrupted."], ["Returns in under 5s during an active day."]],
    ]),
  },
  {
    id: "distraction-resistance",
    name: "Distraction resistance",
    domain: "attention",
    essence: "Staying with the task while something pulls at you.",
    capacityKey: "attention",
    dependsOn: ["sustained-attention"],
    modalityOrder: ["game", "practice", "experiment", "reflection"],
    signals: [
      "is pulled without registering the pull",
      "registers the pull and follows it",
      "registers and pauses",
      "declines the pull",
      "declines even when the lure is strong",
      "declines while under social pressure",
    ],
    levels: levels([
      [["A notification ends the session."], ["Follows the first interruption."]],
      [["Sees the pull arrive."], ["Names what pulled, afterwards."]],
      [["Pauses before acting on the pull."], ["Most interruptions are delayed, not obeyed."]],
      [["Returns to the task at the moment of the pull."], ["Declines the pull without a decision to make."]],
      [["Works through a designed environment of lures."], ["Phone present, still on task, for a full block."]],
      [["Declines lures from other people, not just the device."], ["Keeps focus through live interruption."]],
    ]),
  },

  // ── Awareness ──────────────────────────────────────────────────────────
  {
    id: "self-awareness",
    name: "Self-awareness",
    domain: "awareness",
    essence: "Noticing your own state while it is happening.",
    capacityKey: "observation",
    dependsOn: [],
    modalityOrder: ["practice", "game", "reflection", "experiment"],
    signals: [
      "reports state only in hindsight",
      "notices state minutes late",
      "notices state as it arrives",
      "notices the shift before it peaks",
      "describes state precisely",
      "notices state without collapsing into it",
    ],
    levels: levels([
      [["Can only describe how it felt later."], ["Hindsight report after hours."]],
      [["Catches a mood after it has passed."], ["Names the emotion within a day."]],
      [["Catches state as it is happening."], ["Notices during the moment, not after."]],
      [["Notices the early signal, before the peak."], ["Intervenes before the state escalates."]],
      [["Distinguishes body, thought and emotion as separate layers."], ["Names the layer, not just the mood."]],
      [["Watches a strong state arrive and does not become it."], ["Reports inner state mid-event with precision."]],
    ]),
  },
  {
    id: "body-awareness",
    name: "Body awareness",
    domain: "awareness",
    essence: "Felt sense of the body, at fine grain.",
    capacityKey: "body_awareness",
    dependsOn: ["self-awareness"],
    modalityOrder: ["practice", "game", "reflection", "experiment"],
    signals: [
      "no felt sense, only thoughts about the body",
      "notices the body only under stress",
      "localises sensation roughly",
      "localises sensation precisely",
      "reads the body as an early-warning system",
      "holds fine body attention during activity",
    ],
    levels: levels([
      [["The body is only a picture in the head."], ["Cannot locate a sensation."]],
      [["Feels tension only when it is loud."], ["Detects the body at high arousal."]],
      [["Locates breath and posture on demand."], ["Finds the breath in under 30s."]],
      [["Senses fine shifts — heat, pressure, pulse."], ["Distinguishes three qualities of one sensation."]],
      [["Uses a body signal to predict and prevent a state."], ["Acts on an early body cue before it escalates."]],
      [["Holds fine body attention while moving and working."], ["Keeps the felt sense alive during effort."]],
    ]),
  },
  {
    id: "emotional-awareness",
    name: "Emotional awareness",
    domain: "awareness",
    essence: "Naming and separating what you feel from what you think.",
    capacityKey: "emotional_mastery",
    dependsOn: ["self-awareness"],
    modalityOrder: ["game", "practice", "reflection", "experiment"],
    signals: [
      "emotion is undifferentiated",
      "labels with one word only",
      "names the emotion accurately",
      "names it and the need under it",
      "distinguishes several feelings at once",
      "holds ambiguity between feelings",
    ],
    levels: levels([
      [["'Stressed' covers everything."], ["Uses one word for all states."]],
      [["Names the feeling after it settles."], ["Correct label, arrived late."]],
      [["Names the feeling as it happens."], ["Correct label, on time."]],
      [["Names the feeling and what it is protecting."], ["Distinguishes anger from fear from shame."]],
      [["Holds two contradictory feelings at once."], ["Reports mixed states without collapsing to one."]],
      [["Reads the emotional field in others too."], ["Names the other's state without being told."]],
    ]),
  },

  // ── Will ───────────────────────────────────────────────────────────────
  {
    id: "impulse-control",
    name: "Impulse control",
    domain: "will",
    essence: "The gap between urge and action.",
    dependsOn: ["self-awareness"],
    modalityOrder: ["game", "practice", "experiment", "reflection"],
    signals: [
      "acts inside the urge",
      "pauses after acting",
      "pauses before acting",
      "the pause is felt, not forced",
      "declines without effort",
      "declines while provoked",
    ],
levels: levels([
      [["Acts inside the urge."], ["Cannot recall the last time there was a gap."]],
      [["Acts, then catches it."], ["Notices the reaction afterwards."]],
      [["Holds the urge for a few seconds."], ["Delays action on most impulses."]],
      [["Holds the urge and feels it clearly."], ["Watches the impulse peak and fall without acting."]],
      [["Declines the impulse without effort."], ["Impulse loses its grip quickly."]],
      [["Declines under provocation."], ["Stays steady when an impulse is provoked deliberately."]],
    ]),
  },
  {
    id: "consistency",
    name: "Consistency",
    domain: "will",
    essence: "Doing the thing on the day you do not feel like it.",
    dependsOn: ["impulse-control"],
    modalityOrder: ["experiment", "game", "practice", "reflection"],
    signals: [
      "starts, stops",
      "bursts, then gaps",
      "holds a short chain",
      "holds a chain past a bad day",
      "has a protocol that survives a bad week",
      "momentum is self-sustaining",
    ],
    levels: levels([
      [["Acts only when motivated."], ["Longest chain is one day."]],
      [["Repeats for two or three days."], ["Chain breaks on the first friction."]],
      [["Holds a five-day chain."], ["Five consecutive completed sessions."]],
      [["Survives a bad day inside a chain."], ["One miss does not end the chain."]],
      [["Runs a written protocol through a bad week."], ["Seven consecutive days with a stated minimum."]],
      [["Momentum carries itself."], ["Restarts within a day, unprompted."]],
    ]),
  },

  // ── Thinking ───────────────────────────────────────────────────────────
  {
    id: "logical-reasoning",
    name: "Logical reasoning",
    domain: "thinking",
    essence: "Following an argument to where it actually leads.",
    capacityKey: "pattern_recognition",
    dependsOn: [],
    modalityOrder: ["game", "reflection", "practice", "experiment"],
    signals: [
      "accepts the first plausible claim",
      "checks a claim against one fact",
      "checks against evidence",
      "finds the weakest joint",
      "sees the whole structure",
      "holds uncertainty without collapsing it",
    ],
    levels: levels([
      [["Believes whatever is said last."], ["Cannot state why."]],
      [["Doubts a claim sometimes."], ["Asks one follow-up question."]],
      [["Weighs a claim against evidence."], ["Rejects an unsupported claim."]],
      [["Finds the weakest step in a chain."], ["Names where the reasoning breaks."]],
      [["Holds the whole structure of an argument."], ["Tracks premises and conclusions across a long text."]],
      [["Holds a genuinely incomplete case without forcing it."], ["Says 'not enough information' and means it."]],
    ]),
  },

  // ── Emotion ────────────────────────────────────────────────────────────
  {
    id: "emotional-regulation",
    name: "Emotional regulation",
    domain: "emotion",
    essence: "Staying present inside a strong feeling without obeying it.",
    capacityKey: "equanimity",
    dependsOn: ["emotional-awareness", "impulse-control"],
    modalityOrder: ["practice", "game", "reflection", "experiment"],
    signals: [
      "suppresses or acts out",
      "rides the wave, then crashes",
      "survives the wave",
      "shortens the wave",
      "chooses the response inside the wave",
      "steady while others are not",
    ],
levels: levels([
      [["The emotion decides what happens."], ["Acts or shuts down; nothing between."]],
      [["Feels the whole wave, unchosen."], ["Peak lasts minutes; rebound lasts hours."]],
      [["Stays present through the peak."], ["Does not act while activated."]],
      [["The wave shortens and the rebound softens."], ["Back to baseline within the same hour."]],
      [["Chooses a response from inside the wave."], ["Acts deliberately while still activated."]],
      [["Steady while others are not."], ["Baseline holds through provocation."]],
    ]),
  },

  // ── Social ─────────────────────────────────────────────────────────────
  {
    id: "active-listening",
    name: "Active listening",
    domain: "social",
    essence: "Listening to the point where the other person changes.",
    dependsOn: ["self-awareness"],
    modalityOrder: ["game", "experiment", "practice", "reflection"],
    signals: [
      "waits to speak",
      "listens, then relates it back to self",
      "listens without fixing",
      "hears what is underneath the words",
      "the other person finishes differently",
      "listens while being provoked",
    ],
    levels: levels([
      [["Waits for the turn to talk."], ["Interruptions are the default."]],
      [["Listens to the end, then replies about self."], ["Hears the words, misses the state."]],
      [["Listens without making it about self."], ["No fixing, no redirecting."]],
      [["Hears the feeling under the words."], ["Reflects the state, not just the content."]],
      [["The other person says something new."], ["A real disclosure happens because of the listening."]],
      [["Listens while provoked or interrupted."], ["Keeps the quality of attention under pressure."]],
    ]),
  },
];

export const CAPABILITY_BY_ID: Record<string, CapabilityDef> = Object.fromEntries(
  CAPABILITIES.map((c) => [c.id, c]),
);

export function getCapability(id: string): CapabilityDef | undefined {
  return CAPABILITY_BY_ID[id];
}