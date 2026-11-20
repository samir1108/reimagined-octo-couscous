/**
 * WHISPER CHAIN — the conversation with your future self across sessions.
 * On completion the user leaves one sentence; next session it greets them.
 * Server-first (future_self_whispers, already consumed by compose-session-v3),
 * with local-storage fallback so the loop survives even without backend access.
 */
import { supabase } from "@/lib/supabase";

export interface FutureWhisper {
  id: string;
  whisper: string;
  created_at: string;
}

const LOCAL_WHISPER_KEY = "sat-yug:pending-whisper";
const LOCAL_SITTING_KEY = "sat-yug:last-sitting";
const WHISPER_TTL_DAYS = 7;

function readLocalWhisper(): FutureWhisper | null {
  try {
    const raw = localStorage.getItem(LOCAL_WHISPER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FutureWhisper & { expires?: string };
    if (parsed.expires && new Date(parsed.expires).getTime() < Date.now()) {
      localStorage.removeItem(LOCAL_WHISPER_KEY);
      return null;
    }
    return { id: parsed.id, whisper: parsed.whisper, created_at: parsed.created_at };
  } catch {
    return null;
  }
}

function writeLocalWhisper(text: string): void {
  try {
    localStorage.setItem(
      LOCAL_WHISPER_KEY,
      JSON.stringify({
        id: `local-${Date.now()}`,
        whisper: text,
        created_at: new Date().toISOString(),
        expires: new Date(Date.now() + WHISPER_TTL_DAYS * 86400_000).toISOString(),
      }),
    );
  } catch { /* ignore */ }
}

export async function fetchUnconsumedWhisper(): Promise<FutureWhisper | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("future_self_whispers")
        .select("id, whisper, created_at")
        .eq("user_id", user.id)
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.whisper) return data as FutureWhisper;
    }
  } catch { /* fall through to local */ }
  return readLocalWhisper();
}

export async function consumeWhisper(id: string): Promise<void> {
  if (id.startsWith("local-")) {
    try { localStorage.removeItem(LOCAL_WHISPER_KEY); } catch { /* ignore */ }
    return;
  }
  try {
    await supabase
      .from("future_self_whispers")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", id);
  } catch { /* non-fatal */ }
}

export async function saveFutureWhisper(text: string): Promise<boolean> {
  const trimmed = text.trim().slice(0, 300);
  if (!trimmed) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("future_self_whispers").insert({
        user_id: user.id,
        whisper: trimmed,
        tone: "user",
        expires_at: new Date(Date.now() + WHISPER_TTL_DAYS * 86400_000).toISOString(),
      });
      if (!error) return true;
    }
  } catch { /* try edge fallback */ }
  try {
    const { error } = await supabase.functions.invoke("session-complete", {
      body: { mode: "whisper", text: trimmed },
    });
    if (!error) return true;
  } catch { /* fall to local */ }
  writeLocalWhisper(trimmed);
  return true;
}

export interface LastSitting {
  essence: string;
  date: string;
}

export function saveLastSittingEssence(essence: string): void {
  try {
    localStorage.setItem(
      LOCAL_SITTING_KEY,
      JSON.stringify({ essence, date: new Date().toDateString() } as LastSitting),
    );
  } catch { /* ignore */ }
}

export function readLastSittingEssence(): LastSitting | null {
  try {
    const raw = localStorage.getItem(LOCAL_SITTING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastSitting;
  } catch {
    return null;
  }
}
