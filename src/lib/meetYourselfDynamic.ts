/**
 * meetYourselfDynamic.ts — adaptive expansion engine for the 12-chamber ritual.
 *
 * Base: 56 questions across 12 chambers.
 * This module adds CONDITIONAL follow-up questions based on earlier answers,
 * targeting 80–110 total questions depending on the user's unique path.
 *
 * All added questions write to existing derived layers. No new layers needed.
 */

import type { Chamber, Question, PathSlug } from "@/data/onboarding/soulChambers";

type Answers = Record<string, unknown>;

// ─── Branch helpers ─────────────────────────────────────────────────────────

function has(answers: Answers, ...ids: string[]) {
  return ids.some(id => answers[id] != null);
}

function val<T>(answers: Answers, id: string, fallback?: T): T | undefined {
  return answers[id] != null ? answers[id] : fallback;
}

function pick(answers: Answers, id: string, options: string[]): string | undefined {
  const v = answers[id];
  if (Array.isArray(v)) return v.find(x => options.includes(x));
  return options.includes(v) ? v : undefined;
}

// ─── Conditional question factories ─────────────────────────────────────────

function digitalWelllifeQuestions(answers: Answers): Question[] {
  const screenHours = Number(val(answers, "screen_hours", 0));
  if (screenHours < 8) return [];
  return [
    { id: "dw_1", kind: "single", writesTo: "surface",
      prompt: "When the screen is off — what's the first thing you feel?",
      options: [
        { value: "relief",   label: "Relief — like I set something heavy down" },
        { value: "anxiety",  label: "Anxiety — the quiet gets loud fast" },
        { value: "emptiness",label: "Emptiness — like I don't know what to do with myself" },
        { value: "peace",   label: "Peace — I barely notice" },
        { value: "urge",    label: "Urge — I reach for it again within minutes" },
      ] },
    { id: "dw_2", kind: "single", writesTo: "surface",
      prompt: "What does your phone know about you that your closest friend doesn't?",
      options: [
        { value: "what_i_avoid",   label: "What I'm actually avoiding" },
        { value: "my_real_mood",   label: "My real mood, not the curated one" },
        { value: "my_shame",       label: "Things I'm ashamed of searching for" },
        { value: "my_dreams",      label: "What I secretly want, late at night" },
        { value: "nothing",        label: "Honestly, nothing — it's just a tool" },
      ] },
    { id: "dw_3", kind: "scale5", writesTo: "surface",
      prompt: "How often does scrolling happen without you choosing it?",
      minLabel: "Rarely — I choose each session", maxLabel: "Almost always — my thumb decides" },
    { id: "dw_4", kind: "text", writesTo: "surface",
      prompt: "One app you open when you don't want to feel what you're feeling.",
      placeholder: "The honest one…" },
  ];
}

