import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { translateNotificationTexts } from "@/lib/notifyTranslation";

/**
 * Browser Push Notifications hook.
 * Requests permission on mount (once), then listens for new notifications
 * via Supabase Realtime and shows native browser notifications.
 */
export function usePushNotifications(userId: string | undefined) {
  const permissionRef = useRef<NotificationPermission>("default");
  const channelNameRef = useRef(`push-notifications-${Math.random().toString(36).slice(2)}`);

  // Request permission once
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      permissionRef.current = "granted";
      return;
    }
    if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        permissionRef.current = perm;
      });
    }
  }, []);

  const showNativeNotification = useCallback(
    (title: string, body: string, icon?: string) => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      void (async () => {
        const [localizedTitle, localizedBody] = await translateNotificationTexts([title, body]);
        try {
          const notif = new Notification(localizedTitle, {
            body: localizedBody,
            icon: icon || "/pwa-icon-192.png",
            badge: "/pwa-icon-192.png",
            tag: `hope-app-${Date.now()}`,
            silent: false,
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
          };

          // Auto-close after 8 seconds
          setTimeout(() => notif.close(), 8000);
        } catch {
          // Fallback: some browsers don't support Notification constructor in this context
        }
      })();
    },
    []
  );

  // Listen for new notifications via Realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(channelNameRef.current)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as { title: string; body: string; type: string };
          // Only show native notification when tab is not focused
          if (document.hidden) {
            showNativeNotification(
              newNotif.title,
              newNotif.body || "You have a new notification"
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showNativeNotification]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const perm = await Notification.requestPermission();
    permissionRef.current = perm;
    return perm;
  }, []);

  return {
    isSupported: "Notification" in window,
    permission: permissionRef.current,
    requestPermission,
    showNativeNotification,
  };
}
