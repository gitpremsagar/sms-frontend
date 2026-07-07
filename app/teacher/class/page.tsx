import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { getTeacherClasses } from "@/lib/teacher.server";
import { requireRole } from "@/lib/require-role";
import type { TeacherClassSummary } from "@/lib/teacher";

export default async function TeacherClassPage() {
  await requireRole("TEACHER");
  const classes = await getTeacherClasses();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>
            Classes assigned to you. Select a class to view the student roster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveDataTable<TeacherClassSummary>
            columns={[
              { key: "className", label: "Class" },
              {
                key: "studentCount",
                label: "Students",
                render: (row) => String(row.studentCount),
              },
            ]}
            rows={classes}
            rowKey={(row) => row.id}
            actions={(row) => (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/teacher/class/${row.id}`}>View roster</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/teacher/class/${row.id}/attendance/take`}>
                    Take attendance
                  </Link>
                </Button>
              </div>
            )}
            emptyMessage="No classes assigned to you yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
