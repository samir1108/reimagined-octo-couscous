/**
 * Surface-friendly catalog of loops grouped by category.
 * Sourced from loops_catalog table (single source of truth).
 * Used by the Mirror "Loop Mapping" questionnaire.
 */

import { fetchLoopsCatalog, fetchLoopCategories, LoopCatalogEntry, LoopCategoryView } from './loopsCatalog';

export interface LoopCatalogEntryClient {
  id: string;
  name: string;
  category: LoopCategoryKey;
  hint: string;
}

export type LoopCategoryKey =
  | "VAL" | "CTL" | "AVD" | "SRV" | "BOD" | "ENR"
  | "EMO" | "MEN" | "BHV" | "HAB" | "SOC" | "REL"
  | "IDN" | "EGO" | "BLF" | "PUR" | "SPR" | "PRD"
  | "COG" | "MOT";

export const LOOP_CATEGORIES: { key: LoopCategoryKey; label: string; emoji: string; blurb: string }[] = [
  { key: "VAL", label: "Validation & Worth", emoji: "🌀", blurb: "Patterns around approval, worth, perfectionism." },
  { key: "CTL", label: "Control & Worry", emoji: "🎛️", blurb: "Trying to control what cannot be controlled." },
  { key: "AVD", label: "Avoidance", emoji: "🚪", blurb: "Pushing away what wants to be felt." },
  { key: "SRV", label: "Survival", emoji: "🛡️", blurb: "Fight, flight, freeze, hypervigilance." },
  { key: "BOD", label: "Body", emoji: "🫀", blurb: "Tension, fatigue, somatic anxiety." },
  { key: "ENR", label: "Energy", emoji: "⚡", blurb: "Burnout, depletion, stimulants." },
  { key: "EMO", label: "Emotional", emoji: "💧", blurb: "Guilt, shame, jealousy, loneliness." },
  { key: "MEN", label: "Mental", emoji: "🧠", blurb: "Rumination, overthinking, imposter." },
  { key: "BHV", label: "Behavioral", emoji: "🔁", blurb: "Procrastination, avoidance behaviors." },
  { key: "HAB", label: "Habits", emoji: "📱", blurb: "Doom-scrolling, comfort eating." },
  { key: "SOC", label: "Social", emoji: "👥", blurb: "Masking, social anxiety, FOMO." },
  { key: "REL", label: "Relationships", emoji: "💞", blurb: "Attachment, codependency, distancing." },
  { key: "IDN", label: "Identity", emoji: "🪞", blurb: "Fixed roles you've locked into." },
  { key: "EGO", label: "Ego", emoji: "👑", blurb: "Defensiveness, needing to be right." },
  { key: "BLF", label: "Core Beliefs", emoji: "🪨", blurb: "'I'm not enough', 'I don't deserve...'" },
  { key: "PUR", label: "Purpose", emoji: "🧭", blurb: "Meaning, existential dread." },
  { key: "SPR", label: "Spiritual", emoji: "🕉️", blurb: "Bypassing, awakening addiction." },
  { key: "PRD", label: "Productivity", emoji: "📈", blurb: "Busy-ness as identity." },
  { key: "COG", label: "Cognitive Bias", emoji: "🔬", blurb: "Negativity bias, emotional reasoning." },
  { key: "MOT", label: "Motivation", emoji: "🎯", blurb: "Waiting for motivation or perfect conditions." },
];

// Dynamic catalog from database (async)
export async function getLoopCatalog(): Promise<LoopCatalogEntryClient[]> {
  const loops = await fetchLoopsCatalog();
  return loops.map(l => ({
    id: l.id,
    name: l.name,
    category: l.category as LoopCategoryKey,
    hint: l.hint || '',
  }));
}

export async function getLoopCategories(): Promise<LoopCategoryView[]> {
  return fetchLoopCategories();
}

export async function getLoopsByCategory(category: LoopCategoryKey): Promise<LoopCatalogEntryClient[]> {
  const loops = await fetchLoopsCatalog();
  return loops
    .filter(l => l.category === category)
    .map(l => ({
      id: l.id,
      name: l.name,
      category: l.category as LoopCategoryKey,
      hint: l.hint || '',
    }));
}

