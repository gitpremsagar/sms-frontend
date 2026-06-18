"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AttendanceCellModal } from "@/components/admin/attendance-cell-modal";
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
  type AttendanceRegister,
  type CellSymbol,
  type RegisterTeacher,
  countPresentDays,
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

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

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
      dateLabel: `${MONTH_NAMES[register.month - 1]} ${day}, ${register.year}`,
    });
    setModalOpen(true);
  }

  async function toggleHoliday(day: number): Promise<void> {
    const date = formatDate(register.year, register.month, day);

    if (isSunday(date)) {
      return;
    }

    setHolidayLoading(date);
    setError(null);

    try {
      if (declaredHolidaySet.has(date)) {
        await removeHoliday(date);
      } else {
        await declareHoliday(date);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update holiday");
    } finally {
      setHolidayLoading(null);
    }
  }

  const selectedRecord = selectedCell
    ? register.records[recordKey(selectedCell.teacher.id, selectedCell.date)]
    : undefined;

  return (
    <div className="-mx-4 space-y-6 px-4 sm:mx-0 sm:px-0">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Admin Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>
            Attendance for {MONTH_NAMES[register.month - 1]} {register.year}
          </CardTitle>
          <CardDescription>
            Monthly register — all teachers. Click any cell to edit attendance.
            Click a date header to declare or remove a holiday.
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
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="sticky left-0 z-10 min-w-[160px] border-r bg-muted/40 px-3 py-2 font-medium">
                      Name
                    </th>
                    {Array.from({ length: register.daysInMonth }, (_, index) => {
                      const day = index + 1;
                      const date = formatDate(register.year, register.month, day);
                      const isHolidayColumn = holidaySet.has(date);
                      const isSundayColumn = isSunday(date);
                      const isDeclared = declaredHolidaySet.has(date);

                      return (
                        <th
                          key={day}
                          className={cn(
                            "min-w-8 border-r px-1 py-2 text-center text-xs font-medium",
                            isHolidayColumn &&
                              "bg-emerald-50 dark:bg-emerald-950/20",
                            !isSundayColumn &&
                              "cursor-pointer hover:bg-muted/60",
                          )}
                          onClick={() => {
                            if (!isSundayColumn) {
                              void toggleHoliday(day);
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
                          {holidayLoading === date ? "…" : day}
                        </th>
                      );
                    })}
                    <th className="min-w-[72px] px-3 py-2 text-center font-medium">
                      Present
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
                              className={cellClassName(symbol, isHolidayColumn)}
                              onClick={() => openCell(teacher, day)}
                            >
                              {symbol}
                            </td>
                          );
                        },
                      )}
                      <td className="px-3 py-2 text-center font-medium">
                        {countPresentDays(
                          teacher.id,
                          register.daysInMonth,
                          register.year,
                          register.month,
                          register.records,
                        )}
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
              <span className="font-semibold text-sky-600">IP</span> In Progress
            </span>
            <span>
              <span className="font-semibold">-</span> Not Marked
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
    </div>
  );
}
