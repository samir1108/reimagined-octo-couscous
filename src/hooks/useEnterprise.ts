import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback, useRef } from "react";

// Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  settings: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string | null;
  team_id: string | null;
  role: "admin" | "manager" | "employee";
  email: string | null;
  status: "invited" | "active" | "deactivated";
  invited_at: string;
  joined_at: string | null;
  invited_by: string | null;
}

export interface OrgInvite {
  id: string;
  org_id: string;
  email: string;
  role: string;
  team_id: string | null;
  token: string;
  invited_by: string | null;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export interface EmployeeProfile {
  member: OrgMember;
  profile: any | null;
  consciousness: any | null;
}

export function useCurrentUserId() {
  const [userId, setUserId] = useState<string>();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);
  return userId;
}

// Get current user's org membership
export function useMyOrgMembership() {
  const userId = useCurrentUserId();

  return useQuery({
    queryKey: ["my-org-membership", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("org_members")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as OrgMember | null;
    },
    enabled: !!userId,
  });
}

// Get organization details
export function useOrganization(orgId?: string) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();
      if (error) throw error;
      return data as Organization;
    },
    enabled: !!orgId,
  });
}

// Get all members of an org
export function useOrgMembers(orgId?: string) {
  return useQuery({
    queryKey: ["org-members", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("org_members")
        .select("*")
        .eq("org_id", orgId)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      return data as OrgMember[];
    },
    enabled: !!orgId,
  });
}

// Get teams of an org
export function useOrgTeams(orgId?: string) {
  return useQuery({
    queryKey: ["org-teams", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("org_id", orgId)
        .order("name");
      if (error) throw error;
      return data as Team[];
    },
    enabled: !!orgId,
  });
}

// Get org invites
export function useOrgInvites(orgId?: string) {
  return useQuery({
    queryKey: ["org-invites", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("org_invites")
        .select("*")
        .eq("org_id", orgId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OrgInvite[];
    },
    enabled: !!orgId,
  });
}

// Get employee profiles with consciousness data for a given org
export function useOrgEmployeeProfiles(orgId?: string) {
  return useQuery({
    queryKey: ["org-employee-profiles", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data: members, error: memErr } = await supabase
        .from("org_members")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "active");
      if (memErr) throw memErr;

      const userIds = (members as OrgMember[])
        .filter((m) => m.user_id)
        .map((m) => m.user_id!);

      if (userIds.length === 0) return [];

      const [profilesRes, consciousnessRes] = await Promise.all([
        supabase.from("profiles").select("*").in("user_id", userIds),
        supabase.from("user_consciousness_profile").select("*").in("user_id", userIds),
      ]);

      return (members as OrgMember[]).map((m) => ({
        member: m,
        profile: profilesRes.data?.find((p: any) => p.user_id === m.user_id) || null,
        consciousness: consciousnessRes.data?.find((c: any) => c.user_id === m.user_id) || null,
      })) as EmployeeProfile[];
    },
    enabled: !!orgId,
  });
}

// Get org-wide session trends for last 30 days
export function useOrgSessionTrends(orgId?: string) {
  return useQuery({
    queryKey: ["org-session-trends", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data: members } = await supabase
        .from("org_members")
        .select("user_id")
        .eq("org_id", orgId)
        .eq("status", "active")
        .not("user_id", "is", null);

      const userIds = members?.map((m) => m.user_id!).filter(Boolean) || [];
      if (userIds.length === 0) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessions } = await supabase
        .from("sessions")
        .select("session_date, user_id")
        .in("user_id", userIds)
        .gte("session_date", thirtyDaysAgo.toISOString().split("T")[0]);

      return sessions || [];
    },
    enabled: !!orgId,
  });
}

// Get full employee detail (for employee detail page)
export function useEmployeeDetail(userId?: string) {
  return useQuery({
    queryKey: ["employee-detail", userId],
    queryFn: async () => {
      if (!userId) return null;

      const [profileRes, consciousnessRes, sessionsRes, journalsRes, loopsRes, reflectionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_consciousness_profile").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
        supabase.from("journal_entries").select("id, title, mood, content, created_at, tags").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        supabase.from("user_loops").select("*").eq("user_id", userId),
        supabase.from("evening_reflections").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      ]);

      return {
        profile: profileRes.data,
        consciousness: consciousnessRes.data,
        sessions: sessionsRes.data || [],
        journals: journalsRes.data || [],
        loops: loopsRes.data || [],
        reflections: reflectionsRes.data || [],
      };
    },
    enabled: !!userId,
  });
}

