/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listOpenThreads, getPrimaryOpenThread, createOpenThread, updateOpenThread,
  resolveOpenThread, abandonOpenThread,
  listUserGoals, createUserGoal, updateUserGoal,
  recordObservation, confirmObservation, listObservations,
  createExperiment, updateExperimentOutcome, listExperiments,
  recordFeedback, logPersonalizationEvent,
} from "@/lib/personalizationEngine/store";

export function usePrimaryOpenThread() {
  return useQuery({
    queryKey: ["pe", "primary-thread"],
    queryFn: getPrimaryOpenThread,
    staleTime: 1000 * 30,
  });
}

export function useOpenThreads(status?: string) {
  return useQuery({
    queryKey: ["pe", "threads", status ?? "all"],
    queryFn: () => listOpenThreads(status as any),
    staleTime: 1000 * 30,
  });
}

export function useCreateOpenThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOpenThread,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pe", "threads"] });
      qc.invalidateQueries({ queryKey: ["pe", "primary-thread"] });
    },
  });
}

export function useUpdateOpenThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateOpenThread>[1] }) =>
      updateOpenThread(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pe", "threads"] });
      qc.invalidateQueries({ queryKey: ["pe", "primary-thread"] });
    },
  });
}

export function useResolveOpenThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => resolveOpenThread(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pe", "threads"] });
      qc.invalidateQueries({ queryKey: ["pe", "primary-thread"] });
    },
  });
}

export function useAbandonOpenThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => abandonOpenThread(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pe", "threads"] });
      qc.invalidateQueries({ queryKey: ["pe", "primary-thread"] });
    },
  });
}

export function useUserGoals(status?: string) {
  return useQuery({
    queryKey: ["pe", "goals", status ?? "all"],
    queryFn: () => listUserGoals(status as any),
    staleTime: 1000 * 30,
  });
}

export function useCreateUserGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUserGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pe", "goals"] }),
  });
}

export function useUpdateUserGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateUserGoal>[1] }) =>
      updateUserGoal(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pe", "goals"] }),
  });
}

export function useObservations(threadId?: string | null) {
  return useQuery({
    queryKey: ["pe", "observations", threadId ?? "all"],
    queryFn: () => listObservations(threadId),
    staleTime: 1000 * 30,
  });
}

export function useRecordObservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recordObservation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pe", "observations"] }),
  });
}

export function useConfirmObservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmObservation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pe", "observations"] }),
  });
}

export function useExperiments(threadId?: string | null) {
  return useQuery({
    queryKey: ["pe", "experiments", threadId ?? "all"],
    queryFn: () => listExperiments(threadId),
    staleTime: 1000 * 30,
  });
}

export function useCreateExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExperiment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pe", "experiments"] }),
  });
}

export function useUpdateExperimentOutcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcome, note }: { id: string; outcome: Parameters<typeof updateExperimentOutcome>[1]; note?: string | null }) =>
      updateExperimentOutcome(id, outcome, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pe", "experiments"] }),
  });
}

export function useRecordFeedback() {
  return useMutation({ mutationFn: recordFeedback });
}

export { logPersonalizationEvent };

