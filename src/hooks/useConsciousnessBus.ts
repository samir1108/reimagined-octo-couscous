// Consciousness Bus — single realtime channel that streams engine_signals
// inserts to the entire app. Engines publish (via DB inserts) → UI + other
// hooks subscribe. Makes the 116 edge functions feel like one brain.
//
// Usage:
//   const { lastSignal, signals } = useConsciousnessBus();
//   useConsciousnessBusEvent('loop_detected', (sig) => { ... });

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";

export interface EngineSignal {
  id: string;
  user_id: string;
  signal_type: string;
  practice_id?: string | null;
  level_hint?: number | null;
  master_id?: string | null;
  loop_id?: string | null;
  domain?: string | null;
  urgency: number;
  source: string;
  context?: Record<string, unknown>;
  created_at: string;
}

type Listener = (sig: EngineSignal) => void;

// Module-level event bus so multiple components share one subscription.
const listeners = new Map<string, Set<Listener>>();
let recent: EngineSignal[] = [];
let installedUserId: string | null = null;
let channelRef: any = null;

function emit(sig: EngineSignal) {
  recent = [sig, ...recent].slice(0, 50);
  listeners.get(sig.signal_type)?.forEach((l) => {
    try { l(sig); } catch { /* swallow */ }
  });
  listeners.get("*")?.forEach((l) => {
    try { l(sig); } catch { /* swallow */ }
  });
}

function ensureSubscribed(userId: string) {
  if (installedUserId === userId && channelRef) return;
  if (channelRef) {
    try { supabase.removeChannel(channelRef); } catch { /* noop */ }
    channelRef = null;
  }
  installedUserId = userId;
  channelRef = supabase
    .channel(`consciousness-bus:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "engine_signals",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const sig = payload.new as EngineSignal;
        if (sig) emit(sig);
      },
    )
    .subscribe();
}

export function useConsciousnessBus() {
  const { user } = useAuthReady();
  const [lastSignal, setLastSignal] = useState<EngineSignal | null>(null);
  const [signals, setSignals] = useState<EngineSignal[]>(recent);

  useEffect(() => {
    if (!user?.id) return;
    ensureSubscribed(user.id);
    const fn = (sig: EngineSignal) => {
      setLastSignal(sig);
      setSignals((s) => [sig, ...s].slice(0, 50));
    };
    if (!listeners.has("*")) listeners.set("*", new Set());
    listeners.get("*")!.add(fn);
    return () => {
      listeners.get("*")?.delete(fn);
    };
  }, [user?.id]);

  return { lastSignal, signals };
}

/** Subscribe to a specific signal_type (or "*" for all). */
export function useConsciousnessBusEvent(
  signalType: string,
  handler: Listener,
) {
  const { user } = useAuthReady();
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    if (!user?.id) return;
    ensureSubscribed(user.id);
    const wrapped: Listener = (sig) => ref.current(sig);
    if (!listeners.has(signalType)) listeners.set(signalType, new Set());
    listeners.get(signalType)!.add(wrapped);
    return () => {
      listeners.get(signalType)?.delete(wrapped);
    };
  }, [user?.id, signalType]);
}

/** Imperative access (for non-hook code). */
export function getRecentSignals(): EngineSignal[] {
  return recent.slice();
}