// Get team-level aggregated stats
export function useOrgTeamStats(orgId?: string) {
  return useQuery({
    queryKey: ["org-team-stats", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const { data: teams } = await supabase
        .from("teams")
        .select("*")
        .eq("org_id", orgId);

      const { data: members } = await supabase
        .from("org_members")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "active");

      const userIds = (members || []).filter((m: any) => m.user_id).map((m: any) => m.user_id!);

      const { data: consciousness } = userIds.length > 0
        ? await supabase.from("user_consciousness_profile").select("user_id, overall_band, streak_current, total_sessions").in("user_id", userIds)
        : { data: [] };

      return (teams || []).map((team: any) => {
        const teamMembers = (members || []).filter((m: any) => m.team_id === team.id);
        const teamUserIds = teamMembers.filter((m: any) => m.user_id).map((m: any) => m.user_id!);
        const teamConsciousness = (consciousness || []).filter((c: any) => teamUserIds.includes(c.user_id));

        const avgBand = teamConsciousness.length > 0
          ? teamConsciousness.reduce((s: number, c: any) => s + (c.overall_band || 0), 0) / teamConsciousness.length
          : 0;
        const avgStreak = teamConsciousness.length > 0
          ? teamConsciousness.reduce((s: number, c: any) => s + (c.streak_current || 0), 0) / teamConsciousness.length
          : 0;
        const totalSessions = teamConsciousness.reduce((s: number, c: any) => s + (c.total_sessions || 0), 0);

        return {
          team,
          memberCount: teamMembers.length,
          avgBand: Number(avgBand.toFixed(1)),
          avgStreak: Math.round(avgStreak),
          totalSessions,
        };
      });
    },
    enabled: !!orgId,
  });
}

// Create organization
export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, slug, description }: { name: string; slug: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({ name, slug, description: description || null, created_by: user.id })
        .select()
        .single();
      if (orgErr) throw orgErr;

      const { error: memErr } = await supabase
        .from("org_members")
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: "admin",
          status: "active",
          email: user.email,
          joined_at: new Date().toISOString(),
        });
      if (memErr) throw memErr;

      return org as Organization;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-org-membership"] });
    },
  });
}

// Invite member
export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, email, role, teamId }: { orgId: string; email: string; role: string; teamId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("org_invites")
        .insert({
          org_id: orgId,
          email,
          role,
          team_id: teamId || null,
          invited_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("org_members").insert({
        org_id: orgId,
        email,
        role,
        team_id: teamId || null,
        status: "invited",
        invited_by: user.id,
      });

      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["org-members", vars.orgId] });
      qc.invalidateQueries({ queryKey: ["org-invites", vars.orgId] });
    },
  });
}

// Create team
export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, name, description }: { orgId: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("teams")
        .insert({ org_id: orgId, name, description: description || null })
        .select()
        .single();
      if (error) throw error;
      return data as Team;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["org-teams", vars.orgId] });
      qc.invalidateQueries({ queryKey: ["org-team-stats", vars.orgId] });
    },
  });
}

// Update member role
export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role, orgId }: { memberId: string; role: string; orgId: string }) => {
      const { error } = await supabase
        .from("org_members")
        .update({ role })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["org-members", vars.orgId] });
      qc.invalidateQueries({ queryKey: ["org-employee-profiles", vars.orgId] });
    },
  });
}

// Remove member
export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, orgId }: { memberId: string; orgId: string }) => {
      const { error } = await supabase
        .from("org_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["org-members", vars.orgId] });
      qc.invalidateQueries({ queryKey: ["org-employee-profiles", vars.orgId] });
    },
  });
}

// Assign member to team
export function useAssignTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, teamId, orgId }: { memberId: string; teamId: string | null; orgId: string }) => {
      const { error } = await supabase
        .from("org_members")
        .update({ team_id: teamId })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["org-members", vars.orgId] });
      qc.invalidateQueries({ queryKey: ["org-employee-profiles", vars.orgId] });
      qc.invalidateQueries({ queryKey: ["org-team-stats", vars.orgId] });
    },
  });
}

// Activity feed
export interface OrgActivity {
  id: string;
  org_id: string;
  actor_user_id: string | null;
  event_type: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export function useOrgActivityFeed(orgId?: string) {
  return useQuery({
    queryKey: ["org-activity-feed", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("org_activity_log")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as OrgActivity[];
    },
    enabled: !!orgId,
  });
}

export function useLogActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, title, description, eventType, metadata }: {
      orgId: string; title: string; description?: string; eventType?: string; metadata?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("org_activity_log")
        .insert({
          org_id: orgId,
          actor_user_id: user?.id || null,
          event_type: eventType || "milestone",
          title,
          description: description || "",
          metadata: metadata || {},
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-activity-feed"] });
    },
  });
}

