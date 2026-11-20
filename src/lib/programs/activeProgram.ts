/**
 * Tracks the currently-running V3 program session in localStorage so the
 * Home orb can show a "running" card with Resume / Stop.
 */
const KEY = "programs-v3:active";
const EVENT = "programs-v3:active-change";

export interface ActiveProgram {
  programId: string;
  programTitle: string;
  sessionIndex: number;
  totalAtoms: number;
  cursor: number; // 0-based current atom
  startedAt: number;
}

export function getActiveProgram(): ActiveProgram | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActiveProgram) : null;
  } catch {
    return null;
  }
}

export function setActiveProgram(a: ActiveProgram) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function updateActiveProgram(patch: Partial<ActiveProgram>) {
  const cur = getActiveProgram();
  if (!cur) return;
  setActiveProgram({ ...cur, ...patch });
}

export function clearActiveProgram() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

export function subscribeActiveProgram(cb: () => void): () => void {
  const onChange = () => cb();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
