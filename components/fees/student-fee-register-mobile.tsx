"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  feeCellColorClass,
  feeStatusSymbolFromCell,
  FeePaymentLegend,
} from "@/components/fees/fee-payment-ui";
import {
  formatCurrency,
  type FeePaymentCell,
  type FeeRegister,
  type FeeRegisterStudent,
} from "@/lib/fees";
import { cn } from "@/lib/utils";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

type StudentFeeRegisterMobileProps = {
  register: FeeRegister;
  students: FeeRegisterStudent[];
  onCellClick: (
    student: FeeRegisterStudent,
    month: number,
    monthLabel: string,
  ) => void;
};

function getCell(
  student: FeeRegisterStudent,
  month: number,
): FeePaymentCell {
  return (
    student.payments[month] ?? {
      status: "UPCOMING" as const,
      amount: 0,
    }
  );
}

export function StudentFeeRegisterMobile({
  register,
  students,
  onCellClick,
}: StudentFeeRegisterMobileProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id ?? "",
  );

  useEffect(() => {
    if (students.length === 0) {
      setSelectedStudentId("");
      return;
    }

    if (!students.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  if (students.length === 0) {
    return null;
  }

  const selectedIndex = students.findIndex(
    (student) => student.id === selectedStudentId,
  );
  const selectedStudent =
    selectedIndex >= 0 ? students[selectedIndex] : students[0];

  function goToPrevious() {
    if (selectedIndex > 0) {
      setSelectedStudentId(students[selectedIndex - 1].id);
    }
  }

  function goToNext() {
    if (selectedIndex < students.length - 1) {
      setSelectedStudentId(students[selectedIndex + 1].id);
    }
  }

  return (
    <div className="space-y-4 md:hidden">
      <FeePaymentLegend collapsible />

      <div className="space-y-2">
        <label htmlFor="mobile-fee-student" className="text-xs text-muted-foreground">
          Select Student
        </label>
        <select
          id="mobile-fee-student"
          value={selectedStudent.id}
          onChange={(event) => setSelectedStudentId(event.target.value)}
          className={selectClassName}
        >
          {students.map((student, index) => (
            <option key={student.id} value={student.id}>
              {index + 1}. {student.name} ({student.className})
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
          {selectedIndex + 1} / {students.length}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={selectedIndex >= students.length - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="font-medium">{selectedStudent.name}</p>
        <p className="text-sm text-muted-foreground">{selectedStudent.className}</p>
        <p className="mt-1 text-sm">
          Monthly fee:{" "}
          <span className="font-medium">
            {formatCurrency(selectedStudent.monthlyFee)}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {register.months.map(({ month, label }) => {
          const cell = getCell(selectedStudent, month);
          const isUpcoming = cell.status === "UPCOMING";

          return (
            <button
              key={month}
              type="button"
              disabled={isUpcoming}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-md border border-[#d4d4d4] px-1 py-2 text-center transition-colors",
                feeCellColorClass(cell.status, { variant: "excel" }),
                !isUpcoming && "active:scale-[0.98]",
                isUpcoming && "cursor-default opacity-80",
              )}
              onClick={() => onCellClick(selectedStudent, month, label)}
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-semibold">
                {feeStatusSymbolFromCell(cell)}
              </span>
              {cell.status === "PARTIAL" ? (
                <span className="text-[10px] font-normal">
                  {formatCurrency(cell.amount)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
