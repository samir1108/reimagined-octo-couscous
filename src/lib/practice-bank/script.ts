/**
 * Orb script builder — turns a bank entry into a timed voice/attention script.
 *
 * One practice is a sequence of beats. A beat is the smallest unit the orb can
 * hold: a spoken cue, a silence, a bell, a rest instruction, or an invitation
 * to answer aloud. The same builder stretches from one breath to twelve hours:
 *
 *   impulse   one line on the orb, nothing else
 *   drop      arrive → one cue → silence → close
 *   short     opening → three movements → one listen → close
 *   sitting   the atom's stage arc, weighted across the duration
 *   deep      repeating rounds with bells and one deepening
 *   long      hour vigils with water/rest cues and sparse re-entry
 *   marathon  a full-day arc: hourly entries, three-hour check-ins, rest
 *
 * Speech density deliberately falls as duration rises. A 12-hour practice is
 * mostly silence; a 10-second practice is one sentence.
 */
import { BREATH_PATTERNS } from "@/lib/bience/model";
import { TECHNIQUE_CATALOG } from "@/lib/session-frameworks";
import { PRACTICE_ATOMS_BY_ID, type PracticeAtom } from "./atoms";
import { practiceId, practiceSpecAtIndex } from "./bank";
import { durationBandFor, formatPracticeDuration, type DurationBandId } from "./durations";
import { MODES_BY_ID, VOICES_BY_ID, WORLDS_BY_PRACTICE_ID, type PracticeSpec } from "./model";

export type OrbBeatKind =
  | "impulse"
  | "arrive"
  | "instruct"
  | "silence"
  | "listen"
  | "bell"
  | "rest"
  | "checkin"
  | "close";

export interface OrbBeat {
  id: string;
  atSec: number;
  seconds: number;
  kind: OrbBeatKind;
  title: string;
  /** Text for TTS. Null means this beat is silent. */
  speak: string | null;
  /** Prompt shown and spoken when the mode listens. */
  listenPrompt?: string;
  breath: "settle" | "box" | "478";
}

export interface OrbPractice {
  spec: PracticeSpec;
  id: string;
  title: string;
  subtitle: string;
  atom: PracticeAtom;
  durationSec: number;
  band: DurationBandId;
  beats: OrbBeat[];
  hue: number;
  breathSeconds: number;
  breathLabel: string;
  why: string;
  worldName: string;
  voiceLabel: string;
  modeLabel: string;
  speaks: boolean;
  listens: boolean;
}

interface DraftBeat {
  atSec: number;
  kind: OrbBeatKind;
  title: string;
  speak: string | null;
  listenPrompt?: string;
}

const TECHNIQUE_DESCRIPTION = new Map(
  TECHNIQUE_CATALOG.map((technique) => [technique.name, technique.description]),
);

function sentence(text: string, maxChars = 170): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const cut = clean.slice(0, maxChars);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "));
  return `${(stop > 40 ? cut.slice(0, stop) : cut).trim()}…`;
}

function stageLabel(stage: string): string {
  return stage.replace(/_/g, " ");
}

