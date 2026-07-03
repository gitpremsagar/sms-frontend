import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { StudentRowActions } from "@/components/admin/student-row-actions";
import { requireRole } from "@/lib/require-role";
import { getStudents } from "@/lib/students.server";
import type { Student } from "@/lib/students";

export default async function AdminStudentsPage() {
  await requireRole("ADMIN");
  const students = await getStudents();

  return (
    <Card>
      <SectionHeader
        title="Students"
        description={
          students.length === 0
            ? "No students yet."
            : `${students.length} student${students.length === 1 ? "" : "s"} registered.`
        }
        actions={
          <Button asChild size="sm">
            <Link href="/admin/student/add-student">Add Student</Link>
          </Button>
        }
      />
      <CardContent>
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
          <ResponsiveDataTable<Student>
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "studentRollNumber", label: "Roll Number" },
              { key: "className", label: "Class" },
            ]}
            rows={students}
            rowKey={(row) => row.id}
            actions={(row) => (
              <StudentRowActions id={row.id} name={row.name} />
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
