import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { detectLocally } from "@/lib/localLoopDetector";

export interface DetectedLoop {
  id: string;
  name: string;
  confidence: number;
  evidence: string;
  why: string;
}

export interface DetectedSource {
  type: "mind" | "heart" | "gut" | "body" | "identity" | "fear" | "witness";
  strength: number;
  evidence: string;
  insight: string;
}

export interface DetectionResult {
  loops: DetectedLoop[];
  sources: DetectedSource[];
  overall_insight?: string;
  messageIndex: number;
}

const SOURCE_EMOJI: Record<string, string> = {
  mind: "🧠",
  heart: "❤️",
  gut: "🔥",
  body: "🫁",
  identity: "🪞",
  fear: "😰",
  witness: "👁️",
};

const SOURCE_LABELS: Record<string, string> = {
  mind: "Mind",
  heart: "Heart",
  gut: "Gut",
  body: "Body",
  identity: "Identity",
  fear: "Fear",
  witness: "Witness",
};

export { SOURCE_EMOJI, SOURCE_LABELS };

export function useLiveDetection() {
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const userMessageCountRef = useRef(0);
  const lastDetectedAtRef = useRef(0);
  const aiFallbackCountRef = useRef(0);

  const enabled = typeof window !== "undefined"
    ? localStorage.getItem("live-detection-enabled") !== "false"
    : true;

  // AI fallback — only called when local detection is ambiguous
  const runAIDetection = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    messageIndex: number
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/live-detect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ messages }),
        }
      );

      if (!resp.ok) return;

      const result = await resp.json();
      if (result.loops?.length > 0 || result.sources?.length > 0) {
        setDetections((prev) => [...prev, { ...result, messageIndex }]);
      }
    } catch (e) {
      console.error("AI fallback detection error:", e);
    }
  }, []);

  // Main detection: local first, AI fallback if ambiguous
  const runDetection = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    messageIndex: number
  ) => {
    if (!enabled) return;

    setIsDetecting(true);

    try {
      // Step 1: Run local keyword matching (FREE, instant)
      const localResult = await detectLocally(messages);

      if (localResult.loops.length > 0 || localResult.sources.length > 0) {
        // Local detection found patterns — use them directly (₹0 cost!)
        setDetections((prev) => [...prev, {
          loops: localResult.loops,
          sources: localResult.sources,
          overall_insight: localResult.overall_insight,
          messageIndex,
        }]);
      }

      // Step 2: If ambiguous AND we haven't used AI too many times, fall back to AI
      if (localResult.isAmbiguous && aiFallbackCountRef.current < 3) {
        aiFallbackCountRef.current += 1;
        console.log("[LiveDetect] Local ambiguous, falling back to AI (call #" + aiFallbackCountRef.current + ")");
        runAIDetection(messages, messageIndex);
      }
    } catch (e) {
      console.error("Local detection error:", e);
    } finally {
      setIsDetecting(false);
    }
  }, [enabled, runAIDetection]);

  const trackMessage = useCallback((
    role: string,
    messages: Array<{ role: string; content: string }>,
    totalMessageCount: number
  ) => {
    if (!enabled) return;
    if (role !== "user") return;

    userMessageCountRef.current += 1;

    // Trigger every 3 user messages
    if (userMessageCountRef.current >= 3 && userMessageCountRef.current - lastDetectedAtRef.current >= 3) {
      lastDetectedAtRef.current = userMessageCountRef.current;
      void runDetection(messages, totalMessageCount - 1);
    }
  }, [enabled, runDetection]);

  const resetDetections = useCallback(() => {
    setDetections([]);
    userMessageCountRef.current = 0;
    lastDetectedAtRef.current = 0;
    aiFallbackCountRef.current = 0;
  }, []);

  return {
    detections,
    isDetecting,
    trackMessage,
    resetDetections,
    enabled,
  };
}
