"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { StudentRowActions } from "@/components/admin/student-row-actions";
import {
  classKindLabel,
  type ClassKind,
  type SchoolClass,
} from "@/lib/classes";
import type { Student } from "@/lib/students";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:max-w-xs";

type StatusFilter = "" | "active" | "archived";

type StudentsListProps = {
  students: Student[];
  classes: SchoolClass[];
};

const STUDENT_COLUMNS = [
  { key: "serialNumber", label: "S.No." },
  {
    key: "name",
    label: "Name",
    render: (row: Student) => (
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
  { key: "className", label: "Class" },
];

function StudentKindTable({
  title,
  students,
}: {
  title: string;
  students: Student[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">
        {title}{" "}
        <span className="font-normal text-muted-foreground">
          ({students.length})
        </span>
      </h3>
      <ResponsiveDataTable<Student>
        sortable
        columns={STUDENT_COLUMNS}
        rows={students}
        rowKey={(row) => row.id}
        emptyMessage={`No ${title.toLowerCase()} match your search or filter.`}
        actions={(row) => <StudentRowActions id={row.id} name={row.name} />}
      />
    </div>
  );
}

export function StudentsList({ students, classes }: StudentsListProps) {
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const classKindById = useMemo(() => {
    const map = new Map<string, ClassKind>();
    for (const schoolClass of classes) {
      map.set(schoolClass.id, schoolClass.kind);
    }
    return map;
  }, [classes]);

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

  const schoolStudents = useMemo(
    () =>
      filteredStudents.filter(
        (student) => classKindById.get(student.classId) === "SCHOOL",
      ),
    [filteredStudents, classKindById],
  );

  const coachingStudents = useMemo(
    () =>
      filteredStudents.filter(
        (student) => classKindById.get(student.classId) === "COACHING",
      ),
    [filteredStudents, classKindById],
  );

  const hasNonDefaultFilters =
    search.trim().length > 0 ||
    classId.length > 0 ||
    statusFilter !== "active";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full space-y-1 sm:w-56">
                <Label htmlFor="student-search">Search by Name</Label>
                <Input
                  id="student-search"
                  type="search"
                  placeholder="Search students..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="w-full space-y-1 sm:w-56">
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
                      {schoolClass.className} ({classKindLabel(schoolClass.kind)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full space-y-1 sm:w-44">
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

            <div className="flex flex-wrap items-end gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/student/attendance/take">Take Attendance</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/student/attendance/register">
                  Attendance Register
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/students/import">Import CSV</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/admin/student/add-student">Add Student</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {students.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Get started by adding your first student.
              </p>
              <Button asChild size="sm">
                <Link href="/admin/student/add-student">Add Student</Link>
              </Button>
            </div>
          ) : (
            <>
              {hasNonDefaultFilters ? (
                <p className="text-sm text-muted-foreground">
                  Showing {filteredStudents.length} of {students.length} student
                  {students.length === 1 ? "" : "s"}.
                </p>
              ) : null}

              <StudentKindTable title="School Students" students={schoolStudents} />
              <StudentKindTable
                title="Coaching Students"
                students={coachingStudents}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
