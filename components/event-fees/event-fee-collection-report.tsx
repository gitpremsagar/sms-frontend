"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EventFeeReportClassMobile } from "@/components/event-fees/event-fee-report-class-mobile";
import {
  feeCellColorClass,
  feeStatusBadge,
} from "@/components/fees/fee-payment-ui";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import {
  eventFeeKindLabel,
  formatCurrency,
  type EventFeeReport,
} from "@/lib/event-fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-8 sm:w-auto";

type EventFeeCollectionReportProps = {
  report: EventFeeReport;
};

export function EventFeeCollectionReport({
  report,
}: EventFeeCollectionReportProps) {
  const router = useRouter();
  const currentFyStart = getFinancialYearStart();
  const fyOptions = useMemo(
    () => listFinancialYearOptions(currentFyStart, 5),
    [currentFyStart],
  );
  const [financialYearStart, setFinancialYearStart] = useState(
    report.financialYearStart,
  );

  function applyFilters() {
    router.push(
      `/admin/event-fees/report?financialYearStart=${financialYearStart}`,
    );
  }

  function resetFilters() {
    setFinancialYearStart(currentFyStart);
    router.push("/admin/event-fees/report");
  }

  return (
    <div className="space-y-6">
      <BackLink href="/admin/event-fees/register">
        ← Back to Event Fee Register
      </BackLink>

      <Card>
        <CardHeader>
          <CardTitle>
            Event Fee Collection Report — FY {report.financialYearLabel}
          </CardTitle>
          <CardDescription>
            Event-wise collection and due totals with full class and student
            breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
            <div className="space-y-1">
              <label htmlFor="fy" className="text-xs text-muted-foreground">
                Financial Year
              </label>
              <select
                id="fy"
                className={selectClassName}
                value={financialYearStart}
                onChange={(event) =>
                  setFinancialYearStart(Number(event.target.value))
                }
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

          <div className="grid gap-3 sm:grid-cols-2 sm:max-w-xl">
            <div className="rounded-lg border bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
              <p className="text-xs text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(report.summary.totalCollected)}
              </p>
            </div>
            <div className="rounded-lg border bg-orange-50/50 p-4 dark:bg-orange-950/20">
              <p className="text-xs text-muted-foreground">Total Due</p>
              <p className="text-2xl font-semibold text-orange-700 dark:text-orange-400">
                {formatCurrency(report.summary.totalDue)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Event-wise Summary</h3>
            {report.summary.eventSummaries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events for this financial year.
              </p>
            ) : (
              <ResponsiveDataTable
                columns={[
                  { key: "title", label: "Event" },
                  {
                    key: "kind",
                    label: "Type",
                    render: (row) => eventFeeKindLabel(row.kind),
                  },
                  {
                    key: "collected",
                    label: "Collected",
                    render: (row) => formatCurrency(row.collected),
                  },
                  {
                    key: "due",
                    label: "Due",
                    render: (row) => formatCurrency(row.due),
                  },
                  {
                    key: "paidCount",
                    label: "Paid",
                    render: (row) => String(row.paidCount),
                  },
                  {
                    key: "unpaidCount",
                    label: "Unpaid",
                    render: (row) => String(row.unpaidCount),
                  },
                ]}
                rows={report.summary.eventSummaries}
                rowKey={(row) => row.eventFeeId}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {report.classes.map((cls) => (
        <Card key={cls.classId}>
          <CardHeader>
            <CardTitle>{cls.className}</CardTitle>
            <CardDescription className="hidden md:block">
              Collected: {formatCurrency(cls.totalCollected)} · Due:{" "}
              {formatCurrency(cls.totalDue)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cls.students.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No students in this class.
              </p>
            ) : (
              <>
                <EventFeeReportClassMobile
                  cls={cls}
                  events={report.events}
                />

                <div className="hidden overflow-x-auto rounded-lg border md:block">
                  <table className="w-max min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="sticky left-0 z-10 min-w-24 border-r bg-muted/40 px-3 py-2 text-left font-medium">
                          Roll No
                        </th>
                        <th className="sticky left-24 z-10 min-w-36 border-r bg-muted/40 px-3 py-2 text-left font-medium">
                          Name
                        </th>
                        {report.events.map((event) => (
                          <th
                            key={event.id}
                            className="min-w-28 border-r px-1 py-2 text-center text-xs font-medium"
                          >
                            {event.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cls.students.map((student) => (
                        <tr
                          key={student.id}
                          className="border-b hover:bg-muted/20"
                        >
                          <td className="sticky left-0 z-10 border-r bg-background px-3 py-2">
                            {student.rollNumber}
                          </td>
                          <td className="sticky left-24 z-10 border-r bg-background px-3 py-2">
                            {student.name}
                          </td>
                          {report.events.map((event) => {
                            const cell = student.payments[event.id];
                            if (!cell) {
                              return (
                                <td
                                  key={event.id}
                                  className="border-r px-1 py-2 text-center text-xs text-muted-foreground"
                                >
                                  —
                                </td>
                              );
                            }

                            return (
                              <td
                                key={event.id}
                                className={cn(
                                  "border-r px-1 py-2 text-center text-xs",
                                  feeCellColorClass(cell.status, {
                                    variant: "card",
                                    interactive: false,
                                  }),
                                )}
                              >
                                <div className="flex flex-col items-center gap-0.5">
                                  {feeStatusBadge(cell.status)}
                                  {cell.status === "PAID" ? (
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                      {formatCurrency(cell.amount)}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-orange-700 dark:text-orange-400">
                                      Due {formatCurrency(cell.dueAmount)}
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="bg-muted/30 font-medium">
                        <td
                          className="sticky left-0 z-10 border-r bg-muted/30 px-3 py-2"
                          colSpan={2}
                        >
                          Class totals
                        </td>
                        {report.events.map((event) => {
                          const totals = cls.eventTotals[event.id];
                          return (
                            <td
                              key={event.id}
                              className="border-r px-1 py-2 text-center text-[10px]"
                            >
                              <div className="text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(totals?.collected ?? 0)}
                              </div>
                              <div className="text-orange-700 dark:text-orange-400">
                                {formatCurrency(totals?.due ?? 0)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="text-center">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href="/admin/event-fees/register">
            Back to Event Fee Register
          </Link>
        </Button>
      </div>
    </div>
  );
}