/** Short cues drawn from the atom, its techniques, and its stages. */
function movementLines(atom: PracticeAtom): string[] {
  const techniqueLines = atom.techniques.map((name) => {
    const description = TECHNIQUE_DESCRIPTION.get(name);
    return description ? `${name}. ${description}` : name;
  });
  const stageLines = atom.stages.map((stage) => `${capitalize(stageLabel(stage))}.`);
  return [atom.purpose, ...techniqueLines, ...stageLines].filter(Boolean);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function pickLine(lines: string[], index: number): string {
  if (lines.length === 0) return "Stay with what is actually here.";
  return lines[index % lines.length];
}

function impulseLine(atom: PracticeAtom): string {
  const words = atom.purpose.split(/\s+/).slice(0, 10).join(" ");
  return `${atom.title}. ${words}`.replace(/\s+/g, " ").trim();
}

function openingLine(atom: PracticeAtom, level: number): string {
  if (level >= 5) return "Sit. Nothing to arrange.";
  if (level >= 3) return `Sit. Let the body take its weight. We begin with ${atom.title}.`;
  return `Sit comfortably. Let the eyes soften. We will practice ${atom.title}.`;
}

function closingLine(level: number): string {
  if (level >= 5) return "Open. Carry it without naming it.";
  if (level >= 3) return "One slow breath. Open the eyes. Nothing needs to be decided now.";
  return "When you are ready, take one slow breath. Open the eyes. Carry this with you.";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function draft(atSec: number, kind: OrbBeatKind, title: string, speak: string | null, listenPrompt?: string): DraftBeat {
  return { atSec: Math.max(0, Math.round(atSec)), kind, title, speak, listenPrompt };
}

function beatsForImpulse(durationSec: number, atom: PracticeAtom, level: number, speaking: boolean): DraftBeat[] {
  const line = durationSec >= 6 && speaking ? impulseLine(atom) : null;
  return [draft(0, "impulse", atom.title, line)];
}

function beatsForDrop(durationSec: number, atom: PracticeAtom, level: number, lines: string[], speaking: boolean, listening: boolean): DraftBeat[] {
  const beats: DraftBeat[] = [];
  beats.push(draft(0, "arrive", "Arrive", speaking ? openingLine(atom, level) : null));
  beats.push(draft(durationSec * 0.2, "instruct", atom.title, speaking ? sentence(pickLine(lines, 0)) : null));
  if (durationSec >= 24) {
    beats.push(draft(durationSec * 0.55, "silence", "Silence", null));
  }
  if (listening && durationSec >= 40) {
    beats.push(
      draft(durationSec * 0.72, "listen", "Answer", speaking ? "What changed?" : null, "What changed, in one line?"),
    );
  }
  beats.push(draft(Math.max(0, durationSec - Math.min(5, durationSec * 0.15)), "close", "Close", speaking ? closingLine(level) : null));
  return beats;
}

function beatsForShort(durationSec: number, atom: PracticeAtom, level: number, lines: string[], speaking: boolean, listening: boolean): DraftBeat[] {
  const beats: DraftBeat[] = [];
  beats.push(draft(0, "arrive", "Arrive", speaking ? openingLine(atom, level) : null));
  beats.push(draft(durationSec * 0.14, "instruct", atom.title, speaking ? sentence(pickLine(lines, 0)) : null));
  beats.push(draft(durationSec * 0.38, "instruct", "Continue", speaking ? sentence(pickLine(lines, 1)) : null));
  if (durationSec >= 90) {
    beats.push(draft(durationSec * 0.58, "silence", "Silence", null));
  }
  if (listening && durationSec >= 100) {
    beats.push(
      draft(
        durationSec * 0.68,
        "listen",
        "Speak",
        speaking ? "Say aloud what is most alive right now." : null,
        "What is most alive right now?",
      ),
    );
  }
  beats.push(draft(durationSec * 0.84, "instruct", "Deepen", speaking ? sentence(pickLine(lines, 2)) : null));
  beats.push(draft(Math.max(0, durationSec - 7), "close", "Close", speaking ? closingLine(level) : null));
  return beats;
}

function beatsForSitting(durationSec: number, atom: PracticeAtom, level: number, lines: string[], speaking: boolean, listening: boolean): DraftBeat[] {
  const stages = atom.stages.length ? atom.stages : ["settling", "core_experience", "deepening", "observation", "integration"];
  const guideCount = level <= 2 ? 5 : level <= 4 ? 4 : 3;
  const beats: DraftBeat[] = [];
  beats.push(draft(0, "arrive", "Arrive", speaking ? openingLine(atom, level) : null));

  const first = 0.1;
  const last = 0.82;
  const span = last - first;
  for (let i = 0; i < guideCount; i += 1) {
    const stage = stages[i % stages.length];
    const at = durationSec * (first + (span * i) / Math.max(1, guideCount - 1));
    const spoken = speaking ? sentence(`${capitalize(stageLabel(stage))}. ${pickLine(lines, i)}`) : null;
    beats.push(draft(at, "instruct", capitalize(stageLabel(stage)), spoken));
    if (i === 1 && durationSec >= 240) {
      beats.push(draft(at + durationSec * 0.05, "silence", "Silence", null));
    }
  }

  if (listening) {
    beats.push(
      draft(
        durationSec * 0.64,
        "listen",
        "Voice note",
        speaking ? "Answer aloud. One honest sentence." : null,
        "What is true right now, in one sentence?",
      ),
    );
  }
  if (durationSec >= 600) {
    beats.push(draft(durationSec * 0.88, "silence", "Gather", null));
  }
  beats.push(draft(Math.max(0, durationSec - 10), "close", "Close", speaking ? closingLine(level) : null));
  return beats;
}

function beatsForDeep(durationSec: number, atom: PracticeAtom, level: number, lines: string[], speaking: boolean, listening: boolean): DraftBeat[] {
  const beats: DraftBeat[] = [];
  const rounds = clamp(Math.round(durationSec / 900), 4, 8);
  const roundLength = durationSec / rounds;

  beats.push(draft(0, "arrive", "Arrive", speaking ? openingLine(atom, level) : null));

  for (let round = 0; round < rounds; round += 1) {
    const start = round * roundLength;
    beats.push(
      draft(
        start + Math.min(20, roundLength * 0.05),
        "instruct",
        `Round ${round + 1}`,
        speaking ? sentence(`${pickLine(lines, round)}`) : null,
      ),
    );
    if (round === Math.floor(rounds / 2)) {
      beats.push(
        draft(
          start + roundLength * 0.3,
          "instruct",
          "Deepen",
          speaking ? sentence("Let the effort drop. The practice continues without you steering it.") : null,
        ),
      );
    }
    beats.push(draft(start + roundLength * 0.45, "silence", "Silence", null));
    if (listening && round > 0 && round % 2 === 0) {
      beats.push(
        draft(
          start + roundLength * 0.68,
          "listen",
          "Check in",
          speaking ? "Say one line about the state you are in." : null,
          "What state are you in right now?",
        ),
      );
    }
    beats.push(draft(start + roundLength - Math.min(20, roundLength * 0.08), "bell", "Bell", null));
  }

  beats.push(draft(Math.max(0, durationSec - 180), "instruct", "Integration", speaking ? "Gather the whole sitting into one impression." : null));
  beats.push(draft(Math.max(0, durationSec - 20), "close", "Close", speaking ? closingLine(level) : null));
  return beats;
}

function beatsForLong(durationSec: number, atom: PracticeAtom, level: number, lines: string[], speaking: boolean, listening: boolean): DraftBeat[] {
  const beats: DraftBeat[] = [];
  const hours = Math.max(1, Math.ceil(durationSec / 3600));
  beats.push(draft(0, "arrive", "Arrive", speaking ? openingLine(atom, level) : null));

  for (let hour = 0; hour < hours; hour += 1) {
    const start = hour * 3600;
    if (start >= durationSec) break;
    beats.push(
      draft(
        start + 5,
        "instruct",
        `Hour ${hour + 1}`,
        speaking ? sentence(`Hour ${hour + 1}. ${pickLine(lines, hour)}`) : null,
      ),
    );
    beats.push(draft(start + 180, "silence", "Silence", null));
    if ((hour + 1) % 2 === 0) {
      beats.push(
        draft(
          start + 1500,
          "rest",
          "Rest",
          speaking ? "Drink water. Move once. Return to the same seat." : null,
        ),
      );
    }
    if (listening && (hour + 1) % 3 === 0) {
      beats.push(
        draft(
          start + 2700,
          "checkin",
          "Voice check-in",
          speaking ? "Say what has changed since the last hour." : null,
          "What has changed since the last hour?",
        ),
      );
    }
    beats.push(draft(start + 3500, "bell", "Bell", null));
  }

  beats.push(draft(Math.max(0, durationSec - 600), "instruct", "Integration", speaking ? "Sit with the whole arc. Do not summarise it yet." : null));
  beats.push(draft(Math.max(0, durationSec - 120), "close", "Close", speaking ? closingLine(level) : null));
  return beats;
}

function finalizeBeats(drafts: DraftBeat[], durationSec: number, breath: "settle" | "box" | "478"): OrbBeat[] {
  const cleaned = drafts
    .filter((beat) => beat.atSec < durationSec || beat.kind === "close")
    .map((beat) => ({ ...beat, atSec: Math.min(beat.atSec, Math.max(0, durationSec - 1)) }))
    .sort((a, b) => a.atSec - b.atSec);

  const deduped: DraftBeat[] = [];
  for (const beat of cleaned) {
    const previous = deduped[deduped.length - 1];
    if (previous && previous.atSec === beat.atSec) {
      if (!previous.speak && beat.speak) deduped[deduped.length - 1] = beat;
      continue;
    }
    deduped.push(beat);
  }
  if (!deduped.length || deduped[0].atSec !== 0) {
    deduped.unshift({ atSec: 0, kind: "arrive", title: "Arrive", speak: null });
  }
  if (deduped[deduped.length - 1].atSec >= durationSec) {
    deduped[deduped.length - 1].atSec = Math.max(0, durationSec - 1);
  }

  return deduped.map((beat, index) => {
    const next = deduped[index + 1];
    const end = next ? next.atSec : durationSec;
    return {
      id: `b${index}`,
      atSec: beat.atSec,
      seconds: Math.max(1, end - beat.atSec),
      kind: beat.kind,
      title: beat.title,
      speak: beat.speak,
      listenPrompt: beat.listenPrompt,
      breath,
    };
  });
}

export function buildOrbPractice(indexOrSpec: number | PracticeSpec): OrbPractice {
  const spec =
    typeof indexOrSpec === "number" ? practiceSpecAtIndex(indexOrSpec) : indexOrSpec;
  const atom = getAtomOrThrow(spec.atomId);
  const mode = MODES_BY_ID[spec.modeId];
  const voice = VOICES_BY_ID[spec.voiceId];
  const world = WORLDS_BY_PRACTICE_ID[spec.worldId];
  const durationSec = Math.max(1, Math.round(spec.durationSec));
  const band = durationBandFor(durationSec);
  const lines = movementLines(atom);
  const speaking = mode.speaks;
  const listening = mode.listens;

  let drafts: DraftBeat[];
  switch (band) {
    case "impulse":
      drafts = beatsForImpulse(durationSec, atom, spec.level, speaking);
      break;
    case "drop":
      drafts = beatsForDrop(durationSec, atom, spec.level, lines, speaking, listening);
      break;
    case "short":
      drafts = beatsForShort(durationSec, atom, spec.level, lines, speaking, listening);
      break;
    case "sitting":
      drafts = beatsForSitting(durationSec, atom, spec.level, lines, speaking, listening);
      break;
    case "deep":
      drafts = beatsForDeep(durationSec, atom, spec.level, lines, speaking, listening);
      break;
    default:
      drafts = beatsForLong(durationSec, atom, spec.level, lines, speaking, listening);
      break;
  }

  const breath = mode.breath ?? "settle";
  const beats = finalizeBeats(drafts, durationSec, breath);
  const pattern = BREATH_PATTERNS.find((entry) => entry.id === breath) ?? BREATH_PATTERNS[0];
  const breathSeconds = pattern.inhale + pattern.hold + pattern.exhale + pattern.rest;

  const why = [
    `${atom.title} at level ${spec.level}`,
    `for ${formatPracticeDuration(durationSec)}`,
    `${mode.label.toLowerCase()} in ${world.name}`,
    atom.purpose,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    spec,
    id: practiceId(spec),
    title: atom.title,
    subtitle: `${capitalize(String(atom.category).replace(/_/g, " "))} · ${mode.hint}`,
    atom,
    durationSec,
    band,
    beats,
    hue: world.hue,
    breathSeconds,
    breathLabel: pattern.label,
    why,
    worldName: world.name,
    voiceLabel: voice.label,
    modeLabel: mode.label,
    speaks: speaking,
    listens: listening,
  };
}

function getAtomOrThrow(atomId: string): PracticeAtom {
  const atom = PRACTICE_ATOMS_BY_ID[atomId];
  if (!atom) throw new Error(`Unknown practice atom: ${atomId}`);
  return atom;
}

export function activeBeatAt(practice: OrbPractice, elapsedSec: number): OrbBeat {
  const beats = practice.beats;
  let active = beats[0];
  for (const beat of beats) {
    if (elapsedSec >= beat.atSec) active = beat;
    else break;
  }
  return active;
}

export function nextBeat(practice: OrbPractice, elapsedSec: number): OrbBeat | null {
  return practice.beats.find((beat) => beat.atSec > elapsedSec) ?? null;
}
