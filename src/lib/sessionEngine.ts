/**
 * AI-DIRECTED SESSION ENGINE
 * Per temple.md Section 29: "CRITICAL MISSING FEATURE"
 * AI PROACTIVELY assigns sessions based on user's journey, patterns, time, struggles
 */

import type { UserProfile } from "@/lib/adaptiveJourneyEngine";

import { selectFramework } from "@/lib/session-frameworks";
import type { CheckInState } from "@/lib/session-frameworks";

export interface SessionRecommendation {
  masterId: string;
  masterName: string;
  masterImage: string;
  sessionTitle: string;
  sessionType: "practice" | "journey" | "program" | "guidance";
  durationMinutes: number;
  reason: string; // Short message from master
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  whyThis: string[]; // Detailed reasons for "Why This?" button
  urgency: "gentle" | "normal" | "important";
  frameworkId?: string;
  frameworkName?: string;
  frameworkCategory?: string;
}

/**
 * Detect patterns from user's practice history
 */
function detectPatterns(profile: UserProfile): string[] {
  const patterns: string[] = [];
  
  if (profile.recentReflections.length > 0) {
    const reflections = profile.recentReflections.join(" ").toLowerCase();
    if (reflections.includes("restless") || reflections.includes("can't sit") || reflections.includes("fidget")) {
      patterns.push("restlessness-before-practice");
    }
    if (reflections.includes("calm") || reflections.includes("peace") || reflections.includes("still")) {
      patterns.push("calm-after-practice");
    }
    if (reflections.includes("angry") || reflections.includes("frustrated") || reflections.includes("irritated")) {
      patterns.push("anger-during-practice");
    }
    if (reflections.includes("sad") || reflections.includes("cry") || reflections.includes("heavy")) {
      patterns.push("sadness-during-practice");
    }
    if (reflections.includes("clear") || reflections.includes("focus") || reflections.includes("present")) {
      patterns.push("clarity-during-practice");
    }
  }
  
  // Time-based patterns
  if (profile.preferredTime === "morning" && profile.avgRating > 3.5) {
    patterns.push("strong-morning-practitioner");
  }
  if (profile.preferredTime === "night" && profile.avgRating > 3.5) {
    patterns.push("strong-night-practitioner");
  }
  
  return patterns;
}

/**
 * Generate session recommendation based on user state
 */
