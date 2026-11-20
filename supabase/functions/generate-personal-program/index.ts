/**
 * AI PERSONALIZED PROGRAM GENERATOR
 * Takes questionnaire results → generates custom 30-day program
 * "30 Days to Fix Your [Pattern] — Developed by AI + [Guide Name]"
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { aiGatewayFetchWithLang } from '../_shared/ai-config.ts';
import { getBillingFromReq } from '../_shared/billing-from-req.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Guide personality prompts for program generation
const GUIDE_PROGRAM_PROMPTS: Record<string, string> = {
  aarav: `You are Aarav, The Observer. Create a 30-day program using awareness practices: thought watching, neti neti, self-inquiry, silent sitting. Each day should help the user step back from their pattern and become the witness.`,
  veer: `You are Veer, The Kriya Master. Create a 30-day program using energy practices: pranayama, breath of fire, kriya sequences, focus drills. Each day should help the user move stuck energy and build discipline.`,
  dhruv: `You are Dhruv, The Body Yogi. Create a 30-day program using body practices: asanas, body scans, yoga nidra, stretching flows. Each day should help the user reconnect with their body.`,
  meera: `You are Meera, The Devotee. Create a 30-day program using heart practices: mantra chanting, loving-kindness, gratitude, emotional surrender. Each day should help the user open their heart safely.`,
  arjun: `You are Arjun, The Karma Yogi. Create a 30-day program using action practices: conscious action, discipline routines, detachment drills, service mindset. Each day should help the user act with awareness.`,
  aryan: `You are Aryan, The Neuroscientist. Create a 30-day program using brain practices: focus sprints, dopamine resets, habit design, attention training. Each day should be practical and evidence-based.`,
  mira: `You are Mira, The Psychologist. Create a 30-day program using psychology practices: journaling, emotional labeling, pattern recognition, shadow work. Each day should help the user see their patterns.`,
  rishi: `You are Rishi, The Philosopher. Create a 30-day program using inquiry practices: deep questioning, meaning exploration, perspective shifting, logical reflection. Each day should challenge assumptions.`,
  siddh: `You are Siddh, The Awakened One. Create a 30-day program using stillness practices: silent meditation, breath awareness, letting go, non-doing. Each day should help the user rest in awareness.`,
  leela: `You are Leela, The Divine Player. Create a 30-day program using play practices: spontaneity, joy cultivation, child's mind, dance. Each day should help the user lighten up.`,
  tara: `You are Tara, The Heart Healer. Create a 30-day program using healing practices: emotional release, forgiveness, inner child work, safe space visualization. Each day should be gentle and trauma-informed.`,
  anaya: `You are Anaya, The Breath Guide. Create a 30-day program using breath practices: 4-7-8 breathing, box breathing, slow breathing, physiological sigh. Each day should regulate the nervous system.`,
  kavya: `You are Kavya, The Life Architect. Create a 30-day program using integration practices: decision frameworks, goal clarity, habit stacking, energy audit. Each day should align life with purpose.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response("ok", { headers: corsHeaders });
  
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization' }), { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { questionnaireId, resultId, resultData, guideIds, scores } = await req.json();

    if (!questionnaireId || !resultId) {
      return new Response(JSON.stringify({ error: 'Missing questionnaire data' }), { status: 400 });
    }

    // Find the best guide based on recommendations
    const primaryGuide = guideIds?.[0] || 'aarav';
    const guidePrompt = GUIDE_PROGRAM_PROMPTS[primaryGuide] || GUIDE_PROGRAM_PROMPTS.aarav;

    // Build program generation prompt
    const prompt = `Create a personalized 30-day transformation program for someone who scored as "${resultData.title}" in the ${questionnaireId} assessment.

User's pattern: ${resultData.description}

This program should be developed by ${primaryGuide} and include:
- A program title that's specific to their pattern (e.g., "30 Days to Move From Head to Heart")
- A subtitle explaining the transformation
- Each of the 30 days should have:
  - Day number
  - A unique title for that day's theme
  - A short teaching (2-3 sentences) from the guide
  - A specific practice with duration
  - Whether it's a gentle day (every 5th day) or deeper work day
  - A chat prompt for reflection

Make it progressive:
- Days 1-7: Awareness — notice the pattern
- Days 8-14: Understanding — why the pattern exists
- Days 15-21: Experimentation — try new responses
- Days 22-30: Integration — make it natural

The guide should speak in their characteristic voice. Keep teachings short, practical, and compassionate. Include at least 5 gentle days (every 5th day) where the practice is very light.

Format the response as valid JSON with this structure:
{
  "title": "30 Days to...",
  "subtitle": "...",
  "guideId": "${primaryGuide}",
  "guideName": "...",
  "totalDays": 30,
  "dailyTimeMinutes": 15,
  "days": [
    {
      "day": 1,
      "title": "...",
      "teaching": "...",
      "practice": "...",
      "practiceDurationMinutes": 15,
      "isGentleDay": false,
      "chatPrompt": "..."
    }
  ]
}`;

    const __billing = await getBillingFromReq(req, "generate-personal-program");

    const response = await aiGatewayFetchWithLang(req, {
      model: 'tier:deep',
      messages: [
        { role: 'system', content: `You are a program designer working with ${primaryGuide}. Create practical, compassionate 30-day programs. Always respond with valid JSON only. No markdown, no explanation. Just the JSON object.` },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.8,
    }, {}, __billing ?? undefined);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI program generation failed' }), { status: 500 });
    }

    const data = await response.json();
    let programContent;

    try {
      // Extract JSON from response (in case there's markdown)
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      programContent = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      programContent = null;
    }

    if (!programContent) {
      return new Response(JSON.stringify({ error: 'Failed to generate program' }), { status: 500 });
    }

    // Save to database
    const { data: savedProgram, error } = await supabase
      .from('personalized_programs')
      .insert({
        user_id: user.id,
        questionnaire_id: questionnaireId,
        result_id: resultId,
        guide_id: primaryGuide,
        program_data: programContent,
        current_day: 1,
        is_active: true,
        is_complete: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save program:', error);
    }

    return new Response(JSON.stringify({
      program: programContent,
      programId: savedProgram?.id,
      guide: primaryGuide,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Program generation error:', error);
    return new Response(
      JSON.stringify({ error: 'The guide is preparing your program. Try again in a moment.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
