import { StudentFeeRegister } from "@/components/fees/student-fee-register";
import { getFeeRegister } from "@/lib/fees.server";
import { getFinancialYearStart } from "@/lib/financial-year";
import { requireRole } from "@/lib/require-role";

type AdminFeesPageProps = {
  searchParams: Promise<{
    financialYearStart?: string;
    classId?: string;
  }>;
};

export default async function AdminFeesPage({ searchParams }: AdminFeesPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const financialYearStart = params.financialYearStart
    ? Number(params.financialYearStart)
    : getFinancialYearStart();
  const classId = params.classId;

  const register = await getFeeRegister(financialYearStart, classId);

  if (!register) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load fee register. Please try again.
        </p>
      </div>
    );
  }

  return (
    <StudentFeeRegister
      register={register}
      basePath="/admin/fees"
      showReportLink
    />
  );
}
