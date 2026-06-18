import Link from "next/link";
import { AddClassForm } from "@/components/admin/add-class-form";
import { requireRole } from "@/lib/require-role";
import { getTeachers } from "@/lib/teachers.server";

export default async function AddClassPage() {
  await requireRole("ADMIN");
  const teachers = await getTeachers();

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Admin Dashboard
      </Link>
      <AddClassForm teachers={teachers} />
    </div>
  );
}
