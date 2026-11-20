import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDailyGates } from "@/hooks/useSpiritualDNA";
import { useTodayPracticePack } from "@/hooks/useTodayPractice";
import { useWitnessCircles } from "@/hooks/useCommunity";
import { localDateKey } from "@/lib/localDate";
import {
  buildDayPlan,
  defaultDayPlanConfig,
  normalizeDayPlanConfig,
  type CustomDayItem,
  type DayPlanConfig,
  type DayPlanSignals,
} from "@/lib/dayPlan";
import {
  loadDayPlanProfile,
  readDoneItemIds,
  readLocalDayPlan,
  saveDayPlanConfig,
  writeDoneItemIds,
} from "@/lib/dayPlanStore";

export interface AddCustomItemInput {
  blockId: string;
  title: string;
  minutes?: number;
  repeat?: "daily" | "weekly";
}

export function useDayPlan() {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => new Date());
  const dateKey = localDateKey(now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["day-plan-profile"],
    queryFn: loadDayPlanProfile,
    staleTime: 1000 * 60 * 10,
  });

  const { data: gates } = useDailyGates();
  const { data: pack } = useTodayPracticePack();
  const { data: circles } = useWitnessCircles();

  const [doneIds, setDoneIds] = useState<string[]>([]);

  useEffect(() => {
    setDoneIds(readDoneItemIds(profile?.userId ?? null, dateKey));
  }, [profile?.userId, dateKey]);

  // Every plan surface (Home card, briefing, timetable) reads the same local
  // done-list; keep independent hook instances in sync without a reload.
  useEffect(() => {
    const reload = () => setDoneIds(readDoneItemIds(profile?.userId ?? null, dateKey));
    const onVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("dayplan:changed", reload);
    window.addEventListener("focus", reload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("dayplan:changed", reload);
      window.removeEventListener("focus", reload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [profile?.userId, dateKey]);

  const config = useMemo<DayPlanConfig>(() => {
    const remote = profile?.lifestyle?.day_plan;
    if (remote) return normalizeDayPlanConfig(remote);
    const local = profile?.userId ? readLocalDayPlan(profile.userId) : null;
    return local ?? defaultDayPlanConfig(profile?.wakeTime, profile?.sleepTime);
  }, [profile?.lifestyle, profile?.userId, profile?.wakeTime, profile?.sleepTime]);

  const signals = useMemo<DayPlanSignals>(
    () => ({
      gateDone: (gates ?? {}) as Record<string, boolean>,
      practices: (pack?.practices ?? []).map((practice) => ({
        id: practice.practice,
        title: practice.title,
        minutes: practice.duration,
        offAppCue: practice.off_app_cue,
        emoji: practice.emoji,
      })),
      completedPracticeIds: pack?.completed_practices ?? [],
      circles: (circles ?? []).map((circle) => ({
        id: circle.id,
        name: circle.name,
        nextSessionAt: circle.next_session_at,
        isMember: Boolean(circle.is_member),
      })),
      doneItemIds: doneIds,
    }),
    [gates, pack, circles, doneIds],
  );

  const plan = useMemo(() => buildDayPlan(config, signals, now), [config, signals, now]);

  const saveMutation = useMutation({
    mutationFn: (next: DayPlanConfig) => {
      if (!profile?.userId) throw new Error("Not authenticated");
      return saveDayPlanConfig(profile.userId, next);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["day-plan-profile"] });
    },
  });

  const saveConfig = useCallback(
    (next: DayPlanConfig) => saveMutation.mutateAsync(next),
    [saveMutation],
  );

  const toggleDone = useCallback(
    (id: string) => {
      setDoneIds((previous) => {
        const next = previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id];
        writeDoneItemIds(profile?.userId ?? null, dateKey, next);
        window.dispatchEvent(new Event("dayplan:changed"));
        return next;
      });
    },
    [profile?.userId, dateKey],
  );

  const addCustomItem = useCallback(
    async (input: AddCustomItemInput) => {
      const item: CustomDayItem = {
        id: `c_${Date.now().toString(36)}`,
        blockId: input.blockId,
        title: input.title.trim().slice(0, 64),
        minutes: Math.min(240, Math.max(1, Math.round(input.minutes ?? 10))),
        repeat: input.repeat ?? "daily",
        createdAt: new Date().toISOString(),
      };
      if (!item.title) return;
      return saveMutation.mutateAsync({
        ...config,
        customItems: [...config.customItems, item],
        updatedAt: new Date().toISOString(),
      });
    },
    [config, saveMutation],
  );

  const removeCustomItem = useCallback(
    (id: string) =>
      saveMutation.mutateAsync({
        ...config,
        customItems: config.customItems.filter((item) => item.id !== id),
        updatedAt: new Date().toISOString(),
      }),
    [config, saveMutation],
  );

  const resetConfig = useCallback(
    () => saveMutation.mutateAsync(defaultDayPlanConfig(profile?.wakeTime, profile?.sleepTime)),
    [profile?.wakeTime, profile?.sleepTime, saveMutation],
  );

  return {
    userId: profile?.userId ?? null,
    wakeTime: profile?.wakeTime ?? null,
    sleepTime: profile?.sleepTime ?? null,
    config,
    plan,
    doneIds,
    isLoading: profileLoading,
    isSaving: saveMutation.isPending,
    saveConfig,
    toggleDone,
    addCustomItem,
    removeCustomItem,
    resetConfig,
  };
}
