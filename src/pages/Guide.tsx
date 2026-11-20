import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useCreditGate } from "@/hooks/useCreditGate";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useMachine } from "@xstate/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Square, Loader2, MessageCircle, Mic, Users, Sparkles } from "lucide-react";
import LiveDetectionChips from "@/components/LiveDetectionChips";
import LoopRevealOverlay, { getSeenLoops, markLoopSeen } from "@/components/LoopRevealOverlay";
import { useLiveDetection, type DetectedLoop } from "@/hooks/useLiveDetection";
import GuideHistory from "@/components/GuideHistory";
import ReactMarkdown from "react-markdown";
import { GuideMessageBlocks } from "@/components/guide/widgets/GuideMessageBlocks";
import type { WidgetResult } from "@/components/guide/widgets";
import krishnaImg from "@/assets/masters/krishna.jpg";
import { MASTER_IMAGES } from "@/assets/masters";
import { findGuestById } from "@/lib/guestMasterRoster";

import { sessionMachine } from "@/machines/sessionMachine";
import { useCreateSession, useEndSession, useSaveMessage } from "@/hooks/useSessions";
import { useGuideChat } from "@/hooks/useGuideChat";
import { useCinematicDirective } from "@/hooks/useCinematicDirective";
import { useThemeOfDay, useSoftRefreshTheme } from "@/hooks/useThemeOfDay";
import { WitnessLoader } from "@/components/WitnessLoader";
import { useConsciousnessEngine, useSessionCompleted } from "@/hooks/useConsciousnessEngine";
import { useSessionFlow } from "@/hooks/useSessionFlow";
import { readNeedDecision } from "@/lib/needEngine";
import { useActiveGuruProgram } from "@/hooks/useGuruPrograms";
import { useSoulProfile } from "@/hooks/useSoulProfile";
import { getSoulContextMessage } from "@/lib/soulContext";
import { GURUS } from "@/lib/guru-data";
import MasterBlessing from "@/components/session/MasterBlessing";
import ResistanceJap from "@/components/guide/ResistanceJap";
import SessionComplete from "@/components/SessionComplete";
import SilentSit from "@/components/guide/SilentSit";

import { Lightbulb, Users2 } from "lucide-react";
import MasterPicker from "@/components/guide/MasterPicker";
import { GUIDE_MODES } from "@/lib/guideModes";
import { GuideModeFrameworkSheet } from "@/components/guide/GuideModeFrameworkSheet";
import { Info } from "lucide-react";
// NextSessionReady is now delivered as a notification (background); no inline screen.
import { useEvaluatePractice, useActivateSpecialties, type LevelEvaluation } from "@/hooks/usePracticeMatrix";
import { useCompleteGate } from "@/hooks/useSpiritualDNA";
import { useGuruRotation } from "@/hooks/useGuruRotation";
import LevelUpCelebration from "@/components/session/LevelUpCelebration";
import { getSlotConfig, type TimeSlot } from "@/lib/timeSlots";
import { supabase } from "@/lib/supabase";
import { useSessionOrchestrator } from "@/contexts/SessionOrchestratorContext";
import { Button } from "@/design-system";
import { ScrollArea } from "@/design-system";
import { toast } from "@/hooks/use-toast";
import { conscious, consciousFromError } from "@/lib/consciousToast";
import { useAwardKarma } from "@/hooks/useKarma";
import { detectAndAwardBreakthroughs } from "@/lib/breakthroughs/detect";
import { TryThisChip } from "@/components/guide/TryThisChip";

/** Subtle label shown above a guest master's message bubble. */
function SpeakerLabel({ speakerId }: { speakerId?: string | null }) {
  if (!speakerId) return null;
  const guest = findGuestById(speakerId);
  if (!guest) return null;
  return (
    <div className="flex items-center gap-1.5 mb-1 ml-1 text-[10px] md:text-[11px] font-display tracking-wide text-primary/80">
      <span className="text-[11px]">ðŸª”</span>
      <span>{guest.name} speaks</span>
    </div>
  );
}

