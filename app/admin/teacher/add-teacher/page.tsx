import Link from "next/link";
import { AddTeacherForm } from "@/components/admin/add-teacher-form";
import { requireRole } from "@/lib/require-role";

export default async function AddTeacherPage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Admin Dashboard
      </Link>
      <AddTeacherForm />
    </div>
  );
}
