import { EditTeacherForm } from "@/components/admin/edit-teacher-form";
import { BackLink } from "@/components/ui/back-link";
import { requireRole } from "@/lib/require-role";
import { getTeacherById } from "@/lib/teachers.server";

type EditTeacherPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  await requireRole("ADMIN");
  const { id } = await params;
  const teacher = await getTeacherById(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/admin">← Back to Admin Dashboard</BackLink>
      <EditTeacherForm teacher={teacher} />
    </div>
  );
}
