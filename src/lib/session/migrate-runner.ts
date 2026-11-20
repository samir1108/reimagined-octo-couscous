/**
 * MIGRATION RUNNER — Run once to migrate localStorage data to Postgres.
 *
 * Call this from your app's entry point or a settings page:
 *
 *   import { runMigration } from '@/lib/session/migrate-runner';
 *   await runMigration();
 */

import { migrateLocalStorageToPostgres } from './migrate';
import type { MigrationResult } from './migrate';

export async function runMigration(): Promise<MigrationResult> {
  const { supabase } = await import('@/lib/supabase');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        migratedSessions: 0,
        migratedThemes: 0,
        migratedStreaks: 0,
        errors: ['No authenticated user'],
      };
    }

    console.log(`[migration] Starting migration for user ${user.id}`);
    const result = await migrateLocalStorageToPostgres(user.id);
    console.log(`[migration] Complete:`, result);
    return result;
  } catch (error) {
    console.error('[migration] Failed:', error);
    return {
      migratedSessions: 0,
      migratedThemes: 0,
      migratedStreaks: 0,
      errors: [`Migration failed: ${error}`],
    };
  }
}