// Static fallback for backward compatibility (subset of catalog)
export const LOOP_CATALOG: LoopCatalogEntryClient[] = [
  // VAL
  { id: "VAL001", name: "People-Pleasing", category: "VAL", hint: "Hard to say no; afraid to disappoint." },
  { id: "VAL002", name: "Perfectionism", category: "VAL", hint: "It has to be flawless or it doesn't count." },
  { id: "VAL003", name: "External Validation", category: "VAL", hint: "Need to be seen, approved, recognized." },
  { id: "VAL004", name: "Achievement Treadmill", category: "VAL", hint: "Always chasing the next milestone." },
  { id: "VAL008", name: "Productivity Guilt", category: "VAL", hint: "Guilty when resting or pausing." },
  { id: "VAL009", name: "Spiritual Bypassing", category: "VAL", hint: "Using positivity to skip what hurts." },
  // CTL
  { id: "CTL001", name: "Micromanaging", category: "CTL", hint: "Can't trust others to do it right." },
  { id: "CTL002", name: "Catastrophizing", category: "CTL", hint: "Imagining worst-case constantly." },
  { id: "CTL003", name: "Overthinking", category: "CTL", hint: "Mind won't stop spinning." },
  // AVD
  { id: "AVD001", name: "Emotional Avoidance", category: "AVD", hint: "Pushing feelings down to deal later." },
  { id: "AVD002", name: "Procrastination", category: "AVD", hint: "Putting off what matters most." },
  { id: "AVD003", name: "Deflection", category: "AVD", hint: "Joke or change subject when it gets real." },
  // SRV
  { id: "SRV001", name: "Hypervigilance", category: "SRV", hint: "Always scanning for danger." },
  { id: "SRV002", name: "Fight Response", category: "SRV", hint: "Quick to anger or attack." },
  { id: "SRV303", name: "Freeze Response", category: "SRV", hint: "Shutting down when overwhelmed." },
  // BOD
  { id: "BOD001", name: "Tension Hoarding", category: "BOD", hint: "Shoulders / jaw chronically tight." },
  { id: "BOD005", name: "Somatic Anxiety", category: "BOD", hint: "Heart racing, chest tight, stomach off." },
  // EMO
  { id: "EMO001", name: "Emotional Flooding", category: "EMO", hint: "Drowning in too much feeling." },
  { id: "EMO002", name: "Guilt Recycling", category: "EMO", hint: "Can't forgive yourself; replays." },
  { id: "EMO005", name: "Shame Spiral", category: "EMO", hint: "Want to disappear; feel worthless." },
  // MEN
  { id: "MEN001", name: "Rumination", category: "MEN", hint: "Replaying the same thing on loop." },
  { id: "MEN003", name: "Analysis Paralysis", category: "MEN", hint: "Too many options; can't choose." },
  { id: "MEN014", name: "Imposter Syndrome", category: "MEN", hint: "They'll find out I'm a fraud." },
  // REL
  { id: "REL001", name: "Pursuer–Distancer", category: "REL", hint: "More you chase, more they pull away." },
  { id: "REL004", name: "Codependency", category: "REL", hint: "Can't function without them." },
  { id: "REL014", name: "Anxious Attachment", category: "REL", hint: "Why aren't they texting back?" },
  // BLF
  { id: "BLF001", name: "I'm Not Enough", category: "BLF", hint: "Inadequate at the core." },
  { id: "BLF003", name: "I Don't Deserve Love", category: "BLF", hint: "Unlovable just as I am." },
  // PUR
  { id: "PUR001", name: "Purpose Paralysis", category: "PUR", hint: "What's even the point?" },
  // SPR
  { id: "SPR001", name: "Awakening Addiction", category: "SPR", hint: "Chasing the next peak experience." },
  // PRD
  { id: "PRD001", name: "Busy-ness Addiction", category: "PRD", hint: "Idle time feels unsafe." },
  // COG
  { id: "COG003", name: "Negativity Bias", category: "COG", hint: "Only see what's wrong." },
  // MOT
  { id: "MOT001", name: "Motivation-Dependent", category: "MOT", hint: "Need to feel motivated to start." },
];

// Pre-computed loops grouped by category for synchronous access
export const loopsByCategory: Record<LoopCategoryKey, LoopCatalogEntryClient[]> = LOOP_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.key] = LOOP_CATALOG.filter(l => l.category === cat.key);
    return acc;
  },
  {} as Record<LoopCategoryKey, LoopCatalogEntryClient[]>
);

// Trigger keywords for each loop (for questionnaire matching)
export const LOOP_TRIGGERS: Record<string, string[]> = LOOP_CATALOG.reduce(
  (acc, loop) => {
    const triggers = (loop as any).triggers;
    acc[loop.id] = triggers ? (Object.values(triggers).flat() as string[]) : [];
    return acc;
  },
  {} as Record<string, string[]>
);

// Intensity scale for the questionnaire (1..4). `label` is display copy;
// `status`/`severity`/`awareness` are the persisted user_loops values.
export const INTENSITY_LABELS = [
  { label: "Low", status: "active", severity: "mild", awareness: 0.2 },
  { label: "Medium", status: "active", severity: "mild", awareness: 0.35 },
  { label: "High", status: "active", severity: "moderate", awareness: 0.5 },
  { label: "Severe", status: "active", severity: "severe", awareness: 0.7 },
] as const;

export function getLoopById(id: string): LoopCatalogEntryClient | undefined {
  return LOOP_CATALOG.find(l => l.id === id);
}