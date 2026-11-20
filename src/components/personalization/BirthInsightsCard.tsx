/**
 * BirthInsightsCard — small, drop-anywhere surface that shows the user's
 * personalized numerology + Vedic + daily-rhythm insight from useBirthInsights.
 *
 * Renders nothing if no birth chart has been collected yet.
 */
import { Sparkles, Sunrise, Clock } from "lucide-react";
import { useBirthInsights } from "@/hooks/useBirthInsights";
import { profileHeadline, vedicLine } from "@/lib/personalization";

interface Props {
  userId?: string;
  name?: string;
  className?: string;
}

export default function BirthInsightsCard({ userId, name, className = "" }: Props) {
  const { profile, hasChart } = useBirthInsights(userId, { name });
  if (!hasChart || !profile) return null;

  const v = vedicLine(profile);
  const r = profile.rhythm;

  return (
    <div className={`rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md p-4 space-y-2.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.3em] text-primary/80 uppercase">
        <Sparkles className="h-3 w-3" /> Today, for you
      </div>
      <p className="text-sm text-foreground leading-relaxed">{profile.todayInsight}</p>
      <p className="text-[11px] text-muted-foreground">{profileHeadline(profile)}</p>
      {v && profile.confidence.vedic !== "none" && (
        <p className="text-[11px] text-muted-foreground/80">
          {v}{profile.confidence.vedic === "low" && " · approximate"}
        </p>
      )}
      {r && (
        <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground/80 border-t border-border/30 mt-1">
          <span className="flex items-center gap-1"><Sunrise className="h-3 w-3" />Brahma {r.brahmaMuhurta.start}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Abhijit {r.abhijitMuhurta.start}</span>
          <span className="text-rose-300/70">Rahu {r.rahuKalam.start}–{r.rahuKalam.end}</span>
        </div>
      )}
    </div>
  );
}
