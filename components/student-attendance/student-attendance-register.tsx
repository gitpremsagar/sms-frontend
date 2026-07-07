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
  formatDate,
  getCellSymbol,
  isSunday,
  markStudentAttendance,
  recordKey,
  todayDateString,
  undoStudentAttendance,
  type RegisterStudent,
  type StudentAttendanceApiScope,
  type StudentAttendanceRegister,
} from "@/lib/student-attendance";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

type StudentAttendanceRegisterProps = {
  register: StudentAttendanceRegister;
  scope: StudentAttendanceApiScope;
  basePath: string;
  takePath: string;
  showClassSelector?: boolean;
};

type SelectedCell = {
  student: RegisterStudent;
  date: string;
  dateLabel: string;
};

function cellClassName(symbol: string, isHolidayColumn: boolean): string {
  return cn(
    "min-w-8 cursor-pointer border-r px-1 py-2 text-center text-xs font-semibold transition-colors hover:bg-muted/50",
    isHolidayColumn && "cursor-default bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20",
    symbol === "P" && !isHolidayColumn && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30",
    symbol === "A" && !isHolidayColumn && "bg-orange-50 text-orange-700 dark:bg-orange-950/30",
    symbol === "-" && !isHolidayColumn && "text-muted-foreground",
    symbol === "H" && "text-emerald-800 dark:text-emerald-300",
  );
}

function dateHeaderClassName(isSundayColumn: boolean, isDeclared: boolean): string {
  return cn(
    "min-w-8 border-r px-1 py-2 text-center text-xs font-medium",
    isSundayColumn &&
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300",
    isDeclared &&
      !isSundayColumn &&
      "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
  );
}

