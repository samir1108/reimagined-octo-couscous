/**
 * BirthInsightsOptOut — Settings toggle to hide the personalized astrology /
 * numerology insight chip from Home. Persists to localStorage and notifies
 * Home via a custom event so it updates without reload.
 */
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { BIRTH_INSIGHTS_OPT_OUT_KEY } from "@/components/personalization/BirthInsightsChip";

export default function BirthInsightsOptOut() {
  const [optedOut, setOptedOut] = useState<boolean>(() =>
    typeof window === "undefined"
      ? false
      : localStorage.getItem(BIRTH_INSIGHTS_OPT_OUT_KEY) === "1",
  );

  useEffect(() => {
    if (optedOut) localStorage.setItem(BIRTH_INSIGHTS_OPT_OUT_KEY, "1");
    else localStorage.removeItem(BIRTH_INSIGHTS_OPT_OUT_KEY);
    window.dispatchEvent(new Event("birth-insights-opt-out-changed"));
  }, [optedOut]);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-body text-foreground">
            Show astrology insight on Home
          </span>
          <span className="text-[11px] text-muted-foreground/80 mt-0.5 leading-relaxed">
            Hides the daily numerology + Vedic chip. Not recommended — it
            personalizes today's practice.
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOptedOut((v) => !v)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors mt-1 ${
          !optedOut ? "bg-primary" : "bg-muted"
        }`}
        aria-pressed={!optedOut}
        aria-label="Toggle astrology insight visibility"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            !optedOut ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
