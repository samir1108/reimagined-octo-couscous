import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDueCommitments, useCommitmentActions, type GuideCommitment } from "@/hooks/useCommitments";

function PingRow({ c }: { c: GuideCommitment }) {
  const navigate = useNavigate();
  const { setStatus, snooze } = useCommitmentActions();
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);

  const openInGuide = () => {
    const params = new URLSearchParams();
    if (c.mode) params.set("mode", c.mode);
    params.set("resume", c.id);
    navigate(`/app/guide?${params.toString()}`);
  };

  const markDone = () => {
    setStatus.mutate({ id: c.id, status: "done", outcome_note: note.trim() || undefined });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl p-4 border border-primary/20 mb-3 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/90">
            Following up
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(c.check_back_at), { addSuffix: true })}
          </span>
          <button
            onClick={() => setStatus.mutate({ id: c.id, status: "dismissed" })}
            className="text-muted-foreground/60 hover:text-foreground transition -mr-1"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-sm text-foreground font-body leading-relaxed">
          You said you'd <span className="text-primary">{c.summary}</span>. Did anything surface?
        </p>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="One line — what did you notice?"
                rows={2}
                className="mt-3 w-full bg-background/40 border border-border/40 rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex flex-wrap gap-2">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="px-3 py-1.5 rounded-full text-[11px] bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 transition"
            >
              Yes, it happened
            </button>
          ) : (
            <button
              onClick={markDone}
              className="px-3 py-1.5 rounded-full text-[11px] bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              Save & close
            </button>
          )}
          <button
            onClick={openInGuide}
            className="px-3 py-1.5 rounded-full text-[11px] bg-background/40 hover:bg-background/60 text-foreground border border-border/40 transition"
          >
            Talk about it
          </button>
          <button
            onClick={() => snooze(c.id, 24)}
            className="px-3 py-1.5 rounded-full text-[11px] text-muted-foreground hover:text-foreground transition"
          >
            Not yet
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommitmentPingCard() {
  const { data: dues } = useDueCommitments();
  if (!dues || dues.length === 0) return null;
  const visible = dues.slice(0, 2);
  return (
    <div className="w-full max-w-md">
      <AnimatePresence>
        {visible.map((c) => <PingRow key={c.id} c={c} />)}
      </AnimatePresence>
    </div>
  );
}
