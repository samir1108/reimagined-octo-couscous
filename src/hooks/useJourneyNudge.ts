import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentTimeSlot } from "@/lib/timeSlots";

/**
 * Journey Nudge — sends rich, AI-personalized journey notifications
 * 3 times a day (morning, evening, night). Uses past user data for context.
 * Deduplicates per timeSlot per day via localStorage.
 */

const STORAGE_KEY = "hope-app-journey-nudge";
const NUDGE_SLOTS = ["morning"] as const; // Reduced to 1x/day to keep notifications minimal

function getNudgeKey(date: string, slot: string) {
  return `${date}:${slot}`;
}

function hasNudgedToday(slot: string): boolean {
  try {
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const sent: string[] = JSON.parse(raw);
    return sent.includes(getNudgeKey(today, slot));
  } catch {
    return false;
  }
}

function markNudgeSent(slot: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem(STORAGE_KEY);
    const sent: string[] = raw ? JSON.parse(raw) : [];
    // Clean old entries (keep only today)
    const todayEntries = sent.filter((k) => k.startsWith(today));
    todayEntries.push(getNudgeKey(today, slot));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todayEntries));
  } catch {}
}

export function useJourneyNudge(userId: string | undefined) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!userId || firedRef.current) return;
    firedRef.current = true;

    const sendNudge = async () => {
      const currentSlot = getCurrentTimeSlot();

      // Only nudge for morning, evening, night (skip midday)
      if (!NUDGE_SLOTS.includes(currentSlot as any)) return;

      // Already nudged for this slot today?
      if (hasNudgedToday(currentSlot)) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-journey-nudge`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ timeSlot: currentSlot }),
          }
        );

        if (resp.ok) {
          markNudgeSent(currentSlot);
        } else {
          console.warn("Journey nudge failed:", resp.status);
        }
      } catch (err) {
        console.error("Journey nudge error:", err);
      }
    };

    // Small delay so app loads first
    const timer = setTimeout(sendNudge, 5000);
    return () => clearTimeout(timer);
  }, [userId]);
}
