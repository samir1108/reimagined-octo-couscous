export * from "./types";
export * from "./store";

import type { DepthMode, MemorySource } from "./types";
import { suggestDepthMode, softenDepth } from "./types";

export { suggestDepthMode, softenDepth };

// Convenience: build a plain-language "why this session" string from a thread.
export function threadRationale(thread: { question: string; sessionsCount: number; depthMode: DepthMode }): string {
  return `We're exploring: "${thread.question}". This is session ${thread.sessionsCount + 1} on this thread, in "${thread.depthMode}" mode.`;
}

// Re-export source labels.
export const SOURCE_LABELS: Record<MemorySource, string> = {
  user_shared: "You shared this",
  confirmed_memory: "Confirmed from a previous session",
  tentative_inference: "Tentative — open to correction",
};
