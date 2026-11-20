import { useEffect, useState } from "react";

export type NudgePrefs = {
  instant: boolean;
  pre_event: boolean;
  post_event: boolean;
  pattern: boolean;
};

const KEY = "nudge_prefs_v1";
const DEFAULT: NudgePrefs = { instant: true, pre_event: true, post_event: true, pattern: true };

export function loadNudgePrefs(): NudgePrefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function useNudgePrefs() {
  const [prefs, setPrefs] = useState<NudgePrefs>(DEFAULT);

  useEffect(() => { setPrefs(loadNudgePrefs()); }, []);

  const update = (kind: keyof NudgePrefs, value: boolean) => {
    const next = { ...prefs, [kind]: value };
    setPrefs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new Event("nudge-prefs-changed"));
  };

  return { prefs, update };
}