function loopDepthQuestions(answers: Answers): Question[] {
  const dominant = val<string>(answers, "loops_dominant", "");
  const severity = Number(val(answers, "loops_severity", 3));
  if (severity < 3 && !dominant) return [];

  const loopSpecific: Record<string, Question[]> = {
    "self-inquiry": [
      { id: "li_1", kind: "single", writesTo: "psychological",
        prompt: "When 'who am I?' loops — do you land on an answer or spin?",
        options: [
          { value: "spin",     label: "Spin — more questions, never an answer" },
          { value: "land",     label: "Land on something — even if it feels fragile" },
          { value: "flee",     label: "Flee — change the subject or open a screen" },
          { value: "surrender",label: "Surrender — the question eats itself and goes quiet" },
          { value: "weep",     label: "Something breaks open and I don't have words" },
        ] },
      { id: "li_2", kind: "text", writesTo: "psychological",
        prompt: "The closest you've come to an answer — what was it?",
        placeholder: "Even one line…" },
    ],
    "observation": [
      { id: "ob_1", kind: "single", writesTo: "psychological",
        prompt: "When emotion swallows you — how long before you notice?",
        options: [
          { value: "during",  label: "During — I catch myself mid-storm" },
          { value: "after",   label: "After — the wreckage tells me what happened" },
          { value: "never",   label: "I often don't — someone else has to tell me" },
          { value: "before",  label: "Before — I feel the ripple before the wave" },
          { value: "become",  label: "I become it so completely there's no 'me' to catch" },
        ] },
      { id: "ob_2", kind: "single", writesTo: "psychological",
        prompt: "Which emotion takes you the fastest?",
        options: [
          { value: "rage",   label: "Rage — sharp, immediate" },
          { value: "grief",  label: "Grief — heavy, slow, then total" },
          { value: "fear",   label: "Fear — the room contracts" },
          { value: "shame",  label: "Shame — I disappear" },
          { value: "joy",    label: "Joy — actually joy, and it scares me" },
        ] },
    ],
    "willpower": [
      { id: "wp_1", kind: "single", writesTo: "psychological",
        prompt: "When you break a vow — what's the actual moment?",
        options: [
          { value: "tired",    label: "I'm tired / depleted" },
          { value: "urge",     label: "A strong urge hits and I don't pause" },
          { value: "meaningless",label:"The vow starts feeling pointless" },
          { value: "rebellion", label: "A small voice says 'fuck it' — and I listen" },
          { value: "forget",   label: "I genuinely forget I made one" },
        ] },
      { id: "wp_2", kind: "text", writesTo: "psychological",
        prompt: "One vow you broke recently that still stings.",
        placeholder: "Honest…" },
    ],
    "focus": [
      { id: "fc_1", kind: "single", writesTo: "psychological",
        prompt: "When you sit to focus — what hijacks you first?",
        options: [
          { value: "phone",   label: "The phone — before I even start" },
          { value: "worry",   label: "A worry loop about something else" },
          { value: "planning",label: "Planning what comes next" },
          { value: "restlessness",label:"Physical restlessness — the body won't sit" },
          { value: "blank",   label: "Genuine blankness — the mind is empty and I can't use it" },
        ] },
      { id: "fc_2", kind: "slider", writesTo: "psychological",
        prompt: "Longest you've held one thought without distraction this week?",
        min: 0, max: 60, minLabel: "0 min", maxLabel: "1 hour" },
    ],
    "witchcraft": [
      { id: "wc_1", kind: "single", writesTo: "psychological",
        prompt: "When life happens TO you — what's your first move?",
        options: [
          { value: "freeze",  label: "Freeze — can't think, can't act" },
          { value: "please",  label: "People-please to make it safe again" },
          { value: "control", label: "Grab control of something, anything" },
          { value: "blame",   label: "Blame — myself or someone else" },
          { value: "dissociate",label:"Dissociate — leave the room mentally" },
        ] },
      { id: "wc_2", kind: "text", writesTo: "psychological",
        prompt: "A moment you felt truly powerful — describe it in one line.",
        placeholder: "Even a small one…" },
    ],
    "psychological": [
      { id: "ps_1", kind: "single", writesTo: "psychological",
        prompt: "Which groove feels most familiar?",
        options: [
          { value: "people_please",  label: "People-pleasing — I shape myself around what you need" },
          { value: "doom_scroll",    label: "Doom-scrolling — I can't look away from what's wrong" },
          { value: "control",        label: "Control — if I manage everything, nothing hurts me" },
          { value: "compare",        label: "Comparison — I measure my life against your highlight reel" },
          { value: "perfection",     label: "Perfection — my worth = my output" },
          { value: "numb",           label: "Numbing out — anything to not feel" },
        ] },
      { id: "ps_2", kind: "text", writesTo: "psychological",
        prompt: "One thing you do that you know isn't serving you — but you do it anyway.",
        placeholder: "The honest one…" },
    ],
  };

  const questions = loopSpecific[dominant] ?? [
    { id: "gen_loop_1", kind: "text", writesTo: "psychological",
      prompt: "Describe the loop in your own words — what does it feel like from the inside?",
      placeholder: "As specifically as you can…" },
    { id: "gen_loop_2", kind: "single", writesTo: "psychological",
      prompt: "When does it arrive most reliably?",
      options: [
        { value: "morning",  label: "First thing in the morning" },
        { value: "evening",  label: "Evening — when the day's armor comes off" },
        { value: "social",   label: "Around other people" },
        { value: "alone",    label: "When I'm alone" },
        { value: "night",    label: "At night, before sleep" },
      ] },
  ];

  return questions;
}

