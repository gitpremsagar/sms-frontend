"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { markNotificationRead, type TeacherNotification } from "@/lib/teacher";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type TeacherNotificationsListProps = {
  initialNotifications: TeacherNotification[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TeacherNotificationsList({
  initialNotifications,
}: TeacherNotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen(notification: TeacherNotification) {
    const nextExpandedId =
      expandedId === notification.id ? null : notification.id;
    setExpandedId(nextExpandedId);

    if (!notification.read && nextExpandedId === notification.id) {
      setLoadingId(notification.id);
      setError(null);

      try {
        await markNotificationRead(notification.id);
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
        router.refresh();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to mark notification as read",
        );
      } finally {
        setLoadingId(null);
      }
    }
  }

  if (notifications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No notifications yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {notifications.map((notification) => {
        const isExpanded = expandedId === notification.id;

        return (
          <button
            key={notification.id}
            type="button"
            onClick={() => void handleOpen(notification)}
            className={cn(
              "w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/30",
              !notification.read && "border-school-navy/30 bg-school-navy/5",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{notification.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)} · from{" "}
                  {notification.authorName}
                </p>
              </div>
              {!notification.read ? (
                <span className="shrink-0 rounded-full bg-school-navy px-2 py-0.5 text-xs font-medium text-white">
                  New
                </span>
              ) : null}
            </div>

            {isExpanded ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {loadingId === notification.id
                  ? "Marking as read..."
                  : notification.body}
              </p>
            ) : (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {notification.body}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
