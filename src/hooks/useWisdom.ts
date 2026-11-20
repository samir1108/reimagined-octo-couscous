import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface WisdomTeaching {
  id: string;
  title: string;
  source: string;
  teaching: string;
  interpretation: string;
  application: string;
  tradition: string;
}

export function useWisdom(userId?: string) {
  return useQuery<WisdomTeaching[]>({
    queryKey: ["wisdom", userId],
    queryFn: async () => {
      // Return curated wisdom teachings for now
      return [
        {
          id: "observation-1",
          title: "The Wisdom of Observation",
          source: "Yoga Sutras 1.2",
          teaching: "Yogas chitta vritti nirodhah — Yoga is the cessation of the fluctuations of the mind.",
          interpretation: "Before changing a reaction, learn to notice it. The space between stimulus and response is where freedom lives.",
          application: "Next time someone criticizes you, notice the heat rise. Don't argue. Don't suppress. Just notice: 'Ah, defensiveness is here.'",
          tradition: "Patanjali's Yoga Sutras",
        },
        {
          id: "impermanence-1",
          title: "The Teaching of Impermanence",
          source: "Dhammapada 277",
          teaching: "All conditioned things are impermanent. When one sees this with wisdom, one turns away from suffering.",
          interpretation: "Everything that arises passes. Thoughts, emotions, situations — none are permanent. Seeing this reduces clinging.",
          application: "When anxiety arises, remind yourself: 'This too is impermanent. It will pass, like all things.'",
          tradition: "Buddhist teachings",
        },
        {
          id: "self-inquiry-1",
          title: "Who Is Aware?",
          source: "Ramana Maharshi — Self-Enquiry",
          teaching: "The 'I' thought is the root of all thoughts. Trace it back to its source.",
          interpretation: "The one who notices is closer than the noticing. You are the awareness, not what you're aware of.",
          application: "Throughout the day, pause and ask: 'Who is aware right now?' Don't answer. Feel the question.",
          tradition: "Advaita Vedanta",
        },
      ] as WisdomTeaching[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 24,
  });
}