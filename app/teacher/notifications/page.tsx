import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeacherNotificationsList } from "@/components/teacher/teacher-notifications-list";
import { getTeacherNotifications } from "@/lib/teacher.server";
import { requireRole } from "@/lib/require-role";

export default async function TeacherNotificationsPage() {
  await requireRole("TEACHER");
  const notifications = await getTeacherNotifications();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            School announcements sent by the administration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherNotificationsList initialNotifications={notifications} />
        </CardContent>
      </Card>
    </div>
  );
}
