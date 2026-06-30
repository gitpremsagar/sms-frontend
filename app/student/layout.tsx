import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/require-role";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("STUDENT");

  return <PortalShell>{children}</PortalShell>;
}
