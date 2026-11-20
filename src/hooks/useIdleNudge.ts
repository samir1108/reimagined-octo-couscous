import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Idle Practice Nudge — detects user inactivity (3 min) and sends
 * a personalized practice notification based on their weakest lens
 * (head/heart/gut/witness) from consciousness signals data.
 */

const IDLE_TIMEOUT_MS = 15 * 1000; // 15 seconds
const COOLDOWN_MS = 30 * 60 * 1000; // Don't nudge more than once per 30 min
const STORAGE_KEY = "hope-app-last-idle-nudge";

interface LensPractice {
  lens: string;
  title: string;
  body: string;
  metadata: Record<string, any>;
}

const lensPractices: Record<string, LensPractice[]> = {
  head: [
    {
      lens: "head",
      title: "🧠 Your mind is waiting",
      body: "You've been still — try a 2-minute thought observation. Notice what's passing through without grabbing onto it.",
      metadata: { action: "guide", mode: "thought_observation", aiContext: "idle_nudge_head" },
    },
    {
      lens: "head",
      title: "🧠 Pause & witness your thoughts",
      body: "Your Head lens could use attention. Close your eyes and count 10 breaths — notice when thinking pulls you away.",
      metadata: { action: "guide", mode: "mindfulness", aiContext: "idle_nudge_head_breath" },
    },
  ],
  heart: [
    {
      lens: "heart",
      title: "💚 Feel what's here right now",
      body: "Your Heart lens is calling. Place a hand on your chest — what emotion is present? Name it without judging.",
      metadata: { action: "guide", mode: "emotional_check", aiContext: "idle_nudge_heart" },
    },
    {
      lens: "heart",
      title: "💚 A moment of gratitude",
      body: "Take 60 seconds to think of 3 things you're grateful for. Let the warmth land in your body.",
      metadata: { action: "guide", mode: "gratitude", aiContext: "idle_nudge_heart_gratitude" },
    },
  ],
  gut: [
    {
      lens: "gut",
      title: "🔥 Check in with your body",
      body: "Your Gut lens needs presence. Do a quick body scan — where do you hold tension? Breathe into that spot.",
      metadata: { action: "guide", mode: "body_scan", aiContext: "idle_nudge_gut" },
    },
    {
      lens: "gut",
      title: "🔥 Ground yourself",
      body: "Feel your feet on the ground. Notice 3 physical sensations right now. Your body has wisdom — listen.",
      metadata: { action: "guide", mode: "grounding", aiContext: "idle_nudge_gut_ground" },
    },
  ],
  witness: [
    {
      lens: "witness",
      title: "👁️ Step back and observe",
      body: "Your Witness lens is your superpower. For 1 minute, simply observe — thoughts, feelings, sensations — without engaging.",
      metadata: { action: "guide", mode: "witness_practice", aiContext: "idle_nudge_witness" },
    },
    {
      lens: "witness",
      title: "👁️ Who is watching?",
      body: "This stillness is an opportunity. Ask yourself: 'Who is aware of this moment?' Sit with the question.",
      metadata: { action: "guide", mode: "self_inquiry", aiContext: "idle_nudge_witness_inquiry" },
    },
  ],
};

function getWeakestLens(signals: any[]): string {
  if (!signals.length) {
    // Random lens if no data
    const lenses = ["head", "heart", "gut", "witness"];
    return lenses[Math.floor(Math.random() * lenses.length)];
  }

  // Aggregate signal strength per lens from recent consciousness signals
  const totals: Record<string, number> = { head: 0, heart: 0, gut: 0, witness: 0 };
  const counts: Record<string, number> = { head: 0, heart: 0, gut: 0, witness: 0 };

  for (const sig of signals) {
    const h = sig.head_signals || {};
    const hr = sig.heart_signals || {};
    const g = sig.gut_signals || {};
    const w = sig.witness_signals || {};

    // Count non-empty signal entries as activity strength
    const headScore = Object.keys(h).length;
    const heartScore = Object.keys(hr).length;
    const gutScore = Object.keys(g).length;
    const witnessScore = typeof w.depth === "number" ? w.depth : Object.keys(w).length;

    totals.head += headScore;
    totals.heart += heartScore;
    totals.gut += gutScore;
    totals.witness += witnessScore;
    counts.head++;
    counts.heart++;
    counts.gut++;
    counts.witness++;
  }

  // Find weakest (lowest average activity)
  let weakest = "head";
  let lowestAvg = Infinity;
  for (const lens of Object.keys(totals)) {
    const avg = counts[lens] > 0 ? totals[lens] / counts[lens] : 0;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakest = lens;
    }
  }

  return weakest;
}

/**
 * Idle nudge is DISABLED — it was too aggressive for normal users.
 * Keeping the hook signature so existing imports don't break.
 */
export function useIdleNudge(_userId: string | undefined) {
  // No-op: disabled to reduce notification noise
}
