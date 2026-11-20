/**
 * journalPersist.ts — session writing must reach memory.
 *
 * Before this module, a journal step's text lived only inside
 * `sessions.summary` JSON, so the next composed sitting could not read it:
 * `get-user-context` only queries `journal_entries`. That made the companion's
 * "I remember what you wrote" claim false. This writes the note to
 * `journal_entries` and embeds it so the memory graph can retrieve it.
 */
import { supabase } from "@/lib/supabase";

export interface StepNote {
  sessionId: string;
  stepIndex: number;
  kind: string;
  title?: string;
  payload?: Record<string, unknown>;
  summary?: string;
}

const WRITABLE_KINDS = new Set(["journal", "reflection", "self_inquiry", "reading"]);

/** Pull the human sentence out of a widget payload. */
export function noteText(payload?: Record<string, unknown>): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload.data && typeof payload.data === "object"
    ? (payload.data as Record<string, unknown>)
    : payload) as Record<string, unknown>;
  const candidate = [data.text, data.reflection, data.answer, data.highlight].find(
    (v) => typeof v === "string" && v.trim().length >= 3,
  );
  if (typeof candidate !== "string") return null;
  return candidate.trim().slice(0, 4000);
}

export function noteQuestion(payload?: Record<string, unknown>): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload.data && typeof payload.data === "object"
    ? (payload.data as Record<string, unknown>)
    : payload) as Record<string, unknown>;
  const q = data.question;
  return typeof q === "string" && q.trim().length > 0 ? q.trim().slice(0, 300) : null;
}

/**
 * Fire-and-forget. Never blocks the session; failures are logged, not surfaced.
 */
export async function persistStepNote(note: StepNote): Promise<void> {
  if (!WRITABLE_KINDS.has(note.kind)) return;
  const text = noteText(note.payload);
  if (!text) return;

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) return;

    const title = (note.title || note.kind).slice(0, 120);
    const tags = JSON.stringify([note.kind, "session", `session:${note.sessionId}`]);

    await supabase.from("journal_entries").insert({
      user_id: userId,
      content: text,
      title,
      mood: "reflective",
      tags,
    });

    void supabase.functions
      .invoke("embed-memory", {
        body: {
          content: text,
          source_type: "journal",
          source_id: note.sessionId,
          tags: [note.kind, "session", "step"],
        },
      })
      .catch((e: unknown) => console.warn("[journalPersist] embed failed:", e));
  } catch (e) {
    console.warn("[journalPersist] write failed:", e);
  }
}
