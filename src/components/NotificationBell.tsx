import { Bell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/design-system";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/machines/notificationsMachine";

/**
 * Minimal Notification Bell
 * — Tiny bell icon with a subtle primary dot when unread items exist
 * — Glass popover panel with a single accent color
 * — Whisper-quiet hover/focus motion
 */

function NotifRow({
  notif,
  onClick,
}: {
  notif: Notification;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group relative w-full overflow-hidden text-left px-3.5 py-3 hover:bg-foreground/[0.03] transition-colors duration-200 sm:px-4"
    >
      <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
        {/* Status dot */}
        <div className="mt-2 shrink-0">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              notif.read ? "bg-muted-foreground/20" : "bg-primary"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`line-clamp-2 break-words text-[13px] leading-snug font-body [overflow-wrap:anywhere] ${
              notif.read
                ? "text-muted-foreground/70"
                : "text-foreground font-medium"
            }`}
          >
            {notif.title}
          </p>
          {notif.body && (
            <p className="mt-0.5 line-clamp-2 break-words text-[11.5px] leading-relaxed text-muted-foreground/60 [overflow-wrap:anywhere]">
              {notif.body}
            </p>
          )}
          <p className="text-[10px] mt-1.5 text-muted-foreground/40 font-body tabular-nums">
            {formatDistanceToNow(new Date(notif.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function NotificationBell() {
  const [userId, setUserId] = useState<string>();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications(userId);

  const handleRowClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    const meta = (n.metadata || {}) as Record<string, any>;

    // (Removed) Background-composed "Next Session Ready" notifications no
    // longer route to a preview screen — the next theme is written directly
    // into today's `daily_themes` and the Home screen refreshes itself.

    if (meta.action === "guide" && meta.mode) {
      const params = new URLSearchParams({ mode: meta.mode as string });
      if (meta.aiContext) params.set("aiContext", meta.aiContext as string);
      setOpen(false);
      navigate(`/app/guide?${params.toString()}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.04 }}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="w-[15px] h-[15px]" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center"
              aria-hidden
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          )}
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        avoidCollisions
        collisionPadding={8}
        className="max-h-[calc(100dvh-5.25rem)] w-[calc(100vw-1rem)] max-w-[22rem] overflow-hidden rounded-2xl border border-border/50 bg-background/90 p-0 text-popover-foreground shadow-xl backdrop-blur-xl sm:w-[22rem]"
      >
        {/* Header */}
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border/40 px-3.5 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[12px] font-display font-medium text-foreground tracking-wide">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="shrink-0 text-[10px] text-primary/80 font-body tabular-nums">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex shrink-0 items-center gap-1 text-[10.5px] text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              <Check className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[calc(100dvh-8.75rem)] overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-none">
          {notifications.length === 0 ? (
            <div className="py-14 text-center px-6">
              <div className="w-8 h-8 rounded-full bg-foreground/[0.03] flex items-center justify-center mx-auto mb-3">
                <Bell
                  className="w-3.5 h-3.5 text-muted-foreground/40"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-[12px] text-muted-foreground/60 font-body">
                You're all caught up
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.slice(0, 20).map((n) => (
                <NotifRow
                  key={n.id}
                  notif={n}
                  onClick={() => handleRowClick(n)}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
