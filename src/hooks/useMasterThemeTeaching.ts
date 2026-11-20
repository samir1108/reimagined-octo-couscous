import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MasterTeachingInput {
  themeId?: string;
  themeTitle: string;
  themeDescription?: string;
  masterId: string;
  masterName: string;
  masterTradition?: string;
  masterQuote?: string;
  userBand?: number;
  activeLoops?: string[];
  force?: boolean;
}

export interface MasterTeachingResult {
  teaching: string;
  invitation: string | null;
  cached: boolean;
}

/**
 * Generates the current Master's voice on today's theme.
 * Cached server-side per (user, theme_date, master_id).
 */
export function useMasterThemeTeaching() {
  return useMutation<MasterTeachingResult, Error, MasterTeachingInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-master-theme-teaching",
        { body: input }
      );
      if (error) throw new Error(error.message || "Failed to fetch Master teaching");
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as MasterTeachingResult;
    },
  });
}
