"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  type AttendanceRegister,
  type CellSymbol,
  type RegisterTeacher,
  getTeacherSummary,
  formatDate,
  getCellSymbol,
  isSunday,
  recordKey,
} from "@/lib/attendance";
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

type TeacherAttendanceMobileProps = {
  register: AttendanceRegister;
  holidaySet: Set<string>;
  declaredHolidaySet: Set<string>;
  holidayLoading: string | null;
  onCellClick: (teacher: RegisterTeacher, day: number) => void;
  onRequestHolidayToggle: (day: number) => void;
};

function dateHeaderButtonClassName(
  isSundayColumn: boolean,
  isDeclared: boolean,
): string {
  return cn(
    "rounded px-0.5 py-0.5 text-[10px] font-medium",
    isSundayColumn &&
      "cursor-default bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300",
    isDeclared &&
      !isSundayColumn &&
      "cursor-pointer bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-300 hover:bg-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-700",
    !isSundayColumn && !isDeclared && "cursor-pointer hover:bg-muted",
  );
}

function cellClassName(symbol: CellSymbol, isHolidayColumn: boolean): string {
  return cn(
    "flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border text-xs font-semibold transition-colors hover:bg-muted/50",
    isHolidayColumn && "bg-emerald-50 dark:bg-emerald-950/20",
    symbol === "P" && "text-emerald-600",
    symbol === "A" && "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    symbol === "H" && "text-violet-600",
    symbol === "IP" && "text-sky-600",
    symbol === "-" && "text-muted-foreground",
  );
}

export function TeacherAttendanceMobile({
  register,
  holidaySet,
  declaredHolidaySet,
  holidayLoading,
  onCellClick,
  onRequestHolidayToggle,
}: TeacherAttendanceMobileProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    register.teachers[0]?.id ?? "",
  );
  const [legendOpen, setLegendOpen] = useState(false);

  const selectedTeacher = register.teachers.find(
    (teacher) => teacher.id === selectedTeacherId,
  );

  if (!selectedTeacher) {
    return null;
  }

  const summary = getTeacherSummary(register, selectedTeacher.id);

  const firstDayOfMonth = new Date(register.year, register.month - 1, 1).getDay();
  const leadingBlanks = firstDayOfMonth;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Tap a <span className="font-medium text-foreground">date number</span>{" "}
        above each cell to declare or remove a holiday. Sundays cannot be
        changed. Violet headers are declared holidays.
      </div>

      <div className="space-y-2">
        <label htmlFor="mobile-teacher" className="text-xs text-muted-foreground">
          Select Teacher
        </label>
        <select
          id="mobile-teacher"
          value={selectedTeacherId}
          onChange={(event) => setSelectedTeacherId(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {register.teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="mb-3 font-medium">{selectedTeacher.name}</p>
        <p className="mb-3 text-xs text-muted-foreground">
          {MONTH_NAMES[register.month - 1]} {register.year}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-600">{summary.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-orange-700">{summary.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">{summary.latePunchIn}</p>
            <p className="text-xs text-muted-foreground">Late</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-violet-600">{summary.halfDay}</p>
            <p className="text-xs text-muted-foreground">Half Day</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }, (_, index) => (
          <div key={`blank-${index}`} />
        ))}

        {Array.from({ length: register.daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = formatDate(register.year, register.month, day);
          const record =
            register.records[recordKey(selectedTeacher.id, date)];
          const symbol = getCellSymbol(date, register.holidays, record);
          const isHolidayColumn = holidaySet.has(date);
          const isSundayColumn = isSunday(date);
          const isDeclared = declaredHolidaySet.has(date);

          return (
            <div key={day} className="flex flex-col gap-0.5">
              <button
                type="button"
                className={dateHeaderButtonClassName(isSundayColumn, isDeclared)}
                onClick={() => {
                  if (!isSundayColumn) {
                    onRequestHolidayToggle(day);
                  }
                }}
                title={
                  isSundayColumn
                    ? "Sunday (automatic holiday)"
                    : isDeclared
                      ? "Tap to remove holiday"
                      : "Tap to declare holiday"
                }
              >
                {holidayLoading === date ? (
                  "…"
                ) : isDeclared && !isSundayColumn ? (
                  <span className="inline-flex flex-col items-center leading-tight">
                    <span className="text-[8px] font-bold text-violet-600 dark:text-violet-400">
                      H
                    </span>
                    <span>{day}</span>
                  </span>
                ) : (
                  day
                )}
              </button>
              <button
                type="button"
                className={cellClassName(symbol, isHolidayColumn)}
                onClick={() => onCellClick(selectedTeacher, day)}
              >
                {symbol}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
          onClick={() => setLegendOpen((open) => !open)}
          aria-expanded={legendOpen}
        >
          Legend
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              legendOpen && "rotate-180",
            )}
          />
        </button>
        {legendOpen ? (
          <div className="flex flex-wrap gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
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
              Declared holiday
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
