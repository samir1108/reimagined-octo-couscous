import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { TimeSlot } from '@/lib/timeSlots';
import { getCurrentTimeSlot } from '@/lib/timeSlots';

export type TimePattern = 
  | 'morning_only'
  | 'all_slots'
  | 'morning_evening'
  | 'night_only'
  | 'irregular'
  | 'weekday_weekend'
  | 'default';

export interface UserTimeProfile {
  availableSlots: TimeSlot[];
  primarySlot: TimeSlot;
  secondarySlot: TimeSlot | null;
  skippedSlots: TimeSlot[];
  wakeTime: string | null;
  sleepTime: string | null;
  flexibleMode: boolean;
  weekdayDuration: number;
  weekendDuration: number;
  pattern: TimePattern;
}

const ALL_SLOTS: TimeSlot[] = ['morning', 'midday', 'evening', 'night'];

function detectPattern(slots: TimeSlot[], flexible: boolean): TimePattern {
  if (flexible || slots.length >= 4) return 'all_slots';
  if (slots.length === 1 && slots[0] === 'morning') return 'morning_only';
  if (slots.length === 1 && slots[0] === 'night') return 'night_only';
  if (slots.length === 2 && slots.includes('morning') && slots.includes('evening')) return 'morning_evening';
  if (slots.length === 0) return 'irregular';
  return 'default';
}

const DEFAULT_PROFILE: UserTimeProfile = {
  availableSlots: ALL_SLOTS,
  primarySlot: 'morning',
  secondarySlot: 'evening',
  skippedSlots: [],
  wakeTime: null,
  sleepTime: null,
  flexibleMode: true,
  weekdayDuration: 15,
  weekendDuration: 30,
  pattern: 'all_slots',
};

export function useUserTimeProfile(userId?: string) {
  return useQuery<UserTimeProfile>({
    queryKey: ['user-time-profile', userId],
    enabled: !!userId,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      if (!userId) return DEFAULT_PROFILE;

      // First check user_spiritual_dna (living profile, updated by curiosity engine)
      const { data: dna } = await supabase
        .from('user_spiritual_dna')
        .select('available_slots, primary_slot, skipped_slots, flexible_mode, weekday_duration, weekend_duration')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: schedule, error: scheduleError } = await supabase
        .from('profiles')
        .select('wake_time, sleep_time')
        .eq('user_id', userId)
        .maybeSingle();
      if (scheduleError) throw scheduleError;
      const wakeTime = schedule?.wake_time ?? null;
      const sleepTime = schedule?.sleep_time ?? null;

      if (dna?.available_slots && (dna.available_slots as unknown[]).length > 0) {
        const availableSlots: TimeSlot[] = (dna.available_slots as TimeSlot[]) || ALL_SLOTS;
        const primarySlot: TimeSlot = (dna.primary_slot as TimeSlot) || 'morning';
        const skippedSlots: TimeSlot[] = (dna.skipped_slots as TimeSlot[]) || [];
        const flexibleMode: boolean = dna.flexible_mode || false;
        const weekdayDuration: number = dna.weekday_duration || 15;
        const weekendDuration: number = dna.weekend_duration || 30;
        const secondarySlot = availableSlots.find(s => s !== primarySlot) || null;

        return {
          availableSlots,
          primarySlot,
          secondarySlot,
          skippedSlots,
          wakeTime,
          sleepTime,
          flexibleMode,
          weekdayDuration,
          weekendDuration,
          pattern: detectPattern(availableSlots, flexibleMode),
        };
      }

      // Fallback: read from onboarding assessment
      const { data } = await supabase
        .from('spiritual_dna_assessments')
        .select('assessment_conversation, circadian_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (!data?.assessment_conversation) return DEFAULT_PROFILE;

      const conv = data.assessment_conversation as {
      available_slots?: TimeSlot[];
      primary_slot?: TimeSlot;
      secondary_slot?: TimeSlot | null;
      skipped_slots?: TimeSlot[];
      flexible_mode?: boolean;
      weekday_duration?: number;
      weekend_duration?: number;
    };
      const availableSlots: TimeSlot[] = conv.available_slots || ALL_SLOTS;
      const primarySlot: TimeSlot = conv.primary_slot || 'morning';
      const secondarySlot: TimeSlot | null = conv.secondary_slot || null;
      const skippedSlots: TimeSlot[] = conv.skipped_slots || [];
      const flexibleMode: boolean = conv.flexible_mode || false;
      const weekdayDuration: number = conv.weekday_duration || 15;
      const weekendDuration: number = conv.weekend_duration || 30;

      return {
        availableSlots,
        primarySlot,
        secondarySlot,
        skippedSlots,
        wakeTime,
        sleepTime,
        flexibleMode,
        weekdayDuration,
        weekendDuration,
        pattern: detectPattern(availableSlots, flexibleMode),
      };
    },
  });
}

/**
 * Checks if a given slot is relevant for the user's selected pattern
 */
export function isSlotRelevant(slot: TimeSlot, profile?: UserTimeProfile | null): boolean {
  if (!profile) return true;
  if (profile.flexibleMode) return true;
  return (profile.availableSlots ?? []).includes(slot);
}

/**
 * Gets the adaptive greeting based on user's pattern & current time
 */
export function getAdaptiveGreeting(userName: string, profile: UserTimeProfile): { greeting: string; subtitle: string } {
  const current = getCurrentTimeSlot();

  // Night-only user
  if (profile.pattern === 'night_only') {
    if (current === 'night') {
      return { greeting: `Good night, ${userName}`, subtitle: "Your practice awaits in the stillness" };
    }
    return { greeting: `Namaste, ${userName}`, subtitle: "See you tonight. Rest well. 🙏" };
  }

  // Morning-only user opening at non-morning time
  if (profile.pattern === 'morning_only' && current !== 'morning') {
    return { greeting: `Well done, ${userName}`, subtitle: "See you tomorrow morning. 🙏" };
  }

  // Standard greetings
  switch (current) {
    case 'morning':
      return { greeting: `Good morning, ${userName}`, subtitle: "Start your day with intention" };
    case 'midday':
      return { greeting: `Good afternoon, ${userName}`, subtitle: "A moment of presence in the day" };
    case 'evening':
      return { greeting: `Good evening, ${userName}`, subtitle: "Time to reflect and integrate" };
    case 'night':
      return { greeting: `Good night, ${userName}`, subtitle: "Wind down with awareness" };
  }
}

/**
 * Determines if user has completed all their relevant slots for the day
 */
export function isUserDoneForDay(
  profile: UserTimeProfile,
  completedSlots: TimeSlot[],
): boolean {
  return profile.availableSlots.every(slot => completedSlots.includes(slot));
}
