import { StudentsList } from "@/components/admin/students-list";
import { getClasses } from "@/lib/classes.server";
import { requireRole } from "@/lib/require-role";
import { getStudents } from "@/lib/students.server";

export default async function AdminStudentsPage() {
  await requireRole("ADMIN");
  const [students, classes] = await Promise.all([getStudents(), getClasses()]);

  return <StudentsList students={students} classes={classes} />;
}
