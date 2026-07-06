"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import {
  formatCurrency,
  updateFeePayment,
  type FeePaymentCellStatus,
  type FeeRegister,
  type FeeRegisterStudent,
} from "@/lib/fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

type StudentFeeRegisterProps = {
  register: FeeRegister;
  basePath: "/admin/fees" | "/teacher/fees";
  showReportLink?: boolean;
};

type SelectedCell = {
  student: FeeRegisterStudent;
  month: number;
  monthLabel: string;
  status: FeePaymentCellStatus;
};

function cellSymbol(status: FeePaymentCellStatus): string {
  if (status === "PAID") {
    return "P";
  }
  if (status === "UNPAID") {
    return "U";
  }
  return "-";
}

function cellClassName(status: FeePaymentCellStatus): string {
  return cn(
    "min-w-10 cursor-pointer border-b border-r px-1 py-2 text-center text-xs font-semibold transition-colors hover:bg-muted/50",
    status === "PAID" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    status === "UNPAID" && "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    status === "UPCOMING" && "cursor-default text-muted-foreground",
  );
}

export function StudentFeeRegister({
  register,
  basePath,
  showReportLink = false,
}: StudentFeeRegisterProps) {
  const router = useRouter();
  const currentFyStart = getFinancialYearStart();
  const fyOptions = useMemo(
    () => listFinancialYearOptions(currentFyStart, 5),
    [currentFyStart],
  );

  const [financialYearStart, setFinancialYearStart] = useState(
    register.financialYearStart,
  );
  const [classId, setClassId] = useState("");
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyFilters() {
    const params = new URLSearchParams({
      financialYearStart: String(financialYearStart),
    });
    if (classId) {
      params.set("classId", classId);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function resetFilters() {
    setFinancialYearStart(currentFyStart);
    setClassId("");
    router.push(basePath);
  }

  function openCell(student: FeeRegisterStudent, month: number, monthLabel: string) {
    const status = student.payments[month];
    if (!status || status === "UPCOMING") {
      return;
    }

    setSelectedCell({ student, month, monthLabel, status });
    setError(null);
    setDialogOpen(true);
  }

  async function confirmStatusChange(status: "PAID" | "UNPAID") {
    if (!selectedCell) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateFeePayment({
        studentId: selectedCell.student.id,
        financialYearStart: register.financialYearStart,
        month: selectedCell.month,
        status,
      });
      setDialogOpen(false);
      setSelectedCell(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Fee Register — FY {register.financialYearLabel}</CardTitle>
              <CardDescription>
                Click a month cell to mark fee as paid or unpaid. Marking a month
                paid automatically marks all earlier months in this financial year
                as paid.
              </CardDescription>
            </div>
            {showReportLink ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/fees/report?financialYearStart=${register.financialYearStart}`}>
                  View detailed report →
                </Link>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="space-y-1">
              <label htmlFor="classId" className="text-xs text-muted-foreground">
                Class
              </label>
              <select
                id="classId"
                className={selectClassName}
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
              >
                <option value="">All classes</option>
                {register.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={applyFilters}>Apply</Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-emerald-700">P</span> = Paid
            </span>
            <span>
              <span className="font-semibold text-orange-700">U</span> = Unpaid (due)
            </span>
            <span>
              <span className="font-semibold">-</span> = Upcoming
            </span>
          </div>

          {register.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students found. Add students and set class monthly fees first.
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-lg border md:block">
                <table className="w-max min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="sticky left-0 z-20 min-w-24 border-r bg-muted/40 px-3 py-2 text-left font-medium">
                        Roll No
                      </th>
                      <th className="sticky left-24 z-20 min-w-36 border-r bg-muted/40 px-3 py-2 text-left font-medium">
                        Name
                      </th>
                      <th className="sticky left-[15rem] z-20 min-w-24 border-r bg-muted/40 px-3 py-2 text-left font-medium">
                        Class
                      </th>
                      <th className="sticky left-[21rem] z-20 min-w-24 border-r bg-muted/40 px-3 py-2 text-right font-medium">
                        Fee/mo
                      </th>
                      {register.months.map(({ month, label, calendarYear }) => (
                        <th
                          key={month}
                          className="min-w-10 border-r px-1 py-2 text-center text-xs font-medium"
                          title={`${label} ${calendarYear}`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {register.students.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/20">
                        <td className="sticky left-0 z-10 border-r bg-background px-3 py-2">
                          {student.rollNumber}
                        </td>
                        <td className="sticky left-24 z-10 border-r bg-background px-3 py-2">
                          {student.name}
                        </td>
                        <td className="sticky left-[15rem] z-10 border-r bg-background px-3 py-2">
                          {student.className}
                        </td>
                        <td className="sticky left-[21rem] z-10 border-r bg-background px-3 py-2 text-right">
                          {formatCurrency(student.monthlyFee)}
                        </td>
                        {register.months.map(({ month, label }) => {
                          const status = student.payments[month] ?? "UPCOMING";
                          return (
                            <td
                              key={month}
                              className={cellClassName(status)}
                              onClick={() => openCell(student, month, label)}
                              title={`${student.name} — ${label}`}
                            >
                              {cellSymbol(status)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {register.students.map((student) => (
                  <div key={student.id} className="rounded-lg border p-3">
                    <div className="mb-2 space-y-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.rollNumber} · {student.className} ·{" "}
                        {formatCurrency(student.monthlyFee)}/mo
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {register.months.map(({ month, label }) => {
                        const status = student.payments[month] ?? "UPCOMING";
                        return (
                          <button
                            key={month}
                            type="button"
                            disabled={status === "UPCOMING"}
                            className={cn(cellClassName(status), "rounded border")}
                            onClick={() => openCell(student, month, label)}
                          >
                            <span className="block text-[10px] text-muted-foreground">
                              {label}
                            </span>
                            {cellSymbol(status)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Fee Payment</DialogTitle>
            <DialogDescription>
              {selectedCell
                ? `${selectedCell.student.name} — ${selectedCell.monthLabel} (FY ${register.financialYearLabel})`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <p className="text-sm text-muted-foreground">
            Monthly fee:{" "}
            {selectedCell
              ? formatCurrency(selectedCell.student.monthlyFee)
              : "—"}
            . Current status:{" "}
            <span className="font-medium">
              {selectedCell?.status === "PAID" ? "Paid" : "Unpaid"}
            </span>
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {selectedCell?.status !== "UNPAID" ? (
              <Button
                variant="outline"
                onClick={() => confirmStatusChange("UNPAID")}
                disabled={loading}
              >
                Mark Unpaid
              </Button>
            ) : null}
            {selectedCell?.status !== "PAID" ? (
              <Button
                onClick={() => confirmStatusChange("PAID")}
                disabled={loading}
              >
                {loading ? "Saving..." : "Mark Paid"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
