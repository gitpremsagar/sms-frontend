import { ImportStudentsForm } from "@/components/admin/import-students-form";
import { BackLink } from "@/components/ui/back-link";
import { requireRole } from "@/lib/require-role";

export default async function ImportStudentsPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackLink href="/admin/students">← Back to Students</BackLink>
      <ImportStudentsForm />
    </div>
  );
}
