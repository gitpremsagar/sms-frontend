import Link from "next/link";
import { StudentAttendanceDaily } from "@/components/student-attendance/student-attendance-daily";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getClasses } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";
import {
  getStudentAttendanceDaily,
} from "@/lib/student-attendance.server";
import { todayDateString } from "@/lib/student-attendance";

type AdminStudentAttendanceTakePageProps = {
  searchParams: Promise<{
    classId?: string;
    date?: string;
  }>;
};

export default async function AdminStudentAttendanceTakePage({
  searchParams,
}: AdminStudentAttendanceTakePageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const classId = params.classId;
  const date = params.date ?? todayDateString();

  if (!classId) {
    const classes = await getClasses();

    return (
      <div className="space-y-6">
        <BackLink href="/admin/students">← Back to Students</BackLink>
        <Card>
          <CardHeader>
            <CardTitle>Take Student Attendance</CardTitle>
            <CardDescription>
              Select a class to mark attendance for a given date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes found. Add a class first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {classes.map((schoolClass) => (
                  <Button key={schoolClass.id} asChild variant="outline" size="sm">
                    <Link
                      href={`/admin/student/attendance/take?classId=${schoolClass.id}&date=${date}`}
                    >
                      {schoolClass.className}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const roster = await getStudentAttendanceDaily(classId, date);

  if (!roster) {
    return (
      <div className="space-y-4">
        <BackLink href="/admin/students">← Back to Students</BackLink>
        <p className="text-sm text-muted-foreground">
          Unable to load attendance roster. Please try again.
        </p>
      </div>
    );
  }

  const registerPath = `/admin/student/attendance/register?classId=${classId}`;
  const takePath = `/admin/student/attendance/take`;

  return (
    <div className="space-y-6">
      <BackLink href="/admin/students">← Back to Students</BackLink>
      <StudentAttendanceDaily
        key={`${roster.classId}-${roster.date}`}
        roster={roster}
        scope="admin"
        basePath={takePath}
        registerPath={registerPath}
        showClassSelector
      />
    </div>
  );
}
