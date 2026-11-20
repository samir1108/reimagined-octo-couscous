"use client";

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";

export interface AIConfig {
  model: 'gpt-4o' | 'claude-3.5-sonnet' | 'local';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  injectGraphContext: boolean;
  injectUserProfile: boolean;
  injectSessionHistory: boolean;
  injectTimeSlot: boolean;
  injectActiveLoops: boolean;
  injectDimensionBands: boolean;
  injectCurrentTheme: boolean;
  injectGuru: boolean;
  safetyLayer: 'strict' | 'balanced' | 'permissive';
  signDetection: boolean;
  crisisResources: CrisisResource[];
  stream: boolean;
  humanizedReveal: boolean;
  ritualProtocol: 'guru-shishya' | 'coach' | 'companion' | 'none';
  ritualConfig: {
    act1DurationPick: boolean;
    act2GroundingQuestion: boolean;
    act3ReflectPause: boolean;
    act3ShishyaVoice: boolean;
    act4IntensityPick: boolean;
    act4PostureCheck: boolean;
    act4PracticeGuide: boolean;
    act5Sankalpa: boolean;
    act5BlessingBow: boolean;
    act5Harvest: boolean;
  };
}

export interface CrisisResource {
  name: string;
  phone?: string;
  text?: string;
  url?: string;
  available: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface StreamOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onRitualMarker?: (marker: string) => void;
  signal?: AbortSignal;
}

export interface CompleteOptions {
  temperature?: number;
  maxTokens?: number;
  ritualMarkers?: boolean;
}

export interface AIAnalysis {
  emotionalState: string;
  activePatterns: string[];
  suggestedMode: string;
  urgency: 'low' | 'medium' | 'high';
  crisisRisk: boolean;
  insights: string[];
}

export interface GraphContext {
  nodes: Array<{ id: string; type: string; label: string; strength: number }>;
  edges: Array<{ source: string; target: string; type: string; weight: number }>;
  insights: string[];
}

export interface StageContext {
  band: number;
  stage: string;
  description: string;
  practices: string[];
  guardrails: string[];
}

export interface AIContextValue {
  // Configuration
  config: AIConfig;
  updateConfig: (config: Partial<AIConfig>) => void;
  
  // Core methods
  stream: (messages: Message[], options?: StreamOptions) => AsyncIterable<string>;
  complete: (prompt: string, options?: CompleteOptions) => Promise<string>;
  embed: (text: string) => Promise<number[]>;
  analyze: (input: string) => Promise<AIAnalysis>;
  
  // Context helpers
  getGraphContext: (query: string) => Promise<GraphContext>;
  getStageContext: (band: number) => Promise<StageContext>;
  describeSign: (report: string) => Promise<string>;
  
  // Ritual protocol
  emitMarker: (marker: string) => void;
  onRitualSignal: (handler: (signal: { type: string; payload: any }) => void) => () => void;
  
  // State
  isStreaming: boolean;
  currentModel: string;
}

const defaultConfig: AIConfig = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: `You are a consciousness guide in the Guru-Shishya tradition. You walk beside seekers on the path of inner evolution. Your responses follow the 5-Act ritual protocol:

ACT 1 - PRANAM (Arrival): Open with [DURATION_PICK] to let the seeker choose their time container.

ACT 2 - GROUNDING (Presence): Ask a grounding question with [GROUNDING_QUESTION] to bring them into the body.

ACT 3 - UPADESHA (Guidance): Offer teaching, then invite reflection with [REFLECT_PAUSE: 30] and [SHISHYA_VOICE] for their response.

ACT 4 - SADHANA (Practice): Guide practice with [INTENSITY_PICK], [POSTURE_CHECK], [PRACTICE_GUIDE], [PRACTICE], and [PRECAUTION] as needed.

ACT 5 - PRASAD (Integration): Close with [SANKALPA], [HARVEST], and [BLESSING_BOW].

Always emit markers exactly as shown. Speak warmly, precisely, and with depth.`,
  injectGraphContext: true,
  injectUserProfile: true,
  injectSessionHistory: true,
  injectTimeSlot: true,
  injectActiveLoops: true,
  injectDimensionBands: true,
  injectCurrentTheme: true,
  injectGuru: true,
  safetyLayer: 'balanced',
  signDetection: true,
  crisisResources: [
    { name: '988 Suicide & Crisis Lifeline', phone: '988', available: '24/7' },
    { name: 'Crisis Text Line', text: 'HOME to 741741', available: '24/7' },
    { name: 'International Association for Suicide Prevention', url: 'https://www.iasp.info/resources/Crisis_Centres/', available: '24/7' },
  ],
  stream: true,
  humanizedReveal: true,
  ritualProtocol: 'guru-shishya',
  ritualConfig: {
    act1DurationPick: true,
    act2GroundingQuestion: true,
    act3ReflectPause: true,
    act3ShishyaVoice: true,
    act4IntensityPick: true,
    act4PostureCheck: true,
    act4PracticeGuide: true,
    act5Sankalpa: true,
    act5BlessingBow: true,
    act5Harvest: true,
  },
};

