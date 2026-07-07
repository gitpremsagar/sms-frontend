"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  formatCurrency,
  type FeePaymentCellStatus,
  type FeeReport,
} from "@/lib/fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

type FeeCollectionReportProps = {
  report: FeeReport;
};

function statusBadge(status: FeePaymentCellStatus) {
  if (status === "PAID") {
    return (
      <span className="rounded bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        P
      </span>
    );
  }
  if (status === "PARTIAL") {
    return (
      <span className="rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        P
      </span>
    );
  }
  if (status === "UNPAID") {
    return (
      <span className="rounded bg-orange-100 px-1 text-[10px] font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
        U
      </span>
    );
  }
  return (
    <span className="text-[10px] text-muted-foreground">-</span>
  );
}

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
          <div className="flex flex-wrap items-end gap-3">
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
            <Button onClick={applyFilters}>Apply</Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-emerald-50/50 p-4 dark:bg-emerald-950/20">
              <p className="text-xs text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(report.summary.totalCollected)}
              </p>
            </div>
            <div className="rounded-lg border bg-orange-50/50 p-4 dark:bg-orange-950/20">
              <p className="text-xs text-muted-foreground">Total Due</p>
              <p className="text-[11px] text-muted-foreground">
                Excludes the current month
              </p>
              <p className="text-2xl font-semibold text-orange-700 dark:text-orange-400">
                {formatCurrency(report.summary.totalDue)}
              </p>
            </div>
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
            <CardDescription>
              Monthly fee: {formatCurrency(cls.monthlyFee)} · Collected:{" "}
              {formatCurrency(cls.totalCollected)} · Due:{" "}
              {formatCurrency(cls.totalDue)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cls.students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students in this class.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
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
                                cell?.status === "PAID" &&
                                  "bg-emerald-50/50 dark:bg-emerald-950/20",
                                cell?.status === "PARTIAL" &&
                                  "bg-amber-50/50 dark:bg-amber-950/20",
                                cell?.status === "UNPAID" &&
                                  "bg-orange-50/50 dark:bg-orange-950/20",
                              )}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                {statusBadge(cell?.status ?? "UPCOMING")}
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
            )}
          </CardContent>
        </Card>
      ))}

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/admin/fees">Back to Fee Register</Link>
        </Button>
      </div>
    </div>
  );
}
