import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { StudentsList } from "@/components/admin/students-list";
import { getClasses } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";
import { getStudents } from "@/lib/students.server";

export default async function AdminStudentsPage() {
  await requireRole("ADMIN");
  const [students, classes] = await Promise.all([getStudents(), getClasses()]);

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
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/students/import">Import CSV</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/student/add-student">Add Student</Link>
            </Button>
          </div>
        }
      />
      <CardContent>
        <StudentsList students={students} classes={classes} />
      </CardContent>
    </Card>
  );
}
