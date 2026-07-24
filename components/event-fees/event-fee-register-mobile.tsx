"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  feeCellColorClass,
  feeStatusBadge,
  formatFeePaymentDate,
} from "@/components/fees/fee-payment-ui";
import { Button } from "@/components/ui/button";
import {
  eventFeeKindLabel,
  formatCurrency,
  type EventFeePaymentCell,
  type EventFeeRegister,
  type EventFeeRegisterStudent,
} from "@/lib/event-fees";
import { cn } from "@/lib/utils";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

type EventFeeRegisterMobileProps = {
  register: EventFeeRegister;
  students: EventFeeRegisterStudent[];
  onCellClick: (
    student: EventFeeRegisterStudent,
    eventFeeId: string,
    eventTitle: string,
    cell: EventFeePaymentCell,
  ) => void;
};

export function EventFeeRegisterMobile({
  register,
  students,
  onCellClick,
}: EventFeeRegisterMobileProps) {
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
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-[#375623]">P</span> = Paid
        </span>
        <span>
          <span className="font-semibold text-[#c65911]">U</span> = Unpaid
        </span>
        <span>
          <span className="font-semibold">—</span> = Not applicable
        </span>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="mobile-event-fee-student"
          className="text-xs text-muted-foreground"
        >
          Select Student
        </label>
        <select
          id="mobile-event-fee-student"
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
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        <p className="shrink-0 text-xs text-muted-foreground">
          {selectedIndex + 1} / {students.length}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={selectedIndex >= students.length - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="border-b bg-muted/40 px-3 py-2">
          <p className="font-medium">{selectedStudent.name}</p>
          <p className="text-xs text-muted-foreground">
            {selectedStudent.rollNumber} · {selectedStudent.className}
          </p>
        </div>
        <ul className="divide-y">
          {register.events.map((event) => {
            const cell = selectedStudent.payments[event.id];
            const disabled = !cell;

            return (
              <li key={event.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (cell) {
                      onCellClick(
                        selectedStudent,
                        event.id,
                        event.title,
                        cell,
                      );
                    }
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-3 text-left",
                    disabled
                      ? "cursor-default opacity-50"
                      : feeCellColorClass(cell.status, {
                          variant: "card",
                          interactive: true,
                        }),
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {eventFeeKindLabel(event.kind)}
                      {cell
                        ? ` · Due ${formatCurrency(cell.dueAmount || cell.amount || register.eventsMeta[event.id]?.classRates[selectedStudent.classId] || 0)}`
                        : " · N/A"}
                    </p>
                    {cell?.paymentDate ? (
                      <p className="text-[11px] text-muted-foreground">
                        Paid {formatFeePaymentDate(cell.paymentDate)}
                      </p>
                    ) : null}
                  </div>
                  {cell ? feeStatusBadge(cell.status) : <span>—</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
