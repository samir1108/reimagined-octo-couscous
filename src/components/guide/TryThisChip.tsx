import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCommitmentActions } from "@/hooks/useCommitments";

interface TryThisChipProps {
  assistantMessage: string;
  mode?: string | null;
  masterId?: string | null;
  sessionId?: string | null;
}

/**
 * Small chip under an assistant Guide message. Tapping it captures the
 * suggestion as a Commitment so the app can gently follow up later.
 */
export function TryThisChip({ assistantMessage, mode, masterId, sessionId }: TryThisChipProps) {
  const { create } = useCommitmentActions();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  // Only show when the assistant actually proposed something actionable.
  const lower = assistantMessage.toLowerCase();
  const looksActionable = [
    "would you be willing", "try ", "tonight", "tomorrow", "each morning",
    "before bed", "for the next", "notice when", "keep a", "jot", "write down",
    "for a week", "commit to", "for one day",
  ].some((h) => lower.includes(h));
  if (!looksActionable) return null;

  const onClick = async () => {
    if (state !== "idle") return;
    setState("saving");
    try {
      const res: any = await create.mutateAsync({
        assistantMessage,
        mode,
        masterId,
        sessionId,
        force: true,
      });
      if (res?.ok) {
        setState("saved");
        toast.success("I'll check back with you on this.");
      } else {
        setState("idle");
        toast.error("Couldn't capture that one — try again.");
      }
    } catch (e: any) {
      setState("idle");
      toast.error(e?.message || "Couldn't save");
    }
  };

  return (
    <div className="mt-2 flex justify-start">
      <AnimatePresence mode="wait">
        <motion.button
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          disabled={state !== "idle"}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-body tracking-wide border transition ${
            state === "saved"
              ? "bg-primary/15 border-primary/30 text-primary"
              : "bg-background/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40"
          }`}
        >
          {state === "saving" ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
          ) : state === "saved" ? (
            <><Check className="w-3 h-3" /> I'll check back with you</>
          ) : (
            <><Sparkles className="w-3 h-3" /> I'll try this</>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
