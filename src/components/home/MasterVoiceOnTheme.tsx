/**
 * MasterVoiceOnTheme — Reveals the current Master's lens on today's theme.
 * Lazy: only generates on user click (no auto-bill on page load).
 * Cached per-user-per-day server-side.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useMasterThemeTeaching } from "@/hooks/useMasterThemeTeaching";
import { consciousFromError } from "@/lib/consciousToast";

interface Props {
  themeId?: string;
  themeTitle?: string;
  themeDescription?: string;
  masterId?: string;
  masterName?: string;
  masterTradition?: string;
  masterQuote?: string;
  userBand?: number;
  activeLoops?: string[];
}

export default function MasterVoiceOnTheme({
  themeId,
  themeTitle,
  themeDescription,
  masterId,
  masterName,
  masterTradition,
  masterQuote,
  userBand,
  activeLoops,
}: Props) {
  const [teaching, setTeaching] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<string | null>(null);
  const mutation = useMasterThemeTeaching();

  if (!themeTitle || !masterId || !masterName) return null;

  const reveal = async (force = false) => {
    try {
      const res = await mutation.mutateAsync({
        themeId,
        themeTitle,
        themeDescription,
        masterId,
        masterName,
        masterTradition,
        masterQuote,
        userBand,
        activeLoops,
        force,
      });
      setTeaching(res.teaching);
      setInvitation(res.invitation);
    } catch (e: any) {
      consciousFromError(e, "aiQuiet");
    }
  };

  return (
    <div className="glass-subtle rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary/70" />
          <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/80">
            How {masterName} sees this
          </p>
        </div>
        {teaching && (
          <button
            onClick={() => reveal(true)}
            disabled={mutation.isPending}
            className="text-[10px] font-display tracking-wider uppercase text-muted-foreground/60 hover:text-primary/80 transition flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${mutation.isPending ? "animate-spin" : ""}`} />
            New
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!teaching && !mutation.isPending && (
          <motion.button
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => reveal(false)}
            className="w-full text-left text-sm font-body text-muted-foreground/80 italic hover:text-foreground transition py-1"
          >
            Tap to reveal {masterName}'s voice on this theme →
          </motion.button>
        )}

        {mutation.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm font-body text-muted-foreground/70 italic py-1"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/70" />
            {masterName} is reflecting…
          </motion.div>
        )}

        {teaching && !mutation.isPending && (
          <motion.div
            key="teaching"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-[15px] font-body text-foreground leading-relaxed italic">
              "{teaching}"
            </p>
            {invitation && (
              <div className="border-t border-border/30 pt-3">
                <p className="text-[10px] font-display tracking-[0.18em] uppercase text-primary/70 mb-1">
                  Invitation
                </p>
                <p className="text-sm font-display text-foreground leading-snug">
                  {invitation}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
