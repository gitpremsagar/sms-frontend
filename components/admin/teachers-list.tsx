"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { TeacherRowActions } from "@/components/admin/teacher-row-actions";
import { formatCurrency } from "@/lib/salary";
import type { Teacher } from "@/lib/teachers";

type TeachersListProps = {
  teachers: Teacher[];
};

export function TeachersList({ teachers }: TeachersListProps) {
  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Get started by adding your first teacher.
        </p>
        <Button asChild size="sm">
          <Link href="/admin/teacher/add-teacher">Add Teacher</Link>
        </Button>
      </div>
    );
  }

  return (
    <ResponsiveDataTable<Teacher>
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        {
          key: "employeeId",
          label: "Employee ID",
          render: (row) => row.employeeId ?? "—",
        },
        {
          key: "phone",
          label: "Phone",
          render: (row) => row.phone ?? "—",
        },
        {
          key: "monthlySalary",
          label: "Monthly Salary",
          render: (row) => formatCurrency(row.monthlySalary ?? 0),
        },
      ]}
      rows={teachers}
      rowKey={(row) => row.id}
      actions={(row) => <TeacherRowActions id={row.id} name={row.name} />}
    />
  );
}
