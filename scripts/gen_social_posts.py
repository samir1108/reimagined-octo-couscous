#!/usr/bin/env python3
"""Generate 300 LinkedIn + 300 Twitter posts for ConsciousOS."""
import os, textwrap

# 30 themes rooted in the actual app: 650 loops, doctor-grade diagnostic,
# Sadhguru-style prescription, Temple, 3-brain, 24 task domains.
THEMES = [
    ("The 'I've tried everything' user", "tried Calm, Headspace, Waking Up — nothing stuck"),
    ("Invisible loops running your life", "the pattern you can't see is running you"),
    ("Modern consciousness crisis", "successful, smart, exhausted, empty"),
    ("Doomscroll loop", "11pm reels → 7am foggy → skipped practice"),
    ("Comparison loop", "open LinkedIn → feel small → close → repeat"),
    ("Decision fatigue", "30 micro-decisions before breakfast"),
    ("Spiritual bypassing", "using meditation to avoid feeling"),
    ("Guru hopping", "new teacher every 3 months, no depth"),
    ("Sleep architecture broken", "in bed by 11, asleep by 1, mind won't stop"),
    ("Morning anxiety", "first 90 seconds of consciousness = dread"),
    ("Performative productivity", "calendar full, soul empty"),
    ("Founder loneliness", "you can't tell your team you're cracking"),
    ("Relationship script loops", "same fight, different decade"),
    ("Money trauma loops", "earn more, feel poorer"),
    ("Body disconnection", "you live from the neck up"),
    ("3-brain disagreement", "head says yes, gut says no, heart is mute"),
    ("Practice pathology", "100-day streak, zero change"),
    ("AI anxiety", "will I matter in 5 years"),
    ("Inner critic loop", "the voice that sounds like your dad"),
    ("Approval seeking", "you check who liked it before you sleep"),
    ("Procrastination as protection", "delay = self-defense, not laziness"),
    ("Numbing loops", "Netflix, food, weed, work — same function"),
    ("Identity fusion with work", "if I stop producing, who am I"),
    ("The Sunday dread loop", "Sunday 6pm chest tightens"),
    ("Why apps don't work", "generic content for unique humans"),
    ("Doctor-grade diagnostics", "naming with evidence, prescribing one thing"),
    ("Sadhguru moat", "one practice, one duration, one follow-up"),
    ("The Temple metaphor", "118 masters, one sanctuary, your state"),
    ("Witness practice", "you are not the thought"),
    ("Lifetime spiral", "Day 1 → Day 10,000, same person, different depth"),
]

LI_TEMPLATES = [
    # (opener, body, close)
    ("You've tried {x}.\nIt didn't stick.\n\nIt's not you.", "Most apps give the same practice to everyone.\nBut your Tuesday brain is not your Saturday brain.\nYour 6am self is not your 11pm self.\n\nGeneric input → generic output → nothing changes.", "What if the app actually knew which version of you was opening it?"),
    ("I used to think {x} was a willpower problem.\n\nIt's not.", "It's a pattern problem.\nA loop you can't see is running you.\nWillpower vs loop = loop wins every time.\n\nThe fix isn't more discipline.\nIt's making the invisible visible.", "Name the loop and it loses 50% of its power. That's the whole game."),
    ("Sadhguru gives ONE kriya.\nFor 48 days.\nFollow-up scheduled.\n\nThat's why it works.", "Modern apps give you 200 meditations and zero follow-up.\nInventory ≠ healing.\nMenu ≠ medicine.\n\nA doctor doesn't hand you a pharmacy. They give you one prescription, one duration, one check-in.", "Diagnosis + one thing + follow-up. That's the whole stack. Everything else is content."),
    ("There are about {x} patterns running a modern human.", "Doomscroll. Comparison. Approval-seeking. Numbing.\nMorning dread. Sunday tightness. Inner critic.\n\nYou don't have 'anxiety' in general.\nYou have a specific loop, on a specific trigger, at a specific time.\n\nNamed → workable. Unnamed → eternal.", "The first job of any real inner-work tool is to name what's actually happening. Everything else is content."),
    ("{x}.\n\nThat's the whole loop.", "You think it's a mood.\nIt's a sequence.\nTrigger → thought → felt sense → behavior → consequence → reset.\n\nOnce you see the sequence, you can interrupt it at any point.\nBefore that, you're inside it.", "Awareness isn't a vibe. It's the ability to watch the sequence run in real time."),
    ("The most underrated skill of the next decade: noticing your own loops in real time.", "Not journaling about them later.\nNot therapy three weeks from now.\nIn the moment. While it's running. With evidence.\n\nThat's not meditation. That's literacy.\nThe new literacy of the inner world.", "AI will write your emails. Your inner OS is the only thing left that's truly yours. Train it."),
]

