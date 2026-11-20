import { useState, useCallback, useRef } from "react";
import type { Msg, MirrorPhase, RevealData } from "./types";

const DISCOVERY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/discovery-session`;
const AUTH_HEADER = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

export function useMirrorSession() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<MirrorPhase>("intro");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesRef = useRef<Msg[]>([]);

  // Keep ref in sync
  const updateMessages = useCallback((updater: (prev: Msg[]) => Msg[]) => {
    setMessages((prev) => {
      const next = updater(prev);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const streamQuestion = useCallback(async (allMessages: Msg[]) => {
    setIsStreaming(true);
    setError(null);

    try {
      const resp = await fetch(DISCOVERY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH_HEADER },
        body: JSON.stringify({ messages: allMessages, mode: "chat" }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        setError(err.error || `Error ${resp.status}`);
        setIsStreaming(false);
        return;
      }

      if (!resp.body) { setError("No response"); setIsStreaming(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const content = assistantSoFar;
        updateMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { setIsStreaming(false); return; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush
      if (buffer.trim()) {
        for (const raw of buffer.split("\n")) {
          if (!raw?.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* ignore */ }
        }
      }
      setIsStreaming(false);
    } catch (e: any) {
      setError(e.message || "Connection failed");
      setIsStreaming(false);
    }
  }, [updateMessages]);

  const fetchReveal = useCallback(async (allMessages: Msg[]) => {
    setPhase("loading-reveal");
    setError(null);

    try {
      const resp = await fetch(DISCOVERY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH_HEADER },
        body: JSON.stringify({ messages: allMessages, mode: "reveal" }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        setError(err.error || `Error ${resp.status}`);
        setPhase("questioning");
        return;
      }

      const data = await resp.json();
      if (data.reveal) {
        setRevealData(data.reveal);
        setPhase("reveal");
      } else {
        setError("Failed to generate reading");
        setPhase("questioning");
      }
    } catch (e: any) {
      setError(e.message || "Connection failed");
      setPhase("questioning");
    }
  }, []);

  const startSession = useCallback(() => {
    setPhase("questioning");
    const initial: Msg[] = [{ role: "user", content: "Begin my mirror reading." }];
    updateMessages(() => initial);
    messagesRef.current = initial;
    streamQuestion(initial);
  }, [streamQuestion, updateMessages]);

  const sendAnswer = useCallback((text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messagesRef.current, userMsg];
    updateMessages(() => newMessages);
    messagesRef.current = newMessages;
    const newCount = questionCount + 1;
    setQuestionCount(newCount);

    // Keep asking — user decides when to see the analysis
    streamQuestion(newMessages);
  }, [isStreaming, questionCount, streamQuestion, fetchReveal, updateMessages]);

  const requestRevealNow = useCallback(() => {
    fetchReveal(messagesRef.current);
  }, [fetchReveal]);

  const showPractices = useCallback(() => {
    setPhase("practices");
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setPhase("intro");
    setIsStreaming(false);
    setError(null);
    setRevealData(null);
    setQuestionCount(0);
    messagesRef.current = [];
  }, []);

  // Get latest assistant message (current question)
  const currentQuestion = messages.filter((m) => m.role === "assistant").pop()?.content || "";

  return {
    phase,
    messages,
    currentQuestion,
    questionCount,
    isStreaming,
    error,
    revealData,
    startSession,
    sendAnswer,
    requestRevealNow,
    showPractices,
    reset,
  };
}
