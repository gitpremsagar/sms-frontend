import { AddStudentForm } from "@/components/admin/add-student-form";
import { BackLink } from "@/components/ui/back-link";
import { getClasses } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";

export default async function AddStudentPage() {
  await requireRole("ADMIN");
  const classes = await getClasses();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin/students">← Back to Students</BackLink>
      <AddStudentForm classes={classes} />
    </div>
  );
}