export default function Guide() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const slot = searchParams.get("slot") as TimeSlot | null;
  const themeId = searchParams.get("themeId");
  const urlMode = searchParams.get("mode");
  const journeyFlag = searchParams.get("journey");
  const urlContext = useMemo(() => {
    const fromUrl = searchParams.get("aiContext");
    if (fromUrl) return fromUrl;
    if (journeyFlag === "1") {
      try {
        const stashed = sessionStorage.getItem("journeySession:aiContext");
        return stashed || null;
      } catch { return null; }
    }
    return null;
  }, [searchParams, journeyFlag]);
  const urlGuruId = searchParams.get("guruId");

  const [state, send] = useMachine(sessionMachine);
  const createSession = useCreateSession();
  const endSession = useEndSession();
  const saveMessage = useSaveMessage();
  const { streamChat } = useGuideChat();
  const { data: themeData } = useThemeOfDay();
  const refreshTheme = useSoftRefreshTheme();
  const { data: engineData } = useConsciousnessEngine();
  const { checkCredits, handleInsufficientCredits } = useCreditGate();
  const { data: activeGuruProgram } = useActiveGuruProgram();
  const { isActive: isSpiralActive, completeCurrent: completeSpiralStep, stepNumber: spiralStep, totalSteps: spiralTotal } = useSessionOrchestrator();
  const { state: soulState } = useSoulProfile();
  const soulCtx = useMemo(() => getSoulContextMessage(soulState), [soulState]);
  const buildAiContext = useCallback((base?: string) => {
    const parts = [base, soulCtx].filter(Boolean);
    return parts.join("\n\n") || undefined;
  }, [soulCtx]);

  // Session flow orchestrator â€” structured AI prompts for morning/evening/night
  const streak = engineData?.profile?.streak_current || 0;
  const sessionCompleted = useSessionCompleted();
  const evaluatePractice = useEvaluatePractice();
  const activateSpecialties = useActivateSpecialties();
  const completeGate = useCompleteGate();
  const { checkRotation } = useGuruRotation();
  const [levelEvaluation, setLevelEvaluation] = useState<LevelEvaluation | null>(null);
  const journeyDay = engineData?.profile?.journey_day || 1;
  const bandLevel = engineData?.profile?.overall_band || 0;
  const bandName = engineData?.profile?.journey_phase || "awakening";
  const focusDimension = engineData?.profile?.dominant_path || "awareness";
  const missedDays = 0;

  const [userName, setUserName] = useState("");
  const [userLanguage, setUserLanguage] = useState("en");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [unknownConcepts, setUnknownConcepts] = useState<string[]>([]);
  const awardKarma = useAwardKarma();

  useEffect(() => {
    if (!authUserId) return;
    let cancelled = false;
    readNeedDecision(authUserId)
      .then((decision) => {
        if (!cancelled && decision.familiarity < 0.35) setUnknownConcepts([decision.label]);
      })
      .catch(() => { /* no evidence yet — keep the guide jargon-free by default */ });
    return () => { cancelled = true; };
  }, [authUserId]);

  // Resolve active Master:
  //   1) URL ?guruId= (explicit override)
  //   2) Today's theme guru (chosen by the engine â€” same logic as Home)
  //   3) Active enrolled program guru
  //   4) Daily-rotating fallback so the page is never empty
  const themeGuruName = (engineData as any)?.guruName || (engineData as any)?.todayCard?.guruName;
  const activeMaster = useMemo(() => {
    if (urlGuruId) {
      const byId = GURUS.find((g) => g.id === urlGuruId);
      if (byId) return byId;
    }
    if (themeGuruName) {
      const byName = GURUS.find(
        (g) => g.name.toLowerCase() === String(themeGuruName).toLowerCase()
      );
      if (byName) return byName;
    }
    if (activeGuruProgram?.guru_id) {
      const byProg = GURUS.find((g) => g.id === activeGuruProgram.guru_id);
      if (byProg) return byProg;
    }
    if (!GURUS.length) return null;
    const dayIdx = Math.floor(Date.now() / 86400000) % GURUS.length;
    return GURUS[dayIdx] || GURUS[0];
  }, [urlGuruId, themeGuruName, activeGuruProgram?.guru_id]);

  const masterContext = useMemo(() => {
    if (!activeMaster) return null;
    return {
      id: activeMaster.id,
      name: activeMaster.name,
      tradition: activeMaster.path || activeMaster.category,
      keyTeaching: activeMaster.keyTeaching,
      quote: activeMaster.quote,
    };
  }, [activeMaster]);

  const cinematicGuruImage = useMemo(
    () => (activeMaster ? (MASTER_IMAGES[activeMaster.id] || activeMaster.image) : undefined),
    [activeMaster],
  );
  const cinematic = useCinematicDirective({
    userId: authUserId,
    guruImage: cinematicGuruImage,
    guruName: activeMaster?.name,
  });

  const sessionFlow = useSessionFlow({
    sessionType: slot as any,
    userName,
    streak,
    journeyDay,
    bandLevel,
    bandName,
    focusDimension,
    language: userLanguage,
    theme: themeData?.theme ? {
      title: themeData.theme.title,
      description: themeData.theme.description,
      theme_rationale: themeData.theme.theme_rationale,
      learning_focus: themeData.theme.learning_focus,
      daily_intentions: themeData.theme.daily_intentions,
      action_items: themeData.theme.action_items,
      affirmation: themeData.theme.affirmation,
      focus_areas: themeData.theme.focus_areas,
    } : null,
    master: masterContext,
    morningSession: undefined, // TODO: fetch from today's sessions
    dayActivity: undefined, // TODO: fetch from today's activity
    missedDays,
    unknownConcepts,
  });

  const [input, setInput] = useState("");
  // userName and userLanguage declared above with sessionFlow
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [silentSitOpen, setSilentSitOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  // showNextReady removed â€” preview is now surfaced via the notification bar.
  const [lastSessionInsight, setLastSessionInsight] = useState<string>("");
  // Cinematic Master blessing shown once per session-start when a Master is active.
  const [showBlessing, setShowBlessing] = useState(false);
  const blessingShownRef = useRef(false);
  const [quickChatOpen, setQuickChatOpen] = useState(false);
  const [masterPickerOpen, setMasterPickerOpen] = useState(false);
  const [quickMessages, setQuickMessages] = useState<Array<{ role: "user" | "assistant"; content: string; speakerId?: string | null }>>([]);
  const [quickInput, setQuickInput] = useState("");
  const [quickStreaming, setQuickStreaming] = useState(false);
  
  const currentQuickSpeakerRef = useRef<string | null>(null);
  const currentSessionSpeakerRef = useRef<string | null>(null);
  // Map of session-message index â†’ guest speaker id (null = Elder).
  const [sessionSpeakerMap, setSessionSpeakerMap] = useState<Record<number, string | null>>({});
  const activeMode = urlMode || "auto";
  const [frameworkSheetOpen, setFrameworkSheetOpen] = useState(false);
  const [aiInitiated, setAiInitiated] = useState(false);
  const sessionStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickMessagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inline-widget completion tracking â€” keyed by message index â†’ set of completed raw tags.
  const [widgetCompleted, setWidgetCompleted] = useState<Record<number, Set<string>>>({});

  const stateRef = useRef(state);
  stateRef.current = state;

  const { detections, isDetecting, trackMessage, resetDetections, enabled: detectionEnabled } = useLiveDetection();

  // Loop Reveal â€” show cinematic overlay the FIRST time a loop ID appears for this user.
  const [revealedLoop, setRevealedLoop] = useState<DetectedLoop | null>(null);
  const revealedShownRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!detections.length) return;
    const seen = getSeenLoops();
    for (const det of detections) {
      for (const loop of det.loops) {
        if (seen.has(loop.id)) continue;
        if (revealedShownRef.current.has(loop.id)) continue;
        revealedShownRef.current.add(loop.id);
        markLoopSeen(loop.id);
        setRevealedLoop(loop);
        return;
      }
    }
  }, [detections]);


  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, bio")
          .eq("user_id", user.id)
          .single();
        setUserName(profile?.display_name || "friend");
        // Parse language preference from bio JSON
        if (profile?.bio) {
          try {
            const prefs = JSON.parse(profile.bio);
            if (prefs.language) setUserLanguage(prefs.language);
          } catch { /* bio is plain text, keep default "en" */ }
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!slot || !state.matches("idle") || sessionStartedRef.current) return;
    // Wait for theme data to load so we have a valid themeId
    const resolvedThemeId = themeId || themeData?.theme?.id || "";
    // If themeId not in URL and themeData not yet loaded, wait
    if (!themeId && !themeData?.theme?.id) return;
    sessionStartedRef.current = true;
    const themeName = themeData?.theme?.title || "self-awareness";
    send({ type: "START_SESSION", timeSlot: slot, themeId: resolvedThemeId, themeName });
  }, [slot, themeId, state.value, themeData, send]);

  const isStarting = state.matches("starting");
  useEffect(() => {
    if (isStarting && state.context.timeSlot) {
      createSession.mutate(
        { timeSlot: state.context.timeSlot, themeId: state.context.themeId || "" },
        {
          onSuccess: (session) => send({ type: "SESSION_CREATED", sessionId: session.id }),
          onError: (err: Error) => {
            send({ type: "ERROR", message: err.message });
            consciousFromError(err, "somethingSlipped");
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarting]);

  const isActive = state.matches("active");
  const sessionId = state.context.sessionId;
  const messageCount = state.context.messages.length;
  const firstMessageInjected = useRef(false);

  // Ref for triggerAIResponse to avoid forward-reference issues
  const triggerAIResponseRef = useRef<(msgs: Array<{ role: string; content: string }>) => Promise<string>>();

  // Trigger blessing once when session becomes active and a Master is present.
  useEffect(() => {
    if (!isActive || !sessionId || blessingShownRef.current) return;
    if (!masterContext) return;
    blessingShownRef.current = true;
    setShowBlessing(true);
  }, [isActive, sessionId, masterContext]);

  // Inject session flow's first message when session becomes active.
  // Wait for blessing to finish (if any) before posting the first message.
  useEffect(() => {
    if (!isActive || !sessionId || messageCount !== 0 || firstMessageInjected.current) return;
    if (showBlessing) return;
    if (!sessionFlow.firstMessage) {
      triggerAIResponseRef.current?.([]);
      return;
    }

    firstMessageInjected.current = true;
    saveMessage.mutate({ sessionId, role: "assistant", content: sessionFlow.firstMessage });
    send({ type: "START_STREAMING" });
    send({ type: "STREAM_DELTA", content: sessionFlow.firstMessage });
    send({ type: "STREAM_DONE" });
  }, [isActive, sessionId, messageCount, sessionFlow.firstMessage, send, saveMessage, showBlessing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.context.messages]);

  useEffect(() => {
    quickMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [quickMessages]);

  // Auto-trigger AI first message when coming from engine suggestion (urlMode or aiContext present)
  useEffect(() => {
    if (aiInitiated) return;
    if (!userName) return; // wait for userName to load
    if (slot) return; // slot-based sessions handle their own first message
    if (!(urlMode || urlContext)) return; // only for engine-suggested entries
    if (!checkCredits("AI guide session")) return;

    setAiInitiated(true);
    setQuickStreaming(true);

    streamChat({
      messages: [],
      timeSlot: "general",
      themeName: themeData?.theme?.title || "general guidance",
      userName,
      mode: activeMode,
      aiContext: buildAiContext(urlContext),
      language: userLanguage,
      master: masterContext,
      onSpeakerChange: (id) => {
        currentQuickSpeakerRef.current = id;
        setQuickMessages((prev) => {
          // Start a NEW assistant bubble whenever the speaker changes mid-stream.
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && (last.content?.length ?? 0) > 0) {
            return [...prev, { role: "assistant", content: "", speakerId: id }];
          }
          if (last?.role === "assistant") {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, speakerId: id };
            return updated;
          }
          return [...prev, { role: "assistant", content: "", speakerId: id }];
        });
      },
      onDelta: (raw) => {
        const delta = cinematic.feed(raw);
        if (!delta) return;
        setQuickMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, content: `${last.content}${delta}` };
            return updated;
          }
          return [...prev, { role: "assistant", content: delta, speakerId: currentQuickSpeakerRef.current }];
        });
      },
      onDone: () => setQuickStreaming(false),
      onError: (error) => {
        setQuickStreaming(false);
        if (error === "insufficient_credits") { handleInsufficientCredits(); return; }
        consciousFromError(new Error(error), "aiQuiet");
      },
    });
  }, [userName, urlMode, urlContext, slot, aiInitiated, activeMode, streamChat, themeData?.theme?.title]);

  const triggerAIResponse = useCallback(
    async (chatMessages: Array<{ role: string; content: string }>) => {
      send({ type: "START_STREAMING" });
      let fullResponse = "";
      const currentState = stateRef.current;

      // Build session flow context for the AI
      const sessionAiContext = sessionFlow.systemPrompt
        ? `${sessionFlow.systemPrompt}${soulCtx ? `\n\n${soulCtx}` : ""}\n\nCURRENT PHASE: ${sessionFlow.phase}\nAdapt your response to this phase.`
        : buildAiContext(urlContext);

      await streamChat({
        messages: chatMessages,
        timeSlot: currentState.context.timeSlot || "morning",
        themeName: currentState.context.themeName || "self-awareness",
        userName,
        mode: activeMode,
        aiContext: sessionAiContext,
        language: userLanguage,
        master: masterContext,
        onSpeakerChange: (id) => {
          // If a guest takes over (or hands back) mid-stream, start a NEW
          // assistant bubble so the speaker label sits above only their words.
          const msgs = stateRef.current.context.messages;
          const last = msgs[msgs.length - 1];
          if (last?.role === "assistant" && (last.content?.length ?? 0) > 0) {
            const sid = stateRef.current.context.sessionId;
            if (sid && fullResponse) {
              saveMessage.mutate({ sessionId: sid, role: "assistant", content: fullResponse });
            }
            fullResponse = "";
            send({ type: "START_STREAMING" });
            const newIdx = stateRef.current.context.messages.length - 1;
            setSessionSpeakerMap((prev) => ({ ...prev, [newIdx]: id }));
          } else {
            const idx = msgs.length - 1;
            if (idx >= 0) setSessionSpeakerMap((prev) => ({ ...prev, [idx]: id }));
          }
          currentSessionSpeakerRef.current = id;
        },
        onDelta: (raw) => {
          const text = cinematic.feed(raw);
          if (!text) return;
          fullResponse += text;
          send({ type: "STREAM_DELTA", content: text });
        },
        onDone: () => {
          send({ type: "STREAM_DONE" });
          const sid = stateRef.current.context.sessionId;
          if (sid && fullResponse) {
            saveMessage.mutate({ sessionId: sid, role: "assistant", content: fullResponse });
          }
        },
        onError: (error) => {
          if (error === "insufficient_credits") {
            send({ type: "ERROR", message: "Credits required" });
            handleInsufficientCredits();
            return;
          }
          send({ type: "ERROR", message: error });
          consciousFromError(new Error(error), "aiQuiet");
        },
      });
      return fullResponse;
    },
    [userName, streamChat, send, saveMessage, activeMode, urlContext, handleInsufficientCredits, sessionFlow.systemPrompt, sessionFlow.phase, soulCtx]
  );

  // Keep ref in sync
  triggerAIResponseRef.current = triggerAIResponse;

  /**
   * Inline-widget event handler â€” called when a Guide widget completes or is skipped.
   * Records completion (so the widget freezes) and sends a synthetic user note back
   * to Guide so it can continue the conversation naturally with the result.
   */
  const handleWidgetEvent = useCallback(
    async (messageIdx: string | number, result: WidgetResult | null, raw: string) => {
      const idx = Number(messageIdx);
      // Mark the raw tag as completed so widget shows its frozen state on re-render.
      setWidgetCompleted((prev) => {
        const next = { ...prev };
        const set = new Set(next[idx] ?? []);
        set.add(raw);
        next[idx] = set;
        return next;
      });

      if (state.context.isStreaming) return;
      const note = result
        ? `(practice complete) ${result.summary}`
        : `(practice skipped)`;
      send({ type: "ADD_USER_MESSAGE", content: note });
      const sid = state.context.sessionId;
      if (sid) saveMessage.mutate({ sessionId: sid, role: "user", content: note });

      const chatMessages = [
        ...stateRef.current.context.messages
          .filter((m) => m.content.trim())
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: note },
      ];
      await triggerAIResponse(chatMessages);
    },
    [state.context.isStreaming, state.context.sessionId, send, saveMessage, triggerAIResponse]
  );

  const handleQuickSend = useCallback(async () => {
    const text = quickInput.trim();
    if (!text || quickStreaming) return;

    setQuickInput("");
    const nextMessages = [...quickMessages, { role: "user" as const, content: text }];
    setQuickMessages(nextMessages);
    setQuickStreaming(true);
    // Track for live detection
    trackMessage("user", nextMessages, nextMessages.length);
    // Award karma for chatting + scan for breakthroughs (silent if short)
    awardKarma.mutate({ source: "ai_chat", silent: true, metadata: { mode: activeMode } });
    detectAndAwardBreakthroughs(text, awardKarma, "guide_chat");

    await streamChat({
      messages: nextMessages,
      timeSlot: "general",
      themeName: themeData?.theme?.title || "general guidance",
      userName,
      mode: activeMode,
      aiContext: buildAiContext(urlContext),
      language: userLanguage,
      master: masterContext,
      onSpeakerChange: (id) => {
        currentQuickSpeakerRef.current = id;
        setQuickMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && (last.content?.length ?? 0) > 0) {
            return [...prev, { role: "assistant", content: "", speakerId: id }];
          }
          if (last?.role === "assistant") {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, speakerId: id };
            return updated;
          }
          return [...prev, { role: "assistant", content: "", speakerId: id }];
        });
      },
      onDelta: (raw) => {
        const delta = cinematic.feed(raw);
        if (!delta) return;
        setQuickMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, content: `${last.content}${delta}` };
            return updated;
          }
          return [...prev, { role: "assistant", content: delta, speakerId: currentQuickSpeakerRef.current }];
        });
      },
      onDone: () => {
        setQuickStreaming(false);
      },
      onError: (error) => {
        setQuickStreaming(false);
        if (error === "insufficient_credits") { handleInsufficientCredits(); return; }
        consciousFromError(new Error(error), "aiQuiet");
      },
    });
  }, [quickInput, quickStreaming, quickMessages, streamChat, themeData?.theme?.title, userName, activeMode, handleInsufficientCredits, urlContext]);

  // Voice send for quick chat (no session)
  const handleQuickVoiceSend = useCallback(async (text: string): Promise<string> => {
    const nextMessages = [...quickMessages, { role: "user" as const, content: text }];
    setQuickMessages(nextMessages);
    setQuickStreaming(true);

    let fullResponse = "";
    await new Promise<void>((resolve) => {
      streamChat({
        messages: nextMessages,
        timeSlot: "general",
        themeName: themeData?.theme?.title || "general guidance",
        userName,
        mode: activeMode,
        aiContext: buildAiContext(urlContext),
        language: userLanguage,
        master: masterContext,
        onDelta: (raw) => {
          const delta = cinematic.feed(raw);
          if (!delta) return;
          fullResponse += delta;
          setQuickMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, content: `${last.content}${delta}` };
              return updated;
            }
            return [...prev, { role: "assistant", content: delta }];
          });
        },
        onDone: () => {
          setQuickStreaming(false);
          resolve();
        },
        onError: (error) => {
          setQuickStreaming(false);
          if (error === "insufficient_credits") { handleInsufficientCredits(); }
          resolve();
        },
      });
    });

    return fullResponse;
  }, [quickMessages, streamChat, themeData?.theme?.title, userName, activeMode, urlContext, handleInsufficientCredits]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || state.context.isStreaming) return;
    if (!checkCredits()) return;
    setInput("");
    send({ type: "ADD_USER_MESSAGE", content: text });
    if (state.context.sessionId) {
      saveMessage.mutate({ sessionId: state.context.sessionId, role: "user", content: text });
    }
    const chatMessages = [
      ...state.context.messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];
    // Track for live detection
    trackMessage("user", chatMessages, state.context.messages.length + 1);
    await triggerAIResponse(chatMessages);
  };

  const handleVoiceSend = useCallback(async (text: string): Promise<string> => {
    send({ type: "ADD_USER_MESSAGE", content: text });
    const currentState = stateRef.current;
    if (currentState.context.sessionId) {
      saveMessage.mutate({ sessionId: currentState.context.sessionId, role: "user", content: text });
    }
    const chatMessages = [
      ...currentState.context.messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    let fullResponse = "";
    await new Promise<void>((resolve) => {
      send({ type: "START_STREAMING" });
      streamChat({
        messages: chatMessages,
        timeSlot: currentState.context.timeSlot || "morning",
        themeName: currentState.context.themeName || "self-awareness",
        userName,
        mode: activeMode,
        aiContext: buildAiContext(urlContext),
        language: userLanguage,
        master: masterContext,
        onSpeakerChange: (id) => {
          const msgs = stateRef.current.context.messages;
          const last = msgs[msgs.length - 1];
          if (last?.role === "assistant" && (last.content?.length ?? 0) > 0) {
            const sid = stateRef.current.context.sessionId;
            if (sid && fullResponse) {
              saveMessage.mutate({ sessionId: sid, role: "assistant", content: fullResponse });
            }
            fullResponse = "";
            send({ type: "START_STREAMING" });
            const newIdx = stateRef.current.context.messages.length - 1;
            setSessionSpeakerMap((prev) => ({ ...prev, [newIdx]: id }));
          } else {
            const idx = msgs.length - 1;
            if (idx >= 0) setSessionSpeakerMap((prev) => ({ ...prev, [idx]: id }));
          }
          currentSessionSpeakerRef.current = id;
        },
        onDelta: (raw) => {
          const t = cinematic.feed(raw);
          if (!t) return;
          fullResponse += t;
          send({ type: "STREAM_DELTA", content: t });
        },
        onDone: () => {
          send({ type: "STREAM_DONE" });
          const sid = stateRef.current.context.sessionId;
          if (sid && fullResponse) {
            saveMessage.mutate({ sessionId: sid, role: "assistant", content: fullResponse });
          }
          resolve();
        },
        onError: (error) => {
          if (error === "insufficient_credits") { handleInsufficientCredits(); }
          send({ type: "ERROR", message: error });
          resolve();
        },
      });
    });

    return fullResponse;
  }, [userName, streamChat, send, saveMessage, activeMode, urlContext, handleInsufficientCredits]);

  const handleEndSession = async () => {
    send({ type: "END_SESSION" });

    // Always run post-session side effects + show Namaste screen,
    // regardless of whether a DB session row exists (quick chats, journey
    // sessions without created session, etc. should still get closure).
    const runPostSessionEffects = () => {
      sessionCompleted.mutate();
      const practiceType = slot === "morning" ? "observation" : slot === "evening" ? "witnessing" : "self_inquiry";
      evaluatePractice.mutate({ practice: practiceType, qualityScore: 0.6 }, {
        onSuccess: (eval_result) => {
          setLevelEvaluation(eval_result);
          activateSpecialties.mutate();
        },
      });
      const gateSlot = slot === "morning" ? "morning" : slot === "evening" ? "evening" : slot === "night" ? "night" : "midday";
      completeGate.mutate({ gate: gateSlot });
      checkRotation();
      setShowCelebration(true);
    };

    if (state.context.sessionId) {
      endSession.mutate(state.context.sessionId, {
        onSuccess: () => {
          send({ type: "SESSION_ENDED" });
          runPostSessionEffects();
        },
        onError: () => {
          // Don't block the user from closure if the DB write fails.
          send({ type: "SESSION_ENDED" });
          runPostSessionEffects();
        },
      });
    } else {
      send({ type: "SESSION_ENDED" });
      runPostSessionEffects();
    }
  };

  // Compute the next slot in the day's rhythm so we can always
  // prime the user for their next session after one completes.
  const nextSlot = useMemo<TimeSlot | null>(() => {
    const order: TimeSlot[] = ["morning", "midday", "evening", "night"];
    const current = (slot as TimeSlot) || getSlotConfig("morning")!.slot;
    const idx = order.indexOf(current);
    if (idx === -1 || idx === order.length - 1) return null; // night is last
    return order[idx + 1];
  }, [slot]);

  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    setSessionSpeakerMap({});

    // Fire-and-forget: compose the next-session preview in the background and
    // write it directly into today's daily_themes row so the Home screen
    // refreshes with the new theme + wisdom + reasoning + explore the moment
    // the user lands back on it.
    if (nextSlot) {
      const lastAssistant = [...(state.context.messages || [])]
        .reverse()
        .find((m) => m.role === "assistant");
      const insight =
        lastSessionInsight || lastAssistant?.content?.slice(0, 240) || "";
      const slotForCall = nextSlot;
      const justCompleted = (slot as TimeSlot) ?? null;
      const guruForCall = urlGuruId || activeGuruProgram?.guru_id || null;

      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "next-session-preview",
            {
              body: {
                nextSlot: slotForCall,
                justCompletedSlot: justCompleted,
                currentGuruId: guruForCall,
                lastInsight: insight,
              },
            },
          );
          if (error || !data) return;

          // The backend now persists the refreshed theme payload itself,
          // so Home only needs a cache bust to render the new row.
          refreshTheme();
        } catch (e) {
          console.warn("next-session-preview background error", e);
        }
      })();
    }

    // Broad invalidation so Home tab reflects the just-completed session
    // (foundation progress, daily ritual, theme, suggestions, streak, karma).
    try {
      queryClient.invalidateQueries();
    } catch {}

    send({ type: "RESET" });

    // If we're inside a multi-step spiral with more steps queued,
    // hand control back to the orchestrator. It will show the
    // StepOrbTransition (orb + toast) and route to the next block.
    if (isSpiralActive && spiralStep < spiralTotal) {
      try {
        completeSpiralStep();
        return;
      } catch (e) {
        console.warn("[guide] completeSpiralStep failed", e);
      }
    }

    navigate("/app");
  }, [
    send,
    navigate,
    nextSlot,
    slot,
    urlGuruId,
    activeGuruProgram?.guru_id,
    lastSessionInsight,
    state.context.messages,
    refreshTheme,
    isSpiralActive,
    spiralStep,
    spiralTotal,
    completeSpiralStep,
  ]);

  const handleBeginNextSession = useCallback(
    (chosenGuruId: string) => {
      setSessionSpeakerMap({});
      send({ type: "RESET" });
      if (!nextSlot) {
        navigate("/app");
        return;
      }
      const params = new URLSearchParams();
      params.set("slot", nextSlot);
      if (chosenGuruId) params.set("guruId", chosenGuruId);
      navigate(`/app/guide?${params.toString()}`);
    },
    [send, navigate, nextSlot],
  );

  const handleSkipNextSession = useCallback(() => {
    setSessionSpeakerMap({});
    send({ type: "RESET" });
    navigate("/app");
  }, [send, navigate]);

  // Celebration screen (Namaste flash) â€” auto advances to NextSessionReady
  if (showCelebration) {
    // Get last assistant message as insight
    const lastAssistant = [...(state.context.messages || [])].reverse().find(m => m.role === "assistant");
    const insight = lastAssistant?.content?.split(".")[0]?.trim();

    return (
      <>
        <SessionComplete
          streak={streak + 1}
          insight={insight && insight.length < 120 ? insight : undefined}
          nextSlotLabel={nextSlot ? getSlotConfig(nextSlot).label : null}
          onDone={handleCelebrationDone}
        />
        
      </>
    );
  }

  // Rich "Next Session Ready" preview is now delivered via the notification
  // bar (background composition) rather than a blocking screen.

  // No session â€” show direct chat
  if (state.matches("idle") && !slot) {
    const bgImage = (activeMaster && MASTER_IMAGES[activeMaster.id]) || activeMaster?.image || krishnaImg;
    return (
      <>
        {/* Master portrait background â€” soft, immersive */}
        {bgImage && (
          <div
            aria-hidden
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.22,
              filter: "blur(2px)",
            }}
          />
        )}
        {bgImage && (
          <div
            aria-hidden
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)/0.55) 55%, hsl(var(--background)) 100%)",
            }}
          />
        )}
      <div className="fixed top-12 md:top-14 left-0 right-0 bottom-[6.5rem] z-30 flex flex-col overflow-hidden">

        <div className="relative flex flex-col flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pt-3 md:pt-4 pb-2 overflow-hidden lg:max-w-5xl">
        {/* Header â€” consistent with other pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="pb-2 flex items-center justify-between gap-2 shrink-0"
        >
          <div className="hidden md:block min-w-0">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2 tracking-tight">Guide</h1>
            <p className="text-muted-foreground font-body text-lg">Ask anything, anytime</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 ml-auto shrink-0">
            {quickMessages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuickStreaming(false);
                  // Always show Namaste closure screen, even for quick chats
                  handleEndSession();
                  setQuickMessages([]);
                }}
                className="rounded-full font-display text-[11px] md:text-xs glass-subtle border-border/30 hover:border-destructive/30 hover:text-destructive px-2.5 md:px-3"
              >
                <Square className="w-3 h-3 mr-1" />
                End
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/app/guide/voice")}
              className="rounded-full font-display text-[11px] md:text-xs glass-subtle border-border/30 hover:border-primary/40 px-2.5 md:px-3"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Voice guide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMasterPickerOpen(true)}
              className="rounded-full font-display text-[11px] md:text-xs glass-subtle border-border/30 hover:border-primary/40 px-2.5 md:px-3"
            >
              <Users className="w-3 h-3 mr-1" />
              Masters
            </Button>
            {/* Mode dropdown â€” all 25+ GuideModes */}
            <select
              value={activeMode}
              onChange={(e) => {
                const val = e.target.value;
                const params = new URLSearchParams(searchParams);
                if (val === "auto") params.delete("mode");
                else params.set("mode", val);
                navigate(`/app/guide?${params.toString()}`, { replace: true });
              }}
              className="rounded-full font-display text-[11px] md:text-xs glass-subtle border border-border/30 hover:border-primary/40 px-2.5 md:px-3 py-1.5 bg-background/60 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[42vw] md:max-w-none truncate"
            >
              <option value="auto">âœ¨ Auto ({GUIDE_MODES.length} modes)</option>
              {GUIDE_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
            <GuideHistory />
          </div>
        </motion.div>


        {/* Spacer where mode selector used to be */}

        {/* Messages area */}
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-5">
            {quickMessages.length === 0 && !quickStreaming && (
              <motion.div
                className="flex flex-col items-center justify-center py-10 md:py-16 text-center px-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-3xl md:text-4xl mb-3 opacity-80">ðŸª”</div>
                <p className="font-display text-lg md:text-xl text-foreground mb-2">
                  {activeMaster?.name ? `${activeMaster.name} is listening.` : "Your Elder is listening."}
                </p>
                <p className="text-sm md:text-base text-muted-foreground max-w-md leading-relaxed mb-4">
                  Ask anything â€” a question, a feeling, a pattern you keep noticing.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "What am I not seeing?",
                    "Help me understand a pattern",
                    "Guide me through today's theme",
                    "I'd like a practice suggestion",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuickInput(suggestion);
                      }}
                      className="text-[11px] md:text-xs px-3 py-2 rounded-full border border-border/40 bg-card/30 hover:bg-card/60 hover:border-primary/40 text-foreground/80 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-4">
                  Or just say <span className="italic">"begin"</span> to start a structured session.
                </p>
              </motion.div>
            )}
            <AnimatePresence initial={false}>
              {quickMessages.map((msg, i) => {
                const isLast = i === quickMessages.length - 1;
                const isStreamingThis = isLast && msg.role === "assistant" && quickStreaming;
                // Skip empty assistant bubbles â€” the WitnessLoader handles that state
                if (msg.role === "assistant" && !msg.content?.trim()) return null;

                return (
                  <React.Fragment key={`${msg.role}-${i}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      {msg.role === "assistant" && <SpeakerLabel speakerId={msg.speakerId} />}
                      <div
                        className={`max-w-[88%] md:max-w-[70%] rounded-2xl px-4 py-3 md:px-5 md:py-4 ${msg.role === "user"
                          ? "bg-gradient-sunrise text-primary-foreground rounded-br-lg shadow-lg shadow-primary/10"
                          : "glass-card rounded-bl-lg"
                          }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm font-body leading-relaxed text-foreground prose-p:my-1.5 prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {isStreamingThis && msg.content.trim().length > 0 && (
                              <motion.span
                                className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-text-bottom"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                              />
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-body leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                    {/* Live detection chips after user messages */}
                    {msg.role === "user" && detections
                      .filter((d) => d.messageIndex === i)
                      .map((d, di) => (
                        <LiveDetectionChips key={`det-${i}-${di}`} detection={d} />
                      ))
                    }
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
            {quickStreaming && (quickMessages.length === 0 || quickMessages[quickMessages.length - 1]?.role !== "assistant" || !quickMessages[quickMessages.length - 1]?.content?.trim()) && (
              <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <WitnessLoader />
              </motion.div>
            )}
            <div ref={quickMessagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input â€” always visible */}
        <div className="pt-2 pb-1 md:pt-4 md:pb-2 shrink-0">
          <div className="flex items-center justify-start mb-2">
            <ResistanceJap compact />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickSend();
            }}
            className="flex items-center gap-2 md:gap-3 w-full overflow-hidden"
          >
            <div className="flex-1 min-w-0">
              <input
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={activeMaster?.name ? `Write to ${activeMaster.name}â€¦` : "Write to your Elderâ€¦"}
                disabled={quickStreaming}
                className="w-full px-3 py-3 md:px-5 md:py-4 rounded-2xl glass-card font-body text-sm text-foreground
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
                           disabled:opacity-50 transition-all border border-border/40"
              />
            </div>
            <motion.button
              type="submit"
              disabled={!quickInput.trim() || quickStreaming}
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-sunrise text-primary-foreground flex items-center justify-center
                         disabled:opacity-30 shadow-lg shadow-primary/20 transition-all shrink-0"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
            >
              {quickStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </motion.button>
          </form>
        </div>

        <SilentSit
          open={silentSitOpen}
          onClose={() => setSilentSitOpen(false)}
          master={activeMaster ? { id: activeMaster.id, name: activeMaster.name, tradition: activeMaster.path || activeMaster.category } : null}
          masterImage={activeMaster ? (MASTER_IMAGES[activeMaster.id] || activeMaster.image) : undefined}
          themeTitle={themeData?.theme?.title}
          themeDescription={themeData?.theme?.description}
          language={userLanguage}
          durationSec={60}
        />

        {/* VoiceOrb commented out */}
        {/* <VoiceOrb
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onSendMessage={handleQuickVoiceSend}
          sessionActive={false}
        /> */}
        </div>
        <MasterPicker
          open={masterPickerOpen}
          onOpenChange={setMasterPickerOpen}
        />
      </div>
      </>
    );
  }

  // Completed (fallback â€” should show celebration instead)
  if (state.matches("completed") && !showCelebration) {
    return (
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 lg:max-w-5xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <span className="text-6xl mb-6 block">ðŸ™</span>
          <h2 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">Session Complete</h2>
          <p className="text-muted-foreground font-body">Returning to home...</p>
        </motion.div>
      </div>
    );
  }

  const slotConfig = slot ? getSlotConfig(slot) : null;

  const mainBgImage = (activeMaster && MASTER_IMAGES[activeMaster.id]) || activeMaster?.image || krishnaImg;
  return (
    <>
      <AnimatePresence>
        {showBlessing && masterContext && (
          <MasterBlessing
            masterName={masterContext.name}
            masterTradition={masterContext.tradition}
            masterImage={activeMaster?.image}
            themeTitle={themeData?.theme?.title}
            quote={masterContext.quote}
            onDone={() => setShowBlessing(false)}
          />
        )}
      </AnimatePresence>
      {/* Master portrait background intentionally hidden in Guide chat */}
      <div className="relative flex flex-col h-[calc(100dvh-7.5rem)] md:h-[calc(100vh-6rem)] max-w-3xl mx-auto overflow-hidden lg:max-w-5xl">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between pb-2 md:pb-4 gap-2 shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2.5 md:gap-4 min-w-0 flex-1">
            {activeMaster ? (
              <div
                className="w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl shrink-0 bg-cover bg-center border-2 border-primary/40 shadow-lg shadow-primary/20"
                style={{ backgroundImage: `url(${MASTER_IMAGES[activeMaster.id] || activeMaster.image})` }}
                aria-label={activeMaster.name}
              />
            ) : slotConfig ? (
              <div className="w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl glass-card flex items-center justify-center shrink-0">
                <span className="text-base md:text-2xl">{slotConfig.emoji}</span>
              </div>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-lg md:text-4xl font-display font-bold text-foreground tracking-tight truncate">
                {activeMaster?.name || `${slotConfig?.label || "Guide"} Session`}
              </h1>
              <p className="text-[11px] md:text-sm text-muted-foreground font-body mt-0.5 md:mt-1 truncate">
                {activeMaster ? (themeData?.theme?.title ? `${slotConfig?.label || "Guide"} Â· ${themeData.theme.title}` : `${slotConfig?.label || "Guide"} Session`) : (themeData?.theme?.title || "Loading...")}
              </p>
              {activeMaster && (
                <p className="text-[10px] md:text-[11px] text-primary/70 mt-0.5 italic hidden md:block">
                  {activeMaster.keyTeaching || "There is no such thing as a bad question. Stay with whatever is true for you right now."}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMasterPickerOpen(true)}
              className="rounded-full font-display text-[11px] md:text-xs glass-subtle border-border/30 hover:border-primary/40 px-2.5 md:px-3"
            >
              <Users className="w-3 h-3 mr-1" />
              Masters
            </Button>
            <GuideHistory />
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndSession}
              disabled={state.matches("ending") || state.matches("starting")}
              className="rounded-full font-display text-[11px] md:text-xs glass-subtle border-border/30 hover:border-destructive/30 hover:text-destructive px-2.5 md:px-3"
            >
              {state.matches("ending") ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Square className="w-3 h-3 mr-1" />
              )}
              End
            </Button>
          </div>
        </motion.div>

        {/* Messages */}
        <ScrollArea className="flex-1 py-2 md:py-4">
          <div className="space-y-3 md:space-y-5">
            <AnimatePresence initial={false}>
              {state.context.messages.map((msg, i) => {
                const isLast = i === state.context.messages.length - 1;
                const isStreamingThis = isLast && msg.role === "assistant" && state.context.isStreaming;
                // Skip empty assistant bubbles â€” the WitnessLoader handles that state
                if (msg.role === "assistant" && !msg.content?.trim()) return null;

                return (
                  <React.Fragment key={i}>
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      {msg.role === "assistant" && <SpeakerLabel speakerId={sessionSpeakerMap[i]} />}
                      <div
                        className={`max-w-[88%] md:max-w-[70%] rounded-2xl px-4 py-3 md:px-5 md:py-4 ${msg.role === "user"
                          ? "bg-gradient-sunrise text-primary-foreground rounded-br-lg shadow-lg shadow-primary/10"
                          : "glass-card rounded-bl-lg"
                          }`}
                      >
                        {msg.role === "assistant" ? (
                          <>
                            <GuideMessageBlocks
                              content={msg.content}
                              messageId={i}
                              isStreaming={isStreamingThis}
                              completedRaws={widgetCompleted[i]}
                              onWidgetEvent={handleWidgetEvent}
                            />
                            {isStreamingThis && msg.content.trim().length > 0 && (
                              <motion.span
                                className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-text-bottom"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                              />
                            )}
                            {!isStreamingThis && msg.content.trim().length > 0 && (
                              <TryThisChip
                                assistantMessage={msg.content}
                                mode={activeMode}
                                sessionId={sessionId}
                              />
                            )}
                          </>
                        ) : (
                          <p className="text-sm font-body leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                    {/* Live detection chips after user messages */}
                    {msg.role === "user" && detections
                      .filter((d) => d.messageIndex === i)
                      .map((d, di) => (
                        <LiveDetectionChips key={`det-${i}-${di}`} detection={d} />
                      ))
                    }
                  </React.Fragment>
                );
              })}
            </AnimatePresence>

            {state.context.isStreaming && (state.context.messages.length === 0 || state.context.messages[state.context.messages.length - 1]?.role !== "assistant" || !state.context.messages[state.context.messages.length - 1]?.content?.trim()) && (
              <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <WitnessLoader />
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        {state.matches("active") && (
          <motion.div
            className="pt-2 md:pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-start mb-2">
              <ResistanceJap />
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2 md:gap-3 w-full overflow-hidden"
            >
              <div className="flex-1 min-w-0">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={activeMaster?.name ? `Write to ${activeMaster.name}â€¦` : "Share your thoughts..."}
                  disabled={state.context.isStreaming}
                  className="w-full px-3 py-3 md:px-5 md:py-4 rounded-2xl glass-card font-body text-sm text-foreground
                             placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
                             disabled:opacity-50 transition-all border border-border/40"
                />
              </div>
              <motion.button
                type="submit"
                disabled={!input.trim() || state.context.isStreaming}
                className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-sunrise text-primary-foreground flex items-center justify-center
                           disabled:opacity-30 shadow-lg shadow-primary/20 transition-all shrink-0"
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
              >
                {state.context.isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>

      {/* <VoiceOrb
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSendMessage={handleVoiceSend}
        sessionActive={state.matches("active")}
      /> */}
      <MasterPicker
        open={masterPickerOpen}
        onOpenChange={setMasterPickerOpen}
      />
      <LoopRevealOverlay
        loop={revealedLoop}
        onClose={() => setRevealedLoop(null)}
        onLearnMore={(l) => {
          setRevealedLoop(null);
          navigate(`/loops/${l.id}`);
        }}
      />
    </>
  );
}
