import { AddTeacherForm } from "@/components/admin/add-teacher-form";
import { BackLink } from "@/components/ui/back-link";
import { requireRole } from "@/lib/require-role";

export default async function AddTeacherPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin">← Back to Admin Dashboard</BackLink>
      <AddTeacherForm />
    </div>
  );
}
