/**
 * BirthDetails
 * ─────────────
 * Collected once, immediately after the user's name.
 * Powers astrology / numerology / Vedic-science layers in the background:
 *   - Sun sign, Moon sign, Nakshatra, Dasha periods
 *   - Life-path number, expression number
 *   - Auspicious daily windows (Brahma muhurta from local sunrise)
 *
 * Persisted to:
 *   - profiles.lifestyle.birth_chart (jsonb)
 *   - spiritual_dna_assessments.assessment_conversation.birth_chart
 *   - localStorage.birth_chart_<userId> (immediate read for engines)
 *
 * UX: optional; user can skip — engines just fall back to generic guidance.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Clock, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { triggerKundliCompute } from "@/hooks/useKundli";

export interface BirthChart {
  date_of_birth?: string;   // YYYY-MM-DD
  time_of_birth?: string;   // HH:MM
  time_unknown?: boolean;
  place_of_birth?: string;
}

interface Props {
  userId: string;
  name: string;
  onComplete: (chart: BirthChart | null) => void;
}

export default function BirthDetails({ userId, name, onComplete }: Props) {
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState("");
  const [saving, setSaving] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<Array<{ name: string; admin?: string; country?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingPlace, setSearchingPlace] = useState(false);
  const [placeFocused, setPlaceFocused] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced city search via Open-Meteo geocoding (free, no key)
  useEffect(() => {
    if (!placeFocused) return;
    const q = place.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (q.length < 2) { setPlaceSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = window.setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setSearchingPlace(true);
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`,
          { signal: ctrl.signal },
        );
        const json = await res.json();
        const results = (json?.results || []).map((r: any) => ({ name: r.name, admin: r.admin1, country: r.country }));
        setPlaceSuggestions(results);
        setShowSuggestions(true);
      } catch { /* ignore */ } finally { setSearchingPlace(false); }
    }, 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [place, placeFocused]);

  const pickSuggestion = (s: { name: string; admin?: string; country?: string }) => {
    const formatted = [s.name, s.admin, s.country].filter(Boolean).join(", ");
    setPlace(formatted);
    setShowSuggestions(false);
    setPlaceSuggestions([]);
  };

  const persist = useCallback(async (chart: BirthChart | null) => {
    setSaving(true);
    try {
      if (chart) {
        try { localStorage.setItem(`birth_chart_${userId}`, JSON.stringify(chart)); } catch {}
        // Merge into profiles.lifestyle (jsonb) without overwriting other keys
        const { data } = await supabase
          .from("profiles")
          .select("lifestyle")
          .eq("user_id", userId)
          .maybeSingle();
        const lifestyle = (data?.lifestyle as Record<string, unknown>) || {};
        await supabase.from("profiles").upsert(
          {
            user_id: userId,
            display_name: name || "Friend",
            lifestyle: { ...lifestyle, birth_chart: chart } as any,
          } as any,
          { onConflict: "user_id" },
        );

        // Mirror into spiritual_dna_assessments so background engines can read it.
        const { data: existing } = await supabase
          .from("spiritual_dna_assessments")
          .select("assessment_conversation")
          .eq("user_id", userId)
          .maybeSingle();
        const conv = (existing?.assessment_conversation as Record<string, unknown>) || {};
        await supabase.from("spiritual_dna_assessments").upsert(
          {
            user_id: userId,
            assessment_conversation: { ...conv, birth_chart: chart } as any,
          } as any,
          { onConflict: "user_id" },
        );

        // Fire-and-forget Vedic kundli computation (planets, nakshatra, yoni, gana, dasha…)
        if (chart.date_of_birth) {
          triggerKundliCompute({
            date_of_birth: chart.date_of_birth,
            time_of_birth: chart.time_of_birth,
            time_unknown: chart.time_unknown,
            place_of_birth: chart.place_of_birth,
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn("Birth chart persist failed", e);
    } finally {
      setSaving(false);
      onComplete(chart);
    }
  }, [userId, name, onComplete]);

  const canContinue = Boolean(dob);

  const handleContinue = () => {
    const chart: BirthChart = {
      date_of_birth: dob || undefined,
      time_of_birth: timeUnknown ? undefined : (tob || undefined),
      time_unknown: timeUnknown,
      place_of_birth: place.trim() || undefined,
    };
    persist(chart);
  };

  // place of birth removed — captured on prior country step

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden flex items-center justify-center p-6 bg-background ambient-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 25%, hsl(var(--primary) / 0.18), transparent 65%)" }}
      />
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Your chart
          </p>
          <h2 className="font-display text-2xl text-foreground mb-3">
            When and where did you arrive on Earth?
          </h2>
          <p className="text-muted-foreground text-sm mb-7 px-4">
            Used quietly in the background — Vedic astrology, numerology, and your
            local sunrise rhythm — to time practice for you. Nothing shown publicly.
          </p>

          <div className="space-y-4 text-left">
            {/* Date */}
            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                <Calendar className="h-3 w-3" /> Date of birth
              </span>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-3 bg-card/40 border border-border/40 rounded-xl text-foreground focus:outline-none focus:border-primary/60"
              />
            </label>

            {/* Time */}
            <label className="block">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                <Clock className="h-3 w-3" /> Time of birth
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={tob}
                  disabled={timeUnknown}
                  onChange={(e) => setTob(e.target.value)}
                  className="flex-1 px-4 py-3 bg-card/40 border border-border/40 rounded-xl text-foreground focus:outline-none focus:border-primary/60 disabled:opacity-40"
                />
                <button
                  type="button"
                  onClick={() => setTimeUnknown((v) => !v)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-display tracking-wide border transition ${
                    timeUnknown
                      ? "bg-primary/15 border-primary/50 text-primary"
                      : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Don't know
                </button>
              </div>
            </label>

            {/* Place */}
            <label className="block relative">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
                <MapPin className="h-3 w-3" /> Place of birth
              </span>
              <input
                type="text"
                value={place}
                onChange={(e) => { setPlace(e.target.value); setShowSuggestions(true); }}
                onFocus={() => { setPlaceFocused(true); if (placeSuggestions.length) setShowSuggestions(true); }}
                onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
                placeholder="Start typing your city…"
                autoComplete="off"
                className="w-full px-4 py-3 bg-card/40 border border-border/40 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
              />
              {showSuggestions && (placeSuggestions.length > 0 || searchingPlace) && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-popover border border-border/60 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                  {searchingPlace && placeSuggestions.length === 0 && (
                    <div className="px-4 py-3 text-xs text-muted-foreground">Searching…</div>
                  )}
                  {placeSuggestions.map((s, i) => (
                    <button
                      key={`${s.name}-${i}`}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent/60 flex items-center gap-2 border-b border-border/30 last:border-0"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate">
                        {s.name}
                        {(s.admin || s.country) && (
                          <span className="text-muted-foreground"> · {[s.admin, s.country].filter(Boolean).join(", ")}</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </label>
          </div>

          <div className="mt-7 flex flex-col items-center justify-center gap-3">
            <button
              onClick={handleContinue}
              disabled={!canContinue || saving}
              className="px-7 py-3 rounded-full bg-primary text-primary-foreground font-display tracking-wide flex items-center gap-2 disabled:opacity-30 hover:bg-primary/90 transition"
            >
              {saving ? "Saving…" : "Continue"} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { if (!saving) persist(null); }}
              disabled={saving}
              className="text-xs text-muted-foreground/70 hover:text-foreground transition tracking-wide"
            >
              Skip for now — add later in Settings
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
