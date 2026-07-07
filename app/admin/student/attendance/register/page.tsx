import Link from "next/link";
import { StudentAttendanceRegister } from "@/components/student-attendance/student-attendance-register";
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
import { getStudentAttendanceRegister } from "@/lib/student-attendance.server";

type AdminStudentAttendanceRegisterPageProps = {
  searchParams: Promise<{
    classId?: string;
    year?: string;
    month?: string;
  }>;
};

export default async function AdminStudentAttendanceRegisterPage({
  searchParams,
}: AdminStudentAttendanceRegisterPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;
  const classId = params.classId;

  if (!classId) {
    const classes = await getClasses();

    return (
      <div className="space-y-6">
        <BackLink href="/admin/students">← Back to Students</BackLink>
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Register</CardTitle>
            <CardDescription>
              Select a class to view the monthly attendance register.
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
                      href={`/admin/student/attendance/register?classId=${schoolClass.id}&year=${year}&month=${month}`}
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

  const register = await getStudentAttendanceRegister(classId, year, month);

  if (!register) {
    return (
      <div className="space-y-4">
        <BackLink href="/admin/students">← Back to Students</BackLink>
        <p className="text-sm text-muted-foreground">
          Unable to load attendance register. Please try again.
        </p>
      </div>
    );
  }

  const registerPath = `/admin/student/attendance/register?classId=${classId}`;
  const takePath = `/admin/student/attendance/take?classId=${classId}`;

  return (
    <div className="space-y-6">
      <BackLink href="/admin/students">← Back to Students</BackLink>
      <StudentAttendanceRegister
        key={`${register.classId}-${register.year}-${register.month}`}
        register={register}
        scope="admin"
        basePath={registerPath}
        takePath={takePath}
        showClassSelector
      />
    </div>
  );
}
