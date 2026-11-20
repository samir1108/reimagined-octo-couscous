import re
from pathlib import Path

raw = Path(r"D:\final\sat-yug\scripts\session_steps_raw.txt").read_text(encoding="utf-8")

CATS = {
 "A": ("opening_preparation", "Session Opening & Preparation"),
 "B": ("attention_concentration", "Attention & Concentration"),
 "C": ("observation_witnessing", "Observation & Witnessing"),
 "D": ("self_inquiry", "Self-Inquiry"),
 "E": ("breath_regulation", "Breath & Regulation"),
 "F": ("body_awareness", "Body Awareness & Five Bodies"),
 "G": ("emotion_shadow", "Emotion & Shadow Work"),
 "H": ("karma_habits", "Karma, Habits & Behavioral Patterns"),
 "I": ("wisdom_knowledge", "Wisdom & Knowledge"),
 "J": ("jap_mantra", "Jap, Mantra & Contemplative Repetition"),
 "K": ("intention_willpower", "Intention, Willpower & Focus"),
 "L": ("relationships_life", "Relationships & Life Domains"),
 "M": ("creativity_visualization", "Creativity, Visualization & Future Self"),
 "N": ("silence_open_awareness", "Silence & Open Awareness"),
 "O": ("reflection_journaling", "Reflection, Journaling & Integration"),
 "P": ("session_closing", "Session Closing"),
}

entries = []
for line in raw.splitlines():
    line=line.strip()
    if not line or line.startswith("#"):
        continue
    parts = line.split("|", 3)
    if len(parts)!=4:
        continue
    cat, num, key, desc = [p.strip() for p in parts]
    if cat not in CATS:
        continue
    slug, label = CATS[cat]
    entries.append((int(num), key, slug, label, desc))

entries.sort(key=lambda e:e[0])

def ts_str(s):
    return '"'+s.replace("\\","\\\\").replace('"','\\"')+'"'

out = []
out.append("// AUTO-GENERATED from scripts/session_steps_raw.txt")
out.append("// Catalog of all session step types the ConsciousOS session engine can support.")
out.append("")
out.append("export type SessionStepCategoryId =")
for slug in sorted(set(CATS[c][0] for c in CATS)):
    out.append(f"  | {ts_str(slug)}")
out.append(";")
out.append("")
out.append("export interface SessionStepCategory {")
out.append("  id: SessionStepCategoryId;")
out.append("  label: string;")
out.append("  letter: string;")
out.append("}")
out.append("")
out.append("export const SESSION_STEP_CATEGORIES: SessionStepCategory[] = [")
for letter in "ABCDEFGHIJKLMNOP":
    slug,label = CATS[letter]
    out.append(f"  {{ id: {ts_str(slug)}, label: {ts_str(label)}, letter: {ts_str(letter)} }},")
out.append("];")
out.append("")
out.append("export interface SessionStepDefinition {")
out.append("  id: number;")
out.append("  key: string;")
out.append("  title: string;")
out.append("  category: SessionStepCategoryId;")
out.append("  categoryLabel: string;")
out.append("  description: string;")
out.append("}")
out.append("")
out.append("function titleCase(key: string): string {")
out.append("  return key.split('_').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ');")
out.append("}")
out.append("")
out.append("export const SESSION_STEP_CATALOG: SessionStepDefinition[] = [")
for num,key,slug,label,desc in entries:
    out.append(f"  {{ id: {num}, key: {ts_str(key)}, title: titleCase({ts_str(key)}), category: {ts_str(slug)}, categoryLabel: {ts_str(label)}, description: {ts_str(desc)} }},")
out.append("];")
out.append("")
out.append("export const SESSION_STEP_BY_KEY: Record<string, SessionStepDefinition> = Object.fromEntries(")
out.append("  SESSION_STEP_CATALOG.map(s => [s.key, s])")
out.append(");")
out.append("")
out.append("export const SESSION_STEP_BY_ID: Record<number, SessionStepDefinition> = Object.fromEntries(")
out.append("  SESSION_STEP_CATALOG.map(s => [s.id, s])")
out.append(");")
out.append("")
out.append("export function getStepsByCategory(cat: SessionStepCategoryId): SessionStepDefinition[] {")
out.append("  return SESSION_STEP_CATALOG.filter(s => s.category === cat);")
out.append("}")
out.append("")
out.append(f"export const SESSION_STEP_COUNT = {len(entries)};")
out.append("")

Path(r"D:\final\sat-yug\src\data\sessionStepCatalog.ts").write_text("\n".join(out), encoding="utf-8")
print("wrote", len(entries))
PYEOF_MARKER = None