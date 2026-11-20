import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAwardKarmaEvent } from '@/hooks/useKarma';

interface MasterPersona {
  id: string;
  name: string;
  tradition?: string;
  keyTeaching?: string;
  quote?: string;
}

interface StreamChatParams {
  messages: Array<{ role: string; content: string }>;
  timeSlot: string;
  themeName: string;
  userName: string;
  mode?: string;
  aiContext?: string;
  language?: string;
  master?: any;
  soulContext?: string;
  onDelta: (text: string) => void;
  onSpeakerChange?: (id: string | null) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export function useGuideChat() {
  const awardKarmaEvent = useAwardKarmaEvent();

  const streamChat = useCallback(async ({
    messages,
    timeSlot,
    themeName,
    userName,
    mode,
    aiContext,
    language,
    master,
    soulContext,
    onDelta,
    onSpeakerChange,
    onDone,
    onError,
  }: StreamChatParams) => {
    // ─── Typewriter queue: smooth bursty SSE chunks into a steady character stream
    // so users see a ChatGPT-like progressive reveal even when the gateway flushes
    // large chunks at once.
    let pending = "";
    let streamEnded = false;
    let flushTimer: number | null = null;
    const CHARS_PER_TICK = 2;   // characters released per interval
    const TICK_MS = 18;         // ~110 chars/sec — feels natural

    // ─── GUEST MASTER tag parsing ────────────────────────────────────────
    // The Elder may emit [GUEST:masterId]\n...words...\n[/GUEST] mid-stream.
    // We hold back any partial bracket so we can rewrite it before emitting.
    // Visible text (after stripping tags) is fed into the typewriter queue.
    let tagBuffer = "";          // holds partial tag fragments
    const TAG_OPEN = /\[GUEST:([a-z0-9_-]+)\]\n?/i;
    const TAG_CLOSE = /\[\/GUEST\]\n?/i;

    const processTagged = (incoming: string) => {
      tagBuffer += incoming;
      // Drain as much safe text as we can in a loop.
      while (tagBuffer.length > 0) {
        const openMatch = tagBuffer.match(TAG_OPEN);
        const closeMatch = tagBuffer.match(TAG_CLOSE);

        // Pick the first marker that occurs (if any).
        let firstIdx = -1;
        let isOpen = false;
        if (openMatch && openMatch.index !== undefined) {
          firstIdx = openMatch.index;
          isOpen = true;
        }
        if (closeMatch && closeMatch.index !== undefined && (firstIdx === -1 || closeMatch.index < firstIdx)) {
          firstIdx = closeMatch.index;
          isOpen = false;
        }

        if (firstIdx === -1) {
          // No tag in buffer — but a tag may be FORMING at the tail.
          // Keep last 14 chars (longest possible partial like "[GUEST:abcdef") in the buffer.
          const safeLen = Math.max(0, tagBuffer.length - 14);
          if (safeLen > 0) {
            const safe = tagBuffer.slice(0, safeLen);
            tagBuffer = tagBuffer.slice(safeLen);
            if (safe) enqueue(safe);
          }
          return;
        }

        // Emit any text before the tag.
        if (firstIdx > 0) {
          const safe = tagBuffer.slice(0, firstIdx);
          tagBuffer = tagBuffer.slice(firstIdx);
          if (safe) enqueue(safe);
        }

        // Now buffer starts with a tag.
        if (isOpen && openMatch) {
          const masterId = openMatch[1].toLowerCase();
          tagBuffer = tagBuffer.slice(openMatch[0].length);
          onSpeakerChange?.(masterId);
        } else if (closeMatch) {
          tagBuffer = tagBuffer.slice(closeMatch[0].length);
          onSpeakerChange?.(null);
        }
      }
    };

    const startFlusher = () => {
      if (flushTimer !== null) return;
      flushTimer = (setInterval(() => {
        if (pending.length === 0) {
          if (streamEnded) {
            if (flushTimer !== null) {
              clearInterval(flushTimer);
              flushTimer = null;
            }
            // Drain anything left in the tag buffer (no more chunks coming).
            if (tagBuffer.length > 0) {
              const tail = tagBuffer;
              tagBuffer = "";
              if (tail) onDelta(tail);
            }
            onDone();
          }
          return;
        }
        // If stream already ended and a lot is queued, drain faster to avoid lag.
        const burst = streamEnded && pending.length > 80
          ? Math.min(pending.length, Math.max(CHARS_PER_TICK, Math.ceil(pending.length / 20)))
          : CHARS_PER_TICK;
        const slice = pending.slice(0, burst);
        pending = pending.slice(burst);
        onDelta(slice);
      }, TICK_MS) as unknown) as number;
    };

    const enqueue = (text: string) => {
      pending += text;
      startFlusher();
    };

    const finish = () => {
      streamEnded = true;
      startFlusher();
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onError('Not authenticated');
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ messages, timeSlot, themeName, userName, mode: mode || 'open', aiContext: [soulContext, aiContext].filter(Boolean).join('\n\n') || '', language: language || 'en', master: master || null }),
        }
      );

      if (!resp.ok) {
        if (resp.status === 402) {
          const err = await resp.json().catch(() => ({ error: 'insufficient_credits' }));
          onError('insufficient_credits');
          return;
        }
        const err = await resp.json().catch(() => ({ error: 'Chat failed' }));
        onError(err.error || `Error ${resp.status}`);
        return;
      }

      if (!resp.body) {
        onError('No response body');
        return;
      }

      // Award ai_chat karma — server throttles to once / 90s.
      // Only award if there's at least one user message in the turn (skip pure openers).
      if (messages?.some((m) => m.role === 'user')) {
        try { awardKarmaEvent.mutate({ event: 'ai_chat', metadata: { mode: mode || 'open' } }); } catch {}
      }


      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            finish();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) processTagged(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (const raw of buffer.split('\n')) {
          if (!raw || !raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) processTagged(content);
          } catch { /* ignore */ }
        }
      }

      finish();
    } catch (e: any) {
      if (flushTimer !== null) { clearInterval(flushTimer); flushTimer = null; }
      onError(e.message || 'Unknown error');
    }
  }, [awardKarmaEvent]);

  return { streamChat };
}