function doorwayDepthQuestions(answers: Answers): Question[] {
  const doorway = val<Record<string, number>>(answers, "doorway_scores", {});
  if (!doorway || Object.keys(doorway).length === 0) return [];

  const sorted = Object.entries(doorway).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const top = sorted[0];
  const second = sorted[1];

  // If scores are close (within 1), ask a differentiation question
  if (top && second && (top[1] - second[1]) <= 1) {
    return [
      { id: "dd_close_1", kind: "single", writesTo: "doorway",
        prompt: `Your two closest doorways are ${top[0]} and ${second[0]}. When you actually show up for yourself — which one are you doing?`,
        options: [
          { value: top[0],    label: `${top[0]} — even when I say I'm doing the other` },
          { value: second[0], label: `${second[0]} — that's where I actually land` },
          { value: "both",    label: "Both — they're the same thing wearing different clothes" },
          { value: "neither", label: "Neither — I'm just showing up. The doorway finds me." },
        ] },
    ];
  }

  // If one doorway is dominant, ask depth calibration
  const path = top?.[0] as PathSlug | undefined;
  if (!path) return [];

  const pathDepth: Record<string, Question[]> = {
    bhakti: [
      { id: "dd_bhakti", kind: "single", writesTo: "doorway",
        prompt: "When devotion rises — toward what, exactly?",
        options: [
          { value: "form",     label: "A form — a deity, a person, an image" },
          { value: "quality",  label: "A quality — love, surrender, beauty" },
          { value: "unknown",  label: "Something I can't name — I just weep" },
          { value: "life",     label: "Life itself — the trees, the strangers, the mess" },
          { value: "silence",  label: "The silence behind the name" },
        ] },
    ],
    jnana: [
      { id: "dd_jnana", kind: "single", writesTo: "doorway",
        prompt: "When clarity hits — what form does it take?",
        options: [
          { value: "insight",  label: "A clean insight — the fog lifts" },
          { value: "question", label: "A question that opens more than it closes" },
          { value: "silence",  label: "Wordless — the mind stops and something else speaks" },
          { value: "paradox",  label: "I hold two opposite truths at once" },
          { value: "knowing",  label: "I know without knowing how" },
        ] },
    ],
    karma: [
      { id: "dd_karma", kind: "single", writesTo: "doorway",
        prompt: "When your hands are doing the work — what's moving them?",
        options: [
          { value: "duty",    label: "Duty — it needs to be done" },
          { value: "love",    label: "Love for the person receiving it" },
          { value: "flow",    label: "Flow — I lose myself in the doing" },
          { value: "offering",label: "Offering — this is for something larger than me" },
          { value: "escape",  label: "Honestly? So I don't have to feel anything" },
        ] },
    ],
    raja: [
      { id: "dd_raja", kind: "single", writesTo: "doorway",
        prompt: "When you sit still — what arrives first?",
        options: [
          { value: "calm",    label: "Calm — the mind settles quickly" },
          { value: "noise",   label: "Noise — every thought at once" },
          { value: "body",    label: "The body — aches, itches, tension" },
          { value: "emotion", label: "Emotion — things I've been holding surface" },
          { value: "nothing", label: "Nothing — genuine emptiness, not even boredom" },
        ] },
    ],
    tantra: [
      { id: "dd_tantra", kind: "single", writesTo: "doorway",
        prompt: "When you feel most alive — where is it in the body?",
        options: [
          { value: "chest",  label: "Chest — the heart opens and I can't hide" },
          { value: "belly",  label: "Belly — something stirs and wants to be born" },
          { value: "throat", label: "Throat — I need to say what's true" },
          { value: "body",   label: "Everywhere — the whole body hums" },
          { value: "nowhere",label: "Nowhere — it's not in the body at all" },
        ] },
    ],
    shakti: [
      { id: "dd_shakti", kind: "single", writesTo: "doorway",
        prompt: "When power rises — what does it want?",
        options: [
          { value: "speak",  label: "To speak — the truth that's been stuck" },
          { value: "act",    label: "To act — something must change NOW" },
          { value: "protect",label: "To protect — someone or something needs me" },
          { value: "create",label: "To create — the thing won't let me rest" },
          { value: "release",label: "To release — the power IS the letting go" },
        ] },
    ],
  };

  return pathDepth[path] ?? [];
}

