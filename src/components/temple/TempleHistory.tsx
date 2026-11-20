import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GURUS, type Guru } from "@/lib/guru-data";
import { formatDistanceToNow } from "date-fns";

type HistoryItem = {
  id: string;
  guru: Guru;
  type: "talk" | "practice";
  label: string;
  timestamp: string;
};

type Props = {
  onTalk: (guru: Guru) => void;
  onPractice: (guru: Guru) => void;
};

export default function TempleHistory({ onTalk, onPractice }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch recent sessions that are temple-type or have guru topic
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id, type, user_chosen_topic, started_at, summary")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(20);

      if (!sessions?.length) { setLoading(false); return; }

      const items: HistoryItem[] = [];
      const guruMap = new Map(GURUS.map(g => [g.id, g]));
      const guruNameMap = new Map(GURUS.map(g => [g.name.toLowerCase(), g]));

      for (const s of sessions) {
        // Try to match guru from topic or summary
        const text = `${s.user_chosen_topic || ""} ${s.summary || ""}`.toLowerCase();
        let matchedGuru: Guru | undefined;

        for (const [name, guru] of guruNameMap) {
          if (text.includes(name) || text.includes(guru.id)) {
            matchedGuru = guru;
            break;
          }
        }

        if (matchedGuru) {
          const isPractice = text.includes("practice") || text.includes("meditation") || text.includes("exercise");
          items.push({
            id: s.id,
            guru: matchedGuru,
            type: isPractice ? "practice" : "talk",
            label: isPractice ? "Practice session" : "Conversation",
            timestamp: s.started_at,
          });
        }
      }

      // If no real history, show suggested recent masters
      if (items.length === 0) {
        // Show first 3 gurus as "suggested"
        const suggested = GURUS.slice(0, 3).map((g, i) => ({
          id: `suggested-${i}`,
          guru: g,
          type: "talk" as const,
          label: "Start a conversation",
          timestamp: new Date().toISOString(),
        }));
        setHistory(suggested);
      } else {
        setHistory(items.slice(0, 6));
      }

      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  return (
    <motion.div
      className="px-4 md:px-12 pb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <h2 className="text-white/30 text-[10px] font-display tracking-[0.3em] uppercase">
            {history.some(h => h.id.startsWith("suggested")) ? "Suggested for You" : "Your Journey"}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
          {history.map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => item.type === "practice" ? onPractice(item.guru) : onTalk(item.guru)}
              className="flex-shrink-0 w-52 md:w-60 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 group text-left"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Image */}
              <div className="relative h-28 md:h-32 overflow-hidden">
                <img
                  src={item.guru.image}
                  alt={item.guru.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Type badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08] text-white/50 text-[9px] font-display tracking-wider">
                    {item.type === "practice" ? (
                      <><Sparkles className="w-2.5 h-2.5" /> Practice</>
                    ) : (
                      <><MessageCircle className="w-2.5 h-2.5" /> Talk</>
                    )}
                  </span>
                </div>

                {/* Guru name on image */}
                <div className="absolute bottom-2 left-3">
                  <p className="text-white/90 text-sm font-display font-medium tracking-wide">
                    {item.guru.name}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-white/40 text-xs font-display mb-1.5">
                  {item.label}
                </p>
                {!item.id.startsWith("suggested") && (
                  <div className="flex items-center gap-1 text-white/20 text-[10px] font-display">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
