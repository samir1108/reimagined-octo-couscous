/**
 * AdvancedSessionConfigurationWrapper
 * ─────────────────────────────────────
 * Loads/saves ExtendedSessionConfiguration from Supabase.
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { consciousFromError } from "@/lib/consciousToast";
import AdvancedSessionConfiguration from "@/components/settings/AdvancedSessionConfiguration";
import { Button } from "@/design-system";
import { DEFAULT_EXTENDED_CONFIG, type ExtendedSessionConfiguration } from "@/types/session-config";

export default function AdvancedSessionConfigurationWrapper() {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["extended-session-config"],
    queryFn: async (): Promise<ExtendedSessionConfiguration> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEFAULT_EXTENDED_CONFIG;

      const { data } = await supabase
        .from("user_consciousness_profile")
        .select("session_config")
        .eq("user_id", user.id)
        .single();

      if (!data?.session_config) return DEFAULT_EXTENDED_CONFIG;
      return { ...DEFAULT_EXTENDED_CONFIG, ...data.session_config } as ExtendedSessionConfiguration;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (cfg: ExtendedSessionConfiguration) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_consciousness_profile")
        .update({ session_config: cfg as any })
        .eq("user_id", user.id);

      if (error) throw error;
      return cfg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extended-session-config"] });
      toast({ title: "Advanced settings saved" });
    },
    onError: (e) => consciousFromError(e, "actionMissed"),
  });

  const [localConfig, setLocalConfig] = useState<ExtendedSessionConfiguration>(DEFAULT_EXTENDED_CONFIG);

  useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  const handleChange = useCallback((patch: Partial<ExtendedSessionConfiguration>) => {
    setLocalConfig(prev => mergeExtendedConfig(prev, patch));
  }, []);

  const handleSave = useCallback(async () => {
    await saveMutation.mutateAsync(localConfig);
  }, [localConfig, saveMutation]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdvancedSessionConfiguration config={localConfig} onChange={handleChange} />
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="rounded-xl">
          {saveMutation.isPending ? "Saving…" : "Save Advanced Settings"}
        </Button>
      </div>
    </div>
  );
}