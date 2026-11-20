// Generate a single rich wisdom paragraph drawn from a vast pool of traditions:
// Vedas, Upanishads, Puranas, Shastras, Bhagavad Gita, Yoga Sutras, Ramayana,
// Mahabharata, Buddhist suttas, Zen, Sufi, Tao, Stoicism, modern psychology,
// neuroscience, somatic science, contemplative observation, self-inquiry.
//
// Returns: { source, tradition, paragraph, study_seed }
// study_seed is the conversation opener passed to the Elder Wisdom Mode.

import { aiGatewayFetchWithLang } from "../_shared/ai-config.ts";
import { getBillingFromReq } from "../_shared/billing-from-req.ts";
import { languageName } from "../_shared/language.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReqBody {
  journeyDay?: number;
  themeTitle?: string;
  themeDescription?: string;
  vLevel?: number;
  activeLoops?: string[];
  language?: string;
}

const TRADITION_POOL = [
  "Bhagavad Gita",
  "Upanishads (Isha, Kena, Katha, Mandukya, Mundaka, Brihadaranyaka, Chandogya)",
  "Yoga Sutras of Patanjali",
  "Vivekachudamani (Adi Shankara)",
  "Ashtavakra Gita",
  "Ribhu Gita",
  "Tripura Rahasya",
  "Vishnu Purana",
  "Bhagavata Purana",
  "Shiva Purana",
  "Devi Bhagavatam",
  "Skanda Purana",
  "Garuda Purana",
  "Hatha Yoga Pradipika",
  "Vijnana Bhairava Tantra",
  "Shiva Sutras (Kashmir Shaivism)",
  "Spanda Karikas",
  "Pratyabhijna Hridayam",
  "Ramayana (Yuddha & Aranya Kanda teachings)",
  "Mahabharata (Vidura Niti, Yaksha Prashna, Anugita)",
  "Yoga Vasistha",
  "Tirukkural",
  "Thirumandiram",
  "Avadhuta Gita",
  "Ribhu's silent teachings",
  "Ramana Maharshi (Who Am I?, Talks)",
  "Nisargadatta Maharaj (I Am That)",
  "Sri Aurobindo (Life Divine, Synthesis of Yoga)",
  "Swami Vivekananda (Raja, Karma, Bhakti, Jnana Yoga)",
  "Buddha — Pali Suttas (Satipatthana, Anapanasati)",
  "Dhammapada",
  "Heart Sutra & Diamond Sutra",
  "Zen koans (Hekiganroku, Mumonkan)",
  "Dogen — Shobogenzo",
  "Tao Te Ching (Lao Tzu)",
  "Chuang Tzu",
  "Rumi (Masnavi)",
  "Hafiz",
  "Kabir doha",
  "Mirabai bhajans",
  "Tulsidas — Ramcharitmanas",
  "Guru Granth Sahib",
  "Stoic philosophy (Marcus Aurelius, Epictetus)",
  "Modern neuroscience of attention & default-mode-network",
  "Polyvagal theory (Stephen Porges)",
  "Interpersonal neurobiology (Dan Siegel)",
  "Somatic experiencing (Peter Levine)",
  "Cognitive science of metacognition",
  "Contemplative psychology (Tara Brach, Jack Kornfield)",
  "Behavioral psychology — habit loops",
  "Carl Jung — shadow & individuation",
  "Modern self-inquiry (Adyashanti, Mooji, Rupert Spira)",
  "Krishnamurti — choiceless awareness",
  "Direct observation of body, breath, thought",
];

function pickTradition(seed: number): string {
  return TRADITION_POOL[seed % TRADITION_POOL.length];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: ReqBody = await req.json().catch(() => ({}));
    const {
      journeyDay = 1,
      themeTitle = "Conscious Living",
      themeDescription = "",
      vLevel = 1,
      activeLoops = [],
      language = "en",
    } = body;

    // Rotate the source by journeyDay so users get variety across the spectrum.
    const tradition = pickTradition((journeyDay * 7 + (themeTitle?.length || 0)) % TRADITION_POOL.length);

    const systemPrompt = `You are a wise transmitter of timeless wisdom inside HOPE.

Your role: deliver ONE single paragraph of teaching (90-140 words) drawn from the
specified tradition. The paragraph must feel like a living voice — direct, warm,
grounded — never academic, never preachy.

Rules:
- Exactly ONE paragraph. No headings. No lists. No quotes around the text.
- 90-140 words. Vivid, concrete, second-person ("you").
- Anchor in real life — not abstract spirituality.
- Connect subtly to today's theme without restating it.
- End with a quiet invitation to notice something in lived experience.
- Do NOT mention the tradition name in the paragraph (it appears as attribution separately).
- Language: respond entirely in ${languageName(language)} (code: "${language}").
- After the paragraph, return a one-line "study_seed" — the opening question or
  framing the user can ask the Elder to study this teaching deeper.

Today's context:
- Journey day: ${journeyDay}
- Theme: "${themeTitle}"${themeDescription ? ` — ${themeDescription}` : ""}
- V-Level: ${vLevel}
- Active loops: ${activeLoops.length ? activeLoops.slice(0, 3).join(", ") : "none flagged"}
- Source tradition (your voice, do not name it): ${tradition}`;

    const userPrompt = `Generate today's wisdom paragraph + study_seed.`;

    const __billing = await getBillingFromReq(req, "generate-wisdom");
    const aiResp = await aiGatewayFetchWithLang(req, {
        model: "tier:fast",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "deliver_wisdom",
              description: "Return one wisdom paragraph and a study seed.",
              parameters: {
                type: "object",
                properties: {
                  paragraph: { type: "string", description: "90-140 words, single paragraph." },
                  study_seed: { type: "string", description: "One-line opener for the Elder conversation." },
                },
                required: ["paragraph", "study_seed"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deliver_wisdom" } },
      }, {}, __billing ?? undefined);

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      throw new Error("AI gateway error");
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : {};

    const paragraph: string = args.paragraph?.trim() ||
      "Right now, beneath the noise of the mind, something is quietly aware. It does not argue, it does not insist — it simply watches the breath rise, the thoughts pass, the body shift. Today, instead of solving anything, return to that quiet watcher. It has been waiting your whole life.";
    const study_seed: string = args.study_seed?.trim() ||
      `Help me study this teaching from the perspective of ${tradition}.`;

    return new Response(
      JSON.stringify({
        paragraph,
        study_seed,
        tradition,
        source: tradition,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-wisdom error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        paragraph:
          "Right now, beneath the noise of the mind, something is quietly aware. It does not argue, it does not insist — it simply watches the breath rise, the thoughts pass, the body shift. Today, instead of solving anything, return to that quiet watcher. It has been waiting your whole life.",
        study_seed: "Help me study the nature of awareness today.",
        tradition: "Direct observation",
        source: "Direct observation",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
