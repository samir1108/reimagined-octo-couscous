/**
 * ADAPTIVE 100-DAY JOURNEY ENGINE
 * Per temple.md: Every day adapts based on user's patterns, responses, missed days, time, struggles
 * 
 * Adaptation factors:
 * - Previous day's journal/reflection
 * - Missed days pattern
 * - Time of day practice happens
 * - User's stated struggles (from guidance requests)
 * - Practice quality ratings
 * - Engagement patterns (chat length, depth)
 * - Day type rotation (regular/silence/testing/reflection)
 */

import type { JourneyDayType } from "@/temple/types";

export interface UserProfile {
  masterId: string;
  currentDay: number;
  totalDays: number;
  missedDays: number;
  avgPracticeMinutes: number;
  avgRating: number;
  lastPracticedAt?: string;
  struggles: string[];
  strengths: string[];
  engagementLevel: "low" | "medium" | "high";
  preferredTime: "morning" | "afternoon" | "evening" | "night";
  isTestingPhase: boolean;
  recentReflections: string[];
  lastJournalSentiment: "negative" | "neutral" | "positive";
  streakDays: number;
}

interface AdaptiveDayResult {
  dayType: JourneyDayType;
  teaching: string;
  practice: string;
  practiceDurationMinutes: number;
  chatPrompt: string;
  isGentle: boolean; // If true, easier practice for struggling users
  referencesPast?: string; // References something user shared before
}

/**
 * Sentiment analysis (simple keyword-based, no AI needed)
 */
function analyzeSentiment(text: string): "negative" | "neutral" | "positive" {
  const lower = text.toLowerCase();
  const negativeWords = [
    "can't", "won't", "hate", "angry", "sad", "lost", "empty", "tired",
    "fear", "anxious", "depressed", "hopeless", "stuck", "frustrated",
    "failed", "bad", "pain", "suffering", "struggling", "broken",
    "nhi ho", "nahi ho", "mushkil", "dar", "gussa",
  ];
  const positiveWords = [
    "good", "great", "calm", "peace", "happy", "clear", "better",
    "progress", "understanding", "grateful", "love", "beautiful",
    "accha", "shaant", "badhiya", "sahi",
  ];

  let score = 0;
  negativeWords.forEach((w) => { if (lower.includes(w)) score--; });
  positiveWords.forEach((w) => { if (lower.includes(w)) score++; });

  if (score < -1) return "negative";
  if (score > 1) return "positive";
  return "neutral";
}

/**
 * Determine if user is struggling
 */
function isStruggling(profile: UserProfile): boolean {
  return (
    profile.lastJournalSentiment === "negative" ||
    profile.missedDays > 3 ||
    profile.avgRating < 2.5 ||
    profile.engagementLevel === "low" ||
    profile.streakDays === 0
  );
}

/**
 * Determine if user is thriving
 */
function isThriving(profile: UserProfile): boolean {
  return (
    profile.lastJournalSentiment === "positive" &&
    profile.avgRating >= 4 &&
    profile.engagementLevel === "high" &&
    profile.streakDays >= 7
  );
}

/**
 * Get personalized day type based on user state
 */
function getAdaptiveDayType(profile: UserProfile): JourneyDayType {
  // Struggling users get more gentle days, skip testing
  if (isStruggling(profile)) {
    if (profile.missedDays > 5) return "reflection";
    return "regular";
  }

  // Thriving users can handle testing days
  if (isThriving(profile) && profile.currentDay % 10 !== 0) {
    if (profile.currentDay % 25 === 0) return "testing";
  }

  // Silence days every 10th (fixed)
  if (profile.currentDay % 10 === 0) return "silence";

  // Reflection every 20th
  if (profile.currentDay % 20 === 0) return "reflection";

  return "regular";
}

/**
 * Generate personalized teaching based on user's state
 */
