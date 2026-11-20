/**
 * Ritual marker parsers for the 5-act Guru–Shishya session.
 * AI emits these as inline tags; we extract them and render UI.
 *
 * All markers are designed to be safe to leave in if parsing fails:
 * `stripAllRitualTags` removes every known marker from displayed text.
 */

// ─── Act 1: Pranam ──────────────────────────────────────────────────
export const DURATION_TAG = /\[DURATION_PICK\]/i;

// ─── Act 3: Upadesha ────────────────────────────────────────────────
//   [REFLECT_PAUSE: 30]                — pause N seconds, breath ring, lock input
//   [SHISHYA_VOICE]                   — render 3 quick-reply chips
export const REFLECT_PAUSE_TAG = /\[REFLECT_PAUSE:\s*(\d+)\s*\]/i;
export const SHISHYA_VOICE_TAG = /\[SHISHYA_VOICE\]/i;

// ─── Act 4: Sadhana ─────────────────────────────────────────────────
//   [INTENSITY_PICK]                                       — gentle/standard/deep chips
//   [POSTURE_CHECK]                                        — 3-tap check before practice
//   [PRACTICE_GUIDE: name | rounds | seconds_per_phase]    — live breath ring panel
//   [PRACTICE: title | minutes | "cue1"; "cue2"]           — legacy practice handoff (kept)
//   [PRECAUTION: text]                                     — inline amber safety card
export const INTENSITY_TAG = /\[INTENSITY_PICK\]/i;
export const POSTURE_CHECK_TAG = /\[POSTURE_CHECK\]/i;
export const PRACTICE_GUIDE_TAG =
  /\[PRACTICE_GUIDE:\s*([^|\]]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\]/i;
export const PRACTICE_TAG =
  /\[PRACTICE:\s*([^|\]]+?)\s*\|\s*(\d+)\s*(?:\|\s*([^\]]+))?\]/i;
export const PRECAUTION_TAG = /\[PRECAUTION:\s*([^\]]+)\]/gi;

// ─── Act 5: Prasad ──────────────────────────────────────────────────
//   [SANKALPA: prompt text]            — seed-intention input
//   [BLESSING_BOW]                    — full-screen cinematic close
//   [HARVEST: theme insight]          — silent: extract & store
export const SANKALPA_TAG = /\[SANKALPA:\s*([^\]]+)\]/i;
export const BLESSING_BOW_TAG = /\[BLESSING_BOW\]/i;
export const HARVEST_TAG = /\[HARVEST:\s*([^\]]+)\]/i;

export interface PracticeSuggestion {
  title: string;
  minutes: number;
  cues?: string[];
}

export interface PracticeGuide {
  name: string;
  rounds: number;
  secondsPerPhase: number;
}

export interface RitualSignals {
  /** Strip-clean text for display */
  cleanText: string;
  /** Act 1 */
  showDurationPick: boolean;
  /** Act 3 */
  reflectPauseSec: number | null;
  showShishyaVoice: boolean;
  /** Act 4 */
  showIntensityPick: boolean;
  showPostureCheck: boolean;
  practiceGuide: PracticeGuide | null;
  practice: PracticeSuggestion | null;
  precautions: string[];
  /** Act 5 */
  sankalpaPrompt: string | null;
  blessingBow: boolean;
  harvest: string | null;
}

export function parseRitualSignals(text: string): RitualSignals {
  return {
    cleanText: stripAllRitualTags(text),
    showDurationPick: DURATION_TAG.test(text),
    reflectPauseSec: extractReflectPause(text),
    showShishyaVoice: SHISHYA_VOICE_TAG.test(text),
    showIntensityPick: INTENSITY_TAG.test(text),
    showPostureCheck: POSTURE_CHECK_TAG.test(text),
    practiceGuide: extractPracticeGuide(text),
    practice: extractPractice(text),
    precautions: extractPrecautions(text),
    sankalpaPrompt: extractSankalpa(text),
    blessingBow: BLESSING_BOW_TAG.test(text),
    harvest: extractHarvest(text),
  };
}

function extractReflectPause(text: string): number | null {
  const m = text.match(REFLECT_PAUSE_TAG);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n)) return null;
  return Math.max(5, Math.min(120, n));
}

function extractPracticeGuide(text: string): PracticeGuide | null {
  const m = text.match(PRACTICE_GUIDE_TAG);
  if (!m) return null;
  return {
    name: m[1].trim(),
    rounds: Math.max(1, Math.min(108, parseInt(m[2], 10) || 5)),
    secondsPerPhase: Math.max(2, Math.min(20, parseInt(m[3], 10) || 4)),
  };
}

export function extractPractice(text: string): PracticeSuggestion | null {
  const m = text.match(PRACTICE_TAG);
  if (!m) return null;
  const title = m[1].trim();
  const minutes = Math.max(1, Math.min(60, parseInt(m[2], 10) || 5));
  let cues: string[] | undefined;
  if (m[3]) {
    cues = m[3]
      .split(/;|\n/)
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return { title, minutes, cues };
}

export function extractPrecautions(text: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  PRECAUTION_TAG.lastIndex = 0;
  while ((m = PRECAUTION_TAG.exec(text)) !== null) {
    const note = m[1].trim();
    if (note) out.push(note);
  }
  return out;
}

function extractSankalpa(text: string): string | null {
  const m = text.match(SANKALPA_TAG);
  return m ? m[1].trim() : null;
}

function extractHarvest(text: string): string | null {
  const m = text.match(HARVEST_TAG);
  return m ? m[1].trim() : null;
}

export function stripAllRitualTags(text: string): string {
  return text
    .replace(PRACTICE_TAG, "")
    .replace(PRACTICE_GUIDE_TAG, "")
    .replace(DURATION_TAG, "")
    .replace(PRECAUTION_TAG, "")
    .replace(REFLECT_PAUSE_TAG, "")
    .replace(SHISHYA_VOICE_TAG, "")
    .replace(INTENSITY_TAG, "")
    .replace(POSTURE_CHECK_TAG, "")
    .replace(SANKALPA_TAG, "")
    .replace(BLESSING_BOW_TAG, "")
    .replace(HARVEST_TAG, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
