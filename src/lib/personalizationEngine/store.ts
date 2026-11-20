/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabase";
import type {
  OpenThread, ThreadStatus, DepthMode, MemorySource, UserGoal, GoalStatus,
  SessionObservation, LivingExperiment, ExperimentOutcome, SessionFeedback,
  PersonalizationEvent,
} from "./types";

function uid() {
  return (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

async function userId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// â”€â”€ Open Threads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function listOpenThreads(status?: ThreadStatus): Promise<OpenThread[]> {
  const u = await userId();
  if (!u) return [];
  let q = (supabase as any).from("open_threads").select("*").eq("user_id", u).order("updated_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as any[]).map(rowToThread);
}

export async function getPrimaryOpenThread(): Promise<OpenThread | null> {
  const rows = await listOpenThreads("open");
  return rows[0] ?? null;
}

export interface CreateThreadInput {
  question: string;
  originGoalId?: string | null;
  originObservationId?: string | null;
  depthMode?: DepthMode;
  source?: MemorySource;
  confidence?: number;
}

export async function createOpenThread(input: CreateThreadInput): Promise<OpenThread | null> {
  const u = await userId();
  if (!u) return null;
  const now = new Date().toISOString();
  const row = {
    id: uid(),
    user_id: u,
    question: input.question,
    origin_goal_id: input.originGoalId ?? null,
    origin_observation_id: input.originObservationId ?? null,
    status: "open",
    depth_mode: input.depthMode ?? "arrive",
    sessions_count: 0,
    last_explored_at: null,
    resolution_note: null,
    source: input.source ?? "user_shared",
    confidence: input.confidence ?? 0.5,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await (supabase as any).from("open_threads").insert(row).select("*").single();
  if (error || !data) return null;
  return rowToThread(data);
}

export async function updateOpenThread(
  id: string,
  patch: Partial<Pick<OpenThread, "question" | "status" | "depthMode" | "resolutionNote" | "confidence">> & { sessionsCount?: number; lastExploredAt?: string | null },
): Promise<OpenThread | null> {
  const u = await userId();
  if (!u) return null;
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.question !== undefined) dbPatch.question = patch.question;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.depthMode !== undefined) dbPatch.depth_mode = patch.depthMode;
  if (patch.resolutionNote !== undefined) dbPatch.resolution_note = patch.resolutionNote;
  if (patch.confidence !== undefined) dbPatch.confidence = patch.confidence;
  if (patch.sessionsCount !== undefined) dbPatch.sessions_count = patch.sessionsCount;
  if (patch.lastExploredAt !== undefined) dbPatch.last_explored_at = patch.lastExploredAt;
  const { data, error } = await (supabase as any).from("open_threads").update(dbPatch).eq("id", id).eq("user_id", u).select("*").single();
  if (error || !data) return null;
  return rowToThread(data);
}

export async function resolveOpenThread(id: string, note?: string): Promise<OpenThread | null> {
  return updateOpenThread(id, { status: "resolved", resolutionNote: note ?? null });
}

export async function abandonOpenThread(id: string, note?: string): Promise<OpenThread | null> {
  return updateOpenThread(id, { status: "abandoned", resolutionNote: note ?? null });
}

function rowToThread(r: any): OpenThread {
  return {
    id: r.id,
    userId: r.user_id,
    question: r.question,
    originGoalId: r.origin_goal_id,
    originObservationId: r.origin_observation_id,
    status: r.status,
    depthMode: r.depth_mode,
    sessionsCount: r.sessions_count ?? 0,
    lastExploredAt: r.last_explored_at,
    resolutionNote: r.resolution_note,
    source: r.source,
    confidence: Number(r.confidence ?? 0.5),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// â”€â”€ User Goals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function listUserGoals(status?: GoalStatus): Promise<UserGoal[]> {
  const u = await userId();
  if (!u) return [];
  let q = (supabase as any).from("user_goals").select("*").eq("user_id", u).order("updated_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as any[]).map(rowToGoal);
}

export async function createUserGoal(input: { goal: string; lifeDomain?: string; source?: MemorySource; confidence?: number }): Promise<UserGoal | null> {
  const u = await userId();
  if (!u) return null;
  const now = new Date().toISOString();
  const row = {
    id: uid(),
    user_id: u,
    goal: input.goal,
    life_domain: input.lifeDomain ?? null,
    source: input.source ?? "user_shared",
    confidence: input.confidence ?? 1,
    status: "active",
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await (supabase as any).from("user_goals").insert(row).select("*").single();
  if (error || !data) return null;
  return rowToGoal(data);
}

export async function updateUserGoal(id: string, patch: Partial<Pick<UserGoal, "goal" | "status" | "confidence">>): Promise<UserGoal | null> {
  const u = await userId();
  if (!u) return null;
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.goal !== undefined) dbPatch.goal = patch.goal;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.confidence !== undefined) dbPatch.confidence = patch.confidence;
  const { data, error } = await (supabase as any).from("user_goals").update(dbPatch).eq("id", id).eq("user_id", u).select("*").single();
  if (error || !data) return null;
  return rowToGoal(data);
}

function rowToGoal(r: any): UserGoal {
  return {
    id: r.id, userId: r.user_id, goal: r.goal, lifeDomain: r.life_domain,
    source: r.source, confidence: Number(r.confidence ?? 0.5), status: r.status,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// â”€â”€ Session Observations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function recordObservation(input: {
  sessionId?: string | null;
  threadId?: string | null;
  observation: string;
  confirmed?: boolean;
  source?: MemorySource;
  confidence?: number;
}): Promise<SessionObservation | null> {
  const u = await userId();
  if (!u) return null;
  const row = {
    id: uid(),
    user_id: u,
    session_id: input.sessionId ?? null,
    thread_id: input.threadId ?? null,
    observation: input.observation,
    confirmed: input.confirmed ?? false,
    source: input.source ?? "tentative_inference",
    confidence: input.confidence ?? 0.5,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await (supabase as any).from("session_observations").insert(row).select("*").single();
  if (error || !data) return null;
  return rowToObs(data);
}

export async function confirmObservation(id: string): Promise<SessionObservation | null> {
  const u = await userId();
  if (!u) return null;
  const { data, error } = await (supabase as any).from("session_observations").update({ confirmed: true }).eq("id", id).eq("user_id", u).select("*").single();
  if (error || !data) return null;
  return rowToObs(data);
}

export async function listObservations(threadId?: string | null): Promise<SessionObservation[]> {
  const u = await userId();
  if (!u) return [];
  let q = (supabase as any).from("session_observations").select("*").eq("user_id", u).order("created_at", { ascending: false });
  if (threadId) q = q.eq("thread_id", threadId);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as any[]).map(rowToObs);
}

function rowToObs(r: any): SessionObservation {
  return {
    id: r.id, userId: r.user_id, sessionId: r.session_id, threadId: r.thread_id,
    observation: r.observation, confirmed: !!r.confirmed, source: r.source,
    confidence: Number(r.confidence ?? 0.5), createdAt: r.created_at,
  };
}

// â”€â”€ Living Experiments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function createExperiment(input: {
  threadId?: string | null;
  sessionId?: string | null;
  action: string;
  observationPrompt: string;
}): Promise<LivingExperiment | null> {
  const u = await userId();
  if (!u) return null;
  const now = new Date().toISOString();
  const row = {
    id: uid(),
    user_id: u,
    thread_id: input.threadId ?? null,
    session_id: input.sessionId ?? null,
    action: input.action,
    observation_prompt: input.observationPrompt,
    outcome: "unknown",
    outcome_note: null,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await (supabase as any).from("living_experiments").insert(row).select("*").single();
  if (error || !data) return null;
  return rowToExp(data);
}

export async function updateExperimentOutcome(
  id: string,
  outcome: ExperimentOutcome,
  note?: string | null,
): Promise<LivingExperiment | null> {
  const u = await userId();
  if (!u) return null;
  const { data, error } = await (supabase as any).from("living_experiments").update({
    outcome, outcome_note: note ?? null, updated_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", u).select("*").single();
  if (error || !data) return null;
  return rowToExp(data);
}

export async function listExperiments(threadId?: string | null): Promise<LivingExperiment[]> {
  const u = await userId();
  if (!u) return [];
  let q = (supabase as any).from("living_experiments").select("*").eq("user_id", u).order("created_at", { ascending: false });
  if (threadId) q = q.eq("thread_id", threadId);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as any[]).map(rowToExp);
}

function rowToExp(r: any): LivingExperiment {
  return {
    id: r.id, userId: r.user_id, threadId: r.thread_id, sessionId: r.session_id,
    action: r.action, observationPrompt: r.observation_prompt, outcome: r.outcome,
    outcomeNote: r.outcome_note, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// â”€â”€ Session Feedback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function recordFeedback(input: {
  sessionId?: string | null;
  relevant: boolean;
  helpful: boolean;
  difficult: boolean;
  unwanted: boolean;
  note?: string | null;
}): Promise<SessionFeedback | null> {
  const u = await userId();
  if (!u) return null;
  const row = {
    id: uid(),
    user_id: u,
    session_id: input.sessionId ?? null,
    relevant: input.relevant,
    helpful: input.helpful,
    difficult: input.difficult,
    unwanted: input.unwanted,
    note: input.note ?? null,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await (supabase as any).from("session_feedback").insert(row).select("*").single();
  if (error || !data) return null;
  return {
    id: data.id, userId: data.user_id, sessionId: data.session_id,
    relevant: data.relevant, helpful: data.helpful, difficult: data.difficult,
    unwanted: data.unwanted, note: data.note, createdAt: data.created_at,
  };
}

// â”€â”€ Personalization Events (audit) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function logPersonalizationEvent(kind: string, payload: Record<string, unknown> = {}): Promise<void> {
  const u = await userId();
  if (!u) return;
  void (supabase as any).from("personalization_events").insert({
    id: uid(), user_id: u, kind, payload, created_at: new Date().toISOString(),
  });
}

