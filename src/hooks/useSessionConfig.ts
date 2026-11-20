import { useState, useCallback, useEffect, useMemo } from 'react';
import { ExtendedSessionConfiguration, DEFAULT_EXTENDED_CONFIG, mergeExtendedConfig, validateSessionConfig } from '@/types/session-config';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/hooks/useAuthReady';

export interface UseSessionConfigReturn {
  config: ExtendedSessionConfiguration;
  updateConfig: (updates: Partial<ExtendedSessionConfiguration>) => void;
  resetConfig: () => void;
  saveConfig: () => Promise<void>;
  loadConfig: () => Promise<void>;
  isValid: boolean;
  errors: string[];
  isSaving: boolean;
  isLoading: boolean;
  isDirty: boolean;
}

export function useSessionConfig(initialConfig?: Partial<ExtendedSessionConfiguration>): UseSessionConfigReturn {
  const { user, isReady } = useAuthReady();
  const [config, setConfig] = useState<ExtendedSessionConfiguration>(() =>
    initialConfig ? mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, initialConfig) : DEFAULT_EXTENDED_CONFIG
  );
  const [savedConfig, setSavedConfig] = useState<ExtendedSessionConfiguration>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validation = useMemo(() => validateSessionConfig(config), [config]);

  const updateConfig = useCallback((updates: Partial<ExtendedSessionConfiguration>) => {
    setConfig(prev => mergeExtendedConfig(prev, updates));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(savedConfig);
  }, [savedConfig]);

  const loadConfig = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_consciousness_profile')
        .select('session_config')
        .eq('user_id', user.id)
        .single();
      if (error || !data?.session_config) {
        setConfig(DEFAULT_EXTENDED_CONFIG);
        setSavedConfig(DEFAULT_EXTENDED_CONFIG);
      } else {
        const loaded = mergeExtendedConfig(DEFAULT_EXTENDED_CONFIG, data.session_config as Partial<ExtendedSessionConfiguration>);
        setConfig(loaded);
        setSavedConfig(loaded);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveConfig = useCallback(async () => {
    if (!user || !validation.valid) return;
    setIsSaving(true);
    try {
      const configToSave = { ...config, updatedAt: new Date().toISOString(), version: config.version + 1 };
      const { error } = await supabase
        .from('user_consciousness_profile')
        .update({ session_config: configToSave as any })
        .eq('user_id', user.id);
      if (error) throw error;
      setSavedConfig(configToSave);
    } finally {
      setIsSaving(false);
    }
  }, [user, config, validation.valid]);

  useEffect(() => {
    if (user) loadConfig();
  }, [user, loadConfig]);

  const isDirty = useMemo(() => {
    const strip = (c: ExtendedSessionConfiguration) => {
      const { updatedAt, version, ...rest } = c;
      return rest;
    };
    return JSON.stringify(strip(config)) !== JSON.stringify(strip(savedConfig));
  }, [config, savedConfig]);

  return {
    config,
    updateConfig,
    resetConfig,
    saveConfig,
    loadConfig,
    isValid: validation.valid,
    errors: validation.errors,
    isSaving,
    isLoading,
    isDirty,
  };
}