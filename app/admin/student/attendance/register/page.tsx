import { StudentAttendanceRegister } from "@/components/student-attendance/student-attendance-register";
import { BackLink } from "@/components/ui/back-link";
import { requireRole } from "@/lib/require-role";
import { getStudentAttendanceRegister } from "@/lib/student-attendance.server";

type AdminStudentAttendanceRegisterPageProps = {
  searchParams: Promise<{
    classId?: string;
    year?: string;
    month?: string;
    studentId?: string;
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
  const classId = params.classId || undefined;
  const studentId = params.studentId || undefined;

  const register = await getStudentAttendanceRegister(year, month, classId);

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

  const registerPath = `/admin/student/attendance/register`;
  const takePath = classId
    ? `/admin/student/attendance/take?classId=${classId}`
    : `/admin/student/attendance/take`;

  return (
    <div className="space-y-6">
      <BackLink href="/admin/students">← Back to Students</BackLink>
      <StudentAttendanceRegister
        key={`${register.classId ?? "all"}-${register.year}-${register.month}-${studentId ?? "all"}`}
        register={register}
        scope="admin"
        basePath={registerPath}
        takePath={takePath}
        showClassSelector
        initialStudentId={studentId}
      />
    </div>
  );
}
