import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Plus, X, Check } from "lucide-react";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { useJournalThreads, useCreateJournalThread, useCloseJournalThread, type JournalThread } from "@/hooks/useJournalThreads";
import { toast } from "sonner";

interface Props {
  activeThreadId: string | null;
  onChange: (thread: JournalThread | null) => void;
}

export function JournalThreadPicker({ activeThreadId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [intention, setIntention] = useState("");
  const { data: threads = [] } = useJournalThreads("active");
  const create = useCreateJournalThread();
  const close = useCloseJournalThread();

  const active = threads.find((t) => t.id === activeThreadId) || null;

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      const t = await create.mutateAsync({ title, intention: intention || undefined });
      onChange(t);
      setTitle(""); setIntention(""); setCreating(false); setOpen(false);
      toast.success("Journey started");
    } catch (e: any) {
      toast.error(e?.message || "Could not create");
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display transition-all border ${
          active
            ? "bg-primary/15 text-primary border-primary/30"
            : "glass-subtle text-muted-foreground hover:text-primary border-border/30 hover:border-primary/25"
        }`}
      >
        <GitBranch className="w-3.5 h-3.5" />
        {active ? active.title : "Thread"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setCreating(false); }} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl glass-card border border-border/40 shadow-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 font-display">Journey</p>
                {active && (
                  <button
                    onClick={() => onChange(null)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Detach
                  </button>
                )}
              </div>

              {!creating && (
                <>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {threads.length === 0 && (
                      <p className="text-xs text-muted-foreground italic px-2 py-3">No journeys yet. Start one to thread entries together.</p>
                    )}
                    {threads.map((t) => (
                      <div key={t.id} className="group flex items-center gap-1">
                        <button
                          onClick={() => { onChange(t); setOpen(false); }}
                          className={`flex-1 text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            t.id === activeThreadId ? "bg-primary/10 text-primary" : "hover:bg-foreground/5 text-foreground/85"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {t.id === activeThreadId && <Check className="w-3 h-3" />}
                            <span className="truncate font-display">{t.title}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                            {t.entry_count} {t.entry_count === 1 ? "entry" : "entries"}
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            if (activeThreadId === t.id) onChange(null);
                            close.mutate(t.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                          title="Close journey"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setCreating(true)}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 rounded-xl text-xs font-display justify-start gap-1.5 h-8 text-primary hover:bg-primary/10"
                  >
                    <Plus className="w-3.5 h-3.5" /> New journey
                  </Button>
                </>
              )}

              {creating && (
                <div className="space-y-2">
                  <Input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sitting with the email"
                    className="h-9 text-xs rounded-lg bg-background/40"
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  />
                  <Input
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Intention (optional)"
                    className="h-9 text-xs rounded-lg bg-background/40"
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreate} disabled={!title.trim() || create.isPending} className="flex-1 rounded-xl h-8 text-xs">
                      Start
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setCreating(false)} className="rounded-xl h-8 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
