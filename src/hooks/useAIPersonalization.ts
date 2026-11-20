/**
 * useAIPersonalization — Hook for AI-driven session personalization
 * ────────────────────────────────────────────────────────────────────
 * Allows users to personalize their session through natural language chat.
 */

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";
import type { ExtendedSessionConfiguration } from "@/types/session-config";
import { mergeExtendedConfig } from "@/types/session-config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  configPatch?: Record<string, unknown>;
  suggestedActions?: string[];
  needsClarification?: boolean;
  clarificationQuestion?: string;
}

interface UseAIPersonalizationReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string, currentConfig: ExtendedSessionConfiguration, context?: string) => Promise<void>;
  applyConfigPatch: (patch: Record<string, unknown>, currentConfig: ExtendedSessionConfiguration) => ExtendedSessionConfiguration;
  clearMessages: () => void;
}

export function useAIPersonalization(): UseAIPersonalizationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    message: string,
    currentConfig: ExtendedSessionConfiguration,
    context: string = "config_tuning"
  ) => {
    setIsLoading(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-session-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message,
            currentConfig,
            context,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const result = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.confirmationMessage || "I've processed your request.",
        timestamp: new Date().toISOString(),
        configPatch: result.configPatch,
        suggestedActions: result.suggestedActions,
        needsClarification: result.needsClarification,
        clarificationQuestion: result.clarificationQuestion,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (result.needsClarification && result.clarificationQuestion) {
        toast({
          title: "Clarification needed",
          description: result.clarificationQuestion,
        });
      }

    } catch (e) {
      consciousFromError(e, "actionMissed");
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyConfigPatch = useCallback(
    (patch: Record<string, unknown>, currentConfig: ExtendedSessionConfiguration): ExtendedSessionConfiguration => {
      return mergeExtendedConfig(currentConfig, patch as any);
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, applyConfigPatch, clearMessages };
}