function shadowDepthQuestions(answers: Answers): Question[] {
  const loudest = val<string>(answers, "loudest_emotion", "");
  const denied = val<string>(answers, "denied_emotion", "");

  if (loudest === denied || !denied || denied === "none") return [];

  return [
    { id: "sd_1", kind: "single", writesTo: "shadow",
      prompt: `When ${denied.replace(/_/g, " ")} shows up — what do you do with it?`,
      options: [
        { value: "push",   label: "Push it down — fast, before anyone notices" },
        { value: "displace",label:"Displace it — snap at someone who doesn't deserve it" },
        { value: "numb",   label: "Numb it — food, screen, noise" },
        { value: "hide",   label: "Hide — I leave, I go quiet, I disappear" },
        { value: "project",label: "Project it — I see it everywhere except in me" },
      ] },
    { id: "sd_2", kind: "text", writesTo: "shadow",
      prompt: "If that denied emotion had a voice — what's the first thing it would say?",
      placeholder: "Without censoring…" },
    { id: "sd_3", kind: "single", writesTo: "shadow",
      prompt: "Who in your life gets to see that emotion?",
      options: [
        { value: "no_one",  label: "No one — ever" },
        { value: "one",     label: "One person, sometimes" },
        { value: "few",     label: "A few safe people" },
        { value: "everyone",label: "Most people — I don't hide it well" },
        { value: "only_me", label: "Only me — and even then, not always" },
      ] },
  ];
}

function longingDepthQuestions(answers: Answers): Question[] {
  const idealDay = val<string>(answers, "ideal_day", "");
  if (!idealDay || idealDay.length < 20) return [];

  return [
    { id: "ld_1", kind: "single", writesTo: "karmic",
      prompt: "In that ideal day — what are you NOT doing?",
      options: [
        { value: "performing", label: "Performing for others" },
        { value: "pleasing",   label: "People-pleasing / saying yes when I mean no" },
        { value: "proving",    label: "Proving my worth through output" },
        { value: "hiding",     label: "Hiding the real me to keep the peace" },
        { value: "rushing",    label: "Rushing — there's always urgency" },
        { value: "nothing",    label: "Nothing — the ideal day IS the absence of something" },
      ] },
    { id: "ld_2", kind: "text", writesTo: "karmic",
      prompt: "What's the smallest version of that ideal day you could live this week?",
      placeholder: "Not the full day — one piece of it…" },
  ];
}

function lifeStageQuestions(answers: Answers): Question[] {
  const stage = val<string>(answers, "life_stage", "");
  const stageSpecific: Record<string, Question[]> = {
    "parenting_young": [
      { id: "ls_1", kind: "single", writesTo: "surface",
        prompt: "When was the last time you were fully alone — no child, no task, no phone?",
        options: [
          { value: "today",  label: "Today" },
          { value: "week",   label: "This week" },
          { value: "month",  label: "This month" },
          { value: "cant",   label: "I honestly can't remember" },
        ] },
      { id: "ls_2", kind: "text", writesTo: "surface",
        prompt: "What did you give up to be a parent — and do you miss it?",
        placeholder: "Be honest — grief or relief, both count…" },
    ],
    "building": [
      { id: "ls_3", kind: "single", writesTo: "surface",
        prompt: "What would you build if you knew no one would judge the result?",
        options: [
          { value: "business", label: "A business — something that earns and means something" },
          { value: "art",      label: "Art — something that wasn't made to sell" },
          { value: "community",label: "A community — people gathered around something real" },
          { value: "knowledge",label: "Knowledge — a body of work that outlasts me" },
          { value: "nothing",  label: "Nothing — I just want to stop building for a while" },
        ] },
    ],
    "midlife_reckoning": [
      { id: "ls_4", kind: "single", writesTo: "surface",
        prompt: "What died in you that you haven't mourned?",
        options: [
          { value: "youth",    label: "Youth — not the age, the feeling of possibility" },
          { value: "love",     label: "A love that wasn't supposed to end" },
          { value: "career",   label: "The career I was supposed to have" },
          { value: "faith",    label: "Faith — in something, someone, myself" },
          { value: "nothing",  label: "Nothing has died — just quieting down" },
        ] },
    ],
    "post_career": [
      { id: "ls_5", kind: "single", writesTo: "surface",
        prompt: "What are you still carrying that you could put down?",
        options: [
          { value: "identity", label: "My work identity — who am I without the title?" },
          { value: "regret",   label: "Regret — things I didn't do" },
          { value: "purpose",  label: "The feeling that I should still be useful" },
          { value: "urgency",  label: "Urgency — the world kept moving and I didn't notice" },
          { value: "nothing",  label: "Nothing — this is the lightest I've felt" },
        ] },
    ],
  };

  return stageSpecific[stage] ?? [];
}

