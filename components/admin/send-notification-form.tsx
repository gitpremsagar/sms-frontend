"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { createNotification, type Notification } from "@/lib/notifications";

type SendNotificationFormProps = {
  recentNotifications: Notification[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SendNotificationForm({
  recentNotifications,
}: SendNotificationFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createNotification({ title, body });
      setTitle("");
      setBody("");
      setSuccess("Notification sent to all teachers.");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
          <CardDescription>
            Broadcast an announcement to all teachers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {success ? (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Staff meeting tomorrow"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <textarea
                id="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write the announcement details..."
                required
                maxLength={5000}
                rows={5}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <FormActions>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send to teachers"}
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Previously sent announcements visible to all teachers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications sent yet.
            </p>
          ) : (
            recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg border border-border bg-muted/20 p-4"
              >
                <p className="font-medium">{notification.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)} · sent by{" "}
                  {notification.authorName}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {notification.body}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
