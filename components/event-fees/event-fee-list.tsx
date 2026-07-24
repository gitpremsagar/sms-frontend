"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  deleteEventFee,
  eventFeeKindLabel,
  formatCurrency,
  type EventFee,
} from "@/lib/event-fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-8 sm:w-auto";

function formatDueDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type EventFeeListProps = {
  events: EventFee[];
  financialYearStart: number;
};

export function EventFeeList({
  events,
  financialYearStart,
}: EventFeeListProps) {
  const router = useRouter();
  const currentFyStart = getFinancialYearStart();
  const fyOptions = useMemo(
    () => listFinancialYearOptions(currentFyStart, 5),
    [currentFyStart],
  );
  const [fy, setFy] = useState(financialYearStart);

  function applyFilters() {
    router.push(`/admin/event-fees?financialYearStart=${fy}`);
  }

  function resetFilters() {
    setFy(currentFyStart);
    router.push("/admin/event-fees");
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          title="Event Fees"
          description="Create examination and occasion fees with per-class amounts. Teachers can mark collection status from the register."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/admin/event-fees/register?financialYearStart=${financialYearStart}`}
                >
                  Collection register
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/admin/event-fees/report?financialYearStart=${financialYearStart}`}
                >
                  Collection report
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/admin/event-fees/new">Create event</Link>
              </Button>
            </div>
          }
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
            <div className="space-y-1">
              <label htmlFor="fy" className="text-xs text-muted-foreground">
                Financial Year
              </label>
              <select
                id="fy"
                className={selectClassName}
                value={fy}
                onChange={(event) => setFy(Number(event.target.value))}
              >
                {fyOptions.map((option) => (
                  <option key={option.start} value={option.start}>
                    FY {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-1">
              <Button onClick={applyFilters} className="w-full sm:w-auto">
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No events yet</CardTitle>
            <CardDescription>
              No event or examination fees have been created for this financial
              year yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/event-fees/new">Create event fee</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {events.length} event{events.length === 1 ? "" : "s"}
            </CardTitle>
            <CardDescription>
              Amounts shown are the configured class rates for each event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-3 py-2 font-medium">Title</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Due date</th>
                    <th className="px-3 py-2 font-medium">Classes</th>
                    <th className="px-3 py-2 font-medium">Amounts</th>
                    <th className="px-3 py-2 font-medium">Payments</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const amountsPreview = event.classRates
                      .map(
                        (rate) =>
                          `${rate.className}: ${formatCurrency(rate.amount)}`,
                      )
                      .join(", ");

                    return (
                      <tr key={event.id} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{event.title}</td>
                        <td className="px-3 py-2">
                          {eventFeeKindLabel(event.kind)}
                        </td>
                        <td className="px-3 py-2">
                          {formatDueDate(event.dueDate)}
                        </td>
                        <td className="px-3 py-2">
                          {event.classRates.length}
                        </td>
                        <td className="max-w-xs truncate px-3 py-2 text-muted-foreground">
                          {amountsPreview || "—"}
                        </td>
                        <td className="px-3 py-2">{event.paymentCount}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/event-fees/${event.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            {event.paymentCount === 0 ? (
                              <EntityDeleteButton
                                entityLabel="event fee"
                                entityName={event.title}
                                onDelete={() => deleteEventFee(event.id)}
                              />
                            ) : (
                              <span className="self-center text-xs text-muted-foreground">
                                Has payments
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
