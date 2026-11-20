export type TimeSlot = 'morning' | 'midday' | 'evening' | 'night';

export type MissedMorningMode = 'normal' | 'condensed' | 'late_bloomer' | 'night_catchup' | 'welcome_back';

export const TIME_SLOTS: { slot: TimeSlot; label: string; emoji: string; startHour: number; endHour: number; greeting: string; description: string }[] = [
  { slot: 'morning', label: 'Morning', emoji: '🌅', startHour: 5, endHour: 12, greeting: 'Good morning', description: 'Start your day with intention' },
  { slot: 'midday', label: 'Midday', emoji: '☀️', startHour: 12, endHour: 17, greeting: 'Good afternoon', description: 'Stay present & practice' },
  { slot: 'evening', label: 'Evening', emoji: '🌆', startHour: 17, endHour: 21, greeting: 'Good evening', description: 'Reflect & integrate' },
  { slot: 'night', label: 'Night', emoji: '🌙', startHour: 21, endHour: 5, greeting: 'Good night', description: 'Wind down & rest' },
];

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'midday';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getSlotConfig(slot: TimeSlot) {
  return TIME_SLOTS.find(s => s.slot === slot)!;
}

export function isSlotAvailable(slot: TimeSlot): boolean {
  const current = getCurrentTimeSlot();
  const order: TimeSlot[] = ['morning', 'midday', 'evening', 'night'];
  return order.indexOf(slot) <= order.indexOf(current);
}

export function isSlotActive(slot: TimeSlot): boolean {
  return getCurrentTimeSlot() === slot;
}

/**
 * Determines what mode to show when morning was missed.
 * @param morningCompleted whether morning session was done
 * @param daysSinceLastVisit days since last app visit
 * @returns the appropriate mode for the current time
 */
export function getMissedMorningMode(morningCompleted: boolean, daysSinceLastVisit: number): MissedMorningMode {
  // If morning is done, everything is normal
  if (morningCompleted) return 'normal';

  // Long absence takes priority
  if (daysSinceLastVisit >= 3) return 'welcome_back';

  const slot = getCurrentTimeSlot();

  // Still morning time — show normal morning gate
  if (slot === 'morning') return 'normal';

  // Midday — condensed 60-second morning
  if (slot === 'midday') return 'condensed';

  // Evening — late bloomer combined flow
  if (slot === 'evening') return 'late_bloomer';

  // Night — skip morning entirely
  return 'night_catchup';
}

export function getCurrentGateForSchedule(
  date: Date,
  wakeTime?: string,
  sleepTime?: string
): TimeSlot {
  // Default to current time slot if no custom schedule
  if (!wakeTime || !sleepTime) {
    return getCurrentTimeSlot();
  }
  
  const hour = date.getHours();
  const [wakeHour] = wakeTime.split(':').map(Number);
  const [sleepHour] = sleepTime.split(':').map(Number);
  
  // Handle overnight sleep (e.g., sleep at 23, wake at 7)
  if (sleepHour > wakeHour) {
    if (hour >= wakeHour && hour < sleepHour) {
      if (hour < 12) return 'morning';
      if (hour < 17) return 'midday';
      return 'evening';
    }
    return 'night';
  } else {
    // Sleep spans midnight (e.g., sleep at 2, wake at 10)
    if (hour >= wakeHour || hour < sleepHour) {
      if (hour < 12) return 'morning';
      if (hour < 17) return 'midday';
      return 'evening';
    }
    return 'night';
  }
}
