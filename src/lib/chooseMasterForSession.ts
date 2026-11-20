/**
 * chooseMasterForSession — Re-exports from unified shared module
 * 
 * The canonical implementation lives in src/lib/shared/masterSelector.ts
 * (which mirrors supabase/functions/_shared/masterSelector.ts)
 * This file maintains backward compatibility for existing imports.
 */

import { selectMasterForSession } from './shared/masterSelector';

/** Backward-compatible alias. */
export const chooseMasterForSession = selectMasterForSession;
export type { MasterChoiceContext, MasterChoice } from './shared/masterSelector';