/**
 * QuickPathMirrorButton
 * ─────────────────────
 * Floating Mirror button shown only for users who chose the QUICK onboarding
 * path. It opens a sheet listing all 38 Mirror checkpoints (library
 * assessments). Tapping a mirror navigates to /app/library/:slug — that runner
 * already persists results into `user_assessment_results`, which feeds the
 * consciousness engine and pre-journey progression hooks. So nothing extra
 * is needed to "tell the engines" — the existing pipeline picks it up.
 *
 * For deep-path users this component renders nothing.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";
import { MIRROR_CHECKPOINTS } from "@/data/pre-journey/mirrors";

export default function QuickPathMirrorButton() {
  const { user } = useAuthReady();
  const navigate = useNavigate();
  const [path, setPath] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_path" as any)
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setPath(((data as any)?.onboarding_path as string) ?? null);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !open) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_assessment_results")
        .select("assessment_slug" as any)
        .eq("user_id", user.id);
      if (cancelled) return;
      const slugs = new Set<string>();
      (data as any[] | null)?.forEach((r) => r?.assessment_slug && slugs.add(r.assessment_slug));
      setCompletedSlugs(slugs);
    })();
    return () => { cancelled = true; };
  }, [user?.id, open]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof MIRROR_CHECKPOINTS>();
    MIRROR_CHECKPOINTS.forEach((m) => {
      const arr = map.get(m.module) ?? [];
      arr.push(m);
      map.set(m.module, arr);
    });
    return Array.from(map.entries());
  }, []);

  if (path !== "quick") return null;

  return (
    <>
      <button
        aria-label="Open Mirrors"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition"
      >
        <Eye className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mirror-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
          >
            <div className="max-w-xl mx-auto px-5 pt-6 pb-16">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Mirrors</p>
                  <h2 className="font-display text-xl text-foreground">See yourself, deeper.</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center hover:bg-card/60"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Each mirror you complete refines your band, your guru, and what
                the engine recommends next. Take them in any order.
              </p>

              {grouped.map(([module, items]) => (
                <div key={module} className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{module}</p>
                  <div className="grid gap-2">
                    {items.map((m) => {
                      const done = completedSlugs.has(m.assessmentSlug);
                      return (
                        <button
                          key={m.number}
                          onClick={() => {
                            setOpen(false);
                            navigate(`/app/library/${m.assessmentSlug}?from=mirror&n=${m.number}`);
                          }}
                          className="text-left p-3.5 rounded-xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-primary/50 transition flex items-start gap-3"
                        >
                          <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] ${done ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"}`}>
                            {done ? <Check className="w-3 h-3" /> : m.number}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm text-foreground">{m.title}</span>
                            <span className="block text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.hook}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
