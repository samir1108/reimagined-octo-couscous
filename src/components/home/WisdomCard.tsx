/**
 * WisdomCard — A single rich paragraph of timeless teaching, drawn dynamically
 * from a vast pool of traditions (Puranas, Shastras, Sutras, Gita, Ramayana,
 * Mahabharata, Buddhist suttas, Zen, Tao, psychology, neuroscience, etc.)
 *
 * The user reads the paragraph. If they want to go deeper, they tap
 * "Study with the Guide" — which opens the Elder in Wisdom Mode with the
 * paragraph + tradition + theme passed as conversation context.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageCircle, RefreshCw, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface WisdomCardProps {
  journeyDay?: number;
  themeTitle?: string;
  themeDescription?: string;
  initialWisdom?: string;
  vLevel?: number;
  activeLoops?: string[];
  onClose?: () => void;
}

interface WisdomPayload {
  paragraph: string;
  study_seed: string;
  tradition: string;
  source: string;
}

export default function WisdomCard({
  journeyDay = 1,
  themeTitle = "Conscious Living",
  themeDescription = "",
  initialWisdom,
  vLevel,
  activeLoops = [],
  onClose,
}: WisdomCardProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<WisdomPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWisdom = async () => {
    if (initialWisdom) {
      setData({
        paragraph: initialWisdom,
        study_seed: `${themeTitle}: ${initialWisdom}`,
        tradition: "Today's transmission",
        source: "daily theme",
      });
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: resp, error: fnError } = await supabase.functions.invoke(
        "generate-wisdom",
        {
          body: {
            journeyDay,
            themeTitle,
            themeDescription,
            vLevel,
            activeLoops,
            language: "en",
          },
        },
      );
      if (fnError) throw fnError;
      if (resp?.paragraph) {
        setData(resp as WisdomPayload);
      } else {
        throw new Error("Empty response");
      }
    } catch (e) {
      console.error("WisdomCard error", e);
      setData({
        paragraph:
          "Right now, beneath the noise of the mind, something is quietly aware. It does not argue, it does not insist — it simply watches the breath rise, the thoughts pass, the body shift. Today, instead of solving anything, return to that quiet watcher.",
        study_seed: `Help me study awareness in relation to ${themeTitle}.`,
        tradition: "Direct observation",
        source: "Direct observation",
      });
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWisdom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyDay, themeTitle, initialWisdom]);

  const handleStudy = () => {
    if (!data) return;
    const params = new URLSearchParams({
      mode: "wisdom",
      source: "wisdom_card",
      tradition: data.tradition,
      seed: data.study_seed,
      theme: themeTitle,
      passage: data.paragraph.slice(0, 600),
    });
    onClose?.();
    navigate(`/app/guide?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Knowledge paragraph card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl p-5 bg-gradient-to-br from-amber-500/10 via-primary/8 to-rose-500/10 border border-primary/25 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300/90" />
          <span className="text-[10px] font-display tracking-[0.22em] uppercase text-amber-200/90 font-semibold">
            Today's Wisdom
          </span>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 py-2"
            >
              <div className="h-3 rounded bg-foreground/10 animate-pulse" />
              <div className="h-3 rounded bg-foreground/10 animate-pulse w-[95%]" />
              <div className="h-3 rounded bg-foreground/10 animate-pulse w-[88%]" />
              <div className="h-3 rounded bg-foreground/10 animate-pulse w-[92%]" />
              <div className="h-3 rounded bg-foreground/10 animate-pulse w-[70%]" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground py-2"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[15px] font-body text-foreground/90 leading-[1.7] mb-3 whitespace-pre-line">
                {data?.paragraph}
              </p>
              <div className="flex items-center justify-between text-[10px] font-body italic text-muted-foreground/80 mb-1">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" />— {data?.tradition}
                </span>
                <button
                  type="button"
                  onClick={fetchWisdom}
                  className="flex items-center gap-1 not-italic uppercase tracking-wider text-[9px] text-muted-foreground/70 hover:text-foreground/90 transition-colors"
                  aria-label="New paragraph"
                >
                  <RefreshCw className="w-3 h-3" />
                  New
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CTA → Study with Guide */}
      <button
        onClick={handleStudy}
        disabled={loading || !data}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary/25 hover:bg-primary/35 disabled:opacity-50 disabled:cursor-not-allowed border border-primary/40 text-xs font-display tracking-wider uppercase text-foreground font-semibold transition-all active:scale-[0.98]"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        Study with the Guide
      </button>

      <p className="text-[10px] font-body text-muted-foreground/60 italic text-center leading-relaxed">
        Wisdom is not what is said — it's what stays after the words leave.
      </p>
    </div>
  );
}
