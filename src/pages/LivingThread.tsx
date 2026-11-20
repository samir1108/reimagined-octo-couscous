import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import { usePrimaryOpenThread, useOpenThreads, useCreateOpenThread, useResolveOpenThread, useAbandonOpenThread, useObservations, useRecordObservation, useConfirmObservation, useExperiments, useCreateExperiment, useUpdateExperimentOutcome } from "@/hooks/usePersonalizationEngine";
import { DEPTH_LABELS, SOURCE_LABELS, type DepthMode } from "@/lib/personalizationEngine";

export default function LivingThread() {
  const navigate = useNavigate();
  const { data: primary } = usePrimaryOpenThread();
  const { data: threads = [] } = useOpenThreads();
  const createThread = useCreateOpenThread();
  const resolveThread = useResolveOpenThread();
  const abandonThread = useAbandonOpenThread();
  const { data: observations = [] } = useObservations(primary?.id ?? null);
  const recordObs = useRecordObservation();
  const confirmObs = useConfirmObservation();
  const { data: experiments = [] } = useExperiments(primary?.id ?? null);
  const createExp = useCreateExperiment();
  const updateExp = useUpdateExperimentOutcome();

  const [newQuestion, setNewQuestion] = useState("");
  const [newObs, setNewObs] = useState("");
  const [newExp, setNewExp] = useState({ action: "", prompt: "" });

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-3xl font-semibold mb-2">Your Living Thread</h1>
      <p className="text-muted-foreground mb-8">
        The question you are exploring right now. ConsciousOS remembers it across sessions.
      </p>

      {/* Primary thread */}
      {primary ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border p-6 mb-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What we're exploring</div>
          <div className="text-xl font-medium mb-3">{primary.question}</div>
          <div className="text-sm text-muted-foreground mb-2">
            {DEPTH_LABELS[primary.depthMode as DepthMode]} · {primary.sessionsCount} session{primary.sessionsCount === 1 ? "" : "s"} · confidence {Math.round(primary.confidence * 100)}%
          </div>
          <div className="text-xs text-muted-foreground italic">{SOURCE_LABELS[primary.source]}</div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => resolveThread.mutate({ id: primary.id, note: "Resolved by user" })}>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Resolve
            </Button>
            <Button size="sm" variant="outline" onClick={() => abandonThread.mutate({ id: primary.id, note: "Abandoned by user" })}>
              <XCircle className="w-4 h-4 mr-1" /> Abandon
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 mb-6 text-muted-foreground">
          No open thread yet. Start one below.
        </div>
      )}

      {/* Create thread */}
      <div className="rounded-2xl border border-border p-6 mb-6">
        <div className="text-sm font-medium mb-3">Start a new thread</div>
        <Input
          placeholder="What question are you sitting with?"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          className="mb-3"
        />
        <Button
          disabled={!newQuestion.trim() || createThread.isPending}
          onClick={() => { createThread.mutate({ question: newQuestion.trim() }); setNewQuestion(""); }}
        >
          <Plus className="w-4 h-4 mr-1" /> Create thread
        </Button>
      </div>

      {/* Observations */}
      {primary && (
        <div className="rounded-2xl border border-border p-6 mb-6">
          <div className="text-sm font-medium mb-3">Observations on this thread</div>
          <div className="space-y-2 mb-4">
            {observations.map((o) => (
              <div key={o.id} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span className={o.confirmed ? "" : "italic text-muted-foreground"}>{o.observation}</span>
                {!o.confirmed && (
                  <Button size="sm" variant="ghost" onClick={() => confirmObs.mutate(o.id)}>
                    confirm
                  </Button>
                )}
              </div>
            ))}
            {observations.length === 0 && <div className="text-sm text-muted-foreground">None yet.</div>}
          </div>
          <Textarea
            placeholder="What did you notice?"
            value={newObs}
            onChange={(e) => setNewObs(e.target.value)}
            className="mb-3"
          />
          <Button
            size="sm"
            disabled={!newObs.trim()}
            onClick={() => { recordObs.mutate({ threadId: primary.id, observation: newObs.trim() }); setNewObs(""); }}
          >
            Record observation
          </Button>
        </div>
      )}

      {/* Experiments */}
      {primary && (
        <div className="rounded-2xl border border-border p-6 mb-6">
          <div className="text-sm font-medium mb-3">Living experiments</div>
          <div className="space-y-3 mb-4">
            {experiments.map((e) => (
              <div key={e.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="font-medium">{e.action}</div>
                <div className="text-muted-foreground text-xs mt-1">{e.observationPrompt}</div>
                <div className="flex gap-2 mt-2">
                  {(["tried", "not_yet", "not_relevant"] as const).map((out) => (
                    <Button
                      key={out}
                      size="sm"
                      variant={e.outcome === out ? "default" : "outline"}
                      onClick={() => updateExp.mutate({ id: e.id, outcome: out })}
                    >
                      {out.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            {experiments.length === 0 && <div className="text-sm text-muted-foreground">None yet.</div>}
          </div>
          <Input
            placeholder="Experiment action"
            value={newExp.action}
            onChange={(e) => setNewExp({ ...newExp, action: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="What to notice"
            value={newExp.prompt}
            onChange={(e) => setNewExp({ ...newExp, prompt: e.target.value })}
            className="mb-3"
          />
          <Button
            size="sm"
            disabled={!newExp.action.trim() || !newExp.prompt.trim()}
            onClick={() => {
              createExp.mutate({ threadId: primary.id, action: newExp.action.trim(), observationPrompt: newExp.prompt.trim() });
              setNewExp({ action: "", prompt: "" });
            }}
          >
            Add experiment
          </Button>
        </div>
      )}

      {/* Other threads */}
      {threads.filter((t) => t.id !== primary?.id).length > 0 && (
        <div className="rounded-2xl border border-border p-6">
          <div className="text-sm font-medium mb-3">Other threads</div>
          <ul className="space-y-2">
            {threads.filter((t) => t.id !== primary?.id).map((t) => (
              <li key={t.id} className="text-sm">
                <span className="font-medium">{t.question}</span>
                <span className="text-muted-foreground text-xs ml-2">({t.status})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
