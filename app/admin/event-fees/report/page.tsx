import { EventFeeCollectionReport } from "@/components/event-fees/event-fee-collection-report";
import { getEventFeeReport } from "@/lib/event-fees.server";
import { getFinancialYearStart } from "@/lib/financial-year";
import { requireRole } from "@/lib/require-role";

type AdminEventFeeReportPageProps = {
  searchParams: Promise<{
    financialYearStart?: string;
  }>;
};

export default async function AdminEventFeeReportPage({
  searchParams,
}: AdminEventFeeReportPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const financialYearStart = params.financialYearStart
    ? Number(params.financialYearStart)
    : getFinancialYearStart();

  const report = await getEventFeeReport(financialYearStart);

  if (!report) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load event fee report. Please try again.
        </p>
      </div>
    );
  }

  return <EventFeeCollectionReport report={report} />;
}
