/**
 * ResumeElderBanner — shown on Home when the user hasn't completed the
 * Elder dialogue yet. Two cases trigger it:
 *
 *   1. The user explicitly paused mid-dialogue (localStorage entry).
 *   2. The user skipped onboarding (profile.onboarding_path is missing,
 *      "skipped", "quick_skipped", or "elder_paused"). In this case
 *      they have no in-progress turns yet, so the copy adapts.
 *
 * Clicking re-opens the dialogue (state is restored from localStorage by
 * ElderDialogue itself), and on completion finalizes via the shared
 * `finishElderOnboarding` helper which warms engines + invalidates caches.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUpdateAssessment } from "@/hooks/useConsciousnessEngine";
import { useAssessStartingLevels } from "@/hooks/usePracticeMatrix";
import { useAuthReady } from "@/hooks/useAuthReady";
import ElderDialogue, { type ElderReading, type ElderTurn } from "./ElderDialogue";
import ElderReadingScreen from "./ElderReading";
import { finishElderOnboarding } from "@/lib/onboarding/finishElder";

const INCOMPLETE_PATHS = new Set(["elder_paused", "skipped", "quick_skipped", ""]);

export default function ResumeElderBanner() {
  const navigate = useNavigate();
  const { user } = useAuthReady();
  const userId = user?.id;
  const [name, setName] = useState<string>("Friend");
  const [turns, setTurns] = useState<number>(0);
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState<ElderReading | null>(null);
  const [history, setHistory] = useState<ElderTurn[]>([]);
  const [saving, setSaving] = useState(false);
  const notifiedRef = useRef(false);

  const updateAssessment = useUpdateAssessment();
  const assessStartingLevels = useAssessStartingLevels();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      let pausedTurns = 0;
      let pausedName: string | null = null;
      try {
        const raw = localStorage.getItem(`elder_paused_${userId}`);
        if (raw) {
          const p = JSON.parse(raw);
          pausedTurns = Number(p.turns) || 0;
          pausedName = p.name || null;
        }
      } catch { /* ignore */ }

      if (pausedTurns === 0) {
        try {
          const raw = localStorage.getItem(`elder_dialogue_${userId}`);
          if (raw) {
            const p = JSON.parse(raw);
            const len = Array.isArray(p?.history) ? p.history.length : 0;
            if (len > 0) pausedTurns = len;
          }
        } catch { /* ignore */ }
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, onboarded, onboarding_path")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;
      setName(pausedName || prof?.display_name || "Friend");
      setTurns(pausedTurns);

      const incomplete =
        !prof?.onboarded ||
        INCOMPLETE_PATHS.has(String(prof?.onboarding_path ?? ""));

      if (incomplete) {
        setShow(true);
        // One-time toast per session letting the user know they can finish anytime.
        const key = `elder_notified_${userId}`;
        let already = false;
        try { already = sessionStorage.getItem(key) === "1"; } catch {}
        if (!already && !notifiedRef.current) {
          notifiedRef.current = true;
          try { sessionStorage.setItem(key, "1"); } catch {}
          toast("Your Elder is waiting", {
            description:
              pausedTurns > 0
                ? "You paused mid-way. Continue whenever you're ready — everything is saved."
                : "Finish your first meeting to unlock your reading and personalized path.",
            duration: 8000,
            action: {
              label: "Continue",
              onClick: () => setOpen(true),
            },
          });
        }
      } else {
        setShow(false);
        setOpen(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (!userId || !show) return null;

  if (open && reading) {
    return (
      <ElderReadingScreen
        reading={reading}
        name={name}
        saving={saving}
        onAccept={async (chosenPath) => {
          setSaving(true);
          try {
            await finishElderOnboarding({
              userId,
              name,
              reading,
              history,
              chosenPath,
              updateAssessment,
              assessStartingLevels,
              queryClient,
            });
            setShow(false);
            setOpen(false);
            setReading(null);
            navigate("/app/analytics?welcome=1");
          } catch (e) {
            console.error("Resume Elder finish failed", e);
            setSaving(false);
          }
        }}
      />
    );
  }

  if (open) {
    return (
      <ElderDialogue
        userId={userId}
        name={name}
        onComplete={(r, h) => {
          setReading(r);
          setHistory(h);
        }}
        onPause={() => {
          setOpen(false);
        }}
      />
    );
  }

  // Compact chip — always visible until Elder is complete.
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-3 flex justify-center">
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm hover:bg-primary/15 transition text-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-foreground/90 font-medium">
          {turns > 0 ? `Elder · ${turns} turn${turns === 1 ? "" : "s"} in` : `Meet Elder ${name}`}
        </span>
        <span className="text-primary font-medium">
          {turns > 0 ? "Continue →" : "Begin →"}
        </span>
      </button>
    </div>
  );
}
