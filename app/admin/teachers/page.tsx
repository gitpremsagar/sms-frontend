import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { TeacherRowActions } from "@/components/admin/teacher-row-actions";
import { requireRole } from "@/lib/require-role";
import { getTeachers } from "@/lib/teachers.server";
import type { Teacher } from "@/lib/teachers";

export default async function AdminTeachersPage() {
  await requireRole("ADMIN");
  const teachers = await getTeachers();

  return (
    <Card>
      <SectionHeader
        title="Teachers"
        description={
          teachers.length === 0
            ? "No teachers yet."
            : `${teachers.length} teacher${teachers.length === 1 ? "" : "s"} registered.`
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/teacher/attendance">Attendance Register</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/teacher/add-teacher">Add Teacher</Link>
            </Button>
          </>
        }
      />
      <CardContent>
        {teachers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Get started by adding your first teacher.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/teacher/add-teacher">Add Teacher</Link>
            </Button>
          </div>
        ) : (
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
            ]}
            rows={teachers}
            rowKey={(row) => row.id}
            actions={(row) => (
              <TeacherRowActions id={row.id} name={row.name} />
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
