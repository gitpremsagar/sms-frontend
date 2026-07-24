import { EventFeeForm } from "@/components/event-fees/event-fee-form";
import { BackLink } from "@/components/ui/back-link";
import { getClasses } from "@/lib/classes.server";
import { getEventFeeById } from "@/lib/event-fees.server";
import { requireRole } from "@/lib/require-role";

type EditEventFeePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventFeePage({
  params,
}: EditEventFeePageProps) {
  await requireRole("ADMIN");
  const { id } = await params;
  const [event, classes] = await Promise.all([
    getEventFeeById(id),
    getClasses(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="/admin/event-fees">← Back to Event Fees</BackLink>
      <EventFeeForm classes={classes} event={event} />
    </div>
  );
}
