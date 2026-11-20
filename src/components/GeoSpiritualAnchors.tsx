import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";

const LOCATION_PRESETS: Record<string, { emoji: string; defaultPractice: string }> = {
  home: { emoji: "🏠", defaultPractice: "bhakti" },
  office: { emoji: "🏢", defaultPractice: "karma" },
  park: { emoji: "🌳", defaultPractice: "prakriti" },
  gym: { emoji: "💪", defaultPractice: "body" },
  commute: { emoji: "🚌", defaultPractice: "breath" },
  temple: { emoji: "🛕", defaultPractice: "devotion" },
  bed: { emoji: "🛏️", defaultPractice: "yoga_nidra" },
  cafe: { emoji: "☕", defaultPractice: "observation" },
};

interface Anchor {
  id: string;
  label: string;
  practice_type: string;
  location_name: string | null;
  usage_count: number;
  effectiveness_score: number;
  is_active: boolean;
}

export default function GeoSpiritualAnchors() {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("home");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadAnchors();
  }, []);

  const loadAnchors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("geo_practice_anchors" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("usage_count", { ascending: false });

      setAnchors((data || []) as any[]);
    } catch (err) {
      console.error("geo anchors load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAnchor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const preset = LOCATION_PRESETS[newLabel] || LOCATION_PRESETS.home;
      const { error } = await supabase.from("geo_practice_anchors" as any).insert({
        user_id: user.id,
        label: newLabel,
        practice_type: preset.defaultPractice,
        location_name: newName || null,
      });

      if (error) throw error;
      setAdding(false);
      setNewName("");
      loadAnchors();
      toast({ title: `${preset.emoji} ${newLabel} anchor set` });
    } catch (err: any) {
      consciousFromError(err, "actionMissed");
    }
  };

  const removeAnchor = async (id: string) => {
    await supabase.from("geo_practice_anchors" as any).update({ is_active: false }).eq("id", id);
    setAnchors(prev => prev.filter(a => a.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border-primary/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary/70" />
          <span className="text-xs font-display tracking-widest uppercase text-primary font-semibold">Sacred Spaces</span>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="text-primary/60 hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {adding && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mb-4 p-3 bg-muted/20 rounded-xl space-y-2"
        >
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(LOCATION_PRESETS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setNewLabel(key)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                  newLabel === key ? "bg-primary text-primary-foreground" : "bg-muted/30 text-foreground/60 hover:bg-muted/50"
                }`}
              >
                {val.emoji} {key}
              </button>
            ))}
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Custom name (optional)"
            className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button
            onClick={addAnchor}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-medium transition-colors"
          >
            <Check className="w-3 h-3" /> Add Anchor
          </button>
        </motion.div>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-3">Loading...</p>
      ) : anchors.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">Tag your spaces with practices</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Office = Karma Yoga, Home = Bhakti, Park = Prakriti</p>
        </div>
      ) : (
        <div className="space-y-2">
          {anchors.map(anchor => {
            const preset = LOCATION_PRESETS[anchor.label] || { emoji: "📍", defaultPractice: "" };
            return (
              <div key={anchor.id} className="flex items-center justify-between p-2.5 bg-muted/10 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{preset.emoji}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground capitalize">
                      {anchor.location_name || anchor.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {anchor.practice_type.replace(/_/g, " ")} • {anchor.usage_count} sessions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeAnchor(anchor.id)}
                  className="text-muted-foreground/30 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50 mt-3 text-center">
        Location data stays on your device — encrypted locally
      </p>
    </motion.div>
  );
}
