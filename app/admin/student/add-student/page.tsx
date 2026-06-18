import Link from "next/link";
import { AddStudentForm } from "@/components/admin/add-student-form";
import { getClasses } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";

export default async function AddStudentPage() {
  await requireRole("ADMIN");
  const classes = await getClasses();

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Admin Dashboard
      </Link>
      <AddStudentForm classes={classes} />
    </div>
  );
}
