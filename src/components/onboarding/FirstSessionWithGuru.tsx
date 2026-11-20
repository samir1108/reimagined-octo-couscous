/**
 * FirstSessionWithGuru
 * ─────────────────────────────────────────────────────────────
 * Shown ONCE, immediately after QuickOnboarding completes.
 *
 * Flow:
 *   1. Cinematic intro: guru portrait + name + opening line
 *   2. User taps "Begin" → expands into TempleChat with that guru
 *   3. When chat closes (back/close), we mark first session complete,
 *      refresh the theme (so Day 1 theme is generated fresh), and
 *      hand control to the parent (→ Home).
 *
 * Non-breaking: the chat is the existing TempleChat component, so
 * no new chat infrastructure is introduced.
 */
import { useMemo, useEffect } from "react";
import { GURUS } from "@/lib/guru-data";
import TempleChat from "@/components/temple/TempleChat";
import { useRefreshTheme } from "@/hooks/useThemeOfDay";

interface FirstSessionWithGuruProps {
  userId: string;
  guruId: string;
  userName: string;
  band: number;
  bandName: string;
  onComplete: () => void;
}

const OPENING_LINES: Record<string, string> = {
  aarav:         "I'm glad you came. Let's start with what's actually here, right now — no incense, no sanskrit. Just you and what's true.",
  veer:          "You're starting to notice the patterns. That noticing itself is the door. Let me walk with you through it.",
  patanjali:     "The witness in you is already awake. We are simply going to give it a steady seat. Sit with me.",
  buddha:        "Welcome. Bring whatever weight you carry — pain, confusion, longing. Together we will look at it without flinching.",
  krishna:       "Arjuna also stood where you stand now. The path opens when we walk it consciously. Let us begin.",
  shankaracharya:"You who seek — the seeker and the sought are one. We will see this together, gently, line by line.",
  ramana:        "Be still. Before we say anything, just notice — who is the one arriving here? That question alone is the journey.",
};

export default function FirstSessionWithGuru({
  userId,
  guruId,
  userName,
  band,
  bandName,
  onComplete,
}: FirstSessionWithGuruProps) {
  const refreshTheme = useRefreshTheme();

  const guru = useMemo(
    () => GURUS.find((g) => g.id === guruId) || GURUS[0],
    [guruId]
  );

  // Preload guru portrait immediately so it's ready before the fade-in
  useEffect(() => {
    if (!guru?.image) return;
    const img = new Image();
    img.src = guru.image as unknown as string;
  }, [guru?.image]);

  const openingLine =
    OPENING_LINES[guru.id] ||
    `Welcome, ${userName || "friend"}. Let's begin where you actually are — not where you think you should be.`;

  const handleFinishFirstSession = () => {
    try {
      localStorage.setItem(`first_session_done_${userId}`, "1");
    } catch { /* ignore */ }
    // Force fresh theme generation now that we have new context
    try { refreshTheme(); } catch { /* ignore */ }
    onComplete();
  };

  // Start directly in AI chat; the old pace/intro gate is no longer part of the flow.
  return (
    <TempleChat
      guru={guru}
      band={band}
      initialMessages={[{ role: "assistant", content: openingLine }]}
      onBack={handleFinishFirstSession}
      onClose={handleFinishFirstSession}
    />
  );
}
