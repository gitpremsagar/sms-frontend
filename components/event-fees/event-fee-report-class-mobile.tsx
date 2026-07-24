"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  feeCellColorClass,
  feeStatusBadge,
} from "@/components/fees/fee-payment-ui";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  type EventFeeRegisterEvent,
  type EventFeeReportClassBreakdown,
  type EventFeeReportStudentRow,
} from "@/lib/event-fees";
import { cn } from "@/lib/utils";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

type EventFeeReportClassMobileProps = {
  cls: EventFeeReportClassBreakdown;
  events: EventFeeRegisterEvent[];
};

export function EventFeeReportClassMobile({
  cls,
  events,
}: EventFeeReportClassMobileProps) {
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
    return null;
  }

  const selectedIndex = cls.students.findIndex(
    (student) => student.id === selectedStudentId,
  );
  const selectedStudent: EventFeeReportStudentRow =
    selectedIndex >= 0 ? cls.students[selectedIndex] : cls.students[0];

  return (
    <div className="space-y-4 md:hidden">
      <div className="rounded-lg border bg-muted/20 p-3 text-sm">
        <p>
          Collected:{" "}
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            {formatCurrency(cls.totalCollected)}
          </span>
        </p>
        <p>
          Due:{" "}
          <span className="font-medium text-orange-700 dark:text-orange-400">
            {formatCurrency(cls.totalDue)}
          </span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Select Student</label>
        <select
          className={selectClassName}
          value={selectedStudent.id}
          onChange={(event) => setSelectedStudentId(event.target.value)}
        >
          {cls.students.map((student, index) => (
            <option key={student.id} value={student.id}>
              {index + 1}. {student.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={selectedIndex <= 0}
          onClick={() =>
            setSelectedStudentId(cls.students[selectedIndex - 1].id)
          }
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          {selectedIndex + 1} / {cls.students.length}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          disabled={selectedIndex >= cls.students.length - 1}
          onClick={() =>
            setSelectedStudentId(cls.students[selectedIndex + 1].id)
          }
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <ul className="divide-y rounded-lg border">
        {events.map((event) => {
          const cell = selectedStudent.payments[event.id];
          return (
            <li
              key={event.id}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-3",
                cell
                  ? feeCellColorClass(cell.status, {
                      variant: "card",
                      interactive: false,
                    })
                  : "bg-muted/20",
              )}
            >
              <div>
                <p className="text-sm font-medium">{event.title}</p>
                {cell ? (
                  <p className="text-xs text-muted-foreground">
                    {cell.status === "PAID"
                      ? formatCurrency(cell.amount)
                      : `Due ${formatCurrency(cell.dueAmount)}`}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not applicable</p>
                )}
              </div>
              {cell ? feeStatusBadge(cell.status) : <span>—</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
