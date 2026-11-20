/**
 * ChainStrip — Today's observation chain in a single elegant row.
 * Active task + progress bar. Compact, never demands attention; rewards completion.
 */
import { motion } from "framer-motion";
import { Check, Link2, Loader2 } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { useState } from "react";

interface Props {
  activeTitle?: string | null;
  activeDomain?: string | null;
  total: number;
  completed: number;
  submitting?: boolean;
  onSubmit: (reflection: string) => void;
}

export default function ChainStrip({
  activeTitle,
  activeDomain,
  total,
  completed,
  submitting,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (!activeTitle && total === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/30 bg-card/40 p-4 sm:p-5"
    >
      <header className="flex items-center gap-2 mb-3">
        <Link2 className="h-3 w-3 text-primary/80" />
        <span className="text-[10px] font-display tracking-[0.32em] uppercase text-muted-foreground">
          Chain · Today
        </span>
        <span className="ml-auto text-[10px] font-body text-muted-foreground/70">
          {completed}/{total}
        </span>
      </header>

      <div className="h-1 w-full rounded-full bg-border/30 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
        />
      </div>

      {activeTitle ? (
        <div className="mt-4">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full text-left"
          >
            <h4 className="font-display font-medium text-foreground text-[15px] leading-snug">
              {activeTitle}
            </h4>
            {activeDomain && (
              <span className="mt-1 inline-block text-[10px] font-display tracking-[0.18em] uppercase text-primary/70">
                {activeDomain}
              </span>
            )}
          </button>

          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 space-y-3 overflow-hidden"
            >
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What did you observe?"
                className="rounded-xl bg-background/40 border-border/30 font-body text-sm min-h-[90px]"
              />
              <Button
                disabled={!text.trim() || submitting}
                onClick={() => {
                  onSubmit(text);
                  setText("");
                  setOpen(false);
                }}
                className="w-full rounded-full bg-primary hover:bg-primary/90 h-10 font-display"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Complete & continue
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground font-body">
          Chain complete. New task generating…
        </p>
      )}
    </motion.section>
  );
}
