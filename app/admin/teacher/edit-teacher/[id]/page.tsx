import Link from "next/link";
import { EditTeacherForm } from "@/components/admin/edit-teacher-form";
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
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Admin Dashboard
      </Link>
      <EditTeacherForm teacher={teacher} />
    </div>
  );
}
