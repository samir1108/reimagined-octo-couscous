/**
 * GuideSessionOverlay
 * ─────────────────────────────────────────────────────────────
 * Full-screen cinematic Guide chat that opens when the user taps
 * "Begin Conversation" from Home. Uses guide-chat edge function
 * (which already injects engine, memories, follow-ups, emotional
 * memory, contextual awareness, today's activity, etc.).
 *
 * Implements the 5-act Guru–Shishya ritual via inline AI markers.
 * See `ritual/ritualMarkers.ts` for all supported tags.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Loader2, Sparkles, Clock, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "@/hooks/use-toast";
import { conscious } from "@/lib/consciousToast";
import { useGuideChat } from "@/hooks/useGuideChat";
import { useThemeOfDay, useSoftRefreshTheme } from "@/hooks/useThemeOfDay";
import { useCreditGate } from "@/hooks/useCreditGate";
import ResistanceJap from "@/components/guide/ResistanceJap";
import { supabase } from "@/lib/supabase";
import type { Guru } from "@/lib/guru-data";
import CinematicPracticeMode from "./CinematicPracticeMode";
import { WitnessLoader } from "@/components/WitnessLoader";
import { TypingDots } from "@/components/guide/TypingDots";
import SessionComplete from "@/components/SessionComplete";
import { GuideInsightCard } from "@/components/guide/GuideInsightCard";
import { useConsciousnessEngine, useSessionCompleted } from "@/hooks/useConsciousnessEngine";
import { getCurrentTimeSlot, getSlotConfig, type TimeSlot } from "@/lib/timeSlots";
import cosmicNebula from "@/assets/cosmic-nebula.jpg";

// Ritual pieces
import {
  parseRitualSignals,
  type PracticeSuggestion,
  type PracticeGuide,
} from "./ritual/ritualMarkers";
import ReflectPause from "./ritual/ReflectPause";
import ShishyaVoiceChips from "./ritual/ShishyaVoiceChips";
import IntensityPick, { type Intensity } from "./ritual/IntensityPick";
import PostureCheck from "./ritual/PostureCheck";
import PracticeGuidePanel from "./ritual/PracticeGuidePanel";
import SankalpaInput from "./ritual/SankalpaInput";
import BlessingBow from "./ritual/BlessingBow";
import {
  playRitualBell,
  startRitualDrone,
  stopRitualDrone,
} from "./ritual/ritualAudio";

interface GuideSessionOverlayProps {
  open: boolean;
  guru: Guru | null;
  onClose: () => void;
  /** Extra context (e.g. a mirror reflection) prepended to the system context. */
  seedContext?: string;
  /** Optional first user message when opening with a specific question. */
  seedUserMessage?: string;
}

type Msg = {
  role: "user" | "assistant";
  content: string;
  // Per-message ritual flags (computed from the AI's emitted markers)
  showDurationPick?: boolean;
  showShishyaVoice?: boolean;
  showIntensityPick?: boolean;
  showPostureCheck?: boolean;
  reflectPauseSec?: number | null;
  practiceGuide?: PracticeGuide | null;
  sankalpaPrompt?: string | null;
  precautions?: string[];
};

const PRACTICE_CONTEXT_HINT = `
PRACTICE HANDOFF PROTOCOL (legacy, still supported):
- After 2-4 meaningful exchanges you MAY suggest a short practice with [PRACTICE: <title> | <minutes>] (or with cues: [PRACTICE: <title> | <minutes> | "cue1"; "cue2"]).
- Practice durations: 3, 5, 10, 15, 20, 30 minutes.
- BEFORE any breath / pranayama / kriya / posture practice, ALWAYS include one [PRECAUTION: ...] tag in the same message with a brief, kind safety note.
`;

