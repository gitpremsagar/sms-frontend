"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FeeReportClassMobile } from "@/components/admin/fee-report-class-mobile";
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
import { formatCurrency, type FeeReport } from "@/lib/fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-8 sm:w-auto";

type FeeCollectionReportProps = {
  report: FeeReport;
};

export function FeeCollectionReport({ report }: FeeCollectionReportProps) {
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
      `/admin/fees/report?financialYearStart=${financialYearStart}`,
    );
  }

  function resetFilters() {
    setFinancialYearStart(currentFyStart);
    router.push("/admin/fees/report");
  }

  return (
    <div className="space-y-6">
      <BackLink href="/admin/fees">← Back to Fee Register</BackLink>

      <Card>
        <CardHeader>
          <CardTitle>Fee Collection Report — FY {report.financialYearLabel}</CardTitle>
          <CardDescription>
            Month-wise collection and due totals with full class and student
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
                onChange={(event) => setFinancialYearStart(Number(event.target.value))}
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
              <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                Reset
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-orange-50/50 p-4 dark:bg-orange-950/20 sm:max-w-sm">
            <p className="text-xs text-muted-foreground">Total Due</p>
            <p className="text-[11px] text-muted-foreground">
              Excludes the current month
            </p>
            <p className="text-2xl font-semibold text-orange-700 dark:text-orange-400">
              {formatCurrency(report.summary.totalDue)}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Month-wise Summary</h3>
            <ResponsiveDataTable
              columns={[
                { key: "label", label: "Month" },
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
              ]}
              rows={report.summary.monthSummaries}
              rowKey={(row) => String(row.month)}
            />
          </div>
        </CardContent>
      </Card>

      {report.classes.map((cls) => (
        <Card key={cls.classId}>
          <CardHeader>
            <CardTitle>{cls.className}</CardTitle>
            <CardDescription className="hidden md:block">
              Monthly fee: {formatCurrency(cls.monthlyFee)} · Collected:{" "}
              {formatCurrency(cls.totalCollected)} · Due:{" "}
              {formatCurrency(cls.totalDue)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cls.students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students in this class.</p>
            ) : (
              <>
                <FeeReportClassMobile cls={cls} months={report.months} />

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
                        <th className="sticky left-[15rem] z-10 min-w-24 border-r bg-muted/40 px-3 py-2 text-right font-medium">
                          Fee/mo
                        </th>
                        {report.months.map(({ month, label }) => (
                          <th
                            key={month}
                            className="min-w-16 border-r px-1 py-2 text-center text-xs font-medium"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cls.students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-muted/20">
                          <td className="sticky left-0 z-10 border-r bg-background px-3 py-2">
                            {student.rollNumber}
                          </td>
                          <td className="sticky left-24 z-10 border-r bg-background px-3 py-2">
                            {student.name}
                          </td>
                          <td className="sticky left-[15rem] z-10 border-r bg-background px-3 py-2 text-right">
                            {formatCurrency(student.monthlyFee)}
                          </td>
                          {report.months.map(({ month }) => {
                            const cell = student.payments[month];
                            const paid = cell?.amount ?? 0;
                            const due =
                              cell?.status !== "UPCOMING"
                                ? student.monthlyFee - paid
                                : 0;

                            return (
                              <td
                                key={month}
                                className={cn(
                                  "border-r px-1 py-2 text-center text-xs",
                                  feeCellColorClass(cell?.status, {
                                    variant: "card",
                                    interactive: false,
                                  }),
                                )}
                              >
                                <div className="flex flex-col items-center gap-0.5">
                                  {feeStatusBadge(cell?.status ?? "UPCOMING")}
                                  {cell?.status !== "UPCOMING" ? (
                                    <>
                                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                                        {formatCurrency(paid)}
                                      </span>
                                      {due > 0 ? (
                                        <span className="text-[10px] text-orange-700 dark:text-orange-400">
                                          Due {formatCurrency(due)}
                                        </span>
                                      ) : null}
                                    </>
                                  ) : null}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="bg-muted/30 font-medium">
                        <td
                          className="sticky left-0 z-10 border-r bg-muted/30 px-3 py-2"
                          colSpan={3}
                        >
                          Class totals
                        </td>
                        {report.months.map(({ month }) => {
                          const totals = cls.monthTotals[month];
                          return (
                            <td key={month} className="border-r px-1 py-2 text-center text-[10px]">
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
          <Link href="/admin/fees">Back to Fee Register</Link>
        </Button>
      </div>
    </div>
  );
}
