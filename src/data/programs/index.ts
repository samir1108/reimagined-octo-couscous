import type { Program, ProgramCategory } from './types';

// Full-content programs
import { awarenessKickstart7Day } from './awareness/7day-awareness-kickstart';
import { sensoryAwakening7Day } from './awareness/7day-sensory-awakening';
import { thoughtDetox7Day } from './mind/7day-thought-detox';
import { emotionMapping7Day } from './emotional/7day-emotion-mapping';

// ─── Master Registry ─────────────────────

export const ALL_PROGRAMS: Program[] = [
  awarenessKickstart7Day,
  sensoryAwakening7Day,
  thoughtDetox7Day,
  emotionMapping7Day,
];

// ─── Lookup Functions ─────────────────────

export function getProgramById(id: string): Program | undefined {
  return ALL_PROGRAMS.find(p => p.id === id);
}

export function getProgramsByCategory(category: ProgramCategory): Program[] {
  return ALL_PROGRAMS.filter(p => p.category === category);
}

export function getProgramsByDuration(duration: number): Program[] {
  return ALL_PROGRAMS.filter(p => p.duration === duration);
}

export function getProgramsByDifficulty(difficulty: string): Program[] {
  return ALL_PROGRAMS.filter(p => p.difficulty === difficulty);
}

export function searchPrograms(query: string): Program[] {
  const q = query.toLowerCase();
  return ALL_PROGRAMS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.tags.some(t => t.includes(q))
  );
}

export { PROGRAM_CATEGORIES, getCategoryMeta } from './categories';
export type { Program, ProgramCategory, ProgramDay, ProgramDifficulty, ProgramEnrollment, ProgramDayProgress } from './types';