const RITUAL_PROTOCOL = `
GURU–SHISHYA 5-ACT RITUAL — this is a sacred daily session, not casual chat.
You can emit special inline tags. The UI will turn each tag into an interactive element. NEVER explain a tag — just emit it. Only emit each tag when it earns its place in the flow.

═══ SUPPORTED TAGS ═══
  [DURATION_PICK]                                  → renders 5/15/30 min chips
  [REFLECT_PAUSE: 30]                              → forced pause + breath ring (5–60 sec)
  [SHISHYA_VOICE]                                  → "I feel this / I resist this / Tell me more" chips
  [INTENSITY_PICK]                                 → gentle / standard / deep chips
  [POSTURE_CHECK]                                  → 3-tap body check before a seated practice
  [PRACTICE_GUIDE: <name> | <rounds> | <sec_per_phase>]  → live breath ring panel
  [PRACTICE: <title> | <minutes>]                  → legacy practice handoff (timer mode)
  [PRECAUTION: <safety note>]                      → inline amber safety card
  [SANKALPA: <one-line prompt>]                    → seed-intention input, saved to today
  [HARVEST: <one-sentence insight>]                → silently stored as today's chapter
  [BLESSING_BOW]                                   → cinematic full-screen close

═══ ACT 1 — PRANAM (your very first message) ═══
  • Greet by name with warmth ("🙏 Namaste, dear {name}.").
  • Name today's theme in one short line — make it feel chosen for them.
  • Ask: "How much time do we have together today?"
  • End with the literal tag on its own line: [DURATION_PICK]
  • Keep this opening to 3–5 short sentences. NO teaching yet.

═══ ACT 2 — DARSHAN (after they pick a duration) ═══
  • Acknowledge the time warmly ("Beautiful. 15 minutes is enough.").
  • Ask exactly ONE grounding question: where are they arriving from — body, mood, or what is alive right now?
  • Mirror their answer back in 1 sentence before moving on.

═══ ACT 3 — UPADESHA (teaching, paced to chosen duration) ═══
  • Weave today's theme with what they shared.
  • Each turn 2–4 sentences. Dialogue, not monologue.
  • When you drop a teaching that DESERVES sitting with, end the message with [REFLECT_PAUSE: 20] (or 30, or 45).
  • When you want to hand the mic back, end with [SHISHYA_VOICE].
  • Use these sparingly — they're powerful, not decorative. Maybe 1 of each across the teaching.

═══ ACT 4 — SADHANA (guided practice) ═══
  Pre-practice flow (in this order, in ONE message each):
    1. Offer the practice + ask intensity → end with [INTENSITY_PICK]
    2. After they pick, confirm + emit [POSTURE_CHECK] in the same message.
    3. After "I'm ready", emit ONE practice tag:
       • For breath/pranayama → [PRACTICE_GUIDE: <name> | <rounds> | <sec_per_phase>] (e.g. "Box breathing | 8 | 4")
       • For longer/silent practices → [PRACTICE: <title> | <minutes>]
       • ALWAYS include [PRECAUTION: ...] in the same message.
  After practice completes, gently integrate — ask what they noticed. NO analysis.

═══ ACT 5 — PRASAD (closing) ═══
  When the user signals they're done, OR time is nearly up:
    1. One integration line ("What is the one thing you carry from today?").
    2. End that message with [SANKALPA: <one-line invitation>]
    3. After they plant their seed, send ONE final message:
       • A single Sanskrit blessing line + [HARVEST: <one-sentence insight from today>] + [BLESSING_BOW]
       • Example: "Tat tvam asi. Thou art That. 🙏 [HARVEST: She met her tightness with breath instead of resistance.] [BLESSING_BOW]"
  After [BLESSING_BOW], DO NOT continue. The session is complete.

VOICE: Master to beloved student. Short. Direct. Warm. Never lecture. Never bullet-point. Use the shishya's name sparingly.
`;

