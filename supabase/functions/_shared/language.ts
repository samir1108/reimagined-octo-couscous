// Shared language helper for all AI edge functions.
// Resolves the user's language from (in order):
//   1. explicit `language` in request body
//   2. profiles.bio JSON field { language: "xx" } via authed Supabase client
//   3. fallback "en"
// Then returns a strong instruction block to append to any system prompt.

import { createClient } from "./supabase-client.ts";

const NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी, Devanagari script)",
  "hi-Latn": "Hinglish (Hindi written in Roman/Latin script)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  bn: "Bengali (বাংলা)",
  mr: "Marathi (मराठी)",
  gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  or: "Odia (ଓଡ଼ିଆ)",
  ur: "Urdu (اردو)",
  sa: "Sanskrit (संस्कृतम्)",
  es: "Spanish (Español)",
  pt: "Portuguese (Português)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  it: "Italian (Italiano)",
  nl: "Dutch (Nederlands)",
  ru: "Russian (Русский)",
  uk: "Ukrainian (Українська)",
  pl: "Polish (Polski)",
  cs: "Czech (Čeština)",
  sv: "Swedish (Svenska)",
  no: "Norwegian (Norsk)",
  da: "Danish (Dansk)",
  fi: "Finnish (Suomi)",
  el: "Greek (Ελληνικά)",
  tr: "Turkish (Türkçe)",
  ar: "Arabic (العربية)",
  fa: "Persian (فارسی)",
  he: "Hebrew (עברית)",
  zh: "Chinese (中文)",
  "zh-TW": "Chinese Traditional (繁體中文)",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  th: "Thai (ไทย)",
  vi: "Vietnamese (Tiếng Việt)",
  id: "Indonesian (Bahasa Indonesia)",
  ms: "Malay (Bahasa Melayu)",
  tl: "Filipino",
  sw: "Swahili (Kiswahili)",
  am: "Amharic (አማርኛ)",
  ro: "Romanian (Română)",
  hu: "Hungarian (Magyar)",
  bg: "Bulgarian (Български)",
  sr: "Serbian (Српски)",
  hr: "Croatian (Hrvatski)",
  sk: "Slovak (Slovenčina)",
  ne: "Nepali (नेपाली)",
  si: "Sinhala (සිංහල)",
  my: "Burmese (မြန်မာ)",
  km: "Khmer (ខ្មែរ)",
  af: "Afrikaans",
  az: "Azerbaijani (Azərbaycanca)",
  be: "Belarusian (Беларуская)",
  ca: "Catalan (Català)",
  cy: "Welsh (Cymraeg)",
  eo: "Esperanto",
  et: "Estonian (Eesti)",
  eu: "Basque (Euskara)",
  ga: "Irish (Gaeilge)",
  gl: "Galician (Galego)",
  ha: "Hausa",
  haw: "Hawaiian (ʻŌlelo Hawaiʻi)",
  ht: "Haitian Creole (Kreyòl ayisyen)",
  hy: "Armenian (Հայերեն)",
  ig: "Igbo",
  is: "Icelandic (Íslenska)",
  jv: "Javanese (Jawa)",
  ka: "Georgian (ქართული)",
  kk: "Kazakh (Қазақша)",
  ku: "Kurdish (Kurdî)",
  ky: "Kyrgyz (Кыргызча)",
  la: "Latin (Latina)",
  lb: "Luxembourgish (Lëtzebuergesch)",
  lt: "Lithuanian (Lietuvių)",
  lv: "Latvian (Latviešu)",
  mg: "Malagasy",
  mi: "Maori (Te Reo Māori)",
  mk: "Macedonian (Македонски)",
  mn: "Mongolian (Монгол)",
  mt: "Maltese (Malti)",
  nb: "Norwegian Bokmål (Norsk bokmål)",
  nd: "North Ndebele (isiNdebele)",
  nn: "Norwegian Nynorsk (Nynorsk)",
  nr: "South Ndebele (isiNdebele)",
  nso: "Northern Sotho (Sesotho sa Leboa)",
  ny: "Chichewa",
  oc: "Occitan (Occitan)",
  om: "Oromo (Oromoo)",
  ps: "Pashto (پښتو)",
  qu: "Quechua (Runasimi)",
  rw: "Kinyarwanda (Ikinyarwanda)",
  sd: "Sindhi (سنڌي)",
  se: "Northern Sami (Davvisámegiella)",
  sg: "Sango (Sängö)",
  sh: "Serbo-Croatian (Srpskohrvatski)",
  sl: "Slovenian (Slovenščina)",
  sm: "Samoan (Gagana Samoa)",
  sn: "Shona (ChiShona)",
  so: "Somali (Soomaali)",
  sq: "Albanian (Shqip)",
  ss: "Swati (SiSwati)",
  st: "Sesotho (Sesotho)",
  su: "Sundanese (Basa Sunda)",
  tg: "Tajik (Тоҷикӣ)",
  ti: "Tigrinya (ትግርኛ)",
  tk: "Turkmen (Türkmen)",
  tn: "Setswana (Setswana)",
  to: "Tongan (Lea faka-Tonga)",
  ts: "Tsonga (Xitsonga)",
  tt: "Tatar (Татарча)",
  tum: "Tumbuka (ChiTumbuka)",
  ug: "Uyghur (ئۇيغۇرچە)",
  uz: "Uzbek (Oʻzbekcha)",
  ve: "Venda (Tshivenḓa)",
  vo: "Volapük",
  wa: "Walloon (Walon)",
  wo: "Wolof (Wolof)",
  xh: "Xhosa (isiXhosa)",
  yi: "Yiddish (ייִדיש)",
  yo: "Yoruba (Yorùbá)",
  yue: "Cantonese (粵語)",
  zu: "Zulu (isiZulu)",
};

export function languageName(code?: string): string {
  if (!code) return "English";
  return NAMES[code] || NAMES[code.split("-")[0]] || code;
}

export function buildLanguageInstruction(code?: string): string {
  const lang = (code || "en").trim();
  if (lang === "en" || lang === "en-US" || lang === "en-GB") {
    return `\n\n## LANGUAGE\nRespond ONLY in pure English. Do NOT mix Hindi, Hinglish, or any other language. Every single word must be English.`;
  }
  const name = languageName(lang);
  return `\n\n## LANGUAGE (CRITICAL — OVERRIDES ANY EARLIER LANGUAGE RULE)
You MUST respond ONLY in pure ${name} (BCP-47 code: "${lang}").
Every single word — including greetings and reflections — MUST be in ${name}.
Do NOT mix English. Do NOT use Hinglish unless the code is explicitly "hi-Latn".
Ignore any earlier "respond in English" instruction in this prompt — the user has selected "${lang}" as their app language and this rule wins.`;
}

/**
 * Resolve the user's preferred language.
 * Pass: req (for auth header), bodyLanguage (optional explicit override).
 * Returns BCP-47 code, defaulting to "en".
 */
export async function resolveUserLanguage(
  req: Request,
  bodyLanguage?: string,
): Promise<string> {
  if (bodyLanguage && typeof bodyLanguage === "string" && bodyLanguage.trim()) {
    return bodyLanguage.trim();
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return "en";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "en";
    const { data } = await supabase
      .from("profiles")
      .select("bio")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.bio) {
      try {
        const prefs = JSON.parse(data.bio);
        if (prefs?.language && typeof prefs.language === "string") {
          return prefs.language;
        }
      } catch { /* bio is plain text */ }
    }
  } catch { /* silent */ }
  return "en";
}
