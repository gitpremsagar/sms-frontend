"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type AttendanceRecord,
  type AttendanceRegister,
  type RegisterTeacher,
  classifyDay,
  formatDate,
  formatPunchTime,
  getTeacherSummary,
  isSunday,
  recordKey,
} from "@/lib/attendance";
import { cn } from "@/lib/utils";

const MONTH_ABBREV = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

function formatDisplayDate(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}-${MONTH_ABBREV[month - 1]}-${String(year).slice(-2)}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type TeacherSelfAttendanceRegisterProps = {
  register: AttendanceRegister;
};

type AttendanceRow = {
  date: string;
  dayLabel: string;
  displayDate: string;
  status: string;
  punchIn: string;
  punchOut: string;
  late: string;
  halfDay: string;
  earlyExit: string;
  isHoliday: boolean;
  isDeclaredHoliday: boolean;
  rowTone: "holiday" | "present" | "absent" | "in-progress" | "default";
};

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

const thClassName =
  "sticky top-0 z-20 border border-border bg-muted px-3 py-2 text-left text-xs font-semibold text-foreground whitespace-nowrap shadow-sm";

const tdClassName = "border border-border px-3 py-2 text-xs whitespace-nowrap";

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function getStatusLabel(
  isHoliday: boolean,
  isDeclaredHoliday: boolean,
  record?: AttendanceRecord,
): string {
  if (isHoliday) {
    return isDeclaredHoliday ? "Declared Holiday" : "Holiday";
  }

  if (!record) {
    return "—";
  }

  switch (record.status) {
    case "PRESENT":
      return "Present";
    case "ABSENT":
      return "Absent";
    case "IN_PROGRESS":
      return "In Progress";
    default:
      return "—";
  }
}

function buildAttendanceRows(
  register: AttendanceRegister,
  teacher: RegisterTeacher,
): AttendanceRow[] {
  const holidaySet = new Set(register.holidays);
  const declaredHolidaySet = new Set(register.declaredHolidays);
  const rows: AttendanceRow[] = [];

  for (let day = 1; day <= register.daysInMonth; day++) {
    const date = formatDate(register.year, register.month, day);
    const [year, month, dayNum] = date.split("-").map(Number);
    const weekday = new Date(year, month - 1, dayNum).getDay();
    const record = register.records[recordKey(teacher.id, date)];
    const isHoliday = holidaySet.has(date);
    const isDeclaredHoliday = declaredHolidaySet.has(date);
    const metrics =
      record?.status === "PRESENT"
        ? classifyDay(record, teacher, isHoliday)
        : null;

    let rowTone: AttendanceRow["rowTone"] = "default";
    if (isHoliday) {
      rowTone = "holiday";
    } else if (record?.status === "PRESENT") {
      rowTone = "present";
    } else if (record?.status === "ABSENT") {
      rowTone = "absent";
    } else if (record?.status === "IN_PROGRESS") {
      rowTone = "in-progress";
    }

    rows.push({
      date,
      dayLabel: DAY_NAMES[weekday] ?? "—",
      displayDate: formatDisplayDate(day, register.month, register.year),
      status: getStatusLabel(isHoliday, isDeclaredHoliday, record),
      punchIn: isHoliday ? "—" : formatPunchTime(record?.punchIn ?? null),
      punchOut: isHoliday ? "—" : formatPunchTime(record?.punchOut ?? null),
      late: isHoliday ? "—" : yesNo(metrics?.isLatePunchIn ?? false),
      halfDay: isHoliday ? "—" : yesNo(metrics?.isHalfDay ?? false),
      earlyExit: isHoliday ? "—" : yesNo(metrics?.isEarlyExit ?? false),
      isHoliday,
      isDeclaredHoliday,
      rowTone,
    });
  }

  return rows;
}

function rowClassName(tone: AttendanceRow["rowTone"]): string {
  return cn(
    tone === "holiday" && "bg-emerald-50/70 dark:bg-emerald-950/20",
    tone === "present" && "bg-emerald-50/30",
    tone === "absent" && "bg-orange-50/60 dark:bg-orange-950/20",
    tone === "in-progress" && "bg-sky-50/50 dark:bg-sky-950/20",
  );
}

