import { TeacherSelfAttendanceRegister } from "@/components/teacher/teacher-self-attendance-register";
import { getTeacherAttendanceRegister } from "@/lib/teacher.server";
import { requireRole } from "@/lib/require-role";

type AttendancePageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function TeacherAttendancePage({
  searchParams,
}: AttendancePageProps) {
  await requireRole("TEACHER");

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const register = await getTeacherAttendanceRegister(year, month);

  if (!register) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load attendance register. Please try again.
        </p>
      </div>
    );
  }

  return <TeacherSelfAttendanceRegister register={register} />;
}
