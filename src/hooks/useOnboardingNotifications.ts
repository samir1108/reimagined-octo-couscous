import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const ONBOARDING_NOTIFICATIONS: { title: string; body: string }[] = [
  // Week 1: WHY
  { title: "👁️ Day 1: The First Pattern", body: "Your mind will tell you this app is useless. That's the first pattern to observe." },
  { title: "🔁 Day 2: Notice the Resistance", body: "Did your mind resist opening this app today? That resistance IS the loop we're making visible." },
  { title: "🧘 Day 3: Discomfort = Progress", body: "If meditation felt pointless, your brain is working exactly as expected — resisting change. Keep going." },
  { title: "⚡ Day 4: Autopilot Alert", body: "How many hours today were on autopilot? Every moment you noticed — that's consciousness winning." },
  { title: "🫀 Day 5: Body vs. You", body: "Today, notice: the body feels sensations, but who is aware of them? That awareness is not the body." },
  { title: "🪤 Day 6: The Knowing Trap", body: "'I already know this' — the mind's favorite escape. Today, don't know. Experience." },
  { title: "🌅 Day 7: One Week In", body: "You showed up for 7 days in a world designed to keep you asleep. That's not small. That's revolutionary." },
  // Week 2: HOW
  { title: "🔄 Day 8: The Loop Machine", body: "95% of your thoughts today are the same as yesterday. Can you catch one loop repeating?" },
  { title: "🔁 Day 9: Emotional Loops", body: "Same trigger → same reaction → same result. Today, watch one emotional loop without feeding it." },
  { title: "🏚️ Day 10: Comfort Zone", body: "Your brain labels 'familiar' as 'safe' — even when familiar means stuck. Growth feels dangerous. Push through." },
  { title: "📱 Day 11: Dopamine Hijack", body: "How many times did you reach for your phone out of habit today? That pull is the trap we're breaking." },
  { title: "📖 Day 12: Your Stories", body: "What story did your mind tell you today? 'I'm not good enough'? 'I can't change'? Is it true, or just familiar?" },
  { title: "🚧 Day 13: Self-Sabotage", body: "If something good happened and you undermined it — that's the upper limit problem. Awareness is the cure." },
  { title: "🏗️ Day 14: Two Weeks", body: "14 days of showing up. Your brain is building new neural pathways. The foundation is being laid right now." },
  // Week 3: WHAT
  { title: "↔️ Day 15: The Gap", body: "The space between trigger and reaction is growing. That gap is your freedom expanding." },
  { title: "🧠 Day 16: Brain Rewiring", body: "Your brain is physically restructuring. Every moment of awareness today strengthened the new pathways." },
  { title: "⏱️ Day 17: 90 Seconds", body: "An emotion's biochemical life is 90 seconds. After that, it's the story keeping it alive. Let it pass." },
  { title: "🫀 Day 18: Body Intelligence", body: "Where did you feel today's strongest emotion in your body? The body is becoming a conscious instrument." },
  { title: "🌙 Day 19: Dream Signals", body: "Are your dreams more vivid? Your subconscious is processing the awareness you're building during the day." },
  { title: "👥 Day 20: Mirror Effect", body: "If someone says you seem different — calmer, more present — believe them. They see what you can't yet." },
  { title: "🚀 Day 21: The Threshold", body: "21 days. New neural pathways are forming. Awareness is starting to arise spontaneously. Feel the shift." },
  // Week 4: WHO
  { title: "👁️ Day 22: The Witness", body: "Who is watching your thoughts right now? That awareness behind the mind — that's the witness emerging." },
  { title: "📜 Day 23: Beyond the Past", body: "You are not your memories. Memories are reconstructions, not recordings. Who are you right NOW?" },
  { title: "🧩 Day 24: Three Brains", body: "Before decisions today, check all three: What does your head say? Your heart? Your gut?" },
  { title: "🌑 Day 25: Shadow Work", body: "What irritated you today in others? Look inward — that's your shadow asking to be integrated, not rejected." },
  { title: "🤫 Day 26: Silence Speaks", body: "Find even 30 seconds of genuine inner silence. It's not empty — it's full of a different kind of knowing." },
  { title: "⚛️ Day 27: Observer Effect", body: "By watching your patterns, you're changing them. Awareness is never passive — it's transformative." },
  { title: "🌐 Day 28: Integration", body: "Mind, body, awareness moving as one. The separation between practice and life is dissolving." },
  { title: "🔮 Day 29: Look Back", body: "Remember Day 1? The skepticism, the resistance? Compare that person to who you are now. The change is real." },
  { title: "🌅 Day 30: The Beginning", body: "30 days was the warm-up. You've built the foundation. Now the real journey of conscious living begins." },
];

/**
 * Seeds one onboarding notification per journey day (days 1-30).
 * Deduplicates by checking existing onboarding notifications for the user.
 */
export function useOnboardingNotifications(userId: string | undefined, journeyDay: number) {
  const seeded = useRef(false);

  useEffect(() => {
    if (!userId || journeyDay < 1 || journeyDay > 30 || seeded.current) return;
    seeded.current = true;

    const seedNotification = async () => {
      // Check if we already sent this day's onboarding notification
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "onboarding")
        .eq("title", ONBOARDING_NOTIFICATIONS[journeyDay - 1].title)
        .limit(1);

      if (existing && existing.length > 0) return;

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "onboarding",
        title: ONBOARDING_NOTIFICATIONS[journeyDay - 1].title,
        body: ONBOARDING_NOTIFICATIONS[journeyDay - 1].body,
      });
    };

    seedNotification();
  }, [userId, journeyDay]);
}
