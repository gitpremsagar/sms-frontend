"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, type SalaryBreakdown } from "@/lib/salary";

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

type TeacherSalaryViewProps = {
  breakdown: SalaryBreakdown;
  year: number;
  month: number;
};

function StatItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          highlight
            ? "mt-1 text-lg font-semibold text-school-navy"
            : "mt-1 text-sm font-medium"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function TeacherSalaryView({
  breakdown,
  year: initialYear,
  month: initialMonth,
}: TeacherSalaryViewProps) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const yearOptions = Array.from(
    { length: 5 },
    (_, index) => initialYear - 2 + index,
  );

  function applyFilters() {
    router.push(`/teacher/salary?year=${year}&month=${month}`);
  }

  function resetFilters() {
    const now = new Date();
    router.push(
      `/teacher/salary?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          My Salary — {MONTH_NAMES[initialMonth - 1]} {initialYear}
        </CardTitle>
        <CardDescription>
          Monthly pay calculated from your attendance. Unmarked working days are
          treated as absent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem
            label="Monthly Salary"
            value={formatCurrency(breakdown.monthlySalary)}
          />
          <StatItem
            label="Working Days"
            value={String(breakdown.workingDays)}
          />
          <StatItem
            label="Daily Rate"
            value={formatCurrency(breakdown.dailyRate)}
          />
          <StatItem
            label="Deductions"
            value={formatCurrency(breakdown.deductions)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatItem
            label="Present Days"
            value={String(breakdown.fullPresentDays)}
          />
          <StatItem label="Half-days" value={String(breakdown.halfDays)} />
          <StatItem label="Absent Days" value={String(breakdown.absentDays)} />
          <StatItem
            label="Unmarked Days"
            value={String(breakdown.unmarkedDays)}
          />
        </div>

        <div className="rounded-lg border border-school-navy/20 bg-school-navy/5 px-4 py-5">
          <p className="text-sm text-muted-foreground">Payable Salary</p>
          <p className="mt-1 text-3xl font-semibold text-school-navy">
            {formatCurrency(breakdown.calculatedSalary)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
