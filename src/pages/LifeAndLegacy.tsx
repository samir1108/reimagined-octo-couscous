import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Calendar, Heart, Lock, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useLifeEvents,
  useUpsertLifeEvent,
  useDeleteLifeEvent,
  EVENT_TYPES,
  type LifeEvent,
} from "@/hooks/useLifeEvents";
import {
  useLegacyEntries,
  useGuardians,
  useUpsertLegacy,
  useUpsertGuardian,
  useDeleteGuardian,
  ENTRY_TYPES,
  RELEASE_CONDITIONS,
  type LegacyEntry,
  type Guardian,
} from "@/hooks/useLegacyVault";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { Textarea } from "@/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system";

/**
 * Pillar 3 + 5: Life Events (anniversaries the companion remembers)
 * + Legacy Vault (letters/wisdom/blessings + posthumous guardians).
 */
export default function LifeAndLegacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 backdrop-blur bg-background/70 border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/app" aria-label="Back">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-display">Life & Legacy</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              What the companion remembers · What you leave behind
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="events">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="events">
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> Events
            </TabsTrigger>
            <TabsTrigger value="legacy">
              <Heart className="w-3.5 h-3.5 mr-1.5" /> Legacy
            </TabsTrigger>
            <TabsTrigger value="guardians">
              <Lock className="w-3.5 h-3.5 mr-1.5" /> Guardians
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events"><LifeEventsPanel /></TabsContent>
          <TabsContent value="legacy"><LegacyPanel /></TabsContent>
          <TabsContent value="guardians"><GuardiansPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ----------------------------- Life Events ----------------------------- */
