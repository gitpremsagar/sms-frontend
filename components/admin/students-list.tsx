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

type StudentListRow = Student & {
  serialNumber: number;
};

type StudentsListProps = {
  students: Student[];
  classes: SchoolClass[];
};

export function StudentsList({ students, classes }: StudentsListProps) {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesClass = !classId || student.classId === classId;
      const matchesSearch =
        !normalizedSearch ||
        student.name.toLowerCase().includes(normalizedSearch);

      return matchesClass && matchesSearch;
    });
  }, [students, search, classId]);

  const rows: StudentListRow[] = useMemo(
    () =>
      filteredStudents.map((student, index) => ({
        ...student,
        serialNumber: index + 1,
      })),
    [filteredStudents],
  );

  const hasFilters = search.trim().length > 0 || classId.length > 0;

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
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      {hasFilters ? (
        <p className="text-sm text-muted-foreground">
          Showing {rows.length} of {students.length} student
          {students.length === 1 ? "" : "s"}.
        </p>
      ) : null}

      <ResponsiveDataTable<StudentListRow>
        columns={[
          { key: "serialNumber", label: "S.No." },
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "studentRollNumber", label: "Roll Number" },
          { key: "className", label: "Class" },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyMessage="No students match your search or filter."
        actions={(row) => <StudentRowActions id={row.id} name={row.name} />}
      />
    </div>
  );
}
