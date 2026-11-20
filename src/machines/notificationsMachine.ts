import { createMachine, assign } from "xstate";

export interface Notification {
  id: string;
  user_id: string;
  type: "insight" | "streak" | "milestone" | "system" | "prediction" | "checkin" | "task_followup";
  title: string;
  body: string;
  metadata: Record<string, any>;
  read: boolean;
  created_at: string;
}

interface NotificationsContext {
  notifications: Notification[];
  unreadCount: number;
  error: string | null;
}

type NotificationsEvent =
  | { type: "LOADED"; notifications: Notification[] }
  | { type: "ERROR"; error: string }
  | { type: "NEW_NOTIFICATION"; notification: Notification }
  | { type: "MARK_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "REFRESH" };

export const notificationsMachine = createMachine({
  id: "notifications",
  types: {} as {
    context: NotificationsContext;
    events: NotificationsEvent;
  },
  context: {
    notifications: [],
    unreadCount: 0,
    error: null,
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        LOADED: {
          target: "loaded",
          actions: assign({
            notifications: ({ event }) => event.notifications,
            unreadCount: ({ event }) => event.notifications.filter((n) => !n.read).length,
            error: () => null,
          }),
        },
        ERROR: {
          target: "error",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    loaded: {
      on: {
        LOADED: {
          actions: assign({
            notifications: ({ event }) => event.notifications,
            unreadCount: ({ event }) => event.notifications.filter((n) => !n.read).length,
          }),
        },
        NEW_NOTIFICATION: {
          actions: assign({
            notifications: ({ context, event }) => [event.notification, ...context.notifications],
            unreadCount: ({ context }) => context.unreadCount + 1,
          }),
        },
        MARK_READ: {
          actions: assign({
            notifications: ({ context, event }) =>
              context.notifications.map((n) => (n.id === event.id ? { ...n, read: true } : n)),
            unreadCount: ({ context, event }) => {
              const wasUnread = context.notifications.find((n) => n.id === event.id && !n.read);
              return wasUnread ? context.unreadCount - 1 : context.unreadCount;
            },
          }),
        },
        MARK_ALL_READ: {
          actions: assign({
            notifications: ({ context }) => context.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: () => 0,
          }),
        },
        ERROR: {
          target: "error",
          actions: assign({ error: ({ event }) => event.error }),
        },
        REFRESH: { target: "idle" },
      },
    },
    error: {
      on: {
        REFRESH: { target: "idle" },
        LOADED: {
          target: "loaded",
          actions: assign({
            notifications: ({ event }) => event.notifications,
            unreadCount: ({ event }) => event.notifications.filter((n) => !n.read).length,
            error: () => null,
          }),
        },
      },
    },
  },
});
