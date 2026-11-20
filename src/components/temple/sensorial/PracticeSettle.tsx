/**
 * PracticeSettle — 10-second pre-roll between "Begin" and step 1.
 * Cinematic breath cue + (when available) a personalized recall line
 * pulled from this user's most recent shared insight on the same practice.
 *
 * No backend writes here; only a single read of `practice_insights`.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

async function userHash(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    const id = data.user?.id;
    if (!id) return null;
    const enc = new TextEncoder().encode(id);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

export function PracticeSettle({
  practiceKey,
  guruName,
  durationMs = 10000,
  onDone,
}: {
  practiceKey: string;
  guruName: string;
  durationMs?: number;
  onDone: () => void;
}) {
  const [recall, setRecall] = useState<string | null>(null);

  // Fetch last insight (best-effort, silent on failure).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const h = await userHash();
      if (!h) return;
      try {
        const { data } = await supabase
          .from("practice_insights")
          .select("insight, created_at")
          .eq("practice_key", practiceKey)
          .eq("user_hash", h)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!cancelled && data?.insight) setRecall(data.insight);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [practiceKey]);

  // Auto-advance after duration.
  useEffect(() => {
    const t = setTimeout(onDone, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onDone]);

  return (
    <motion.div
      className="relative z-20 my-auto w-full max-w-md px-4 text-center sm:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1.2 }}
        className="text-[10px] uppercase tracking-[0.4em] text-amber-200/40 mb-6"
      >
        settle
      </motion.p>

      {/* Breathing ring */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-8 h-28 w-28 rounded-full border border-amber-200/30"
        style={{
          background:
            "radial-gradient(circle, rgba(245,197,102,0.18), rgba(245,197,102,0) 70%)",
        }}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1.4 }}
        className="font-display text-base text-white/80 leading-relaxed"
      >
        Soften your shoulders.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1.4 }}
        className="font-display text-base text-white/80 leading-relaxed mt-1"
      >
        Let the next breath find you.
      </motion.p>

      {recall && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.5, duration: 1.4 }}
          className="mt-8 mx-auto max-w-sm rounded-xl border border-amber-200/15 bg-white/[0.03] px-4 py-3"
        >
          <p className="text-[9px] uppercase tracking-[0.3em] text-amber-200/50 mb-1">
            last time with {guruName}
          </p>
          <p className="text-xs italic text-white/65 leading-relaxed">
            "{recall}"
          </p>
        </motion.div>
      )}

      <button
        onClick={onDone}
        className="mt-10 text-[11px] uppercase tracking-[0.3em] text-white/35 hover:text-white/70 transition"
      >
        skip
      </button>
    </motion.div>
  );
}