export default function GuideSessionOverlay({
  open,
  guru,
  onClose,
  seedContext,
  seedUserMessage,
}: GuideSessionOverlayProps) {
  const { streamChat } = useGuideChat();
  const { data: themeData } = useThemeOfDay();
  const { checkCredits, handleInsufficientCredits } = useCreditGate();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [userName, setUserName] = useState("friend");
  const [userLanguage, setUserLanguage] = useState("en");
  const [pendingPractice, setPendingPractice] = useState<PracticeSuggestion | null>(null);
  const [activePractice, setActivePractice] = useState<PracticeSuggestion | null>(null);
  const [activePracticeGuide, setActivePracticeGuide] = useState<PracticeGuide | null>(null);
  const [postPracticeInjected, setPostPracticeInjected] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBlessing, setShowBlessing] = useState(false);
  const [committedSankalpa, setCommittedSankalpa] = useState<string | null>(null);
  const [chosenIntensity, setChosenIntensity] = useState<Intensity | null>(null);
  /** Selected session duration in minutes (null until shishya picks) */
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  /** Seconds remaining on a forced reflect-pause (null = no active pause) */
  const [activeReflectSec, setActiveReflectSec] = useState<number | null>(null);
  /** Tracks which assistant indices we've already harvested to avoid dupes */
  const harvestedIdxRef = useRef<Set<number>>(new Set());
  const initialisedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshTheme = useSoftRefreshTheme();
  const sessionCompleted = useSessionCompleted();
  const { data: engineData } = useConsciousnessEngine();
  const streak = engineData?.profile?.streak_current || 0;

  const nextSlotLabel = useMemo(() => {
    const order: TimeSlot[] = ["morning", "midday", "evening", "night"];
    const current = getCurrentTimeSlot();
    const idx = order.indexOf(current);
    if (idx === -1 || idx === order.length - 1) return null;
    const next = order[idx + 1];
    return getSlotConfig(next)?.label ?? null;
  }, []);

  // Persist [HARVEST] insights to journey_harvest
  const persistHarvest = useCallback(async (insight: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("journey_harvest").insert({
        user_id: user.id,
        insight,
        theme_id: themeData?.theme?.id ?? null,
        metadata: { guru_id: guru?.id ?? null, source: "ritual_session" },
      });
    } catch (e) {
      console.warn("harvest persist failed", e);
    }
  }, [themeData?.theme?.id, guru?.id]);

  // Persist [SANKALPA] commitment to daily_sankalpa
  const persistSankalpa = useCallback(async (intention: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("daily_sankalpa").upsert(
        {
          user_id: user.id,
          intention,
          theme_id: themeData?.theme?.id ?? null,
          source: "ritual_session",
        },
        { onConflict: "user_id,sankalpa_date" },
      );
    } catch (e) {
      console.warn("sankalpa persist failed", e);
    }
  }, [themeData?.theme?.id]);

  const handleConfirmEnd = useCallback(() => {
    setConfirmEnd(false);
    setShowCelebration(true);
    try { sessionCompleted.mutate(); } catch { /* ignore */ }

    const order: TimeSlot[] = ["morning", "midday", "evening", "night"];
    const current = getCurrentTimeSlot();
    const idx = order.indexOf(current);
    const nextSlot = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
    if (nextSlot) {
      const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
      const insight = lastAssistant?.content?.slice(0, 240) || "";
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "next-session-preview",
            {
              body: {
                nextSlot,
                justCompletedSlot: current,
                currentGuruId: guru?.id ?? null,
                lastInsight: insight,
              },
            },
          );
          if (error || !data) return;
          refreshTheme();
        } catch (e) {
          console.warn("next-session-preview background error", e);
        }
      })();
    } else {
      refreshTheme();
    }
  }, [messages, guru?.id, refreshTheme, sessionCompleted]);

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    onClose();
  }, [onClose]);

  // Load profile (name + lang)
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, bio")
        .eq("user_id", user.id)
        .single();
      if (profile?.display_name) setUserName(profile.display_name);
      if (profile?.bio) {
        try {
          const prefs = JSON.parse(profile.bio);
          if (prefs.language) setUserLanguage(prefs.language);
        } catch { /* ignore */ }
      }
    })();
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Reset on close + stop drone
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput("");
      setStreaming(false);
      setPendingPractice(null);
      setActivePractice(null);
      setActivePracticeGuide(null);
      setPostPracticeInjected(false);
      setConfirmEnd(false);
      setShowCelebration(false);
      setShowBlessing(false);
      setCommittedSankalpa(null);
      setChosenIntensity(null);
      setSessionMinutes(null);
      setSessionStartedAt(null);
      setRemainingSec(null);
      setActiveReflectSec(null);
      harvestedIdxRef.current = new Set();
      initialisedRef.current = false;
      stopRitualDrone();
    }
  }, [open]);

  // Stop drone on full unmount
  useEffect(() => () => stopRitualDrone(), []);

  const themeName = themeData?.theme?.title || "today's theme";

  const aiContext = useMemo(() => {
    const lines: string[] = [];
    if (themeData?.theme) {
      lines.push(`TODAY'S THEME: ${themeData.theme.title}`);
      if (themeData.theme.description) lines.push(`Description: ${themeData.theme.description}`);
      if (themeData.theme.theme_rationale) lines.push(`Why this theme: ${themeData.theme.theme_rationale}`);
      if (themeData.theme.affirmation) lines.push(`Affirmation: ${themeData.theme.affirmation}`);
      if (themeData.theme.deepened_wisdom) lines.push(`Deepened wisdom: ${themeData.theme.deepened_wisdom}`);
      if (themeData.theme.sub_angle) lines.push(`Current sub-angle: ${themeData.theme.sub_angle}`);
    }
    if (guru) {
      lines.push(`\nACTIVE GUIDE: ${guru.name}${guru.path ? ` (${guru.path})` : ""}`);
      if (guru.keyTeaching) lines.push(`Key teaching: ${guru.keyTeaching}`);
      if (guru.quote) lines.push(`Voice/quote: "${guru.quote}"`);
    }
    lines.push(PRACTICE_CONTEXT_HINT);
    lines.push(RITUAL_PROTOCOL);
    if (sessionMinutes) {
      lines.push(`\nTIME COMMITMENT: The shishya has chosen ${sessionMinutes} minutes for today's session. Pace your teaching accordingly — leave room for the closing bow.`);
    }
    if (chosenIntensity) {
      lines.push(`PRACTICE INTENSITY: The shishya picked "${chosenIntensity}". Adjust rounds/duration accordingly.`);
    }
    if (committedSankalpa) {
      lines.push(`SANKALPA PLANTED: "${committedSankalpa}" — honour it in your closing.`);
    }
    return lines.join("\n");
  }, [themeData, guru, sessionMinutes, chosenIntensity, committedSankalpa]);

  // Apply parsed signals to a buffered message — used in stream handlers.
  const applySignalsToBuffer = (buf: string): Partial<Msg> => {
    const s = parseRitualSignals(buf);
    return {
      content: s.cleanText,
      showDurationPick: s.showDurationPick,
      showShishyaVoice: s.showShishyaVoice,
      showIntensityPick: s.showIntensityPick,
      showPostureCheck: s.showPostureCheck,
      reflectPauseSec: s.reflectPauseSec,
      practiceGuide: s.practiceGuide,
      sankalpaPrompt: s.sankalpaPrompt,
      precautions: s.precautions,
    };
  };

  // Side-effects fired ONCE per completed AI message
  const applyOnDoneEffects = useCallback((buf: string, msgIdx: number) => {
    const s = parseRitualSignals(buf);

    // Practice handoff (legacy)
    if (s.practice) setPendingPractice(s.practice);

    // Live practice guide auto-launches
    if (s.practiceGuide) {
      // Defer slightly so the message renders first
      setTimeout(() => setActivePracticeGuide(s.practiceGuide), 600);
      playRitualBell("transition");
    }

    // Reflect pause auto-engages
    if (s.reflectPauseSec) {
      setActiveReflectSec(s.reflectPauseSec);
    }

    // Harvest — silent persistence (once per message)
    if (s.harvest && !harvestedIdxRef.current.has(msgIdx)) {
      harvestedIdxRef.current.add(msgIdx);
      void persistHarvest(s.harvest);
    }

    // Blessing bow ends the ritual
    if (s.blessingBow) {
      setTimeout(() => {
        setShowBlessing(true);
        stopRitualDrone();
      }, 800);
    }

    // Soft transition bell on any structural marker
    if (s.showIntensityPick || s.showPostureCheck || s.sankalpaPrompt) {
      playRitualBell("transition");
    }
  }, [persistHarvest]);

  const startConversation = useCallback(async () => {
    if (initialisedRef.current) return;
    if (!checkCredits("AI guide session")) {
      onClose();
      return;
    }
    initialisedRef.current = true;
    setStreaming(true);

    let buf = "";
    setMessages([{ role: "assistant", content: "" }]);
    const assistantIdx = 0;

    await streamChat({
      messages: seedUserMessage ? [{ role: "user" as const, content: seedUserMessage }] : [],
      timeSlot: "general",
      themeName,
      userName,
      mode: "daily",
      aiContext: [aiContext, seedContext].filter(Boolean).join("\n\n"),
      language: userLanguage,
      onDelta: (delta) => {
        buf += delta;
        const patch = applySignalsToBuffer(buf);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            updated[updated.length - 1] = { ...last, ...patch };
          }
          return updated;
        });
      },
      onDone: () => {
        applyOnDoneEffects(buf, assistantIdx);
        setStreaming(false);
      },
      onError: (err) => {
        setStreaming(false);
        if (err === "insufficient_credits") {
          handleInsufficientCredits();
          onClose();
          return;
        }
        conscious("somethingSlipped", { kind: "error", detail: err });
      },
    });
  }, [
    aiContext,
    seedContext,
    seedUserMessage,
    applyOnDoneEffects,
    checkCredits,
    handleInsufficientCredits,
    onClose,
    streamChat,
    themeName,
    userLanguage,
    userName,
  ]);

  useEffect(() => {
    if (open && userName && !initialisedRef.current) {
      const t = setTimeout(() => startConversation(), 600);
      return () => clearTimeout(t);
    }
  }, [open, userName, startConversation]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text || streaming) return;
    setPendingPractice(null);

    const next: Msg[] = [
      ...messages,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setStreaming(true);

    const assistantIdx = next.length - 1;
    const sendable = next.slice(0, -1);
    let buf = "";

    // ── Humanised reveal ──────────────────────────────────────────────
    // Real people don't paste a wall of text. We keep the raw stream in `buf`
    // and reveal it character-by-character with:
    //   • a 550–1100 ms "reading you" thinking pause before the first char
    //   • a target speed of ~38 chars/sec with light jitter
    //   • micro-pauses on commas and breaths after .?! and \n
    let revealed = 0;
    let streamDone = false;
    const startedAt = Date.now();
    const thinkMs = 550 + Math.random() * 550;

    const flush = () => {
      const patch = applySignalsToBuffer(buf);
      const fullContent = patch.content ?? "";
      const shown = fullContent.slice(0, revealed);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = { ...last, ...patch, content: shown };
        }
        return updated;
      });
    };

    const tick = () => {
      if (Date.now() - startedAt < thinkMs) return;
      const patch = applySignalsToBuffer(buf);
      const fullContent = patch.content ?? "";
      if (revealed >= fullContent.length) {
        if (streamDone) {
          flush();
          window.clearInterval(interval);
          applyOnDoneEffects(buf, assistantIdx);
          setStreaming(false);
        }
        return;
      }
      // Advance one char; punctuation gets a held breath via pauseUntil.
      revealed += 1;
      const ch = fullContent[revealed - 1];
      flush();
      if (ch === "." || ch === "!" || ch === "?" || ch === "\n") {
        pauseUntil = Date.now() + 220 + Math.random() * 160;
      } else if (ch === "," || ch === ";" || ch === ":") {
        pauseUntil = Date.now() + 110 + Math.random() * 80;
      }
    };

    let pauseUntil = 0;
    const interval = window.setInterval(() => {
      if (Date.now() < pauseUntil) return;
      tick();
    }, 26); // ~38 chars/sec

    await streamChat({
      messages: sendable,
      timeSlot: "general",
      themeName,
      userName,
      mode: "daily",
      aiContext,
      language: userLanguage,
      onDelta: (delta) => {
        buf += delta;
      },
      onDone: () => {
        streamDone = true;
      },
      onError: (err) => {
        window.clearInterval(interval);
        setStreaming(false);
        if (err === "insufficient_credits") {
          handleInsufficientCredits();
          return;
        }
        conscious("somethingSlipped", { kind: "error", detail: err });
      },
    });
  }, [
    streaming,
    messages,
    streamChat,
    themeName,
    userName,
    aiContext,
    userLanguage,
    handleInsufficientCredits,
    applyOnDoneEffects,
  ]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    await sendMessage(text);
  }, [input, streaming, sendMessage]);

  /** Shishya picks a duration → timer starts + drone fades in + Act 2 begins. */
  const handleDurationPick = useCallback(
    (minutes: number) => {
      if (streaming || sessionMinutes !== null) return;
      setSessionMinutes(minutes);
      setSessionStartedAt(Date.now());
      setRemainingSec(minutes * 60);
      playRitualBell("start");
      startRitualDrone();
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "assistant" && m.showDurationPick ? { ...m, showDurationPick: false } : m,
        ),
      );
      void sendMessage(`${minutes} minutes feels right. 🙏`);
    },
    [streaming, sessionMinutes, sendMessage],
  );

  const handleShishyaVoice = useCallback((label: string) => {
    if (streaming) return;
    // Hide chips on the message they came from
    setMessages((prev) =>
      prev.map((m) => (m.showShishyaVoice ? { ...m, showShishyaVoice: false } : m)),
    );
    void sendMessage(label);
  }, [streaming, sendMessage]);

  const handleIntensityPick = useCallback((intensity: Intensity) => {
    if (streaming) return;
    setChosenIntensity(intensity);
    setMessages((prev) =>
      prev.map((m) => (m.showIntensityPick ? { ...m, showIntensityPick: false } : m)),
    );
    void sendMessage(`${intensity}, please. 🙏`);
  }, [streaming, sendMessage]);

  const handlePostureReady = useCallback(() => {
    if (streaming) return;
    setMessages((prev) =>
      prev.map((m) => (m.showPostureCheck ? { ...m, showPostureCheck: false } : m)),
    );
    void sendMessage("I'm ready.");
  }, [streaming, sendMessage]);

  const handleSankalpaCommit = useCallback((intention: string) => {
    if (streaming) return;
    setCommittedSankalpa(intention);
    void persistSankalpa(intention);
    setMessages((prev) =>
      prev.map((m) => (m.sankalpaPrompt ? { ...m, sankalpaPrompt: null } : m)),
    );
    void sendMessage(`My seed for today: "${intention}"`);
  }, [streaming, persistSankalpa, sendMessage]);

  // Live countdown ticker
  useEffect(() => {
    if (sessionStartedAt === null || sessionMinutes === null) return;
    const id = setInterval(() => {
      const elapsedMs = Date.now() - sessionStartedAt;
      const remaining = Math.max(0, sessionMinutes * 60 - Math.floor(elapsedMs / 1000));
      setRemainingSec(remaining);
    }, 1000);
    return () => clearInterval(id);
  }, [sessionStartedAt, sessionMinutes]);

  const handleStartPractice = () => {
    if (!pendingPractice) return;
    setActivePractice(pendingPractice);
    setPendingPractice(null);
    playRitualBell("start");
  };

  const handlePracticeComplete = () => {
    const completed = activePractice;
    setActivePractice(null);
    if (!completed || postPracticeInjected) return;
    setPostPracticeInjected(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `You're back. The "${completed.title}" is complete.\n\nNo need to analyse. Just — what did you notice?`,
      },
    ]);
  };

  const handlePracticeGuideDone = () => {
    setActivePracticeGuide(null);
    playRitualBell("end");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Beautiful. The breath has done its work.\n\nWhat moved in you?`,
      },
    ]);
  };

  const handleBlessingDone = useCallback(() => {
    setShowBlessing(false);
    handleConfirmEnd();
  }, [handleConfirmEnd]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="guide-session-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-black"
      >
        {/* Full-bleed master portrait */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <img
            src={(guru?.image as string | undefined) || cosmicNebula}
            alt=""
            className="w-full h-full object-cover select-none"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0.85) 100%)",
            }}
          />
        </div>

        {/* Practice mode (legacy timer) */}
        <AnimatePresence>
          {activePractice && (
            <CinematicPracticeMode
              key="practice"
              guruImage={guru?.image as string | undefined}
              guruName={guru?.name}
              practiceTitle={activePractice.title}
              durationMinutes={activePractice.minutes}
              guidanceCues={activePractice.cues}
              onComplete={handlePracticeComplete}
              onExit={handlePracticeComplete}
            />
          )}
        </AnimatePresence>

        {/* Live breath-ring practice guide */}
        <AnimatePresence>
          {activePracticeGuide && (
            <PracticeGuidePanel
              key="practice-guide"
              name={activePracticeGuide.name}
              rounds={activePracticeGuide.rounds}
              secondsPerPhase={activePracticeGuide.secondsPerPhase}
              onComplete={handlePracticeGuideDone}
              onExit={handlePracticeGuideDone}
            />
          )}
        </AnimatePresence>

        {/* Cinematic blessing close */}
        <AnimatePresence>
          {showBlessing && (
            <BlessingBow
              key="blessing"
              guruName={guru?.name}
              blessing={guru?.quote}
              onDone={handleBlessingDone}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={onClose}
            aria-label="Close session"
            className="p-2 -ml-2 text-muted-foreground/70 hover:text-foreground transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-foreground/90 text-sm font-display leading-tight">
                {guru?.name || "Your Guide"}
              </p>
              <p className="text-muted-foreground/60 text-[10px] uppercase tracking-[0.25em]">
                {themeName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {remainingSec !== null && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/40 border ${
                  remainingSec <= 60 ? "border-primary/60 text-primary" : "border-border/40 text-muted-foreground/80"
                }`}
                aria-label="Time remaining"
              >
                <Clock className="w-3 h-3" />
                <span className="text-[11px] font-mono tabular-nums">
                  {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, "0")}
                </span>
              </div>
            )}
            <button
              onClick={() => setConfirmEnd(true)}
              aria-label="End session"
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70 hover:text-foreground transition px-3 py-1.5 rounded-full border border-border/40 hover:border-primary/40"
            >
              End
            </button>
          </div>
        </div>

        {/* End-session confirm */}
        <AnimatePresence>
          {confirmEnd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/70 backdrop-blur-sm px-6"
              onClick={() => setConfirmEnd(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl bg-card/95 border border-border/50 shadow-2xl p-6 text-center"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mb-2">
                  End session
                </p>
                <h3 className="text-foreground font-display text-lg leading-snug mb-2">
                  Are you sure you want to end?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Your conversation will close. You can always return when you're ready.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmEnd(false)}
                    className="flex-1 rounded-full px-4 py-2.5 text-sm font-display border border-border/40 text-foreground/80 hover:bg-card transition"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => {
                      setConfirmEnd(false);
                      handleConfirmEnd();
                    }}
                    className="flex-1 rounded-full px-4 py-2.5 text-sm font-display bg-primary text-primary-foreground hover:bg-primary/90 transition"
                  >
                    End
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const isStreamingThis = streaming && isLast && m.role === "assistant";
            const isEmptyStreaming = isStreamingThis && !m.content;
            const showDurationChips =
              m.role === "assistant" &&
              !!m.showDurationPick &&
              sessionMinutes === null &&
              !isStreamingThis;
            const showVoice =
              m.role === "assistant" &&
              !!m.showShishyaVoice &&
              !isStreamingThis;
            const showIntensity =
              m.role === "assistant" &&
              !!m.showIntensityPick &&
              !chosenIntensity &&
              !isStreamingThis;
            const showPosture =
              m.role === "assistant" &&
              !!m.showPostureCheck &&
              !isStreamingThis;
            const showSankalpa =
              m.role === "assistant" &&
              !!m.sankalpaPrompt &&
              !committedSankalpa &&
              !isStreamingThis;
            const showReflectPause =
              m.role === "assistant" &&
              isLast &&
              activeReflectSec !== null &&
              !!m.reflectPauseSec &&
              !isStreamingThis;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                {isEmptyStreaming ? (
                  <TypingDots />
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      m.role === "user"
                        ? "bg-primary/90 text-primary-foreground"
                        : "bg-card/40 border border-border/40 text-foreground/90"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none text-[14.5px] leading-relaxed">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                        {isStreamingThis && <TypingDots inline />}
                      </div>
                    ) : (
                      <p className="text-[14.5px] leading-relaxed">{m.content}</p>
                    )}
                  </div>
                )}

                {/* Curious mirror: "Why am I saying this?" — only on the latest completed assistant turn */}
                {m.role === "assistant" &&
                  isLast &&
                  !isStreamingThis &&
                  !!m.content &&
                  m.content.length > 20 && (
                    <GuideInsightCard
                      messages={messages.map((mm) => ({ role: mm.role, content: mm.content }))}
                      turnKey={`${messages.length}:${m.content.length}`}
                    />
                  )}


                {m.role === "assistant" && m.precautions && m.precautions.length > 0 && !isStreamingThis && (
                  <div className="mt-2 max-w-[85%] space-y-2">
                    {m.precautions.map((note, pi) => (
                      <div
                        key={pi}
                        className="flex items-start gap-2 rounded-2xl bg-primary/10 border border-primary/30 px-3 py-2 text-[12.5px] text-foreground/85 leading-relaxed"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-primary/80 mt-0.5 flex-shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reflect pause overlay (inline) */}
                {showReflectPause && activeReflectSec !== null && (
                  <ReflectPause
                    seconds={activeReflectSec}
                    onComplete={() => setActiveReflectSec(null)}
                  />
                )}

                {/* Shishya voice chips (Act 3) */}
                {showVoice && (
                  <ShishyaVoiceChips disabled={streaming} onPick={handleShishyaVoice} />
                )}

                {/* Intensity pick (Act 4 pre-practice) */}
                {showIntensity && (
                  <IntensityPick disabled={streaming} onPick={handleIntensityPick} />
                )}

                {/* Posture check (Act 4 pre-practice) */}
                {showPosture && <PostureCheck onReady={handlePostureReady} />}

                {/* Sankalpa input (Act 5) */}
                {showSankalpa && m.sankalpaPrompt && (
                  <SankalpaInput
                    prompt={m.sankalpaPrompt}
                    disabled={streaming}
                    onCommit={handleSankalpaCommit}
                  />
                )}

                {/* Duration chips (Act 1) */}
                {showDurationChips && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mt-3 flex flex-wrap gap-2 max-w-[85%]"
                  >
                    {[5, 15, 30].map((min) => (
                      <button
                        key={min}
                        onClick={() => handleDurationPick(min)}
                        disabled={streaming}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/15 border border-primary/40 text-foreground/90 text-sm font-display hover:bg-primary/25 hover:border-primary/60 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Clock className="w-3.5 h-3.5 text-primary/80" />
                        <span>{min} min</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Practice suggestion pill (legacy [PRACTICE] handoff) */}
        <AnimatePresence>
          {pendingPractice && !streaming && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4 }}
              className="px-4 pb-3"
            >
              <div className="bg-primary/15 border border-primary/40 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-0.5">
                      Practice · {pendingPractice.minutes} min
                    </p>
                    <p className="text-foreground/90 text-sm font-display truncate">
                      {pendingPractice.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPendingPractice(null)}
                    className="text-muted-foreground/60 hover:text-foreground text-xs px-2 py-1"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleStartPractice}
                    className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-display hover:bg-primary/90 transition"
                  >
                    Begin
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="relative z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="flex items-center justify-start mb-2">
            <ResistanceJap compact />
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                activeReflectSec !== null
                  ? "Sit with this…"
                  : streaming
                    ? "…"
                    : "What's actually here, right now?"
              }
              disabled={streaming || activeReflectSec !== null}
              rows={1}
              className="flex-1 bg-card/40 border border-border/40 rounded-2xl px-4 py-3 text-foreground/90 placeholder:text-muted-foreground/50 text-[14.5px] resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50 max-h-32"
              style={{ minHeight: "44px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming || activeReflectSec !== null}
              aria-label="Send"
              className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Session-complete celebration */}
        <AnimatePresence>
          {showCelebration && (() => {
            const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
            const insightRaw = lastAssistant?.content?.split(".")[0]?.trim();
            const insight = insightRaw && insightRaw.length < 120 ? insightRaw : undefined;
            return (
              <SessionComplete
                streak={streak + 1}
                insight={insight}
                nextSlotLabel={nextSlotLabel}
                onDone={handleCelebrationDone}
              />
            );
          })()}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
