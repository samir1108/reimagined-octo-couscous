/**
 * Sacred Notifications System
 * Per temple.md: Sacred invitations, NOT pushy notifications
 * Types: Full moon, personal milestones, traditional observances, global sangha
 */

import { playSingingBowl } from "@/lib/templeSounds";

export type SacredNotificationType = "full-moon" | "personal-milestone" | "traditional" | "global-sangha" | "vow-reminder" | "gentle-return";

export interface SacredNotification {
  id: string;
  type: SacredNotificationType;
  title: string;
  message: string;
  masterName?: string;
  action?: { label: string; href: string };
  sound: boolean;
  timestamp: string;
  read: boolean;
}

/**
 * Generate sacred notifications based on user state and calendar
 */
export function generateSacredNotifications(
  userState: {
    daysSinceLastPractice: number;
    streakDays: number;
    templeAnniversary?: boolean;
    isFullMoonTomorrow: boolean;
    isFullMoonToday: boolean;
    upcomingEvent?: { name: string; date: string };
  }
): SacredNotification[] {
  const notifications: SacredNotification[] = [];

  // Full moon tonight
  if (userState.isFullMoonToday) {
    notifications.push({
      id: "full-moon-today",
      type: "full-moon",
      title: "🌕 Full Moon Tonight",
      message: "The energy is different tonight. Krishna offers extended silence. The moon pulls us inward.",
      masterName: "Krishna",
      action: { label: "Enter Temple", href: "/app/temple" },
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Full moon tomorrow
  if (userState.isFullMoonTomorrow) {
    notifications.push({
      id: "full-moon-tomorrow",
      type: "full-moon",
      title: "🌕 Full Moon Tomorrow",
      message: "Full moon tomorrow. Krishna offers a special extended session. The energy is different tonight.",
      action: { label: "Prepare", href: "/app/temple" },
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Personal milestone (temple anniversary)
  if (userState.templeAnniversary) {
    notifications.push({
      id: "temple-anniversary",
      type: "personal-milestone",
      title: "📿 Your Temple Anniversary",
      message: "Today marks 1 year since you entered the Temple. The masters remember your first step. Continue.",
      action: { label: "Celebrate", href: "/app/temple" },
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Streak milestones with master's wisdom (NOT numbers)
  if (userState.streakDays === 7) {
    notifications.push({
      id: "streak-7",
      type: "personal-milestone",
      title: "🪷 Seven Days",
      message: "Seven days. You showed up. The seed has been planted. Trust the darkness — growth happens underground first. — Buddha",
      masterName: "Buddha",
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  if (userState.streakDays === 21) {
    notifications.push({
      id: "streak-21",
      type: "personal-milestone",
      title: "🪷 21 Days",
      message: "The habit has formed. It's no longer effort — it's natural. You don't 'do' practice anymore. Practice does you. — Ramana",
      masterName: "Ramana Maharshi",
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  if (userState.streakDays === 100) {
    notifications.push({
      id: "streak-100",
      type: "personal-milestone",
      title: "🪷 100 Days",
      message: "A century of days. You are not who you were on Day 1. The transformation is real. The Temple witnesses it. — Krishna",
      masterName: "Krishna",
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Vow reminder (missed 7+ days)
  if (userState.daysSinceLastPractice >= 7) {
    notifications.push({
      id: "vow-reminder",
      type: "vow-reminder",
      title: "🕯️ Remember Your Vows",
      message: "Remember your vows. Not to me. To yourself. Return when ready. No guilt. The Temple has waited.",
      action: { label: "Return", href: "/app/temple" },
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Gentle return (missed 3-5 days)
  if (userState.daysSinceLastPractice >= 3 && userState.daysSinceLastPractice < 7) {
    notifications.push({
      id: "gentle-return",
      type: "gentle-return",
      title: "🕯️ Your Practice Misses You",
      message: "You've been away a few days. What's arising? No judgment. The practice awaits whenever you're ready.",
      action: { label: "Enter Temple", href: "/app/temple" },
      sound: false,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Upcoming traditional event
  if (userState.upcomingEvent) {
    notifications.push({
      id: `event-${userState.upcomingEvent.name}`,
      type: "traditional",
      title: `🕉️ ${userState.upcomingEvent.name}`,
      message: `${userState.upcomingEvent.name} approaches on ${userState.upcomingEvent.date}. Prepare your practice.`,
      action: { label: "Learn More", href: "/app/temple" },
      sound: true,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  return notifications;
}

/**
 * Play appropriate sound for notification type
 */
export function playNotificationSound(type: SacredNotificationType): void {
  // All sacred notifications use singing bowl (gentle)
  playSingingBowl();
}
