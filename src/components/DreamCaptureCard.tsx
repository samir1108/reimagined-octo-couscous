import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Send, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { conscious, consciousFromError } from "@/lib/consciousToast";

interface DreamCaptureCardProps {
  onDreamDecoded?: (result: any) => void;
}

export default function DreamCaptureCard({ onDreamDecoded }: DreamCaptureCardProps) {
  const [dreamText, setDreamText] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!dreamText.trim() || dreamText.trim().length < 10) {
      conscious("writeMore");
      return;
    }

    setIsDecoding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/decode-dream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ dreamText: dreamText.trim(), vividness: 5, lucidityLevel: 0 }),
        }
      );

      if (!resp.ok) throw new Error("Decoding failed");
      const data = await resp.json();
      setResult(data);
      setExpanded(true);
      onDreamDecoded?.(data);
      toast({ title: "🌙 Dream decoded" });
    } catch (err: any) {
      consciousFromError(err, "somethingSlipped");
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border-primary/10"
    >
      <div className="flex items-center gap-2 mb-3">
        <Moon className="w-4 h-4 text-primary/70" />
        <span className="text-xs font-display tracking-widest uppercase text-primary font-semibold">Dream Weaver</span>
      </div>

      {!result ? (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Any dreams or images from sleep? Capture them before they fade...
          </p>
          <textarea
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            placeholder="I dreamt about..."
            className="w-full bg-muted/30 border border-border/30 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
            rows={3}
            disabled={isDecoding}
          />
          <button
            onClick={handleSubmit}
            disabled={isDecoding || dreamText.trim().length < 10}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-medium transition-colors disabled:opacity-40"
          >
            {isDecoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isDecoding ? "Decoding..." : "Decode Dream"}
          </button>
        </>
      ) : (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <p className="text-sm text-foreground font-medium">{result.decoded_theme}</p>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {result.symbols?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Symbols</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.symbols.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.emotions?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Emotions</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.emotions.map((e: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-accent/30 text-accent-foreground text-[11px] rounded-full">{e}</span>
                      ))}
                    </div>
                  </div>
                )}

                {result.today_seed && (
                  <div className="mt-3 p-3 bg-muted/20 rounded-xl">
                    <span className="text-[10px] uppercase tracking-wider text-primary/70">Today's Seed</span>
                    <p className="text-xs text-foreground mt-1">{result.today_seed}</p>
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setDreamText(""); setExpanded(false); }}
                  className="mt-3 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Record another dream
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