function LifeEventsPanel() {
  const { data: events = [] } = useLifeEvents();
  const upsert = useUpsertLifeEvent();
  const del = useDeleteLifeEvent();
  const [draft, setDraft] = useState<Partial<LifeEvent> | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        The companion will remember these dates and quietly hold space when they return.
        Birthdays, losses, anniversaries — moments that shape your year.
      </p>

      {!draft && (
        <Button onClick={() => setDraft({ is_recurring: true, emotional_weight: 5 })} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" /> Add a life event
        </Button>
      )}

      {draft && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-3"
        >
          <Input
            placeholder="Title (e.g., Dad's birthday)"
            value={draft.title ?? ""}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={draft.event_type ?? "other"}
              onValueChange={(v) => setDraft({ ...draft, event_type: v })}
            >
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={draft.event_date ?? ""}
              onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Anything you want me to remember about this day…"
            value={draft.description ?? ""}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={3}
          />
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground">
              Weight
              <input
                type="range"
                min={1}
                max={10}
                value={draft.emotional_weight ?? 5}
                onChange={(e) =>
                  setDraft({ ...draft, emotional_weight: Number(e.target.value) })
                }
                className="w-32"
              />
              <span className="w-5 text-right">{draft.emotional_weight ?? 5}</span>
            </label>
            <label className="flex items-center gap-1 text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.is_recurring ?? true}
                onChange={(e) => setDraft({ ...draft, is_recurring: e.target.checked })}
              />
              Yearly
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!draft.title || !draft.event_date || upsert.isPending}
              onClick={async () => {
                await upsert.mutateAsync(draft);
                setDraft(null);
              }}
            >
              Save
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2 pt-2">
        {events.length === 0 && !draft && (
          <p className="text-xs text-muted-foreground/70 text-center py-8 italic">
            No life events yet. Add the dates that shape your year.
          </p>
        )}
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-card/30 p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground/90">{e.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(e.event_date).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {e.is_recurring ? " · yearly" : ""} · weight {e.emotional_weight}
              </p>
              {e.description && (
                <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{e.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => del.mutate(e.id)}
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Legacy ----------------------------- */
function LegacyPanel() {
  const { data: entries = [] } = useLegacyEntries();
  const upsert = useUpsertLegacy();
  const [draft, setDraft] = useState<Partial<LegacyEntry> | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Letters, wisdom, blessings — kept here in your name. Released only on your terms.
      </p>

      {!draft && (
        <Button
          onClick={() => setDraft({ entry_type: "letter", release_condition: "on_request" })}
          className="w-full"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" /> Write something to leave behind
        </Button>
      )}

      {draft && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4 space-y-3"
        >
          <Select
            value={draft.entry_type ?? "letter"}
            onValueChange={(v) => setDraft({ ...draft, entry_type: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ENTRY_TYPES.map((t) => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Title"
            value={draft.title ?? ""}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
          {draft.entry_type === "letter" && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="To (name)"
                value={draft.recipient_name ?? ""}
                onChange={(e) => setDraft({ ...draft, recipient_name: e.target.value })}
              />
              <Input
                placeholder="Relationship"
                value={draft.recipient_relationship ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, recipient_relationship: e.target.value })
                }
              />
            </div>
          )}
          <Textarea
            placeholder="What you want to say…"
            value={draft.content ?? ""}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            rows={6}
          />
          <Select
            value={draft.release_condition ?? "on_request"}
            onValueChange={(v) => setDraft({ ...draft, release_condition: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RELEASE_CONDITIONS.map((t) => (
                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {draft.release_condition === "scheduled" && (
            <Input
              type="date"
              value={draft.release_date ?? ""}
              onChange={(e) => setDraft({ ...draft, release_date: e.target.value })}
            />
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!draft.title || !draft.content || upsert.isPending}
              onClick={async () => {
                await upsert.mutateAsync(draft);
                setDraft(null);
              }}
            >
              Seal
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2 pt-2">
        {entries.length === 0 && !draft && (
          <p className="text-xs text-muted-foreground/70 text-center py-8 italic">
            The vault is empty. Nothing here yet — and that's okay.
          </p>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="rounded-xl border border-border/40 bg-card/30 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-3 h-3 text-amber-400/70" />
              <p className="text-[10px] uppercase tracking-wider text-amber-400/70">
                {e.entry_type} · {e.release_condition.replace("_", " ")}
              </p>
            </div>
            <p className="text-sm font-medium text-foreground/90">{e.title}</p>
            {e.recipient_name && (
              <p className="text-[11px] text-muted-foreground">
                To {e.recipient_name}
                {e.recipient_relationship ? ` (${e.recipient_relationship})` : ""}
              </p>
            )}
            <p className="text-xs text-foreground/70 mt-1 line-clamp-2 italic">{e.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Guardians ----------------------------- */
function GuardiansPanel() {
  const { data: guardians = [] } = useGuardians();
  const upsert = useUpsertGuardian();
  const del = useDeleteGuardian();
  const [draft, setDraft] = useState<Partial<Guardian> | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground leading-relaxed">
        Trusted people who can be notified to receive your legacy entries — only when you've
        marked an entry to be released to them, or after you're gone.
      </p>

      {!draft && (
        <Button
          onClick={() => setDraft({ notify_on: "manual" })}
          className="w-full"
          variant="outline"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add a guardian
        </Button>
      )}

      {draft && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-3"
        >
          <Input
            placeholder="Name"
            value={draft.guardian_name ?? ""}
            onChange={(e) => setDraft({ ...draft, guardian_name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            value={draft.guardian_email ?? ""}
            onChange={(e) => setDraft({ ...draft, guardian_email: e.target.value })}
          />
          <Input
            placeholder="Relationship (e.g., sister, friend)"
            value={draft.relationship ?? ""}
            onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
          />
          <Textarea
            placeholder="Trust phrase — something only the two of you know (optional)"
            value={draft.trust_phrase ?? ""}
            onChange={(e) => setDraft({ ...draft, trust_phrase: e.target.value })}
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!draft.guardian_name || !draft.guardian_email || upsert.isPending}
              onClick={async () => {
                await upsert.mutateAsync(draft);
                setDraft(null);
              }}
            >
              Add
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2 pt-2">
        {guardians.length === 0 && !draft && (
          <p className="text-xs text-muted-foreground/70 text-center py-8 italic">
            No guardians yet.
          </p>
        )}
        {guardians.map((g) => (
          <div
            key={g.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-card/30 p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground/90">{g.guardian_name}</p>
              <p className="text-[11px] text-muted-foreground">
                {g.guardian_email}
                {g.relationship ? ` · ${g.relationship}` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => del.mutate(g.id)}
              aria-label="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