function generateTeaching(profile: UserProfile, dayType: JourneyDayType, masterName: string): string {
  const day = profile.currentDay;
  const struggling = isStruggling(profile);
  const thriving = isThriving(profile);

  // If struggling, acknowledge it directly
  if (struggling) {
    if (profile.missedDays > 5) {
      return `Day ${day}. ${masterName} sees you.\n\nYou've been away for a while. That's okay. The path doesn't judge you. The path is always here.\n\nToday is gentle. Not because you failed — because you're returning. And returning is its own courage.\n\nNo big teaching today. Just this: sit. Breathe. You're here. That's enough.`;
    }

    if (profile.lastJournalSentiment === "negative") {
      return `Day ${day}. ${masterName} heard what you wrote yesterday.\n\nThose feelings are real. Not "just thoughts" — real. Don't let anyone minimize them, including yourself.\n\nToday's practice: Don't try to fix anything. Just sit with what is. The struggle itself is the practice.\n\nYou don't need to feel better right now. You just need to feel.`;
    }

    if (profile.avgRating < 2.5) {
      return `Day ${day}. You've been rating practices low. ${masterName} notices.\n\nThis doesn't mean you're bad at this. It might mean you're going through something that practices can't easily touch.\n\nToday: shorter practice. Less guidance. More just sitting with yourself. That's valid too.`;
    }
  }

  // If thriving, deepen the practice
  if (thriving) {
    return `Day ${day}. ${day} days. ${masterName} watches something shifting in you.\n\nNot just discipline — actual change. You sit differently now. The practice is becoming natural.\n\nToday, we go deeper. Not harder — deeper. The surface work is done. Now we look at what's underneath.\n\nYou're ready for this.`;
  }

  // Regular teaching with personalization
  const themes: Record<number, string> = {
    1: "Beginnings", 2: "Breath", 3: "Body", 4: "Mind", 5: "Emotion",
    6: "Ego", 7: "Silence", 8: "Surrender", 9: "Observation", 10: "Rest",
    11: "Patience", 12: "Clarity", 13: "Resistance", 14: "Trust", 15: "Letting Go",
    16: "Presence", 17: "Awareness", 18: "Equanimity", 19: "Compassion", 20: "Reflection",
  };

  const theme = themes[((day - 1) % 20) + 1] || "Practice";

  // Reference user's struggles if relevant
  let struggleRef = "";
  if (profile.struggles.length > 0 && day > 5) {
    const recentStruggle = profile.struggles[profile.struggles.length - 1];
    struggleRef = `\n\nYou've been carrying ${recentStruggle}. Today, we practice not with it — alongside it. You don't need to solve it. Just be with it.`;
  }

  // Time-based adjustment
  const timeGreeting = {
    morning: "The morning is fresh. The mind is clearer now than it will be all day.",
    afternoon: "Midday. The world is noisy. But you're here. That's the point.",
    evening: "Evening. The day's dust settles. Now we go inward.",
    night: "Night. The world is quiet. The mind is honest. This is the deepest time.",
  };

  return `Day ${day}. ${theme}.\n\n${timeGreeting[profile.preferredTime]}\n\nToday's focus: ${theme.toLowerCase()}. Not thinking about it — feeling it.${struggleRef}\n\nThe practice is simple: show up. Sit. Observe. Return. Again. Again. Again.\n\n${masterName} is here. Always.`;
}

/**
 * Generate personalized practice based on user state
 */
function generatePractice(profile: UserProfile, dayType: JourneyDayType): string {
  const struggling = isStruggling(profile);

  if (dayType === "silence") {
    return "Today, silence. No words. No guidance. Just you and the silence within. Set a timer. Close your eyes. Let everything be exactly as it is.";
  }

  if (dayType === "testing") {
    return "Today is a test. Not of knowledge — of being. Notice: when you feel reactive, when you feel defensive, when you want to prove yourself. Just notice. Don't change anything. Watching is the practice.";
  }

  if (dayType === "reflection") {
    return "Look back. Not forward — back. What has changed since Day 1? Not in your circumstances — in you. Write one sentence about the biggest shift you've noticed.";
  }

  // Regular practice, adapted to user state
  if (struggling) {
    return "Short practice today. 15 minutes. Just sit. No technique. No goal. When thoughts come, let them come. When they go, let them go. You're not managing anything. You're being with yourself.";
  }

  if (profile.streakDays >= 21) {
    return "21+ days. You know how to sit. Today, extend the practice by 5 minutes. Push gently at your edge. See what's there.";
  }

  return "Sit. Observe the breath. When the mind wanders — and it will — gently return. This returning IS the practice. Every return strengthens awareness. Do this for the full duration. No shortcuts.";
}

