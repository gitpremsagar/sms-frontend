import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { ClassRowActions } from "@/components/admin/class-row-actions";
import { StudentRowActions } from "@/components/admin/student-row-actions";
import { TeacherRowActions } from "@/components/admin/teacher-row-actions";
import { requireRole } from "@/lib/require-role";
import { getClasses } from "@/lib/classes.server";
import { getTeachers } from "@/lib/teachers.server";
import { getStudents } from "@/lib/students.server";
import type { SchoolClass } from "@/lib/classes";
import type { Teacher } from "@/lib/teachers";
import type { Student } from "@/lib/students";

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const [teachers, classes, students] = await Promise.all([
    getTeachers(),
    getClasses(),
    getStudents(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Welcome back, {user.name}. Manage school operations from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center sm:text-left">
              <p className="text-2xl font-bold text-school-navy">{teachers.length}</p>
              <p className="text-xs text-muted-foreground">Teachers</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center sm:text-left">
              <p className="text-2xl font-bold text-school-navy">{classes.length}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center sm:text-left">
              <p className="text-2xl font-bold text-school-navy">{students.length}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <SectionHeader
          title="Classes"
          description={
            classes.length === 0
              ? "No classes yet."
              : `${classes.length} class${classes.length === 1 ? "" : "es"} registered.`
          }
          actions={
            <Button asChild size="sm">
              <Link href="/admin/class/add-class">Add Class</Link>
            </Button>
          }
        />
        <CardContent>
          {classes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Get started by adding your first class.
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
              ]}
              rows={classes}
              rowKey={(row) => row.id}
              actions={(row) => (
                <ClassRowActions id={row.id} className={row.className} />
              )}
            />
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
