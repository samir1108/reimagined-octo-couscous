/**
 * dynamicGuruSelector — Re-exports from unified shared module
 * 
 * The canonical implementation lives in src/lib/shared/masterSelector.ts
 * (which mirrors supabase/functions/_shared/masterSelector.ts)
 * This file maintains backward compatibility for existing imports.
 */

export { selectMasterForSession as selectGuruForSession } from './shared/masterSelector';
export type { GuruSelectionInput, GuruSelection } from './shared/masterSelector';

// Compatibility wrapper matching old interface
export function selectGuruForSessionLegacy(input: {
  band: number;
  activeLoops?: string[];
  themeFocusAreas?: string[];
  themeTitle?: string;
  excludeGuruIds?: string[];
}): { guru: any; reason: string; score: number } {
  // This is a stub - real implementation should call server
  // or use the shared logic directly
  return {
    guru: { id: 'ramana', name: 'Ramana Maharshi' },
    reason: 'Fallback - use server-side selector',
    score: 0,
  };
}