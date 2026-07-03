import { EditClassForm } from "@/components/admin/edit-class-form";
import { BackLink } from "@/components/ui/back-link";
import { getClassById } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";
import { getTeachers } from "@/lib/teachers.server";

type EditClassPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClassPage({ params }: EditClassPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;
  const [schoolClass, teachers] = await Promise.all([
    getClassById(id),
    getTeachers(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin">← Back to Admin Dashboard</BackLink>
      <EditClassForm schoolClass={schoolClass} teachers={teachers} />
    </div>
  );
}
