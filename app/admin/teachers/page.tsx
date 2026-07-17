import { TeacherSalaryRegister } from "@/components/admin/teacher-salary-register";
import { getSalaryRegister } from "@/lib/salary.server";
import { requireRole } from "@/lib/require-role";

type TeachersPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function AdminTeachersPage({
  searchParams,
}: TeachersPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const register = await getSalaryRegister(year, month);

  if (!register) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load salary register. Please try again.
        </p>
      </div>
    );
  }

  return <TeacherSalaryRegister register={register} />;
}
