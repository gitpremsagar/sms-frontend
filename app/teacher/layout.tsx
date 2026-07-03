import { TeacherPortalShell } from "@/components/portal/teacher-portal-shell";
import { requireRole } from "@/lib/require-role";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("TEACHER");

  return <TeacherPortalShell>{children}</TeacherPortalShell>;
}
