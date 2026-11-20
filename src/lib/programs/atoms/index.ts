/**
 * Atom registry — single source of truth.
 * Every atom in every category aggregated here.
 */
import type { Atom, AtomCategory } from "../types";

import { TEACHING_ATOMS } from "./teaching";
import { BREATHWORK_ATOMS } from "./breathwork";
import { WITNESS_ATOMS } from "./witness";
import { JOURNAL_ATOMS } from "./journal";
import { SELF_INQUIRY_ATOMS } from "./self-inquiry";
import {
  WISDOM_READ_ATOMS, NEUROSCIENCE_ATOMS, FRAMEWORK_ATOMS,
  BODY_SCAN_ATOMS, KRIYA_ATOMS, MOVEMENT_ATOMS, MUDRA_ATOMS, MANTRA_ATOMS,
  MEDITATION_ATOMS, OBSERVATION_ATOMS, CONCENTRATION_ATOMS,
  CONTEMPLATION_ATOMS, VOICE_JOURNAL_ATOMS,
  IFS_PARTS_ATOMS, SOMATIC_RELEASE_ATOMS, EMOTION_NAMING_ATOMS, SHADOW_WORK_ATOMS,
  GURU_DIALOGUE_ATOMS, COUNCIL_ATOMS, GUIDE_CHAT_ATOMS,
  MICRO_ACT_ATOMS, SPEECH_VOW_ATOMS, DETOX_ATOMS,
  AI_MIRROR_ATOMS, LOOP_CONFRONT_ATOMS, RITUAL_ATOMS,
} from "./scaffold";
import { EXPANSION_ATOMS } from "./expansion";
import { EXPANSION2_ATOMS } from "./expansion2";
import { ANCIENT_YOGA_ATOMS } from "./ancient-yoga";
import { WAVE2_ATOMS } from "./wave2";
import { WAVE3_ATOMS } from "./wave3";
import { WAVE4_ATOMS } from "./wave4";
import { WAVE5_ATOMS } from "./wave5";
import { WAVE6_ATOMS } from "./wave6";
import { WAVE7_ATOMS } from "./wave7";
import { WAVE8_ATOMS } from "./wave8";
import { WAVE9_ATOMS } from "./wave9";
import { WAVE10_ATOMS } from "./wave10";
import { WAVE11_ATOMS } from "./wave11";
import { WAVE12_ATOMS } from "./wave12";
import { WAVE13_ATOMS } from "./wave13";
import { WAVE14_ATOMS } from "./wave14";
import { WAVE15_ATOMS } from "./wave15";
import { WAVE16_ATOMS } from "./wave16";



export const ALL_ATOMS: Atom[] = [
  ...TEACHING_ATOMS, ...WISDOM_READ_ATOMS, ...NEUROSCIENCE_ATOMS, ...FRAMEWORK_ATOMS,
  ...BREATHWORK_ATOMS, ...BODY_SCAN_ATOMS, ...KRIYA_ATOMS, ...MOVEMENT_ATOMS, ...MUDRA_ATOMS, ...MANTRA_ATOMS,
  ...MEDITATION_ATOMS, ...WITNESS_ATOMS, ...OBSERVATION_ATOMS, ...CONCENTRATION_ATOMS,
  ...SELF_INQUIRY_ATOMS, ...CONTEMPLATION_ATOMS, ...JOURNAL_ATOMS, ...VOICE_JOURNAL_ATOMS,
  ...IFS_PARTS_ATOMS, ...SOMATIC_RELEASE_ATOMS, ...EMOTION_NAMING_ATOMS, ...SHADOW_WORK_ATOMS,
  ...GURU_DIALOGUE_ATOMS, ...COUNCIL_ATOMS, ...GUIDE_CHAT_ATOMS,
  ...MICRO_ACT_ATOMS, ...SPEECH_VOW_ATOMS, ...DETOX_ATOMS,
  ...AI_MIRROR_ATOMS, ...LOOP_CONFRONT_ATOMS, ...RITUAL_ATOMS,
  ...EXPANSION_ATOMS,
  ...EXPANSION2_ATOMS,
  ...ANCIENT_YOGA_ATOMS,
  ...WAVE2_ATOMS,
  ...WAVE3_ATOMS,
  ...WAVE4_ATOMS,
  ...WAVE5_ATOMS,
  ...WAVE6_ATOMS,
  ...WAVE7_ATOMS,
  ...WAVE8_ATOMS,
  ...WAVE9_ATOMS,
  ...WAVE10_ATOMS,
  ...WAVE11_ATOMS,
  ...WAVE12_ATOMS,
  ...WAVE13_ATOMS,
  ...WAVE14_ATOMS,
  ...WAVE15_ATOMS,
  ...WAVE16_ATOMS,
];

const ATOM_INDEX: Map<string, Atom> = new Map(ALL_ATOMS.map((a) => [a.id, a]));

export function getAtomById(id: string): Atom | undefined {
  return ATOM_INDEX.get(id);
}

export function getAtomsByCategory(category: AtomCategory): Atom[] {
  return ALL_ATOMS.filter((a) => a.category === category);
}

export function getAtomCountByCategory(): Record<AtomCategory, number> {
  const out = {} as Record<AtomCategory, number>;
  for (const a of ALL_ATOMS) out[a.category] = (out[a.category] || 0) + 1;
  return out;
}
