/**
 * SESSION THREAD — Narrative arc tracking for the user's journey.
 *
 * Tracks thematic arcs across sessions so the user can see their story.
 * An "arc" is a cluster of sessions around a theme, loop, or dimension.
 *
 * Example arcs:
 *   "The Untangling" — 12 sessions working with self-criticism loop
 *   "The Opening" — 8 sessions opening the heart dimension
 *   "The Return" — 3 sessions re-entering after a gap
 */

import { supabase } from '@/lib/supabase';
import type { SessionThread, SessionCompletion } from './types';

export interface ArcInput {
  userId: string;
  sessionTitle: string;
  sessionArchetype?: string;
  sessionLoops: string[];
  sessionDimension?: string;
  sessionMood?: string;
}

const ARC_DURATION_DAYS = 14; // Sessions within 14 days considered part of same arc

/**
 * Load or create the user's session thread.
 */
export async function getSessionThread(userId: string): Promise<SessionThread> {
  const { data, error } = await supabase
    .from('session_threads')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return createNewThread(userId);
  }

  return data as SessionThread;
}

/**
 * Update the session thread after a session completes.
 */
export async function updateSessionThread(ctx: ArcInput, completion: SessionCompletion): Promise<SessionThread> {
  const thread = await getSessionThread(ctx.userId);

  // Determine if this session continues the current arc or starts a new one
  const continuesArc = shouldContinueArc(thread, ctx);

  if (continuesArc && thread.currentArc) {
    // Continue existing arc
    thread.sessionsInArc += 1;
    thread.arcIntensity = Math.min(1, thread.arcIntensity + 0.1);

    // Check if arc should resolve
    if (thread.sessionsInArc >= 8) {
      return resolveArc(thread, ctx.userId);
    }
  } else {
    // Save previous arc if exists
    if (thread.currentArc && thread.sessionsInArc > 0) {
      thread.previousArcs.push({
        arc: thread.currentArc,
        sessions: thread.sessionsInArc,
        completedAt: new Date().toISOString(),
        resolution: 'integrated',
      });
    }

    // Start new arc
    thread.currentArc = generateArcName(ctx);
    thread.arcStartedAt = new Date().toISOString();
    thread.sessionsInArc = 1;
    thread.arcIntensity = 0.1;
  }

  // Persist
  await saveThread(thread);

  return thread;
}

/**
 * Generate a human-readable arc name from session context.
 */
function generateArcName(ctx: ArcInput): string {
  const { sessionTitle, sessionArchetype, sessionLoops, sessionDimension } = ctx;

  // If there's an active loop, name the arc after it
  if (sessionLoops.length > 0) {
    const loop = sessionLoops[0];
    return `Untangling "${capitalize(loop)}"`;
  }

  // If there's a dimension focus, name the arc after it
  if (sessionDimension) {
    const dimensionNames: Record<string, string> = {
      body: 'The Body Remembers',
      thought: 'The Witness Wakes Up',
      emotion: 'Opening the Heart',
      awareness: 'Spacious Mind',
    };
    return dimensionNames[sessionDimension] || `Deepening ${capitalize(sessionDimension)}`;
  }

  // If there's an archetype, use it
  if (sessionArchetype) {
    const archetypeNames: Record<string, string> = {
      're-entry': 'The Return',
      'settling': 'Settling In',
      'celebration': 'Celebrating the Rise',
      'confrontation': 'Facing What Is',
      'shadow-mirror': 'Seeing Clearly',
      'stuck-loop-break': 'Breaking the Pattern',
      'lineage-initiation': 'The Transmission',
      'dissolution': 'Letting Go',
      'witness-deepening': 'Deepening the Witness',
      'inquiry-spiral': 'The Inquiry Deepens',
      'devotional': 'Opening the Heart',
      'karmic-action': 'From Insight to Action',
      'dark-night-hold': 'Holding the Dark',
    };
    return archetypeNames[sessionArchetype] || 'The Journey Continues';
  }

  // Fallback: extract from title
  const words = sessionTitle.split(' ').slice(0, 4);
  return words.join(' ') || 'The Journey Continues';
}

function shouldContinueArc(thread: SessionThread, ctx: ArcInput): boolean {
  if (!thread.currentArc) return false;

  // Check if current arc is still within time window
  if (thread.arcStartedAt) {
    const daysSinceStart = (Date.now() - new Date(thread.arcStartedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart > ARC_DURATION_DAYS) return false;
  }

  // Check thematic overlap
  const currentTheme = extractTheme(thread.currentArc);
  const newTheme = extractThemeFromContext(ctx);

  // If themes match or overlap, continue the arc
  if (currentTheme === newTheme) return true;

  // If session touches a loop that's part of the arc, continue
  if (ctx.sessionLoops.some(loop => thread.currentArc.toLowerCase().includes(loop.toLowerCase()))) {
    return true;
  }

  return false;
}

function extractTheme(arcName: string): string {
  // Extract the core theme from arc name
  const lower = arcName.toLowerCase();
  if (lower.includes('untangling')) return 'untangling';
  if (lower.includes('return')) return 'return';
  if (lower.includes('opening')) return 'opening';
  if (lower.includes('deepening')) return 'deepening';
  if (lower.includes('breaking')) return 'breaking';
  if (lower.includes('settling')) return 'settling';
  return 'general';
}

function extractThemeFromContext(ctx: ArcInput): string {
  if (ctx.sessionLoops.length > 0) return 'untangling';
  if (ctx.sessionDimension === 'emotion') return 'opening';
  if (ctx.sessionDimension === 'thought' || ctx.sessionDimension === 'awareness') return 'deepening';
  if (ctx.sessionArchetype === 're-entry') return 'return';
  if (ctx.sessionArchetype === 'settling') return 'settling';
  return 'general';
}

async function resolveArc(thread: SessionThread, userId: string): Promise<SessionThread> {
  // Mark arc as resolved
  if (thread.currentArc) {
    thread.previousArcs.push({
      arc: thread.currentArc,
      sessions: thread.sessionsInArc,
      completedAt: new Date().toISOString(),
      resolution: 'resolved',
    });
  }

  thread.currentArc = null;
  thread.sessionsInArc = 0;
  thread.arcIntensity = 0;

  await saveThread(thread);

  return thread;
}

async function saveThread(thread: SessionThread): Promise<void> {
  const { error } = await supabase
    .from('session_threads')
    .upsert({
      user_id: thread.userId,
      current_arc: thread.currentArc,
      arc_started_at: thread.arcStartedAt,
      sessions_in_arc: thread.sessionsInArc,
      arc_intensity: thread.arcIntensity,
      previous_arcs: thread.previousArcs,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[thread] Failed to save thread:', error);
  }
}

function createNewThread(userId: string): SessionThread {
  return {
    userId,
    currentArc: null,
    arcStartedAt: null,
    sessionsInArc: 0,
    arcIntensity: 0,
    previousArcs: [],
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
