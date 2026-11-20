import { useMemo } from "react";

interface StreakGraceResult {
  /** Display streak (with grace — doesn't reset after 1 missed day) */
  displayStreak: number;
  /** True if the user missed exactly 1 day (grace period) */
  isGracePeriod: boolean;
  /** True if streak is fully broken (2+ consecutive missed days) */
  isBroken: boolean;
  /** Days since last session (0 = today) */
  daysSinceLastVisit: number;
  /** Longest streak ever */
  longestStreak: number;
  /** Days present in last 30 days */
  daysPresent30: number;
  /** Whether user qualifies for "Welcome Back" flow (3+ days away) */
  needsWelcomeBack: boolean;
  /** Whether it's a weekend (Sat/Sun) */
  isWeekend: boolean;
  /** Journey day for "Week 2 Drop-Off" detection (days 7-14) */
  isWeek2Zone: boolean;
}

export function useStreakGrace(profile: {
  streak_current?: number;
  streak_longest?: number;
  last_session_at?: string | null;
  journey_day?: number;
} | null | undefined): StreakGraceResult {
  return useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const streakCurrent = profile?.streak_current || 0;
    const longestStreak = profile?.streak_longest || 0;
    const journeyDay = profile?.journey_day || 1;
    const lastSessionAt = profile?.last_session_at;

    let daysSinceLastVisit = 0;
    if (lastSessionAt) {
      const lastDate = new Date(lastSessionAt);
      const diffMs = now.getTime() - lastDate.getTime();
      daysSinceLastVisit = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    } else {
      daysSinceLastVisit = 999; // never visited
    }

    // Grace period: 1 missed day doesn't break streak
    const isGracePeriod = daysSinceLastVisit === 1;
    const isBroken = daysSinceLastVisit >= 2;
    const needsWelcomeBack = daysSinceLastVisit >= 3;

    // Display streak: show current if grace, 0 if broken
    const displayStreak = isBroken ? 0 : streakCurrent;

    // Approximate days present in last 30 (using streak as proxy)
    const daysPresent30 = Math.min(30, streakCurrent);

    // Week 2 drop-off zone
    const isWeek2Zone = journeyDay >= 7 && journeyDay <= 14;

    return {
      displayStreak,
      isGracePeriod,
      isBroken,
      daysSinceLastVisit,
      longestStreak,
      daysPresent30,
      needsWelcomeBack,
      isWeekend,
      isWeek2Zone,
    };
  }, [profile]);
}
