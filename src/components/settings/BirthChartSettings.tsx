/**
 * BirthChartSettings
 * ───────────────────
 * Lets the user add (or edit) their birth chart any time after onboarding.
 * On save: persists to profiles.lifestyle.birth_chart + spiritual_dna_assessments,
 * and fires the Vedic kundli computation so all engines (numerology, dasha,
 * sunrise/Brahma muhurta, nakshatra) recalibrate immediately.
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { Sparkles, MapPin, Clock, Calendar, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { triggerKundliCompute } from "@/hooks/useKundli";
import { toast } from "sonner";

interface BirthChart {
  date_of_birth?: string;
  time_of_birth?: string;
  time_unknown?: boolean;
  place_of_birth?: string;
}

export default function BirthChartSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hasExisting, setHasExisting] = useState(false);

  const [suggestions, setSuggestions] = useState<Array<{ name: string; admin?: string; country?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [placeFocused, setPlaceFocused] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load user + existing chart
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("lifestyle")
        .eq("user_id", user.id)
        .maybeSingle();
      const chart = (data?.lifestyle as any)?.birth_chart as BirthChart | undefined;
      if (chart) {
        setHasExisting(true);
        setDob(chart.date_of_birth || "");
        setTob(chart.time_of_birth || "");
        setTimeUnknown(!!chart.time_unknown);
        setPlace(chart.place_of_birth || "");
      }
    })();
  }, []);

  // City autocomplete
  useEffect(() => {
    if (!placeFocused) return;
    const q = place.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = window.setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setSearching(true);
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`,
          { signal: ctrl.signal },
        );
        const json = await res.json();
        const results = (json?.results || []).map((r: any) => ({ name: r.name, admin: r.admin1, country: r.country }));
        setSuggestions(results);
        setShowSuggestions(true);
      } catch { /* ignore */ } finally { setSearching(false); }
    }, 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [place, placeFocused]);

  const pickSuggestion = (s: { name: string; admin?: string; country?: string }) => {
    setPlace([s.name, s.admin, s.country].filter(Boolean).join(", "));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSave = useCallback(async () => {
    if (!userId || !dob) return;
    setSaving(true);
    const chart: BirthChart = {
      date_of_birth: dob,
      time_of_birth: timeUnknown ? undefined : (tob || undefined),
      time_unknown: timeUnknown,
      place_of_birth: place.trim() || undefined,
    };
    try {
      try { localStorage.setItem(`birth_chart_${userId}`, JSON.stringify(chart)); } catch {}

      const { data } = await supabase
        .from("profiles")
        .select("lifestyle, display_name")
        .eq("user_id", userId)
        .maybeSingle();
      const lifestyle = (data?.lifestyle as Record<string, unknown>) || {};
      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          display_name: data?.display_name || "Friend",
          lifestyle: { ...lifestyle, birth_chart: chart } as any,
        } as any,
        { onConflict: "user_id" },
      );

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

      // Fire Vedic kundli compute → recalibrates all downstream engines
      triggerKundliCompute({
        date_of_birth: chart.date_of_birth,
        time_of_birth: chart.time_of_birth,
        time_unknown: chart.time_unknown,
        place_of_birth: chart.place_of_birth,
      }).catch(() => {});

      setHasExisting(true);
      setSavedAt(Date.now());
      toast.success("Chart saved — recalibrating your practice");
    } catch (e) {
      console.warn("Birth chart save failed", e);
      toast.error("Couldn't save chart. Try again.");
    } finally {
      setSaving(false);
    }
  }, [userId, dob, tob, timeUnknown, place]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base text-foreground">Your Chart</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        {hasExisting
          ? "Edit anytime. Saving recalibrates Vedic timing, numerology, and your sunrise rhythm."
          : "Add your birth details. Used quietly in the background to time practice for you — nothing shown publicly."}
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
            <Calendar className="h-3 w-3" /> Date of birth
          </span>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full px-4 py-2.5 bg-card/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/60"
          />
        </label>

        <label className="block">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
            <Clock className="h-3 w-3" /> Time of birth
          </span>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={tob}
              disabled={timeUnknown}
              onChange={(e) => setTob(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-card/40 border border-border/40 rounded-xl text-foreground text-sm focus:outline-none focus:border-primary/60 disabled:opacity-40"
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

        <label className="block relative">
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1.5">
            <MapPin className="h-3 w-3" /> Place of birth
          </span>
          <input
            type="text"
            value={place}
            onChange={(e) => { setPlace(e.target.value); setShowSuggestions(true); }}
            onFocus={() => { setPlaceFocused(true); if (suggestions.length) setShowSuggestions(true); }}
            onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
            placeholder="Start typing your city…"
            autoComplete="off"
            className="w-full px-4 py-2.5 bg-card/40 border border-border/40 rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
          />
          {showSuggestions && (suggestions.length > 0 || searching) && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-popover border border-border/60 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {searching && suggestions.length === 0 && (
                <div className="px-4 py-3 text-xs text-muted-foreground">Searching…</div>
              )}
              {suggestions.map((s, i) => (
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

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!dob || saving}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-display text-sm tracking-wide flex items-center gap-2 disabled:opacity-30 hover:bg-primary/90 transition"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : savedAt ? <Check className="h-4 w-4" /> : null}
          {saving ? "Saving…" : savedAt ? "Saved" : hasExisting ? "Update & recalibrate" : "Save & calibrate"}
        </button>
      </div>
    </div>
  );
}
