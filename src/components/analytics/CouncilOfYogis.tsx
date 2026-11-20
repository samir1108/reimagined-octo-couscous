import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * COUNCIL OF YOGIS (Batch 12)
 * Shows the user's "council" — past gurus who have rotated through their journey.
 * Each guru offers a short standing perspective.
 */

interface Rotation {
  from_guru_id: string;
  to_guru_id: string;
  reason: string | null;
  started_at: string | null;
}

const PERSPECTIVES: Record<string, string> = {
  buddha: "Sit with what arises. No path is needed.",
  krishna: "Act, but release the fruit.",
  shiva: "Dance with the storm. Destruction is also creation.",
  patanjali: "Steady the mind, then the rest reveals itself.",
  ramakrishna: "Devotion melts the boundary between you and the divine.",
  ashtavakra: "You were never bound. There is nothing to do.",
  ramana: "Ask: who is the one suffering?",
  lao_tzu: "The way that can be named is not the eternal way.",
};

export default function CouncilOfYogis() {
  const [council, setCouncil] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("guru_rotations" as any)
        .select("from_guru_id,to_guru_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      const ids = new Set<string>();
      ((data as unknown as Rotation[]) ?? []).forEach((r) => { ids.add(r.from_guru_id); ids.add(r.to_guru_id); });
      setCouncil(Array.from(ids));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-display font-semibold text-foreground">Council of Yogis</h3>
      </div>
      <p className="text-xs text-muted-foreground font-body">
        Every guru you've sat with stays with you. Hear them now.
      </p>

      {loading && <p className="text-xs text-muted-foreground font-body py-6 text-center">Gathering the council...</p>}

      {!loading && council.length === 0 && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground font-body">
            Your council forms as you meet more masters. Start a conversation with a master to begin.
          </p>
        </div>
      )}

      <div className="grid gap-2">
        {council.map((id, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-[10px] uppercase tracking-wider text-primary/70 font-display mb-1">{id.replace(/_/g, " ")}</p>
            <p className="text-sm font-body text-foreground italic">
              "{PERSPECTIVES[id] ?? "Walk your own road. I am only a finger pointing."}"
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
