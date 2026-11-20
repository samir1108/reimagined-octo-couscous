/**
 * SESSION EVENT BUS — Cross-system communication.
 *
 * Events are fired when significant things happen.
 * Other systems can subscribe to react.
 *
 * Event types:
 *   - session_started
 *   - session_completed
 *   - session_skipped
 *   - loop_identified
 *   - arc_started
 *   - arc_resolved
 *   - milestone_reached
 *   - streak_broken
 *   - streak_continued
 *   - gap_detected
 *   - breakthrough_detected
 */

import { supabase } from '@/lib/supabase';
import type { SessionEvent } from './types';

export type EventType =
  | 'session_started'
  | 'session_completed'
  | 'session_skipped'
  | 'loop_identified'
  | 'arc_started'
  | 'arc_resolved'
  | 'milestone_reached'
  | 'streak_broken'
  | 'streak_continued'
  | 'gap_detected'
  | 'breakthrough_detected';

export interface EventPayload {
  [key: string]: unknown;
}

/**
 * Fire an event into the event bus.
 */
export async function fireEvent(
  userId: string,
  eventType: EventType,
  payload: EventPayload = {}
): Promise<void> {
  try {
    await supabase.from('session_events').insert({
      user_id: userId,
      event_type: eventType,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[event-bus] Failed to fire event:', eventType, error);
  }
}

/**
 * Get recent events for a user.
 */
export async function getRecentEvents(
  userId: string,
  limit = 50
): Promise<SessionEvent[]> {
  try {
    const { data, error } = await supabase
      .from('session_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as SessionEvent[];
  } catch {
    return [];
  }
}

/**
 * Get events of a specific type.
 */
export async function getEventsByType(
  userId: string,
  eventType: EventType,
  limit = 20
): Promise<SessionEvent[]> {
  try {
    const { data, error } = await supabase
      .from('session_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as SessionEvent[];
  } catch {
    return [];
  }
}
