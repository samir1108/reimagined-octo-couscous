import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Eye } from "lucide-react";
import { Button } from "@/design-system";

interface Props {
  currentQuestion: string;
  questionCount: number;
  isStreaming: boolean;
  error: string | null;
  onSendAnswer: (text: string) => void;
  onRequestReveal: () => void;
}

const MIN_QUESTIONS = 6;

const MirrorQuestionFlow = ({
  currentQuestion,
  questionCount,
  isStreaming,
  error,
  onSendAnswer,
  onRequestReveal,
}: Props) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isStreaming, currentQuestion]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSendAnswer(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Progress indicator */}
      <div className="px-6 pt-6 pb-2 relative z-10">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.max(MIN_QUESTIONS, questionCount + 1) }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i < questionCount
                  ? "w-10 bg-primary"
                  : i === questionCount
                  ? "w-10 bg-primary/40"
                  : "w-6 bg-muted/40"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
        <p className="text-center text-xs font-body text-muted-foreground/40 mt-2">
          {questionCount < MIN_QUESTIONS
            ? `Question ${questionCount + 1} of ${MIN_QUESTIONS}+`
            : `Question ${questionCount + 1} · keep going or see your reading`}
        </p>
      </div>

      {/* Question display */}
      <div className="flex-1 flex items-center justify-center px-8 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {isStreaming && !currentQuestion ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-body text-muted-foreground">The Mirror is looking...</span>
            </motion.div>
          ) : (
            <motion.p
              key={currentQuestion.slice(0, 30)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl md:text-2xl font-display font-medium text-foreground text-center leading-relaxed max-w-lg"
            >
              {currentQuestion}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 pb-2 relative z-10">
          <p className="text-sm text-destructive font-body text-center">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="px-6 pb-6 relative z-10 space-y-3">
        {/* Reveal option — subtle before min, prominent after */}
        {questionCount >= 1 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <button
              onClick={onRequestReveal}
              className={`flex items-center gap-2 font-body transition-colors ${
                questionCount >= MIN_QUESTIONS
                  ? "text-sm text-primary hover:text-primary/80 px-4 py-2 rounded-full border border-primary/30 hover:border-primary/60 bg-primary/5"
                  : "text-xs text-muted-foreground/50 hover:text-primary/70"
              }`}
            >
              <Eye className={questionCount >= MIN_QUESTIONS ? "w-4 h-4" : "w-3 h-3"} />
              {questionCount >= MIN_QUESTIONS ? "See my analysis" : "Show me what you see"}
            </button>
          </motion.div>
        )}

        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what comes to mind..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none bg-muted/20 border border-border/30 rounded-2xl px-5 py-4 text-sm font-body text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-40 transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="shrink-0 w-12 h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MirrorQuestionFlow;
