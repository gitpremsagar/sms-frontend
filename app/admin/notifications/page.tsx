import { SendNotificationForm } from "@/components/admin/send-notification-form";
import { getNotifications } from "@/lib/notifications.server";
import { requireRole } from "@/lib/require-role";

export default async function AdminNotificationsPage() {
  await requireRole("ADMIN");
  const notifications = await getNotifications();

  return <SendNotificationForm recentNotifications={notifications} />;
}
