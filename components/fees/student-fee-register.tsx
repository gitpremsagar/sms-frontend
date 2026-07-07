"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import {
  formatCurrency,
  updateFeePayment,
  type FeePaymentCell,
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
  cell: FeePaymentCell;
};

function cellSymbol(cell: FeePaymentCell): string {
  if (cell.status === "PAID") {
    return "P";
  }
  if (cell.status === "PARTIAL") {
    return "P";
  }
  if (cell.status === "UNPAID") {
    return "U";
  }
  return "-";
}

function cellClassName(cell: FeePaymentCell): string {
  return cn(
    "min-w-10 cursor-pointer border-b border-r px-1 py-2 text-center text-xs font-semibold transition-colors hover:bg-muted/50",
    cell.status === "PAID" &&
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    cell.status === "PARTIAL" &&
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    cell.status === "UNPAID" &&
      "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    cell.status === "UPCOMING" && "cursor-default text-muted-foreground",
  );
}

function statusLabel(status: FeePaymentCellStatus): string {
  if (status === "PAID") {
    return "Paid";
  }
  if (status === "PARTIAL") {
    return "Partial";
  }
  if (status === "UNPAID") {
    return "Unpaid";
  }
  return "Upcoming";
}

function getDefaultAmount(
  student: FeeRegisterStudent,
  month: number,
): number {
  const cell = student.payments[month];
  if (cell && cell.status !== "UPCOMING" && cell.amount > 0) {
    return cell.amount;
  }
  return student.monthlyFee;
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
  const [nameSearch, setNameSearch] = useState("");
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCell) {
      return;
    }

    setAmountInput(String(getDefaultAmount(selectedCell.student, selectedCell.month)));
  }, [selectedCell]);

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
    const cell = student.payments[month];
    if (!cell || cell.status === "UPCOMING") {
      return;
    }

    setSelectedCell({ student, month, monthLabel, cell });
    setError(null);
    setDialogOpen(true);
  }

  async function saveAmount(amount: number) {
    if (!selectedCell) {
      return;
    }

    if (amount > selectedCell.student.monthlyFee) {
      setError(
        `Amount cannot exceed the monthly fee of ${formatCurrency(selectedCell.student.monthlyFee)}`,
      );
      return;
    }

    if (amount < 0) {
      setError("Amount cannot be negative");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateFeePayment({
        studentId: selectedCell.student.id,
        financialYearStart: register.financialYearStart,
        month: selectedCell.month,
        amount,
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

  function handleSave() {
    const amount = Number(amountInput);
    if (Number.isNaN(amount)) {
      setError("Enter a valid amount");
      return;
    }
    void saveAmount(amount);
  }

  function handleMarkUnpaid() {
    void saveAmount(0);
  }

  const parsedAmount = Number(amountInput);
  const monthlyFee = selectedCell?.student.monthlyFee ?? 0;
  const dueAmount =
    selectedCell && !Number.isNaN(parsedAmount)
      ? Math.max(0, monthlyFee - parsedAmount)
      : monthlyFee;

  const filteredStudents = useMemo(() => {
    const normalizedSearch = nameSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return register.students;
    }

    return register.students.filter((student) =>
      student.name.toLowerCase().includes(normalizedSearch),
    );
  }, [register.students, nameSearch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Fee Register — FY {register.financialYearLabel}</CardTitle>
              <CardDescription>
                Click a month cell to record the amount paid. Full payment marks
                all earlier months as paid. Partial payment applies only to the
                selected month.
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
              <span className="font-semibold text-amber-700">P</span> = Partial
            </span>
            <span>
              <span className="font-semibold text-orange-700">U</span> = Unpaid
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
              <div className="max-w-sm space-y-2">
                <Label htmlFor="fee-student-search">Search by Name</Label>
                <Input
                  id="fee-student-search"
                  type="search"
                  placeholder="Search students..."
                  value={nameSearch}
                  onChange={(event) => setNameSearch(event.target.value)}
                />
              </div>

              {filteredStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No students match your search.
                </p>
              ) : null}

              {filteredStudents.length > 0 ? (
                <>
              <div className="hidden overflow-x-auto rounded-lg border md:block">
                <table className="w-max min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="sticky left-0 z-20 min-w-16 border-r bg-muted/40 px-3 py-2 text-left font-medium">
                        S.No.
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
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-muted/20">
                        <td className="sticky left-0 z-10 border-r bg-background px-3 py-2">
                          {index + 1}
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
                          const cell = student.payments[month] ?? {
                            status: "UPCOMING" as const,
                            amount: 0,
                          };
                          return (
                            <td
                              key={month}
                              className={cellClassName(cell)}
                              onClick={() => openCell(student, month, label)}
                              title={`${student.name} — ${label}`}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span>{cellSymbol(cell)}</span>
                                {cell.status === "PARTIAL" ? (
                                  <span className="text-[9px] font-normal">
                                    {formatCurrency(cell.amount)}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {filteredStudents.map((student, index) => (
                  <div key={student.id} className="rounded-lg border p-3">
                    <div className="mb-2 space-y-1">
                      <p className="font-medium">
                        {index + 1}. {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.className} · {formatCurrency(student.monthlyFee)}/mo
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {register.months.map(({ month, label }) => {
                        const cell = student.payments[month] ?? {
                          status: "UPCOMING" as const,
                          amount: 0,
                        };
                        return (
                          <button
                            key={month}
                            type="button"
                            disabled={cell.status === "UPCOMING"}
                            className={cn(cellClassName(cell), "rounded border")}
                            onClick={() => openCell(student, month, label)}
                          >
                            <span className="block text-[10px] text-muted-foreground">
                              {label}
                            </span>
                            <span>{cellSymbol(cell)}</span>
                            {cell.status === "PARTIAL" ? (
                              <span className="block text-[9px] font-normal">
                                {formatCurrency(cell.amount)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
                </>
              ) : null}
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

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Monthly fee:{" "}
              <span className="font-medium text-foreground">
                {selectedCell ? formatCurrency(selectedCell.student.monthlyFee) : "—"}
              </span>
              . Current status:{" "}
              <span className="font-medium text-foreground">
                {selectedCell ? statusLabel(selectedCell.cell.status) : "—"}
              </span>
              {selectedCell && selectedCell.cell.amount > 0 ? (
                <>
                  {" "}
                  · Paid: {formatCurrency(selectedCell.cell.amount)}
                </>
              ) : null}
            </p>

            <div className="space-y-1">
              <label htmlFor="amountPaid" className="text-xs text-muted-foreground">
                Amount paid
              </label>
              <Input
                id="amountPaid"
                type="number"
                min={0}
                max={monthlyFee}
                step={1}
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Due after payment: {formatCurrency(dueAmount)}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleMarkUnpaid}
              disabled={loading}
            >
              Mark Unpaid
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
