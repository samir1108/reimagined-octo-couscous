import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { handleEdgeCreditError } from "@/lib/handleCreditError";

interface CouncilResponse {
  question: string;
  responses: { id: string; name: string; response: string }[];
  synthesis: { consensus?: string; dissents?: string; your_question_back?: string };
}

export default function Council() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouncilResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("council-consensus", {
        body: { question },
      });
      if (error) {
        if (handleEdgeCreditError(error)) return;
        throw error;
      }
      if (handleEdgeCreditError(data)) return;
      setResult(data as CouncilResponse);
    } catch (e: any) {
      if (handleEdgeCreditError(e)) return;
      setError(e?.message || "Council is silent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-display tracking-wide">Council of Yogis</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6 font-body">
          Ask one question. Multiple masters answer in their own voice. A synthesis follows.
        </p>

        <div className="flex gap-2 mb-8">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && ask()}
            placeholder="What is your question?"
            className="flex-1 bg-muted/30 rounded-xl px-4 py-3 text-sm font-body border border-border/30 focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={ask}
            disabled={loading || !question.trim()}
            className="bg-primary/15 hover:bg-primary/25 text-primary rounded-xl px-4 py-3 transition-colors disabled:opacity-30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {result.responses.map((r) => (
              <div key={r.id} className="glass-card rounded-2xl p-4 border-border/20">
                <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-2">
                  {r.name}
                </div>
                <p className="text-sm font-body text-foreground/90 leading-relaxed">{r.response}</p>
              </div>
            ))}
            {result.synthesis?.consensus && (
              <div className="glass-card rounded-2xl p-5 border-primary/30 mt-6">
                <div className="text-[10px] tracking-[0.2em] uppercase text-primary font-semibold mb-2">
                  Council synthesis
                </div>
                <p className="text-sm font-body text-foreground mb-3">{result.synthesis.consensus}</p>
                {result.synthesis.dissents && (
                  <p className="text-xs italic text-muted-foreground mb-3">
                    Where they diverge: {result.synthesis.dissents}
                  </p>
                )}
                {result.synthesis.your_question_back && (
                  <p className="text-sm font-display text-primary/90">
                    → {result.synthesis.your_question_back}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
