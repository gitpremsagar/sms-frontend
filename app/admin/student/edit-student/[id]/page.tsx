import { EditStudentForm } from "@/components/admin/edit-student-form";
import { BackLink } from "@/components/ui/back-link";
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
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin">← Back to Admin Dashboard</BackLink>
      <EditStudentForm student={student} classes={classes} />
    </div>
  );
}
