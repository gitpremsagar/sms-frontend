import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { TeachersList } from "@/components/admin/teachers-list";
import { requireRole } from "@/lib/require-role";
import { getTeachers } from "@/lib/teachers.server";

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
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/teacher/salary">Salary Register</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/teacher/add-teacher">Add Teacher</Link>
            </Button>
          </>
        }
      />
      <CardContent>
        <TeachersList teachers={teachers} />
      </CardContent>
    </Card>
  );
}
