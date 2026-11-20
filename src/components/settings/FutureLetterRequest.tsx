import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Scroll } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { conscious, consciousFromError } from "@/lib/consciousToast";
import ReadingCardModal from "@/components/ReadingCardModal";

export default function FutureLetterRequest() {
  const [requesting, setRequesting] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const requestLetter = async () => {
    setRequesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        conscious("needPresence", { kind: "warning" });
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: [],
            mode: "future_self",
            aiContext: "letter_from_future",
            userName: session.user.user_metadata?.full_name || "friend",
          }),
        }
      );

      if (!resp.ok) throw new Error("Failed to generate letter");

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) text += content;
            } catch { /* skip */ }
          }
        }
      }

      setLetter(text);
      setModalOpen(true);
    } catch (e) {
      consciousFromError(e, "aiQuiet");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
            <Scroll className="w-4 h-4 text-primary" />
            Letter from Future Self
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Your future self has a message based on your journey
          </p>
        </div>
      </div>

      <motion.button
        onClick={() => {
          if (letter) {
            setModalOpen(true);
          } else {
            requestLetter();
          }
        }}
        disabled={requesting}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-sunrise text-primary-foreground font-display font-medium text-sm disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {requesting ? (
          <span className="animate-pulse">Your future self is writing...</span>
        ) : letter ? (
          <>
            <Sparkles className="w-4 h-4" />
            Read Letter Again
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Request Letter
          </>
        )}
      </motion.button>

      {/* Letter Modal */}
      <ReadingCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Letter from Your Future Self"
        body={letter || ""}
        subtitle="From Your Future Self"
        icon={
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        }
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => {
                setModalOpen(false);
                navigate("/app/guide?mode=future_self");
              }}
              className="text-sm text-primary font-display font-medium hover:text-primary/80 transition-colors"
            >
              Talk to Future Self →
            </button>
            <button
              onClick={() => {
                setLetter(null);
                setModalOpen(false);
              }}
              className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors"
            >
              Request New Letter
            </button>
          </div>
        }
      />
    </div>
  );
}
