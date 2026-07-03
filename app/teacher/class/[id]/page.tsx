import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackLink } from "@/components/ui/back-link";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { getTeacherClassById } from "@/lib/teacher.server";
import { requireRole } from "@/lib/require-role";
import type { TeacherClassStudent } from "@/lib/teacher";

type TeacherClassDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeacherClassDetailPage({
  params,
}: TeacherClassDetailPageProps) {
  await requireRole("TEACHER");
  const { id } = await params;
  const schoolClass = await getTeacherClassById(id);

  return (
    <div className="space-y-6">
      <BackLink href="/teacher/class">← Back to classes</BackLink>

      <Card>
        <CardHeader>
          <CardTitle>{schoolClass.className}</CardTitle>
          <CardDescription>
            {schoolClass.students.length === 0
              ? "No students in this class yet."
              : `${schoolClass.students.length} student${schoolClass.students.length === 1 ? "" : "s"} enrolled.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveDataTable<TeacherClassStudent>
            columns={[
              { key: "name", label: "Name" },
              { key: "studentRollNumber", label: "Roll No." },
              {
                key: "email",
                label: "Email",
                hideOnMobile: true,
                render: (row) => (
                  <Link
                    href={`mailto:${row.email}`}
                    className="text-school-navy hover:underline"
                  >
                    {row.email}
                  </Link>
                ),
              },
            ]}
            rows={schoolClass.students}
            rowKey={(row) => row.studentRollNumber}
            emptyMessage="No students in this class."
          />
        </CardContent>
      </Card>
    </div>
  );
}
