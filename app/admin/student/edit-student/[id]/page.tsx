import Link from "next/link";
import { EditStudentForm } from "@/components/admin/edit-student-form";
import { getClasses } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";
import { getStudentById } from "@/lib/students.server";

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;
  const [student, classes] = await Promise.all([
    getStudentById(id),
    getClasses(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Admin Dashboard
      </Link>
      <EditStudentForm student={student} classes={classes} />
    </div>
  );
}
