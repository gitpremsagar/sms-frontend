import Link from "next/link";
import { EditClassForm } from "@/components/admin/edit-class-form";
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
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Admin Dashboard
      </Link>
      <EditClassForm schoolClass={schoolClass} teachers={teachers} />
    </div>
  );
}