function vowDepthQuestions(answers: Answers): Question[] {
  const vow = val<string>(answers, "vow_text", "");
  const prep = val<string>(answers, "vow_prep_1", "");

  if (!vow || vow.length < 5) return [];

  const questions: Question[] = [
    { id: "vd_1", kind: "single", writesTo: "karmic",
      prompt: "When you read your vow back — what's the first thing you feel?",
      options: [
        { value: "resolve",  label: "Resolve — yes, this is true" },
        { value: "fear",     label: "Fear — can I actually keep this?" },
        { value: "grief",    label: "Grief — because I've broken things like this before" },
        { value: "dismiss",  label: "It feels small — almost trivial" },
        { value: "release",  label: "Release — like setting something down" },
      ] },
  ];

  if (prep === "stop" || prep === "meet") {
    questions.push(
      { id: "vd_2", kind: "text", writesTo: "karmic",
        prompt: "Who or what will try to stop you from keeping this vow?",
        placeholder: "Name it — inside or outside…" },
    );
  }

  if (prep === "give" || prep === "start") {
    questions.push(
      { id: "vd_3", kind: "single", writesTo: "karmic",
        prompt: "Who benefits when you keep this vow?",
        options: [
          { value: "me",       label: "Me — this is selfish and I own that" },
          { value: "family",   label: "My family — they get a better version of me" },
          { value: "someone",  label: "One specific person" },
          { value: "everyone", label: "Everyone around me — I'm calmer, kinder" },
          { value: "larger",   label: "Something larger — I can't name it" },
        ] },
    );
  }

  return questions;
}

function bandDepthQuestions(answers: Answers): Question[] {
  const minutes = Number(val(answers, "band_minutes", 10));
  const tempo = val<string>(answers, "band_tempo", "");

  if (minutes > 45) {
    return [
      { id: "bd_1", kind: "single", writesTo: "band",
        prompt: "With that much time — what does a real session look like?",
        options: [
          { value: "sit",     label: "Long sit — stillness first" },
          { value: "body",    label: "Movement first — yoga, walk, breathwork" },
          { value: "study",   label: "Study — texts, teachings, philosophy" },
          { value: "service", label: "Service — making something, caring for something" },
          { value: "mix",     label: "Mix — all of the above in some order" },
        ] },
    ];
  }

  if (tempo === "gentle") {
    return [
      { id: "bd_2", kind: "single", writesTo: "band",
        prompt: "Gentle means sustainable. What's the one thing you'd actually do at 6 a.m. sleepy, no fanfare?",
        options: [
          { value: "breathe", label: "Three conscious breaths before my feet hit the floor" },
          { value: "gratitude", label: "One thing I'm grateful for — while still in bed" },
          { value: "water",   label: "Drink water in silence — no phone for 5 minutes" },
          { value: "body",    label: "Stretch for 2 minutes — feel the spine" },
          { value: "vow",     label: "Say the vow out loud — that's the whole practice" },
        ] },
    ];
  }

  if (tempo === "fierce" || tempo === "monastic") {
    return [
      { id: "bd_3", kind: "single", writesTo: "band",
        prompt: "What are you actually willing to sacrifice for this?",
        options: [
          { value: "sleep",   label: "Sleep — I'll rise earlier" },
          { value: "social",  label: "Social time — the evenings become practice" },
          { value: "comfort", label: "Physical comfort — the body will adapt" },
          { value: "output",  label: "Work output — something has to give" },
          { value: "nothing", label: "I won't sacrifice anything — it has to fit the life" },
        ] },
    ];
  }

  return [];
}

function councilDepthQuestions(answers: Answers): Question[] {
  const chosen = Array.isArray(answers["council_choose"]) ? answers["council_choose"] : [];
  if (chosen.length === 0) return [];

  // If they chose exactly one, ask why
  if (chosen.length === 1) {
    return [
      { id: "cd_1", kind: "text", writesTo: "council",
        prompt: `What did ${chosen[0]} say that made you say yes?`,
        placeholder: "One line…" },
    ];
  }

  // If they chose multiple, ask which is the first voice
  if (chosen.length > 1) {
    return [
      { id: "cd_2", kind: "single", writesTo: "council",
        prompt: "When everything falls apart — which voice do you hear first?",
        options: chosen.map(c => ({ value: c, label: c })),
      },
    ];
  }

  return [];
}

