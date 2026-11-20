/**
 * recommendGames — picks today's most relevant playable games for a user
 * based on their dimension bands, witness gap, bypassing risk, and dominant path.
 *
 * Pure function. No IO. Safe to call from any component.
 */
import { FLAGSHIP_GAMES, type LabGame, type Faculty } from "@/games/shell/labRegistry";

export interface GameSignalInput {
  dimensionBands?: { thought: number; emotion: number; body: number; awareness: number };
  witnessGap?: number;     // 0..1, higher = bigger gap
  bypassingRisk?: number;  // 0..1
  dominantPath?: string | null;
}

const POOL: LabGame[] = FLAGSHIP_GAMES;

/** Score map: faculty → weight. Higher = more relevant for this user right now. */
function scoreFaculties(input: GameSignalInput): Record<Faculty, number> {
  const w: Record<Faculty, number> = {
    attention: 1, body: 1, witness: 1, ego: 1, heart: 1,
    self_inquiry: 1, willpower: 1, stillness: 1, voice: 1,
    brain_head: 1, brain_heart: 1, brain_gut: 1, karma: 1, liminal: 1,
  };
  const d = input.dimensionBands;
  if (d) {
    // Lower band on a dimension = needs work there → boost related faculties
    if (d.awareness < 5) { w.witness += 2; w.attention += 1.5; w.stillness += 1; }
    if (d.body < 5)      { w.body += 2; w.brain_gut += 1.2; }
    if (d.emotion < 5)   { w.heart += 2; w.brain_heart += 1.2; }
    if (d.thought < 5)   { w.self_inquiry += 1.5; w.brain_head += 1.2; w.ego += 1; }
  }
  if ((input.witnessGap ?? 0) > 0.4) { w.witness += 1.5; w.attention += 0.8; }
  if ((input.bypassingRisk ?? 0) > 0.4) { w.ego += 1.5; w.self_inquiry += 1; }
  switch (input.dominantPath) {
    case "karma": w.karma += 1.5; w.willpower += 1; break;
    case "bhakti": w.heart += 1.2; w.voice += 1; break;
    case "jnana": w.self_inquiry += 1.5; w.witness += 0.8; break;
    case "raja": w.attention += 1; w.stillness += 1; break;
    case "tantra": w.body += 1; w.heart += 0.8; break;
  }
  return w;
}

function gameScore(g: LabGame, w: Record<Faculty, number>): number {
  return g.faculties.reduce((sum, f) => sum + (w[f] ?? 0), 0);
}

export function recommendGames(input: GameSignalInput, count = 3): LabGame[] {
  if (!POOL.length) return [];
  const w = scoreFaculties(input);
  // Deterministic daily rotation salt so suggestions vary day-to-day but stay
  // stable within a day.
  const dayKey = new Date().toISOString().slice(0, 10);
  const salt = [...dayKey].reduce((a, c) => a + c.charCodeAt(0), 0);
  const ranked = POOL
    .map((g) => ({ g, s: gameScore(g, w) + ((g.number + salt) % 7) * 0.15 }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.g);
  // Ensure faculty diversity in the top picks
  const picked: LabGame[] = [];
  const usedFaculty = new Set<Faculty>();
  for (const g of ranked) {
    const overlap = g.faculties.some((f) => usedFaculty.has(f));
    if (!overlap || picked.length >= count - 1) {
      picked.push(g);
      g.faculties.forEach((f) => usedFaculty.add(f));
    }
    if (picked.length >= count) break;
  }
  // Backfill if diversity filter was too strict
  for (const g of ranked) {
    if (picked.length >= count) break;
    if (!picked.includes(g)) picked.push(g);
  }
  return picked.slice(0, count);
}
