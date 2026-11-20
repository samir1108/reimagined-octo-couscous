import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GURUS as MASTERS, type Guru } from "@/lib/guru-data";
import { MASTER_IMAGES } from "@/assets/masters";

type RecentChat = {
  guruId: string;
  guruName: string;
  lastMessage: string;
  lastAt: string;
  messageCount: number;
};

type Props = {
  onContinue: (guru: Guru) => void;
};

export default function ContinueConversations({ onContinue }: Props) {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get recent conversations grouped by guru
      const { data } = await supabase
        .from("temple_ai_conversations")
        .select("content, role, metadata, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!data || data.length === 0) { setLoading(false); return; }

      // Group by guru_id, get last message and count
      const guruMap = new Map<string, RecentChat>();
      for (const msg of data) {
        const guruId = (msg.metadata as any)?.guru_id;
        if (!guruId) continue;
        if (!guruMap.has(guruId)) {
          const master = MASTERS.find(m => m.id === guruId);
          guruMap.set(guruId, {
            guruId,
            guruName: master?.name || guruId,
            lastMessage: msg.role === "assistant" ? msg.content : `You: ${msg.content}`,
            lastAt: msg.created_at,
            messageCount: 1,
          });
        } else {
          guruMap.get(guruId)!.messageCount++;
        }
      }

      setRecentChats(Array.from(guruMap.values()).slice(0, 4));
      setLoading(false);
    })();
  }, []);

  if (loading || recentChats.length === 0) return null;

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-foreground/60 text-xs font-display tracking-[0.15em] uppercase px-1 mb-2">
        Continue Conversations
      </h3>
      {recentChats.map((chat) => {
        const master = MASTERS.find(m => m.id === chat.guruId);
        if (!master) return null;
        const imageSource = MASTER_IMAGES[chat.guruId] || master.image;
        const truncated = chat.lastMessage.length > 80 
          ? chat.lastMessage.slice(0, 80) + "…" 
          : chat.lastMessage;

        return (
          <motion.button
            key={chat.guruId}
            onClick={() => onContinue(master)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 hover:bg-card/80 transition-all text-left group"
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={imageSource}
              alt={chat.guruName}
              className="w-10 h-10 rounded-full object-cover object-top ring-1 ring-border/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-foreground/80 text-sm font-display font-medium">{chat.guruName}</span>
                <span className="text-muted-foreground/40 text-[10px]">
                  {new Date(chat.lastAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="text-muted-foreground/60 text-xs font-body truncate mt-0.5">{truncated}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
          </motion.button>
        );
      })}
    </motion.div>
  );
}
