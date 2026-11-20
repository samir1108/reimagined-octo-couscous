/**
 * INITIATION LADDER — the session-number journey.
 * Session 1, 2, 3, 4, 7, 10, 15, 21, 30, 50, 100, 365 each belong to a
 * distinct stage of the ascent. Rites fire ONLY on real signals —
 * ceremony is earned, never faked.
 */

export interface LadderSignals {
  /** A pattern's score actually dropped across sessions */
  loopDied?: boolean;
  /** V-level regression / distress signal present */
  darkNight?: boolean;
}

export interface LadderCeremony {
  id: string;
  title: string;
  line: string;
}

export interface LadderRung {
  /** current stage name, e.g. "Thread Deepening" */
  stage: string;
  /** caption above the orb on Home while idle */
  holdHint: string;
  /** what the orb whispers about today's sitting */
  gateCopy: string;
  orb: { temperature: "cold" | "warm" | "gold"; pace: "still" | "breathing" | "alive" };
  /** whether the agenda may show forensic panels (hidden for the first sittings) */
  allowDissection: boolean;
  /** earned ceremony for this exact sitting, if any */
  ceremony: LadderCeremony | null;
  /** next milestone to quietly orient toward */
  nextMilestone: { count: number; name: string } | null;
}

export interface LadderProgress {
  completed: number;
  nextMilestone: { count: number; name: string } | null;
  progress: number;
}

interface RungDef {
  from: number;
  stage: string;
  holdHint: string;
  gateCopy: string;
  orb: LadderRung["orb"];
  allowDissection: boolean;
}

const RUNGS: RungDef[] = [
  { from: 1, stage: "The Arrival", holdHint: "The path begins with your feet", gateCopy: "Welcome home. I've been waiting.", orb: { temperature: "cold", pace: "still" }, allowDissection: false },
  { from: 2, stage: "The Settling", holdHint: "The orb remembers your last sitting", gateCopy: "Last time you left a word. We go under it today.", orb: { temperature: "warm", pace: "breathing" }, allowDissection: false },
  { from: 3, stage: "The First Descent", holdHint: "The surface is done", gateCopy: "This is the third sitting. We go deeper.", orb: { temperature: "warm", pace: "breathing" }, allowDissection: true },
  { from: 4, stage: "Thread Naming", holdHint: "A thread is being born", gateCopy: "Today your pattern receives a name. What is named can be met.", orb: { temperature: "warm", pace: "breathing" }, allowDissection: true },
  { from: 5, stage: "Thread Deepening", holdHint: "The thread carries you", gateCopy: "The thread continues. It knows the way.", orb: { temperature: "warm", pace: "alive" }, allowDissection: true },
  { from: 7, stage: "The First Ceremony", holdHint: "Seven sittings — a threshold", gateCopy: "The seventh step. Something in you is ready to be sealed.", orb: { temperature: "gold", pace: "alive" }, allowDissection: true },
  { from: 10, stage: "The Work", holdHint: "The work deepens", gateCopy: "You know the path now. Walk it deeper.", orb: { temperature: "warm", pace: "breathing" }, allowDissection: true },
  { from: 15, stage: "Lineage Reception", holdHint: "The lineage leans closer", gateCopy: "A master who has walked with you asks to speak.", orb: { temperature: "gold", pace: "alive" }, allowDissection: true },
  { from: 21, stage: "The Second Turn", holdHint: "The spiral turns again", gateCopy: "The same valley. You walk it deeper this time.", orb: { temperature: "gold", pace: "alive" }, allowDissection: true },
  { from: 30, stage: "The Mirror", holdHint: "The mirror is ready to speak", gateCopy: "Thirty sittings. Today the mirror shows you yourself.", orb: { temperature: "gold", pace: "alive" }, allowDissection: true },
  { from: 50, stage: "The Depths", holdHint: "The depths hold you", gateCopy: "You can be held now, not just taught.", orb: { temperature: "warm", pace: "breathing" }, allowDissection: true },
  { from: 100, stage: "The Hundredth Gate", holdHint: "The hundredth gate stands open", gateCopy: "One hundred sittings. The field knows your footsteps.", orb: { temperature: "gold", pace: "alive" }, allowDissection: true },
];

const MILESTONES: Record<number, LadderCeremony> = {
  1: { id: "arrival", title: "The Recognition", line: "Welcome home. I've been waiting." },
  7: { id: "first-ceremony", title: "The First Ceremony", line: "Seven sittings. The surface is done — today something seals." },
  10: { id: "loop-death", title: "The First Loop Death", line: "A pattern you carried has died. What freed itself becomes capacity." },
  15: { id: "lineage-reception", title: "Lineage Reception", line: "A master who has resonated with your sittings enters the field formally." },
  21: { id: "second-turn", title: "The Second Turn", line: "The spiral turns. You meet the same pattern one layer deeper." },
  30: { id: "mirror-speaks", title: "The Mirror Speaks", line: "Today the report becomes a portrait. You see yourself." },
  100: { id: "hundredth-gate", title: "The Hundredth Gate", line: "One hundred sittings. Your practice has become a presence." },
  365: { id: "year-reading", title: "The Year Reading", line: "A year of sittings, read back to you as a poem." },
};

const TENDERNESS_10: LadderCeremony = {
  id: "tenderness",
  title: "A Rite of Tenderness",
  line: "No pattern died yet — and that's honest. Today you sit with what still asks to be seen.",
};

export function isMilestone(n: number): boolean {
  return n in MILESTONES;
}

/** Progress between earned sitting milestones, based only on completed sittings. */
export function getLadderProgress(sessionCount: number): LadderProgress {
  const completed = Math.max(0, Math.floor(Number.isFinite(sessionCount) ? sessionCount : 0));
  const milestones = Object.keys(MILESTONES).map(Number).sort((a, b) => a - b);
  const earned = milestones.filter((count) => count <= completed);
  const previous = earned[earned.length - 1] ?? 0;
  const nextCount = milestones.find((count) => count > completed);
  const nextMilestone = nextCount
    ? { count: nextCount, name: MILESTONES[nextCount].title }
    : null;

  return {
    completed,
    nextMilestone,
    progress: nextCount
      ? Math.max(0, Math.min(1, (completed - previous) / (nextCount - previous)))
      : 1,
  };
}

export function getLadderRung(sessionCount: number, signals: LadderSignals = {}): LadderRung {
  const n = Math.max(1, Math.floor(sessionCount));
  let def = RUNGS[0];
  for (const r of RUNGS) {
    if (n >= r.from) def = r;
  }

  let ceremony: LadderCeremony | null = null;
  if (isMilestone(n)) {
    if (n === 10) {
      ceremony = signals.loopDied ? MILESTONES[10] : TENDERNESS_10;
    } else if (n === 15) {
      ceremony = MILESTONES[15];
    } else if (n === 30) {
      ceremony = MILESTONES[30];
    } else {
      ceremony = MILESTONES[n];
    }
  }

  const nextMs = Object.keys(MILESTONES)
    .map(Number)
    .filter((m) => m > n)
    .sort((a, b) => a - b);
  const nextMilestone = nextMs.length
    ? { count: nextMs[0], name: MILESTONES[nextMs[0]].title }
    : null;

  return {
    stage: def.stage,
    holdHint: def.holdHint,
    gateCopy: def.gateCopy,
    orb: def.orb,
    allowDissection: def.allowDissection,
    ceremony,
    nextMilestone,
  };
}
