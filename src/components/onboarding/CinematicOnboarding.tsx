/**
 * CinematicOnboarding — 3–5 min film onboarding.
 *
 * Replaces the 60-min Elder flow. Structure:
 *   Scene 1 · Overture         (film-only, ~35s)
 *   Scene 2 · The premise      (yoga = break the cycle, ~30s)
 *   Scene 3 · Tap · your name
 *   Scene 4 · The loops        (~35s film)
 *   Scene 5 · Tap · pick one loop
 *   Scene 6 · The vow          (~25s)
 *   Scene 7 · Tap · your vow
 *   Scene 8 · Seal             (~20s, then complete)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import overture from "@/assets/films/overture.mp4.asset.json";
import loops from "@/assets/films/loops.mp4.asset.json";
import session from "@/assets/films/session.mp4.asset.json";
import rareBirth from "@/assets/films/rare-birth.mp4.asset.json";
import flow from "@/assets/films/flow.mp4.asset.json";
import { Input } from "@/design-system";
import { Button } from "@/design-system";

interface Props {
  userId: string;
  onComplete: () => void;
}

const LOOPS = [
  { id: "phone", label: "The phone loop", body: "Reach → scroll → numb → repeat." },
  { id: "worry", label: "The worry loop", body: "Same fear, same story, same knot." },
  { id: "compare", label: "The compare loop", body: "Their life, my life, never enough." },
  { id: "postpone", label: "The postpone loop", body: "Tomorrow. Always tomorrow." },
  { id: "react",  label: "The reaction loop", body: "Trigger → snap → regret." },
];

type Scene =
  | "overture" | "premise"
  | "name"
  | "loops-film" | "loop-pick"
  | "vow-intro" | "vow-write"
  | "seal";

const TITLE = "font-display font-light tracking-tight text-foreground";

function Film({ src, dim = 0.55 }: { src: string; dim?: number }) {
  return (
    <>
      <video
        src={src}
        autoPlay muted playsInline loop
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 55%, rgba(0,0,0,${dim*0.4}) 0%, rgba(0,0,0,${dim}) 60%, rgba(0,0,0,${dim+0.2}) 100%)` }}
      />
    </>
  );
}

export default function CinematicOnboarding({ userId, onComplete }: Props) {
  useForceDarkMode();
  const [scene, setScene] = useState<Scene>("overture");
  const [name, setName] = useState("");
  const [loopId, setLoopId] = useState<string | null>(null);
  const [vow, setVow] = useState("");
  const [saving, setSaving] = useState(false);
  const startRef = useRef(Date.now());

  // Auto-advance timed scenes
  useEffect(() => {
    const timings: Partial<Record<Scene, [number, Scene]>> = {
      overture:     [7000,  "premise"],
      premise:      [9000,  "name"],
      "loops-film": [8000,  "loop-pick"],
      "vow-intro":  [7000,  "vow-write"],
      seal:         [6000,  "__done" as any],
    };
    const t = timings[scene];
    if (!t) return;
    const id = setTimeout(() => {
      if (t[1] === ("__done" as any)) finish();
      else setScene(t[1]);
    }, t[0]);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          display_name: name.trim() || "Friend",
          onboarded: true,
          onboarding_path: "cinematic_v1",
        } as any,
        { onConflict: "user_id" }
      );
      // Stash the loop + vow for the app to pick up on Home.
      localStorage.setItem(
        `cinematic_onboarding_${userId}`,
        JSON.stringify({
          name: name.trim(),
          loopId,
          loopLabel: LOOPS.find(l => l.id === loopId)?.label ?? null,
          vow: vow.trim(),
          durationMs: Date.now() - startRef.current,
          at: Date.now(),
        })
      );
      localStorage.setItem(`first_session_done_${userId}`, "1");
    } catch (e) {
      console.warn("Cinematic onboarding save failed", e);
    } finally {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-background text-foreground overflow-hidden">


      <AnimatePresence mode="wait">
        {/* Scene 1 — Overture */}
        {scene === "overture" && (
          <motion.div key="s1" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <Film src={overture.url} dim={0.5} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1.6 }}
                className="text-xs uppercase tracking-[0.4em] text-white/60 mb-6"
              >
                A rare birth
              </motion.p>
              <motion.h1
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1.8 }}
                className={`${TITLE} text-4xl md:text-6xl leading-[1.1] max-w-2xl`}
              >
                To be born human<br/>is the door.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2, duration: 1.6 }}
                className="mt-8 text-white/70 text-sm tracking-wide"
              >
                Everything else is what you do with it.
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Scene 2 — Premise */}
        {scene === "premise" && (
          <motion.div key="s2" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <Film src={rareBirth.url} dim={0.6} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1.4 }} className="text-white/80 text-lg md:text-xl max-w-xl leading-relaxed">
                Yoga is the oldest technology we have —
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 1.4 }} className={`${TITLE} mt-6 text-2xl md:text-4xl max-w-2xl leading-tight`}>
                a way for a human being<br/>to break free from repeated<br/>birth and death.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5, duration: 1.4 }} className="mt-8 text-white/60 text-sm tracking-wide">
                This app is that technology, in your hand.
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Scene 3 — Name */}
        {scene === "name" && (
          <motion.div key="s3" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.0 }}>
            <Film src={flow.url} dim={0.7} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-6">First tap</p>
              <h2 className={`${TITLE} text-2xl md:text-4xl mb-10`}>What should I call you?</h2>
              <div className="w-full max-w-sm">
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setScene("loops-film"); }}
                  placeholder="Your name"
                  className="bg-white/5 border-white/20 text-white text-center text-lg h-12"
                />
                <Button
                  onClick={() => name.trim() && setScene("loops-film")}
                  disabled={!name.trim()}
                  className="mt-5 w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 4 — Loops film */}
        {scene === "loops-film" && (
          <motion.div key="s4" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <Film src={loops.url} dim={0.55} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1.4 }} className={`${TITLE} text-2xl md:text-4xl max-w-2xl leading-tight`}>
                {name ? `${name}, ` : ""}most of a life<br/>is one loop, running.
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.0, duration: 1.4 }} className="mt-8 text-white/70 text-base md:text-lg max-w-md leading-relaxed">
                Same trigger. Same reaction. Same result.<br/>Awareness is what breaks it.
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Scene 5 — Loop pick */}
        {scene === "loop-pick" && (
          <motion.div key="s5" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.0 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
            <div className="relative z-10 h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-10 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-4">Second tap</p>
              <h2 className={`${TITLE} text-2xl md:text-3xl mb-8 max-w-lg`}>Which loop is loudest right now?</h2>
              <div className="w-full max-w-md grid gap-3">
                {LOOPS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLoopId(l.id)}
                    className={`text-left rounded-2xl px-5 py-4 border transition ${
                      loopId === l.id
                        ? "bg-white/10 border-white/60"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="font-medium text-white">{l.label}</div>
                    <div className="text-sm text-white/60 mt-0.5">{l.body}</div>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => setScene("vow-intro")}
                disabled={!loopId}
                className="mt-8 w-full max-w-md h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Scene 6 — Vow intro */}
        {scene === "vow-intro" && (
          <motion.div key="s6" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
            <Film src={session.url} dim={0.65} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1.4 }} className={`${TITLE} text-2xl md:text-4xl max-w-2xl`}>
                A saṅkalpa —
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, duration: 1.4 }} className="mt-6 text-white/80 text-base md:text-lg max-w-md leading-relaxed">
                One vow. Present tense.<br/>Small enough to keep. Large enough to matter.
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Scene 7 — Vow write */}
        {scene === "vow-write" && (
          <motion.div key="s7" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.0 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-4">Third tap</p>
              <h2 className={`${TITLE} text-2xl md:text-3xl mb-2`}>Speak your vow.</h2>
              <p className="text-white/50 text-sm mb-8">One line. Present tense. Yours.</p>
              <div className="w-full max-w-md">
                <textarea
                  autoFocus
                  value={vow}
                  onChange={(e) => setVow(e.target.value.slice(0, 140))}
                  placeholder="I sit for five minutes before I open my phone."
                  rows={3}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl px-5 py-4 text-white text-lg text-center resize-none focus:outline-none focus:border-white/60"
                />
                <div className="text-xs text-white/40 mt-1">{vow.length}/140</div>
                <Button
                  onClick={() => setScene("seal")}
                  disabled={!vow.trim()}
                  className="mt-6 w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Seal it <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene 8 — Seal */}
        {scene === "seal" && (
          <motion.div key="s8" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
            <Film src={overture.url} dim={0.65} />
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.6, ease: "easeOut" }}
                className="w-16 h-16 rounded-full border border-white/40 flex items-center justify-center mb-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-white"
                />
              </motion.div>
              {vow.trim() ? (
                <>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50 mb-4">Your vow</p>
                  <p className={`${TITLE} text-xl md:text-2xl max-w-lg leading-relaxed`}>“{vow.trim()}”</p>
                </>
              ) : (
                <p className={`${TITLE} text-xl md:text-2xl max-w-lg`}>Welcome{ name ? `, ${name}` : "" }.</p>
              )}
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1.2 }}
                className="mt-8 text-white/60 text-sm tracking-wide"
              >
                The app is listening.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
