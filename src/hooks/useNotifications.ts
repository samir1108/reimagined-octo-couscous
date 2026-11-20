import { useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMachine } from "@xstate/react";
import { supabase } from "@/lib/supabase";
import { notificationsMachine, type Notification } from "@/machines/notificationsMachine";

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [state, send] = useMachine(notificationsMachine);
  const channelNameRef = useRef(`notifications-realtime-${Math.random().toString(36).slice(2)}`);

  // Fetch notifications
  const { data, isError, error } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId!)
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw error;
        return data as unknown as Notification[];
      } catch (e) {
        console.warn("[useNotifications] fetch failed:", e);
        return [] as Notification[];
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Sync query data to machine
  useEffect(() => {
    if (data) send({ type: "LOADED", notifications: data });
  }, [data, send]);

  useEffect(() => {
    if (isError && error) send({ type: "ERROR", error: (error as Error).message });
  }, [isError, error, send]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(channelNameRef.current)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const newNotif = payload.new as unknown as Notification;
          send({ type: "NEW_NOTIFICATION", notification: newNotif });
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, send, queryClient]);

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true } as any)
          .eq("id", id);
        if (error) throw error;
      } catch (e) {
        console.warn("[useNotifications] markRead failed:", e);
      }
    },
    onSuccess: (_, id) => {
      send({ type: "MARK_READ", id });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ read: true } as any)
          .eq("user_id", userId!)
          .eq("read", false);
        if (error) throw error;
      } catch (e) {
        console.warn("[useNotifications] markAllRead failed:", e);
      }
    },
    onSuccess: () => {
      send({ type: "MARK_ALL_READ" });
    },
  });

  const markRead = useCallback((id: string) => markReadMutation.mutate(id), [markReadMutation]);
  const markAllRead = useCallback(() => markAllReadMutation.mutate(), [markAllReadMutation]);

  return {
    notifications: state.context.notifications,
    unreadCount: state.context.unreadCount,
    isLoading: state.matches("idle"),
    markRead,
    markAllRead,
  };
}
