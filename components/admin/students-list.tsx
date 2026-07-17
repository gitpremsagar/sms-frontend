"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { StudentRowActions } from "@/components/admin/student-row-actions";
import type { SchoolClass } from "@/lib/classes";
import type { Student } from "@/lib/students";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:max-w-xs";

type StatusFilter = "" | "active" | "archived";

type StudentsListProps = {
  students: Student[];
  classes: SchoolClass[];
};

export function StudentsList({ students, classes }: StudentsListProps) {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesClass = !classId || student.classId === classId;
      const matchesSearch =
        !normalizedSearch ||
        student.name.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && student.isStudying) ||
        (statusFilter === "archived" && !student.isStudying);

      return matchesClass && matchesSearch && matchesStatus;
    });
  }, [students, search, classId, statusFilter]);

  const hasFilters =
    search.trim().length > 0 || classId.length > 0 || statusFilter.length > 0;

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Get started by adding your first student.
        </p>
        <Button asChild size="sm">
          <Link href="/admin/student/add-student">Add Student</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="student-search">Search by Name</Label>
          <Input
            id="student-search"
            type="search"
            placeholder="Search students..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-class-filter">Filter by Class</Label>
          <select
            id="student-class-filter"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className={selectClassName}
          >
            <option value="">All classes</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.className}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-status-filter">Filter by Status</Label>
          <select
            id="student-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className={selectClassName}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {hasFilters ? (
        <p className="text-sm text-muted-foreground">
          Showing {filteredStudents.length} of {students.length} student
          {students.length === 1 ? "" : "s"}.
        </p>
      ) : null}

      <ResponsiveDataTable<Student>
        sortable
        columns={[
          { key: "serialNumber", label: "S.No." },
          {
            key: "name",
            label: "Name",
            render: (row) => (
              <span className="inline-flex flex-wrap items-center gap-2">
                {row.name}
                {!row.isStudying ? (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Archived
                  </span>
                ) : null}
              </span>
            ),
          },
          { key: "email", label: "Email" },
          { key: "studentRollNumber", label: "Roll Number" },
          { key: "className", label: "Class" },
          {
            key: "isStudying",
            label: "Status",
            render: (row) => (row.isStudying ? "Active" : "Archived"),
          },
        ]}
        rows={filteredStudents}
        rowKey={(row) => row.id}
        emptyMessage="No students match your search or filter."
        actions={(row) => <StudentRowActions id={row.id} name={row.name} />}
      />
    </div>
  );
}
