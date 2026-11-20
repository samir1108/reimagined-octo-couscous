import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { TASK_DOMAINS, DOMAIN_CATEGORIES, DEFAULT_ACTIVE_DOMAINS, type TaskDomain } from "@/data/taskDomains";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export default function TaskDomainsPicker() {
  const [activeDomains, setActiveDomains] = useState<string[]>(DEFAULT_ACTIVE_DOMAINS);
  const [saving, setSaving] = useState(false);

  // Load user's saved domains from profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_consciousness_profile")
        .select("life_domains")
        .eq("user_id", user.id)
        .single();
      if (data?.life_domains && typeof data.life_domains === "object" && (data.life_domains as any).active_domains) {
        setActiveDomains((data.life_domains as any).active_domains);
      }
    })();
  }, []);

  const toggleDomain = async (domainId: string) => {
    const next = activeDomains.includes(domainId)
      ? activeDomains.filter(d => d !== domainId)
      : [...activeDomains, domainId];
    
    if (next.length < 3) {
      toast({
        title: "Keep at least three",
        description: "A few open windows is enough — leave the rest.",
      });
      return;
    }

    setActiveDomains(next);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Get current life_domains and merge
      const { data: current } = await supabase
        .from("user_consciousness_profile")
        .select("life_domains")
        .eq("user_id", user.id)
        .single();

      const existingDomains = (current?.life_domains && typeof current.life_domains === "object") ? current.life_domains : {};

      await supabase
        .from("user_consciousness_profile")
        .update({
          life_domains: { ...existingDomains as object, active_domains: next } as any,
        })
        .eq("user_id", user.id);
    }
    setSaving(false);
  };

  const categories = Object.entries(DOMAIN_CATEGORIES) as [string, { label: string; emoji: string }][];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">Practice Domains</h3>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Choose which areas the AI focuses your tasks on ({activeDomains.length} active)
          </p>
        </div>
        {saving && <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>}
      </div>

      {categories.map(([catKey, catInfo]) => {
        const domains = TASK_DOMAINS.filter(d => d.category === catKey);
        return (
          <div key={catKey}>
            <p className="text-[10px] font-display tracking-[0.15em] uppercase text-muted-foreground mb-2">
              {catInfo.emoji} {catInfo.label}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {domains.map((domain) => {
                const active = activeDomains.includes(domain.id);
                return (
                  <motion.button
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm font-body transition-all ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "glass-subtle text-muted-foreground hover:text-foreground"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-sm shrink-0">{domain.emoji}</span>
                    <span className="truncate text-xs">{domain.label}</span>
                    {active && <Check className="w-3 h-3 shrink-0 ml-auto text-primary" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