function generateBaseSessionRecommendation(
  profile: UserProfile,
  masterName: string,
  masterImage: string
): SessionRecommendation {
  const patterns = detectPatterns(profile);
  const hour = new Date().getHours();
  const timeOfDay = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 17 ? "afternoon" : hour >= 17 && hour < 22 ? "evening" : "night";
  
  const isStruggling = profile.missedDays > 3 || profile.lastJournalSentiment === "negative";
  const isThriving = profile.streakDays >= 7 && profile.avgRating >= 4;
  
  // Pattern-based recommendations
  if (patterns.includes("restlessness-before-practice") && isStruggling) {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "Gentle Breathwork",
      sessionType: "practice",
      durationMinutes: 10,
      reason: `I noticed restlessness before practice. Let's start gently — just 10 minutes of breath.`,
      timeOfDay,
      whyThis: [
        `You've felt restlessness before practice recently`,
        `Your last journal entry mentioned difficulty settling`,
        `Short sessions work better when resistance is high`,
        `${masterName} specializes in gentle approaches`,
      ],
      urgency: "gentle",
    };
  }
  
  if (patterns.includes("anger-during-practice")) {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "Observing Resistance",
      sessionType: "practice",
      durationMinutes: 15,
      reason: `I see anger arising during practice. Don't fight it. Observe it. That observation itself transforms.`,
      timeOfDay,
      whyThis: [
        `Your recent reflections mentioned anger/frustration`,
        `Anger during practice is common — it means something is being challenged`,
        `Observation practice helps you stay present with difficult emotions`,
      ],
      urgency: "important",
    };
  }
  
  if (profile.missedDays > 5) {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "Just Sit",
      sessionType: "practice",
      durationMinutes: 5,
      reason: `You've been away for ${profile.missedDays} days. That's okay. The path doesn't judge you. Just sit for 5 minutes. That's enough for today.`,
      timeOfDay,
      whyThis: [
        `You've missed ${profile.missedDays} days`,
        `Short sessions prevent the guilt spiral`,
        `The most important practice is the one you actually do`,
        `${masterName} says: "Returning is its own courage"`,
      ],
      urgency: "gentle",
    };
  }
  
  if (isThriving && patterns.includes("clarity-during-practice")) {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "Deep Self-Inquiry",
      sessionType: "journey",
      durationMinutes: 35,
      reason: `${profile.streakDays} days strong. You're sitting differently now — deeper, clearer. Today we go further. Extend your practice by 5 minutes. See what's at the edge.`,
      timeOfDay,
      whyThis: [
        `You've practiced ${profile.streakDays} days in a row`,
        `Your journal shows clarity and depth increasing`,
        `Your average rating is ${profile.avgRating}/5 — you're ready for more`,
        `Extending practice deepens the transformation`,
      ],
      urgency: "normal",
    };
  }
  
  // Time-of-day defaults
  if (timeOfDay === "morning") {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "Breathwork & Activation",
      sessionType: "practice",
      durationMinutes: 15,
      reason: `The morning is fresh. The mind is clearer now than it will be all day. Let's activate your energy with breath.`,
      timeOfDay,
      whyThis: [
        `Morning is your ${profile.preferredTime === "morning" ? "preferred" : "chosen"} practice time`,
        `Fresh energy in the morning supports breathwork`,
        `15 minutes is enough to activate without exhausting`,
      ],
      urgency: "normal",
    };
  }
  
  if (timeOfDay === "afternoon") {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "Midday Reset",
      sessionType: "practice",
      durationMinutes: 5,
      reason: `Midday. The world is noisy. But you're here. That's the point. Just 5 minutes to re-center.`,
      timeOfDay,
      whyThis: [
        `Afternoon sessions work best as quick resets`,
        `The chaos of the day needs counterbalance`,
        `5 minutes is enough to recalibrate`,
      ],
      urgency: "gentle",
    };
  }
  
  if (timeOfDay === "evening") {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "Self-Inquiry & Reflection",
      sessionType: "journey",
      durationMinutes: 30,
      reason: `Evening. The day's dust settles. Now we go inward. What arose today? What wants to be seen?`,
      timeOfDay,
      whyThis: [
        `Evening is the deepest time for reflection`,
        `Processing the day's events transforms them`,
        `30 minutes gives space for genuine inquiry`,
      ],
      urgency: "normal",
    };
  }
  
  // Night (default)
  return {
    masterId: profile.masterId,
    masterName,
    masterImage,
    sessionTitle: "Yoga Nidra & Surrender",
    sessionType: "practice",
    durationMinutes: 20,
    reason: `Night. The world is quiet. The mind is honest. This is the deepest time. Let go. Surrender. Rest.`,
    timeOfDay,
    whyThis: [
      `Night sessions are the most transformative`,
      `The quiet mind speaks truth at night`,
      `20 minutes of Yoga Nidra prepares you for deep sleep`,
    ],
    urgency: "gentle",
  };
}

/**
 * Check if user has missed days and generate outreach message
 */
export function generateMissedDayOutreach(
  profile: UserProfile,
  masterName: string,
  masterImage: string
): SessionRecommendation | null {
  if (profile.missedDays <= 2) return null; // Don't nag for 1-2 days
  
  if (profile.missedDays <= 5) {
    return {
      masterId: profile.masterId,
      masterName,
      masterImage,
      sessionTitle: "What's Arising?",
      sessionType: "guidance",
      durationMinutes: 10,
      reason: `You've skipped a few days. What's arising? No judgment. Just honest observation. Come sit with me.`,
      timeOfDay: profile.preferredTime,
      whyThis: [
        `You missed ${profile.missedDays} days`,
        `Checking in — not to guilt, but to understand`,
        `A short session lowers the barrier to return`,
      ],
      urgency: "gentle",
    };
  }
  
  return {
    masterId: profile.masterId,
    masterName,
    masterImage,
    sessionTitle: "The Path Hasn't Moved",
    sessionType: "practice",
    durationMinutes: 5,
    reason: `Your practice misses you. ${profile.missedDays} days. No guilt. Just return. Day ${profile.currentDay}. Fresh start. I've been waiting.`,
    timeOfDay: profile.preferredTime,
    whyThis: [
      `You've been away for ${profile.missedDays} days`,
      `The path doesn't judge you — it waits`,
      `5 minutes is the smallest commitment possible`,
      `Every return is its own courage`,
    ],
    urgency: "gentle",
  };
}

export function generateSessionRecommendation(
  profile: UserProfile,
  masterName: string,
  masterImage: string
): SessionRecommendation {
  const base = generateBaseSessionRecommendation(profile, masterName, masterImage);
  const checkIn: CheckInState =
    profile.missedDays > 5 ? "overwhelmed" :
    profile.lastJournalSentiment === "negative" ? "confused" :
    profile.avgRating >= 4 ? "calm" : "curious";
  const selection = selectFramework({
    timeBudgetMin: base.durationMinutes,
    energy: profile.missedDays > 3 ? "low" : "medium",
    checkIn,
    goal: base.sessionTitle,
  });
  return {
    ...base,
    frameworkId: selection.selected.id,
    frameworkName: selection.selected.name,
    frameworkCategory: selection.selected.category,
  };
}
