import { EventFeeForm } from "@/components/event-fees/event-fee-form";
import { BackLink } from "@/components/ui/back-link";
import { getClasses } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";

export default async function NewEventFeePage() {
  await requireRole("ADMIN");
  const classes = await getClasses();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="/admin/event-fees">← Back to Event Fees</BackLink>
      <EventFeeForm classes={classes} />
    </div>
  );
}