// Org Health Score computation (client-side from existing data)
export function computeOrgHealthScore(profiles: EmployeeProfile[], sessionTrends: any[], totalMembers: number) {
  if (totalMembers === 0) return { score: 0, engagement: 0, bandGrowth: 0, streakConsistency: 0, wellbeingRisk: 0 };

  const withData = profiles.filter((p) => p.consciousness);

  // Engagement: % of members with streak > 0
  const activePractitioners = withData.filter((p) => p.consciousness?.streak_current > 0).length;
  const engagement = totalMembers > 0 ? activePractitioners / totalMembers : 0;

  // Band growth: avg band normalized to 0-1 (max band ~10)
  const avgBand = withData.length > 0
    ? withData.reduce((s, p) => s + (p.consciousness?.overall_band || 0), 0) / withData.length
    : 0;
  const bandGrowth = Math.min(avgBand / 10, 1);

  // Streak consistency: avg streak / 30 (capped at 1)
  const avgStreak = withData.length > 0
    ? withData.reduce((s, p) => s + (p.consciousness?.streak_current || 0), 0) / withData.length
    : 0;
  const streakConsistency = Math.min(avgStreak / 30, 1);

  // Wellbeing risk: avg bypassing_risk (0-1)
  const avgBypassing = withData.length > 0
    ? withData.reduce((s, p) => s + (Number(p.consciousness?.bypassing_risk) || 0), 0) / withData.length
    : 0;
  const wellbeingRisk = avgBypassing;

  const score = Math.round(
    (engagement * 0.3 + bandGrowth * 0.25 + streakConsistency * 0.25 + (1 - wellbeingRisk) * 0.2) * 100
  );

  return { score, engagement: Math.round(engagement * 100), bandGrowth: Number(avgBand.toFixed(1)), streakConsistency: Math.round(avgStreak), wellbeingRisk: Math.round(wellbeingRisk * 100) };
}

// Wellbeing alerts
export function computeWellbeingAlerts(profiles: EmployeeProfile[]) {
  const alerts: { userId: string; name: string; type: string; detail: string; severity: "warning" | "critical" }[] = [];

  profiles.forEach((ep) => {
    if (!ep.consciousness) return;
    const name = ep.profile?.display_name || ep.member.email || "Unknown";

    // High bypassing risk
    if (Number(ep.consciousness.bypassing_risk) > 0.6) {
      alerts.push({ userId: ep.member.user_id || "", name, type: "bypassing", detail: `Bypassing risk at ${Math.round(Number(ep.consciousness.bypassing_risk) * 100)}%`, severity: "critical" });
    }

    // Dark night / regression
    const regression = ep.consciousness.regression as Record<string, any> | undefined;
    if (regression && regression.dark_night_count > 0) {
      alerts.push({ userId: ep.member.user_id || "", name, type: "dark_night", detail: `${regression.dark_night_count} dark night event(s) detected`, severity: "warning" });
    }

    // Streak dropped to 0 but had sessions
    if (ep.consciousness.streak_current === 0 && ep.consciousness.total_sessions > 5) {
      alerts.push({ userId: ep.member.user_id || "", name, type: "disengaged", detail: "Active practitioner lost streak", severity: "warning" });
    }
  });

  return alerts.sort((a, b) => (a.severity === "critical" ? -1 : 1) - (b.severity === "critical" ? -1 : 1));
}

// Enterprise Notifications
export interface EnterpriseNotification {
  id: string;
  org_id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  severity: string;
  metadata: Record<string, any>;
  created_at: string;
}

export function useEnterpriseNotifications(orgId?: string) {
  const queryClient = useQueryClient();
  const channelNameRef = useRef(`enterprise-notifications-rt-${Math.random().toString(36).slice(2)}`);

  const { data = [] } = useQuery({
    queryKey: ["enterprise-notifications", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("enterprise_notifications")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as unknown as EnterpriseNotification[];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Realtime
  useEffect(() => {
    if (!orgId) return;
    const channel = supabase
      .channel(channelNameRef.current)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "enterprise_notifications", filter: `org_id=eq.${orgId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["enterprise-notifications", orgId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, queryClient]);

  const unreadCount = data.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enterprise_notifications")
        .update({ read: true } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enterprise-notifications", orgId] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("enterprise_notifications")
        .update({ read: true } as any)
        .eq("org_id", orgId!)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enterprise-notifications", orgId] }),
  });

  const markRead = useCallback((id: string) => markReadMutation.mutate(id), [markReadMutation]);
  const markAllRead = useCallback(() => markAllReadMutation.mutate(), [markAllReadMutation]);

  return { notifications: data, unreadCount, markRead, markAllRead };
}

// CSV export utility
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
