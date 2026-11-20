/**
 * LOCAL STORAGE MIGRATION HELPER
 *
 * One-time migration of localStorage session data to Postgres.
 * Run this once for each user when they first open the app after the update.
 *
 * Migrates:
 *   - orb-sessions-YYYY-M-D → daily_session_logs
 *   - orb-last-theme → daily_session_logs.last_theme
 *   - session-shell:{sessionId} → session_states
 *   - localStorage streak counters → user_session_streaks
 */

import { supabase } from '@/lib/supabase';
import type { SessionPlan } from './types';

const ORB_SESSION_PREFIX = 'orb-sessions-';
const ORB_LAST_THEME_KEY = 'orb-last-theme';
const SESSION_SHELL_PREFIX = 'session-shell:';

export interface MigrationResult {
  migratedSessions: number;
  migratedThemes: number;
  migratedStreaks: number;
  errors: string[];
}

/**
 * Migrate all localStorage session data to Postgres for a given user.
 */
export async function migrateLocalStorageToPostgres(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    migratedSessions: 0,
    migratedThemes: 0,
    migratedStreaks: 0,
    errors: [],
  };

  if (!userId) return result;

  try {
    // 1. Migrate orb daily session logs
    await migrateOrbSessions(userId, result);

    // 2. Migrate session shell states
    await migrateSessionShellStates(userId, result);

    // 3. Migrate streak data
    await migrateStreakData(userId, result);

    // 4. Clear migrated localStorage keys
    clearMigratedKeys();

    return result;
  } catch (error) {
    result.errors.push(`Migration failed: ${error}`);
    return result;
  }
}

async function migrateOrbSessions(userId: string, result: MigrationResult): Promise<void> {
  const keysToMigrate: string[] = [];

  // Find all orb session keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(ORB_SESSION_PREFIX)) {
      keysToMigrate.push(key);
    }
  }

  // Migrate each day's sessions
  for (const key of keysToMigrate) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const sessions: SessionPlan[] = JSON.parse(raw);
      if (!Array.isArray(sessions) || sessions.length === 0) continue;

      // Extract date from key: orb-sessions-YYYY-M-D
      const dateStr = key.replace(ORB_SESSION_PREFIX, '');
      const [year, month, day] = dateStr.split('-').map(Number);
      const logDate = new Date(year, month - 1, day).toISOString().split('T')[0];

      // Check if already migrated
      const { data: existing } = await supabase
        .from('daily_session_logs')
        .select('sessions')
        .eq('user_id', userId)
        .eq('log_date', logDate)
        .maybeSingle();

      if (existing?.sessions && Array.isArray(existing.sessions) && existing.sessions.length > 0) {
        continue; // Already migrated
      }

      // Migrate
      const { error } = await supabase.from('daily_session_logs').upsert({
        user_id: userId,
        log_date: logDate,
        sessions: sessions.map(s => ({
          id: s.id,
          system: 'orb',
          title: s.title,
          gate: s.gate,
          estimatedMinutes: (s as any).estimatedMinutes,
          completedAt: s.completedAt,
        })),
      });

      if (error) {
        result.errors.push(`Failed to migrate ${key}: ${error.message}`);
      } else {
        result.migratedSessions += sessions.length;
      }
    } catch {
      // Skip invalid data
    }
  }

  // Migrate last theme
  try {
    const lastThemeRaw = localStorage.getItem(ORB_LAST_THEME_KEY);
    if (lastThemeRaw) {
      const lastTheme = JSON.parse(lastThemeRaw);
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('daily_session_logs')
        .update({ last_theme: lastTheme })
        .eq('user_id', userId)
        .eq('log_date', today);

      if (!error) result.migratedThemes++;
    }
  } catch {
    // Skip
  }
}

async function migrateSessionShellStates(userId: string, result: MigrationResult): Promise<void> {
  const keysToMigrate: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(SESSION_SHELL_PREFIX)) {
      keysToMigrate.push(key);
    }
  }

  for (const key of keysToMigrate) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const state = JSON.parse(raw);
      const sessionId = key.replace(SESSION_SHELL_PREFIX, '');

      const { error } = await supabase.from('session_states').upsert({
        session_id: sessionId,
        user_id: userId,
        cursor_step_index: state.cursor ?? -1,
        completed_steps: state.completed ?? [],
        skipped_steps: state.skipped ?? [],
        started_at: state.startedAt,
        last_activity_at: new Date().toISOString(),
        metadata: state.metadata ?? {},
      });

      if (error) {
        result.errors.push(`Failed to migrate session state ${key}: ${error.message}`);
      } else {
        result.migratedSessions++;
      }
    } catch {
      // Skip invalid data
    }
  }
}

async function migrateStreakData(userId: string, result: MigrationResult): Promise<void> {
  // Try to infer streak from existing completed sessions
  try {
    const { data: sessions } = await supabase
      .from('sessions')
      .select('started_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(365);

    if (!sessions || sessions.length === 0) return;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(today);
    const sessionDates = new Set(
      sessions.map(s => new Date(s.started_at).toISOString().split('T')[0])
    );

    // Check if there's a session today or yesterday (grace day)
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!sessionDates.has(todayStr) && !sessionDates.has(yesterdayStr)) {
      // Streak is broken
      result.migratedStreaks = 0;
      return;
    }

    // Count consecutive days
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sessionDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === todayStr || dateStr === yesterdayStr) {
        // Grace day — allow one miss
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const longestStreak = currentStreak; // Simplified — would need full history

    const { error } = await supabase
      .from('user_session_streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_sessions_lifetime: sessions.length,
        last_session_date: sessions[0]?.started_at?.split('T')[0],
        grace_days_remaining: 3,
        paused: false,
      });

    if (!error) result.migratedStreaks = currentStreak;
  } catch {
    // Skip
  }
}

function clearMigratedKeys(): void {
  // Clear localStorage keys that have been migrated
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(ORB_SESSION_PREFIX) || key.startsWith(SESSION_SHELL_PREFIX))) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}
