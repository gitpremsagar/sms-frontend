import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/require-role";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("TEACHER");

  return <PortalShell>{children}</PortalShell>;
}
