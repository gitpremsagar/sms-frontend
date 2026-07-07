"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { ClassRowActions } from "@/components/admin/class-row-actions";
import { formatCurrency } from "@/lib/salary";
import type { SchoolClass } from "@/lib/classes";

type ClassesListProps = {
  classes: SchoolClass[];
};

export function ClassesList({ classes }: ClassesListProps) {
  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Get started by adding your first class.
        </p>
        <Button asChild size="sm">
          <Link href="/admin/class/add-class">Add Class</Link>
        </Button>
      </div>
    );
  }

  return (
    <ResponsiveDataTable<SchoolClass>
      columns={[
        { key: "className", label: "Class Name" },
        { key: "teacherName", label: "Assigned Teacher" },
        {
          key: "monthlyFee",
          label: "Monthly Fee",
          render: (row) => formatCurrency(row.monthlyFee),
        },
      ]}
      rows={classes}
      rowKey={(row) => row.id}
      actions={(row) => (
        <ClassRowActions id={row.id} className={row.className} />
      )}
    />
  );
}
