/**
 * useCinematicDirective
 * ─────────────────────
 * Watches an assistant text stream for directives like:
 *   [CINEMATIC:scriptId]            — explicit script
 *   [CINEMATIC:practice=kriya]      — by practice (engine picks script + level)
 *
 * When detected, fires the global cinematic session via the context, and
 * strips the tag from the visible chat stream.
 *
 * Pattern mirrors the [GUEST:id]…[/GUEST] flow already in useGuideChat.
 */
import { useCallback, useRef } from "react";
import { useCinematicSession } from "@/contexts/CinematicSessionContext";
import type { Practice } from "@/lib/sutra/practices";

const TAG_RE = /\[CINEMATIC:([^\]]+)\]/i;

export interface CinematicDirectiveOpts {
  userId: string | null;
  guruImage?: string;
  guruName?: string;
  onComplete?: () => void;
  onExit?: () => void;
}

export function useCinematicDirective(opts: CinematicDirectiveOpts) {
  const { play } = useCinematicSession();
  const bufferRef = useRef("");
  const triggeredRef = useRef(false);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const reset = useCallback(() => {
    bufferRef.current = "";
    triggeredRef.current = false;
  }, []);

  /**
   * Feed an incoming assistant chunk. Returns the chunk with any directive
   * stripped, so the chat UI can render the cleaned text directly.
   */
  const feed = useCallback((chunk: string): string => {
    if (triggeredRef.current) return chunk;
    bufferRef.current += chunk;
    const match = bufferRef.current.match(TAG_RE);
    if (!match) {
      // keep last 30 chars to catch a tag forming across chunks
      if (bufferRef.current.length > 60) {
        bufferRef.current = bufferRef.current.slice(-30);
      }
      return chunk;
    }
    triggeredRef.current = true;
    const cleaned = chunk.replace(TAG_RE, "");
    const directive = match[1].trim();

    let scriptId: string | undefined;
    let practice: Practice | undefined;
    if (directive.includes("=")) {
      const [k, v] = directive.split("=").map((s) => s.trim());
      if (k === "practice") practice = v as Practice;
      else if (k === "script") scriptId = v;
    } else {
      scriptId = directive;
    }

    const cur = optsRef.current;
    play({
      scriptId,
      practice,
      userId: cur.userId,
      guruImage: cur.guruImage,
      guruName: cur.guruName,
      onComplete: cur.onComplete,
      onExit: cur.onExit,
    }).catch(() => {
      /* ignore */
    });

    return cleaned;
  }, [play]);

  return { feed, reset };
}
