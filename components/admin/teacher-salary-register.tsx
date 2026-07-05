"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { formatCurrency, type SalaryBreakdown, type SalaryRegister } from "@/lib/salary";

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

type TeacherSalaryRegisterProps = {
  register: SalaryRegister;
};

export function TeacherSalaryRegister({ register }: TeacherSalaryRegisterProps) {
  const router = useRouter();
  const [year, setYear] = useState(register.year);
  const [month, setMonth] = useState(register.month);

  const yearOptions = Array.from({ length: 5 }, (_, index) => register.year - 2 + index);

  function applyFilters() {
    router.push(`/admin/teacher/salary?year=${year}&month=${month}`);
  }

  function resetFilters() {
    const now = new Date();
    router.push(
      `/admin/teacher/salary?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
    );
  }

  return (
    <div className="space-y-6">
      <BackLink href="/admin/teachers">← Back to Teachers</BackLink>

      <Card>
        <CardHeader>
          <CardTitle>
            Salary for {MONTH_NAMES[register.month - 1]} {register.year}
          </CardTitle>
          <CardDescription>
            Monthly payroll calculated from attendance. Deductions apply for
            absent and unmarked working days (full day) and half-days (half day).
            Late punch-in does not affect salary.
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

          {register.breakdowns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No teachers found. Add teachers and set their monthly salary before
              viewing payroll.
            </p>
          ) : (
            <ResponsiveDataTable<SalaryBreakdown>
              columns={[
                { key: "name", label: "Teacher" },
                {
                  key: "employeeId",
                  label: "Employee ID",
                  render: (row) => row.employeeId ?? "—",
                },
                {
                  key: "monthlySalary",
                  label: "Monthly Salary",
                  render: (row) => formatCurrency(row.monthlySalary),
                },
                { key: "workingDays", label: "Working Days" },
                {
                  key: "dailyRate",
                  label: "Daily Rate",
                  render: (row) => formatCurrency(row.dailyRate),
                },
                { key: "fullPresentDays", label: "Present" },
                { key: "halfDays", label: "Half-days" },
                { key: "absentDays", label: "Absent" },
                { key: "unmarkedDays", label: "Unmarked" },
                {
                  key: "deductions",
                  label: "Deductions",
                  render: (row) => formatCurrency(row.deductions),
                },
                {
                  key: "calculatedSalary",
                  label: "Payable Salary",
                  render: (row) => (
                    <span className="font-semibold text-school-navy">
                      {formatCurrency(row.calculatedSalary)}
                    </span>
                  ),
                },
              ]}
              rows={register.breakdowns}
              rowKey={(row) => row.teacherId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
