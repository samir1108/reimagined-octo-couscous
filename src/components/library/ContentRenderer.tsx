import { useState, useEffect } from "react";
import { Play, Pause, CheckCircle2, Circle, Check, BookOpen, Mic, Wind, Target, Sun, Moon, Heart, Flame, Book, Pen, Brain, Sparkles, Volume2, Compass, Gamepad2 } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { Progress } from "@/design-system";
import { Checkbox } from "@/design-system";

export function GamePlayer({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  const [round, setRound] = useState(0);
  const [running, setRunning] = useState(false);
  const [observations, setObservations] = useState<string[]>([]);
  const rounds = c.mechanics?.rounds || 5;
  const secondsPerRound = c.mechanics?.timer_per_round_seconds || c.mechanics?.timer_seconds || 30;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/40 bg-card/40 p-5 text-center">
        <h3 className="text-lg font-display text-foreground mb-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{c.objective}</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: rounds }).map((_, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display ${i < round ? "bg-primary text-primary-foreground" : i === round ? "bg-primary/30 text-primary border-2 border-primary" : "bg-muted/30 text-muted-foreground"}`}>
              {i < round ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {running ? `Round ${round + 1} of ${rounds} — ${secondsPerRound}s` : round >= rounds ? "Complete!" : `Ready for round ${round + 1}`}
        </p>
        <Button onClick={() => { if (round >= rounds) { setRound(0); setRunning(false); return; } setRunning(true); setTimeout(() => { setRound((r) => r + 1); setRunning(false); }, secondsPerRound * 1000); }} disabled={running}>
          {running ? "Running..." : round >= rounds ? "Restart" : "Start Round"}
        </Button>
      </div>
      {Array.isArray(c.observation_outputs) && c.observation_outputs.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/40 p-4">
          <h4 className="text-xs font-display text-foreground mb-2 uppercase tracking-wider">Observations Generated</h4>
          <div className="flex flex-wrap gap-1.5">
            {c.observation_outputs.map((o: string) => (
              <span key={o} className="px-2 py-0.5 rounded-md bg-muted/30 text-[10px] text-muted-foreground">{String(o).replace(/_/g, " ")}</span>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(c.levels) && c.levels.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/40 p-4">
          <h4 className="text-xs font-display text-foreground mb-2 uppercase tracking-wider">Levels</h4>
          <div className="space-y-1.5">
            {c.levels.map((l: any) => (
              <div key={l.level} className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-display">{l.level}</span>
                <span className="text-foreground">{l.name}</span>
                <span className="text-muted-foreground/60 ml-auto">{l.unlock || l.unlock_criteria}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProgramViewer({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const days = c.days || [];
  const day = days.find((d: any) => d.day_number === currentDay) || days[0];
  const progress = days.length > 0 ? Object.keys(completedDays).filter(k => completedDays[+k]).length / days.length * 100 : 0;

  const toggleDay = (dayNum: number) => {
    setCompletedDays(prev => ({ ...prev, [dayNum]: !completedDays[dayNum] }));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/40 bg-card/40 p-5">
        <h3 className="text-lg font-display text-foreground mb-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{c.duration_days} days · {c.daily_time_minutes} min/day</p>
        <Progress value={progress} className="h-1.5 mb-4" />
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setCurrentDay((d) => Math.max(1, d - 1))} className="px-3 py-1 rounded-lg bg-muted/30 text-xs text-foreground hover:bg-muted/50 transition" disabled={currentDay <= 1}>Prev</button>
          <span className="text-sm text-foreground font-display">Day {currentDay} of {c.duration_days}</span>
          <button onClick={() => setCurrentDay((d) => Math.min(c.duration_days, d + 1))} className="px-3 py-1 rounded-lg bg-muted/30 text-xs text-foreground hover:bg-muted/50 transition" disabled={currentDay >= c.duration_days}>Next</button>
        </div>
        {day && (
          <div className="space-y-3">
            <h4 className="text-sm font-display text-foreground">{day.title}</h4>
            <p className="text-xs text-muted-foreground">{day.description}</p>
            {day.reflection_prompt && (
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Reflection</p>
                <p className="text-xs text-foreground italic">{day.reflection_prompt}</p>
              </div>
            )}
            {day.mission && (
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-[10px] uppercase tracking-wider text-primary mb-1">Mission</p>
                <p className="text-xs text-foreground">{day.mission}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={completedDays[currentDay] || false} onChange={() => toggleDay(currentDay)} />
              <span className="text-xs text-foreground">Mark day complete</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function JournalingWriter({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  const [entry, setEntry] = useState("");
  const [savedEntries, setSavedEntries] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`journal_${item.id}`) || "[]"); } catch { return []; }
  });
  const prompts = c.prompts || [c.prompt || "What's on your mind?"];
  const structure = Array.isArray(c.structure) ? c.structure : (c.structure?.sections || ["Opening", "Body", "Closing"]);

  const saveEntry = () => {
    if (!entry.trim()) return;
    const newEntries = [entry, ...savedEntries].slice(0, 50);
    setSavedEntries(newEntries);
    localStorage.setItem(`journal_${item.id}`, JSON.stringify(newEntries));
    setEntry("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/40 bg-card/40 p-5">
        <h3 className="text-lg font-display text-foreground mb-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{c.description}</p>
        <div className="space-y-3 mb-4">
          {structure.map((section, i) => (
            <div key={i} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{section}</label>
              <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder={prompts[i % prompts.length]} rows={3} className="min-h-[80px]" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={saveEntry} disabled={!entry.trim()}>Save Entry</Button>
          <Button variant="outline" onClick={() => setEntry("")}>Clear</Button>
        </div>
      </div>
      {savedEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-display text-foreground uppercase tracking-wider">Previous Entries</h4>
          <div className="space-y-2">
            {savedEntries.slice(0, 5).map((e, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground line-clamp-3">{e}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MeditationPlayer({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const duration = c.duration_minutes || item.duration_minutes || 10;
  const totalSeconds = duration * 60;
  const [isGuided, setIsGuided] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTime((t) => (t >= totalSeconds ? totalSeconds : t + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [playing, totalSeconds]);

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={() => setPlaying(!playing)} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display text-foreground truncate">{item.title}</p>
          <p className="text-[11px] text-muted-foreground">{duration} min · {c.meditation_type || "Meditation"}</p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (time / totalSeconds) * 100)}%` }} />
      </div>
      <div className="text-xs text-muted-foreground flex justify-between">
        <span>{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</span>
        <span>{duration}:00</span>
      </div>
      {c.steps && c.steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-display text-foreground uppercase tracking-wider">Guidance</h4>
          <div className="space-y-1">
            {c.steps.map((s: any, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-muted/30 text-xs">
                <span className="font-medium text-foreground">{s.title}</span>
                <p className="text-muted-foreground">{s.content}</p>
                {s.duration_seconds && <span className="text-[10px] text-muted-foreground/60 ml-2">{s.duration_seconds}s</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setIsGuided(!isGuided)}>{isGuided ? "Unguided" : "Guided"}</Button>
        <Button variant="outline" onClick={() => { setTime(0); setPlaying(false); }}>Reset</Button>
      </div>
    </div>
  );
}

export function SelfInquiryGuide({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const steps = Array.isArray(c.inquiry_steps)
  ? c.inquiry_steps.map((s: any) => s?.instruction || s?.title || s?.content || String(s))
  : (c.inquiry_steps ? [String(c.inquiry_steps)] : [
    "Settle into a comfortable position and close your eyes.",
    "Ask the question gently: " + (c.core_question || item.title),
    "Look for the answer not in words, but in direct experience.",
    "Rest in the silence after the question.",
  ]);

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/40 bg-card/40 p-5">
        <h3 className="text-lg font-display text-foreground mb-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{c.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span>
          <Progress value={(step + 1) / steps.length * 100} className="h-1.5 flex-1" />
        </div>
        <div className="p-4 rounded-lg bg-muted/30">
          <p className="text-sm text-foreground">{steps[step]}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep} disabled={step === 0}>Previous</Button>
          <Button onClick={nextStep} disabled={step === steps.length - 1}>Next</Button>
        </div>
      </div>
      {c.reflection_questions && c.reflection_questions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-display text-foreground uppercase tracking-wider">Reflection Questions</h4>
          <div className="space-y-2">
            {c.reflection_questions.map((q: string, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-foreground">{q}</p>
                <textarea placeholder="Your reflection..." rows={2} className="mt-1" onChange={(e) => setAnswers(a => { const a2 = [...a]; a2[i] = e.target.value; return a2; })} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AssessmentRunner({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  const questions = c.questions || [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const allAnswered = questions.length > 0 && questions.every((q: any) => answers[q.id]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/40 bg-card/40 p-5">
        <h3 className="text-lg font-display text-foreground mb-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{questions.length} questions</p>
        <div className="space-y-4">
          {questions.map((q: any) => (
            <div key={q.id} className="space-y-2">
              <p className="text-sm text-foreground">{q.prompt}</p>
              <div className="flex flex-wrap gap-2">
                {(q.options || []).map((opt: any) => (
                  <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt.value }))} className={`px-3 py-1.5 rounded-lg text-xs transition ${answers[q.id] === opt.value ? "bg-primary text-primary-foreground" : "bg-muted/30 text-foreground hover:bg-muted/50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button onClick={() => setSubmitted(true)} disabled={!allAnswered || submitted}>
            {submitted ? "Submitted" : "Submit"}
          </Button>
        </div>
        {submitted && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10">
            <p className="text-xs text-foreground">Assessment complete. Your results have been recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PodcastPlayer({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  const [playing, setPlaying] = useState(false);

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={() => setPlaying(!playing)} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition shrink-0">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display text-foreground truncate">{item.title}</p>
          <p className="text-[11px] text-muted-foreground">{c.duration_minutes || item.duration_minutes} min</p>
        </div>
        <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full" style={{ width: playing ? "35%" : "0%" }} />
      </div>
      {c.show_notes && <p className="text-xs text-muted-foreground leading-relaxed">{c.show_notes}</p>}
    </div>
  );
}

export function ToolWidget({ item }: { item: any }) {
  const c = (item.content || {}) as Record<string, any>;
  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-5 space-y-3">
      <h3 className="text-lg font-display text-foreground mb-1">{item.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{c.tool_type} tool</p>
      <div className="p-4 rounded-lg bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Interactive widget: {c.tool_type}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Widget renders here in production</p>
      </div>
      {Array.isArray(c.features) && c.features.length > 0 && (
        <div className="space-y-1">
          {c.features.map((f: string, i: number) => (
            <p key={i} className="text-xs text-muted-foreground">• {f}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentRenderer({ item }: { item: any }) {
  if (!item) return null;
  const type = item.type;
  if (type === "game") return <GamePlayer item={item} />;
  if (type === "program") return <ProgramViewer item={item} />;
  if (type === "journaling") return <JournalingWriter item={item} />;
  if (type === "meditation") return <MeditationPlayer item={item} />;
  if (type === "self_inquiry") return <SelfInquiryGuide item={item} />;
  if (type === "assessment") return <AssessmentRunner item={item} />;
  if (type === "podcast") return <PodcastPlayer item={item} />;
  if (type === "tool") return <ToolWidget item={item} />;
  return null;
}
