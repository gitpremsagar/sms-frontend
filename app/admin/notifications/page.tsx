import { BackLink } from "@/components/ui/back-link";
import { SendNotificationForm } from "@/components/admin/send-notification-form";
import { getNotifications } from "@/lib/notifications.server";
import { requireRole } from "@/lib/require-role";

export default async function AdminNotificationsPage() {
  await requireRole("ADMIN");
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <BackLink href="/admin">← Back to Admin Dashboard</BackLink>
      <SendNotificationForm recentNotifications={notifications} />
    </div>
  );
}
