import { StudentAttendanceDaily } from "@/components/student-attendance/student-attendance-daily";
import { BackLink } from "@/components/ui/back-link";
import {
  getTeacherClassAttendanceDaily,
} from "@/lib/teacher.server";
import { requireRole } from "@/lib/require-role";
import { todayDateString } from "@/lib/student-attendance";

type TeacherClassAttendanceTakePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function TeacherClassAttendanceTakePage({
  params,
  searchParams,
}: TeacherClassAttendanceTakePageProps) {
  await requireRole("TEACHER");

  const { id } = await params;
  const query = await searchParams;
  const date = query.date ?? todayDateString();

  const roster = await getTeacherClassAttendanceDaily(id, date);

  if (!roster) {
    return (
      <div className="space-y-4">
        <BackLink href={`/teacher/class/${id}`}>← Back to class</BackLink>
        <p className="text-sm text-muted-foreground">
          Unable to load attendance roster. Please try again.
        </p>
      </div>
    );
  }

  const basePath = `/teacher/class/${id}/attendance/take`;
  const registerPath = `/teacher/class/${id}/attendance/register`;

  return (
    <div className="space-y-6">
      <BackLink href={`/teacher/class/${id}`}>← Back to {roster.className}</BackLink>
      <StudentAttendanceDaily
        key={`${roster.classId}-${roster.date}`}
        roster={roster}
        scope="teacher"
        basePath={basePath}
        registerPath={registerPath}
      />
    </div>
  );
}
