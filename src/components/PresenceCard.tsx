import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Send, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { conscious } from "@/lib/consciousToast";
import { useAwardKarma } from "@/hooks/useKarma";
import { detectAndAwardBreakthroughs } from "@/lib/breakthroughs/detect";

interface PresenceCardProps {
  prompt: string;
  type?: string;
}

export default function PresenceCard({ prompt, type }: PresenceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const award = useAwardKarma();

  const handleSave = async () => {
    if (!reflection.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        content: reflection,
        title: "Presence Moment",
        mood: "reflective",
        tags: JSON.stringify(["presence_card", type || "awareness"]),
      });
      if (error) throw error;
      setSaved(true);
      // Award karma for presence reflection + scan for breakthroughs
      award.mutate({ source: "presence_reflection", metadata: { type } });
      detectAndAwardBreakthroughs(reflection, award, "presence_card");
      toast({ title: "Saved ✨", description: "Your reflection has been captured" });
      setTimeout(() => { setExpanded(false); setSaved(false); setReflection(""); }, 2000);
    } catch {
      conscious("actionMissed", { kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => !expanded && setExpanded(true)}
      layout
    >
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/70 font-medium">
            Presence Moment
          </span>
          {!expanded && (
            <span className="ml-auto text-[10px] text-muted-foreground font-body">Tap to reflect</span>
          )}
        </div>
        <p className="text-base font-display text-foreground/90 leading-relaxed italic">
          "{prompt}"
        </p>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 pb-6"
          >
            <div className="pt-4 border-t border-border/10">
              {saved ? (
                <motion.div
                  className="flex items-center gap-2 text-primary"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Check className="w-5 h-5" />
                  <span className="font-display text-sm">Reflection saved</span>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="What comes to mind..."
                    className="w-full bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                      className="text-xs text-muted-foreground font-display hover:text-foreground transition-colors px-3 py-1.5"
                    >
                      Close
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSave(); }}
                      disabled={!reflection.trim() || saving}
                      className="flex items-center gap-1.5 text-xs font-display font-medium text-primary-foreground bg-gradient-sunrise px-4 py-1.5 rounded-full disabled:opacity-40 transition-opacity"
                    >
                      <Send className="w-3 h-3" />
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
