import { TeacherAttendanceRegister } from "@/components/admin/teacher-attendance-register";
import { getAttendanceRegister } from "@/lib/attendance.server";
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
  await requireRole("ADMIN");

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const register = await getAttendanceRegister(year, month);

  if (!register) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load attendance register. Please try again.
        </p>
      </div>
    );
  }

  return <TeacherAttendanceRegister register={register} />;
}
