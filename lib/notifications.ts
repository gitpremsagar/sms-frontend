import { apiFetch } from "./api";

export type Notification = {
  id: string;
  title: string;
  body: string;
  createdBy: string;
  authorName: string;
  createdAt: string;
};

export type CreateNotificationInput = {
  title: string;
  body: string;
};

export async function createNotification(
  input: CreateNotificationInput,
): Promise<Notification> {
  const data = await apiFetch<{ notification: Notification }>(
    "/api/notifications",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.notification;
}
