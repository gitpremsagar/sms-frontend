import { EventFeeRegisterView } from "@/components/event-fees/event-fee-register";
import { getEventFeeRegister } from "@/lib/event-fees.server";
import { getFinancialYearStart } from "@/lib/financial-year";
import { requireRole } from "@/lib/require-role";

type TeacherEventFeesPageProps = {
  searchParams: Promise<{
    financialYearStart?: string;
    eventFeeId?: string;
    classId?: string;
  }>;
};

export default async function TeacherEventFeesPage({
  searchParams,
}: TeacherEventFeesPageProps) {
  await requireRole("TEACHER");

  const params = await searchParams;
  const financialYearStart = params.financialYearStart
    ? Number(params.financialYearStart)
    : getFinancialYearStart();

  const register = await getEventFeeRegister(financialYearStart, {
    eventFeeId: params.eventFeeId,
    classId: params.classId,
  });

  if (!register) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Unable to load event fee register. Please try again.
        </p>
      </div>
    );
  }

  return (
    <EventFeeRegisterView
      register={register}
      basePath="/teacher/event-fees"
      initialEventFeeId={params.eventFeeId ?? ""}
      initialClassId={params.classId ?? ""}
    />
  );
}