/**
 * Generate personalized chat prompt
 */
function generateChatPrompt(profile: UserProfile, dayType: JourneyDayType): string {
  if (dayType === "silence") return "Today, don't answer. Just sit. The silence is the teacher.";
  if (dayType === "testing") return "What was your first reaction today's scenario would trigger? Be brutally honest.";
  if (dayType === "reflection") return "Write one sentence: 'The biggest thing I've learned so far is...'";

  if (isStruggling(profile)) {
    return "What's the hardest part of sitting today? Not the practice — what's underneath it.";
  }

  if (isThriving(profile)) {
    return "You've been consistent. What's different about how you feel before and after practice now compared to Day 1?";
  }

  // Reference recent reflections if available
  if (profile.recentReflections.length > 0) {
    const lastReflection = profile.recentReflections[0];
    return `Yesterday you shared: "${lastReflection.slice(0, 80)}..."\n\nWhat came up today around that?`;
  }

  return "What arises when you simply sit with no agenda?";
}

/**
 * Generate the complete adaptive day
 */
export function generateAdaptiveDay(
  profile: UserProfile,
  masterName: string
): AdaptiveDayResult {
  const dayType = getAdaptiveDayType(profile);
  const struggling = isStruggling(profile);

  // Adaptive practice duration
  let duration = 30; // default
  if (struggling && profile.missedDays > 3) duration = 15;
  else if (isThriving(profile)) duration = 35;
  else if (profile.streakDays >= 21) duration = 30;

  return {
    dayType,
    teaching: generateTeaching(profile, dayType, masterName),
    practice: generatePractice(profile, dayType),
    practiceDurationMinutes: duration,
    chatPrompt: generateChatPrompt(profile, dayType),
    isGentle: struggling,
    referencesPast: profile.recentReflections.length > 0
      ? `Previous reflection: "${profile.recentReflections[0].slice(0, 60)}..."`
      : undefined,
  };
}

/**
 * Update user profile based on today's interaction
 */
export function updateUserProfile(
  profile: UserProfile,
  interaction: {
    practiced: boolean;
    practiceMinutes: number;
    rating: number;
    journalEntry?: string;
    chatMessages?: number;
  }
): UserProfile {
  const newProfile = { ...profile };

  if (interaction.practiced) {
    // Update streak
    const lastDate = profile.lastPracticedAt ? new Date(profile.lastPracticedAt) : null;
    const today = new Date();
    const daysSinceLast = lastDate
      ? Math.floor((today.getTime() - lastDate.getTime()) / 86400000)
      : 999;

    if (daysSinceLast === 1) {
      newProfile.streakDays += 1;
    } else if (daysSinceLast > 1) {
      newProfile.streakDays = 1;
      newProfile.missedDays += daysSinceLast - 1;
    }

    // Update averages
    const totalPractices = profile.currentDay;
    newProfile.avgPracticeMinutes =
      (profile.avgPracticeMinutes * (totalPractices - 1) + interaction.practiceMinutes) / totalPractices;
    newProfile.avgRating =
      (profile.avgRating * (totalPractices - 1) + interaction.rating) / totalPractices;
    newProfile.lastPracticedAt = today.toISOString();

    // Update sentiment from journal
    if (interaction.journalEntry) {
      newProfile.lastJournalSentiment = analyzeSentiment(interaction.journalEntry);
      newProfile.recentReflections = [
        interaction.journalEntry,
        ...profile.recentReflections.slice(0, 4),
      ];
    }

    // Update engagement level
    const engagementScore =
      (interaction.practiceMinutes / 30) * 0.4 +
      (interaction.rating / 5) * 0.3 +
      Math.min((interaction.chatMessages || 0) / 10, 1) * 0.3;

    if (engagementScore > 0.7) newProfile.engagementLevel = "high";
    else if (engagementScore > 0.4) newProfile.engagementLevel = "medium";
    else newProfile.engagementLevel = "low";
  } else {
    newProfile.missedDays += 1;
    newProfile.streakDays = 0;
  }

  newProfile.currentDay += 1;

  return newProfile;
}
