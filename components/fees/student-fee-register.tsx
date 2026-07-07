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
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  feeCellColorClass,
  feeStatusLabel,
  feeStatusSymbolFromCell,
  FeePaymentLegend,
} from "@/components/fees/fee-payment-ui";
import { StudentFeeRegisterMobile } from "@/components/fees/student-fee-register-mobile";
import { ApiError } from "@/lib/api";
import {
  formatCurrency,
  updateFeePayment,
  type FeePaymentCell,
  type FeeRegister,
  type FeeRegisterStudent,
} from "@/lib/fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";
import {
  nextSortDirection,
  sortRows,
  type SortDirection,
} from "@/lib/table-sort";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-8 sm:w-auto";

const excelCellBorder = "border border-[#d4d4d4]";
const excelHeaderClass = "border border-[#d4d4d4] bg-[#f0f0f0] text-[#212121]";
const excelBodyCellClass =
  "border border-[#d4d4d4] bg-white px-2 py-1 text-[13px] text-[#212121] group-hover:bg-[#d8e9f8]";

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

function cellClassName(cell: FeePaymentCell): string {
  return cn(
    "min-w-[52px] cursor-pointer px-1 py-1 text-center text-xs font-normal transition-colors",
    excelCellBorder,
    "group-hover:bg-[#d8e9f8]",
    feeCellColorClass(cell.status, { variant: "excel" }),
  );
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

type IndexedFeeStudent = {
  student: FeeRegisterStudent;
  originalIndex: number;
};

function getFeePaymentSortValue(
  student: FeeRegisterStudent,
  month: number,
): number {
  const cell = student.payments[month];
  if (!cell || cell.status === "UPCOMING") {
    return -2;
  }
  if (cell.status === "UNPAID") {
    return -1;
  }
  if (cell.status === "PARTIAL") {
    return cell.amount;
  }
  return student.monthlyFee;
}

function getFeeSortValue(entry: IndexedFeeStudent, sortKey: string): string | number {
  const { student, originalIndex } = entry;

  if (sortKey === "serialNumber") {
    return originalIndex;
  }
  if (sortKey === "name") {
    return student.name;
  }
  if (sortKey === "className") {
    return student.className;
  }
  if (sortKey.startsWith("month-")) {
    const month = Number(sortKey.slice(6));
    return getFeePaymentSortValue(student, month);
  }

  return originalIndex;
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
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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

  const sortedStudents = useMemo(() => {
    const indexedStudents = filteredStudents.map((student, index) => ({
      student,
      originalIndex: index,
    }));

    return sortRows(indexedStudents, sortKey, sortDirection, getFeeSortValue).map(
      (entry) => entry.student,
    );
  }, [filteredStudents, sortDirection, sortKey]);

  function handleSort(nextKey: string) {
    setSortDirection((currentDirection) =>
      nextSortDirection(sortKey, nextKey, currentDirection),
    );
    setSortKey(nextKey);
  }

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
              <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                <Link href={`/admin/fees/report?financialYearStart=${register.financialYearStart}`}>
                  View detailed report →
                </Link>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-1">
              <Button onClick={applyFilters} className="w-full sm:w-auto">
                Apply
              </Button>
              <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                Reset
              </Button>
            </div>
          </div>

          <div className="hidden md:block">
            <FeePaymentLegend />
          </div>

          {register.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students found. Add students and set class monthly fees first.
            </p>
          ) : (
            <>
              <div className="w-full space-y-2 sm:max-w-sm">
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

              {sortedStudents.length > 0 ? (
                <>
              <div className="hidden overflow-x-auto border border-[#b4b4b4] bg-white md:block">
                <table className="w-max min-w-full border-collapse text-[13px] leading-tight">
                  <thead>
                    <tr>
                      <SortableTableHead
                        label="S.No."
                        sortKey="serialNumber"
                        activeSortKey={sortKey}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        variant="excel"
                        className={cn(
                          "sticky left-0 z-20 min-w-12 px-2 py-1.5",
                          excelHeaderClass,
                        )}
                      />
                      <SortableTableHead
                        label="Name"
                        sortKey="name"
                        activeSortKey={sortKey}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        variant="excel"
                        className={cn(
                          "sticky left-12 z-20 min-w-40 px-2 py-1.5",
                          excelHeaderClass,
                        )}
                      />
                      <SortableTableHead
                        label="Class"
                        sortKey="className"
                        activeSortKey={sortKey}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        variant="excel"
                        className={cn(
                          "sticky left-[13rem] z-20 min-w-24 px-2 py-1.5",
                          excelHeaderClass,
                        )}
                      />
                      {register.months.map(({ month, label, calendarYear }) => (
                        <SortableTableHead
                          key={month}
                          label={label}
                          sortKey={`month-${month}`}
                          activeSortKey={sortKey}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                          align="center"
                          title={`${label} ${calendarYear}`}
                          variant="excel"
                          className={cn(
                            "min-w-[52px] px-1 py-1.5 text-xs",
                            excelHeaderClass,
                          )}
                        />
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((student, index) => (
                      <tr key={student.id} className="group">
                        <td
                          className={cn(
                            "sticky left-0 z-10",
                            excelBodyCellClass,
                          )}
                        >
                          {index + 1}
                        </td>
                        <td
                          className={cn(
                            "sticky left-12 z-10",
                            excelBodyCellClass,
                          )}
                        >
                          {student.name}
                        </td>
                        <td
                          className={cn(
                            "sticky left-[13rem] z-10",
                            excelBodyCellClass,
                          )}
                        >
                          {student.className}
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
                                <span>{feeStatusSymbolFromCell(cell)}</span>
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

              <StudentFeeRegisterMobile
                register={register}
                students={sortedStudents}
                onCellClick={openCell}
              />
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
                {selectedCell ? feeStatusLabel(selectedCell.cell.status) : "—"}
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

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
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