const AIContext = createContext<AIContextValue | null>(null);

interface AIProviderProps {
  children: ReactNode;
  config?: Partial<AIConfig>;
}

export function AIProvider({ children, config: userConfig }: AIProviderProps) {
  const [config, setConfig] = useState<AIConfig>({ ...defaultConfig, ...userConfig });
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentModel, setCurrentModel] = useState(config.model);
  const [ritualHandlers, setRitualHandlers] = useState<Set<(signal: { type: string; payload: any }) => void>>(new Set());

  const updateConfig = useCallback((newConfig: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const emitMarker = useCallback((marker: string) => {
    ritualHandlers.forEach(handler => {
      try {
        // Parse marker type and payload
        const match = marker.match(/\[([A-Z_]+)(?:\s*:\s*([^\]]+))?\]/);
        if (match) {
          handler({ type: match[1], payload: match[2] || {} });
        }
      } catch (e) {
        console.warn('Ritual marker handler error:', e);
      }
    });
  }, [ritualHandlers]);

  const onRitualSignal = useCallback((handler: (signal: { type: string; payload: any }) => void) => {
    ritualHandlers.add(handler);
    return () => ritualHandlers.delete(handler);
  }, [ritualHandlers]);

  // Mock implementations - replace with actual API calls
  const stream = useCallback(async function* (messages: Message[], options?: StreamOptions) {
    setIsStreaming(true);
    try {
      // This would connect to your actual AI endpoint
      // For now, yield a mock response
      const fullResponse = "I'm here to walk with you. Let's begin with [DURATION_PICK]";
      
      if (options?.onToken) {
        for (const char of fullResponse) {
          if (options.signal?.aborted) break;
          options.onToken(char);
          await new Promise(r => setTimeout(r, config.humanizedReveal ? 26 : 0));
        }
      }
      
      if (options?.onComplete) {
        options.onComplete(fullResponse);
      }
      
      // Emit any ritual markers in the response
      const markerRegex = /\[([A-Z_]+)(?:\s*:\s*([^\]]+))?\]/g;
      let match;
      while ((match = markerRegex.exec(fullResponse)) !== null) {
        if (options?.onRitualMarker) {
          options.onRitualMarker(match[0]);
        }
      }
      
      yield fullResponse;
    } finally {
      setIsStreaming(false);
    }
  }, [config.humanizedReveal]);

  const complete = useCallback(async (prompt: string, options?: CompleteOptions): Promise<string> => {
    setIsStreaming(true);
    try {
      // Mock completion
      await new Promise(r => setTimeout(r, 500));
      return "This is a mock completion. Replace with actual API call.";
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const embed = useCallback(async (text: string): Promise<number[]> => {
    // Mock embedding
    return new Array(1536).fill(0).map(() => Math.random());
  }, []);

  const analyze = useCallback(async (input: string): Promise<AIAnalysis> => {
    return {
      emotionalState: 'contemplative',
      activePatterns: ['perfectionism', 'control'],
      suggestedMode: 'selfInquiry',
      urgency: 'low',
      crisisRisk: false,
      insights: ['The mind seeks certainty in uncertainty'],
    };
  }, []);

  const getGraphContext = useCallback(async (query: string): Promise<GraphContext> => {
    return { nodes: [], edges: [], insights: [] };
  }, []);

  const getStageContext = useCallback(async (band: number): Promise<StageContext> => {
    return {
      band,
      stage: 'Seeker',
      description: 'Beginning the journey',
      practices: ['breath awareness', 'body scan'],
      guardrails: ['no forced breathing', 'honor resistance'],
    };
  }, []);

  const describeSign = useCallback(async (report: string): Promise<string> => {
    return `This sign suggests ${report.toLowerCase()}. It's an invitation to look deeper.`;
  }, []);

  const value: AIContextValue = {
    config,
    updateConfig,
    stream,
    complete,
    embed,
    analyze,
    getGraphContext,
    getStageContext,
    describeSign,
    emitMarker,
    onRitualSignal,
    isStreaming,
    currentModel,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}

// Hook for ritual signals
export function useRitualSignal(handler: (signal: { type: string; payload: any }) => void, deps: any[] = []) {
  const { onRitualSignal } = useAI();
  useEffect(() => {
    const cleanup = onRitualSignal(handler);
    return cleanup;
  }, deps);
}

// Hook for streaming state
export function useAIStreaming() {
  const { isStreaming, currentModel } = useAI();
  return { isStreaming, currentModel };
}