export function TeacherSelfAttendanceRegister({
  register,
}: TeacherSelfAttendanceRegisterProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const teacher = register.teachers[0];

  const [year, setYear] = useState(register.year);
  const [month, setMonth] = useState(register.month);

  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, index) => currentYear - 2 + index),
    [currentYear],
  );

  const rows = useMemo(
    () => (teacher ? buildAttendanceRows(register, teacher) : []),
    [register, teacher],
  );

  const summary = teacher ? getTeacherSummary(register, teacher.id) : null;

  function applyFilters(): void {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    router.push(`/teacher/attendance?${params.toString()}`);
  }

  function resetFilters(): void {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    router.push("/teacher/attendance");
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>
            Attendance for {MONTH_NAMES[register.month - 1]} {register.year}
          </CardTitle>
          <CardDescription>
            Monthly attendance register in tabular format. This view is
            read-only.
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

          {!teacher ? (
            <p className="text-sm text-muted-foreground">
              Unable to load your attendance profile.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-4 lg:grid-cols-7">
                <div>
                  <p className="text-xs text-muted-foreground">Teacher</p>
                  <p className="text-sm font-medium">{teacher.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="text-sm font-medium">
                    {teacher.employeeId ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Work Hours</p>
                  <p className="text-sm font-medium">
                    {teacher.workStartTime} – {teacher.workEndTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Present</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    {summary?.present ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Absent</p>
                  <p className="text-sm font-semibold text-orange-700">
                    {summary?.absent ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Late</p>
                  <p className="text-sm font-semibold text-amber-600">
                    {summary?.latePunchIn ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Half Day</p>
                  <p className="text-sm font-semibold text-violet-600">
                    {summary?.halfDay ?? 0}
                  </p>
                </div>
              </div>

              <div className="max-h-[calc(100dvh-env(safe-area-inset-top)-3rem-17.5rem)] min-h-48 overflow-auto rounded-lg border border-border">
                <table className="w-full min-w-[960px] border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      <th className={thClassName}>Date</th>
                      <th className={thClassName}>Day</th>
                      <th className={thClassName}>Status</th>
                      <th className={thClassName}>Punch In</th>
                      <th className={thClassName}>Punch Out</th>
                      <th className={thClassName}>Late Punch In</th>
                      <th className={thClassName}>Half Day</th>
                      <th className={thClassName}>Early Exit</th>
                      <th className={thClassName}>Holiday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.date} className={rowClassName(row.rowTone)}>
                        <td className={cn(tdClassName, "font-medium")}>
                          {row.displayDate}
                        </td>
                        <td className={tdClassName}>{row.dayLabel}</td>
                        <td
                          className={cn(
                            tdClassName,
                            "font-medium",
                            row.rowTone === "present" && "text-emerald-700",
                            row.rowTone === "absent" && "text-orange-700",
                            row.rowTone === "in-progress" && "text-sky-700",
                            row.rowTone === "holiday" && "text-violet-700",
                          )}
                        >
                          {row.status}
                        </td>
                        <td className={tdClassName}>{row.punchIn}</td>
                        <td className={tdClassName}>{row.punchOut}</td>
                        <td
                          className={cn(
                            tdClassName,
                            row.late === "Yes" && "font-medium text-amber-700",
                          )}
                        >
                          {row.late}
                        </td>
                        <td
                          className={cn(
                            tdClassName,
                            row.halfDay === "Yes" &&
                              "font-medium text-violet-700",
                          )}
                        >
                          {row.halfDay}
                        </td>
                        <td
                          className={cn(
                            tdClassName,
                            row.earlyExit === "Yes" &&
                              "font-medium text-amber-700",
                          )}
                        >
                          {row.earlyExit}
                        </td>
                        <td className={tdClassName}>
                          {row.isHoliday
                            ? row.isDeclaredHoliday
                              ? "Declared"
                              : isSunday(row.date)
                                ? "Sunday"
                                : "Yes"
                            : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {summary ? (
                    <tfoot>
                      <tr className="bg-muted/50 font-medium">
                        <td className={tdClassName} colSpan={2}>
                          Monthly Total
                        </td>
                        <td className={tdClassName}>
                          {summary.present} present / {summary.absent} absent
                        </td>
                        <td className={tdClassName} colSpan={2}>
                          —
                        </td>
                        <td className={tdClassName}>{summary.latePunchIn}</td>
                        <td className={tdClassName}>{summary.halfDay}</td>
                        <td className={tdClassName}>—</td>
                        <td className={tdClassName}>—</td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
