import { EventFeeList } from "@/components/event-fees/event-fee-list";
import { getEventFees } from "@/lib/event-fees.server";
import { getFinancialYearStart } from "@/lib/financial-year";
import { requireRole } from "@/lib/require-role";

type AdminEventFeesPageProps = {
  searchParams: Promise<{
    financialYearStart?: string;
  }>;
};

export default async function AdminEventFeesPage({
  searchParams,
}: AdminEventFeesPageProps) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const financialYearStart = params.financialYearStart
    ? Number(params.financialYearStart)
    : getFinancialYearStart();

  const events = await getEventFees(financialYearStart);

  return (
    <EventFeeList events={events} financialYearStart={financialYearStart} />
  );
}
