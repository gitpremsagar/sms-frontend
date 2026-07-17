"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { ClassRowActions } from "@/components/admin/class-row-actions";
import {
  classKindLabel,
  type ClassKind,
  type SchoolClass,
} from "@/lib/classes";
import { formatCurrency } from "@/lib/salary";
import { cn } from "@/lib/utils";

type ClassesListProps = {
  classes: SchoolClass[];
};

export function ClassesList({ classes }: ClassesListProps) {
  const [kindFilter, setKindFilter] = useState<ClassKind>("SCHOOL");

  const filteredClasses = useMemo(
    () => classes.filter((schoolClass) => schoolClass.kind === kindFilter),
    [classes, kindFilter],
  );

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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={kindFilter === "SCHOOL" ? "default" : "outline"}
          onClick={() => setKindFilter("SCHOOL")}
        >
          School
        </Button>
        <Button
          type="button"
          size="sm"
          variant={kindFilter === "COACHING" ? "default" : "outline"}
          onClick={() => setKindFilter("COACHING")}
        >
          Coaching
        </Button>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No {classKindLabel(kindFilter).toLowerCase()} classes yet.
          </p>
          <Button asChild size="sm">
            <Link href="/admin/class/add-class">Add Class</Link>
          </Button>
        </div>
      ) : (
        <ResponsiveDataTable<SchoolClass>
          columns={[
            { key: "className", label: "Class Name" },
            { key: "teacherName", label: "Assigned Teacher" },
            {
              key: "kind",
              label: "Type",
              render: (row) => (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    row.kind === "COACHING"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {classKindLabel(row.kind)}
                </span>
              ),
            },
            {
              key: "monthlyFee",
              label: "Monthly Fee",
              render: (row) => formatCurrency(row.monthlyFee),
            },
          ]}
          rows={filteredClasses}
          rowKey={(row) => row.id}
          actions={(row) => (
            <ClassRowActions id={row.id} className={row.className} />
          )}
        />
      )}
    </div>
  );
}
