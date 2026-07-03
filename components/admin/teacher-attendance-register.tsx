"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AttendanceCellModal } from "@/components/admin/attendance-cell-modal";
import { TeacherAttendanceMobile } from "@/components/admin/teacher-attendance-mobile";
import { BackLink } from "@/components/ui/back-link";
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
import {
  type AttendanceRegister,
  type CellSymbol,
  type RegisterTeacher,
  getTeacherSummary,
  declareHoliday,
  formatDate,
  getCellSymbol,
  isSunday,
  recordKey,
  removeHoliday,
} from "@/lib/attendance";
import { ApiError } from "@/lib/api";
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

type TeacherAttendanceRegisterProps = {
  register: AttendanceRegister;
};

type SelectedCell = {
  teacher: RegisterTeacher;
  date: string;
  dateLabel: string;
};

type HolidayAction = "declare" | "remove";

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

function formatHolidayLabel(year: number, month: number, day: number): string {
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

function dateHeaderClassName(isSundayColumn: boolean, isDeclared: boolean): string {
  return cn(
    "min-w-8 border-r px-1 py-2 text-center text-xs font-medium",
    isSundayColumn &&
      "cursor-default bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300",
    isDeclared &&
      !isSundayColumn &&
      "cursor-pointer bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-300 hover:bg-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-700 dark:hover:bg-violet-950/60",
    !isSundayColumn &&
      !isDeclared &&
      "cursor-pointer hover:bg-muted/60",
  );
}

function cellClassName(symbol: CellSymbol, isHolidayColumn: boolean): string {
  return cn(
    "min-w-8 cursor-pointer border-b border-r px-1 py-2 text-center text-xs font-semibold transition-colors hover:bg-muted/50",
    isHolidayColumn && "bg-emerald-50 dark:bg-emerald-950/20",
    symbol === "P" && "text-emerald-600",
    symbol === "A" && "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    symbol === "H" && "text-violet-600",
    symbol === "IP" && "text-sky-600",
    symbol === "-" && "text-muted-foreground",
  );
}

export function TeacherAttendanceRegister({
  register,
}: TeacherAttendanceRegisterProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(register.year);
  const [month, setMonth] = useState(register.month);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [holidayLoading, setHolidayLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingHolidayDay, setPendingHolidayDay] = useState<number | null>(null);
  const [holidayConfirmOpen, setHolidayConfirmOpen] = useState(false);

  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => currentYear - 2 + index),
    [currentYear],
  );

  const holidaySet = useMemo(
    () => new Set(register.holidays),
    [register.holidays],
  );

  const declaredHolidaySet = useMemo(
    () => new Set(register.declaredHolidays),
    [register.declaredHolidays],
  );

  const pendingHolidayAction: HolidayAction | null =
    pendingHolidayDay === null
      ? null
      : declaredHolidaySet.has(
            formatDate(register.year, register.month, pendingHolidayDay),
          )
        ? "remove"
        : "declare";

  const pendingHolidayLabel =
    pendingHolidayDay === null
      ? ""
      : formatHolidayLabel(register.year, register.month, pendingHolidayDay);

  function applyFilters(): void {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    router.push(`/admin/teacher/attendance?${params.toString()}`);
  }

  function resetFilters(): void {
    const now = new Date();
    const nextYear = now.getFullYear();
    const nextMonth = now.getMonth() + 1;
    setYear(nextYear);
    setMonth(nextMonth);
    router.push("/admin/teacher/attendance");
  }

  function openCell(teacher: RegisterTeacher, day: number): void {
    const date = formatDate(register.year, register.month, day);
    setSelectedCell({
      teacher,
      date,
      dateLabel: formatHolidayLabel(register.year, register.month, day),
    });
    setModalOpen(true);
  }

  function requestHolidayToggle(day: number): void {
    const date = formatDate(register.year, register.month, day);

    if (isSunday(date)) {
      return;
    }

    setPendingHolidayDay(day);
    setHolidayConfirmOpen(true);
  }

  async function confirmHolidayChange(): Promise<void> {
    if (pendingHolidayDay === null || pendingHolidayAction === null) {
      return;
    }

    const date = formatDate(register.year, register.month, pendingHolidayDay);

    setHolidayLoading(date);
    setError(null);
    setHolidayConfirmOpen(false);

    try {
      if (pendingHolidayAction === "remove") {
        await removeHoliday(date);
      } else {
        await declareHoliday(date);
      }
      setPendingHolidayDay(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update holiday");
    } finally {
      setHolidayLoading(null);
    }
  }

  function handleHolidayConfirmOpenChange(open: boolean): void {
    setHolidayConfirmOpen(open);
    if (!open) {
      setPendingHolidayDay(null);
    }
  }

  const selectedRecord = selectedCell
    ? register.records[recordKey(selectedCell.teacher.id, selectedCell.date)]
    : undefined;

  return (
    <div className="space-y-6">
      <BackLink href="/admin/teachers">← Back to Teachers</BackLink>

      <Card>
        <CardHeader>
          <CardTitle>
            Attendance for {MONTH_NAMES[register.month - 1]} {register.year}
          </CardTitle>
          <CardDescription>
            Monthly register — all teachers. Click any cell to edit attendance.
            Click a date number in the column header to declare or remove a
            holiday; you will be asked to confirm before the change is applied.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {register.teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No teachers found. Add teachers before managing attendance.
            </p>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                To declare a holiday, click a{" "}
                <span className="font-medium text-foreground">date number</span>{" "}
                in the column header. Sundays are automatic holidays and cannot
                be changed. Declared holidays are highlighted in violet.
              </div>

              <div className="scroll-hint hidden overflow-x-auto rounded-lg border md:block">
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                      <th className="sticky left-0 z-10 min-w-[160px] border-r bg-muted/40 px-3 py-2 font-medium">
                        Name
                      </th>
                      {Array.from(
                        { length: register.daysInMonth },
                        (_, index) => {
                          const day = index + 1;
                          const date = formatDate(
                            register.year,
                            register.month,
                            day,
                          );
                          const isSundayColumn = isSunday(date);
                          const isDeclared = declaredHolidaySet.has(date);

                          return (
                            <th
                              key={day}
                              className={dateHeaderClassName(
                                isSundayColumn,
                                isDeclared,
                              )}
                              onClick={() => {
                                if (!isSundayColumn) {
                                  requestHolidayToggle(day);
                                }
                              }}
                              title={
                                isSundayColumn
                                  ? "Sunday (automatic holiday)"
                                  : isDeclared
                                    ? "Click to remove holiday"
                                    : "Click to declare holiday"
                              }
                            >
                              {holidayLoading === date ? (
                                "…"
                              ) : isDeclared && !isSundayColumn ? (
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
                        },
                      )}
                      <th className="min-w-[56px] px-2 py-2 text-center font-medium">
                        Present
                      </th>
                      <th className="min-w-[56px] px-2 py-2 text-center font-medium">
                        Absent
                      </th>
                      <th className="min-w-[56px] px-2 py-2 text-center font-medium">
                        Late
                      </th>
                      <th className="min-w-[56px] px-2 py-2 text-center font-medium">
                        Half Day
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {register.teachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b last:border-0">
                        <td className="sticky left-0 z-10 border-r bg-background px-3 py-2 font-medium">
                          {teacher.name}
                        </td>
                        {Array.from(
                          { length: register.daysInMonth },
                          (_, index) => {
                            const day = index + 1;
                            const date = formatDate(
                              register.year,
                              register.month,
                              day,
                            );
                            const record =
                              register.records[recordKey(teacher.id, date)];
                            const symbol = getCellSymbol(
                              date,
                              register.holidays,
                              record,
                            );
                            const isHolidayColumn = holidaySet.has(date);

                            return (
                              <td
                                key={day}
                                className={cellClassName(
                                  symbol,
                                  isHolidayColumn,
                                )}
                                onClick={() => openCell(teacher, day)}
                              >
                                {symbol}
                              </td>
                            );
                          },
                        )}
                        <td className="px-2 py-2 text-center font-medium text-emerald-600">
                          {getTeacherSummary(register, teacher.id).present}
                        </td>
                        <td className="px-2 py-2 text-center font-medium text-orange-700">
                          {getTeacherSummary(register, teacher.id).absent}
                        </td>
                        <td className="px-2 py-2 text-center font-medium text-amber-600">
                          {getTeacherSummary(register, teacher.id).latePunchIn}
                        </td>
                        <td className="px-2 py-2 text-center font-medium text-violet-600">
                          {getTeacherSummary(register, teacher.id).halfDay}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden">
                <TeacherAttendanceMobile
                  register={register}
                  holidaySet={holidaySet}
                  declaredHolidaySet={declaredHolidaySet}
                  holidayLoading={holidayLoading}
                  onCellClick={openCell}
                  onRequestHolidayToggle={requestHolidayToggle}
                />
              </div>
            </>
          )}

          <div className="hidden flex-wrap gap-4 text-xs text-muted-foreground md:flex">
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
              <span className="font-semibold text-sky-600">IP</span> In Progress
            </span>
            <span>
              <span className="font-semibold">-</span> Not Marked
            </span>
            <span className="text-muted-foreground/80">|</span>
            <span>
              <span className="inline-block rounded bg-emerald-50 px-1 text-emerald-800 dark:bg-emerald-950/20">
                Sun
              </span>{" "}
              Sunday (automatic)
            </span>
            <span>
              <span className="inline-block rounded bg-violet-100 px-1 text-violet-800 ring-1 ring-violet-300 dark:bg-violet-950/40 dark:text-violet-300">
                H
              </span>{" "}
              Declared holiday (click header to remove)
            </span>
            <span className="text-muted-foreground/80">
              Late and Half Day are derived from punch times vs each
              teacher&apos;s schedule.
            </span>
          </div>
        </CardContent>
      </Card>

      <AttendanceCellModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        teacher={selectedCell?.teacher ?? null}
        date={selectedCell?.date ?? ""}
        dateLabel={selectedCell?.dateLabel ?? ""}
        record={selectedRecord}
        isHoliday={selectedCell ? holidaySet.has(selectedCell.date) : false}
      />

      <Dialog
        open={holidayConfirmOpen}
        onOpenChange={handleHolidayConfirmOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingHolidayAction === "remove"
                ? "Remove holiday"
                : "Declare holiday"}
            </DialogTitle>
            <DialogDescription>
              {pendingHolidayAction === "remove" ? (
                <>
                  Remove holiday for{" "}
                  <span className="font-medium text-foreground">
                    {pendingHolidayLabel}
                  </span>
                  ? Teachers will be able to have attendance recorded on this
                  day again.
                </>
              ) : (
                <>
                  Declare{" "}
                  <span className="font-medium text-foreground">
                    {pendingHolidayLabel}
                  </span>{" "}
                  as a school holiday? Attendance cannot be edited on this day.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton={false}>
            <Button
              variant="outline"
              onClick={() => handleHolidayConfirmOpenChange(false)}
              disabled={holidayLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void confirmHolidayChange()}
              disabled={holidayLoading !== null}
            >
              {pendingHolidayAction === "remove"
                ? "Remove holiday"
                : "Declare holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
