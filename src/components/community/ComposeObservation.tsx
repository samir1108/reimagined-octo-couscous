import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Send, User, UserX } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { usePostObservation } from "@/hooks/useCommunity";
import { toast } from "sonner";
import { conscious } from "@/lib/consciousToast";

const tagOptions = [
  "fear", "comparison", "gratitude", "presence", "anxiety",
  "anger", "joy", "loneliness", "validation", "attachment",
  "peace", "love", "ego", "acceptance", "resistance", "awareness",
];

const displayModes = [
  { value: "anonymous", label: "Anonymous", icon: UserX },
  { value: "seeker", label: "Seeker", icon: Eye },
  { value: "real", label: "Real Name", icon: User },
] as const;

export default function ComposeObservation() {
  const [content, setContent] = useState("");
  const [displayMode, setDisplayMode] = useState<string>("anonymous");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const postMutation = usePostObservation();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 3)
    );
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    postMutation.mutate(
      { content: content.trim(), display_mode: displayMode, tags: selectedTags },
      {
        onSuccess: () => {
          setContent("");
          setSelectedTags([]);
          setExpanded(false);
          toast.success("Observation shared with the community");
        },
        onError: () => conscious("actionMissed", { kind: "error" }),
      }
    );
  };

  return (
    <motion.div
      className="rounded-2xl glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
    >
      <Textarea
        placeholder="Share what you observed today..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (!expanded && e.target.value) setExpanded(true);
        }}
        onFocus={() => setExpanded(true)}
        className="bg-transparent border-none resize-none text-sm font-body placeholder:text-muted-foreground/40 focus-visible:ring-0 min-h-[48px]"
        rows={expanded ? 3 : 1}
      />

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 mt-3"
        >
          {/* Display mode */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-display tracking-wide">Post as:</span>
            {displayModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setDisplayMode(mode.value)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-display transition-all ${
                  displayMode === mode.value
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <mode.icon className="w-3 h-3" />
                {mode.label}
              </button>
            ))}
          </div>

          {/* Tags */}
          <div>
            <span className="text-[11px] text-muted-foreground font-display tracking-wide mb-2 block">
              What did you observe? (max 3)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-display capitalize transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || postMutation.isPending}
              className="gap-1.5 rounded-xl font-display"
            >
              <Send className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
