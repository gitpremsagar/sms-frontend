import { AddClassForm } from "@/components/admin/add-class-form";
import { BackLink } from "@/components/ui/back-link";
import { requireRole } from "@/lib/require-role";
import { getTeachers } from "@/lib/teachers.server";

export default async function AddClassPage() {
  await requireRole("ADMIN");
  const teachers = await getTeachers();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin/classes">← Back to Classes</BackLink>
      <AddClassForm teachers={teachers} />
    </div>
  );
}