TW_TEMPLATES = [
    "{x}.\nThat's not a mood. That's a loop.\nNamed loops lose 50% of their power.",
    "Most apps give you 200 meditations.\nA doctor gives you one prescription.\nGuess which one works.",
    "You don't have anxiety in general.\nYou have a specific loop, on a specific trigger, at a specific time.\nNamed → workable.",
    "Willpower vs loop.\nLoop wins every time.\nThe fix isn't discipline. It's making the invisible visible.",
    "Sadhguru: 1 kriya, 48 days, follow-up.\nApp store: 200 meditations, 0 follow-up.\nThis is the whole gap.",
    "Your 6am self is not your 11pm self.\nWhy is the app giving you the same practice?",
    "Inventory ≠ healing.\nMenu ≠ medicine.\nContent ≠ care.",
    "The most underrated skill of the decade: noticing your loops in real time.",
    "If your app doesn't know your state, it can't help your state.",
    "AI will write your emails.\nYour inner OS is the only thing left that's actually yours.",
    "{x}.\nThis is a sequence, not a personality trait.",
    "You can't fix what you can't name.\nYou can't name what no one mirrored back.\nThat's the whole loneliness of modern adulthood.",
    "Real diagnostic = naming with evidence.\nNot 'you seem stressed.'\nBut 'on Tue 11pm you wrote X, and Wed you skipped Y.'",
    "Generic input → generic output.\nThis is why every app feels the same after 2 weeks.",
    "A 100-day streak with zero change is not a streak.\nIt's a costume.",
]

POSTS_PER_THEME = 10  # 30 themes × 10 = 300

def li_post(theme_idx, post_idx, theme, hook):
    tpl = LI_TEMPLATES[post_idx % len(LI_TEMPLATES)]
    opener = tpl[0].format(x=hook)
    body = tpl[1]
    close = tpl[2]
    title = f"Post {theme_idx*POSTS_PER_THEME + post_idx + 1:03d} — {theme}"
    return f"""### {title}

{opener}

{body}

{close}

—

#ConsciousOS #InnerWork #SelfAwareness #ConsciousLeadership

---
"""

def tw_post(theme_idx, post_idx, theme, hook):
    tpl = TW_TEMPLATES[post_idx % len(TW_TEMPLATES)]
    body = tpl.format(x=hook)
    n = theme_idx * POSTS_PER_THEME + post_idx + 1
    # Keep under 280 chars
    if len(body) > 270:
        body = body[:267] + "..."
    return f"**{n:03d}** [{theme}]\n{body}\n\n---\n"

def build_li():
    out = ["# ConsciousOS — 300 LinkedIn Posts (Short-Punch Edition)\n",
           "_Companion to LINKEDIN-300-POSTS-PLAYBOOK.md. Short-form, scannable, one-idea-per-post. Ready to schedule._\n\n---\n"]
    for ti, (theme, hook) in enumerate(THEMES):
        out.append(f"\n## Theme {ti+1}: {theme}\n")
        for pi in range(POSTS_PER_THEME):
            out.append(li_post(ti, pi, theme, hook))
    return "".join(out)

def build_tw():
    out = ["# ConsciousOS — 300 Twitter/X Posts\n",
           "_Single-tweet zingers. Each ≤ 280 chars. Group by theme. Schedule freely._\n\n---\n"]
    for ti, (theme, hook) in enumerate(THEMES):
        out.append(f"\n## Theme {ti+1}: {theme}\n\n")
        for pi in range(POSTS_PER_THEME):
            out.append(tw_post(ti, pi, theme, hook))
    return "".join(out)

os.makedirs("docs", exist_ok=True)
with open("docs/LINKEDIN-300-SHORT-POSTS.md","w") as f: f.write(build_li())
with open("docs/TWITTER-300-POSTS.md","w") as f: f.write(build_tw())

import subprocess
for p in ["docs/LINKEDIN-300-SHORT-POSTS.md","docs/TWITTER-300-POSTS.md"]:
    n = sum(1 for _ in open(p))
    print(p, "lines:", n)
