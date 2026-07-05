import { TeacherSalaryView } from "@/components/teacher/teacher-salary-view";
import { getTeacherSalary } from "@/lib/teacher.server";
import { requireRole } from "@/lib/require-role";

type TeacherSalaryPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function TeacherSalaryPage({
  searchParams,
}: TeacherSalaryPageProps) {
  await requireRole("TEACHER");

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const breakdown = await getTeacherSalary(year, month);

  if (!breakdown) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load salary details. Please try again.
        </p>
      </div>
    );
  }

  return (
    <TeacherSalaryView breakdown={breakdown} year={year} month={month} />
  );
}
