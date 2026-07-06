import { FeeCollectionReport } from "@/components/admin/fee-collection-report";
import { getFeeReport } from "@/lib/fees.server";
import { getFinancialYearStart } from "@/lib/financial-year";
import { requireRole } from "@/lib/require-role";

type AdminFeeReportPageProps = {
  searchParams: Promise<{
    financialYearStart?: string;
  }>;
};

export default async function AdminFeeReportPage({
  searchParams,
}: AdminFeeReportPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const financialYearStart = params.financialYearStart
    ? Number(params.financialYearStart)
    : getFinancialYearStart();

  const report = await getFeeReport(financialYearStart);

  if (!report) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load fee report. Please try again.
        </p>
      </div>
    );
  }

  return <FeeCollectionReport report={report} />;
}
