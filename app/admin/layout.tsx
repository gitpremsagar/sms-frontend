import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/require-role";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");

  return <PortalShell>{children}</PortalShell>;
}
