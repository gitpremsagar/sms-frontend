import { StudentAttendanceRegister } from "@/components/student-attendance/student-attendance-register";
import { BackLink } from "@/components/ui/back-link";
import { getTeacherClassAttendanceRegister } from "@/lib/teacher.server";
import { requireRole } from "@/lib/require-role";

type TeacherClassAttendanceRegisterPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function TeacherClassAttendanceRegisterPage({
  params,
  searchParams,
}: TeacherClassAttendanceRegisterPageProps) {
  await requireRole("TEACHER");

  const { id } = await params;
  const query = await searchParams;
  const now = new Date();
  const year = query.year ? Number(query.year) : now.getFullYear();
  const month = query.month ? Number(query.month) : now.getMonth() + 1;

  const register = await getTeacherClassAttendanceRegister(id, year, month);

  if (!register) {
    return (
      <div className="space-y-4">
        <BackLink href={`/teacher/class/${id}`}>← Back to class</BackLink>
        <p className="text-sm text-muted-foreground">
          Unable to load attendance register. Please try again.
        </p>
      </div>
    );
  }

  const basePath = `/teacher/class/${id}/attendance/register`;
  const takePath = `/teacher/class/${id}/attendance/take`;

  return (
    <div className="space-y-6">
      <BackLink href={`/teacher/class/${id}`}>← Back to {register.className}</BackLink>
      <StudentAttendanceRegister
        key={`${register.classId}-${register.year}-${register.month}`}
        register={register}
        scope="teacher"
        basePath={basePath}
        takePath={takePath}
      />
    </div>
  );
}
