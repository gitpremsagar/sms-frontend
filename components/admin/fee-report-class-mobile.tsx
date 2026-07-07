"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  feeCellColorClass,
  feeStatusBadge,
} from "@/components/fees/fee-payment-ui";
import {
  formatCurrency,
  type FeeReportClassBreakdown,
  type FeeReportStudentRow,
} from "@/lib/fees";
import { cn } from "@/lib/utils";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

type FeeReportClassMobileProps = {
  cls: FeeReportClassBreakdown;
  months: { month: number; label: string; calendarYear: number }[];
};

export function FeeReportClassMobile({ cls, months }: FeeReportClassMobileProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    cls.students[0]?.id ?? "",
  );

  useEffect(() => {
    if (cls.students.length === 0) {
      setSelectedStudentId("");
      return;
    }

    if (!cls.students.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(cls.students[0].id);
    }
  }, [cls.students, selectedStudentId]);

  if (cls.students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground md:hidden">
        No students in this class.
      </p>
    );
  }

  const selectedIndex = cls.students.findIndex(
    (student) => student.id === selectedStudentId,
  );
  const selectedStudent: FeeReportStudentRow =
    selectedIndex >= 0 ? cls.students[selectedIndex] : cls.students[0];

  function goToPrevious() {
    if (selectedIndex > 0) {
      setSelectedStudentId(cls.students[selectedIndex - 1].id);
    }
  }

  function goToNext() {
    if (selectedIndex < cls.students.length - 1) {
      setSelectedStudentId(cls.students[selectedIndex + 1].id);
    }
  }

  return (
    <div className="space-y-4 md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Monthly fee</p>
          <p className="text-sm font-semibold">{formatCurrency(cls.monthlyFee)}</p>
        </div>
        <div className="rounded-lg border bg-emerald-50/50 p-3 text-center dark:bg-emerald-950/20">
          <p className="text-[10px] text-muted-foreground">Collected</p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(cls.totalCollected)}
          </p>
        </div>
        <div className="rounded-lg border bg-orange-50/50 p-3 text-center dark:bg-orange-950/20">
          <p className="text-[10px] text-muted-foreground">Due</p>
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
            {formatCurrency(cls.totalDue)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`mobile-report-student-${cls.classId}`} className="text-xs text-muted-foreground">
          Select Student
        </label>
        <select
          id={`mobile-report-student-${cls.classId}`}
          value={selectedStudent.id}
          onChange={(event) => setSelectedStudentId(event.target.value)}
          className={selectClassName}
        >
          {cls.students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.rollNumber}. {student.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={selectedIndex <= 0}
          className="flex-1"
        >
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Button>
        <span className="shrink-0 text-xs text-muted-foreground">
          {selectedIndex + 1} / {cls.students.length}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={selectedIndex >= cls.students.length - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="font-medium">{selectedStudent.name}</p>
        <p className="text-sm text-muted-foreground">
          Roll No: {selectedStudent.rollNumber}
        </p>
        <p className="mt-1 text-sm">
          Monthly fee:{" "}
          <span className="font-medium">
            {formatCurrency(selectedStudent.monthlyFee)}
          </span>
        </p>
      </div>

      <div className="space-y-2">
        {months.map(({ month, label }) => {
          const cell = selectedStudent.payments[month];
          const status = cell?.status ?? "UPCOMING";
          const paid = cell?.amount ?? 0;
          const due =
            status !== "UPCOMING" ? selectedStudent.monthlyFee - paid : 0;

          return (
            <div
              key={month}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
                feeCellColorClass(status, { variant: "card", interactive: false }),
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                {status !== "UPCOMING" ? (
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    <span className="text-emerald-700 dark:text-emerald-400">
                      Paid {formatCurrency(paid)}
                    </span>
                    {due > 0 ? (
                      <span className="text-orange-700 dark:text-orange-400">
                        Due {formatCurrency(due)}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-0.5 text-xs text-muted-foreground">Upcoming</p>
                )}
              </div>
              <div className="shrink-0">{feeStatusBadge(status)}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-3 text-sm font-semibold">Class totals by month</p>
        <div className="space-y-2">
          {months.map(({ month, label }) => {
            const totals = cls.monthTotals[month];
            return (
              <div
                key={month}
                className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium">{label}</span>
                <div className="text-right text-xs">
                  <div className="text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(totals?.collected ?? 0)}
                  </div>
                  <div className="text-orange-700 dark:text-orange-400">
                    Due {formatCurrency(totals?.due ?? 0)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