function witnessDepthQuestions(answers: Answers): Question[] {
  const gap = Number(val(answers, "witness_gap_breath", 0));
  const thought = Number(val(answers, "witness_thought_as_thought", 0));
  const emotion = Number(val(answers, "witness_sit_with_emotion", 0));
  const avg = (gap + thought + emotion) / 3;

  // Low witness baseline → probe more
  if (avg <= 2) {
    return [
      { id: "wd_1", kind: "single", writesTo: "witness",
        prompt: "Right now — is there any space between you and the thought 'I am stressed'?",
        options: [
          { value: "none",    label: "No space — I AM the stress" },
          { value: "tiny",    label: "Tiny — I notice it after the fact" },
          { value: "some",    label: "Some — I can watch it pass" },
          { value: "clear",   label: "Clear — the stress is here, but so am I, separately" },
        ] },
      { id: "wd_2", kind: "text", writesTo: "witness",
        prompt: "When have you stepped OUT of yourself — even for a second?",
        placeholder: "Watching yourself from outside, like a movie…" },
    ];
  }

  // High witness baseline → probe depth
  if (avg >= 4) {
    return [
      { id: "wd_3", kind: "single", writesTo: "witness",
        prompt: "When you sit — what's left when the thoughts stop?",
        options: [
          { value: "nothing",  label: "Nothing — genuine emptiness" },
          { value: "presence", label: "Presence — a felt sense of being here" },
          { value: "light",    label: "Light — sometimes warmth, sometimes just space" },
          { value: "sound",    label: "Sound — the silence hums" },
          { value: "fear",     label: "Fear — the emptiness scares me" },
        ] },
    ];
  }

  return [];
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function computeDynamicQuestions(
  baseChambers: Chamber[],
  answers: Answers,
): { chamber: Chamber; questions: Question[] }[] {
  const expansions: Record<string, Question[]> = {};

  // Chamber 2 conditional
  expansions["ch2_life"] = [
    ...digitalWelllifeQuestions(answers),
    ...lifeStageQuestions(answers),
  ];

  // Chamber 3 conditional (need dominant_loop from chamber 3)
  if (has(answers, "dominant_loop")) {
    expansions["ch3_loops"] = loopDepthQuestions(answers);
  }

  // Chamber 4 conditional
  if (has(answers, "ideal_day")) {
    expansions["ch4_longing"] = longingDepthQuestions(answers);
  }

  // Chamber 5 conditional (need doorway_scores)
  if (has(answers, "closest_to_god", "how_learn", "trust_more")) {
    expansions["ch5_doorway"] = doorwayDepthQuestions(answers);
  }

  // Chamber 6 conditional
  if (has(answers, "denied_emotion") && val<string>(answers, "denied_emotion", "") !== "none") {
    expansions["ch6_shadow"] = shadowDepthQuestions(answers);
  }

  // Chamber 7 conditional
  if (has(answers, "vow_text") && val<string>(answers, "vow_text", "").length >= 5) {
    expansions["ch7_vow"] = vowDepthQuestions(answers);
  }

  // Chamber 10 conditional
  if (has(answers, "band_minutes", "band_tempo")) {
    expansions["ch10_band"] = bandDepthQuestions(answers);
  }

  // Chamber 11 conditional
  if (has(answers, "council_choose")) {
    expansions["ch11_council"] = councilDepthQuestions(answers);
  }

  // Chamber 12 conditional
  if (has(answers, "witness_gap_breath", "witness_thought_as_thought", "witness_sit_with_emotion")) {
    expansions["ch12_witness"] = witnessDepthQuestions(answers);
  }

  // Merge expansions into the chambers
  const merged: { chamber: Chamber; questions: Question[] }[] = baseChambers.map(ch => {
    const key = `ch${ch.number}`;
    // Match expansion keys that start with this chamber number
    const extra = Object.entries(expansions)
      .filter(([k]) => k.startsWith(key))
      .flatMap(([, qs]) => qs);

    return {
      chamber: ch,
      questions: [...ch.questions, ...extra],
    };
  });

  return merged;
}

export function estimateTotalMinutes(merged: { chamber: Chamber; questions: Question[] }[]): number {
  // Base is chamber.estMinutes. Add ~1 min per extra question beyond base.
  return merged.reduce((sum, { chamber, questions }) => {
    const extra = questions.length - chamber.questions.length;
    return sum + chamber.estMinutes + Math.max(0, extra);
  }, 0);
}

export function countTotalQuestions(merged: { chamber: Chamber; questions: Question[] }[]): number {
  return merged.reduce((sum, { questions }) => sum + questions.length, 0);
}