export function StudentAttendanceRegister({
  register,
  scope,
  basePath,
  takePath,
  showClassSelector = false,
}: StudentAttendanceRegisterProps) {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(register.year);
  const [month, setMonth] = useState(register.month);
  const [classId, setClassId] = useState(register.classId);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const holidaySet = useMemo(() => new Set(register.holidays), [register.holidays]);
  const declaredHolidaySet = useMemo(
    () => new Set(register.declaredHolidays),
    [register.declaredHolidays],
  );

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    return Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);
  }, [now]);

  const selectedRecord = selectedCell
    ? register.records[recordKey(selectedCell.student.id, selectedCell.date)]
    : undefined;

  const isSelectedHoliday = selectedCell
    ? holidaySet.has(selectedCell.date)
    : false;
  const isSelectedFuture = selectedCell
    ? selectedCell.date > todayDateString()
    : false;

  function applyFilters() {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    if (showClassSelector) {
      if (!classId) {
        return;
      }
      params.set("classId", classId);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function resetFilters() {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setClassId("");
    router.push(basePath);
  }

  function openCell(student: RegisterStudent, day: number) {
    const date = formatDate(register.year, register.month, day);
    if (holidaySet.has(date)) {
      return;
    }

    setSelectedCell({
      student,
      date,
      dateLabel: `${MONTH_NAMES[register.month - 1]} ${day}, ${register.year}`,
    });
    setError(null);
    setDialogOpen(true);
  }

  async function handleMark(status: "PRESENT" | "ABSENT") {
    if (!selectedCell) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await markStudentAttendance(
        scope,
        register.classId,
        selectedCell.student.id,
        selectedCell.date,
        status,
      );
      setDialogOpen(false);
      setSelectedCell(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!selectedCell) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await undoStudentAttendance(
        scope,
        register.classId,
        selectedCell.student.id,
        selectedCell.date,
      );
      setDialogOpen(false);
      setSelectedCell(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to clear attendance");
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
              <CardTitle>
                Attendance Register — {register.className} ({MONTH_NAMES[register.month - 1]}{" "}
                {register.year})
              </CardTitle>
              <CardDescription>
                Monthly register for all students. Click a cell to mark present,
                absent, or clear.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={takePath}>Take attendance →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            {showClassSelector ? (
              <div className="space-y-1">
                <label htmlFor="class" className="text-xs text-muted-foreground">
                  Class
                </label>
                <select
                  id="class"
                  className={selectClassName}
                  value={classId}
                  onChange={(event) => setClassId(event.target.value)}
                >
                  <option value="">Select class</option>
                  {register.classes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.className}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="space-y-1">
              <label htmlFor="year" className="text-xs text-muted-foreground">
                Year
              </label>
              <select
                id="year"
                className={selectClassName}
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {yearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="month" className="text-xs text-muted-foreground">
                Month
              </label>
              <select
                id="month"
                className={selectClassName}
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={applyFilters}>Apply</Button>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          {error && !dialogOpen ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {register.students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active students in this class.
            </p>
          ) : (
            <div className="scroll-hint overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="sticky left-0 z-10 min-w-[72px] border-r bg-muted/40 px-3 py-2 font-medium">
                      Roll
                    </th>
                    <th className="sticky left-[72px] z-10 min-w-[140px] border-r bg-muted/40 px-3 py-2 font-medium">
                      Name
                    </th>
                    {Array.from({ length: register.daysInMonth }, (_, index) => {
                      const day = index + 1;
                      const date = formatDate(register.year, register.month, day);
                      const isSundayColumn = isSunday(date);
                      const isDeclared = declaredHolidaySet.has(date);

                      return (
                        <th
                          key={day}
                          className={dateHeaderClassName(isSundayColumn, isDeclared)}
                          title={
                            isSundayColumn
                              ? "Sunday (holiday)"
                              : isDeclared
                                ? "Declared holiday"
                                : undefined
                          }
                        >
                          {isDeclared && !isSundayColumn ? (
                            <span className="inline-flex flex-col items-center leading-tight">
                              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                H
                              </span>
                              <span>{day}</span>
                            </span>
                          ) : (
                            day
                          )}
                        </th>
                      );
                    })}
                    <th className="min-w-[56px] px-2 py-2 text-center font-medium">
                      Present
                    </th>
                    <th className="min-w-[56px] px-2 py-2 text-center font-medium">
                      Absent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {register.students.map((student) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="sticky left-0 z-10 border-r bg-background px-3 py-2 text-xs">
                        {student.rollNumber}
                      </td>
                      <td className="sticky left-[72px] z-10 border-r bg-background px-3 py-2 font-medium">
                        {student.name}
                      </td>
                      {Array.from({ length: register.daysInMonth }, (_, index) => {
                        const day = index + 1;
                        const date = formatDate(register.year, register.month, day);
                        const record = register.records[recordKey(student.id, date)];
                        const isHolidayColumn = holidaySet.has(date);
                        const symbol = getCellSymbol(isHolidayColumn, record);

                        return (
                          <td
                            key={day}
                            className={cellClassName(symbol, isHolidayColumn)}
                            onClick={() => openCell(student, day)}
                          >
                            {symbol}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center font-medium text-emerald-600">
                        {register.summaries[student.id]?.present ?? 0}
                      </td>
                      <td className="px-2 py-2 text-center font-medium text-orange-700">
                        {register.summaries[student.id]?.absent ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-emerald-600">P</span> Present
            </span>
            <span>
              <span className="font-semibold text-orange-700">A</span> Absent
            </span>
            <span>
              <span className="font-semibold text-violet-600">H</span> Holiday
            </span>
            <span>
              <span className="font-semibold">-</span> Not Marked
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update attendance</DialogTitle>
            <DialogDescription>
              {selectedCell ? (
                <>
                  <span className="font-medium text-foreground">
                    {selectedCell.student.name}
                  </span>{" "}
                  — {selectedCell.dateLabel}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {isSelectedHoliday ? (
            <p className="text-sm text-muted-foreground">
              This date is a holiday. Attendance cannot be modified.
            </p>
          ) : isSelectedFuture ? (
            <p className="text-sm text-muted-foreground">
              Attendance cannot be marked for future dates.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Current status:{" "}
              <span className="font-medium text-foreground">
                {selectedRecord?.status ?? "Not marked"}
              </span>
            </p>
          )}

          <DialogFooter showCloseButton={false}>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {selectedRecord ? (
              <Button
                variant="outline"
                onClick={() => void handleClear()}
                disabled={loading || isSelectedHoliday || isSelectedFuture}
              >
                Clear
              </Button>
            ) : null}
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => void handleMark("ABSENT")}
              disabled={loading || isSelectedHoliday || isSelectedFuture}
            >
              Mark Absent
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => void handleMark("PRESENT")}
              disabled={loading || isSelectedHoliday || isSelectedFuture}
            >
              Mark Present
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
